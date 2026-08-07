import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Có lỗi hệ thống xảy ra. Vui lòng liên hệ quản trị viên.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Nếu là lỗi BadRequest từ ValidationPipe (mảng messages)
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const msg = (exceptionResponse as { message: string | string[] })
          .message;
        message = Array.isArray(msg) ? msg[0] : msg; // Lấy lỗi đầu tiên
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = exception.message;
      }
    } else {
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      data: null,
      success: false,
      count: 0,
      message: message,
    });
  }
}
