import { Controller, Get, Param, Post, Delete, Query } from '@nestjs/common';
import {
  QueueMonitorService,
  QueueStatus,
  JobInfo,
} from './queue-monitor.service';

@Controller('admin/queues')
export class QueueMonitorController {
  constructor(private readonly queueMonitorService: QueueMonitorService) {}

  /**
   * Lấy status của tất cả queues
   */
  @Get('status')
  async getAllQueueStatus(): Promise<Record<string, QueueStatus>> {
    return this.queueMonitorService.getAllQueueStatus();
  }

  /**
   * Lấy danh sách jobs của một queue
   */
  @Get(':queueName/jobs')
  async getQueueJobs(
    @Param('queueName') queueName: string,
    @Query('status') status: string = 'waiting',
    @Query('start') start: number = 0,
    @Query('end') end: number = 100,
  ): Promise<JobInfo[]> {
    return this.queueMonitorService.getQueueJobs(queueName, status, start, end);
  }

  /**
   * Lấy thông tin chi tiết của một job
   */
  @Get(':queueName/jobs/:jobId')
  async getJobDetails(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ): Promise<JobInfo | null> {
    return this.queueMonitorService.getJobDetails(queueName, jobId);
  }

  /**
   * Retry một failed job
   */
  @Post(':queueName/jobs/:jobId/retry')
  async retryJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.queueMonitorService.retryJob(queueName, jobId);
    return {
      success,
      message: success ? 'Job retried successfully' : 'Failed to retry job',
    };
  }

  /**
   * Xóa một job
   */
  @Delete(':queueName/jobs/:jobId')
  async removeJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.queueMonitorService.removeJob(queueName, jobId);
    return {
      success,
      message: success ? 'Job removed successfully' : 'Failed to remove job',
    };
  }
}
