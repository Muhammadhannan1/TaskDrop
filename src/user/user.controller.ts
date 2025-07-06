import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import UserApiRoutes from './user.routes';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import { UserService } from './user.service';
import { ChangePasswordDTO } from './dto/changePassword.request';
import { ForgotPasswordDTO } from './dto/forgetPassword.request';
import { ResetPasswordDTO } from './dto/resetPassword.request';
import { VerifyOTPDTO } from './dto/verifyOTP.request';
import { ResendOTPDTO } from './dto/resendOTP.request';
import { UpdateProfileDTO } from './dto/updateProfile.request';

@Controller(UserApiRoutes.Root)
@ApiTags('User Controller')
export class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @ApiOperation({ summary: 'Change Account Password' })
  @Patch(UserApiRoutes.ChangePassword)
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() payload: ChangePasswordDTO) {
    return this.userService.changePassword(req.user_details._id, payload);
  }

  // Forgot Password
  @ApiResponse({ status: HttpStatus.OK, description: 'OTP sent Successful' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiOperation({ summary: 'Recover Forgotten Password' })
  @Patch(UserApiRoutes.ForgotPassword)
  forgotPassword(@Body() payload: ForgotPasswordDTO) {
    return this.userService.forgotPassword(payload);
  }

  // Reset Password
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password Reset Successful',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'OTP is incorrect',
  })
  @ApiOperation({ summary: 'Reset Account Password' })
  @Patch(UserApiRoutes.ResetPassword)
  resetPassword(@Body() payload: ResetPasswordDTO) {
    return this.userService.resetPassword(payload);
  }

  // Verify OTP
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proceed to Reset Password',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'OTP is incorrect',
  })
  @ApiOperation({ summary: 'Verify OTP' })
  @Post(UserApiRoutes.VerifyOTP)
  verifyOTP(@Body() payload: VerifyOTPDTO) {
    return this.userService.verifyOTP(payload);
  }

  // Resend OTP
  @ApiResponse({ status: HttpStatus.OK, description: 'OTP resent Successful' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiOperation({ summary: 'Resend OTP token' })
  @Post(UserApiRoutes.ResendOtp)
  resendOTP(@Body() payload: ResendOTPDTO) {
    return this.userService.resendOTP(payload);
  }

  // Update Profile
  @ApiResponse({ status: HttpStatus.OK, description: 'Update Successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Update Profile Information' })
  @Patch(UserApiRoutes.UpdateProfile)
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() payload: UpdateProfileDTO) {
    return this.userService.updateProfile(req.user_details._id, payload);
  }

    @ApiOperation({ summary: 'get me' })
    @Get(UserApiRoutes.GetMe)
  @UseGuards(JwtAuthGuard)
  getLoginUserDetail(@Req() req: any) {
    return this.userService.getMe(req.user_details.userId);
  }
}
