import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from './prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health check
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch (error) {
          return { database: { status: 'down', message: error.message } };
        }
      },
      // Heap memory check (limit to 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}
