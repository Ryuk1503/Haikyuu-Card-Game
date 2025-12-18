// ============================================
// ONLINE GAME MANAGER - SANDBOX MODE
// ============================================

class OnlineGameManager {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.playerNumber = null;
        this.playerName = 'Player';
        this.isConnected = false;
        this.gameInstance = null;
        
        // Deck management
        this.selectedDeck = 'default';
        this.customDeck = [];
        this.savedDecks = this.loadSavedDecks();
        
        this.initSocket();
        this.initElements();
        this.bindEvents();
        this.initDeckBuilder();
    }
    
    initSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.updateLobbyInfo('Đã kết nối! Tạo phòng hoặc nhập mã để tham gia.');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            this.updateLobbyInfo('Mất kết nối! Đang thử kết nối lại...');
        });
        
        this.socket.on('error', (data) => {
            this.showError(data.message);
        });
        
        // Room events
        this.socket.on('roomCreated', (data) => this.onRoomCreated(data));
        this.socket.on('roomJoined', (data) => this.onRoomJoined(data));
        this.socket.on('opponentJoined', (data) => this.onOpponentJoined(data));
        this.socket.on('roomReady', (data) => this.onRoomReady(data));
        this.socket.on('opponentDisconnected', (data) => this.onOpponentDisconnected(data));
        
        // Game events
        this.socket.on('gameStarted', (data) => this.onGameStarted(data));
        this.socket.on('gameStateUpdate', (data) => this.onGameStateUpdate(data));
        this.socket.on('chatMessage', (data) => this.onChatMessage(data));
    }
    
    initElements() {
        // Name input
        this.playerNameInput = document.getElementById('player-name-input');
        
        // Room actions
        this.roomActionsEl = document.getElementById('room-actions');
        this.btnCreateRoom = document.getElementById('btn-create-room');
        this.roomCodeInput = document.getElementById('room-code-input');
        this.btnJoinRoom = document.getElementById('btn-join-room');
        
        // Deck selection
        this.deckSelect = document.getElementById('deck-select');
        this.btnBuildDeck = document.getElementById('btn-build-deck');
        this.deckInfo = document.getElementById('deck-info');
        this.deckSelectionSection = document.getElementById('deck-selection-section');
        
        // Deck builder modal
        this.deckBuilderModal = document.getElementById('deck-builder-modal');
        this.collectionCards = document.getElementById('collection-cards');
        this.deckCards = document.getElementById('deck-cards');
        this.deckCardCount = document.getElementById('deck-card-count');
        this.filterSchool = document.getElementById('filter-school');
        this.deckNameInput = document.getElementById('deck-name-input');
        this.btnCancelDeck = document.getElementById('btn-cancel-deck');
        this.btnSaveDeck = document.getElementById('btn-save-deck');
        
        // Waiting room
        this.waitingRoomEl = document.getElementById('waiting-room');
        this.roomCodeDisplay = document.getElementById('room-code-display');
        this.btnCopyCode = document.getElementById('btn-copy-code');
        this.slotP1Name = document.getElementById('slot-p1-name');
        this.slotP2Name = document.getElementById('slot-p2-name');
        this.statusP1 = document.getElementById('status-p1');
        this.statusP2 = document.getElementById('status-p2');
        this.btnStartGame = document.getElementById('btn-start-game');
        
        // Info
        this.lobbyInfo = document.getElementById('lobby-info');
        this.nameInputSection = document.getElementById('name-input-section');
        
        // Screens
        this.lobbyScreen = document.getElementById('lobby-screen');
        this.gameScreen = document.getElementById('game-screen');
    }
    
    bindEvents() {
        if (this.btnCreateRoom) {
            this.btnCreateRoom.addEventListener('click', () => this.createRoom());
        }
        if (this.btnJoinRoom) {
            this.btnJoinRoom.addEventListener('click', () => this.joinRoom());
        }
        if (this.btnCopyCode) {
            this.btnCopyCode.addEventListener('click', () => this.copyRoomCode());
        }
        if (this.btnStartGame) {
            this.btnStartGame.addEventListener('click', () => this.startGame());
        }
        
        // Enter key for room code
        if (this.roomCodeInput) {
            this.roomCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.joinRoom();
            });
        }
        
        // Enter key for name
        if (this.playerNameInput) {
            this.playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.playerNameInput.blur();
                }
            });
        }
        
        // Deck selection
        if (this.deckSelect) {
            this.deckSelect.addEventListener('change', (e) => this.onDeckChange(e.target.value));
        }
        if (this.btnBuildDeck) {
            this.btnBuildDeck.addEventListener('click', () => this.openDeckBuilder());
        }
    }
    
    // ============================================
    // ROOM MANAGEMENT
    // ============================================
    
    createRoom() {
        if (!this.isConnected) {
            this.showError('Chưa kết nối đến server!');
            return;
        }
        
        this.playerName = this.playerNameInput?.value.trim() || 'Player';
        this.socket.emit('createRoom', { playerName: this.playerName });
    }
    
    joinRoom() {
        if (!this.isConnected) {
            this.showError('Chưa kết nối đến server!');
            return;
        }
        
        const roomCode = this.roomCodeInput?.value.trim().toUpperCase();
        if (!roomCode || roomCode.length < 4) {
            this.showError('Mã phòng không hợp lệ!');
            return;
        }
        
        this.playerName = this.playerNameInput?.value.trim() || 'Player';
        this.socket.emit('joinRoom', { roomId: roomCode, playerName: this.playerName });
    }
    
    copyRoomCode() {
        if (this.roomId) {
            navigator.clipboard.writeText(this.roomId).then(() => {
                if (this.btnCopyCode) {
                    this.btnCopyCode.textContent = '✓ Đã copy!';
                    setTimeout(() => {
                        this.btnCopyCode.textContent = '📋 Copy';
                    }, 2000);
                }
            });
        }
    }
    
    sendDeckSelection() {
        const deck = this.getCurrentDeck();
        this.socket.emit('setDeck', { deck: deck });
        console.log('Sent deck selection');
    }
    
    startGame() {
        this.sendDeckSelection();
        this.socket.emit('startGame');
    }
    
    // ============================================
    // SOCKET EVENT HANDLERS
    // ============================================
    
    onRoomCreated(data) {
        this.roomId = data.roomId;
        this.playerNumber = data.playerNumber;
        
        this.sendDeckSelection();
        
        // Show waiting room
        if (this.roomActionsEl) this.roomActionsEl.classList.add('hidden');
        if (this.nameInputSection) this.nameInputSection.classList.add('hidden');
        if (this.waitingRoomEl) this.waitingRoomEl.classList.remove('hidden');
        
        if (this.roomCodeDisplay) this.roomCodeDisplay.textContent = this.roomId;
        if (this.slotP1Name) this.slotP1Name.textContent = data.playerName;
        if (this.statusP1) this.statusP1.textContent = '✓ Đã vào';
        document.getElementById('slot-p1')?.classList.add('joined');
        
        this.updateLobbyInfo('Đang chờ đối thủ... Chia sẻ mã phòng cho bạn bè!');
    }
    
    onRoomJoined(data) {
        this.roomId = data.roomId;
        this.playerNumber = data.playerNumber;
        
        this.sendDeckSelection();
        
        // Show waiting room
        if (this.roomActionsEl) this.roomActionsEl.classList.add('hidden');
        if (this.nameInputSection) this.nameInputSection.classList.add('hidden');
        if (this.waitingRoomEl) this.waitingRoomEl.classList.remove('hidden');
        
        if (this.roomCodeDisplay) this.roomCodeDisplay.textContent = this.roomId;
        
        if (this.playerNumber === 2) {
            if (this.slotP1Name) this.slotP1Name.textContent = data.opponentName;
            if (this.statusP1) this.statusP1.textContent = '✓ Đã vào';
            document.getElementById('slot-p1')?.classList.add('joined');
            
            if (this.slotP2Name) this.slotP2Name.textContent = data.playerName;
            if (this.statusP2) this.statusP2.textContent = '✓ Đã vào';
            document.getElementById('slot-p2')?.classList.add('joined');
        }
        
        this.updateLobbyInfo('Đã vào phòng! Đang chờ bắt đầu...');
    }
    
    onOpponentJoined(data) {
        if (this.slotP2Name) this.slotP2Name.textContent = data.opponentName;
        if (this.statusP2) this.statusP2.textContent = '✓ Đã vào';
        document.getElementById('slot-p2')?.classList.add('joined');
        
        this.updateLobbyInfo('Đối thủ đã vào! Sẵn sàng bắt đầu.');
    }
    
    onRoomReady(data) {
        if (this.slotP1Name) this.slotP1Name.textContent = data.player1Name;
        if (this.slotP2Name) this.slotP2Name.textContent = data.player2Name;
        document.getElementById('slot-p1')?.classList.add('joined');
        document.getElementById('slot-p2')?.classList.add('joined');
        if (this.statusP1) this.statusP1.textContent = '✓ Đã vào';
        if (this.statusP2) this.statusP2.textContent = '✓ Đã vào';
        
        // Only player 1 can start
        if (this.playerNumber === 1) {
            if (this.btnStartGame) this.btnStartGame.disabled = false;
            this.updateLobbyInfo('Sẵn sàng! Nhấn "Bắt đầu trận đấu" để chơi.');
        } else {
            this.updateLobbyInfo('Sẵn sàng! Đợi Player 1 bắt đầu trận đấu.');
        }
    }
    
    onOpponentDisconnected(data) {
        this.showError(data.message);
        
        // Reset slot
        if (this.playerNumber === 1) {
            if (this.slotP2Name) this.slotP2Name.textContent = 'Đang chờ...';
            if (this.statusP2) this.statusP2.textContent = '';
            document.getElementById('slot-p2')?.classList.remove('joined');
        } else {
            if (this.slotP1Name) this.slotP1Name.textContent = 'Đang chờ...';
            if (this.statusP1) this.statusP1.textContent = '';
            document.getElementById('slot-p1')?.classList.remove('joined');
        }
        
        if (this.btnStartGame) this.btnStartGame.disabled = true;
        this.updateLobbyInfo('Đối thủ đã rời phòng. Đang chờ người chơi mới...');
    }
    
    onGameStarted(data) {
        console.log('Game started!', data);
        
        // Hide lobby, show game
        if (this.lobbyScreen) this.lobbyScreen.classList.add('hidden');
        if (this.gameScreen) this.gameScreen.classList.remove('hidden');
        
        // Initialize game with online state
        if (window.game) {
            window.game.initOnlineGame(data.state, data.playerNumber, data.playerNames, this);
        }
    }
    
    onGameStateUpdate(data) {
        if (window.game && window.game.isOnline) {
            window.game.updateFromServer(data.state);
        }
    }
    
    onChatMessage(data) {
        console.log(`[Chat] ${data.playerName}: ${data.message}`);
    }
    
    // ============================================
    // DECK BUILDER
    // ============================================
    
    getCardDatabase() {
        return [
            { id: 1, name: "Hinata Shoyo", cardId: "hinata-shouyo-1", school: "Karasuno", serve: 2, receive: 0, toss: 0, attack: 3, block: 2, artwork: "Card/HV10/hinata-shouyo-1.png" },
            { id: 21, name: "Hinata Shoyo", cardId: "hinata-shouyo-2", school: "Karasuno", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, artwork: "Card/HV10/hinata-shouyo-2.png" },
            { id: 22, name: "Kageyama Tobio", cardId: "kageyama-tobio-1", school: "Karasuno", serve: 1, receive: 0, toss: 1, attack: 3, block: 0, artwork: "Card/HV10/kageyama-tobio-1.png" },
            { id: 23, name: "Kageyama Tobio", cardId: "kageyama-tobio-2", school: "Karasuno", serve: 1, receive: 0, toss: 1, attack: 2, block: 2, artwork: "Card/HV10/kageyama-tobio-2.png" },
            { id: 24, name: "Sawamura Daichi", cardId: "sawamura-daichi-1", school: "Karasuno", serve: 2, receive: 4, toss: 0, attack: 0, block: 0, artwork: "Card/HV10/sawamura-daichi-1.png" },
            { id: 25, name: "Sugawara Koshi", cardId: "sugawara-koshi-1", school: "Karasuno", serve: 2, receive: 2, toss: 1, attack: 0, block: 1, artwork: "Card/HV10/sugawara-koshi-1.png" },
            { id: 26, name: "Tanaka Ryunosuke", cardId: "tanaka-ryunosuke-1", school: "Karasuno", serve: 1, receive: 3, toss: 0, attack: 3, block: 1, artwork: "Card/HV10/tanaka-ryunosuke-1.png" },
            { id: 27, name: "Tsukishima Kei", cardId: "tsukishima-kei-1", school: "Karasuno", serve: 1, receive: 2, toss: 0, attack: 2, block: 3, artwork: "Card/HV10/tsukishima-kei-1.png" },
            { id: 28, name: "Tsukishima Kei", cardId: "tsukishima-kei-2", school: "Karasuno", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, artwork: "Card/HV10/tsukishima-kei-2.png" },
            { id: 29, name: "Yamaguchi Tadashi", cardId: "yamaguchi-tadashi-1", school: "Karasuno", serve: 3, receive: 4, toss: 0, attack: 0, block: 0, artwork: "Card/HV10/yamaguchi-tadashi-1.png" },
            { id: 30, name: "Nishinoya Yu", cardId: "nishinoya-yu-1", school: "Karasuno", serve: 0, receive: 4, toss: 0, attack: 0, block: 0, artwork: "Card/HV10/nishinoya-yu-1.png" },
            { id: 31, name: "Nishinoya Yu", cardId: "nishinoya-yu-2", school: "Karasuno", serve: 0, receive: 6, toss: 0, attack: 0, block: 0, artwork: "Card/HV10/nishinoya-yu-2.png" },
            { id: 32, name: "Azumane Asahi", cardId: "azumane-asahi-1", school: "Karasuno", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, artwork: "Card/HV10/azumane-asahi-1.png" },
            { id: 33, name: "Ushijima Wakatoshi", cardId: "ushijima-wakatoshi-1", school: "Shiratorizawa", serve: 3, receive: 0, toss: 0, attack: 3, block: 0, artwork: "Card/HV10/ushijima-wakatoshi-1.png" },
            { id: 34, name: "Ushijima Wakatoshi", cardId: "ushijima-wakatoshi-2", school: "Shiratorizawa", serve: 4, receive: 0, toss: 0, attack: 3, block: 0, artwork: "Card/HV10/ushijima-wakatoshi-2.png" }
        ];
    }
    
    getPresetDecks() {
        return {
            'default': {
                name: 'Deck Karasuno',
                cards: [
                    { cardId: 'hinata-shouyo-1', count: 4 },
                    { cardId: 'hinata-shouyo-2', count: 4 },
                    { cardId: 'kageyama-tobio-1', count: 4 },
                    { cardId: 'kageyama-tobio-2', count: 4 },
                    { cardId: 'sawamura-daichi-1', count: 4 },
                    { cardId: 'sugawara-koshi-1', count: 4 },
                    { cardId: 'tanaka-ryunosuke-1', count: 4 },
                    { cardId: 'tsukishima-kei-1', count: 4 },
                    { cardId: 'yamaguchi-tadashi-1', count: 4 },
                    { cardId: 'nishinoya-yu-1', count: 4 }
                ]
            },
            'shiratorizawa': {
                name: 'Deck Shiratorizawa',
                cards: [
                    { cardId: 'ushijima-wakatoshi-1', count: 4 },
                    { cardId: 'ushijima-wakatoshi-2', count: 4 },
                    { cardId: 'hinata-shouyo-1', count: 4 },
                    { cardId: 'kageyama-tobio-1', count: 4 },
                    { cardId: 'sawamura-daichi-1', count: 4 },
                    { cardId: 'sugawara-koshi-1', count: 4 },
                    { cardId: 'tanaka-ryunosuke-1', count: 4 },
                    { cardId: 'tsukishima-kei-1', count: 4 },
                    { cardId: 'yamaguchi-tadashi-1', count: 4 },
                    { cardId: 'nishinoya-yu-1', count: 4 }
                ]
            }
        };
    }
    
    initDeckBuilder() {
        this.buildingDeck = {};
        
        if (this.filterSchool) {
            this.filterSchool.addEventListener('change', () => this.renderCollectionCards());
        }
        if (this.btnCancelDeck) {
            this.btnCancelDeck.addEventListener('click', () => this.closeDeckBuilder());
        }
        if (this.btnSaveDeck) {
            this.btnSaveDeck.addEventListener('click', () => this.saveDeck());
        }
    }
    
    loadSavedDecks() {
        try {
            const saved = localStorage.getItem('haikyuu_decks');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }
    
    saveDecksToStorage() {
        localStorage.setItem('haikyuu_decks', JSON.stringify(this.savedDecks));
    }
    
    onDeckChange(deckId) {
        this.selectedDeck = deckId;
        
        if (deckId === 'custom') {
            this.openDeckBuilder();
        } else {
            const presets = this.getPresetDecks();
            if (presets[deckId]) {
                this.updateDeckInfo(presets[deckId].name, 40);
            }
        }
    }
    
    updateDeckInfo(name, count) {
        if (this.deckInfo) {
            this.deckInfo.textContent = `${count} lá | ${name}`;
        }
    }
    
    openDeckBuilder() {
        if (!this.deckBuilderModal) return;
        
        this.buildingDeck = {};
        
        this.renderCollectionCards();
        this.renderDeckCards();
        this.updateDeckCount();
        
        this.deckBuilderModal.classList.add('show');
    }
    
    closeDeckBuilder() {
        if (this.deckBuilderModal) {
            this.deckBuilderModal.classList.remove('show');
        }
        
        if (this.deckSelect && this.selectedDeck === 'custom') {
            this.deckSelect.value = 'default';
            this.selectedDeck = 'default';
        }
    }
    
    renderCollectionCards() {
        if (!this.collectionCards) return;
        
        const filter = this.filterSchool ? this.filterSchool.value : 'all';
        const cards = this.getCardDatabase();
        
        this.collectionCards.innerHTML = '';
        
        cards.forEach(card => {
            if (filter !== 'all' && card.school !== filter) return;
            
            const count = this.buildingDeck[card.cardId] || 0;
            const item = this.createDeckCardItem(card, count);
            this.collectionCards.appendChild(item);
        });
    }
    
    renderDeckCards() {
        if (!this.deckCards) return;
        
        const cards = this.getCardDatabase();
        this.deckCards.innerHTML = '';
        
        Object.entries(this.buildingDeck).forEach(([cardId, count]) => {
            if (count <= 0) return;
            
            const card = cards.find(c => c.cardId === cardId);
            if (card) {
                const item = this.createDeckCardItem(card, count);
                this.deckCards.appendChild(item);
            }
        });
        
        if (Object.keys(this.buildingDeck).length === 0 || 
            Object.values(this.buildingDeck).every(c => c <= 0)) {
            this.deckCards.innerHTML = '<div class="empty-deck-message">Chưa có thẻ nào. Nhấn + để thêm thẻ!</div>';
        }
    }
    
    createDeckCardItem(card, count) {
        const item = document.createElement('div');
        item.className = 'deck-card-item' + (count > 0 ? ' in-deck' : '');
        
        item.innerHTML = `
            <div class="card-mini">
                ${card.artwork ? `<img src="${card.artwork}" alt="${card.name}">` : `<div class="card-placeholder">🏐</div>`}
            </div>
            <div class="card-info">
                <div class="name">${card.name}</div>
                <div class="school">${card.school}</div>
                <div class="stats">G:${card.serve} Đ:${card.receive} C:${card.toss} T:${card.attack} B:${card.block}</div>
            </div>
            <div class="count-controls">
                <button class="btn-minus" ${count <= 0 ? 'disabled' : ''}>-</button>
                <span class="count">${count}</span>
                <button class="btn-plus" ${count >= 4 ? 'disabled' : ''}>+</button>
            </div>
        `;
        
        const btnMinus = item.querySelector('.btn-minus');
        const btnPlus = item.querySelector('.btn-plus');
        
        btnMinus.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeCardCount(card.cardId, -1);
        });
        
        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeCardCount(card.cardId, 1);
        });
        
        return item;
    }
    
    changeCardCount(cardId, delta) {
        const current = this.buildingDeck[cardId] || 0;
        const newCount = Math.max(0, Math.min(4, current + delta));
        
        const total = this.getTotalDeckCount();
        if (delta > 0 && total >= 40) {
            this.showError('Deck đã đủ 40 lá!');
            return;
        }
        
        this.buildingDeck[cardId] = newCount;
        
        this.renderCollectionCards();
        this.renderDeckCards();
        this.updateDeckCount();
    }
    
    getTotalDeckCount() {
        return Object.values(this.buildingDeck).reduce((sum, count) => sum + count, 0);
    }
    
    updateDeckCount() {
        const total = this.getTotalDeckCount();
        
        if (this.deckCardCount) {
            this.deckCardCount.textContent = total;
            this.deckCardCount.style.color = total === 40 ? '#2ecc71' : (total > 40 ? '#e74c3c' : '#ffd700');
        }
        
        if (this.btnSaveDeck) {
            this.btnSaveDeck.disabled = total !== 40;
        }
    }
    
    saveDeck() {
        const total = this.getTotalDeckCount();
        if (total !== 40) {
            this.showError('Deck phải có đúng 40 lá!');
            return;
        }
        
        const deckName = this.deckNameInput ? this.deckNameInput.value.trim() : '';
        if (!deckName) {
            this.showError('Vui lòng nhập tên deck!');
            return;
        }
        
        const deckId = 'custom_' + Date.now();
        this.savedDecks[deckId] = {
            name: deckName,
            cards: { ...this.buildingDeck }
        };
        this.saveDecksToStorage();
        
        if (this.deckSelect) {
            const option = document.createElement('option');
            option.value = deckId;
            option.textContent = deckName;
            this.deckSelect.insertBefore(option, this.deckSelect.querySelector('option[value="custom"]'));
            this.deckSelect.value = deckId;
        }
        
        this.selectedDeck = deckId;
        this.customDeck = { ...this.buildingDeck };
        this.updateDeckInfo(deckName, 40);
        
        this.closeDeckBuilder();
        this.showSuccess('Đã lưu deck thành công!');
    }
    
    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = '✓ ' + message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
    
    getCurrentDeck() {
        if (this.selectedDeck.startsWith('custom_') && this.savedDecks[this.selectedDeck]) {
            return this.savedDecks[this.selectedDeck].cards;
        }
        
        const presets = this.getPresetDecks();
        if (presets[this.selectedDeck]) {
            const deck = {};
            presets[this.selectedDeck].cards.forEach(c => {
                deck[c.cardId] = c.count;
            });
            return deck;
        }
        
        return null;
    }
    
    // ============================================
    // UI HELPERS
    // ============================================
    
    updateLobbyInfo(message) {
        if (this.lobbyInfo) {
            this.lobbyInfo.textContent = message;
        }
    }
    
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = '⚠️ ' + message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
}

// Initialize online manager
window.onlineManager = null;
document.addEventListener('DOMContentLoaded', () => {
    window.onlineManager = new OnlineGameManager();
});
