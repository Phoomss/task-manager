import { IsEnum, IsOptional, IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { Status, Priority } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement Backend API', description: 'The title of the task' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Create endpoints for tasks module', description: 'The description of the task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: Status, default: Status.pending, description: 'The status of the task' })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ enum: Priority, default: Priority.medium, description: 'The priority level of the task' })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z', description: 'The due date of the task' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Update Task Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ enum: Priority })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class GetTasksFilterDto {
  @ApiPropertyOptional({ enum: Status, description: 'Filter tasks by status' })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ description: 'Search query for title or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort by field (createdAt, dueDate)' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'desc', description: 'Sort order (asc, desc)' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
