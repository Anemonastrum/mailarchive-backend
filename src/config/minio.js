import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

// variabel minio

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET;

console.log(`Starting MinIO Client Service`);

// Pastiin bucket udh ada

(async () => {
  const exists = await minioClient.bucketExists(BUCKET_NAME);;
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    console.log(`'${BUCKET_NAME}' created`);
  } else {
    console.log(`bucket '${BUCKET_NAME}' already exists, using existing bucket`);
  }
})().catch(console.error);

export { minioClient };
