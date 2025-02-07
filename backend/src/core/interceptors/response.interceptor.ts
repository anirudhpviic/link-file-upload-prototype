import {
    CallHandler,
    ExecutionContext,
    HttpCode,
    HttpStatus,
    NestInterceptor,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  export class ResponseInterceptor implements NestInterceptor {
    intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
      const request: Request = context.switchToHttp().getRequest();
      return next.handle().pipe(
        map((data) => {
          if (data) {
            const responseObj: Record<string, any> = {
              statusCode: HttpStatus.OK,
              timestamp: new Date().toISOString(),
              path: request.path,
            };
            if (data.data) {
              responseObj.data = data.data;
            } else {
              responseObj.data = data;
            }
  
            if (data.message) {
              responseObj.message = data.message;
            }
  
            if (data.msg) {
              responseObj.message = data.msg;
            }
  
            delete responseObj.data.message;
            delete responseObj.data.msg;
  
            return responseObj;
          }
          return data;
        }),
      );
    }
  }
  