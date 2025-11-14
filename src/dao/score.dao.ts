import { PrismaClient, Score } from '@prisma/client';
import { BaseDAO } from './base.dao';
import type { UpsertScoreDTO, ScoreDistribution } from '@/types';

export class ScoreDAO extends BaseDAO {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find score by user and evaluation
   */
  async findByUserAndEvaluation(
    userId: string,
    evaluationId: string
  ): Promise<Score | null> {
    return this.prisma.score.findFirst({
      where: {
        userId,
        evaluationId,
      },
    });
  }

  /**
   * Upsert score (create or update)
   */
  async upsert(data: UpsertScoreDTO) {
    const existing = await this.findByUserAndEvaluation(
      data.userId,
      data.evaluationId
    );

    if (existing) {
      return this.prisma.score.update({
        where: { id: existing.id },
        data: { score: data.score },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      });
    }

    return this.prisma.score.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  /**
   * Get scores by user ID
   */
  async findByUserId(userId: string) {
    return this.prisma.score.findMany({
      where: { userId },
      include: {
        evaluation: true,
      },
    });
  }

  /**
   * Get scores by evaluation ID
   */
  async findByEvaluationId(evaluationId: string) {
    return this.prisma.score.findMany({
      where: { evaluationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  /**
   * Calculate average score for an evaluation
   */
  async getAverageByEvaluation(evaluationId: string): Promise<number> {
    const result = await this.prisma.score.aggregate({
      where: { evaluationId },
      _avg: {
        score: true,
      },
    });

    return result._avg.score || 0;
  }

  /**
   * Get score distribution for an evaluation
   */
  async getDistribution(evaluationId: string): Promise<ScoreDistribution[]> {
    const scores = await this.prisma.score.findMany({
      where: { evaluationId },
      select: { score: true },
    });

    const total = scores.length;
    if (total === 0) {
      return [
        { range: '0-30', count: 0, percentage: 0 },
        { range: '31-50', count: 0, percentage: 0 },
        { range: '51-70', count: 0, percentage: 0 },
        { range: '71-100', count: 0, percentage: 0 },
      ];
    }

    const ranges = {
      '0-30': 0,
      '31-50': 0,
      '51-70': 0,
      '71-100': 0,
    };

    scores.forEach((s) => {
      if (s.score <= 30) ranges['0-30']++;
      else if (s.score <= 50) ranges['31-50']++;
      else if (s.score <= 70) ranges['51-70']++;
      else ranges['71-100']++;
    });

    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }

  /**
   * Get top performers
   */
  async getTopPerformers(evaluationId: string, limit: number = 5) {
    return this.prisma.score.findMany({
      where: { evaluationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            jobPosition: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      take: limit,
    });
  }
}
