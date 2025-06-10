import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

// Koneksi.js 😋

const koneksidotjs = async () => {

  console.log('Starting MongoDB Connection');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('el mongos el konektos');
  } catch (err) {
    console.error('el mongos el eroros', err);
    process.exit(1);
  }
};

export default koneksidotjs;
