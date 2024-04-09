import * as http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

const port = 8081;

type Client = {
  ws: WebSocket;
  id: string;
};

type Room = {
  name: string;
  password: string;
  clients: Map<string, WebSocket>;
};

let rooms: Room[] = [];

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
  const roomExists = rooms.some(
    (room) => room.name === roomName && room.password === roomPassword
  );
  if (roomExists) {
    client.ws.send(
      JSON.stringify({ action: "error", message: "Same Room already exists" })
    );
    return;
  }
  console.log(
    `Client: ${client.id}, created room: ${roomName}, password: ${roomPassword}`
  );
  const newRoom: Room = {
    name: roomName,
    password: roomPassword,
    clients: new Map([[client.id, client.ws]]),
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
    room.clients.set(client.id, client.ws);
    const existingClients = Array.from(room.clients.keys());
    client.ws.send(
      JSON.stringify({
        action: "joinedRoom",
        clients: existingClients,
        roomName,
      })
    );

    room.clients.forEach((ws, id) => {
      if (id !== client.id) {
        ws.send(
          JSON.stringify({ action: "newClientJoined", clientId: client.id })
        );
      }
    });
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
  {
    offer,
    roomName,
    targetId,
  }: { offer: RTCSessionDescriptionInit; roomName: string; targetId: string }
) => {
  const room = rooms.find((room) => room.name === roomName);
  if (room && room.clients.has(targetId)) {
    console.log(
      `Client: ${client.id} sent offer to ${targetId} in room: ${roomName}`
    );
    const targetWs = room.clients.get(targetId);
    targetWs?.send(
      JSON.stringify({ action: "offer", offer, fromId: client.id })
    );
  }
};

const handleAnswer = (
  client: Client,
  {
    answer,
    roomName,
    targetId,
  }: { answer: RTCSessionDescriptionInit; roomName: string; targetId: string }
) => {
  const room = rooms.find((room) => room.name === roomName);
  if (room && room.clients.has(targetId)) {
    console.log(
      `Client: ${client.id} sent answer to ${targetId} in room: ${roomName}`
    );
    const targetWs = room.clients.get(targetId);
    targetWs?.send(
      JSON.stringify({ action: "answer", answer, fromId: client.id })
    );
  }
};

const handleIceCandidate = (
  client: Client,
  {
    iceCandidate,
    roomName,
    targetId,
  }: { iceCandidate: RTCIceCandidate; roomName: string; targetId?: string }
) => {
  const room = rooms.find((room) => room.name === roomName);
  if (room && targetId && room.clients.has(targetId)) {
    console.log(
      `Client: ${client.id} sent ICE candidate to ${targetId} in room: ${roomName}`
    );
    const targetWs = room.clients.get(targetId);
    targetWs?.send(
      JSON.stringify({
        action: "iceCandidate",
        iceCandidate,
        fromId: client.id,
      })
    );
  }
};

const handleDisconnect = (client: Client) => {
  console.log(`Client: ${client.id} disconnected`);
  rooms.forEach((room) => {
    room.clients.delete(client.id);
    if (room.clients.size === 0) {
      rooms = rooms.filter((r) => r !== room);
    }
  });
};

const server = http.createServer();
setupWebSocketServer(server);

server.listen(port, () => {
  console.log(`WebSocket Server is running on ws://localhost:${port}`);
});
