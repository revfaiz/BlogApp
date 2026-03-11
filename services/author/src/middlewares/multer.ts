// Configures in-memory multipart file uploads for author service endpoints.
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
	// Keep uploads restricted to images so downstream Cloudinary handling stays predictable.
	if (file.mimetype.startsWith('image/')) {
		console.log('[AuthorUpload] Accepted upload', { mimeType: file.mimetype, fileName: file.originalname });
		callback(null, true);
		return;
	}

	console.log('[AuthorUpload] Rejected non-image upload', { mimeType: file.mimetype, fileName: file.originalname });
	callback(new Error('Only image uploads are allowed'));
};

const uploadFile = multer({ storage, fileFilter }).single('file');

export default uploadFile;