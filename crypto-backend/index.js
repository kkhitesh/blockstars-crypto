// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const cors = require("cors");

const activeUsers = new Set();
let cache = "NA";

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Crypto Price Tracker Server");
});

io.on("connection", (socket) => {
  console.log(socket.id, "connected");
  activeUsers.add(socket);
  console.log("sending first to: ", socket.id);
  socket.emit("cryptoPrices", cache);

  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected");
    activeUsers.delete(socket);
  });
});

const updateCache = async () => {
  if (activeUsers.size === 0) {
    console.log("No active users, skipping API request");
    return;
  }

  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      {
        params: {
          symbol: "BTC",
        },
        headers: {
          "X-CMC_PRO_API_KEY": "eae47124-4452-490b-9e29-5b36f3df8186",
        },
      }
    );

    cache = response.data.data["BTC"].quote?.USD?.price;
    activeUsers.forEach((userSocket) => {
      userSocket.emit("cryptoPrices", cache);
    });
  } catch (error) {
    console.error("Error fetching cryptocurrency prices:", error.message);
  }
};

//Calls function every 30 seconds and continue fetching if there are any active users
setInterval(updateCache, 30000);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
