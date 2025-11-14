import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { TimeOffService } from '@/services';
import { z } from 'zod';

const createTimeOffSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(1),
});

/**
 * @swagger
 * /api/timeoff:
 *   get:
 *     tags:
 *       - Time Off
 *     summary: Get time-off requests
 *     description: Retrieve time-off requests. Admins see all requests, employees see only their own.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Time-off requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimeOff'
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

    const timeOffService = new TimeOffService(prisma);
    const query = user.role === 'admin' ? {} : { userId: user.userId };
    const requests = await timeOffService.getTimeOffRequests(query);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get time-off requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/timeoff:
 *   post:
 *     tags:
 *       - Time Off
 *     summary: Create time-off request
 *     description: Submit a new time-off request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *               - reason
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-05T00:00:00Z"
 *               reason:
 *                 type: string
 *                 example: Family vacation
 *     responses:
 *       201:
 *         description: Time-off request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeOff'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createTimeOffSchema.parse(body);

    const timeOffService = new TimeOffService(prisma);
    const timeOffRequest = await timeOffService.createTimeOffRequest({
      ...data,
      userId: user.userId,
    });

    return NextResponse.json(timeOffRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
