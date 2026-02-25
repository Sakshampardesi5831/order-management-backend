import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { wrapRoutes } from "./routes/wrap-routes";
import dbConnection from "./models/db.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config()
const app = express();
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(cors());
app.use(json());
const PORT = process.env.PORT || 3000;
wrapRoutes(app);

// Initialize database connection before starting server
const startServer = async () => {
  try {
    // Initialize database connection pool
    await dbConnection();
    console.log('Database pool initialized');
    
    httpServer.listen(PORT, () => {
      console.log(`App listening at port ${PORT}`);
      console.log(`Socket.IO server ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
