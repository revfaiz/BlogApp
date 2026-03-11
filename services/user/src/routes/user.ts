// Defines user API routes and maps them to authentication and profile controllers.
import express from 'express';
import { loginUser, myProfile, getuserProfile, updateUser, updateProfilePic } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';
import uploadFile from '../middleware/multer.js';

const router = express.Router();

router.post('/login',loginUser)
router.get('/me',isAuth,myProfile)

router.get('/user/:id', getuserProfile)
router.post('/user/update', isAuth, updateUser)
router.put('/user/updatePic', isAuth, uploadFile, updateProfilePic)

export default router;