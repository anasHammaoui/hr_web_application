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

/**
 * @swagger
 * /api/evaluations/scores:
 *   post:
 *     tags:
 *       - Evaluations
 *     summary: Create or update evaluation score
 *     description: Create or update a score for a user's evaluation (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - evaluationId
 *               - score
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               evaluationId:
 *                 type: string
 *                 format: uuid
 *                 example: "223e4567-e89b-12d3-a456-426614174000"
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 85
 *     responses:
 *       201:
 *         description: Score created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 evaluationId:
 *                   type: string
 *                   format: uuid
 *                 score:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
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
