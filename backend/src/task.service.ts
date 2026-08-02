import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTaskDto, UpdateTaskDto, GetTasksFilterDto } from './dto/task.dto';
import { Task, Status } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description, status, priority, dueDate } = createTaskDto;
    return this.prisma.task.create({
      data: {
        title,
        description,
        status: status ?? undefined,
        priority: priority ?? undefined,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
  }

  async findAll(filter: GetTasksFilterDto): Promise<Task[]> {
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = filter;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'dueDate') {
      orderBy.dueDate = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    return this.prisma.task.findMany({
      where,
      orderBy,
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id); // Throws NotFoundException if task doesn't exist

    const { title, description, status, priority, dueDate } = updateTaskDto;

    return this.prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate === null ? null : dueDate ? new Date(dueDate) : undefined,
      },
    });
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.findOne(id); // Throws NotFoundException if task doesn't exist

    await this.prisma.task.delete({
      where: { id },
    });

    return { success: true };
  }

  async toggleStatus(id: string): Promise<Task> {
    const task = await this.findOne(id);

    const newStatus = task.status === Status.pending ? Status.completed : Status.pending;

    return this.prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
      },
    });
  }
}
