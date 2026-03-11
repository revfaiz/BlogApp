// Defines author blog API routes and wires them to middleware and controllers.
import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import uploadFile from '../middlewares/multer.js';
import { createBlog } from '../controller/blog.js';

const router = express.Router();

router.post('/blogs/new_blog', isAuth, uploadFile, createBlog);

export default router;
