// Handles user authentication, profile reads, and profile update operations.
import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import TryCatch from '../utils/trycatch.js';
import type { AuthenticatedRequest } from '../middleware/isAuth.js';
import { v2 as cloudinary } from 'cloudinary';
import getBuffer from '../utils/dataUri.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_CONFIG = { expiresIn: '5d' } as const;
const JWT_SECRET = process.env.JWT_SEC as string;

const generateToken = (user: any) => jwt.sign({ user }, JWT_SECRET, JWT_CONFIG as any);

export const loginUser = TryCatch(async (req, res) => {
    const { email, name, image } = req.body;
    console.log(`[UserController] loginUser called for email: ${email}`);
    
    let user = await User.findOne({ email });
    
    if (!user) {
        console.log('[UserController] User not found, creating new user');
        user = await User.create({ name, email, image });
        return res.status(201).json({
            message: 'User created successfully',
            user,
        });
    }
    
    console.log('[UserController] Existing user found');
    const token = generateToken(user);
    console.log('[UserController] Token generated');
    
    res.status(200).json({
        message: 'Login successfully',
        token,
        user,
    });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    console.log('[UserController] myProfile called');
    res.status(200).json({
        message: 'My profile fetched',
        user: req.user,
    });
});

export const getuserProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return res.status(404).json({ message: 'No user with this Id' });
    }
    
    res.status(200).json({ message: 'User profile fetched', user });
});

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
    console.log('[UserController] updateUser called for user ID:', req.user?._id);
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        req.body,
        { returnDocument: 'after' }
    );
    
    const token = generateToken(user);
    console.log('[UserController] User updated');
    
    res.status(200).json({ message: 'User Updated', token, user });
});

export const updateProfilePic = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { file } = req;
    
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(400).json({ message: 'Invalid file format' });
    }
    
    const { secure_url } = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: 'BlogApp',
    });
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { image: secure_url },
        { returnDocument: 'after' }
    );
    
    const token = generateToken(user);
    res.status(200).json({ message: 'Profile picture updated', token, user });
});
