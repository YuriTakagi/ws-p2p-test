const serverUrl = "ws://localhost:8080";
const ws = new WebSocket(serverUrl);

const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
});

peerConnection.ondatachannel = (event) => {
  let dataChannel = event.channel;
  dataChannel.onopen = () => console.log("Data channel is open");
  dataChannel.onmessage = (event) => showMessage(event.data);
};

let dataChannel = peerConnection.createDataChannel("chat");

peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    ws.send(JSON.stringify({ iceCandidate: event.candidate }));
  }
};

dataChannel.onopen = () => console.log("Data channel is open");
dataChannel.onmessage = (event) => showMessage(event.data);

ws.onmessage = async (event) => {
  const readBlobAsText = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(blob);
    });
  };

  const data =
    event.data instanceof Blob ? await readBlobAsText(event.data) : event.data;
  const message = JSON.parse(data);

  if (message.action === "roomCreated" || message.action === "joinedRoom") {
    console.log(message);
  } else if (message.iceCandidate) {
    try {
      await peerConnection.addIceCandidate(
        new RTCIceCandidate(message.iceCandidate)
      );
    } catch (e) {
      console.error("Error adding received ice candidate", e);
    }
  } else if (message.offer) {
    const createAnswerButton = document.getElementById(
      "createAnswerButton"
    ) as HTMLButtonElement;
    createAnswerButton.disabled = false;
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.offer)
    );
  } else if (message.answer) {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.answer)
    );
  }
};

const createOfferButton = document.getElementById("createOfferButton");
createOfferButton?.addEventListener("click", async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  ws.send(JSON.stringify({ offer }));
});

const createAnswerButton = document.getElementById(
  "createAnswerButton"
) as HTMLButtonElement;
createAnswerButton.addEventListener("click", async () => {
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  ws.send(JSON.stringify({ answer }));
  createAnswerButton.disabled = true;
});

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
  ws.send(
    JSON.stringify({
      action: "joinRoom",
      roomName: roomNameInput.value,
      roomPassword: roomPasswordInput.value,
    })
  );
});

// const sendButton = document.getElementById("sendButton");
// sendButton?.addEventListener("click", () => {
//   const messageInput = document.getElementById(
//     "messageInput"
//   ) as HTMLInputElement;
//   const message = messageInput.value;
//   if (message) {
//     ws.send(
//       JSON.stringify({ action: "sendMessage", message, sender: "ClientName" })
//     );
//     messageInput.value = "";
//   }
// });

const sendButton = document.getElementById("sendButton");
sendButton?.addEventListener("click", () => {
  const messageInput = document.getElementById(
    "messageInput"
  ) as HTMLInputElement;
  const message = messageInput.value;
  if (message && dataChannel.readyState === "open") {
    dataChannel.send(message);
    messageInput.value = "";
  }
});
