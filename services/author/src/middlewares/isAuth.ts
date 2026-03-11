// Verifies JWT bearer tokens and attaches the authenticated author to the request.
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface IUser {
    _id: string;
    name: string;
    email: string;
    image: string;
    instagram: string;
    linedin: string;
    bio: string;
}

interface AuthJwtPayload extends JwtPayload {
    user?: IUser;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jwtSecret = process.env.JWT_SEC;
        if (!jwtSecret) {
            console.error('[Auth] JWT_SEC is not configured');
            return void res.status(500).json({ message: 'Server authentication config error' });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            console.log("[Auth] Missing or malformed authorization header");
            return void res.status(401).json({ message: "Please login - no auth header" });
        }

        const [, token] = authHeader.split(" ");
        if (!token) {
            console.log("[Auth] Token missing after Bearer prefix");
            return void res.status(401).json({ message: "Please login - invalid token format" });
        }

        const decodeValue = jwt.verify(token, jwtSecret) as AuthJwtPayload;

        if (!decodeValue?.user) {
            console.log('[Auth] Token decode failed or user payload missing');
            return void res.status(401).json({ message: 'Invalid or expired token' });
        }

        req.user = decodeValue.user;
        console.log('[Auth] Auth success for user');
        next();
    } catch (err) {
        console.error("[Auth] JWT verification error:", err);
        return void res.status(401).json({ message: 'Invalid or expired token' });
    }
};