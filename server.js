// ============================================
// HAIKYUU CARD GAME - ONLINE SANDBOX SERVER
// ============================================
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register
app.post('/api/register', async (req, res) => {
    const { username, password, displayName } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username và password là bắt buộc' });
    }
    
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ success: false, error: 'Username phải từ 3-20 ký tự' });
    }
    
    if (password.length < 4) {
        return res.status(400).json({ success: false, error: 'Password phải ít nhất 4 ký tự' });
    }
    
    const result = await db.createUser(username, password, displayName);
    res.json(result);
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username và password là bắt buộc' });
    }
    
    const result = await db.loginUser(username, password);
    res.json(result);
});

// Validate session (for remember me)
app.post('/api/validate-session', async (req, res) => {
    const { sessionToken } = req.body;
    const user = await db.validateSession(sessionToken);
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false });
    }
});

// Logout
app.post('/api/logout', async (req, res) => {
    const { userId } = req.body;
    const result = await db.logoutUser(userId);
    res.json(result);
});

// ============================================
// DECK ROUTES
// ============================================

// Save deck
app.post('/api/decks', async (req, res) => {
    const { sessionToken, deckName, cards } = req.body;
    const user = await db.validateSession(sessionToken);
    
    if (!user) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
    }
    
    const result = await db.saveDeck(user.id, deckName, cards);
    res.json(result);
});

// Get user's decks
app.get('/api/decks', async (req, res) => {
    const sessionToken = req.headers['x-session-token'];
    const user = await db.validateSession(sessionToken);
    
    if (!user) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
    }
    
    const decks = await db.getUserDecks(user.id);
    res.json({ success: true, decks });
});

// Delete deck
app.delete('/api/decks/:id', async (req, res) => {
    const sessionToken = req.headers['x-session-token'];
    const user = await db.validateSession(sessionToken);
    
    if (!user) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
    }
    
    const result = await db.deleteDeck(user.id, parseInt(req.params.id));
    res.json(result);
});

