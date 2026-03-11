// Configures in-memory multipart file uploads for author service endpoints.
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
	if (file.mimetype.startsWith('image/')) {
		callback(null, true);
		return;
	}

	callback(new Error('Only image uploads are allowed'));
};

const uploadFile = multer({storage}).single('file')

export default uploadFile;