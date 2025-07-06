import { Injectable, NestMiddleware } from '@nestjs/common';
import * as morgan from 'morgan';
import WinstonLoggerService from './logger.middleware';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLoggerService) {}

  use(req: any, res: any, next: any): void {
    const morganFormat =
      ':method :url :status :response-time ms - :res[content-length] - :remote-addr - :user-agent';

    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const clientIp = forwardedFor
      ? forwardedFor.split(',')[0].trim() // Get the first IP in the chain
      : req.ip; // Fallback to req.ip

    morgan(morganFormat, {
      stream: {
        write: (message: string) => {
          const logObject = {
            Method_Status: `${req.method} ${res.statusCode}`,
            URL: req.originalUrl,
            'Response-Time': message.split(' ')[3],
            IP: clientIp,
            Host: req.headers['host'],
            // 'Content-Length': message.split(' ')[6],
            'Device-Type': message.split(' ')[10],
            Body: JSON.stringify(req.body, null, 2),
            Params: JSON.stringify(req.params, null, 2),
            Query: JSON.stringify(req.query, null, 2),
            'Auth-Token': req.headers['authorization']?.replace('Bearer ', ''),
            // 'User-ID': req.user_details?._id,
          };

          console.table(logObject);

          // this.logger.info(`${JSON.stringify(logObject)} \n`);
        },
      },
    })(req, res, next); // Continue the middleware chain
  }
}
