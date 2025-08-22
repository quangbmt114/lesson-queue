import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('message') private messageQueue: Queue,
  ) {}

  @Get()
  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkQueue(),
    ]);

    const results = checks.map((check, index) => {
      if (check.status === 'fulfilled') {
        return check.value;
      }
      return {
        service: ['database', 'redis', 'queue'][index],
        status: 'error',
        error: check.reason?.message || 'Unknown error',
      };
    });

    const allHealthy = results.every((result) => result.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: results,
    };
  }

  @Get('database')
  async checkDatabase() {
    try {
      const isHealthy = await this.prisma.healthCheck();
      return {
        service: 'database',
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: await this.measureResponseTime(() =>
          this.prisma.healthCheck(),
        ),
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'error',
        error: error.message,
      };
    }
  }

  @Get('redis')
  async checkRedis() {
    try {
      const startTime = Date.now();
      await this.messageQueue.client.ping();
      const responseTime = Date.now() - startTime;

      return {
        service: 'redis',
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      return {
        service: 'redis',
        status: 'error',
        error: error.message,
      };
    }
  }

  @Get('queue')
  async checkQueue() {
    try {
      const startTime = Date.now();
      const queueStats = await this.messageQueue.getJobCounts();
      const responseTime = Date.now() - startTime;

      return {
        service: 'queue',
        status: 'healthy',
        responseTime,
        stats: queueStats,
      };
    } catch (error) {
      return {
        service: 'redis',
        status: 'error',
        error: error.message,
      };
    }
  }

  private async measureResponseTime<T>(fn: () => Promise<T>): Promise<number> {
    const startTime = Date.now();
    await fn();
    return Date.now() - startTime;
  }
}
