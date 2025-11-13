'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  enrollments: Array<{
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      profilePicture: string | null;
    };
  }>;
  _count: {
    enrollments: number;
  };
}

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      fetchCourses();
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    try {
      await api.delete(`/courses/${courseId}/enroll`);
      fetchCourses();
    } catch (error) {
      console.error('Failed to unenroll:', error);
    }
  };

  const isEnrolled = (course: Course) => {
    return course.enrollments.some((e) => e.user.id === user?.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">Browse and enroll in training courses</p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const enrolled = isEnrolled(course);
            return (
              <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                {course.imageUrl && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    {enrolled && <Badge variant="success">Enrolled</Badge>}
                  </div>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollments.length} enrolled</span>
                    </div>
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {enrolled ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUnenroll(course.id)}
                    >
                      Unenroll
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleEnroll(course.id)}>
                      Enroll Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No courses available</p>
            <p className="text-sm text-muted-foreground">Check back later for new courses</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
