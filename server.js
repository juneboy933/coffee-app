import express from 'express';
import coffeeRoutes from './app/routes/coffee.routes.js';
import userRoutes from './app/routes/user.routes.js';
import { initDB } from './app/database/tables.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Routes
app.use('/api/coffee', coffeeRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
const startServer = async () => {
    try {
        await initDB();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();