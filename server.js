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
app.post('/api/register', (req, res) => {
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
    
    const result = db.createUser(username, password, displayName);
    res.json(result);
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username và password là bắt buộc' });
    }
    
    const result = db.loginUser(username, password);
    res.json(result);
});

// Validate session (for remember me)
app.post('/api/validate-session', (req, res) => {
    const { sessionToken } = req.body;
    const user = db.validateSession(sessionToken);
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    const { userId } = req.body;
    const result = db.logoutUser(userId);
    res.json(result);
});

// ============================================
// DECK ROUTES
// ============================================

// Save deck
app.post('/api/decks', (req, res) => {
    const { sessionToken, deckName, cards } = req.body;
    const user = db.validateSession(sessionToken);
    
    if (!user) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
    }
    
    const result = db.saveDeck(user.id, deckName, cards);
    res.json(result);
});

// Get user's decks
app.get('/api/decks', (req, res) => {
    const sessionToken = req.headers['x-session-token'];
    const user = db.validateSession(sessionToken);
    
    if (!user) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
    }
    
    const decks = db.getUserDecks(user.id);
    res.json({ success: true, decks });
});

// Delete deck
app.delete('/api/decks/:id', (req, res) => {
    const sessionToken = req.headers['x-session-token'];
    const user = db.validateSession(sessionToken);
    
    if (!user) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
    }
    
    const result = db.deleteDeck(user.id, parseInt(req.params.id));
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
    // SHIRATORIZAWA - HÀNH ĐỘNG
    { id: 100, name: "Chuyền hết bóng cho anh.", cardId: "chuyen-het-bong-cho-anh", school: "Shiratorizawa", type: "action", phases: ["toss", "attack"], spiritCost: 3, serve: 0, receive: 0, toss: 0, attack: 0, block: 0, artwork: "Card/Shiratorizawa/Hanh dong/chuyen-het-bong-cho-anh.png" }
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
        return createDeck();
    }
    
    const deck = [];
    
    Object.entries(deckData).forEach(([cardId, count]) => {
        const cardData = CARD_DATABASE.find(c => c.cardId === cardId);
        if (cardData && count > 0) {
            for (let i = 0; i < count; i++) {
                deck.push({
                    ...cardData,
                    uniqueId: uuidv4()
                });
            }
        }
    });
    
    while (deck.length < 40) {
        const randomCard = CARD_DATABASE[Math.floor(Math.random() * CARD_DATABASE.length)];
        deck.push({
            ...randomCard,
            uniqueId: uuidv4()
        });
    }
    
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
            case 'spirit':
                state.spiritCards[p][targetZone].push(card);
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
        if (!playerInfo) return;
        
        const room = rooms.get(playerInfo.roomId);
        if (!room) return;
        
        room.setPlayerDeck(playerInfo.playerNumber, data.deck);
        console.log(`Player ${playerInfo.playerNumber} set deck in room ${room.roomId}`);
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
        room.gameState.decks[1] = createDeckFromSelection(room.playerDecks[1]);
        room.gameState.decks[2] = createDeckFromSelection(room.playerDecks[2]);
        
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
