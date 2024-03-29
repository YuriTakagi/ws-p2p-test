var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var serverUrl = "ws://localhost:8080";
var ws = new WebSocket(serverUrl);
var peerConnection = new RTCPeerConnection({
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
    ],
});
peerConnection.ondatachannel = function (event) {
    dataChannel = event.channel;
    dataChannel.onopen = function () { return console.log("Data channel is open"); };
    dataChannel.onmessage = function (event) { return showMessage(event.data); };
};
var dataChannel = peerConnection.createDataChannel("chat");
peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
        ws.send(JSON.stringify({ iceCandidate: event.candidate }));
    }
};
dataChannel.onopen = function () { return console.log("Data channel is open"); };
dataChannel.onmessage = function (event) { return showMessage(event.data); };
ws.onmessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
    var readBlobAsText, data, _a, message, e_1, createAnswerButton_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                readBlobAsText = function (blob) {
                    return new Promise(function (resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            resolve(reader.result);
                        };
                        reader.onerror = function (error) {
                            reject(error);
                        };
                        reader.readAsText(blob);
                    });
                };
                if (!(event.data instanceof Blob)) return [3 /*break*/, 2];
                return [4 /*yield*/, readBlobAsText(event.data)];
            case 1:
                _a = _b.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = event.data;
                _b.label = 3;
            case 3:
                data = _a;
                message = JSON.parse(data);
                if (!(message.action === "roomCreated" || message.action === "joinedRoom")) return [3 /*break*/, 4];
                console.log(message);
                return [3 /*break*/, 13];
            case 4:
                if (!message.iceCandidate) return [3 /*break*/, 9];
                _b.label = 5;
            case 5:
                _b.trys.push([5, 7, , 8]);
                return [4 /*yield*/, peerConnection.addIceCandidate(new RTCIceCandidate(message.iceCandidate))];
            case 6:
                _b.sent();
                return [3 /*break*/, 8];
            case 7:
                e_1 = _b.sent();
                console.error("Error adding received ice candidate", e_1);
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 13];
            case 9:
                if (!message.offer) return [3 /*break*/, 11];
                createAnswerButton_1 = document.getElementById("createAnswerButton");
                createAnswerButton_1.disabled = false;
                return [4 /*yield*/, peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer))];
            case 10:
                _b.sent();
                return [3 /*break*/, 13];
            case 11:
                if (!message.answer) return [3 /*break*/, 13];
                return [4 /*yield*/, peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer))];
            case 12:
                _b.sent();
                _b.label = 13;
            case 13: return [2 /*return*/];
        }
    });
}); };
// オファー
document
    .getElementById("createOfferButton")
    .addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var offer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, peerConnection.createOffer()];
            case 1:
                offer = _a.sent();
                return [4 /*yield*/, peerConnection.setLocalDescription(offer)];
            case 2:
                _a.sent();
                ws.send(JSON.stringify({ offer: offer }));
                return [2 /*return*/];
        }
    });
}); });
// アンサー
var createAnswerButton = document.getElementById("createAnswerButton");
createAnswerButton.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, peerConnection.createAnswer()];
            case 1:
                answer = _a.sent();
                return [4 /*yield*/, peerConnection.setLocalDescription(answer)];
            case 2:
                _a.sent();
                ws.send(JSON.stringify({ answer: answer }));
                createAnswerButton.disabled = true;
                return [2 /*return*/];
        }
    });
}); });
function showMessage(message) {
    var chatDiv = document.getElementById("chat");
    if (chatDiv) {
        var messageElement = document.createElement("p");
        messageElement.textContent = message;
        chatDiv.appendChild(messageElement);
    }
}
// ルーム作成
document.getElementById("createRoomButton").addEventListener("click", function () {
    var roomName = document.getElementById("roomNameInput").value;
    var roomPassword = document.getElementById("roomPasswordInput").value;
    ws.send(JSON.stringify({ action: "createRoom", roomName: roomName, roomPassword: roomPassword }));
});
// ルーム参加
document.getElementById("joinRoomButton").addEventListener("click", function () {
    var roomName = document.getElementById("roomNameInput").value;
    var roomPassword = document.getElementById("roomPasswordInput").value;
    ws.send(JSON.stringify({ action: "joinRoom", roomName: roomName, roomPassword: roomPassword }));
});
// メッセージ送信
document.getElementById("sendButton").addEventListener("click", function () {
    var messageInput = document.getElementById("messageInput");
    var message = messageInput.value;
    if (message) {
        dataChannel.send(message);
        messageInput.value = "";
    }
});
