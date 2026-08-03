import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaService } from './prisma.service';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TerminusModule,
  ],
  controllers: [TaskController, HealthController],
  providers: [PrismaService, TaskService],
})
export class AppModule {}

