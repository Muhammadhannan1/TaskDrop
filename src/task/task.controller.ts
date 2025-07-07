import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.request';
import { UpdateTaskDto } from './dto/update-task.request';
import { JwtAuthGuard } from '../../utils/middlewares/jwt.auth.guard';

@ApiTags('Tasks')
@Controller('task')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: 'Task created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
        return await this.taskService.create(createTaskDto);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get all tasks for a project' })
    @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
    async getTasksByProject(@Param('projectId') projectId: string, @Request() req) {
        return await this.taskService.getTasksByProject(projectId, req.user_details._id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific task' })
    @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getTask(@Param('id') id: string, @Request() req) {
        return await this.taskService.getTask(id, req.user_details._id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a task' })
    @ApiResponse({ status: 200, description: 'Task updated successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
        return await this.taskService.updateTask(id, updateTaskDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task' })
    @ApiResponse({ status: 200, description: 'Task deleted successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async deleteTask(@Param('id') id: string, @Request() req) {
        return await this.taskService.deleteTask(id, req.user_details.userId);
    }
}
