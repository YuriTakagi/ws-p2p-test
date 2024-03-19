const serverUrl = "ws://localhost:8080";
const ws = new WebSocket(serverUrl);
// const peerConnection = new RTCPeerConnection({
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" },
//     { urls: "stun:stun2.l.google.com:19302" },
//   ],
// });

// ICE候補をシグナリングサーバー経由で交換
// peerConnection.onicecandidate = event => {
//   if (event.candidate) {
//     ws.send(JSON.stringify({ iceCandidate: event.candidate }));
//   }
// };

ws.onopen = () => {
  console.log("Connected to the server");
};

ws.onerror = (error) => {
  console.error(`WebSocket error: ${error}`);
};

ws.onmessage = (event) => {
  console.log(`Message from server: ${event.data}`);
  showMessage(event.data);
};

function sendMessage(message: string) {
  ws.send(message);
}

function showMessage(message: string) {
  const chatDiv = document.getElementById("chat");
  if (chatDiv) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    chatDiv.appendChild(messageElement);
  }
}

document.getElementById("sendButton")?.addEventListener("click", () => {
  const messageInput = document.getElementById(
    "messageInput"
  ) as HTMLInputElement;
  const message = messageInput.value;
  if (message) {
    sendMessage(message);
    messageInput.value = "";
  }
});



// const serverUrl = "ws://localhost:8080";
// const ws = new WebSocket(serverUrl);
// const peerConnection = new RTCPeerConnection({
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" },
//     { urls: "stun:stun2.l.google.com:19302" },
//   ],
// });

// let dataChannel = peerConnection.createDataChannel("chat");

// peerConnection.onicecandidate = (event) => {
//   if (event.candidate) {
//     ws.send(JSON.stringify({ iceCandidate: event.candidate }));
//   }
// };

// dataChannel.onopen = () => console.log("Data channel is open");
// dataChannel.onmessage = (event) => showMessage(event.data);

// ws.onmessage = async (event) => {
//   const message = JSON.parse(event.data);

//   if (message.iceCandidate) {
//     try {
//       await peerConnection.addIceCandidate(message.iceCandidate);
//     } catch (e) {
//       console.error("Error adding received ice candidate", e);
//     }
//   } else if (message.offer) {
//     document.getElementById("createAnswerButton")!.disabled = false;
//     await peerConnection.setRemoteDescription(
//       new RTCSessionDescription(message.offer)
//     );
//   } else if (message.answer) {
//     await peerConnection.setRemoteDescription(
//       new RTCSessionDescription(message.answer)
//     );
//   }
// };

// document
//   .getElementById("createOfferButton")!
//   .addEventListener("click", async () => {
//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
//     ws.send(JSON.stringify({ offer }));
//   });

// document
//   .getElementById("createAnswerButton")!
//   .addEventListener("click", async () => {
//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     ws.send(JSON.stringify({ answer }));
//     document.getElementById("createAnswerButton")!.disabled = true;
//   });

// function showMessage(message: string) {
//   const chatDiv = document.getElementById("chat");
//   if (chatDiv) {
//     const messageElement = document.createElement("p");
//     messageElement.textContent = message;
//     chatDiv.appendChild(messageElement);
//   }
// }

// document.getElementById("sendButton")!.addEventListener("click", () => {
//   const messageInput = document.getElementById(
//     "messageInput"
//   ) as HTMLInputElement;
//   const message = messageInput.value;
//   if (message) {
//     dataChannel.send(message);
//     messageInput.value = "";
//   }
// });
