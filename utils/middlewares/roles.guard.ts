import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './../roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) {
      // No roles are specified for this route, so access is granted
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user_details; // Assuming user data is available after authentication

    // Check if the user has at least one of the required roles
    return requiredRoles.some((role) => user.type.includes(role));
  }
}
