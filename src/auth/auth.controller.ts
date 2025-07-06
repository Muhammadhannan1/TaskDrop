import {
  Body,
  Controller,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthApiRoutes } from './auth.routes';
import { AuthService } from './auth.service';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from './dto/signup.request';
import { UserLoginDTO } from './dto/login.request';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import { VerifyUserDTO } from './dto/verify.request';
import { AppleSignUpRequestDTO } from './dto/appleLogin.request';
import { GoogleSignUpRequestDTO } from './dto/googleLogin.request';

@Controller(AuthApiRoutes.Root)
@ApiTags('Auth Controller')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User Login Successful',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or Password is invalid',
  })
  @ApiOperation({ summary: 'Create new User Account' })
  @Post(AuthApiRoutes.SignUpUser)
  async signUpUser(@Body() user: CreateUserDTO) {
    return await this.authService.createUser(user);
  }

  // Verify Account
  @ApiResponse({ status: HttpStatus.OK, description: 'User verify Successful' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiOperation({ summary: 'Verify Account after signup' })
  @Patch(AuthApiRoutes.VerifyAccount)
  verifyAccount(@Body() payload: VerifyUserDTO) {
    return this.authService.verifyUser(payload);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'User Login Successful' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or Password is invalid',
  })
  @ApiOperation({ summary: 'Login to existing account.' })
  @Post(AuthApiRoutes.UserLogin)
  async loginUser(@Body() user: UserLoginDTO) {
    return await this.authService.loginUser(user);
  }

  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not validated',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout Successful' })
  @ApiOperation({ summary: 'Logout from the Account' })
  @Post(AuthApiRoutes.Logout)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request | any) {
    return await this.authService.logoutUser(req.user_details.email);
  }
}
