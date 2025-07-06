import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
        @Inject(UserService) private userService: UserService,
    ) { }

    async create(payload: CreateProjectDto) {

        for (const memberId of payload.members) {
            const memberExist = await this.userService.findOne({ _id: new ObjectId(memberId) })
            if (!memberExist) {
                throw new NotFoundException('Member does not exist')
            }
        }
        const data = await this.projectModel.create(payload);
        return { status: true, message: 'Project Created', data }
    }
    async list(userId: string) {
        if (!ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid userId')
        }
        const data = await this.projectModel.find({
            $or: [
                { members: userId },
                { createdBy: userId }
            ]
        });
        return { status: true, message: 'Project listing', data };
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
        if (payload.members) {
            for (const memberId of payload.members) {
                const member = await this.userService.findOne({ _id: new ObjectId(memberId) });
                if (!member) {
                    throw new NotFoundException(`Member with ID ${memberId} does not exist`);
                }
            }
        }
        console.log(payload)
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
