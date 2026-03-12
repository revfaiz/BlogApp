import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import sql from "../utils/db.js";
import TryCatch from "../utils/trycatch.js";

export const deleteBlog = TryCatch(async(req:AuthenticatedRequest, res)=>{
    console.log('[AuthorBlogController] Received blog deletion request');
    const { id } = req.params;
    console.log(`[AuthorBlogController] Deleting blog with id: ${id} by user: ${req.user?._id}`);
    const blog = await sql`select * from blogs where id = ${id}`;

    if(!blog.length){
        console.log('[AuthorBlogController] No blog found with the provided id');
        res.status(400).json({
            message : "No Blog with this id"
        })
    }
    if(blog[0]?.author !== req.user?._id){
        console.log('[AuthorBlogController] Unauthorized deletion attempt by user:', req.user?._id);
        res.status(401).json({
            message : "You are not allowed to Perform this Action"
        })
    }
    await sql`delete from blogs where id = ${id}`;

    res.status(200).json({
        message:"Blog Deleted"
    })
});
