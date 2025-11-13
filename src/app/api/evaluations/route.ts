import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { EvaluationService } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const evaluationService = new EvaluationService(prisma);
    const evaluations = await evaluationService.getAllEvaluationsWithScores();

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Get evaluations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
