// Handles author blog update requests, image uploads, and database updates.
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import sql from "../utils/db.js";
import TryCatch from "../utils/trycatch.js";
import cloudinary from "cloudinary";

interface UpdateBlogBody {
    title?: string;
    description?: string;
    content?: string;
    category?: string;
    image?: string;
}

export const updateBlog = TryCatch(async(req:AuthenticatedRequest, res)=>{
    console.log('[AuthorBlogController] Received blog update request');
    const { id } = req.params;
    console.log(`[AuthorBlogController] Updating blog with id: ${id} by user: ${req.user?._id}`);
    const { title, description, content, category, image } = (req.body ?? {}) as UpdateBlogBody;

    const file = req.file;

    const blog = await sql`select * from blogs where id = ${id}`;

    if(!blog.length){
        console.log('No Blog with this id')
        res.status(400).json({
            message : "No Blog with this id"
        })
        return;
    }
    
    if(blog[0]?.author !== req.user?._id){
        res.status(401).json({
            message : "You are not allowed to Perform this Action"
        })
        return;
    }
    
    let imageUrl = blog[0]?.image;
    if(file){
        const fileBuffer = getBuffer(file)
        if (!fileBuffer || !fileBuffer.content){
            console.log('[AuthorBlogController] Invalid file buffer generated from upload');
            res.status(400).json({
                message: "Invalid file format"
            })
            return;
        }
        
        console.log('[AuthorBlogController] Uploading blog image to Cloudinary');
        const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
            folder: "Blogs"
        })
        console.log('[AuthorBlogController] Cloudinary upload successful');
        imageUrl = cloud.secure_url
    }
    
    const updatedBlog = await sql`update blogs set
    title = ${title || blog[0]?.title},
    description = ${description || blog[0]?.description},
    content = ${content || blog[0]?.content}, 
    category = ${category || blog[0]?.category},
    image = ${imageUrl}
    where id = ${id} 
    returning *`;

    res.status(200).json({
        message: "Blog Updated",
        blog: updatedBlog[0]
    })
});
