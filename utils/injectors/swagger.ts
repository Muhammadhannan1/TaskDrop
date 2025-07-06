import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default function InjectSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('YOUR-APP-NAME')
    .setDescription('YOUR-APP-NAME Application Backend')
    .setContact('M.Hannan', '', 'syedmhannan@gmail.com')
    .setVersion('1.0')
    .addTag('YOUR-APP-NAME APIs')

    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger-ui', app, document);
}
