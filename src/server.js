// modul
import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';

// konfig
import koneksidotjs from './config/database.js';
import configurePassport from './config/passport.js';

// rute
import authRoutes from './routes/auth.js';
import organizationRoutes from './routes/organization.js';
import categoryRoutes from './routes/category.js';

dotenv.config();
const app = express();

// DB
koneksidotjs();

// Middleware
app.use(express.json());
app.use(passport.initialize());
configurePassport(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/info', organizationRoutes);
app.use('/api/category', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Starting Server on port ${PORT}`));
