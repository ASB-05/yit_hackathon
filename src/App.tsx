import { useState } from "react";
import { StudentDashboard } from './components/StudentDashboard';
import { InstructorDashboard } from './components/InstructorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CourseViewer } from './components/CourseViewer';
import Login from './components/login';
import './App.css';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { role, isAuthenticated } = useAuth();
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  if (!isAuthenticated || !role) {
    return <Login />;
  }

  if (activeCourse && role === 'student') {
    return <CourseViewer courseId={activeCourse} onBack={() => setActiveCourse(null)} />;
  }

  if (role === 'student') {
    return <StudentDashboard onOpenCourse={setActiveCourse} />;
  }

  if (role === 'instructor') {
    return <InstructorDashboard />;
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  return null;
}
