import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisCoreService } from 'src/redis-core/redis-core.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    // private readonly redisService: RedisCoreService,
  ) {}

  async generateToken(email: string, type: string) {
    const token = this.generateOTP();
    const key = `${process.env.OTP_CACHE_KEY}${email}:${type}`;
    // await this.redisService.set(key, token, 'EX', 3600); // for now commenting this will comment below one in future
    // await this.redisService.set(key, 1111, 'EX', 3600);

    return token;
  }

  async validateToken(email: string, type: string) {
    const key = `${process.env.OTP_CACHE_KEY}${email}:${type}`;
    // let cachedOTP = await this.redisService.get(key);

    return JSON.stringify(9999);
  }

  async deleteToken(email: string, type: string) {
    const key = `${process.env.OTP_CACHE_KEY}${email}:${type}`;
    // await this.redisService.del(key);
  }

  private generateOTP() {
    let token: string;
    if (process.env.DEBUG === 'true') {
      token = '0000';
    } else {
      token = Math.floor(Math.random() * 9000 + 1000).toString(); // 4 digits
    }
    return token;
  }
}
