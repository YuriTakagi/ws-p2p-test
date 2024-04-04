import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

const port = 8080;

type Client = {
  ws: WebSocket;
  id: string;
};

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
    const clientId = uuidv4();
    const client: Client = { ws, id: clientId };
    console.log(`Client ${client.id} connected`);
    ws.on("message", (message) => handleMessage(client, message.toString()));
    ws.on("close", () => handleDisconnect(client));
  });
};

const handleMessage = (client: Client, message: string) => {
  const parsedMessage = JSON.parse(message);
  switch (parsedMessage.action) {
    case "createRoom":
      createRoom(client, parsedMessage);
      break;
    case "joinRoom":
      joinRoom(client, parsedMessage);
      break;
    case "offer":
      handleOffer(client, parsedMessage);
      break;
    case "answer":
      handleAnswer(client, parsedMessage);
      break;
    case "iceCandidate":
      handleIceCandidate(client, parsedMessage);
      break;
    default:
      console.log("Unknown action:", parsedMessage.action);
  }
};

const createRoom = (
  client: Client,
  { roomName, roomPassword }: { roomName: string; roomPassword: string }
) => {
  console.log(
    `Client: ${client.id}, created room: ${roomName}, password: ${roomPassword}`
  );
  const newRoom: Room = {
    name: roomName,
    password: roomPassword,
    clients: new Set([client.ws]),
  };
  rooms.push(newRoom);
  client.ws.send(
    JSON.stringify({ action: "roomCreated", roomName, roomPassword })
  );
};

const joinRoom = (
  client: Client,
  { roomName, roomPassword }: { roomName: string; roomPassword: string }
) => {
  const room = rooms.find(
    (room) => room.name === roomName && room.password === roomPassword
  );
  if (room) {
    console.log(`Client: ${client.id}, joined room: ${roomName}`);
    room.clients.add(client.ws);
  } else {
    client.ws.send(
      JSON.stringify({
        action: "error",
        message: "Invalid room name or password",
      })
    );
  }
};

const handleOffer = (
  client: Client,
  parsedMessage: { offer: RTCSessionDescriptionInit; roomName: string }
) => {
  const { offer, roomName } = parsedMessage;
  const room = rooms.find((room) => room.name === roomName);
  if (room) {
    console.log(`Client: ${client.id} sent offer in room: ${roomName}`);
    room.clients.forEach((clientInRoom) => {
      if (
        clientInRoom !== client.ws &&
        clientInRoom.readyState === WebSocket.OPEN
      ) {
        clientInRoom.send(JSON.stringify({ action: "offer", offer }));
      }
    });
  }
};

const handleAnswer = (
  client: Client,
  parsedMessage: { answer: RTCSessionDescriptionInit; roomName: string }
) => {
  const { answer, roomName } = parsedMessage;
  const room = rooms.find((room) => room.name === roomName);
  if (room) {
    console.log(`Client: ${client.id} sent answer in room: ${roomName}`);
    room.clients.forEach((clientInRoom) => {
      if (
        clientInRoom !== client.ws &&
        clientInRoom.readyState === WebSocket.OPEN
      ) {
        clientInRoom.send(JSON.stringify({ action: "answer", answer }));
      }
    });
  }
};

const handleIceCandidate = (
  client: Client,
  parsedMessage: { iceCandidate: RTCIceCandidate; roomName: string }
) => {
  const { iceCandidate, roomName } = parsedMessage;
  const room = rooms.find((room) => room.name === roomName);
  if (room) {
    console.log(`Client: ${client.id} sent ICE candidate in room: ${roomName}`);
    room.clients.forEach((clientInRoom) => {
      if (
        clientInRoom !== client.ws &&
        clientInRoom.readyState === WebSocket.OPEN
      ) {
        clientInRoom.send(
          JSON.stringify({ action: "iceCandidate", iceCandidate })
        );
      }
    });
  }
};

const handleDisconnect = (client: Client) => {
  console.log(`Client: ${client.id} disconnected`);
  rooms.forEach((room) => {
    room.clients.delete(client.ws);
    if (room.clients.size === 0) {
      rooms = rooms.filter((r) => r !== room);
    }
  });
};

const server = createHttpServer();
setupWebSocketServer(server);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
