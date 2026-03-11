// Wraps async Express handlers so thrown errors are logged and returned safely.
import type { Request, RequestHandler, Response, NextFunction } from 'express';

/**
 * A Higher-Order Function that wraps Express controllers to catch 
 * asynchronous errors and prevent the server from crashing.
 */
const TryCatch = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Promise.resolve keeps the wrapper compatible with both sync and async handlers.
            await Promise.resolve(handler(req, res, next));
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
            console.error(`[TryCatch Error] inside ${handler.name || 'anonymous function'}:`, errorMessage);

            if (res.headersSent) {
                console.log('[TryCatch] Response already sent, delegating error to next middleware');
                next(error);
                return;
            }

            // Return a consistent JSON error shape for author service endpoints.
            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    };
};

export default TryCatch;