import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ trim: true })
    description: string;

    @Prop({ required: true })
    createdBy: Types.ObjectId;

    @Prop({ default: [], ref: 'User' })
    members: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'tasks' }], default: [] })
    tasks: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);