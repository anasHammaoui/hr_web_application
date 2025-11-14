import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { DashboardService } from '@/services/dashboard.service';

/**
 * @swagger
 * /api/dashboard/activities:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get recent activities
 *     description: Retrieve recent activities based on user role. Admins see all activities, employees see their own.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   type:
 *                     type: string
 *                     example: course_enrollment
 *                   description:
 *                     type: string
 *                     example: Enrolled in Advanced JavaScript
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   userId:
 *                     type: string
 *                     format: uuid
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dashboardService = new DashboardService(prisma);
    const activities = await dashboardService.getRecentActivities(user.role, user.userId);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
