import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_METADATA } from '../decorators/response-message.decorator';

export interface Response<T> {
  data: T | null;
  success: boolean;
  totalCount: number;
  message: string;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res: unknown): Response<T> => {
        const responseMessage =
          this.reflector.get<string>(
            RESPONSE_MESSAGE_METADATA,
            context.getHandler(),
          ) || 'Thành công';

        const data = (res !== undefined ? res : null) as T | null;
        let totalCount = 1;

        if (res && typeof res === 'object') {
          // Xử lý object phân trang có chứa items và totalCount
          if ('items' in res && 'totalCount' in res) {
            const r = res as {
              items: T;
              totalCount: number;
              pageNumber?: number;
              pageSize?: number;
              totalPages?: number;
            };
            return {
              data: r.items,
              success: true,
              totalCount: r.totalCount,
              message: responseMessage,
              pageNumber: r.pageNumber,
              pageSize: r.pageSize,
              totalPages: r.totalPages,
            };
          }
        }

        if (Array.isArray(res)) {
          totalCount = res.length;
        } else if (res === null || res === undefined) {
          totalCount = 0;
        }

        return {
          data,
          success: true,
          totalCount,
          message: responseMessage,
        };
      }),
    );
  }
}
