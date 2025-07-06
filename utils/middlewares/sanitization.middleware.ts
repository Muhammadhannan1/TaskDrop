import { Injectable, NestMiddleware } from '@nestjs/common';
import * as sanitizer from 'sanitizer';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: any, res: any, next: Function) {
    // Sanitize incoming request body, query, and params
    req.body = this.sanitizeObject(req.body);
    req.query = this.sanitizeObject(req.query);
    req.params = this.sanitizeObject(req.params);

    next();
  }

  // Recursively sanitize object or string
  private sanitizeObject(data: any) {
    if (typeof data === 'string') {
      return sanitizer.escape(data); // Escape potentially dangerous characters
    }

    if (Array.isArray(data)) {
      return data.map(this.sanitizeObject);
    }

    if (typeof data === 'object' && data !== null) {
      const sanitizedData: any = {};
      Object.keys(data).forEach((key) => {
        sanitizedData[key] = this.sanitizeObject(data[key]);
      });
      return sanitizedData;
    }

    return data; // If not a string or object, return as is
  }
}
