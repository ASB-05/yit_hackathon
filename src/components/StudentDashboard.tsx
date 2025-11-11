import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Video,
  FileText,
  Calendar,
  MessageSquare,
  Brain,
  Target,
  Star,
  Zap,
} from 'lucide-react';
import '../App.css'; // 👈 keep your custom CSS

interface StudentDashboardProps {
  onEnrollCourse: (courseId: string) => void;
  onBack?: () => void; // 👈 optional back handler (works if passed from App)
}

export function StudentDashboard({ onEnrollCourse, onBack }: StudentDashboardProps) {
  const enrolledCourses = [
    {
      id: 'CS101',
      title: 'Introduction to Computer Science',
      instructor: 'Dr. James Miller',
      progress: 65,
      nextLesson: 'Week 3: Data Structures',
      dueAssignments: 2,
      thumbnail:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
      adaptiveLevel: 'intermediate',
      mastery: 78,
      timeSpent: 12.5,
    },
    {
      id: 'MATH201',
      title: 'Advanced Calculus',
      instructor: 'Prof. Sarah Chen',
      progress: 42,
      nextLesson: 'Week 2: Integration Techniques',
      dueAssignments: 1,
      thumbnail:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
      adaptiveLevel: 'challenging',
      mastery: 62,
      timeSpent: 8.3,
    },
    {
      id: 'PHYS301',
      title: 'Quantum Physics',
      instructor: 'Dr. Robert Brown',
      progress: 88,
      nextLesson: 'Week 5: Final Review',
      dueAssignments: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80',
      adaptiveLevel: 'mastered',
      mastery: 91,
      timeSpent: 22.1,
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'mastered':
        return 'bg-green-100 text-green-800';
      case 'challenging':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // ✅ Safe Back Handler
  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <div className="space-y-6 dashboard-bg">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Courses</CardTitle>
            <BookOpen className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1">3</div>
            <p className="text-xs text-indigo-100">65% avg completion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Study Time</CardTitle>
            <Clock className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1">42.9 hrs</div>
            <p className="text-xs text-purple-100">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Achievements</CardTitle>
            <Award className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1">12</div>
            <p className="text-xs text-pink-100">+3 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Mastery</CardTitle>
            <TrendingUp className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-white mb-1">77%</div>
            <p className="text-xs text-green-100">+5% improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Back Button on Every Tab */}
      <div className="flex justify-start mt-2">
        <Button
          variant="outline"
          className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          onClick={handleBack}
        >
          ← Back
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="course-card">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="course-thumbnail"
              />
              <div className="course-info">
                <div className="course-header">
                  <div>
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-instructor">{course.instructor}</p>
                  </div>
                  <Badge className={getLevelColor(course.adaptiveLevel)}>
                    {course.adaptiveLevel}
                  </Badge>
                </div>

                <div className="course-stats">
                  <p>Progress<br />{course.progress}%</p>
                  <p>Mastery Score<br />{course.mastery}%</p>
                  <p>Time Spent<br />{course.timeSpent}h</p>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-bar"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>

                <div className="course-footer">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4" /> {course.nextLesson}
                    </span>
                    {course.dueAssignments > 0 && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <FileText className="w-4 h-4" /> {course.dueAssignments} due
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-continue"
                    onClick={() => onEnrollCourse(course.id)}
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* The same Back button will always stay visible */}
      </Tabs>
    </div>
  );
}
