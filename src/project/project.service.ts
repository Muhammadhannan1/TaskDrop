import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from './schema/project.schema';
import { CreateProjectDto } from './dto/create-project.request';
import { UserService } from 'src/user/user.service';
import { ObjectId } from 'bson';
import { UpdateProjectDto } from './dto/update-project.request';
import { addUserDto } from './dto/addUser.request';

@Injectable()
export class ProjectService {
    constructor(
        @InjectModel(Project.name) private readonly projectModel: Model<Project>,
        @Inject(forwardRef(() => UserService)) private userService: UserService,
    ) { }

    async create(payload: CreateProjectDto) {
        const memberObjectIds = [];
        for (const memberEmail of payload.members) {
            const memberExist = await this.userService.findOne({ email: memberEmail })
            if (!memberExist) {
                throw new NotFoundException(`Member with email ${memberEmail} does not exist`)
            }
            memberObjectIds.push(memberExist._id);
        }
        
        const projectData = {
            ...payload,
            createdBy: new ObjectId(payload.createdBy),
            members: memberObjectIds
        };
        
        const data = await this.projectModel.create(projectData);
        return { status: true, message: 'Project Created', data }
    }
    async list(userId: string) {
        if (!ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid userId')
        }

        const objectId = new ObjectId(userId);
        const projects = await this.projectModel.find({
            $or: [
                { members: objectId },
                { createdBy: objectId }
            ]
        }).populate('members');
        
        const projectsWithTasks = await Promise.all(
            projects.map(async (project) => {
                if (project.tasks && project.tasks.length > 0) {
                    const taskIds = project.tasks.map(taskId => new ObjectId(taskId));
                    const tasks = await this.projectModel.db.collection('tasks').find({
                        _id: { $in: taskIds }
                    }).toArray();
                    return {
                        ...project.toObject(),
                        tasks: tasks
                    };
                }
                return project.toObject();
            })
        );
        
        return { status: true, message: 'Project listing', data: projectsWithTasks };
    }


    async update(userId: string | ObjectId, projectId: string, payload: UpdateProjectDto) {
        if (!ObjectId.isValid(projectId)) {
            throw new BadRequestException('Invalid project ID');
        }

        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new NotFoundException('Project not found');
        }
        const ownerId = new ObjectId(project.createdBy);
        userId = new ObjectId(userId)
        if (!ownerId.equals(userId)) {
            throw new BadRequestException('Only owner of this project is able to edit');
        }
        
        // Convert member emails to ObjectIds if members are provided
        if (payload.members) {
            const memberObjectIds = [];
            for (const memberEmail of payload.members) {
                const member = await this.userService.findOne({ email: memberEmail });
                if (!member) {
                    throw new NotFoundException(`Member with email ${memberEmail} does not exist`);
                }
                memberObjectIds.push(member._id);
            }
            payload.members = memberObjectIds;
        }

        const data = await this.projectModel.findOneAndUpdate({ _id: projectId }, { $set: payload }, { returnDocument: 'after' });

        return { status: true, message: 'Project updated', data };
    }

    async delete(userId: string | ObjectId, projectId: string) {
        if (!ObjectId.isValid(projectId)) {
            throw new BadRequestException('Invalid projectId')
        }
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new NotFoundException('Project not found');
        }
        const ownerId = new ObjectId(project.createdBy);
        userId = new ObjectId(userId)
        if (!ownerId.equals(userId)) {
            throw new BadRequestException('Only owner of this project is able to edit');
        }
        await this.projectModel.findByIdAndDelete(projectId)
        return { status: true, message: 'Project deleted', data: null };
    }

    async getProjectById(projectId: string, userId: string) {
        if (!ObjectId.isValid(projectId)) {
            throw new BadRequestException('Invalid project ID');
        }
        const objectId = new ObjectId(userId);
        const project = await this.projectModel.findOne({
            _id: new ObjectId(projectId),
            $or: [
                { members: objectId },
                { createdBy: objectId }
            ]
        }).populate('members', 'name email _id');
        
        if (!project) {
            return null;
        }
        
        // Manually populate tasks
        if (project.tasks && project.tasks.length > 0) {
            const taskIds = project.tasks.map(taskId => new ObjectId(taskId));
            const tasks = await this.projectModel.db.collection('tasks').find({
                _id: { $in: taskIds }
            }).toArray();
            
            return {
                ...project.toObject(),
                tasks: tasks
            };
        }
        
        return project.toObject();
    }

    async addTaskToProject(projectId: string, taskId: string) {
        await this.projectModel.updateOne(
            { _id: new ObjectId(projectId) },
            { $addToSet: { tasks: new ObjectId(taskId) } }
        );
    }

    async removeTaskFromProject(projectId: string, taskId: string) {
        await this.projectModel.updateOne(
            { _id: new ObjectId(projectId) },
            { $pull: { tasks: new ObjectId(taskId) } }
        );
    }

    // async addUser(userId: string, payload: addUserDto) {
    //     const project = await this.projectModel.findById(payload.projectId);
    //     if (!project) {
    //         throw new NotFoundException('Project not found');
    //     }

    //     const userExist = await this.userService.findOne({ email: payload.email })
    //     if (!userExist) {
    //         throw new NotFoundException('User does not exist')
    //     }

    //     // Check if user is already a member (optional but safe)
    //     if (project.members.includes(userExist._id as Types.ObjectId)) {
    //         throw new ConflictException('User is already a member of the project');
    //     }

    //     // Add user to members array
    //     await this.projectModel.updateOne(
    //         { _id: payload.projectId },
    //         { $addToSet: { members: userExist._id } }
    //     );
    //     return { status: true, message: 'User added to project', data: null };
    // }
}
