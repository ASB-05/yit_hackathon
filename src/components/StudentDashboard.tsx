import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  AlertCircle,
  Award,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Video,
  Zap,
} from 'lucide-react';
import '../App.css';
import { api, apiRequest } from '../lib/api';

interface StudentDashboardProps {
  onOpenCourse: (courseId: string) => void;
  onBack?: () => void;
}

interface CourseCardData {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  mastery: number;
  nextLesson: string;
  dueAssignments: number;
  adaptiveLevel: 'mastered' | 'intermediate' | 'learning';
  timeSpent: number;
  thumbnail: string;
}

const fallbackCourses: CourseCardData[] = [
  {
    id: 'sample-1',
      title: 'Introduction to Computer Science',
      instructor: 'Dr. James Miller',
      progress: 65,
    mastery: 78,
      nextLesson: 'Week 3: Data Structures',
      dueAssignments: 2,
      adaptiveLevel: 'intermediate',
      timeSpent: 12.5,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
  },
];

const thumbnails = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80',
];

const levelStyles: Record<CourseCardData['adaptiveLevel'], string> = {
  mastered: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  learning: 'bg-orange-100 text-orange-800',
};

type Recommendation = { lessonId?: string; title: string; type?: string };

export function StudentDashboard({ onOpenCourse, onBack }: StudentDashboardProps) {
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [recommended, setRecommended] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getMyCourses({ limit: 12 });
      const items: any[] = response?.data || [];
      if (!items.length) {
        setCourses(fallbackCourses);
        setRecommended([]);
        return;
      }

      const hydrated = await Promise.all(
        items.map(async (course, index) => {
          const courseId = course._id || course.id;
          const [progressRes, assignmentsRes, nextLessonRes] = await Promise.allSettled([
            apiRequest(`/api/courses/${courseId}/progress`),
            api.getAssignments(courseId, { limit: 10 }),
            api.getNextLesson(courseId),
          ]);

          const progressValue =
            progressRes.status === 'fulfilled'
              ? progressRes.value?.completionPercent ?? 0
              : 0;
          const timeSpentSeconds =
            progressRes.status === 'fulfilled'
              ? (progressRes.value?.lessons || []).reduce(
                  (sum: number, lesson: any) => sum + (lesson.timeSpentSeconds || 0),
                  0
                )
              : 0;

          const dueAssignments =
            assignmentsRes.status === 'fulfilled'
              ? (assignmentsRes.value?.data || []).filter((item: any) => {
                  if (!item?.dueAt) return false;
                  return new Date(item.dueAt).getTime() >= Date.now();
                }).length
              : 0;

          const nextLesson =
            nextLessonRes.status === 'fulfilled' && nextLessonRes.value?.lessonId
              ? nextLessonRes.value.title || 'Next lesson available'
              : 'Continue your learning path';

          const adaptiveLevel: CourseCardData['adaptiveLevel'] =
            progressValue >= 85 ? 'mastered' : progressValue >= 50 ? 'intermediate' : 'learning';

          return {
            id: courseId,
            title: course.title,
            instructor: course.instructor?.name || 'Instructor',
            progress: progressValue,
            mastery: course.settings?.masteryScore ?? Math.min(100, progressValue + 10),
            nextLesson,
            dueAssignments,
            adaptiveLevel,
            timeSpent: Number((timeSpentSeconds / 3600).toFixed(1)),
            thumbnail: thumbnails[index % thumbnails.length],
          } as CourseCardData;
        })
      );

      setCourses(hydrated);

      // fetch recommendations for the first course
      const firstCourseId = hydrated[0]?.id;
      if (firstCourseId) {
        try {
          const rec = await api.getRecommendations(firstCourseId);
          setRecommended(Array.isArray(rec) ? rec : []);
        } catch (recErr) {
          console.warn('Failed to fetch recommendations', recErr);
          setRecommended([]);
        }
      } else {
        setRecommended([]);
      }
    } catch (err: any) {
      setCourses(fallbackCourses);
      setError(err?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const stats = useMemo(() => {
    if (!courses.length) {
      return {
        activeCourses: 0,
        avgCompletion: 0,
        achievements: 0,
        mastery: 0,
        studyTime: 0,
      };
    }
    const activeCourses = courses.length;
    const avgCompletion = Math.round(
      courses.reduce((sum, c) => sum + c.progress, 0) / activeCourses
    );
    const mastery = Math.round(
      courses.reduce((sum, c) => sum + c.mastery, 0) / activeCourses
    );
    const studyTime = courses.reduce((sum, c) => sum + c.timeSpent, 0);
    return {
      activeCourses,
      avgCompletion,
      achievements: Math.max(1, Math.round(activeCourses * 3)),
      mastery,
      studyTime: Number(studyTime.toFixed(1)),
    };
  }, [courses]);

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <div className="space-y-6 dashboard-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
          <p className="text-sm text-gray-600">Continue where you left off and stay on track.</p>
        </div>
        <Button variant="ghost" onClick={fetchCourses} className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Courses</CardTitle>
            <BookOpen className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1 text-2xl font-semibold">{stats.activeCourses}</div>
            <p className="text-xs text-indigo-100">{stats.avgCompletion}% avg completion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Study Time</CardTitle>
            <Clock className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1 text-2xl font-semibold">{stats.studyTime} hrs</div>
            <p className="text-xs text-purple-100">Tracked across enrolled courses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Achievements</CardTitle>
            <Award className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1 text-2xl font-semibold">{stats.achievements}</div>
            <p className="text-xs text-pink-100">Badges & milestones unlocked</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Mastery</CardTitle>
            <TrendingUp className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1 text-2xl font-semibold">{stats.mastery}%</div>
            <p className="text-xs text-green-100">Keep building momentum</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start mt-2">
        <Button
          variant="outline"
          className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          onClick={handleBack}
        >
          ← Back
        </Button>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {loading ? (
            <Card className="course-card animate-pulse">
              <div className="course-thumbnail bg-gray-200" />
              <div className="course-info">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-6" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </Card>
          ) : (
            courses.map((course) => (
              <Card key={course.id} className="course-card">
                <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
              <div className="course-info">
                <div className="course-header">
                  <div>
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-instructor">{course.instructor}</p>
                  </div>
                    <Badge className={levelStyles[course.adaptiveLevel]}>
                    {course.adaptiveLevel}
                  </Badge>
                </div>

                <div className="course-stats">
                    <p>
                      Progress
                      <br />
                      {course.progress}%
                    </p>
                    <p>
                      Mastery Score
                      <br />
                      {course.mastery}%
                    </p>
                    <p>
                      Time Spent
                      <br />
                      {course.timeSpent}h
                    </p>
                </div>

                <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${course.progress}%` }} />
                </div>

                <div className="course-footer">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4" /> {course.nextLesson}
                    </span>
                    {course.dueAssignments > 0 && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <FileText className="w-4 h-4" /> {course.dueAssignments} due
                      </span>
                    )}
                  </div>
                    <Button onClick={() => onOpenCourse(course.id)}>Continue Learning</Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Adaptive Recommendations</CardTitle>
              <CardDescription>
                Suggested lessons and activities curated by the adaptive learning engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommended.length === 0 ? (
                <p className="text-sm text-gray-600">
                  You&apos;re all caught up! Complete more lessons to unlock additional suggestions.
                </p>
              ) : (
                recommended.map((item, idx) => (
                  <div
                    key={`${item.lessonId || idx}`}
                    className="p-3 border border-gray-200 rounded-lg flex items-center gap-3 hover:border-indigo-300 transition-colors"
                  >
                    <Badge variant="outline" className="capitalize">
                      {item.type || 'lesson'}
                    </Badge>
                    <span className="flex-1 text-sm text-gray-800">{item.title}</span>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Keep an eye on assignments, quizzes, and scheduled activities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.some((c) => c.dueAssignments > 0) ? (
                courses
                  .filter((c) => c.dueAssignments > 0)
                  .map((course) => (
                    <div
                      key={course.id}
                      className="p-3 border border-gray-200 rounded-lg flex items-center gap-3"
                    >
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {course.dueAssignments} upcoming task(s) in {course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Review course details for exact due dates.
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onOpenCourse(course.id)}>
                        Review
                      </Button>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-600">No upcoming deadlines found. Nice work!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Achievements & Engagement</CardTitle>
              <CardDescription>
                Highlights from your learning journey, including discussions and quick wins.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-500 mt-1" />
                <div>
                  <h4 className="text-sm text-gray-900">Consistency Streak</h4>
                  <p className="text-xs text-gray-600">
                    Keep learning daily to build knowledge retention.
                  </p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-indigo-500 mt-1" />
                <div>
                  <h4 className="text-sm text-gray-900">Community Engagement</h4>
                  <p className="text-xs text-gray-600">
                    Participate in discussions to unlock collaboration badges.
                  </p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <h4 className="text-sm text-gray-900">Adaptive Learning Tips</h4>
                  <p className="text-xs text-gray-600">
                    Complete recommended lessons to increase mastery faster.
                  </p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-3">
                <Zap className="w-5 h-5 text-pink-500 mt-1" />
                <div>
                  <h4 className="text-sm text-gray-900">Knowledge Boosters</h4>
                  <p className="text-xs text-gray-600">
                    Try microlearning modules for quick retention checks.
                  </p>
                </div>
              </div>
            </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
