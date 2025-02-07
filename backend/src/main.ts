import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/exception.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdaptor = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdaptor));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors({ origin: '*' });
  const server = await app.listen(process.env.PORT ?? 3000);
  server.timeout = 0;
}
bootstrap();
