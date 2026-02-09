const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { globalLimiter } = require('./middlewares/rateLimiter');
const globalErrorHandler = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes=require('./routes/userRoutes');
const productRoutes=require('./routes/productRoutes');
const salesRoutes=require('./routes/salesRoutes');
const reportRoutes=require('./routes/reportRoutes');
const app = express();
app.use(helmet());
app.use(cors());
app.use('/api', globalLimiter);
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/products',productRoutes);
app.use('/api/sales',salesRoutes);
app.use('/api/report',reportRoutes);
app.use(globalErrorHandler);

module.exports = app;