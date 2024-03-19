import WebSocket from "ws";

const port = 8080;
const server = new WebSocket.Server({ port });

console.log(`WebSocket server is running on ws://localhost:${port}`);

server.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    // 全てのクライアントにメッセージを送信
    server.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
