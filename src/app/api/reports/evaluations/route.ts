import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ReportService } from '@/services';

/**
 * @swagger
 * /api/reports/evaluations:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get evaluation reports
 *     description: Retrieve comprehensive evaluation reports (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Evaluation reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   employeeId:
 *                     type: string
 *                     format: uuid
 *                   employeeName:
 *                     type: string
 *                     example: John Doe
 *                   averageScore:
 *                     type: number
 *                     example: 87.5
 *                   totalEvaluations:
 *                     type: integer
 *                     example: 4
 *                   lastEvaluationDate:
 *                     type: string
 *                     format: date-time
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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportService = new ReportService(prisma);
    const reports = await reportService.getEvaluationReports();

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
