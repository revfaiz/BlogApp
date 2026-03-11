// Converts uploaded user files into data URI strings for image hosting uploads.
import DataUriParser from 'datauri/parser.js';

import path from "path"

const getBuffer = (file: any)=>{
    const parser = new DataUriParser();
    const Ext = path.extname(file.originalname).toString()
    return parser.format(Ext, file.buffer)


}
export default getBuffer;