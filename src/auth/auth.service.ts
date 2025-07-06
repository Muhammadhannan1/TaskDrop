import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { compareSync, genSalt, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// import { RedisCoreService } from 'src/redis-core/redis-core.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDTO } from './dto/signup.request';
import { UserLoginDTO } from './dto/login.request';
import { VerifyUserDTO } from './dto/verify.request';
import { OtpTypes } from 'utils/Enums/auth/otp';
import OAuthService from 'src/oauth/oauth.service';
import { UserType } from 'utils/Enums/user/types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserService) private userService: UserService,
    @Inject(JwtService) private jwtService: JwtService,
    // @Inject(RedisCoreService) private redisService: RedisCoreService,
    @Inject(TokenService) private tokenService: TokenService,
    @Inject(OAuthService) private oAuthService: OAuthService,
  ) {}

  async createUser(payload: CreateUserDTO) {
    const emailExist = await this.userService.findOne({email:payload.email})
    if(emailExist){throw new BadRequestException('Email already exist')}

    
    const salt = await genSalt(10);

    const hashedPassword = await hash(payload.password, salt);
    const user = await this.userService.create({
      ...payload,
      password: hashedPassword,
    });
    return await this.caching(user, process.env.USER_CACHE_KEY, user.email);

    // return {status:true,message:'Signup successfully',data:}

  }

  async verifyUser(payload: VerifyUserDTO) {
    const cachedToken = await this.tokenService.validateToken(
      payload.email,
      OtpTypes.VERIFY_ACCOUNT,
    );

    if (payload.token !== JSON.parse(cachedToken)) {
      throw new BadRequestException('OTP is incorrect!');
    }

    const user: any = await this.userService.findOneAndUpdate(
      { email: payload.email },
      { $set: { verified: true } },
    );

    this.tokenService.deleteToken(payload.email, OtpTypes.VERIFY_ACCOUNT);
    const accessToken = await this.caching(
      user,
      process.env.USER_CACHE_KEY,
      user.email,
    );
    // user.accessToken = accessToken.data
    return {
      status: true,
      message: 'Success',
      data: { ...user.toObject(), accessToken: accessToken.data.accessToken },
    };
  }

  async loginUser(payload: UserLoginDTO) {
    // const user = await this.userService.findOne({email:payload.email});
    // const user = await this.userService.findOne({ email: {$regex : new RegExp(payload.email, "i") } });
    const user = await this.userService.findOne({
      email: { $regex: new RegExp('^' + payload.email + '$', 'i') },
    });
    if (!user) {
      throw new BadRequestException('User does not exists');
    }
    if (!compareSync(payload.password, user.password)) {
      throw new BadRequestException('Email or password is incorrect');
    }
    if (!user.verified) {
      throw new BadRequestException('User Not Verified');
    }
    let temp: any = { ...user };

    temp = { ...temp._doc };

    delete temp.password;
    delete temp.password;

    return await this.caching(user, process.env.USER_CACHE_KEY, user.email);
  }

  async logoutUser(userEmail: string) {
    // const cacheKey = `${process.env.USER_CACHE_KEY}${userEmail}:${authToken}`;
    const cacheKey = `${process.env.USER_CACHE_KEY}${userEmail}:authToken`;
    // await this.redisService.del(cacheKey);
    return { status: true, message: 'Logout Successfuly' };
  }

  private generateToken(payload: any) {
    // return this.jwtService.sign({ email: payload.email });
    return this.jwtService.sign({
      email: payload.email,
      userId: payload._id,
      userType: payload.type,
      verified: payload.verified,
    });
  }

  private async caching(doc: any, envVariable: any, email: any) {
    const token = this.generateToken(doc);
    //Saving token inside cache
    // const cacheKey = `${envVariable}${email}:${token}`;
    // const cacheKey = `${envVariable}${email}:authToken`;
    // await this.redisService.set(cacheKey, doc, 'EX', 604800); // 86400 ---> 1 day, 604800 ---> 1 week
    let data: any = { accessToken: token };
    return {
      status: true,
      message: 'Success',
      data,
    };
  }
}
