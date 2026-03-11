// Boots the user service, configures middleware, and starts the MongoDB-backed API server.
import express from 'express';
import dotenv from 'dotenv';
import connectDb from './utils/db.js';
import userRoutes from './routes/user.js';
import {v2 as cloudinary} from 'cloudinary';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const validateEnvironment = (): void => {
  const requiredVariables = ['MONGO_URI', 'DB_NAME', 'JWT_SEC', 'CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'];
  const missingVariables = requiredVariables.filter((variableName) => !process.env[variableName]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  console.log('[UserService] Environment loaded', {
    port: PORT,
    hasMongoUri: Boolean(process.env.MONGO_URI),
    hasDbName: Boolean(process.env.DB_NAME),
    hasJwtSecret: Boolean(process.env.JWT_SEC),
  });
};

const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_API_KEY as string,
    api_secret: process.env.CLOUD_API_SECRET as string,
  });

  console.log('[UserService] Cloudinary configured', {
    cloudName: process.env.CLOUD_NAME,
    hasApiKey: Boolean(process.env.CLOUD_API_KEY),
    hasApiSecret: Boolean(process.env.CLOUD_API_SECRET),
  });
};

app.use(express.json({ limit: '5mb' }));

// Log every incoming request so debugging cross-service calls is straightforward.
app.use((req, _res, next) => {
  console.log(`[UserService] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (_req, res) => {
  console.log('[UserService] Health check route hit');
  res.send('Welcome to User Service');
});

app.use('/api/v1', userRoutes);

const bootstrap = async (): Promise<void> => {
  // Initialize external dependencies before accepting requests.
  validateEnvironment();
  configureCloudinary();

  console.log('[UserService] Starting DB connection', { port: PORT });
  await connectDb();

  console.log('[UserService] Starting HTTP server');
  app.listen(PORT, () => {
    console.log(`User service is running on: http://localhost:${PORT}`);
  });
};

bootstrap()
  .then(() => {
    console.log('[UserService] DB connection established');
  })
  .catch((error) => {
    console.error('[UserService] Failed to start service', error);
    process.exit(1);
  });
