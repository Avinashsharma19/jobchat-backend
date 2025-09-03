const Chat = require("../models/Chat");
const Message = require("../models/Message");

let io; 
exports.initChatController = (socketIo) => {
  io = socketIo;
};

// Create chat 
exports.createChat = async (applicationId, employerId, seekerId) => {
  let chat = await Chat.findOne({ application: applicationId });

  if (!chat) {
    chat = await Chat.create({
      participants: [employerId, seekerId],
      application: applicationId,
    });
  }
  return chat;
};

// Fetch all messages in a chat
// GET /chats/:chatId/messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Send a new message
// POST /chats/:chatId/messages
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text required" });
    }

    let message = await Message.create({
      chat: req.params.chatId,
      sender: req.user._id,
      text,
    });

    message = await message.populate("sender", "name email role");

    // broadcast via socket
    if (io) {
      io.to(req.params.chatId).emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

