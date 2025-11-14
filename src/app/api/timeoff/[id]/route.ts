import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { TimeOffService } from '@/services';
import { z } from 'zod';

const reviewTimeOffSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = reviewTimeOffSchema.parse(body);

    const { id } = await params;
    const timeOffService = new TimeOffService(prisma);
    const updated = await timeOffService.reviewTimeOffRequest(
      id,
      user.userId,
      status
    );

    return NextResponse.json(updated);
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
