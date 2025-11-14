import { PrismaClient } from '@prisma/client';
import { ActivityDAO } from '@/dao/activity.dao';
import { UserService } from './user.service';
import { TimeOffService } from './timeoff.service';
import { CourseService } from './course.service';
import { EvaluationService } from './evaluation.service';

interface Activity {
  id: string;
  type: 'timeoff' | 'enrollment' | 'score';
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  icon: 'calendar' | 'graduation-cap' | 'clipboard-list';
}

export class DashboardService {
  private activityDAO: ActivityDAO;
  private userService: UserService;
  private timeOffService: TimeOffService;
  private courseService: CourseService;
  private evaluationService: EvaluationService;

  constructor(prisma: PrismaClient) {
    this.activityDAO = new ActivityDAO(prisma);
    this.userService = new UserService(prisma);
    this.timeOffService = new TimeOffService(prisma);
    this.courseService = new CourseService(prisma);
    this.evaluationService = new EvaluationService(prisma);
  }

  async getDashboardStats(userRole: string, userId?: string) {
    const [
      userStats,
      timeOffStats,
      courseStats,
      evaluationStats
    ] = await Promise.all([
      this.userService.getUserStats(),
      this.timeOffService.getTimeOffStats(userRole === 'employee' ? userId : undefined),
      this.courseService.getCourseStats(),
      this.evaluationService.getEvaluationStats()
    ]);

    return {
      totalEmployees: userStats.employees,
      newEmployeesThisMonth: userStats.newThisMonth || 0,
      pendingTimeOffRequests: timeOffStats.pending,
      activeCourses: courseStats.total,
      enrolledEmployees: courseStats.enrolledUsers || 0,
      totalEvaluations: evaluationStats.total
    };
  }

  async getRecentActivities(userRole: string, userId: string, limit: number = 3): Promise<Activity[]> {
    const userFilter = userRole === 'employee' ? userId : undefined;

    const [timeOffRequests, enrollments, scores] = await Promise.all([
      this.activityDAO.findRecentTimeOffRequests(userFilter, limit),
      this.activityDAO.findRecentEnrollments(userFilter, limit),
      this.activityDAO.findRecentScores(userFilter, limit)
    ]);

    // Combine and format activities
    const activities: Activity[] = [
      ...timeOffRequests.map(req => ({
        id: req.id,
        type: 'timeoff' as const,
        title: `Time-off request ${req.status}`,
        description: userRole === 'admin' 
          ? `${req.user.name}'s request` 
          : `Your request was ${req.status}`,
        status: req.status,
        createdAt: req.createdAt,
        icon: 'calendar' as const
      })),
      ...enrollments.map(enr => ({
        id: enr.id,
        type: 'enrollment' as const,
        title: 'Course enrolled',
        description: userRole === 'admin' 
          ? `${enr.user.name} enrolled in ${enr.course.title}` 
          : `You enrolled in ${enr.course.title}`,
        status: 'success',
        createdAt: enr.enrolledAt,
        icon: 'graduation-cap' as const
      })),
      ...scores.map(score => ({
        id: score.id,
        type: 'score' as const,
        title: 'Evaluation score updated',
        description: userRole === 'admin' 
          ? `${score.user.name} scored ${score.score} in ${score.evaluation.name}` 
          : `You scored ${score.score} in ${score.evaluation.name}`,
        status: 'success',
        createdAt: score.createdAt,
        icon: 'clipboard-list' as const
      }))
    ];

    // Sort by date and limit
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
