// Handles author blog creation requests, image uploads, and database inserts.
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import sql from "../utils/db.js";
import TryCatch from "../utils/trycatch.js";
import cloudinary from "cloudinary";

interface CreateBlogBody {
    title?: string;
    description?: string;
    content?: string;
    category?: string;
}

export const createBlog = TryCatch(async(req:AuthenticatedRequest, res)=>{
    const { title, description, content, category } = (req.body ?? {}) as CreateBlogBody;
    const normalizedTitle = title?.trim();
    const normalizedDescription = description?.trim();
    const normalizedContent = content?.trim();
    const normalizedCategory = category?.trim();
    const authorId = req.user?._id;
    const file = req.file;
    console.log('[AuthorBlogController] Received blog creation request', { authorId });

    if (!normalizedTitle || !normalizedDescription || !normalizedContent || !normalizedCategory) {
        console.log('[AuthorBlogController] Missing required fields for blog creation');
        res.status(400).json({
            message: 'Title, description, content, and category are required'
        })
        return;
    }

    if (!authorId) {
        console.log('[AuthorBlogController] Missing authenticated user id');
        res.status(401).json({
            message: 'Unauthorized'
        })
        return;
    }

    if (!file) {
        console.log('[AuthorBlogController] Missing file for blog creation');
        res.status(400).json({
            message: "No file uploaded"
        })
        return;
    }

    console.log('[AuthorBlogController] Converting uploaded file to data URI');
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content){
        console.log('[AuthorBlogController] Invalid file buffer generated from upload');
        res.status(400).json({
            message: "Invalid file format"
        })
        return;
    }

    console.log('[AuthorBlogController] Uploading blog image to Cloudinary');
    const cloud =  await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "blogs"
    });
    console.log('[AuthorBlogController] Cloudinary upload successful', { imageUrl: cloud.secure_url });

    console.log('[AuthorBlogController] Inserting blog into database');
    const result = await sql`INSERT INTO BLOGS(title, description, 
                        image, content, category,
                author) VALUES (
                        ${normalizedTitle}, ${normalizedDescription},
                        ${cloud.secure_url},     
                        ${normalizedContent}, ${normalizedCategory},
                        ${authorId}) RETURNING *`;
    console.log('[AuthorBlogController] Blog insert successful', { blogId: result[0]?.id });
    res.status(201).json({
        message: "Blog created successfully",
        blog: result[0]
    })


})  