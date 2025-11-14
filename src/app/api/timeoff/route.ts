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
