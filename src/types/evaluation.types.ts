export interface Evaluation {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEvaluationDTO {
  name: string;
}

export interface Score {
  id: string;
  userId: string;
  evaluationId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScoreDTO {
  userId: string;
  evaluationId: string;
  score: number;
}

export interface UpsertScoreDTO {
  userId: string;
  evaluationId: string;
  score: number;
}

export interface EvaluationWithScores {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  scores: Array<{
    id: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    evaluationId: string;
    user: {
      id: string;
      name: string;
      email: string;
      profilePicture: string | null;
    };
  }>;
}

export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface EvaluationReport {
  evaluationId: string;
  evaluationName: string;
  totalScores: number;
  averageScore: number;
  distribution: ScoreDistribution[];
}
