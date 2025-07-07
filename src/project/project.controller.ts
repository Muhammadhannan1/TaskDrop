import { Controller, Post, Body, Get, Param, NotFoundException, UseGuards, Req, Patch, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.request';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import { UpdateProjectDto } from './dto/update-project.request';

@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreateProjectDto) {
        return this.projectService.create(dto);
    }

    @Get('/user/:userId')
    @UseGuards(JwtAuthGuard)
    async list(@Param('userId') userId: string) {
        return await this.projectService.list(userId);
    }

    @Get('/:projectId')
    @UseGuards(JwtAuthGuard)
    async getProject(@Param('projectId') projectId: string, @Req() req: any) {
        const project = await this.projectService.getProjectById(projectId, req.user_details.userId);
        if (!project) {
            throw new NotFoundException('Project not found');
        }
        return { status: true, message: 'Project retrieved successfully', data: project };
    }

    @Patch('/:projectId')
    @UseGuards(JwtAuthGuard)
    async update(@Req() req: any, @Body() payload: UpdateProjectDto, @Param('projectId') projectId: string) {
        return await this.projectService.update(req.user_details.userId, projectId, payload);
    }

    @Delete('/:projectId')
    @UseGuards(JwtAuthGuard)
    async delete(@Req() req: any, @Param('projectId') projectId: string) {
        return await this.projectService.delete(req.user_details.userId, projectId);
    }
}
