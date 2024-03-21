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
  dataChannel = event.channel;
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
  const readBlobAsText = (blob: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
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

// オファー
document
  .getElementById("createOfferButton")!
  .addEventListener("click", async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    ws.send(JSON.stringify({ offer }));
  });

// アンサー
const createAnswerButton = document.getElementById(
  "createAnswerButton"
) as HTMLButtonElement;
createAnswerButton.addEventListener("click", async () => {
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  ws.send(JSON.stringify({ answer }));
  createAnswerButton.disabled = true;
});

function showMessage(message: string) {
  const chatDiv = document.getElementById("chat");
  if (chatDiv) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    chatDiv.appendChild(messageElement);
  }
}

// ルーム作成
document.getElementById("createRoomButton")!.addEventListener("click", () => {
  const roomName = (
    document.getElementById("roomNameInput") as HTMLInputElement
  ).value;
  const roomPassword = (
    document.getElementById("roomPasswordInput") as HTMLInputElement
  ).value;
  ws.send(JSON.stringify({ action: "createRoom", roomName, roomPassword }));
});

// ルーム参加
document.getElementById("joinRoomButton")!.addEventListener("click", () => {
  const roomName = (
    document.getElementById("roomNameInput") as HTMLInputElement
  ).value;
  const roomPassword = (
    document.getElementById("roomPasswordInput") as HTMLInputElement
  ).value;
  ws.send(JSON.stringify({ action: "joinRoom", roomName, roomPassword }));
});

// メッセージ送信
document.getElementById("sendButton")!.addEventListener("click", () => {
  const messageInput = document.getElementById(
    "messageInput"
  ) as HTMLInputElement;
  const message = messageInput.value;
  if (message) {
    dataChannel.send(message);
    messageInput.value = "";
  }
});
