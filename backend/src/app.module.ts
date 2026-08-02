import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [TaskController],
  providers: [PrismaService, TaskService],
})
export class AppModule {}
