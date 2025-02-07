import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    UnsupportedMediaTypeException,
    InternalServerErrorException,
    GatewayTimeoutException,
    HttpException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: any, host: ArgumentsHost) {
        let message = "Internal server error"
        if (exception && exception.error && typeof exception.error === 'string') {
            message = exception.error
        }
        const ctx = host.switchToHttp();
        const { httpAdapter } = this.httpAdapterHost;

        let errorObject: {
            status: number,
            message: string
        } = {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message
        }

        if (exception && exception.name) {
            if (exception instanceof MongooseError || exception.name.includes('Mongo')) {
                // Handle Mongoose specific errors
                errorObject = this.checkMongoErrors(exception)
            }
            else if (exception instanceof Error || exception instanceof HttpException) {
                // Http and Other errors
                errorObject = this.checkHttpErrors(exception)
            }

            // Log the error for further investigation
            if (exception.response && exception.response !== '' && exception.response !== undefined) {
                errorObject.message = exception.response
            }

            console.error(exception)

        }

        const responseBody = {
            statusCode: errorObject.status,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: errorObject.message,
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, errorObject.status);

    }

    checkHttpErrors(exception) {
        let status = HttpStatus.BAD_REQUEST;
        let message = "Bad Request";
        if (exception instanceof NotFoundException) {
            status = HttpStatus.NOT_FOUND;
            message = 'Resource not found';
        } else if (exception instanceof UnauthorizedException) {
            status = HttpStatus.UNAUTHORIZED;
            message = 'Unauthorized access';
        } else if (exception instanceof BadRequestException) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Bad request';
        } else if (exception instanceof ForbiddenException) {
            status = HttpStatus.FORBIDDEN;
            message = 'Forbidden';
        } else if (exception instanceof UnsupportedMediaTypeException) {
            status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;
            message = 'Media type not supported';
        } else if (exception instanceof InternalServerErrorException) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal Server Error';
        } else if (exception instanceof GatewayTimeoutException) {
            status = HttpStatus.GATEWAY_TIMEOUT;
            message = 'Server timed out';
        } else {
            status = HttpStatus.BAD_REQUEST;
            message = exception.message
        }

        return { status, message }
    }

    checkMongoErrors(exception) {
        const mongoErrorCode = (exception as any).code;

        let status = HttpStatus.CONFLICT;
        let message = exception.message;
        switch (mongoErrorCode) {
            case 10334:
                status = HttpStatus.CONFLICT;
                message = `Schema hasn't been registered for the model`;
                break;
            case 11600:
                status = HttpStatus.CONFLICT;
                message = `Mongoose Error`;
                break;
            default:
                status = HttpStatus.CONFLICT;
                message = exception.message;
                break;
        }

        return { status, message }
    }
}
