// Connects the user service to MongoDB and exports the database bootstrap helper.
import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const connectDb = async () => {
    console.log('[UserDB] connectDb called');

    if (!mongoUri || !dbName) {
        throw new Error('MONGO_URI and DB_NAME must be defined before connecting to MongoDB');
    }

    mongoose.set('strictQuery', true);

    // Reuse the active connection when the service is already connected or still connecting.
    if (mongoose.connection.readyState === 1) {
        console.log('[UserDB] Using existing database connection');
        return;
    }

    if (mongoose.connection.readyState === 2) {
        console.log('[UserDB] Database connection is already in progress');
        return;
    }

  try {
    console.log('[UserDB] Opening MongoDB connection', { dbName });
    const db = await mongoose.connect(mongoUri, {
      dbName,
    });

    const isConnected = db.connections[0]?.readyState === 1;
    
    if (isConnected) {
       console.log('[UserDB] New database connection established');
    }
  } catch (error) {
    console.error('[UserDB] Connection error:', error);
    // Re-throw so the server bootstrap can fail fast instead of serving half-initialized requests.
    throw error; 
  }
};

export default connectDb;