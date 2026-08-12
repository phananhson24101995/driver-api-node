import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// [SECURITY] Import helmet để bảo vệ HTTP headers (chống XSS, Clickjacking, MIME sniffing)
import helmet from 'helmet';

import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // [SECURITY] Helmet - Thêm các HTTP Security Headers tự động
  app.use(helmet());

  // [SECURITY] CORS - Chỉ cho phép các domain được liệt kê trong env CORS_ORIGINS
  // Mặc định cho phép localhost dev và production domain
  const corsEnv = configService.get<string>('CORS_ORIGINS');
  const allowedOrigins = corsEnv
    ? corsEnv.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  console.log('Allowed CORS Origins:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // Cho phép request nội bộ, không có Origin header
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn('Blocked CORS origin:', origin);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // allowedHeaders: [
    //   'Content-Type',
    //   'Authorization',
    //   'Accept',
    //   'Origin',
    //   'X-Requested-With',
    //   'X-Requested-By',
    // ],
    // optionsSuccessStatus: 204,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Response Interceptor
  app.useGlobalInterceptors(new ApiResponseInterceptor(app.get(Reflector)));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Driving School API')
    .setDescription('API documentation for Driving School system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
// trigger restart
