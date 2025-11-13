import { PrismaClient } from '@prisma/client';
import { ScoreDAO, EvaluationDAO } from '@/dao';
import type { EvaluationReport } from '@/types';

export class ReportService {
  private scoreDAO: ScoreDAO;
  private evaluationDAO: EvaluationDAO;

  constructor(prisma: PrismaClient) {
    this.scoreDAO = new ScoreDAO(prisma);
    this.evaluationDAO = new EvaluationDAO(prisma);
  }

  /**
   * Get evaluation reports with score distribution
   */
  async getEvaluationReports(): Promise<EvaluationReport[]> {
    const evaluations = await this.evaluationDAO.findAll();

    const reports = await Promise.all(
      evaluations.map(async (evaluation) => {
        const [scores, averageScore, distribution] = await Promise.all([
          this.scoreDAO.findByEvaluationId(evaluation.id),
          this.scoreDAO.getAverageByEvaluation(evaluation.id),
          this.scoreDAO.getDistribution(evaluation.id),
        ]);

        return {
          evaluationId: evaluation.id,
          evaluationName: evaluation.name,
          totalScores: scores.length,
          averageScore: Math.round(averageScore),
          distribution,
        };
      })
    );

    return reports;
  }

  /**
   * Get single evaluation report
   */
  async getEvaluationReport(evaluationId: string): Promise<EvaluationReport> {
    const evaluation = await this.evaluationDAO.findById(evaluationId);
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    const [scores, averageScore, distribution] = await Promise.all([
      this.scoreDAO.findByEvaluationId(evaluationId),
      this.scoreDAO.getAverageByEvaluation(evaluationId),
      this.scoreDAO.getDistribution(evaluationId),
    ]);

    return {
      evaluationId: evaluation.id,
      evaluationName: evaluation.name,
      totalScores: scores.length,
      averageScore: Math.round(averageScore),
      distribution,
    };
  }

  /**
   * Get top performers across all evaluations
   */
  async getTopPerformers(limit: number = 10) {
    const evaluations = await this.evaluationDAO.findAll();

    const performersMap = new Map<
      string,
      {
        user: any;
        totalScore: number;
        evaluationCount: number;
      }
    >();

    // Aggregate scores across all evaluations
    for (const evaluation of evaluations) {
      const scores = await this.scoreDAO.findByEvaluationId(evaluation.id);

      scores.forEach((score) => {
        const existing = performersMap.get(score.user.id);

        if (existing) {
          existing.totalScore += score.score;
          existing.evaluationCount += 1;
        } else {
          performersMap.set(score.user.id, {
            user: score.user,
            totalScore: score.score,
            evaluationCount: 1,
          });
        }
      });
    }

    // Calculate averages and sort
    const performers = Array.from(performersMap.values())
      .map((p) => ({
        ...p.user,
        averageScore: Math.round(p.totalScore / p.evaluationCount),
        evaluationCount: p.evaluationCount,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limit);

    return performers;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const evaluations = await this.evaluationDAO.findAll();

    let totalScores = 0;
    let totalAverage = 0;

    for (const evaluation of evaluations) {
      const scores = await this.scoreDAO.findByEvaluationId(evaluation.id);
      totalScores += scores.length;

      if (scores.length > 0) {
        const avg = await this.scoreDAO.getAverageByEvaluation(evaluation.id);
        totalAverage += avg;
      }
    }

    const overallAverage =
      evaluations.length > 0 ? totalAverage / evaluations.length : 0;

    return {
      totalEvaluations: evaluations.length,
      totalScores,
      overallAverage: Math.round(overallAverage),
    };
  }
}
