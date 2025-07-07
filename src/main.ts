import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import InjectSwagger from 'utils/injectors/swagger';
import InjectPipes from 'utils/injectors/pipes';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { ExpressAdapter } from '@nestjs/platform-express';
// import * as compression from 'compression';

async function bootstrap() {
  // const adapter = new ExpressAdapter();
  // const app = await NestFactory.create(AppModule, adapter, {
  //   bufferLogs: true,
  // });
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors({
    origin: [ 
      'http://localhost:5173', // Vite default
      ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ]
  });

  // app.useWebSocketAdapter(new IoAdapter(app));

  // adapter.set('trust proxy', 1); // Trust the first proxy

  const globalPrefix = 'api/v1';

  // set global prefix
  app.setGlobalPrefix(globalPrefix);

  /* Add custom Injectors here */
  InjectPipes(app);
  InjectSwagger(app);

  // app.use(
  //   compression({
  //     threshold: 512, // set the threshold to 512 bytes
  //   }),
  // );

  // await app.listen(process.env.PORT);
  await app.listen(process.env.PORT, '0.0.0.0');

  Logger.log(
    `Server running on http://localhost:${process.env.PORT}/${globalPrefix}`,
  );
}
bootstrap();
