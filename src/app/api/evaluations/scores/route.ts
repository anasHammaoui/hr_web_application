import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { EvaluationService } from '@/services';
import { z } from 'zod';

const upsertScoreSchema = z.object({
  userId: z.string(),
  evaluationId: z.string(),
  score: z.number().min(0).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = upsertScoreSchema.parse(body);

    const evaluationService = new EvaluationService(prisma);
    const score = await evaluationService.upsertScore(data);

    return NextResponse.json(score, { status: 201 });
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