// ============================================
// ROOM LIST API
// ============================================
app.get('/api/rooms', (req, res) => {
    const roomList = [];
    
    for (const [roomId, room] of rooms.entries()) {
        if (!room.gameStarted && !room.isFull()) {
            roomList.push({
                roomId: room.roomId,
                playerCount: (room.players[1] ? 1 : 0) + (room.players[2] ? 1 : 0),
                hostName: room.playerNames[1] || 'Player 1',
                createdAt: room.createdAt
            });
        }
    }
    
    // Sort by creation time (newest first)
    roomList.sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({ success: true, rooms: roomList });
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// CARD DATABASE - Organized by School
// ============================================
const CARD_DATABASE = [
    // KARASUNO - NHÂN VẬT
    { id: 1, name: "Hinata Shoyo", cardId: "hinata-shouyo-1", school: "Karasuno", type: "character", serve: 2, receive: 0, toss: 0, attack: 3, block: 2, artwork: "Card/Karasuno/Nhan vat/hinata-shouyo-1.png" },
    { id: 21, name: "Hinata Shoyo", cardId: "hinata-shouyo-2", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, artwork: "Card/Karasuno/Nhan vat/hinata-shouyo-2.png" },
    { id: 22, name: "Kageyama Tobio", cardId: "kageyama-tobio-1", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 1, attack: 3, block: 0, artwork: "Card/Karasuno/Nhan vat/kageyama-tobio-1.png" },
    { id: 23, name: "Kageyama Tobio", cardId: "kageyama-tobio-2", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 1, attack: 2, block: 2, artwork: "Card/Karasuno/Nhan vat/kageyama-tobio-2.png" },
    { id: 24, name: "Sawamura Daichi", cardId: "sawamura-daichi-1", school: "Karasuno", type: "character", serve: 2, receive: 4, toss: 0, attack: 0, block: 0, artwork: "Card/Karasuno/Nhan vat/sawamura-daichi-1.png" },
    { id: 25, name: "Sugawara Koshi", cardId: "sugawara-koshi-1", school: "Karasuno", type: "character", serve: 2, receive: 2, toss: 1, attack: 0, block: 1, artwork: "Card/Karasuno/Nhan vat/sugawara-koshi-1.png" },
    { id: 26, name: "Tanaka Ryunosuke", cardId: "tanaka-ryunosuke-1", school: "Karasuno", type: "character", serve: 1, receive: 3, toss: 0, attack: 3, block: 1, artwork: "Card/Karasuno/Nhan vat/tanaka-ryunosuke-1.png" },
    { id: 27, name: "Tsukishima Kei", cardId: "tsukishima-kei-1", school: "Karasuno", type: "character", serve: 1, receive: 2, toss: 0, attack: 2, block: 3, artwork: "Card/Karasuno/Nhan vat/tsukishima-kei-1.png" },
    { id: 28, name: "Tsukishima Kei", cardId: "tsukishima-kei-2", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, artwork: "Card/Karasuno/Nhan vat/tsukishima-kei-2.png" },
    { id: 29, name: "Yamaguchi Tadashi", cardId: "yamaguchi-tadashi-1", school: "Karasuno", type: "character", serve: 3, receive: 4, toss: 0, attack: 0, block: 0, artwork: "Card/Karasuno/Nhan vat/yamaguchi-tadashi-1.png" },
    { id: 30, name: "Nishinoya Yu", cardId: "nishinoya-yu-1", school: "Karasuno", type: "character", serve: 0, receive: 4, toss: 0, attack: 0, block: 0, isLibero: true, artwork: "Card/Karasuno/Nhan vat/nishinoya-yu-1.png" },
    { id: 31, name: "Nishinoya Yu", cardId: "nishinoya-yu-2", school: "Karasuno", type: "character", serve: 0, receive: 6, toss: 0, attack: 0, block: 0, isLibero: true, artwork: "Card/Karasuno/Nhan vat/nishinoya-yu-2.png" },
    { id: 32, name: "Azumane Asahi", cardId: "azumane-asahi-1", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, artwork: "Card/Karasuno/Nhan vat/azumane-asahi-1.png" },
    // SHIRATORIZAWA - NHÂN VẬT
    { id: 33, name: "Ushijima Wakatoshi", cardId: "ushijima-wakatoshi-1", school: "Shiratorizawa", type: "character", serve: 3, receive: 0, toss: 0, attack: 3, block: 0, artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-1.png" },
    { id: 34, name: "Ushijima Wakatoshi", cardId: "ushijima-wakatoshi-2", school: "Shiratorizawa", type: "character", serve: 4, receive: 0, toss: 0, attack: 3, block: 0, artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-2.png" },
    { id: 35, name: "Ushijima Wakatoshi", cardId: "ushijima-wakatoshi-3", school: "Shiratorizawa", type: "character", serve: 2, receive: 3, toss: 0, attack: 3, block: 0, artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-3.png" },
    { id: 36, name: "Tendo Satori", cardId: "tendo-satori-1", school: "Shiratorizawa", type: "character", serve: 1, receive: 0, toss: 0, attack: 1, block: 4, artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-1.png" },
    { id: 37, name: "Tendo Satori", cardId: "tendo-satori-2", school: "Shiratorizawa", type: "character", serve: 2, receive: 0, toss: 0, attack: 3, block: 2, artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-2.png" },
    { id: 38, name: "Tendo Satori", cardId: "tendo-satori-3", school: "Shiratorizawa", type: "character", serve: 3, receive: 1, toss: 0, attack: 3, block: 4, artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-3.png" },
    { id: 39, name: "Goshiki Tsutomu", cardId: "goshiki-tsutomu-1", school: "Shiratorizawa", type: "character", serve: 2, receive: 2, toss: 0, attack: 3, block: 0, artwork: "Card/Shiratorizawa/Nhan vat/goshiki-tsutomu-1.png" },
    { id: 40, name: "Goshiki Tsutomu", cardId: "goshiki-tsutomu-2", school: "Shiratorizawa", type: "character", serve: 4, receive: 1, toss: 0, attack: 3, block: 0, artwork: "Card/Shiratorizawa/Nhan vat/goshiki-tsutomu-2.png" },
    { id: 41, name: "Goshiki Tsutomu", cardId: "goshiki-tsutomu-3", school: "Shiratorizawa", type: "character", serve: 3, receive: 4, toss: 0, attack: 3, block: 2, artwork: "Card/Shiratorizawa/Nhan vat/goshiki-tsutomu-3.png" },
    { id: 42, name: "Shirabu Kenjiro", cardId: "shirabu-kenjiro-1", school: "Shiratorizawa", type: "character", serve: 2, receive: 3, toss: 1, attack: 0, block: 1, skill: "Khi nhân vật Đập Bóng xuất hiện trên sân mình, nếu nhân vật này (Shirabu Kenjiro) có 3+ Ý Chí, tự +1 điểm Chuyền. Nếu nhân vật Đập Bóng là \"Ushijima Wakatoshi\", có thể loại bỏ tối đa 1 Ý Chí của 1 nhân vật trên sân đối phương.", artwork: "Card/Shiratorizawa/Nhan vat/shirabu-kenjiro-1.png" },
    { id: 43, name: "Shirabu Kenjiro", cardId: "shirabu-kenjiro-2", school: "Shiratorizawa", type: "character", serve: 3, receive: 0, toss: 1, attack: 0, block: 3, skill: "Khi thẻ này xuất hiện ở khu vực Chuyền Bóng, có thể bỏ 1 thẻ Nhân Vật trường Shiratorizawa từ trên tay để thực hiện Bỏ nhỏ. (Kết thúc lượt mà không cần triển khai nhân vật Đập bóng. Ở lượt tiếp theo, đối phương không thể Chặn Bóng và chỉ Đỡ Bóng thành công với điểm Đỡ từ 3 trở lên).", artwork: "Card/Shiratorizawa/Nhan vat/shirabu-kenjiro-2.png" },
    { id: 44, name: "Shirabu Kenjiro", cardId: "shirabu-kenjiro-3", school: "Shiratorizawa", type: "character", serve: 4, receive: 4, toss: 1, attack: 1, block: 2, artwork: "Card/Shiratorizawa/Nhan vat/shirabu-kenjiro-3.png" },
    { id: 45, name: "Ohira Reon", cardId: "ohira-reon-1", school: "Shiratorizawa", type: "character", serve: 1, receive: 3, toss: 0, attack: 3, block: 1, skill: "Khi thẻ này xuất hiện ở khu vực Đập bóng, hai người chơi bỏ 1 thẻ trên cùng bộ bài của mình vào Drop.", artwork: "Card/Shiratorizawa/Nhan vat/ohira-reon-1.png" },
    { id: 46, name: "Ohira Reon", cardId: "ohira-reon-2", school: "Shiratorizawa", type: "character", serve: 1, receive: 4, toss: 0, attack: 1, block: 1, skill: "[2 Ý chí] Khi nhân vật \"Ushijima Wakatoshi\" xuất hiện ở khu vực Đập Bóng trên sân mình, có thể dùng 2 Ý Chí của nhân vật này để +1 điểm Đập cho nhân vật \"Ushijima Wakatoshi\" đó.", artwork: "Card/Shiratorizawa/Nhan vat/ohira-reon-2.png" },
    { id: 47, name: "Kawanishi Taichi", cardId: "kawanishi-taichi", school: "Shiratorizawa", type: "character", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, skill: "Khi thẻ này ra sân, có thể bỏ 1 thẻ trên tay để đặt 1 thẻ trên cùng bộ bài đối phương vào Drop và rút 1 thẻ từ bộ bài.", artwork: "Card/Shiratorizawa/Nhan vat/kawanishi-taichi.png" },
    { id: 48, name: "Yamagata Hayato", cardId: "yamagata-hayato", school: "Shiratorizawa", type: "character", serve: 0, receive: 5, toss: 0, attack: 0, block: 0, artwork: "Card/Shiratorizawa/Nhan vat/yamagata-hayato.png" },
    { id: 49, name: "Semi Eita", cardId: "semi-eita", school: "Shiratorizawa", type: "character", serve: 4, receive: 2, toss: 1, attack: 0, block: 0, skill: "[2 Ý chí] Khi thẻ này xuất hiện ở khu vực Chuyền Bóng từ trên tay, nếu có 3+ Ý Chí, thu hồi lên tay tối đa 1 thẻ Nhân Vật trường Shiratorizawa từ Drop.", artwork: "Card/Shiratorizawa/Nhan vat/semi-eita.png" },
    // KARASUNO - HÀNH ĐỘNG
    { id: 100, name: "Chuyền tới đây cho tôi!!", cardId: "chuyen-toi-day-cho-toi", school: "Karasuno", type: "action", phases: ["receive"], spiritCost: 0, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đỡ] +2 điểm Đỡ cho nhân vật Đỡ Bóng trường Karasuno trên sân mình. Sau đó, nếu nhân vật đó là \"Nishinoya Yu\", có thể chọn tối đa 1 thẻ \"Nishinoya Yu\" từ bộ bài rồi thêm vào Ý Chí của nhân vật đó. Xáo lại bộ bài.", artwork: "Card/Karasuno/Hanh dong/chuyen-toi-day-cho-toi.png" },
    { id: 101, name: "Chú mày cũng có máu ăn thua đấy…!!", cardId: "chu-may-cung-co-mau-an-thua-day", school: "Karasuno", type: "action", phases: ["attack"], spiritCost: 3, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đập] [3 Ý chí] +1 điểm Chuyền cho nhân vật Chuyền Bóng trường Karasuno trên sân mình. Hoặc nếu nhân vật đó và nhân vật Đập Bóng có từ 3 Ý Chí trở lên, +3 điểm Chuyền.", artwork: "Card/Karasuno/Hanh dong/chu-may-cung-co-mau-an-thua-day.png" },
    { id: 102, name: "Phòng thủ tuyệt đối!!", cardId: "phong-thu-tuyet-doi", school: "Karasuno", type: "action", phases: ["receive", "block"], spiritCost: 0, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đỡ][Chặn] +2 điểm Đỡ hoặc Chặn cho 1 nhân vật trường Karasuno trên sân mình. Nếu nhân vật đó là nhân vật Chặn Bóng, rút 2 thẻ từ bộ bài. Sau đó, trong lượt này không được phép sử dụng thẻ \"Phòng thủ tuyệt đối!!\" nữa.", artwork: "Card/Karasuno/Hanh dong/phong-thu-tuyet-doi.png" },
    { id: 103, name: "Dù chỉ là sinh hoạt CLB…", cardId: "du-chi-la-sinh-hoat-clb", school: "Karasuno", type: "action", phases: ["block"], spiritCost: 3, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Chặn] [3 Ý chí] +2 điểm Chặn cho 1 nhân vật \"Tsukishima Kei\" trên sân mình. Nếu trên sân mình có nhân vật Đỡ Bóng trường Karasuno với 3 Ý Chí trở lên, ở lượt tiếp theo của đối phương, đối phương chỉ Đỡ Bóng thành công với điểm Đỡ từ 8 trở lên.", artwork: "Card/Karasuno/Hanh dong/du-chi-la-sinh-hoat-clb.png" },
    { id: 104, name: "\"1 điểm bằng 100 điểm\" phải hôn!?", cardId: "1-diem-bang-100-diem-phai-hon", school: "Karasuno", type: "action", phases: ["receive", "toss", "attack", "block"], spiritCost: 2, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đỡ][Chuyền][Đập][Chặn] [2 Ý chí] +1 điểm bất kì cho 1 nhân vật trường Karasuno trên sân mình. Sau đó, có thể sử dụng 2 Ý Chí của 1 nhân vật trường Karasuno khác để thu hồi lên tay 1 thẻ nhân vật từ khu vực Loại Bỏ.", artwork: "Card/Karasuno/Hanh dong/1-diem-bang-100-diem-phai-hon.png" },
    // SHIRATORIZAWA - HÀNH ĐỘNG
    { id: 105, name: "Chuyền hết bóng cho anh.", cardId: "chuyen-het-bong-cho-anh", school: "Shiratorizawa", type: "action", phases: ["toss", "attack"], spiritCost: 3, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Chuyền][Đập] [3 ý chí] +1 điểm cho nhân vật Shiratorizawa.", artwork: "Card/Shiratorizawa/Hanh dong/chuyen-het-bong-cho-anh.png" },
    { id: 106, name: "Mà là nghệ thuật đập bóng thẳng xuống sân.", cardId: "ma-la-nghe-thuat-dap-bong-thang-xuong-san", school: "Shiratorizawa", type: "action", phases: ["block"], spiritCost: 0, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Chặn] Rút 1 thẻ từ bộ bài. Sau đó, +2 điểm Chặn cho 1 nhân vật trường Shiratorizawa trên sân mình. Nếu nhân vật đó là \"Tendo Satori\", đặt 1 thẻ trên cùng bộ bài của đối phương vào khu vực Loại Bỏ.", artwork: "Card/Shiratorizawa/Hanh dong/ma-la-nghe-thuat-dap-bong-thang-xuong-san.png" },
    { id: 107, name: "Là một đối thủ \"vượt quá tầm hiểu biết\"…", cardId: "la-mot-doi-thu-vuot-qua-tam-hieu-biet", school: "Shiratorizawa", type: "action", phases: ["receive", "toss", "attack", "block"], spiritCost: 3, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đỡ][Chuyền][Đập][Chặn] [3 Ý chí] +1 điểm bất kì cho 1 nhân vật trường Shiratorizawa trên sân mình. Nếu nhân vật đó có từ 3 Ý Chí trở lên, và trên sân đối phương, trừ nhân vật Giao Bóng, có nhân vật có từ 2 Ý Chí trở xuống, rút 2 thẻ từ bộ bài. Sau đó, trong lượt này không được sử dụng thẻ \"Là một đối thủ 'vượt quá tầm hiểu biết'…\" nữa.", artwork: "Card/Shiratorizawa/Hanh dong/la-mot-doi-thu-vuot-qua-tam-hieu-biet.png" },
    { id: 108, name: "Thấy chưa hả? Cú bóng thần tốc của em đó!", cardId: "thay-chua-ha-cu-bong-than-toc-cua-em-do", school: "Shiratorizawa", type: "action", phases: ["attack"], spiritCost: 0, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đập] +1 điểm Đập cho 1 nhân vật trên sân mình. Sau đó, nếu nhân vật đó là \"Goshiki Tsutomu\", ở lượt tiếp theo của đối phương, đối phương không được đưa ra nhân vật Chặn Bóng.", artwork: "Card/Shiratorizawa/Hanh dong/thay-chua-ha-cu-bong-than-toc-cua-em-do.png" }
];

// ============================================
// ROOM MANAGEMENT
// ============================================
const rooms = new Map();
const playerSockets = new Map();

class Room {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = { 1: null, 2: null };
        this.playerNames = { 1: 'Player 1', 2: 'Player 2' };
        this.gameStarted = false;
        this.gameState = null;
        this.createdAt = Date.now();
        this.playerDecks = { 1: null, 2: null };
    }

    addPlayer(socketId, playerName) {
        if (!this.players[1]) {
            this.players[1] = socketId;
            this.playerNames[1] = playerName || 'Player 1';
            return 1;
        } else if (!this.players[2]) {
            this.players[2] = socketId;
            this.playerNames[2] = playerName || 'Player 2';
            return 2;
        }
        return null;
    }
    
    setPlayerDeck(playerNumber, deckData) {
        this.playerDecks[playerNumber] = deckData;
    }

    removePlayer(socketId) {
        if (this.players[1] === socketId) {
            this.players[1] = null;
            return 1;
        } else if (this.players[2] === socketId) {
            this.players[2] = null;
            return 2;
        }
        return null;
    }

    isFull() {
        return this.players[1] && this.players[2];
    }

    isEmpty() {
        return !this.players[1] && !this.players[2];
    }

    getPlayerNumber(socketId) {
        if (this.players[1] === socketId) return 1;
        if (this.players[2] === socketId) return 2;
        return null;
    }

    getOpponentSocketId(playerNumber) {
        return playerNumber === 1 ? this.players[2] : this.players[1];
    }
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================
function createInitialGameState() {
    return {
        phase: 'serve',
        currentPlayer: 1,
        servingPlayer: 1,
        attackingPlayer: 1,
        sets: { 1: 0, 2: 0 },
        decks: { 1: [], 2: [] },
        hands: { 1: [], 2: [] },
        discards: { 1: [], 2: [] },
        actionCards: { 1: [], 2: [] },
        playedCards: {
            1: { serve: null, receive: null, toss: null, attack: null, block: [] },
            2: { serve: null, receive: null, toss: null, attack: null, block: [] }
        },
        spiritCards: {
            1: { serve: [], receive: [], toss: [], attack: [], block: [] },
            2: { serve: [], receive: [], toss: [], attack: [], block: [] }
        },
        currentStats: {
            servePower: 0,
            receivePower: 0,
            attackPower: 0,
            blockPower: 0
        }
    };
}

function createDeck() {
    const deck = [];
    CARD_DATABASE.forEach(cardData => {
        const copies = Math.random() < 0.5 ? 2 : 3;
        for (let i = 0; i < copies; i++) {
            deck.push({
                ...cardData,
                uniqueId: uuidv4()
            });
        }
    });
    return shuffleArray(deck);
}

function createDeckFromSelection(deckData) {
    if (!deckData || Object.keys(deckData).length === 0) {
        console.log('⚠️ No deck data provided, creating random deck');
        return createDeck();
    }
    
    const deck = [];
    const missingCards = [];
    
    console.log(`📦 Creating deck from selection with ${Object.keys(deckData).length} card types`);
    
    Object.entries(deckData).forEach(([cardId, count]) => {
        const cardData = CARD_DATABASE.find(c => c.cardId === cardId);
        if (cardData && count > 0) {
            for (let i = 0; i < count; i++) {
                deck.push({
                    ...cardData,
                    uniqueId: uuidv4()
                });
            }
        } else {
            if (count > 0) {
                missingCards.push(cardId);
                console.warn(`⚠️ Card not found in database: ${cardId} (count: ${count})`);
            }
        }
    });
    
    if (missingCards.length > 0) {
        console.warn(`⚠️ Missing ${missingCards.length} cards from database:`, missingCards);
    }
    
    console.log(`📦 Created ${deck.length} cards from selection`);
    
    while (deck.length < 40) {
        const randomCard = CARD_DATABASE[Math.floor(Math.random() * CARD_DATABASE.length)];
        deck.push({
            ...randomCard,
            uniqueId: uuidv4()
        });
    }
    
    console.log(`📦 Final deck size: ${deck.length} cards`);
    return shuffleArray(deck);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function drawCards(deck, count) {
    const drawn = [];
    for (let i = 0; i < count && deck.length > 0; i++) {
        drawn.push(deck.pop());
    }
    return drawn;
}

// ============================================
// SANITIZE STATE FOR PLAYER
// ============================================
function sanitizeStateForPlayer(gameState, playerNumber) {
    if (!gameState) return null;
    
    const opponent = playerNumber === 1 ? 2 : 1;
    const sanitized = JSON.parse(JSON.stringify(gameState));
    
    // Hide opponent's hand
    sanitized.hands[opponent] = sanitized.hands[opponent].map(() => ({
        hidden: true,
        cardBack: true
    }));
    
    // Hide opponent's deck details
    sanitized.decks[opponent] = { count: sanitized.decks[opponent].length };
    
    // Add player perspective info
    sanitized.viewingPlayer = playerNumber;
    
    return sanitized;
}

// ============================================
// SOCKET.IO HANDLERS
// ============================================
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // ============================================
    // SANDBOX MODE HANDLERS
    // ============================================
    
    // Draw card from deck
    socket.on('drawCardSandbox', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        const room = rooms.get(playerInfo.roomId);
        if (!room || !room.gameStarted) return;
        const state = room.gameState;
        const player = parseInt(data.player);
        
        if (state.decks[player] && state.decks[player].length > 0) {
            const drawn = drawCards(state.decks[player], 1);
            state.hands[player].push(...drawn);
            broadcastGameState(room);
        }
    });

    // Shuffle deck
    socket.on('shuffleDeck', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        const room = rooms.get(playerInfo.roomId);
        if (!room || !room.gameStarted) return;
        const state = room.gameState;
        const player = parseInt(data.player);
        
        if (state.decks[player]) {
            state.decks[player] = shuffleArray(state.decks[player]);
            // Broadcast log message
            io.to(room.roomId).emit('logMessage', {
                message: `${room.playerNames[player]} đã xáo bộ bài`,
                type: 'log'
            });
            broadcastGameState(room);
        }
    });

    // Set score
    socket.on('setScore', (data) => {
            const playerInfo = playerSockets.get(socket.id);
            if (!playerInfo) return;
            const room = rooms.get(playerInfo.roomId);
            if (!room || !room.gameStarted) return;
            const state = room.gameState;
        const player = parseInt(data.player);
        const value = parseInt(data.value) || 0;
        
        state.sets[player] = value;
        broadcastGameState(room);
    });

    // Advance phase
    socket.on('advancePhase', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        const room = rooms.get(playerInfo.roomId);
        if (!room || !room.gameStarted) return;
        const state = room.gameState;
        
        state.phase = data.phase;
        state.currentPlayer = data.currentPlayer;
        broadcastGameState(room);
    });

    // Move card between zones (main sandbox feature)
    socket.on('moveCard', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        const room = rooms.get(playerInfo.roomId);
        if (!room || !room.gameStarted) return;
        const state = room.gameState;
        const { cardUniqueId, player, targetType, targetZone } = data;
        const p = parseInt(player);
        
        // Find and remove card from all locations
        let card = findAndRemoveCard(state, cardUniqueId);
            if (!card) return;
        
        // Place card at target
        switch (targetType) {
            case 'hand':
                state.hands[p].push(card);
                break;
            case 'discard':
                state.discards[p].push(card);
                break;
            case 'deck-top':
                state.decks[p].push(card);
                break;
            case 'deck-bottom':
                state.decks[p].unshift(card);
                break;
            case 'zone':
                if (targetZone === 'block') {
                    state.playedCards[p].block.push(card);
                } else {
                    // Move existing card to spirit
                    const existing = state.playedCards[p][targetZone];
                    if (existing) {
                        state.spiritCards[p][targetZone].push(existing);
                    }
                    state.playedCards[p][targetZone] = card;
                }
                break;
            case 'action':
                state.actionCards[p].push(card);
                break;
            case 'spirit':
                state.spiritCards[p][targetZone].push(card);
                break;
            case 'action':
                state.actionCards[p].push(card);
                break;
        }
        
        broadcastGameState(room);
    });

    // ============================================
    // ROOM MANAGEMENT HANDLERS
    // ============================================

    // Create a new room
    socket.on('createRoom', (data) => {
        const roomId = uuidv4().substring(0, 6).toUpperCase();
        const room = new Room(roomId);
        const playerNumber = room.addPlayer(socket.id, data?.playerName);
        
        rooms.set(roomId, room);
        playerSockets.set(socket.id, { roomId, playerNumber });
        
        socket.join(roomId);
        
        socket.emit('roomCreated', {
            roomId,
            playerNumber,
            playerName: room.playerNames[playerNumber]
        });
        
        console.log(`Room created: ${roomId} by ${socket.id}`);
    });

    // Join existing room
    socket.on('joinRoom', (data) => {
        const { roomId, playerName } = data;
        const room = rooms.get(roomId.toUpperCase());
        
        if (!room) {
            socket.emit('error', { message: 'Phòng không tồn tại!' });
            return;
        }
        
        if (room.isFull()) {
            socket.emit('error', { message: 'Phòng đã đầy!' });
            return;
        }
        
        const playerNumber = room.addPlayer(socket.id, playerName);
        playerSockets.set(socket.id, { roomId: room.roomId, playerNumber });
        
        socket.join(room.roomId);
        
        socket.emit('roomJoined', {
            roomId: room.roomId,
            playerNumber,
            playerName: room.playerNames[playerNumber],
            opponentName: room.playerNames[playerNumber === 1 ? 2 : 1]
        });
        
        // Notify other player
        const opponentSocketId = room.getOpponentSocketId(playerNumber);
        if (opponentSocketId) {
            io.to(opponentSocketId).emit('opponentJoined', {
                opponentName: room.playerNames[playerNumber]
            });
        }
        
        // Check if room is ready
        if (room.isFull()) {
            io.to(room.roomId).emit('roomReady', {
                player1Name: room.playerNames[1],
                player2Name: room.playerNames[2]
            });
        }
        
        console.log(`Player ${socket.id} joined room ${room.roomId} as P${playerNumber}`);
    });

    // Set player deck
    socket.on('setDeck', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) {
            console.warn('⚠️ setDeck: No player info found');
            return;
        }
        
        const room = rooms.get(playerInfo.roomId);
        if (!room) {
            console.warn('⚠️ setDeck: No room found');
            return;
        }
        
        console.log(`📥 Player ${playerInfo.playerNumber} set deck in room ${room.roomId}`);
        console.log(`📥 Deck data:`, data.deck);
        console.log(`📥 Deck keys count:`, data.deck ? Object.keys(data.deck).length : 0);
        
        room.setPlayerDeck(playerInfo.playerNumber, data.deck);
        console.log(`✅ Player ${playerInfo.playerNumber} deck saved. Room decks:`, {
            p1: room.playerDecks[1] ? Object.keys(room.playerDecks[1]).length + ' cards' : 'null',
            p2: room.playerDecks[2] ? Object.keys(room.playerDecks[2]).length + ' cards' : 'null'
        });
    });

    // Start game
    socket.on('startGame', () => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        
        const room = rooms.get(playerInfo.roomId);
        if (!room || !room.isFull()) {
            socket.emit('error', { message: 'Cần 2 người chơi để bắt đầu!' });
            return;
        }
        
        // Initialize game state
        room.gameState = createInitialGameState();
        
        // Create decks from player's selection
        console.log(`🎮 Creating deck for Player 1:`, room.playerDecks[1]);
        room.gameState.decks[1] = createDeckFromSelection(room.playerDecks[1]);
        console.log(`🎮 Player 1 deck size: ${room.gameState.decks[1].length}`);
        
        console.log(`🎮 Creating deck for Player 2:`, room.playerDecks[2]);
        room.gameState.decks[2] = createDeckFromSelection(room.playerDecks[2]);
        console.log(`🎮 Player 2 deck size: ${room.gameState.decks[2].length}`);
        
        // Draw initial hands
        room.gameState.hands[1] = drawCards(room.gameState.decks[1], 6);
        room.gameState.hands[2] = drawCards(room.gameState.decks[2], 6);

        // Decide first server randomly
        const firstServer = Math.random() < 0.5 ? 1 : 2;
        room.gameState.servingPlayer = firstServer;
        room.gameState.currentPlayer = firstServer;
        room.gameState.attackingPlayer = firstServer;
        room.gameState.phase = 'serve';
        room.gameStarted = true;
        
        // Send sanitized state to each player
        const socket1 = io.sockets.sockets.get(room.players[1]);
        const socket2 = io.sockets.sockets.get(room.players[2]);
        
        if (socket1) {
            socket1.emit('gameStarted', {
                state: sanitizeStateForPlayer(room.gameState, 1),
                playerNumber: 1,
                playerNames: room.playerNames
            });
        }
        if (socket2) {
            socket2.emit('gameStarted', {
                state: sanitizeStateForPlayer(room.gameState, 2),
                playerNumber: 2,
                playerNames: room.playerNames
            });
        }
        
        console.log(`Game started in room ${room.roomId}`);
    });

    // Chat message
    socket.on('chatMessage', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        
        const room = rooms.get(playerInfo.roomId);
        if (!room) return;
        
        io.to(room.roomId).emit('chatMessage', {
            playerNumber: playerInfo.playerNumber,
            playerName: room.playerNames[playerInfo.playerNumber],
            message: data.message
        });
    });

    // Log message (broadcast to all players in room)
    socket.on('logMessage', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        
        const room = rooms.get(playerInfo.roomId);
        if (!room || !room.gameStarted) return;
        
        io.to(room.roomId).emit('logMessage', {
            message: data.message,
            type: data.type || 'log'
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        const playerInfo = playerSockets.get(socket.id);
        if (playerInfo) {
            const room = rooms.get(playerInfo.roomId);
            if (room) {
                const removedPlayer = room.removePlayer(socket.id);
                
                // Notify other player
                const opponentSocketId = room.getOpponentSocketId(removedPlayer);
                if (opponentSocketId) {
                    io.to(opponentSocketId).emit('opponentDisconnected', {
                        message: 'Đối thủ đã rời phòng!'
                    });
                }
                
                // Remove empty rooms
                if (room.isEmpty()) {
                    rooms.delete(room.roomId);
                    console.log(`Room ${room.roomId} deleted (empty)`);
                }
            }
            playerSockets.delete(socket.id);
        }
        console.log(`Player disconnected: ${socket.id}`);
    });
});

