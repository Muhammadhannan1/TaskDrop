import { INestApplication } from '@nestjs/common';
import WinstonLoggerService from 'utils/middlewares/logger.middleware';

export default function InjectWinstorLogger(app: INestApplication) {
  app.useLogger(app.get(WinstonLoggerService));
}
