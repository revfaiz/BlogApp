// Defines author blog API routes and wires them to middleware and controllers.
import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import uploadFile from '../middlewares/multer.js';
import { createBlog } from '../controller/create_blogs.js';
import { updateBlog } from '../controller/update_blog.js';
import { deleteBlog } from '../controller/delete_blog.js';

const router = express.Router();

// Protect blog creation so only authenticated authors can publish posts.
router.post('/blogs/new_blog', isAuth, uploadFile, createBlog);
router.post('/blogs/update_blog/:id', isAuth, uploadFile, updateBlog);
router.delete('/blogs/delete_blog/:id', isAuth, deleteBlog);

export default router;