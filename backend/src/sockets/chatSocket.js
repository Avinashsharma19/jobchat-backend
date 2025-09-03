const Message = require("../models/Message");
const redis = require("../config/redis");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("joinChat", async (chatId) => {
      try {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat ${chatId}`);

        const cachedMessages = await redis.lrange(`chat:${chatId}:messages`, 0, -1);
        if (cachedMessages.length > 0) {
          const messages = cachedMessages.map((msg) => JSON.parse(msg));
          socket.emit("chatHistory", messages);
        } else {
          const messages = await Message.find({ chat: chatId })
            .populate("sender", "name role")
            .sort({ createdAt: 1 });
          socket.emit("chatHistory", messages);
        }
      } catch (err) {
        console.error("Error in joinChat:", err.message);
      }
    });

    socket.on("sendMessage", async ({ chatId, senderId, text }) => {
      if (!text) return;

      try {
        const message = await Message.create({ chat: chatId, sender: senderId, text });
        const populatedMessage = await message.populate("sender", "name role");

        await redis.rpush(`chat:${chatId}:messages`, JSON.stringify(populatedMessage));
        await redis.ltrim(`chat:${chatId}:messages`, -20, -1);

        console.log(`New message in chat ${chatId} from ${senderId}: "${text}"`);
        io.to(chatId).emit("newMessage", populatedMessage);
      } catch (error) {
        console.error("Error in sendMessage:", error.message);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
};



