// Creates and exports the Neon SQL client used by the author service.
import {neon}  from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();
const dbUrl = process.env.DB_URL;

if (!dbUrl) {
	throw new Error('DB_URL is required to initialize database connection');
}

console.log('[AuthorDB] Neon client initialized');

const sql = neon(dbUrl);
export default sql;
