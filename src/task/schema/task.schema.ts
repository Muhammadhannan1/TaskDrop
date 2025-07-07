import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ enum: ['Low', 'Medium', 'High'], default: 'Medium' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedTo: Types.ObjectId;

  @Prop({ enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' })
  status: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);