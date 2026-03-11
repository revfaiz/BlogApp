// Handles user authentication, profile reads, and profile update operations.
import User from '../model/User.js';
import type { IUser } from '../model/User.js';
import jwt from 'jsonwebtoken';
import TryCatch from '../utils/trycatch.js';
import type { AuthenticatedRequest } from '../middleware/isAuth.js';
import { v2 as cloudinary } from 'cloudinary';
import getBuffer from '../utils/dataUri.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_CONFIG = { expiresIn: '5d' } as const;
const JWT_SECRET = process.env.JWT_SEC;

interface LoginRequestBody {
    email?: string;
    name?: string;
    image?: string;
}

const generateToken = (user: IUser) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SEC is not configured');
    }

    // Keep the token payload shape aligned with the auth middleware.
    return jwt.sign({ user }, JWT_SECRET, JWT_CONFIG);
};

export const loginUser = TryCatch(async (req, res) => {
    const { email, name, image } = (req.body ?? {}) as LoginRequestBody;
    console.log('[UserController] loginUser called', {
        email,
        hasName: Boolean(name),
        hasImage: Boolean(image),
    });

    if (!email || !name) {
        console.log('[UserController] Missing required login fields');
        return res.status(400).json({ message: 'Name and email are required' });
    }
    
    let user = await User.findOne({ email });
    
    // First-time logins create a local profile; repeat logins reuse the existing one.
    if (!user) {
        console.log('[UserController] User not found, creating new user');
        const createPayload = image ? { name, email, image } : { name, email };
        const createdUser = await User.create(createPayload);
        console.log('[UserController] User created successfully', { userId: createdUser._id });
        return res.status(201).json({
            message: 'User created successfully',
            user: createdUser,
        });
    }
    
    console.log('[UserController] Existing user found');
    const token = generateToken(user);
    console.log('[UserController] Token generated', { userId: user._id });
    
    res.status(200).json({
        message: 'Login successfully',
        token,
        user,
    });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    console.log('[UserController] myProfile called', { userId: req.user?._id });
    res.status(200).json({
        message: 'My profile fetched',
        user: req.user,
    });
});

export const getuserProfile = TryCatch(async (req, res) => {
    console.log('[UserController] getuserProfile called', { requestedUserId: req.params.id });
    const user = await User.findById(req.params.id);
    
    if (!user) {
        console.log('[UserController] Requested user was not found');
        return res.status(404).json({ message: 'No user with this Id' });
    }

    console.log('[UserController] Requested user profile fetched successfully', { userId: user._id });
    
    res.status(200).json({ message: 'User profile fetched', user });
});

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const updates = req.body as Record<string, unknown>;

    console.log('[UserController] updateUser called', {
        userId,
        fields: Object.keys(updates),
    });

    if (!userId) {
        console.log('[UserController] Cannot update profile without an authenticated user');
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Apply only the submitted fields and return the updated document in one round trip.
    const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
    );

    if (!user) {
        console.log('[UserController] User not found during update');
        return res.status(404).json({ message: 'User not found' });
    }
    
    const token = generateToken(user);
    console.log('[UserController] User updated successfully', { userId: user._id });
    
    res.status(200).json({ message: 'User Updated', token, user });
});

export const updateProfilePic = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { file } = req;
    console.log('[UserController] updateProfilePic called', {
        userId,
        hasFile: Boolean(file),
    });

    if (!userId) {
        console.log('[UserController] Cannot update profile picture without an authenticated user');
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!file) {
        console.log('[UserController] No file uploaded for profile picture update');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Convert the in-memory upload into a data URI that Cloudinary accepts directly.
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        console.log('[UserController] Invalid file format for profile picture update');
        return res.status(400).json({ message: 'Invalid file format' });
    }
    
    console.log('[UserController] Uploading profile picture to Cloudinary');
    const { secure_url } = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: 'BlogApp',
    });
    console.log('[UserController] Cloudinary upload completed', { imageUrl: secure_url });
    
    const user = await User.findByIdAndUpdate(
        userId,
        { image: secure_url },
        { new: true, runValidators: true }
    );

    if (!user) {
        console.log('[UserController] User not found during profile picture update');
        return res.status(404).json({ message: 'User not found' });
    }
    
    const token = generateToken(user);
    console.log('[UserController] Profile picture updated successfully', { userId: user._id });
    res.status(200).json({ message: 'Profile picture updated', token, user });
});
