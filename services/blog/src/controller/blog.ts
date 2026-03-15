import TryCatch from "../utils/trycatch.js";
import sql from "../utils/db.js";
import axios from "axios";

export const getAllBlogs = TryCatch(async (req, res) => {
    console.log("getAllBlogs called");
    const { searchQuery, category } = req.query;
    const searchPattern = `%${searchQuery}%`;
    const categoryPattern = `%${category}%`;
    let blogs;
    if (searchQuery && category) {
        console.log("if called Search Query:", searchQuery);
        blogs = await sql`
            SELECT * FROM BLOGS 
            WHERE (title LIKE ${searchPattern} 
            OR description LIKE ${searchPattern}) 
            AND category LIKE ${categoryPattern}
            ORDER BY createdAt DESC
        `;
    } else if (searchQuery) {
        console.log("else if called Search Query:", searchQuery);
        blogs = await sql`
            SELECT * FROM BLOGS 
            WHERE title ILIKE ${searchPattern} 
            OR description ILIKE ${searchPattern} 
            ORDER BY createdAt DESC
        `;
    } else {
        // Always retrieve all blogs if no searchQuery or category
        console.log("else called:");
        blogs = await sql`SELECT * FROM BLOGS ORDER BY createdAt DESC`;
    }
    console.log("Blogs retrieved:");
    res.json({
        "blogs": blogs
    });
});

export const getSingleBlog = TryCatch(async (req, res) => {
    console.log("getSingleBlog called with id:", req.params.id);
    const blog = await sql`SELECT * FROM blogs WHERE id = ${req.params.id}`;
    console.log("Calling the user service");
    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`);
    console.log("sending data back")
    res.json({
        "Blog": blog,
        "author": data
    });
});
