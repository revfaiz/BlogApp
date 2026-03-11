// Verifies user JWT tokens and loads the authenticated user for protected routes.
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../model/User.js";
import type { IUser } from "../model/User.js";

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

interface MyJwtPayload extends JwtPayload {
    id: string;
}

export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
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

        
        const decodeValue = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload

         if (!decodeValue || !decodeValue.user){
            console.log('[Auth] Token decode failed or user payload missing');
            res.status(401).json({
                "message" : "token is expired"
            })
            return;
}
        // Fetch user from token payload
        

        req.user = decodeValue.user
        console.log('[Auth] Auth success for user');
        next();
    } catch (err) {
        console.error("[Auth] JWT verification error:", err);
        return void res.status(500).json({ message: "Server error during authentication" });
    }
};