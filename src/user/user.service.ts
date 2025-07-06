import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { MediaService } from 'src/media/media.service';
import { TokenService } from 'src/token/token.service';
import { Model } from 'mongoose';
import { OtpTypes } from 'utils/Enums/auth/otp';
import { ForgotPasswordDTO } from './dto/forgetPassword.request';
import { ResetPasswordDTO } from './dto/resetPassword.request';
import { VerifyOTPDTO } from './dto/verifyOTP.request';
import { compareSync, genSalt, hash } from 'bcrypt';
import { ObjectId } from 'mongodb';
import { ChangePasswordDTO } from './dto/changePassword.request';
import { ResendOTPDTO } from './dto/resendOTP.request';
import { UpdateProfileDTO } from './dto/updateProfile.request';

/**
 * @NOTE : These are all the basic implementation of all mandatory required functionalities
 * update or modify all the methods DTOs fields according to your requirement
 */

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(TokenService) private tokenService: TokenService,
    @Inject(MediaService) private mediaService: MediaService,
  ) {}

  async create(payload: any) {
    return await this.userModel.create(payload);
  }
  async getMe(userId:string){
      if(!ObjectId.isValid(userId)){
        throw new BadRequestException('Invalid userId')
      }

      const findUser = await this.userModel.findById(userId);
      if(!findUser){throw new NotFoundException('User not found')};
      delete findUser.password
      return {status:true,message:'Details found',data:findUser}
  }

  async updateProfile(userId: ObjectId | string, payload: UpdateProfileDTO) {
    const user = await this.userModel.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new NotFoundException('No Customer exists with this Id');
    }
    const userUpdatePayload: any = {
      _id: user._id,
      email: user.email,
      verified: user.verified,
      password: user.password,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: new Date(),
      name: payload.name ? payload.name : user.name,
    };
    if (payload.profileId) {
      let profileMedia = await this.mediaService.findById(
        new ObjectId(payload.profileId),
      );
      if (!profileMedia) {
        throw new NotFoundException('Profile ID not found');
      }
      userUpdatePayload.profilePic = profileMedia.path;
    }

    const updatedProfile = await this.userModel
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: userUpdatePayload },
        { returnDocument: 'after' },
      )
      .exec();
    // console.log(updatedProfile)
    delete updatedProfile.password;
    return {
      status: true,
      message: 'Profile Updated Successfully',
      responseData: updatedProfile,
    };
  }

  async changePassword(userId: ObjectId | string, payload: ChangePasswordDTO) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('No user found!');
    }
    if (!compareSync(payload.oldPassword, user.password)) {
      throw new BadRequestException('Old Password is incorrect');
    }

    const salt = await genSalt(12);
    const password = await hash(payload.password, salt);

    const doc = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { password } },
      { returnDocument: 'after' },
    );

    return {
      status: true,
      message: 'Password Updated Successfully',
      responseData: doc,
    };
  }

  async forgotPassword(payload: ForgotPasswordDTO) {
    const user = await this.userModel.findOne({ email: payload.email });
    if (!user) {
      throw new NotFoundException('User with this email does not exists');
    }

    const token = await this.tokenService.generateToken(
      user.email,
      OtpTypes.FORGOT_PASSWORD,
    ); // 86400 ---> 1 day, 604800 ---> 1 week
    // await sendEmail({
    //   to: payload.email,
    //   subject: 'Forgot Password OTP',
    //   text: `Your Forgot Password OTP is ${token}`,
    // });
    return { status: true, message: 'Token send to your email', token };
  }

  async verifyOTP(payload: VerifyOTPDTO) {
    const user = await this.userModel.findOne({ email: payload.email });
    if (!user) {
      throw new NotFoundException('User with this email does not exists');
    }

    const cachedToken = await this.tokenService.validateToken(
      payload.email,
      OtpTypes.FORGOT_PASSWORD,
    );

    if (payload.token !== JSON.parse(cachedToken)) {
      throw new BadRequestException('OTP is incorrect!');
    }
    return { status: true, message: 'Proceed to Reset Password' };
  }

  async resetPassword(payload: ResetPasswordDTO) {
    const cachedToken = await this.tokenService.validateToken(
      payload.email,
      OtpTypes.FORGOT_PASSWORD,
    );
    if (payload.token !== JSON.parse(cachedToken)) {
      throw new BadRequestException('OTP is incorrect!');
    }
    const salt = await genSalt(12);
    const password = await hash(payload.password, salt);

    await this.userModel.findOneAndUpdate(
      { email: payload.email },
      { $set: { password } },
      { returnDocument: 'after' },
    );

    this.tokenService.deleteToken(payload.email, OtpTypes.FORGOT_PASSWORD);

    return { status: true, message: 'Password Reset Succesful' };
  }

  async resendOTP(payload: ResendOTPDTO) {
    // Temp --> remove token from response body
    const token = await this.tokenService.generateToken(
      payload.email,
      payload.type,
    );
    let text: string;
    let subject: string;
    if (payload.type === OtpTypes.FORGOT_PASSWORD) {
      text = `Your Forgot Password OTP is ${token}`;
      subject = `'Forgot Password OTP'`;
    } else if (payload.type === OtpTypes.VERIFY_ACCOUNT) {
      text = `Your account verification code is ${token}`;
      subject = `Account verification code`;
    }
    // await sendEmail({ to: payload.email, subject, text });
    return { status: true, message: 'Token resent successfully', token };
  }

  async findOneAndUpdate(query: any, update: any) {
    return await this.userModel.findOneAndUpdate(query, update, {
      returnDocument: 'after',
    });
  }
  async findOne(filter: any): Promise<UserDocument> {
    return await this.userModel.findOne(filter).exec();
  }
}
