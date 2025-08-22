import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, Job } from 'bull';

export interface QueueStatus {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  totalJobs: number;
}

export interface JobInfo {
  id: string;
  name: string;
  data: any;
  progress: number;
  attemptsMade: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
}

@Injectable()
export class QueueMonitorService {
  private readonly logger = new Logger(QueueMonitorService.name);

  constructor(
    @InjectQueue('message') private messageQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  /**
   * Lấy status của tất cả queues
   */
  async getAllQueueStatus(): Promise<Record<string, QueueStatus>> {
    try {
      const [messageStatus, notificationStatus] = await Promise.all([
        this.getQueueStatus(this.messageQueue, 'message'),
        this.getQueueStatus(this.notificationQueue, 'notification'),
      ]);

      return {
        message: messageStatus,
        notification: notificationStatus,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get queue status:', error);
      throw error;
    }
  }

  /**
   * Lấy status của một queue cụ thể
   */
  private async getQueueStatus(
    queue: Queue,
    name: string,
  ): Promise<QueueStatus> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      name,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      totalJobs:
        waiting.length +
        active.length +
        completed.length +
        failed.length +
        delayed.length,
    };
  }

  /**
   * Lấy danh sách jobs của một queue
   */
  async getQueueJobs(
    queueName: string,
    status: string = 'waiting',
    start = 0,
    end = 100,
  ): Promise<JobInfo[]> {
    try {
      let queue: Queue;
      switch (queueName) {
        case 'message':
          queue = this.messageQueue;
          break;
        case 'notification':
          queue = this.notificationQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      let jobs: Job[];
      switch (status) {
        case 'waiting':
          jobs = await queue.getWaiting(start, end);
          break;
        case 'active':
          jobs = await queue.getActive(start, end);
          break;
        case 'completed':
          jobs = await queue.getCompleted(start, end);
          break;
        case 'failed':
          jobs = await queue.getFailed(start, end);
          break;
        case 'delayed':
          jobs = await queue.getDelayed(start, end);
          break;
        default:
          throw new Error(`Unknown status: ${status}`);
      }

      return jobs.map((job) => ({
        id: job.id.toString(),
        name: job.name,
        data: job.data,
        progress: job.progress(),
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
      }));
    } catch (error) {
      this.logger.error(`❌ Failed to get ${queueName} jobs:`, error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết của một job
   */
  async getJobDetails(
    queueName: string,
    jobId: string,
  ): Promise<JobInfo | null> {
    try {
      let queue: Queue;
      switch (queueName) {
        case 'message':
          queue = this.messageQueue;
          break;
        case 'notification':
          queue = this.notificationQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const job = await queue.getJob(jobId);
      if (!job) return null;

      return {
        id: job.id.toString(),
        name: job.name,
        data: job.data,
        progress: job.progress(),
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Retry một failed job
   */
  async retryJob(queueName: string, jobId: string): Promise<boolean> {
    try {
      let queue: Queue;
      switch (queueName) {
        case 'message':
          queue = this.messageQueue;
          break;
        case 'notification':
          queue = this.notificationQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const job = await queue.getJob(jobId);
      if (!job) return false;

      await job.retry();
      this.logger.log(`✅ Retried job ${jobId} in ${queueName} queue`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to retry job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Xóa một job
   */
  async removeJob(queueName: string, jobId: string): Promise<boolean> {
    try {
      let queue: Queue;
      switch (queueName) {
        case 'message':
          queue = this.messageQueue;
          break;
        case 'notification':
          queue = this.notificationQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const job = await queue.getJob(jobId);
      if (!job) return false;

      await job.remove();
      this.logger.log(`✅ Removed job ${jobId} from ${queueName} queue`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to remove job ${jobId}:`, error);
      throw error;
    }
  }
}
