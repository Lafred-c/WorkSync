import dotenv from "dotenv";
dotenv.config({path: "./config.env"});

import mongoose from "mongoose";
import app from "./app.js";
import http from "http";
import {Server} from "socket.io";
import {Message} from "./models/messageModel.js"; // Import Message model

const port = process.env.PORT || 5000;
const DB = process.env.CONNECTION_STRING;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("join_team", (teamId) => {
    socket.join(teamId);
    console.log(`User ${socket.id} joined team ${teamId}`);
  });

  socket.on("send_message", async (data) => {
    const {content, teamId, senderId} = data;

    // Save message to DB
    try {
      const newMessage = await Message.create({
        content,
        team: teamId,
        sender: senderId,
      });

      // Populate sender details for the broadcast
      await newMessage.populate("sender", "name photo email");

      // Broadcast to room
      io.to(teamId).emit("receive_message", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connection successful!");
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}...`);
    });
  })
  .catch((err) => {
    console.error(err || "DB connection failed!");
    process.exit(1);
  });
