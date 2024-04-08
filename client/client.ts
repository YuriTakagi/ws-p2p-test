const serverUrl = "ws://localhost:8081";
const ws = new WebSocket(serverUrl);
let currentRoomName = "";

type PeerConnectionEntry = {
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
};
const peerConnections: Record<string, PeerConnectionEntry> = {};

const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const createPeerConnection = (clientId: string) => {
  const peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;
    dataChannel.onopen = () => console.log("Data channel is open");
    dataChannel.onmessage = (event) => showMessage(event.data);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(
        JSON.stringify({
          action: "iceCandidate",
          iceCandidate: event.candidate,
          roomName: currentRoomName,
          targetId: clientId,
        })
      );
    }
  };

  const dataChannel = peerConnection.createDataChannel("chat");
  dataChannel.onopen = () => console.log("Data channel is open");
  dataChannel.onmessage = (event) => showMessage(event.data);
  peerConnections[clientId] = { peerConnection, dataChannel };
  return peerConnection;
};

ws.onmessage = async (event) => {
  const data =
    typeof event.data === "string" ? event.data : await event.data.text();
  const message = JSON.parse(data);

  switch (message.action) {
    case "roomCreated":
    case "joinedRoom":
      console.log(message);
      currentRoomName = message.roomName;
      break;
    case "newClientJoined":
      const newClientId = message.clientId;
      const peerConnectionForNewClient = createPeerConnection(newClientId);
      const offer = await peerConnectionForNewClient.createOffer();
      await peerConnectionForNewClient.setLocalDescription(offer);
      ws.send(
        JSON.stringify({
          action: "offer",
          offer: offer,
          roomName: currentRoomName,
          targetId: newClientId,
        })
      );
      break;
    case "iceCandidate":
      if (message.fromId) {
        const peerConnectionForIceCandidate =
          peerConnections[message.fromId].peerConnection;
        try {
          await peerConnectionForIceCandidate.addIceCandidate(
            new RTCIceCandidate(message.iceCandidate)
          );
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
      break;
    case "offer":
      if (message.fromId) {
        const peerConnectionForOffer = createPeerConnection(message.fromId);
        await peerConnectionForOffer.setRemoteDescription(
          new RTCSessionDescription(message.offer)
        );
        const answer = await peerConnectionForOffer.createAnswer();
        await peerConnectionForOffer.setLocalDescription(answer);
        ws.send(
          JSON.stringify({
            action: "answer",
            answer: answer,
            roomName: currentRoomName,
            targetId: message.fromId,
          })
        );
      }
      break;
    case "answer":
      if (message.fromId) {
        const peerConnectionForAnswer =
          peerConnections[message.fromId].peerConnection;
        await peerConnectionForAnswer.setRemoteDescription(
          new RTCSessionDescription(message.answer)
        );
      }
      break;
    default:
      console.log("Unknown action:", message.action);
  }
};

const showMessage = (message: string) => {
  const chatDiv = document.getElementById("chat");
  if (chatDiv) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    chatDiv.appendChild(messageElement);
  }
};

const createRoomButton = document.getElementById("createRoomButton");
createRoomButton?.addEventListener("click", () => {
  const roomNameInput = document.getElementById(
    "roomNameInput"
  ) as HTMLInputElement;
  const roomPasswordInput = document.getElementById(
    "roomPasswordInput"
  ) as HTMLInputElement;
  currentRoomName = roomNameInput.value;
  ws.send(
    JSON.stringify({
      action: "createRoom",
      roomName: roomNameInput.value,
      roomPassword: roomPasswordInput.value,
    })
  );
});

const joinRoomButton = document.getElementById("joinRoomButton");
joinRoomButton?.addEventListener("click", () => {
  const roomNameInput = document.getElementById(
    "roomNameInput"
  ) as HTMLInputElement;
  const roomPasswordInput = document.getElementById(
    "roomPasswordInput"
  ) as HTMLInputElement;
  currentRoomName = roomNameInput.value;
  ws.send(
    JSON.stringify({
      action: "joinRoom",
      roomName: roomNameInput.value,
      roomPassword: roomPasswordInput.value,
    })
  );
});

const sendButton = document.getElementById("sendButton");
sendButton?.addEventListener("click", () => {
  const messageInput = document.getElementById(
    "messageInput"
  ) as HTMLInputElement;
  const message = messageInput.value;
  Object.values(peerConnections).forEach(({ dataChannel }) => {
    if (dataChannel.readyState === "open") {
      dataChannel.send(message);
    }
  });
  messageInput.value = "";
});
