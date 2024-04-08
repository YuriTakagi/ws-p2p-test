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
var serverUrl = "ws://localhost:8081";
var ws = new WebSocket(serverUrl);
var currentRoomName = "";
var peerConnections = {};
var peerConnectionConfig = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
    ],
};
var createPeerConnection = function (clientId) {
    var peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.ondatachannel = function (event) {
        var dataChannel = event.channel;
        dataChannel.onopen = function () { return console.log("Data channel is open"); };
        dataChannel.onmessage = function (event) { return showMessage(event.data); };
    };
    peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
            ws.send(JSON.stringify({
                action: "iceCandidate",
                iceCandidate: event.candidate,
                roomName: currentRoomName,
                targetId: clientId,
            }));
        }
    };
    var dataChannel = peerConnection.createDataChannel("chat");
    dataChannel.onopen = function () { return console.log("Data channel is open"); };
    dataChannel.onmessage = function (event) { return showMessage(event.data); };
    peerConnections[clientId] = { peerConnection: peerConnection, dataChannel: dataChannel };
    return peerConnection;
};
ws.onmessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
    var data, _a, message, _b, newClientId, peerConnectionForNewClient, offer, peerConnectionForIceCandidate, e_1, peerConnectionForOffer, answer, peerConnectionForAnswer;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!(typeof event.data === "string")) return [3 /*break*/, 1];
                _a = event.data;
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, event.data.text()];
            case 2:
                _a = _c.sent();
                _c.label = 3;
            case 3:
                data = _a;
                message = JSON.parse(data);
                _b = message.action;
                switch (_b) {
                    case "roomCreated": return [3 /*break*/, 4];
                    case "joinedRoom": return [3 /*break*/, 4];
                    case "newClientJoined": return [3 /*break*/, 5];
                    case "iceCandidate": return [3 /*break*/, 8];
                    case "offer": return [3 /*break*/, 13];
                    case "answer": return [3 /*break*/, 18];
                }
                return [3 /*break*/, 21];
            case 4:
                console.log(message);
                currentRoomName = message.roomName;
                return [3 /*break*/, 22];
            case 5:
                newClientId = message.clientId;
                peerConnectionForNewClient = createPeerConnection(newClientId);
                return [4 /*yield*/, peerConnectionForNewClient.createOffer()];
            case 6:
                offer = _c.sent();
                return [4 /*yield*/, peerConnectionForNewClient.setLocalDescription(offer)];
            case 7:
                _c.sent();
                ws.send(JSON.stringify({
                    action: "offer",
                    offer: offer,
                    roomName: currentRoomName,
                    targetId: newClientId,
                }));
                return [3 /*break*/, 22];
            case 8:
                if (!message.fromId) return [3 /*break*/, 12];
                peerConnectionForIceCandidate = peerConnections[message.fromId].peerConnection;
                _c.label = 9;
            case 9:
                _c.trys.push([9, 11, , 12]);
                return [4 /*yield*/, peerConnectionForIceCandidate.addIceCandidate(new RTCIceCandidate(message.iceCandidate))];
            case 10:
                _c.sent();
                return [3 /*break*/, 12];
            case 11:
                e_1 = _c.sent();
                console.error("Error adding received ice candidate", e_1);
                return [3 /*break*/, 12];
            case 12: return [3 /*break*/, 22];
            case 13:
                if (!message.fromId) return [3 /*break*/, 17];
                peerConnectionForOffer = createPeerConnection(message.fromId);
                return [4 /*yield*/, peerConnectionForOffer.setRemoteDescription(new RTCSessionDescription(message.offer))];
            case 14:
                _c.sent();
                return [4 /*yield*/, peerConnectionForOffer.createAnswer()];
            case 15:
                answer = _c.sent();
                return [4 /*yield*/, peerConnectionForOffer.setLocalDescription(answer)];
            case 16:
                _c.sent();
                ws.send(JSON.stringify({
                    action: "answer",
                    answer: answer,
                    roomName: currentRoomName,
                    targetId: message.fromId,
                }));
                _c.label = 17;
            case 17: return [3 /*break*/, 22];
            case 18:
                if (!message.fromId) return [3 /*break*/, 20];
                peerConnectionForAnswer = peerConnections[message.fromId].peerConnection;
                return [4 /*yield*/, peerConnectionForAnswer.setRemoteDescription(new RTCSessionDescription(message.answer))];
            case 19:
                _c.sent();
                _c.label = 20;
            case 20: return [3 /*break*/, 22];
            case 21:
                console.log("Unknown action:", message.action);
                _c.label = 22;
            case 22: return [2 /*return*/];
        }
    });
}); };
var showMessage = function (message) {
    var chatDiv = document.getElementById("chat");
    if (chatDiv) {
        var messageElement = document.createElement("p");
        messageElement.textContent = message;
        chatDiv.appendChild(messageElement);
    }
};
var createRoomButton = document.getElementById("createRoomButton");
createRoomButton === null || createRoomButton === void 0 ? void 0 : createRoomButton.addEventListener("click", function () {
    var roomNameInput = document.getElementById("roomNameInput");
    var roomPasswordInput = document.getElementById("roomPasswordInput");
    currentRoomName = roomNameInput.value;
    ws.send(JSON.stringify({
        action: "createRoom",
        roomName: roomNameInput.value,
        roomPassword: roomPasswordInput.value,
    }));
});
var joinRoomButton = document.getElementById("joinRoomButton");
joinRoomButton === null || joinRoomButton === void 0 ? void 0 : joinRoomButton.addEventListener("click", function () {
    var roomNameInput = document.getElementById("roomNameInput");
    var roomPasswordInput = document.getElementById("roomPasswordInput");
    currentRoomName = roomNameInput.value;
    ws.send(JSON.stringify({
        action: "joinRoom",
        roomName: roomNameInput.value,
        roomPassword: roomPasswordInput.value,
    }));
});
var sendButton = document.getElementById("sendButton");
sendButton === null || sendButton === void 0 ? void 0 : sendButton.addEventListener("click", function () {
    var messageInput = document.getElementById("messageInput");
    var message = messageInput.value;
    Object.values(peerConnections).forEach(function (_a) {
        var dataChannel = _a.dataChannel;
        if (dataChannel.readyState === "open") {
            dataChannel.send(message);
        }
    });
    messageInput.value = "";
});
