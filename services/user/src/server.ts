// Boots the user service, configures middleware, and starts the MongoDB-backed API server.
import express from 'express';
import dotenv from 'dotenv';
import connectDb from './utils/db.js';
import userRoutes from './routes/user.js'
import {v2 as cloudinary} from 'cloudinary';

dotenv.config();
console.log('[UserService] Environment loaded', {
  port: process.env.PORT,
  hasMongoUri: Boolean(process.env.MONGO_URI),
  hasJwtSecret: Boolean(process.env.JWT_SEC),
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME as string,
  api_key: process.env.CLOUD_API_KEY as string,
  api_secret: process.env.CLOUD_API_SECRET as string, // replace with your real secret
})
console.log('[UserService] Cloudinary configured', {
  cloudName: process.env.CLOUD_NAME,
  hasApiKey: Boolean(process.env.CLOUD_API_KEY),
  hasApiSecret: Boolean(process.env.CLOUD_API_SECRET),
});

const app = express();
app.use(express.json())

app.use((req, _res, next) => {
  console.log(`[UserService] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  console.log('[UserService] Health check route hit');
  res.send('Welcome to User Service');
});
app.use('/api/v1', userRoutes);
console.log(`User service is starting...`);
const port = process.env.PORT;
console.log('[UserService] Starting DB connection', { port });
connectDb()
  .then(() => {
    console.log('[UserService] DB connection established');
    app.listen(port, () => {
      console.log(`User service is running on the : http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log('[Server] Failed to start service due to DB error', error);
    process.exit(1);
  });
