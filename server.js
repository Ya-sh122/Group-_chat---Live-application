const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const { Server } = require('socket.io');

// Database connection
const sequelize = require('./utils/database');

const User = require('./models/user');
const Group = require('./models/group');
const Message = require('./models/message');
const UserGroup = require('./models/userGroup');

// Database relationships
User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

// Many-to-Many relationship between Users and Groups
User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

const app = express();
const server = http.createServer(app);

// Import Routes
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const messageRoutes = require('./routes/messageRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all origins.
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(express.static('public')); // Serve static files from 'public' folder

// Route handling
app.use('/user', userRoutes);
app.use('/group', groupRoutes);
app.use('/message', messageRoutes);
app.use('/ai', aiRoutes);

// Keep track of online users globally (UserId -> SocketId mapping)
// We use a Map to ensure that if a user opens multiple tabs, they only count as ONE online user
const onlineUsers = new Map();

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user logs in, they tell the server they are online
  socket.on('user-online', (userId) => {
    socket.userId = userId; 
    onlineUsers.set(userId, socket.id);
    
    // Broadcast to EVERYONE the list of UNIQUE currently online users
    io.emit('update-online-status', Array.from(onlineUsers.keys()));
  });

  // When a user selects a group on the frontend, they "join" that room in Socket.io
  socket.on('join-room', (groupId) => {
    // Convert groupId to string to ensure consistent room naming
    socket.join(String(groupId));
  });

  // When a user sends a message, broadcast it to everyone in that specific group room
  socket.on('send-message', (messageData) => {
    io.to(String(messageData.groupId)).emit('receive-message', messageData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove the user from the online list when they disconnect
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      // Let everyone else know they went offline
      io.emit('update-online-status', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 8000;

// Sync database and start server
sequelize.sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });
