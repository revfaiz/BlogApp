// Connects the user service to MongoDB and exports the database bootstrap helper.
import mongoose from 'mongoose';


const connectDb = async () => {
    console.log('i am in connectDb')
    mongoose.set('strictQuery', true);
    console.log('i am after')
    

  // 1. Ask Mongoose directly for the state
  // 1 = connected, 2 = connecting
//   if (mongoose.connection.readyState === 1) {
//     console.log('i am if ')
//     console.log('[DB] Using existing database connection');
//     return;
//   }

//   if (mongoose.connection.readyState === 2) {
//     console.log('[DB] Database connection is already in progress...');
//     return;
//   }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: process.env.DB_NAME as string,
    });

    // Optional chaining keeps TypeScript happy!
    const isConnected = db.connections[0]?.readyState === 1;
    
    if (isConnected ) {
       console.log(`[DB] New connection established`);
    }
    console.log('i am connected')
  } catch (error) {
    console.error('[DB] Connection error:', error);
    // Important: Re-throw so app.js knows the DB failed
    throw error; 
  }
};

export default connectDb;