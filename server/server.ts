import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import WebSocket, { WebSocketServer } from "ws";

const port = 8080;

type Room = {
  name: string;
  password: string;
  clients: Set<WebSocket>;
};

let rooms: Room[] = [];

// HTTPサーバー
const createHttpServer = () => {
  return http.createServer((request, response) => {
    switch (request.url) {
      case "/":
      case "/index.html":
        serveFile("../client/index.html", "text/html", response);
        break;
      case "/client.js":
        serveFile("../client/client.js", "application/javascript", response);
        break;
      default:
        response.writeHead(404);
        response.end();
    }
  });
};

// ファイル処理
const serveFile = (
  filePath: string,
  contentType: string,
  response: http.ServerResponse
) => {
  const fullPath = path.join(__dirname, filePath);
  const readStream = fs.createReadStream(fullPath);
  response.writeHead(200, { "Content-Type": contentType });
  readStream.pipe(response);
};

// WebSocketサーバー(シグナリングサーバー)
const setupWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => handleMessage(ws, message.toString()));
    ws.on("close", () => handleDisconnect(ws));
  });
};

const handleMessage = (ws: WebSocket, message: string) => {
  const parsedMessage = JSON.parse(message.toString());
  switch (parsedMessage.action) {
    case "createRoom":
      createRoom(ws, parsedMessage);
      break;
    case "joinRoom":
      joinRoom(ws, parsedMessage);
      break;
    default:
      broadcastMessage(ws, message);
  }
};

const createRoom = (
  ws: WebSocket,
  { roomName, roomPassword }: { roomName: string; roomPassword: string }
) => {
  console.log({ action: "createRoom", roomName, roomPassword });
  const newRoom: Room = {
    name: roomName,
    password: roomPassword,
    clients: new Set([ws]),
  };
  rooms.push(newRoom);
  ws.send(JSON.stringify({ action: "roomCreated", roomName, roomPassword }));
};

const joinRoom = (
  ws: WebSocket,
  { roomName, roomPassword }: { roomName: string; roomPassword: string }
) => {
  const room = rooms.find(
    (room) => room.name === roomName && room.password === roomPassword
  );
  if (room) {
    console.log({ action: "joinRoom", roomName, roomPassword });
    room.clients.add(ws);
  } else {
    ws.send(
      JSON.stringify({
        action: "error",
        message: "Invalid room name or password",
      })
    );
  }
};

const broadcastMessage = (ws: WebSocket, message: string) => {
  const room = rooms.find((r) => r.clients.has(ws));
  if (room) {
    room.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
};

const handleDisconnect = (ws: WebSocket) => {
  console.log("Client disconnected");
  rooms.forEach((room) => room.clients.delete(ws));
};

const server = createHttpServer();
setupWebSocketServer(server);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
