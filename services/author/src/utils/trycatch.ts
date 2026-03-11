// Wraps async Express handlers so thrown errors are logged and returned safely.
import type { Request, RequestHandler, Response, NextFunction } from 'express';

/**
 * A Higher-Order Function that wraps Express controllers to catch 
 * asynchronous errors and prevent the server from crashing.
 */
const TryCatch = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Promise.resolve ensures both sync and async handlers are handled
            await Promise.resolve(handler(req, res, next));
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
            // 1. Log the error for the developer
            console.error(`[TryCatch Error] inside ${handler.name || 'anonymous function'}:`, errorMessage);

            if (res.headersSent) {
                next(error);
                return;
            }

            // 2. Send a structured error response to the client
            // Note: In a larger app, you'd call next(error) to use a global error handler
            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    };
};

export default TryCatch;