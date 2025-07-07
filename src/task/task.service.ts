import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './schema/task.schema';
import { CreateTaskDto } from './dto/create-task.request';
import { UpdateTaskDto } from './dto/update-task.request';
import { ProjectService } from '../project/project.service';
import { UserService } from '../user/user.service';
import { ObjectId } from 'bson';

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task.name) private readonly taskModel: Model<Task>,
        private readonly projectService: ProjectService,
        private readonly userService: UserService,
    ) {}

    async create(createTaskDto: CreateTaskDto) {
        // Validate project exists and user has access
        const project = await this.projectService.getProjectById(createTaskDto.projectId, createTaskDto.userId);
        if (!project) {
            throw new NotFoundException('Project not found or access denied');
        }

        // Validate assignedTo user if provided
        if (createTaskDto.assignedTo) {
            const assignedUser = await this.userService.findOne({ _id: new ObjectId(createTaskDto.assignedTo) });
            if (!assignedUser) {
                throw new NotFoundException('Assigned user does not exist');
            }
        }

        const taskData = {
            ...createTaskDto,
            projectId: new ObjectId(createTaskDto.projectId),
            assignedTo: createTaskDto.assignedTo ? new ObjectId(createTaskDto.assignedTo) : undefined,
        };

        const task = await this.taskModel.create(taskData);

        // Add task to project's tasks array
        await this.projectService.addTaskToProject(createTaskDto.projectId, task._id.toString());

        return { status: true, message: 'Task created successfully', data: task };
    }

    async getTasksByProject(projectId: string, userId: string) {
        // Validate project exists and user has access
        const project = await this.projectService.getProjectById(projectId, userId);
        if (!project) {
            throw new NotFoundException('Project not found or access denied');
        }

        const tasks = await this.taskModel.find({ projectId: new ObjectId(projectId) });
        return { status: true, message: 'Tasks retrieved successfully', data: tasks };
    }

    async getTask(taskId: string, userId: string) {
        if (!ObjectId.isValid(taskId)) {
            throw new BadRequestException('Invalid task ID');
        }

        const task = await this.taskModel.findById(taskId);
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // Validate user has access to the project
        const project = await this.projectService.getProjectById(task.projectId.toString(), userId);
        if (!project) {
            throw new NotFoundException('Access denied to this task');
        }

        return { status: true, message: 'Task retrieved successfully', data: task };
    }

    async updateTask(taskId: string, updateTaskDto: UpdateTaskDto) {
        if (!ObjectId.isValid(taskId)) {
            throw new BadRequestException('Invalid task ID');
        }

        const task = await this.taskModel.findById(taskId);
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // Validate user has access to the project
        const project = await this.projectService.getProjectById(task.projectId.toString(), updateTaskDto.userId);
        if (!project) {
            throw new NotFoundException('Access denied to this task');
        }

        // Prepare update data
        const updateData: any = { ...updateTaskDto };
        
        // Validate assignedTo user if provided
        if (updateTaskDto.assignedTo) {
            const assignedUser = await this.userService.findOne({ _id: new ObjectId(updateTaskDto.assignedTo) });
            if (!assignedUser) {
                throw new NotFoundException('Assigned user does not exist');
            }
            updateData.assignedTo = new ObjectId(updateTaskDto.assignedTo);
        }

        const updatedTask = await this.taskModel.findByIdAndUpdate(
            taskId,
            { $set: updateData },
            { returnDocument: 'after' }
        );

        return { status: true, message: 'Task updated successfully', data: updatedTask };
    }

    async deleteTask(taskId: string, userId: string) {
        if (!ObjectId.isValid(taskId)) {
            throw new BadRequestException('Invalid task ID');
        }

        const task = await this.taskModel.findById(taskId);
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // Validate user has access to the project
        const project = await this.projectService.getProjectById(task.projectId.toString(), userId);
        if (!project) {
            throw new NotFoundException('Access denied to this task');
        }

        await this.taskModel.findByIdAndDelete(taskId);

        // Remove task from project's tasks array
        await this.projectService.removeTaskFromProject(task.projectId.toString(), taskId);

        return { status: true, message: 'Task deleted successfully', data: null };
    }
}
