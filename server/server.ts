import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import WebSocket, { WebSocketServer } from "ws";

const port = 8080;

interface Room {
  name: string;
  password: string;
  clients: Set<WebSocket>;
}

let rooms: Room[] = [];

// HTTPサーバーの設定
const server = http.createServer((request, response) => {
  if (request.url === "/" || request.url === "/index.html") {
    const indexPath = path.join(__dirname, "../client/index.html");
    const readStream = fs.createReadStream(indexPath);

    response.writeHead(200, { "Content-Type": "text/html" });
    readStream.pipe(response);
  } else if (request.url === "/client.js") {
    const jsPath = path.join(__dirname, "../client/client.js");
    const readStream = fs.createReadStream(jsPath);

    response.writeHead(200, { "Content-Type": "application/javascript" });
    readStream.pipe(response);
  } else {
    response.writeHead(404);
    response.end();
  }
});

// WebSocketサーバーの設定
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());
    if (parsedMessage.action === "createRoom") {
      console.log(parsedMessage);
      const roomName = parsedMessage.roomName;
      const roomPassword = parsedMessage.roomPassword;
      const newRoom: Room = {
        name: roomName,
        password: roomPassword,
        clients: new Set([ws]),
      };
      rooms.push(newRoom);
      ws.send(
        JSON.stringify({ action: "roomCreated", roomName, roomPassword })
      );
    } else if (parsedMessage.action === "joinRoom") {
      const room = rooms.find(
        (room) =>
          room.name === parsedMessage.roomName &&
          room.password === parsedMessage.roomPassword
      );
      if (room) {
        console.log(parsedMessage);
        room.clients.add(ws);
        ws.send(JSON.stringify({ action: "joinedRoom", roomName: room.name }));
      } else {
        ws.send(
          JSON.stringify({
            action: "error",
            message: "Invalid room name or password",
          })
        );
      }
    } else {
      const room = rooms.find((room) => room.clients.has(ws));
      if (room) {
        room.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    rooms.forEach((room) => {
      room.clients.delete(ws);
    });
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
