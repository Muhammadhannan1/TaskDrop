import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

export default function InjectPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    }),
  );
}
