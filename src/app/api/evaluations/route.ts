import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { EvaluationService } from '@/services';

/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     tags:
 *       - Evaluations
 *     summary: Get all evaluations
 *     description: Retrieve all evaluations with their scores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Evaluations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evaluation'
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

    const evaluationService = new EvaluationService(prisma);
    const evaluations = await evaluationService.getAllEvaluationsWithScores();

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Get evaluations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
