export type TimeOffStatus = 'pending' | 'approved' | 'rejected';

export interface TimeOffRequest {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: TimeOffStatus;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTimeOffRequestDTO {
  userId: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string;
}

export interface UpdateTimeOffRequestDTO {
  status: TimeOffStatus;
  adminNote?: string;
}

export interface TimeOffRequestWithUser extends TimeOffRequest {
  user: {
    id: string;
    name: string;
    email: string;
    jobPosition: string | null;
    profilePicture: string | null;
  };
}

export interface TimeOffRequestQuery {
  userId?: string;
  status?: TimeOffStatus;
  startDate?: Date;
  endDate?: Date;
}
