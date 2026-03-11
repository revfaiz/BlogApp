// Converts uploaded files into data URI strings for Cloudinary uploads.
import DataUriParser from 'datauri/parser.js';
import type { Express } from 'express';

import path from "path"

const getBuffer = (file: Express.Multer.File) => {
    const parser = new DataUriParser();
    const extension = path.extname(file.originalname).toString();
    return parser.format(extension, file.buffer);


}
export default getBuffer;