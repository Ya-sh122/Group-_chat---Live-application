const Message = require('../models/message');
const User = require('../models/user');
const UserGroup = require('../models/userGroup');

// Save a new text message to the database
exports.sendMessage = async (req, res) => {
  try {
    const { text, groupId } = req.body;

    // Optional: Check if user is actually in this group before allowing them to send a message
    const isMember = await UserGroup.findOne({
      where: { userId: req.user.id, groupId: groupId }
    });

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const message = await Message.create({
      text: text,
      userId: req.user.id,
      groupId: groupId
    });

    // We include the sender's name so the frontend can display it easily
    res.status(201).json({ 
      message: "Message sent", 
      data: {
        id: message.id,
        text: message.text,
        groupId: message.groupId,
        userId: req.user.id,
        userName: req.user.name 
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Upload media to S3 and save the link as a message
exports.sendMedia = async (req, res) => {
  try {
    const { groupId } = req.body;
    
    // req.file is provided by our S3 multer middleware
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = req.file.location; // S3 returns the public URL in 'location'

    const message = await Message.create({
      text: null, // Media messages might not have text
      mediaUrl: fileUrl,
      userId: req.user.id,
      groupId: groupId
    });

    res.status(201).json({ 
      message: "Media sent successfully",
      data: {
        id: message.id,
        mediaUrl: message.mediaUrl,
        groupId: message.groupId,
        userId: req.user.id,
        userName: req.user.name
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload media" });
  }
};

// Get all messages for a specific group
exports.getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const messages = await Message.findAll({
      where: { groupId: groupId },
      include: [{
        model: User,
        attributes: ['id', 'name'] // Only fetch id and name, ignore password
      }],
      order: [['createdAt', 'ASC']] // Oldest messages first
    });

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};