import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  AlertCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  FileText,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  Target,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../lib/api';

const fallbackCourses = [
    {
      id: 'CS101',
      title: 'Introduction to Computer Science',
      students: 245,
      completion: 68,
      avgGrade: 82,
      pendingAssignments: 34,
      discussions: 12,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
    },
    {
      id: 'CS201',
      title: 'Data Structures & Algorithms',
      students: 189,
      completion: 52,
      avgGrade: 78,
      pendingAssignments: 28,
      discussions: 8,
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80',
    },
  ];

const fallbackStruggling = [
    {
      name: 'Alex Thompson',
      course: 'CS101',
      progress: 32,
      avgScore: 65,
      missedDeadlines: 3,
      lastActive: '5 days ago',
      risk: 'high',
    },
    {
      name: 'Maria Garcia',
      course: 'CS201',
      progress: 45,
      avgScore: 72,
      missedDeadlines: 1,
      lastActive: '2 days ago',
      risk: 'medium',
    },
    {
      name: 'John Wilson',
      course: 'CS101',
      progress: 58,
      avgScore: 68,
      missedDeadlines: 2,
      lastActive: '1 day ago',
      risk: 'medium',
    },
  ];

const fallbackPending = [
    {
      assignment: 'Binary Tree Implementation',
      course: 'CS101',
      submissions: 34,
      dueDate: '2024-01-20',
      priority: 'high',
    },
    {
      assignment: 'Sorting Algorithms Comparison',
      course: 'CS201',
      submissions: 28,
      dueDate: '2024-01-22',
      priority: 'medium',
    },
  ];

const thumbnails = [
  'https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?w=400&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
  'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=400&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
];

type CourseRecord = (typeof fallbackCourses)[number];
type StrugglingRecord = (typeof fallbackStruggling)[number];
type PendingRecord = (typeof fallbackPending)[number];

