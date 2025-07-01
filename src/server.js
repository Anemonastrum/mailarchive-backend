// modul
import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// konfig
import koneksidotjs from './config/database.js';
import configurePassport from './config/passport.js';

// rute
import authRoutes from './routes/auth.js';
import organizationRoutes from './routes/organization.js';
import categoryRoutes from './routes/category.js';
import inboxRoutes from './routes/inbox.js'
import outboxRoutes from './routes/outbox.js'
import statsRoutes from './routes/stats.js'
import userRoutes from './routes/user.js'
import logbookRoutes from './routes/logbook.js'

dotenv.config();
const app = express();

// DB
koneksidotjs();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [ 'http://localhost:5173', 'http://localhost:5174', 'http://vpn.warungmicky.shop:5173' ],
  credentials: true,
}));
app.use(passport.initialize());
configurePassport(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/outbox', outboxRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/logbook', logbookRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Starting Server on port ${PORT}`));
