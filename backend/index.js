const express = require('express');
const dotenv = require('dotenv');
const ConnectDB = require('./db/ConnectDB');
const app = express();
const router = require('./routes/DBOperRoutes');
const bodyParser = require('body-parser');
const cors = require("cors");
dotenv.config();

const port = process.env.PORT || 3000;

// Middleware - FIXED CORS CONFIGURATION
app.use(cors({
  origin: 'http://localhost:5000', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the database connection pool
let pool;

(async () => {
    try {
        pool = await ConnectDB();
        console.log('✅ Database connected successfully');

        // Pass the pool to the routes
        app.use((req, res, next) => {
            req.pool = pool;
            next();
        });

        // Mount routes at /api
        app.use("/api", router);

        // Root endpoint
        app.get('/', (req, res) => {
            res.json({ message: 'Backend API is running!' });
        });

        // 404 handler for undefined routes
        app.use('*', (req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error('❌ Server error:', err);
            res.status(500).json({ error: 'Internal server error' });
        });

        // Start the server
        app.listen(port, () => {
            console.log(`🚀 Server running on port http://localhost:${port}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
})();