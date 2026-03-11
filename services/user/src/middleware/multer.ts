// Configures in-memory multipart file uploads for user profile image endpoints.
import multer from 'multer';

const  storage =  multer.memoryStorage();

const uploadFile = multer({storage}).single('file')

export default uploadFile;