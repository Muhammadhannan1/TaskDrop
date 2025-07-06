import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { RedisCoreService } from "src/redis-core/redis-core.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        // private readonly redisService: RedisCoreService
    ) {
    }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        const token = this.getTokenFromHeaders(request.headers);

        if (!token) throw new UnauthorizedException('Invalid token');

        const decodedToken = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });

        request.token = token;

        // const cacheKey = `${process.env.USER_CACHE_KEY}${decodedToken.email}:${token}`;
        // const cacheKey = `${process.env.USER_CACHE_KEY}${decodedToken.email}:authToken`;

        // let user = await this.redisService.get(cacheKey);

        // if (!user) throw new UnauthorizedException('Invalid Token');

        // user = JSON.parse(user);
        request.user_details = Object.assign({}, decodedToken);

        return true;
    }

    private getTokenFromHeaders(headers: any): string {
        if (headers && headers.authorization) {
            const authHeader = headers.authorization;

            const [bearer, token] = authHeader.split(' ');

            if (bearer === 'Bearer' && token) {
                return token;
            }
        }
        return null;
    }
}