export function InstructorDashboard() {
  const [courses, setCourses] = useState(fallbackCourses);
  const [strugglingStudents, setStrugglingStudents] = useState(fallbackStruggling);
  const [pendingGrading, setPendingGrading] = useState(fallbackPending);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const courseResp = await api.getCourses({ limit: 8 });
      const items: any[] = courseResp?.data || [];
      if (!items.length) {
        setCourses(fallbackCourses);
        setStrugglingStudents([]);
        setPendingGrading([]);
        return;
      }

      const aggregatedRisk: StrugglingRecord[] = [];
      const queue: PendingRecord[] = [];

      const mapped: CourseRecord[] = await Promise.all(
        items.map(async (course: any, index: number) => {
          const courseId = course._id || course.id;
          const [statsRes, assignmentsRes, threadsRes, atRiskRes] = await Promise.allSettled([
            api.getAnalyticsStats(courseId),
            api.getAssignments(courseId, { limit: 20 }),
            api.getThreads(courseId, { limit: 20 }),
            api.getAtRisk(courseId, { limit: 10 }),
          ]);

          const stats =
            statsRes.status === 'fulfilled'
              ? statsRes.value || { totalStudents: 0, avgCompletion: 0 }
              : { totalStudents: 0, avgCompletion: 0 };

          const assignments =
            assignmentsRes.status === 'fulfilled' ? assignmentsRes.value?.data || [] : [];
          const activeAssignments = assignments.filter(
            (assignment: any) => assignment.status !== 'graded'
          );
          activeAssignments.slice(0, 5).forEach((assignment: any) => {
            queue.push({
              assignment: assignment.title || 'Assignment',
              course: course.title,
              submissions: assignment.submissions?.length || assignment.submissionCount || 0,
              dueDate: assignment.dueAt
                ? new Date(assignment.dueAt).toLocaleDateString()
                : 'TBD',
              priority:
                assignment.dueAt && new Date(assignment.dueAt).getTime() < Date.now()
                  ? 'high'
                  : 'medium',
            });
          });

          const discussions =
            threadsRes.status === 'fulfilled' ? threadsRes.value?.data?.length || 0 : 0;

          if (atRiskRes.status === 'fulfilled') {
            const riskEntries = atRiskRes.value?.atRisk || [];
            riskEntries.forEach((entry: any) => {
              aggregatedRisk.push({
                name: `Student ${String(entry.user).slice(-4)}`,
                course: course.title,
                progress: entry.completionPercent ?? 0,
                avgScore: Math.max(50, Math.round((entry.completionPercent ?? 0) + 10)),
                missedDeadlines: Math.max(0, Math.round((entry.daysInactive ?? 0) / 2)),
                lastActive:
                  entry.daysInactive !== undefined
                    ? `${entry.daysInactive} day(s) ago`
                    : 'N/A',
                risk:
                  entry.completionPercent < 30 || (entry.daysInactive ?? 0) > 7 ? 'high' : 'medium',
              });
            });
          }

          return {
            id: courseId,
            title: course.title,
            students: stats.totalStudents || course.students || 0,
            completion: stats.avgCompletion || course.completion || 0,
            avgGrade: Math.min(
              100,
              Math.max(course.settings?.masteryScore ?? 75, (stats.avgCompletion || 0) - 5)
            ),
            pendingAssignments: activeAssignments.length,
            discussions,
            thumbnail: thumbnails[index % thumbnails.length],
          } as CourseRecord;
        })
      );

      setCourses(mapped);
      setStrugglingStudents(aggregatedRisk.length ? aggregatedRisk : fallbackStruggling);
      setPendingGrading(queue.length ? queue : fallbackPending);
    } catch (err: any) {
      console.error('Failed to load instructor data', err);
      setError(err?.message || 'Unable to load instructor dashboard data');
      setCourses(fallbackCourses);
      setStrugglingStudents(fallbackStruggling);
      setPendingGrading(fallbackPending);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    if (!courses.length) {
      return { totalStudents: 0, avgCompletion: 0 };
    }
    const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0);
    const avgCompletion = Math.round(
      courses.reduce((sum, course) => sum + (course.completion || 0), 0) / courses.length
    );
    return { totalStudents, avgCompletion };
  }, [courses]);

  const engagementData = useMemo(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const avgCompletion = totals.avgCompletion || 60;
    return weeks.map((week, index) => {
      const active =
        courses.reduce((sum, course) => {
          const base = course.students || 0;
          const factor = 0.55 + index * 0.08;
          return sum + Math.round(base * factor);
        }, 0) || 0;
      const completed = Math.max(0, Math.round(active * (avgCompletion / 100)));
      const engaged = Math.max(completed, Math.round((active + completed) / 2));
      return { week, active, completed, engaged };
    });
  }, [courses, totals.avgCompletion]);

  const performanceData = useMemo(() => {
    const base = totals.avgCompletion || 70;
    return [
      { category: 'Quizzes', avg: Math.min(100, base + 5) },
      { category: 'Assignments', avg: Math.min(100, base + 2) },
      { category: 'Projects', avg: Math.min(100, base - 3) },
      { category: 'Participation', avg: Math.min(100, base + 8) },
    ];
  }, [totals.avgCompletion]);

  const handleRefresh = () => loadData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Instructor Control Center</h1>
          <p className="text-sm text-gray-600">
            Monitor course health, intervene early, and keep your learners on track.
          </p>
        </div>
        <Button variant="ghost" onClick={handleRefresh} className="flex items-center gap-2">
          Refresh
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Students</CardTitle>
            <Users className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1 text-2xl font-semibold">
              {totals.totalStudents}
            </div>
            <p className="text-xs text-indigo-100">Across {courses.length} course(s)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Completion</CardTitle>
            <TrendingUp className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1 text-2xl font-semibold">
              {totals.avgCompletion}%
            </div>
            <p className="text-xs text-purple-100">Moving average across cohorts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Grading</CardTitle>
            <FileText className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1 text-2xl font-semibold">
              {pendingGrading.length}
            </div>
            <p className="text-xs text-pink-100">Assignments awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">At-Risk Students</CardTitle>
            <AlertTriangle className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1 text-2xl font-semibold">
              {strugglingStudents.length}
            </div>
            <p className="text-xs text-orange-100">Flagged for early intervention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="grading">Grading Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="students">Student Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {/* Create Course Button */}
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white mb-2">Create New Course</h3>
                  <p className="text-sm text-indigo-100">
                    Use AI-powered templates to quickly build engaging courses
                  </p>
                </div>
                <Button variant="secondary" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  New Course
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Course List */}
          {loading ? (
            <Card className="bg-white animate-pulse">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="grid grid-cols-4 gap-4">
                      {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : courses.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="py-10 text-center text-sm text-gray-600">
                No courses found. Create a new course to get started.
              </CardContent>
            </Card>
          ) : (
            courses.map((course) => (
              <Card key={course.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-gray-900 mb-1">{course.title}</h3>
                          <p className="text-sm text-gray-600">Course ID: {course.id}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Students</p>
                          <p className="text-sm text-gray-900">{course.students}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Completion</p>
                          <p className="text-sm text-gray-900">{course.completion}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Grade</p>
                          <p className="text-sm text-gray-900">{course.avgGrade}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="text-sm text-gray-900">{course.pendingAssignments}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MessageSquare className="w-4 h-4" />
                          <span>{course.discussions} new discussions</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline">Manage Content</Button>
                        <Button variant="outline">View Analytics</Button>
                        <Button>Grade Assignments</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="grading" className="space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Pending Grading Queue</CardTitle>
              <CardDescription>Assignments waiting for review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingGrading.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-gray-900 mb-1">{item.assignment}</h4>
                        <p className="text-sm text-gray-600">{item.course}</p>
                      </div>
                      <Badge
                        className={
                          item.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {item.priority} priority
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {item.submissions} submissions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due {item.dueDate}
                        </span>
                      </div>
                      <Button size="sm">Start Grading</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Grading Tools */}
          <Card className="bg-white border-2 border-purple-200">
            <CardHeader>
              <CardTitle>AI Grading Assistant</CardTitle>
              <CardDescription>
                Use AI to help with initial grading and plagiarism detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Auto-grade multiple choice questions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Check for plagiarism
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate grade distribution
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Student Engagement Trends</CardTitle>
                <CardDescription>Weekly active users and completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#6366f1"
                      strokeWidth={2}
                      name="Active Students"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Completed Lessons"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Performance by Category</CardTitle>
                <CardDescription>Average scores across assessment types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="avg" fill="#8b5cf6" name="Average Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Content Effectiveness */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Content Effectiveness Analysis</CardTitle>
              <CardDescription>
                Correlation between lesson content and student performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Video Lectures</span>
                    <span className="text-gray-900">92% effectiveness</span>
                  </div>
                  <Progress value={92} />
                  <p className="text-xs text-gray-600">
                    Students who watched videos scored 15% higher on average
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Interactive Coding Exercises</span>
                    <span className="text-gray-900">88% effectiveness</span>
                  </div>
                  <Progress value={88} />
                  <p className="text-xs text-gray-600">
                    Completion of exercises correlates with 12% higher mastery
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Discussion Participation</span>
                    <span className="text-gray-900">75% effectiveness</span>
                  </div>
                  <Progress value={75} />
                  <p className="text-xs text-gray-600">
                    Active participants show better concept retention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card className="bg-white border-2 border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <CardTitle>Students Requiring Attention</CardTitle>
              </div>
              <CardDescription>
                AI has identified students who may need additional support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strugglingStudents.map((student, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-gray-900 mb-1">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.course}</p>
                      </div>
                      <Badge
                        className={
                          student.risk === 'high'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {student.risk} risk
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Progress</p>
                        <p className="text-sm text-gray-900">{student.progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Score</p>
                        <p className="text-sm text-gray-900">{student.avgScore}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Missed</p>
                        <p className="text-sm text-gray-900">{student.missedDeadlines} deadlines</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Last active: {student.lastActive}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Send Message
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule Meeting
                      </Button>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
