import { PrismaClient } from '@prisma/client';
import { TimeOffDAO } from '@/dao';
import type {
  CreateTimeOffRequestDTO,
  UpdateTimeOffRequestDTO,
  TimeOffRequestQuery,
  TimeOffRequestWithUser,
} from '@/types';

export class TimeOffService {
  private timeOffDAO: TimeOffDAO;

  constructor(prisma: PrismaClient) {
    this.timeOffDAO = new TimeOffDAO(prisma);
  }

  /**
   * Get all time-off requests with filters
   */
  async getTimeOffRequests(
    query: TimeOffRequestQuery = {}
  ): Promise<TimeOffRequestWithUser[]> {
    return this.timeOffDAO.findMany(query);
  }

  /**
   * Get time-off request by ID
   */
  async getTimeOffRequestById(id: string) {
    const request = await this.timeOffDAO.findByIdWithUser(id);
    if (!request) {
      throw new Error('Time-off request not found');
    }
    return request;
  }

  /**
   * Create new time-off request
   */
  async createTimeOffRequest(data: CreateTimeOffRequestDTO) {
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      throw new Error('End date must be after start date');
    }

    return this.timeOffDAO.create(data);
  }

  /**
   * Review time-off request (approve/reject)
   */
  async reviewTimeOffRequest(
    id: string,
    reviewerId: string,
    status: 'approved' | 'rejected',
    adminNote?: string
  ) {
    // Check if request exists
    const existingRequest = await this.timeOffDAO.findById(id);
    if (!existingRequest) {
      throw new Error('Time-off request not found');
    }

    // Check if already reviewed
    if (existingRequest.status !== 'pending') {
      throw new Error('Request has already been reviewed');
    }

    const updateData: UpdateTimeOffRequestDTO = {
      status,
      adminNote: adminNote || `Reviewed by admin`,
    };

    return this.timeOffDAO.update(id, updateData);
  }

  /**
   * Delete time-off request
   */
  async deleteTimeOffRequest(id: string) {
    const existing = await this.timeOffDAO.findById(id);
    if (!existing) {
      throw new Error('Time-off request not found');
    }

    await this.timeOffDAO.delete(id);
    return { message: 'Time-off request deleted successfully' };
  }

  /**
   * Get user's time-off requests
   */
  async getUserTimeOffRequests(userId: string) {
    return this.timeOffDAO.findByUserId(userId);
  }

  /**
   * Get time-off statistics
   */
  async getTimeOffStats(userId?: string) {
    if (userId) {
      // Get stats for specific user
      const [pending, approved, rejected] = await Promise.all([
        this.timeOffDAO.countByUserAndStatus(userId, 'pending'),
        this.timeOffDAO.countByUserAndStatus(userId, 'approved'),
        this.timeOffDAO.countByUserAndStatus(userId, 'rejected'),
      ]);

      return {
        pending,
        approved,
        rejected,
        total: pending + approved + rejected,
      };
    }

    // Get global stats
    const pendingCount = await this.timeOffDAO.countPending();

    return {
      pending: pendingCount,
    };
  }

  /**
   * Export time-off requests to CSV format
   */
  async exportTimeOffRequestsToCSV() {
    const requests = await this.timeOffDAO.findAllForExport();
    
    // CSV headers
    const headers = ['ID', 'Employee Name', 'Employee Email', 'Start Date', 'End Date', 'Reason', 'Status', 'Admin Note', 'Created At'];
    
    // CSV rows
    const rows = requests.map((request: any) => [
      request.id,
      request.user.name,
      request.user.email,
      new Date(request.startDate).toISOString().split('T')[0],
      new Date(request.endDate).toISOString().split('T')[0],
      request.reason || '',
      request.status,
      request.adminNote || '',
      new Date(request.createdAt).toISOString().split('T')[0]
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
