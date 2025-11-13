'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Mail, Briefcase, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  jobPosition: string;
  birthday: string;
  dateHired: string;
  profilePicture?: string;
  scores: Array<{
    id: string;
    score: number;
    evaluation: {
      id: string;
      name: string;
    };
  }>;
  enrollments: Array<{
    id: string;
    course: {
      id: string;
      title: string;
    };
  }>;
  timeOffRequests: Array<{
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
  }>;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${params.id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Employee Details</h1>
          <p className="text-muted-foreground">View employee information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.jobPosition || 'No position'}</p>
              </div>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                {user.role}
              </Badge>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{user.jobPosition || 'No position'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Hired: {user.dateHired ? formatDate(user.dateHired) : 'N/A'}</span>
              </div>
              {user.birthday && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Birthday: {formatDate(user.birthday)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evaluation Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {user.scores.length > 0 ? (
                <div className="space-y-3">
                  {user.scores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{score.evaluation.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${score.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">{score.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No evaluation scores yet</p>
              )}
            </CardContent>
          </Card>

          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {user.enrollments.length > 0 ? (
                <div className="space-y-2">
                  {user.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{enrollment.course.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not enrolled in any courses</p>
              )}
            </CardContent>
          </Card>

          {/* Time Off History */}
          <Card>
            <CardHeader>
              <CardTitle>Time Off Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {user.timeOffRequests.length > 0 ? (
                <div className="space-y-3">
                  {user.timeOffRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                        <Badge
                          variant={
                            request.status === 'approved'
                              ? 'success'
                              : request.status === 'rejected'
                              ? 'destructive'
                              : 'warning'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No time-off requests</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
