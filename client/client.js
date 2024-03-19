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
// WebSocketサーバーへの接続を確立
var signalingServer = new WebSocket("ws://localhost:8080");
var peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});
var dataChannel = peerConnection.createDataChannel("chat");
document.getElementById("sendButton").addEventListener("click", function () {
    var messageInput = document.getElementById("messageInput");
    var message = messageInput.value;
    dataChannel.send(message);
    displayMessage(message, true);
    messageInput.value = "";
});
// データチャネルのセットアップ
dataChannel.onopen = function () { return console.log("Data channel is open"); };
dataChannel.onmessage = function (event) { return displayMessage(event.data, false); };
// シグナリングサーバーからのメッセージを処理
signalingServer.onmessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
    var message, e_1;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                message = JSON.parse(event.data);
                if (!message.offer) return [3 /*break*/, 1];
                // オファーを受信したら、アンサーを作成するためのボタンを有効にする
                document.getElementById("createAnswerButton").addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
                    var answer;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer))];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, peerConnection.createAnswer()];
                            case 2:
                                answer = _a.sent();
                                return [4 /*yield*/, peerConnection.setLocalDescription(answer)];
                            case 3:
                                _a.sent();
                                signalingServer.send(JSON.stringify({ answer: answer }));
                                return [2 /*return*/];
                        }
                    });
                }); }, { once: true }); // イベントリスナーを一度だけ実行
                return [3 /*break*/, 7];
            case 1:
                if (!message.answer) return [3 /*break*/, 3];
                return [4 /*yield*/, peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer))];
            case 2:
                _a.sent();
                return [3 /*break*/, 7];
            case 3:
                if (!message.iceCandidate) return [3 /*break*/, 7];
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, peerConnection.addIceCandidate(message.iceCandidate)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                e_1 = _a.sent();
                console.error("Error adding received ice candidate", e_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
// ICE候補の処理
peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
        signalingServer.send(JSON.stringify({ iceCandidate: event.candidate }));
    }
};
// メッセージを表示する関数
function displayMessage(message, isOwnMessage) {
    var chatDiv = document.getElementById("chat");
    var messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    if (isOwnMessage) {
        messageDiv.style.textAlign = "right";
    }
    chatDiv.appendChild(messageDiv);
}
// オファーを作成し、シグナリングサーバーに送信する
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
                signalingServer.send(JSON.stringify({ offer: offer }));
                return [2 /*return*/];
        }
    });
}); });