// ============================================
// HELPER FUNCTIONS
// ============================================
function findAndRemoveCard(state, cardUniqueId) {
    let card = null;
    
    // Check hands
    [1, 2].forEach(p => {
        const idx = state.hands[p].findIndex(c => c.uniqueId === cardUniqueId);
        if (idx !== -1) {
            card = state.hands[p].splice(idx, 1)[0];
        }
    });
    if (card) return card;
    
    // Check played zones
    ['serve', 'receive', 'toss', 'attack'].forEach(zone => {
        [1, 2].forEach(p => {
            if (state.playedCards[p][zone] && state.playedCards[p][zone].uniqueId === cardUniqueId) {
                card = state.playedCards[p][zone];
                state.playedCards[p][zone] = null;
            }
        });
    });
    if (card) return card;
    
    // Check block arrays
    [1, 2].forEach(p => {
        const idx = state.playedCards[p].block.findIndex(c => c.uniqueId === cardUniqueId);
        if (idx !== -1) {
            card = state.playedCards[p].block.splice(idx, 1)[0];
        }
    });
    if (card) return card;
    
    // Check spirit zones
    ['serve', 'receive', 'toss', 'attack', 'block'].forEach(zone => {
        [1, 2].forEach(p => {
            const idx = state.spiritCards[p][zone].findIndex(c => c.uniqueId === cardUniqueId);
            if (idx !== -1) {
                card = state.spiritCards[p][zone].splice(idx, 1)[0];
            }
        });
    });
    if (card) return card;
    
    // Check action area
    [1, 2].forEach(p => {
        const idx = state.actionCards[p].findIndex(c => c.uniqueId === cardUniqueId);
        if (idx !== -1) {
            card = state.actionCards[p].splice(idx, 1)[0];
        }
    });
    if (card) return card;
    
    // Check discards
    [1, 2].forEach(p => {
        const idx = state.discards[p].findIndex(c => c.uniqueId === cardUniqueId);
        if (idx !== -1) {
            card = state.discards[p].splice(idx, 1)[0];
        }
    });
    if (card) return card;
    
    // Check decks
    [1, 2].forEach(p => {
        const idx = state.decks[p].findIndex(c => c.uniqueId === cardUniqueId);
        if (idx !== -1) {
            card = state.decks[p].splice(idx, 1)[0];
        }
    });
    
    return card;
}

function broadcastGameState(room) {
    const socket1 = io.sockets.sockets.get(room.players[1]);
    const socket2 = io.sockets.sockets.get(room.players[2]);
    
    if (socket1) {
        socket1.emit('gameStateUpdate', {
            state: sanitizeStateForPlayer(room.gameState, 1)
        });
    }
    if (socket2) {
        socket2.emit('gameStateUpdate', {
            state: sanitizeStateForPlayer(room.gameState, 2)
        });
    }
}

// ============================================
// CLEANUP OLD ROOMS
// ============================================
setInterval(() => {
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours
    
    for (const [roomId, room] of rooms.entries()) {
        if (now - room.createdAt > maxAge && !room.gameStarted) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (expired)`);
        }
    }
}, 30 * 60 * 1000);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🏐 Haikyuu Card Game SANDBOX Server running on port ${PORT}`);
    console.log(`   Open http://localhost:${PORT} to play`);
});
