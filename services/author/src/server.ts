// Boots the author service, configures middleware, and initializes database tables.
import express from 'express';
import dotenv from 'dotenv';
import sql from './utils/db.js';
import blogRoutes from './routes/blogs.js';
import {v2 as cloudinary} from 'cloudinary';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

const validateEnvironment = (): void => {
    const required = ['CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'];
    const missing = required.filter((name) => !process.env[name]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    console.log('[AuthorService] Environment variables validated');};

const configureCloudinary = (): void => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME as string,
        api_key: process.env.CLOUD_API_KEY as string,
        api_secret: process.env.CLOUD_API_SECRET as string,
    });
    console.log('[AuthorService] Cloudinary configured');
};

app.use(express.json({ limit: '5mb' }));

app.use((req, _res, next) => {
    console.log(`[AuthorService] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

app.get('/', (_req, res) => {
    console.log('[AuthorService] Health check route hit');
    res.status(200).json({
        service: 'author',
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/v1', blogRoutes);

app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const initDB = async (): Promise<void> => {
    console.log('[AuthorService] Initializing BLOGS table');
    await sql`
    CREATE TABLE IF NOT EXISTS BLOGS(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    );`;

    console.log('[AuthorService] Initializing COMMENTS table');
    await sql`
    CREATE TABLE IF NOT EXISTS COMMENTS (
        id SERIAL PRIMARY KEY,
        comment VARCHAR(255) NOT NULL,
        userId TEXT NOT NULL,
        userName VARCHAR(255) NOT NULL,
        blogId VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    );`;

    console.log('[AuthorService] Initializing SAVED_BLOGS table');
    await sql`
    CREATE TABLE IF NOT EXISTS SAVED_BLOGS (
        id SERIAL PRIMARY KEY,
        userId TEXT NOT NULL,
        userName VARCHAR(255) NOT NULL,
        blogId VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    );`;

    console.log('[AuthorService] Database initialized successfully');
};

const bootstrap = async (): Promise<void> => {
    try {
        validateEnvironment();
        configureCloudinary();

        console.log('[AuthorService] Starting database initialization');
        await initDB();

        console.log('[AuthorService] Starting HTTP server');
        app.listen(PORT, () => {
            console.log(`[AuthorService] Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('[AuthorService] Failed to start service', error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (reason) => {
    console.error('[AuthorService] Unhandled rejection', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[AuthorService] Uncaught exception', error);
});

bootstrap();


