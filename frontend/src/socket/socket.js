import { io } from "socket.io-client";

const SOCKET_URL = "https://smart-inventory-tracker-bylr.onrender.com";

// Create Socket instance with automatic reconnection capabilities
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Auto-emit join_shop whenever the socket connects or successfully reconnects!
socket.on("connect", () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.shopName) {
        socket.emit("join_shop", user.shopName);
        console.log(`🔌 [Socket.io] Partitioned and joined shop room: ${user.shopName}`);
      }
    }
  } catch (err) {
    console.error("Socket room join error:", err);
  }
});
