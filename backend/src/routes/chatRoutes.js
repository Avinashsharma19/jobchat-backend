const express = require("express");
const { getMessages, sendMessage, initChatController } = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

module.exports = (io) => {
  const router = express.Router();

  // Initialize controller with socket.io instance
  initChatController(io);

  router.get("/:chatId/messages", protect, getMessages);
  router.post("/:chatId/messages", protect, sendMessage);

  return router;
};