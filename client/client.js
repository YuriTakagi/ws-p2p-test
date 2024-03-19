// // WebSocketサーバーへの接続を確立
// const signalingServer = new WebSocket("ws://localhost:8080");
// const peerConnection = new RTCPeerConnection({
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// });
// let dataChannel = peerConnection.createDataChannel("chat");
// document.getElementById("sendButton")!.addEventListener("click", () => {
//   const messageInput = document.getElementById(
//     "messageInput"
//   ) as HTMLInputElement;
//   const message = messageInput.value;
//   dataChannel.send(message);
//   displayMessage(message, true);
//   messageInput.value = "";
// });
// // データチャネルのセットアップ
// dataChannel.onopen = () => console.log("Data channel is open");
// dataChannel.onmessage = (event) => displayMessage(event.data, false);
// // シグナリングサーバーからのメッセージを処理
// signalingServer.onmessage = async (event) => {
//   const message = JSON.parse(event.data);
//   if (message.offer) {
//     // オファーを受信したら、アンサーを作成するためのボタンを有効にする
//     document.getElementById("createAnswerButton")!.addEventListener(
//       "click",
//       async () => {
//         await peerConnection.setRemoteDescription(
//           new RTCSessionDescription(message.offer)
//         );
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         signalingServer.send(JSON.stringify({ answer }));
//       },
//       { once: true }
//     ); // イベントリスナーを一度だけ実行
//   } else if (message.answer) {
//     await peerConnection.setRemoteDescription(
//       new RTCSessionDescription(message.answer)
//     );
//   } else if (message.iceCandidate) {
//     try {
//       await peerConnection.addIceCandidate(message.iceCandidate);
//     } catch (e) {
//       console.error("Error adding received ice candidate", e);
//     }
//   }
// };
// // ICE候補の処理
// peerConnection.onicecandidate = (event) => {
//   if (event.candidate) {
//     signalingServer.send(JSON.stringify({ iceCandidate: event.candidate }));
//   }
// };
// // メッセージを表示する関数
// function displayMessage(message: string, isOwnMessage: boolean) {
//   const chatDiv = document.getElementById("chat")!;
//   const messageDiv = document.createElement("div");
//   messageDiv.textContent = message;
//   if (isOwnMessage) {
//     messageDiv.style.textAlign = "right";
//   }
//   chatDiv.appendChild(messageDiv);
// }
// // オファーを作成し、シグナリングサーバーに送信する
// document
//   .getElementById("createOfferButton")!
//   .addEventListener("click", async () => {
//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
//     signalingServer.send(JSON.stringify({ offer }));
//   });
