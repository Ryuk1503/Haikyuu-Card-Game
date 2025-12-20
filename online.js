// ============================================
// ONLINE GAME MANAGER - SANDBOX MODE WITH AUTH
// ============================================

class OnlineGameManager {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.playerNumber = null;
        this.playerName = 'Player';
        this.isConnected = false;
        this.gameInstance = null;
        
        // Auth state
        this.currentUser = null;
        this.sessionToken = null;
        
        // Deck management
        this.selectedDeck = null;
        this.customDeck = [];
        this.savedDecks = [];
        
        this.initElements();
        this.bindEvents();
        this.initDeckBuilder();
        this.checkSavedSession();
    }
    
    // ============================================
    // AUTHENTICATION
    // ============================================
    
    async checkSavedSession() {
        const savedToken = localStorage.getItem('haikyuu_session');
        if (savedToken) {
            try {
                const response = await fetch('/api/validate-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionToken: savedToken })
                });
                const result = await response.json();
                
                if (result.success) {
                    this.currentUser = result.user;
                    this.sessionToken = savedToken;
                    this.playerName = result.user.displayName || result.user.username;
                    this.showLobby();
                    this.loadUserDecks();
                    return;
                }
            } catch (error) {
                console.error('Session validation error:', error);
            }
            // Clear invalid session
            localStorage.removeItem('haikyuu_session');
        }
        // Show login screen
        this.showLoginScreen();
    }
    
    async login() {
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        const rememberMe = document.getElementById('remember-me')?.checked;
        const errorEl = document.getElementById('login-error');
        
        if (!username || !password) {
            this.showAuthError(errorEl, 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.user;
                this.sessionToken = result.user.sessionToken;
                this.playerName = result.user.displayName || result.user.username;
                
                if (rememberMe) {
                    localStorage.setItem('haikyuu_session', this.sessionToken);
                }
                
                this.showLobby();
                this.loadUserDecks();
            } else {
                this.showAuthError(errorEl, result.error);
            }
        } catch (error) {
            this.showAuthError(errorEl, 'Lỗi kết nối server');
        }
    }
    
    async register() {
        const username = document.getElementById('register-username')?.value.trim();
        const displayName = document.getElementById('register-displayname')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const passwordConfirm = document.getElementById('register-password-confirm')?.value;
        const errorEl = document.getElementById('register-error');
        
        if (!username || !password) {
            this.showAuthError(errorEl, 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        
        if (password !== passwordConfirm) {
            this.showAuthError(errorEl, 'Mật khẩu xác nhận không khớp');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, displayName })
            });
            const result = await response.json();
            
            if (result.success) {
                // Auto login after register
                document.getElementById('login-username').value = username;
                document.getElementById('login-password').value = password;
                this.showLoginForm();
                this.showSuccess('Đăng ký thành công! Đang đăng nhập...');
                setTimeout(() => this.login(), 500);
            } else {
                this.showAuthError(errorEl, result.error);
            }
        } catch (error) {
            this.showAuthError(errorEl, 'Lỗi kết nối server');
        }
    }
    
    logout() {
        if (this.currentUser) {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.currentUser.id })
            }).catch(() => {});
        }
        
        localStorage.removeItem('haikyuu_session');
        this.currentUser = null;
        this.sessionToken = null;
        
        // Disconnect socket if connected
        if (this.socket) {
            this.socket.disconnect();
        }
        
        this.showLoginScreen();
    }
    
    showAuthError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
        }
    }
    
    showLoginScreen() {
        document.getElementById('login-screen')?.classList.remove('hidden');
        document.getElementById('lobby-screen')?.classList.add('hidden');
    }
    
    showLobby() {
        document.getElementById('login-screen')?.classList.add('hidden');
        document.getElementById('lobby-screen')?.classList.remove('hidden');
        
        const userNameEl = document.getElementById('logged-user-name');
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.currentUser.displayName || this.currentUser.username;
        }
        
        // Initialize socket after login
        this.initSocket();
    }
    
    showLoginForm() {
        document.getElementById('login-form')?.classList.remove('hidden');
        document.getElementById('register-form')?.classList.add('hidden');
        document.getElementById('login-error')?.classList.add('hidden');
    }
    
    showRegisterForm() {
        document.getElementById('login-form')?.classList.add('hidden');
        document.getElementById('register-form')?.classList.remove('hidden');
        document.getElementById('register-error')?.classList.add('hidden');
    }
    
    // ============================================
    // SOCKET CONNECTION
    // ============================================
    
    initSocket() {
        if (this.socket) return;
        
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.updateLobbyInfo('Đã kết nối! Tạo phòng hoặc chọn từ danh sách.');
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
        this.socket.on('logMessage', (data) => this.onLogMessage(data));
    }
    
    initElements() {
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
        this.filterType = document.getElementById('filter-type');
        this.filterSearch = document.getElementById('filter-search');
        this.deckNameSelect = document.getElementById('deck-name-select');
        this.btnCancelDeck = document.getElementById('btn-cancel-deck');
        this.btnSaveDeck = document.getElementById('btn-save-deck');
        this.btnDeleteDeck = document.getElementById('btn-delete-deck');
        this.savedDecksList = document.getElementById('saved-decks-list');
        
        // Room elements
        this.roomActionsEl = document.getElementById('room-actions');
        this.btnCreateRoom = document.getElementById('btn-create-room');
        this.btnShowRooms = document.getElementById('btn-show-rooms');
        this.roomListSection = document.getElementById('room-list-section');
        this.roomList = document.getElementById('room-list');
        this.btnRefreshRooms = document.getElementById('btn-refresh-rooms');
        
        // Waiting room
        this.waitingRoomEl = document.getElementById('waiting-room');
        this.roomCodeDisplay = document.getElementById('room-code-display');
        this.btnCopyCode = document.getElementById('btn-copy-code');
        this.slotP1Name = document.getElementById('slot-p1-name');
        this.slotP2Name = document.getElementById('slot-p2-name');
        this.statusP1 = document.getElementById('status-p1');
        this.statusP2 = document.getElementById('status-p2');
        this.btnStartGame = document.getElementById('btn-start-game');
        this.btnLeaveRoom = document.getElementById('btn-leave-room');
        
        // Info
        this.lobbyInfo = document.getElementById('lobby-info');
        
        // Screens
        this.loginScreen = document.getElementById('login-screen');
        this.lobbyScreen = document.getElementById('lobby-screen');
        this.gameScreen = document.getElementById('game-screen');
    }
    
    bindEvents() {
        // Auth events
        document.getElementById('btn-login')?.addEventListener('click', () => this.login());
        document.getElementById('btn-register')?.addEventListener('click', () => this.register());
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
        document.getElementById('btn-logout')?.addEventListener('click', () => this.logout());
        
        // Enter key for login
        document.getElementById('login-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('register-password-confirm')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
        
        // Room events
        if (this.btnCreateRoom) {
            this.btnCreateRoom.addEventListener('click', () => this.createRoom());
        }
        if (this.btnShowRooms) {
            this.btnShowRooms.addEventListener('click', () => this.toggleRoomList());
        }
        if (this.btnRefreshRooms) {
            this.btnRefreshRooms.addEventListener('click', () => this.refreshRoomList());
        }
        if (this.btnCopyCode) {
            this.btnCopyCode.addEventListener('click', () => this.copyRoomCode());
        }
        if (this.btnStartGame) {
            this.btnStartGame.addEventListener('click', () => this.startGame());
        }
        if (this.btnLeaveRoom) {
            this.btnLeaveRoom.addEventListener('click', () => this.leaveRoom());
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
    // ROOM LISTING
    // ============================================
    
    async toggleRoomList() {
        if (this.roomListSection?.classList.contains('hidden')) {
            this.roomListSection.classList.remove('hidden');
            await this.refreshRoomList();
        } else {
            this.roomListSection?.classList.add('hidden');
        }
    }
    
    async refreshRoomList() {
        if (!this.roomList) return;
        
        this.roomList.innerHTML = '<div class="room-list-loading">Đang tải...</div>';
        
        try {
            const response = await fetch('/api/rooms');
            const result = await response.json();
            
            if (result.success && result.rooms.length > 0) {
                this.roomList.innerHTML = '';
                result.rooms.forEach(room => {
                    const item = document.createElement('div');
                    item.className = 'room-list-item';
                    item.innerHTML = `
                        <div class="room-item-info">
                            <div class="room-item-host">${room.hostName}</div>
                            <div class="room-item-id">#${room.roomId}</div>
                        </div>
                        <div class="room-item-players">${room.playerCount}/2</div>
                        <button class="btn-join-room-item" data-room="${room.roomId}">Vào</button>
                    `;
                    
                    item.querySelector('.btn-join-room-item').addEventListener('click', () => {
                        this.joinRoom(room.roomId);
                    });
                    
                    this.roomList.appendChild(item);
                });
            } else {
                this.roomList.innerHTML = '<div class="room-list-empty">Không có phòng nào đang chờ</div>';
            }
        } catch (error) {
            this.roomList.innerHTML = '<div class="room-list-empty">Lỗi tải danh sách phòng</div>';
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
        
        this.socket.emit('createRoom', { playerName: this.playerName });
    }
    
    joinRoom(roomCode) {
        if (!this.isConnected) {
            this.showError('Chưa kết nối đến server!');
            return;
        }
        
        if (!roomCode || roomCode.length < 4) {
            this.showError('Mã phòng không hợp lệ!');
            return;
        }
        
        this.socket.emit('joinRoom', { roomId: roomCode.toUpperCase(), playerName: this.playerName });
    }
    
    leaveRoom() {
        // Disconnect and reconnect to leave room
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        // Reset UI
        this.roomId = null;
        this.playerNumber = null;
        
        if (this.waitingRoomEl) this.waitingRoomEl.classList.add('hidden');
        if (this.roomActionsEl) this.roomActionsEl.classList.remove('hidden');
        if (this.roomListSection) this.roomListSection.classList.add('hidden');
        if (this.deckSelectionSection) this.deckSelectionSection.classList.remove('hidden');
        
        this.slotP1Name.textContent = 'Đang chờ...';
        this.slotP2Name.textContent = 'Đang chờ...';
        this.statusP1.textContent = '';
        this.statusP2.textContent = '';
        document.getElementById('slot-p1')?.classList.remove('joined');
        document.getElementById('slot-p2')?.classList.remove('joined');
        this.btnStartGame.disabled = true;
        
        // Reconnect
        this.initSocket();
        this.updateLobbyInfo('Đã rời phòng. Tạo phòng mới hoặc tham gia!');
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
        console.log('📤 Sending deck selection:', deck);
        console.log('📤 Selected deck ID:', this.selectedDeck);
        if (!deck || Object.keys(deck).length === 0) {
            console.warn('⚠️ No deck selected or deck is empty!');
        }
        this.socket.emit('setDeck', { deck: deck });
        console.log('✅ Sent deck selection');
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
        if (this.roomListSection) this.roomListSection.classList.add('hidden');
        if (this.deckSelectionSection) this.deckSelectionSection.classList.add('hidden');
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
        if (this.roomListSection) this.roomListSection.classList.add('hidden');
        if (this.deckSelectionSection) this.deckSelectionSection.classList.add('hidden');
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
        
        // Show first player dialog
        const startModal = document.getElementById('game-start-modal');
        const firstPlayerText = document.getElementById('first-player-text');
        const closeStartModalBtn = document.getElementById('btn-close-start-modal');
        
        if (startModal && firstPlayerText && data.state) {
            const firstPlayer = data.state.servingPlayer;
            const firstPlayerName = data.playerNames[firstPlayer] || `Player ${firstPlayer}`;
            firstPlayerText.textContent = `🎲 Người đi trước: ${firstPlayerName}`;
            startModal.classList.add('show');
            
            if (closeStartModalBtn) {
                closeStartModalBtn.onclick = () => {
                    startModal.classList.remove('show');
        // Hide lobby, show game
                    if (this.lobbyScreen) this.lobbyScreen.classList.add('hidden');
                    if (this.gameScreen) this.gameScreen.classList.remove('hidden');
        
        // Initialize game with online state
        if (window.game) {
            window.game.initOnlineGame(data.state, data.playerNumber, data.playerNames, this);
        }
                };
            }
        } else {
            // Fallback if modal not found
            if (this.lobbyScreen) this.lobbyScreen.classList.add('hidden');
            if (this.gameScreen) this.gameScreen.classList.remove('hidden');
            
            if (window.game) {
                window.game.initOnlineGame(data.state, data.playerNumber, data.playerNames, this);
            }
        }
    }
    
    onGameStateUpdate(data) {
        if (window.game && window.game.isOnline) {
            window.game.updateFromServer(data.state);
        }
    }
    
    onChatMessage(data) {
        if (window.game && window.game.addLogMessage) {
            window.game.addLogMessage(`${data.playerName}: ${data.message}`, 'chat');
        }
    }
    
    onLogMessage(data) {
        if (window.game && window.game.addLogMessage) {
            window.game.addLogMessage(data.message, data.type || 'log');
        }
    }
    
    // ============================================
    // USER DECKS (FROM DATABASE)
    // ============================================
    
    async loadUserDecks() {
        if (!this.sessionToken) return;
        
        try {
            const response = await fetch('/api/decks', {
                headers: { 'X-Session-Token': this.sessionToken }
            });
            const result = await response.json();
            
            if (result.success) {
                this.savedDecks = result.decks;
                this.updateDeckSelect();
            }
        } catch (error) {
            console.error('Error loading decks:', error);
        }
    }
    
    updateDeckSelect() {
        if (!this.deckSelect) return;
        
        // Clear all options
        this.deckSelect.innerHTML = '';
        
        // Add saved decks only (no preset decks)
        if (this.savedDecks.length === 0) {
            const option = document.createElement('option');
            option.value = 'new';
            option.textContent = 'Chưa có deck - Tạo deck mới';
            this.deckSelect.appendChild(option);
        } else {
            this.savedDecks.forEach(deck => {
                const option = document.createElement('option');
                option.value = 'saved_' + deck.id;
                option.textContent = deck.name;
                option.dataset.saved = 'true';
                this.deckSelect.appendChild(option);
            });
        }
    }
    
    async saveDeckToServer(deckName, cards) {
        if (!this.sessionToken) {
            // Save locally if not logged in
            this.saveLocally(deckName, cards);
            return { success: true };
        }
        
        try {
            const response = await fetch('/api/decks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionToken: this.sessionToken,
                    deckName,
                    cards
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving deck:', error);
            return { success: false, error: 'Lỗi lưu deck' };
        }
    }
    
    async deleteDeck() {
        const selectedValue = this.deckNameSelect ? this.deckNameSelect.value : null;
        
        if (!selectedValue || !selectedValue.startsWith('saved_')) {
            this.showError('Vui lòng chọn deck cần xóa!');
            return;
        }
        
        const id = parseInt(selectedValue.replace('saved_', ''));
        const deck = this.savedDecks.find(d => d.id === id);
        
        if (!deck) {
            this.showError('Không tìm thấy deck!');
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Bạn có chắc chắn muốn xóa deck "${deck.name}"?`)) {
            return;
        }
        
        const result = await this.deleteDeckFromServer(id);
        
        if (result && result.success !== false) {
            await this.loadUserDecks();
            this.updateDeckSelect();
            this.populateDeckSelector();
            
            // Reset to "New deck"
            if (this.deckNameSelect) {
                this.deckNameSelect.value = 'new';
            }
            this.onDeckSelectorChange();
            
            this.showSuccess('Đã xóa deck thành công!');
        } else {
            this.showError(result?.error || 'Lỗi xóa deck');
        }
    }

    async deleteDeckFromServer(deckId) {
        if (!this.sessionToken) {
            this.showError('Vui lòng đăng nhập để xóa deck!');
            return { success: false, error: 'Not logged in' };
        }
        
        try {
            const response = await fetch(`/api/decks/${deckId}`, {
                method: 'DELETE',
                headers: { 'X-Session-Token': this.sessionToken }
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting deck:', error);
            return { success: false, error: 'Network error' };
        }
    }
    
    // ============================================
    // DECK BUILDER
    // ============================================
    
    // Cache for loaded card database
    cardDatabaseCache = null;
    
    async loadCardDatabase() {
        // Return cache if already loaded
        if (this.cardDatabaseCache) {
            return this.cardDatabaseCache;
        }
        
        try {
            // Fetch cards from server API (which scans Card folder)
            const response = await fetch('/api/cards');
            if (response.ok) {
                const cards = await response.json();
                this.cardDatabaseCache = cards;
                return cards;
            } else {
                console.warn('Failed to fetch cards from server, falling back to empty array');
                this.cardDatabaseCache = [];
                return [];
            }
        } catch (error) {
            console.error('Error loading card database:', error);
            this.cardDatabaseCache = [];
            return [];
        }
    }
    
    async getCardDatabase() {
        // Load from folder if not cached
        if (!this.cardDatabaseCache) {
            await this.loadCardDatabase();
        }
        return this.cardDatabaseCache || [];
    }
    
    // Legacy method for backward compatibility - now uses async load
    getCardDatabaseSync() {
        // Return empty array - should use async getCardDatabase instead
        return [];
    }
    
    getPresetDecks() {
        return {
            'default': {
                name: 'Deck Karasuno',
                cards: [
                    // Đỡ (8 cards) - 8 slots
                    { cardId: 'sawamura-daichi-1', count: 2 },      // receive: 4
                    { cardId: 'yamaguchi-tadashi-1', count: 2 },    // receive: 4
                    { cardId: 'nishinoya-yu-1', count: 2 },         // receive: 4
                    { cardId: 'nishinoya-yu-2', count: 2 },         // receive: 6
                    
                    // Chuyền (8 cards) - 8 slots
                    { cardId: 'kageyama-tobio-1', count: 2 },      // toss: 1
                    { cardId: 'kageyama-tobio-2', count: 2 },      // toss: 1
                    { cardId: 'sugawara-koshi-1', count: 2 },      // toss: 1
                    { cardId: 'hinata-shouyo-1', count: 2 },       // toss: 0 (attack focus)
                    
                    // Đập (8 cards) - 8 slots
                    { cardId: 'hinata-shouyo-1', count: 2 },       // attack: 3
                    { cardId: 'hinata-shouyo-2', count: 2 },       // attack: 3
                    { cardId: 'tanaka-ryunosuke-1', count: 2 },    // attack: 3
                    { cardId: 'azumane-asahi-1', count: 2 },       // attack: 3
                    
                    // Chặn (8 cards) - 8 slots
                    { cardId: 'tsukishima-kei-1', count: 2 },      // block: 3
                    { cardId: 'tsukishima-kei-2', count: 2 },      // block: 3
                    { cardId: 'azumane-asahi-1', count: 2 },       // block: 3
                    { cardId: 'hinata-shouyo-2', count: 2 },      // block: 3
                    
                    // Hành động (8 cards) - 8 slots
                    { cardId: 'chuyen-toi-day-cho-toi', count: 2 },
                    { cardId: 'chu-may-cung-co-mau-an-thua-day', count: 2 },
                    { cardId: 'phong-thu-tuyet-doi', count: 2 },
                    { cardId: 'du-chi-la-sinh-hoat-clb', count: 1 },
                    { cardId: '1-diem-bang-100-diem-phai-hon', count: 1 }
                ]
            },
            'shiratorizawa': {
                name: 'Deck Shiratorizawa',
                cards: [
                    // Đỡ (8 cards) - 8 slots
                    { cardId: 'yamagata-hayato', count: 2 },       // receive: 5
                    { cardId: 'ushijima-wakatoshi-3', count: 2 },  // receive: 3
                    { cardId: 'goshiki-tsutomu-3', count: 2 },    // receive: 4
                    { cardId: 'shirabu-kenjiro-1', count: 2 },    // receive: 3
                    
                    // Chuyền (8 cards) - 8 slots
                    { cardId: 'shirabu-kenjiro-1', count: 2 },    // toss: 1
                    { cardId: 'shirabu-kenjiro-2', count: 2 },    // toss: 1
                    { cardId: 'shirabu-kenjiro-3', count: 2 },    // toss: 1
                    { cardId: 'semi-eita', count: 2 },            // toss: 1
                    
                    // Đập (8 cards) - 8 slots
                    { cardId: 'ushijima-wakatoshi-1', count: 2 }, // attack: 3
                    { cardId: 'ushijima-wakatoshi-2', count: 2 }, // attack: 3
                    { cardId: 'goshiki-tsutomu-1', count: 2 },    // attack: 3
                    { cardId: 'ohira-reon-1', count: 2 },         // attack: 3
                    
                    // Chặn (8 cards) - 8 slots
                    { cardId: 'tendo-satori-1', count: 2 },       // block: 4
                    { cardId: 'tendo-satori-3', count: 2 },      // block: 4
                    { cardId: 'kawanishi-taichi', count: 2 },     // block: 3
                    { cardId: 'shirabu-kenjiro-2', count: 2 },    // block: 3
                    
                    // Hành động (8 cards) - 8 slots
                    { cardId: 'chuyen-het-bong-cho-anh', count: 2 },
                    { cardId: 'ma-la-nghe-thuat-dap-bong-thang-xuong-san', count: 2 },
                    { cardId: 'la-mot-doi-thu-vuot-qua-tam-hieu-biet', count: 2 },
                    { cardId: 'thay-chua-ha-cu-bong-than-toc-cua-em-do', count: 2 }
                ]
            }
        };
    }
    
    initDeckBuilder() {
        this.buildingDeck = {};
        
        if (this.filterSchool) {
            this.filterSchool.addEventListener('change', () => this.renderCollectionCards());
        }
        if (this.filterType) {
            this.filterType.addEventListener('change', () => this.renderCollectionCards());
        }
        if (this.filterSearch) {
            this.filterSearch.addEventListener('input', () => this.renderCollectionCards());
        }
        if (this.deckNameSelect) {
            this.deckNameSelect.addEventListener('change', () => this.onDeckSelectorChange());
        }
        if (this.btnCancelDeck) {
            this.btnCancelDeck.addEventListener('click', () => this.closeDeckBuilder());
        }
        if (this.btnSaveDeck) {
            this.btnSaveDeck.addEventListener('click', () => this.saveDeck());
        }
        if (this.btnDeleteDeck) {
            this.btnDeleteDeck.addEventListener('click', () => this.deleteDeck());
        }
    }
    
    onDeckSelectorChange() {
        const selectedValue = this.deckNameSelect.value;
        
        // Show/hide delete button
        if (this.btnDeleteDeck) {
            if (selectedValue.startsWith('saved_')) {
                this.btnDeleteDeck.style.display = 'inline-block';
            } else {
                this.btnDeleteDeck.style.display = 'none';
            }
        }
        
        if (selectedValue === 'new') {
            // Reset to new deck
            this.buildingDeck = {};
            this.renderCollectionCards();
            this.updateDeckCount();
        } else if (selectedValue.startsWith('saved_')) {
            // Load saved deck
            const id = parseInt(selectedValue.replace('saved_', ''));
            const deck = this.savedDecks.find(d => d.id === id);
            if (deck) {
                this.buildingDeck = { ...deck.cards };
                this.renderCollectionCards();
                this.renderDeckCards();
                this.updateDeckCount();
            }
        }
    }
    
    onDeckChange(deckId) {
        this.selectedDeck = deckId;
        console.log('🔄 Deck changed to:', deckId);
        
        if (deckId.startsWith('saved_')) {
            const id = parseInt(deckId.replace('saved_', ''));
            const deck = this.savedDecks.find(d => d.id === id);
            if (deck) {
                this.updateDeckInfo(deck.name, Object.values(deck.cards).reduce((a, b) => a + b, 0));
            }
        } else if (deckId === 'new') {
            this.updateDeckInfo('New deck', 0);
        }
        
        // Auto-send deck selection when in room
        if (this.roomId && this.socket) {
            this.sendDeckSelection();
        }
    }
    
    updateDeckInfo(name, count) {
        if (this.deckInfo) {
            this.deckInfo.textContent = `${count} lá | ${name}`;
        }
    }
    
    async openDeckBuilder() {
        if (!this.deckBuilderModal) return;
        
        this.buildingDeck = {};
        
        // Clear cache to ensure fresh data
        this.cardDatabaseCache = null;
        
        // Show modal immediately for better UX
        this.deckBuilderModal.classList.add('show');
        
        // Show loading indicator
        if (this.collectionCards) {
            this.collectionCards.innerHTML = '<div class="loading-message">Đang tải thẻ...</div>';
        }
        
        // Load card database from server
        await this.loadCardDatabase();
        
        // Populate school filter dynamically (will get schools from loaded cards)
        await this.populateSchoolFilter();
        
        // Populate deck selector
        this.populateDeckSelector();
        
        // Render cards
        await this.renderCollectionCards();
        await this.renderDeckCards();
        this.updateDeckCount();
    }
    
    async populateSchoolFilter() {
        if (!this.filterSchool) return;
        
        // Load card database first
        const cards = await this.getCardDatabase();
        const schools = new Set();
        cards.forEach(card => {
            if (card.school) {
                schools.add(card.school);
            }
        });
        
        // Remove unwanted schools
        schools.delete('Yukigaoka');
        schools.delete('Kitagawa Daiichi');
        
        // Clear existing options except "all"
        this.filterSchool.innerHTML = '<option value="all">Tất cả trường</option>';
        
        // Add school options sorted alphabetically (only from loaded cards)
        Array.from(schools).sort().forEach(school => {
            const option = document.createElement('option');
            option.value = school;
            option.textContent = school;
            this.filterSchool.appendChild(option);
        });
    }
    
    closeDeckBuilder() {
        if (this.deckBuilderModal) {
            this.deckBuilderModal.classList.remove('show');
        }
    }
    
    populateDeckSelector() {
        if (!this.deckNameSelect) return;
        
        // Clear existing options except "New deck"
        this.deckNameSelect.innerHTML = '<option value="new">New deck</option>';
        
        // Add saved decks
        this.savedDecks.forEach(deck => {
            const option = document.createElement('option');
            option.value = 'saved_' + deck.id;
            option.textContent = deck.name;
            this.deckNameSelect.appendChild(option);
        });
        
        // Set default to "New deck"
        this.deckNameSelect.value = 'new';
    }
    
    async renderDeckCards() {
        if (!this.deckCards) return;
        
        const cards = await this.getCardDatabase();
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
    
    renderSavedDecksList() {
        // This function is kept for compatibility but no longer used
        // Deck selection is now handled by populateDeckSelector
    }
    
    async renderCollectionCards() {
        if (!this.collectionCards) return;
        
        const schoolFilter = this.filterSchool ? this.filterSchool.value : 'all';
        const typeFilter = this.filterType ? this.filterType.value : 'all';
        const searchQuery = this.filterSearch ? this.filterSearch.value.toLowerCase().trim() : '';
        const cards = await this.getCardDatabase();
        
        this.collectionCards.innerHTML = '';
        
        // Filter cards first
        const filteredCards = cards.filter(card => {
            if (schoolFilter !== 'all' && card.school !== schoolFilter) return false;
            if (typeFilter !== 'all' && card.type !== typeFilter) return false;
            if (searchQuery && !card.name.toLowerCase().includes(searchQuery)) return false;
            return true;
        });
        
        // Sort cards alphabetically by name
        filteredCards.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
        
        // Render sorted cards
        filteredCards.forEach(card => {
            const count = this.buildingDeck[card.cardId] || 0;
            const item = this.createDeckCardItem(card, count);
            this.collectionCards.appendChild(item);
        });
    }
    
    
    createDeckCardItem(card, count) {
        const item = document.createElement('div');
        item.className = 'deck-card-item' + (count > 0 ? ' in-deck' : '');
        
        // Add data attribute for action cards (for CSS styling)
        if (card.type === 'action') {
            item.dataset.cardType = 'action';
        }
        
        const typeLabel = card.type === 'action' ? '⚡' : '👤';
        
        item.innerHTML = `
            <div class="card-mini">
                ${card.artwork ? `<img src="${card.artwork}" alt="${card.name}">` : `<div class="card-placeholder">🏐</div>`}
            </div>
            <div class="card-info">
                <div class="name">${typeLabel} ${card.name}</div>
                <div class="school">${card.school}</div>
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
        
        // Add hover preview for deck builder
        item.addEventListener('mouseenter', () => this.showDeckCardPreview(card));
        item.addEventListener('mouseleave', () => this.hideDeckCardPreview());
        
        return item;
    }
    
    async showDeckCardPreview(card) {
        // Use deck builder preview panel if available, otherwise fallback to game preview panel
        const previewFullCard = document.getElementById('deck-builder-preview-full-card') || document.getElementById('preview-full-card');
        const previewName = document.getElementById('deck-builder-preview-name') || document.getElementById('preview-name');
        const previewStats = document.getElementById('deck-builder-preview-stats') || document.getElementById('preview-stats');
        
        // Load JSON data for this card (same as showCardPreview)
        let jsonData = null;
        if (card.cardId) {
            try {
                let jsonPath = '';
                if (card.type === 'action') {
                    jsonPath = `Card/${card.school}/Hanh dong/${card.cardId}.json`;
                } else {
                    jsonPath = `Card/${card.school}/Nhan vat/${card.cardId}.json`;
                }
                
                const response = await fetch(jsonPath);
                if (response.ok) {
                    jsonData = await response.json();
                }
            } catch (error) {
                console.warn('Could not load JSON for card:', card.cardId, error);
            }
        }
        
        // Use JSON data if available, otherwise fallback to card data
        const displayName = jsonData?.name || card.name;
        // Get stats from JSON (standardized structure)
        const displayStats = jsonData?.stats || {
            serve: card.serve || 0,
            receive: card.receive || 0,
            toss: card.toss || 0,
            attack: card.attack || 0,
            block: card.block || 0
        };
        // Get skill description from JSON (standardized structure: skill.description)
        const displaySkill = jsonData?.skill?.description || card.skill || '';
        
        // Convert JSON path to PNG - replace .json with .png
        let artworkPath = jsonData?.artwork || card.artwork;
        if (artworkPath && artworkPath.endsWith('.json')) {
            artworkPath = artworkPath.replace('.json', '.png');
        }
        
        if (previewFullCard) {
            if (artworkPath) {
                const isAction = card.type === 'action';
                const imgClass = isAction ? 'action-card-preview' : '';
                previewFullCard.innerHTML = `<img src="${artworkPath}" alt="${displayName}" class="${imgClass}">`;
            } else {
                previewFullCard.innerHTML = '<div class="card-placeholder">🏐</div>';
            }
        }
        
        if (previewName) {
            previewName.textContent = displayName;
        }
        
        // Use stats from JSON (handle string values like "3+")
        const serveValue = typeof displayStats.serve === 'string' ? displayStats.serve : (displayStats.serve || 0);
        const receiveValue = typeof displayStats.receive === 'string' ? displayStats.receive : (displayStats.receive || 0);
        const tossValue = typeof displayStats.toss === 'string' ? displayStats.toss : (displayStats.toss || 0);
        const attackValue = typeof displayStats.attack === 'string' ? displayStats.attack : (displayStats.attack || 0);
        const blockValue = typeof displayStats.block === 'string' ? displayStats.block : (displayStats.block || 0);
        
        if (previewStats) {
            previewStats.innerHTML = `
                <div class="preview-stat" data-stat="serve"><span>Giao:</span><span class="stat-value" data-stat="serve">${serveValue}</span></div>
                <div class="preview-stat" data-stat="receive"><span>Đỡ:</span><span class="stat-value" data-stat="receive">${receiveValue}</span></div>
                <div class="preview-stat" data-stat="toss"><span>Chuyền:</span><span class="stat-value" data-stat="toss">${tossValue}</span></div>
                <div class="preview-stat" data-stat="attack"><span>Đập:</span><span class="stat-value" data-stat="attack">${attackValue}</span></div>
                <div class="preview-stat" data-stat="block"><span>Chặn:</span><span class="stat-value" data-stat="block">${blockValue}</span></div>
            `;
            // No click handlers for stat modification in deck builder
        }
        
        // Show skill in preview (if exists)
        if (displaySkill) {
            const skillEl = document.createElement('div');
            skillEl.className = 'preview-skill-text';
            skillEl.textContent = displaySkill;
            skillEl.style.cssText = 'font-size: 0.85rem; color: #ffd700; margin-top: 8px; padding: 8px; background: rgba(255, 215, 0, 0.1); border-radius: 4px; line-height: 1.4;';
            if (previewFullCard && previewFullCard.parentElement) {
                // Remove existing skill if any
                const existingSkill = previewFullCard.parentElement.querySelector('.preview-skill-text');
                if (existingSkill) existingSkill.remove();
                previewFullCard.parentElement.appendChild(skillEl);
            }
        }
    }
    
    hideDeckCardPreview() {
        // Keep preview visible - don't clear it
        // This allows users to see the last hovered card
    }
    
    async changeCardCount(cardId, delta) {
        const current = this.buildingDeck[cardId] || 0;
        const newCount = Math.max(0, Math.min(4, current + delta));
        
        const total = this.getTotalDeckCount();
        if (delta > 0 && total >= 40) {
            this.showError('Deck đã đủ 40 lá!');
            return;
        }
        
        this.buildingDeck[cardId] = newCount;
        
        await this.renderCollectionCards();
        await this.renderDeckCards();
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
    }
    
    async saveDeck() {
        const total = this.getTotalDeckCount();
        if (total !== 40) {
            this.showError('Deck phải có đúng 40 lá!');
            return;
        }
        
        const selectedValue = this.deckNameSelect ? this.deckNameSelect.value : 'new';
        
        if (selectedValue === 'new') {
            // For new deck, prompt for name
            const deckName = prompt('Nhập tên deck mới:');
            if (!deckName || !deckName.trim()) {
                return;
            }
            
            // Create a deep copy of buildingDeck to avoid reference issues
            const deckData = JSON.parse(JSON.stringify(this.buildingDeck));
            const result = await this.saveDeckToServer(deckName.trim(), deckData);
            
            if (result.success) {
                await this.loadUserDecks();
                this.updateDeckSelect();
                this.populateDeckSelector();
                
                // Select the new deck
                const newDeckId = result.deckId ? 'saved_' + result.deckId : 'default';
                if (this.deckSelect) {
                    this.deckSelect.value = newDeckId;
                }
                // Use onDeckChange to properly sync selectedDeck and update UI
                // This will also call sendDeckSelection() if in a room
                this.onDeckChange(newDeckId);
                
                this.closeDeckBuilder();
                this.showSuccess('Đã lưu deck thành công!');
            } else {
                this.showError(result.error || 'Lỗi lưu deck');
            }
        } else if (selectedValue.startsWith('saved_')) {
            // Update existing deck
            const id = parseInt(selectedValue.replace('saved_', ''));
            const deck = this.savedDecks.find(d => d.id === id);
            if (!deck) {
                this.showError('Không tìm thấy deck!');
                return;
            }
            
            // Create a deep copy of buildingDeck to avoid reference issues
            const deckData = JSON.parse(JSON.stringify(this.buildingDeck));
            const result = await this.updateDeckOnServer(id, deckData);
            
            if (result.success) {
                await this.loadUserDecks();
                this.updateDeckSelect();
                this.populateDeckSelector();
                
                // Ensure the updated deck is still selected
                const currentDeckId = 'saved_' + id;
                if (this.deckSelect) {
                    this.deckSelect.value = currentDeckId;
                }
                // Use onDeckChange to properly sync selectedDeck and update UI
                this.onDeckChange(currentDeckId);
                
                this.closeDeckBuilder();
                this.showSuccess('Đã cập nhật deck!');
            } else {
                this.showError(result.error || 'Lỗi cập nhật deck');
            }
        }
    }
    
    async updateDeckOnServer(deckId, cards) {
        if (!this.sessionToken) {
            // Update locally if not logged in
            const localDecks = JSON.parse(localStorage.getItem('haikyuu_local_decks') || '[]');
            const deckIndex = localDecks.findIndex(d => d.id === deckId);
            if (deckIndex >= 0) {
                localDecks[deckIndex].cards = cards;
                localStorage.setItem('haikyuu_local_decks', JSON.stringify(localDecks));
            }
            return { success: true };
        }
        
        try {
            const response = await fetch(`/api/decks/${deckId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': this.sessionToken
                },
                body: JSON.stringify({ cards })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating deck:', error);
            return { success: false, error: 'Lỗi kết nối' };
        }
    }
    
    saveLocally(deckName, cards) {
        const localDecks = JSON.parse(localStorage.getItem('haikyuu_local_decks') || '[]');
        localDecks.push({ name: deckName, cards, id: Date.now() });
        localStorage.setItem('haikyuu_local_decks', JSON.stringify(localDecks));
    }
    
    getCurrentDeck() {
        console.log('🔍 getCurrentDeck - selectedDeck:', this.selectedDeck);
        
        if (this.selectedDeck && this.selectedDeck.startsWith('saved_')) {
            const id = parseInt(this.selectedDeck.replace('saved_', ''));
            const deck = this.savedDecks.find(d => d.id === id);
            if (deck) {
                console.log('📦 Using saved deck:', deck.name, 'with', Object.keys(deck.cards || {}).length, 'card types');
                return deck.cards;
            }
        }
        
        // No preset decks - only saved decks
        console.warn('⚠️ No deck found for selectedDeck:', this.selectedDeck);
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
}

// Initialize online manager
window.onlineManager = null;
document.addEventListener('DOMContentLoaded', () => {
    window.onlineManager = new OnlineGameManager();
});
