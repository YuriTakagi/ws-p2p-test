var _a;
var serverUrl = "ws://localhost:8080";
var ws = new WebSocket(serverUrl);
ws.onopen = function () {
    console.log("Connected to the server");
};
ws.onerror = function (error) {
    console.error("WebSocket error: ".concat(error));
};
ws.onmessage = function (event) {
    console.log("Message from server: ".concat(event.data));
    showMessage(event.data);
};
function sendMessage(message) {
    ws.send(message);
}
function showMessage(message) {
    var chatDiv = document.getElementById("chat");
    if (chatDiv) {
        var messageElement = document.createElement("p");
        messageElement.textContent = message;
        chatDiv.appendChild(messageElement);
    }
}
(_a = document.getElementById("sendButton")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
    var messageInput = document.getElementById("messageInput");
    var message = messageInput.value;
    if (message) {
        sendMessage(message);
        messageInput.value = "";
    }
});
