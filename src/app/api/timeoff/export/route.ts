import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { TimeOffService } from '@/services';

/**
 * @swagger
 * /api/timeoff/export:
 *   get:
 *     tags:
 *       - Time Off
 *     summary: Export time-off requests to CSV
 *     description: Export all time-off requests to CSV format (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file with time-off requests data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
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

    const timeOffService = new TimeOffService(prisma);
    const csvContent = await timeOffService.exportTimeOffRequestsToCSV();

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="timeoff-requests-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export time-off requests' }, { status: 500 });
  }
}
