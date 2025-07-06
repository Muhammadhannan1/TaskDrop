import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject, Logger } from "@nestjs/common";
import { HttpAdapterHost } from '@nestjs/core';
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

@Catch()
export class GenericExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly logger: Logger
    ) {
    }

    catch(exception: Error, host: ArgumentsHost): void {
        this.logger.error("Internal Server Error: ", exception);

        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const request = ctx.getRequest();

        const requestId = request.headers['reqId'];

        const stack = {
            stack: exception.stack,
            requestId: requestId
        };

        this.logger.error(exception.message, JSON.stringify(stack));

        //Extracting the HTTP Status
        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : exception instanceof TokenExpiredError
                    ? HttpStatus.UNAUTHORIZED
                    : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception['response'].message
                : exception instanceof TokenExpiredError
                    ? "Token has expired. Please log in again."
                    : exception instanceof JsonWebTokenError
                        ? "Token is malformed. Login again."
                        : "Something went wrong";

        const responseBody = {
            status: false,
            statusCode: httpStatus,
            message: message
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
