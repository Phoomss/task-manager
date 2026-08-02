import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, GetTasksFilterDto } from './dto/task.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all tasks matching filters.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAll(@Query() filter: GetTasksFilterDto) {
    return this.taskService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by its ID' })
  @ApiParam({ name: 'id', description: 'UUID of the task to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the task details.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task details' })
  @ApiParam({ name: 'id', description: 'UUID of the task to update' })
  @ApiResponse({ status: 200, description: 'The task has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'UUID of the task to delete' })
  @ApiResponse({ status: 200, description: 'The task has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle completion status of a task' })
  @ApiParam({ name: 'id', description: 'UUID of the task status to toggle' })
  @ApiResponse({ status: 200, description: 'Task status toggled successfully.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  toggleStatus(@Param('id') id: string) {
    return this.taskService.toggleStatus(id);
  }
}
