import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// [SECURITY] Import helmet để bảo vệ HTTP headers (chống XSS, Clickjacking, MIME sniffing)
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // [SECURITY] Helmet - Thêm các HTTP Security Headers tự động
  app.use(helmet());

  // [SECURITY] CORS - Chỉ cho phép các domain được liệt kê trong env CORS_ORIGINS
  // Mặc định cho phép localhost dev và production domain
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];
   app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // [FIX] Thêm các custom headers mà frontend gửi (expire-access-token, expire-refresh-token)
    // để tránh lỗi CORS preflight khi trình duyệt kiểm tra Access-Control-Allow-Headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'expire-access-token',
      'expire-refresh-token',
    ],
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
