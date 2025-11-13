import { PrismaClient } from '@prisma/client';
import { EvaluationDAO, ScoreDAO } from '@/dao';
import type {
  CreateEvaluationDTO,
  UpsertScoreDTO,
  EvaluationWithScores,
} from '@/types';

export class EvaluationService {
  private evaluationDAO: EvaluationDAO;
  private scoreDAO: ScoreDAO;

  constructor(prisma: PrismaClient) {
    this.evaluationDAO = new EvaluationDAO(prisma);
    this.scoreDAO = new ScoreDAO(prisma);
  }

  /**
   * Get all evaluations
   */
  async getAllEvaluations() {
    return this.evaluationDAO.findAll();
  }

  /**
   * Get all evaluations with scores
   */
  async getAllEvaluationsWithScores(): Promise<EvaluationWithScores[]> {
    return this.evaluationDAO.findAllWithScores() as Promise<EvaluationWithScores[]>;
  }

  /**
   * Get evaluation by ID
   */
  async getEvaluationById(id: string) {
    const evaluation = await this.evaluationDAO.findById(id);
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }
    return evaluation;
  }

  /**
   * Create new evaluation
   */
  async createEvaluation(data: CreateEvaluationDTO) {
    return this.evaluationDAO.create(data);
  }

  /**
   * Delete evaluation
   */
  async deleteEvaluation(id: string) {
    const existing = await this.evaluationDAO.findById(id);
    if (!existing) {
      throw new Error('Evaluation not found');
    }

    await this.evaluationDAO.delete(id);
    return { message: 'Evaluation deleted successfully' };
  }

  /**
   * Upsert score (create or update)
   */
  async upsertScore(data: UpsertScoreDTO) {
    // Validate score range
    if (data.score < 0 || data.score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    // Check if evaluation exists
    const evaluation = await this.evaluationDAO.findById(data.evaluationId);
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    return this.scoreDAO.upsert(data);
  }

  /**
   * Get user's scores
   */
  async getUserScores(userId: string) {
    return this.scoreDAO.findByUserId(userId);
  }

  /**
   * Get evaluation scores
   */
  async getEvaluationScores(evaluationId: string) {
    return this.scoreDAO.findByEvaluationId(evaluationId);
  }

  /**
   * Get top performers for an evaluation
   */
  async getTopPerformers(evaluationId: string, limit: number = 5) {
    return this.scoreDAO.getTopPerformers(evaluationId, limit);
  }

  /**
   * Get evaluation statistics
   */
  async getEvaluationStats() {
    const totalEvaluations = await this.evaluationDAO.count();

    return {
      total: totalEvaluations,
    };
  }
}
