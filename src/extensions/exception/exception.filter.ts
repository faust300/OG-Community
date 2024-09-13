import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Response } from 'express';

export interface ErrorResult {
    errorCode: number,
    errorMessage: string
}

export class OGException extends Error {
    private statusCode: number = 400
    private errorResult: ErrorResult;

    constructor(errorResult: ErrorResult, statusCode?: number) {
        super(undefined)
        this.errorResult = errorResult;
        if( statusCode ){
            this.statusCode = statusCode;
        }
    }

    getStatus(): number {
        return this.statusCode
    }

    getErrorResult(): ErrorResult {
        return this.errorResult
    }
}

export class OGExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if(process.env.NODE_ENV != "production" && process.env.NODE_ENV != "test") console.log(exception)

        if (exception instanceof OGException) {
            response.status(exception.getStatus()).json({
                success: false,
                statusCode: exception.getStatus(),
                error: exception.getErrorResult()
            })
        } else {
            let status = 400;
            if (typeof exception.getStatus === 'function') {
                status = exception.getStatus()
            }
            let errorMsg = exception.message;

            if (exception.response && exception.response.message) {
                if (exception.message && Array.isArray(exception.response.message)) {
                    errorMsg = exception.response.message.join(", ");
                }
            }

            if (errorMsg.indexOf("Duplicate entry") > -1) {
                errorMsg = "Duplicate Error";
            }

            response
                .status(status)
                .json({
                    success: false,
                    statusCode: status,
                    error: {
                        errorCode: -status,
                        errorMsg: errorMsg
                    }
                });
        }
    }
}