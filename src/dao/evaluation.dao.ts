import { PrismaClient, Evaluation } from '@prisma/client';
import { BaseDAO } from './base.dao';
import type { CreateEvaluationDTO } from '@/types';

export class EvaluationDAO extends BaseDAO {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find evaluation by ID
   */
  async findById(id: string): Promise<Evaluation | null> {
    return this.prisma.evaluation.findUnique({
      where: { id },
    });
  }

  /**
   * Get all evaluations
   */
  async findAll() {
    return this.prisma.evaluation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all evaluations with scores
   */
  async findAllWithScores() {
    return this.prisma.evaluation.findMany({
      include: {
        scores: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create new evaluation
   */
  async create(data: CreateEvaluationDTO): Promise<Evaluation> {
    return this.prisma.evaluation.create({
      data,
    });
  }

  /**
   * Delete evaluation
   */
  async delete(id: string): Promise<Evaluation> {
    return this.prisma.evaluation.delete({
      where: { id },
    });
  }

  /**
   * Count total evaluations
   */
  async count(): Promise<number> {
    return this.prisma.evaluation.count();
  }
}
