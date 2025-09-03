const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const chatSocket = require("./sockets/chatSocket");
const chatRoutesFactory = require("./routes/chatRoutes");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const chatRoutes = chatRoutesFactory(io);
app.use("/chats", chatRoutes);

chatSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
