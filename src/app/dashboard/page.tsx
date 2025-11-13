'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Users, Calendar, GraduationCap, ClipboardList, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/common';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalEmployees: number;
  newEmployeesThisMonth: number;
  pendingTimeOffRequests: number;
  activeCourses: number;
  enrolledEmployees: number;
  totalEvaluations: number;
}

interface Activity {
  id: string;
  type: 'timeoff' | 'enrollment' | 'score';
  title: string;
  description: string;
  status: string;
  createdAt: string;
  icon: 'calendar' | 'graduation-cap' | 'clipboard-list';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activities')
      ]);
      
      setStats(statsResponse.data);
      setActivities(activitiesResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'calendar':
        return Calendar;
      case 'graduation-cap':
        return GraduationCap;
      case 'clipboard-list':
        return ClipboardList;
      default:
        return Calendar;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (type === 'timeoff') {
      if (status === 'approved') return { bg: 'bg-green-100', text: 'text-green-600' };
      if (status === 'rejected') return { bg: 'bg-red-100', text: 'text-red-600' };
      return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
    }
    if (type === 'enrollment') return { bg: 'bg-blue-100', text: 'text-blue-600' };
    return { bg: 'bg-purple-100', text: 'text-purple-600' };
  };

  const statsConfig = stats ? [
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toString(),
      description: `${stats.newEmployeesThisMonth} new this month`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingTimeOffRequests.toString(),
      description: 'Time-off requests',
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Active Courses',
      value: stats.activeCourses.toString(),
      description: `${stats.enrolledEmployees} employees enrolled`,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Evaluations',
      value: stats.totalEvaluations.toString(),
      description: 'Categories tracked',
      icon: ClipboardList,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your HR system today.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              iconColor={stat.color}
              iconBgColor={stat.bgColor}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.role === 'admin' ? (
              <>
                <Link href="/dashboard/employees">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Employees
                  </Button>
                </Link>
                <Link href="/dashboard/courses">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Course
                  </Button>
                </Link>
                <Link href="/dashboard/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/timeoff">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Request Time Off
                  </Button>
                </Link>
                <Link href="/dashboard/courses">
                  <Button variant="outline" className="w-full justify-start">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Browse Courses
                  </Button>
                </Link>
                <Link href="/dashboard/evaluations">
                  <Button variant="outline" className="w-full justify-start">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    View My Evaluations
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="bg-gray-200 p-2 rounded-lg w-10 h-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.icon);
                  const colors = getActivityColor(activity.type, activity.status);
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`${colors.bg} p-2 rounded-lg`}>
                        <Icon className={`h-4 w-4 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activities
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
