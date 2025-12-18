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
        this.selectedDeck = 'default';
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
        this.deckNameInput = document.getElementById('deck-name-input');
        this.btnCancelDeck = document.getElementById('btn-cancel-deck');
        this.btnSaveDeck = document.getElementById('btn-save-deck');
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
        console.log(`[Chat] ${data.playerName}: ${data.message}`);
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
        
        // Remove existing saved deck options
        const existingOptions = this.deckSelect.querySelectorAll('option[data-saved]');
        existingOptions.forEach(opt => opt.remove());
        
        // Add saved decks
        this.savedDecks.forEach(deck => {
            const option = document.createElement('option');
            option.value = 'saved_' + deck.id;
            option.textContent = deck.name;
            option.dataset.saved = 'true';
            this.deckSelect.appendChild(option);
        });
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
    
    async deleteDeckFromServer(deckId) {
        if (!this.sessionToken) return;
        
        try {
            await fetch(`/api/decks/${deckId}`, {
                method: 'DELETE',
                headers: { 'X-Session-Token': this.sessionToken }
            });
            await this.loadUserDecks();
            this.renderSavedDecksList();
        } catch (error) {
            console.error('Error deleting deck:', error);
        }
    }
    
    // ============================================
    // DECK BUILDER
    // ============================================
    
    getCardDatabase() {
        return [
            // KARASUNO - NHÂN VẬT
            { id: 1, name: "Hinata Shoyo", cardId: "hinata-shouyo-1", school: "Karasuno", type: "character", serve: 2, receive: 0, toss: 0, attack: 3, block: 2, skill: "[3 Ý chí] Khi thẻ này xuất hiện ở khu vực Đập Bóng từ trên tay, nếu có 3+ Ý Chí ở khu vực này, tự +1 điểm Đập.", artwork: "Card/Karasuno/Nhan vat/hinata-shouyo-1.png" },
            { id: 21, name: "Hinata Shoyo", cardId: "hinata-shouyo-2", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, artwork: "Card/Karasuno/Nhan vat/hinata-shouyo-2.png" },
            { id: 22, name: "Kageyama Tobio", cardId: "kageyama-tobio-1", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 1, attack: 3, block: 0, skill: "Khi thẻ này xuất hiện ở khu vực Chuyền Bóng, có thể tìm 1 thẻ từ Deck và thêm vào tay.", artwork: "Card/Karasuno/Nhan vat/kageyama-tobio-1.png" },
            { id: 23, name: "Kageyama Tobio", cardId: "kageyama-tobio-2", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 1, attack: 2, block: 2, artwork: "Card/Karasuno/Nhan vat/kageyama-tobio-2.png" },
            { id: 24, name: "Sawamura Daichi", cardId: "sawamura-daichi-1", school: "Karasuno", type: "character", serve: 2, receive: 4, toss: 0, attack: 0, block: 0, artwork: "Card/Karasuno/Nhan vat/sawamura-daichi-1.png" },
            { id: 25, name: "Sugawara Koshi", cardId: "sugawara-koshi-1", school: "Karasuno", type: "character", serve: 2, receive: 2, toss: 1, attack: 0, block: 1, skill: "[Đỡ][Chặn][Kích hoạt] +1 điểm Đỡ hoặc Chặn cho một nhân vật trên sân mình.", artwork: "Card/Karasuno/Nhan vat/sugawara-koshi-1.png" },
            { id: 26, name: "Tanaka Ryunosuke", cardId: "tanaka-ryunosuke-1", school: "Karasuno", type: "character", serve: 1, receive: 3, toss: 0, attack: 3, block: 1, skill: "Khi thẻ này xuất hiện ở khu vực Đập Bóng, đối phương -2 điểm Chặn.", artwork: "Card/Karasuno/Nhan vat/tanaka-ryunosuke-1.png" },
            { id: 27, name: "Tsukishima Kei", cardId: "tsukishima-kei-1", school: "Karasuno", type: "character", serve: 1, receive: 2, toss: 0, attack: 2, block: 3, skill: "[3 Ý chí] Khi thẻ này xuất hiện ở khu vực Chặn Bóng, nếu có 3+ Ý Chí, tự +1 điểm Chặn.", artwork: "Card/Karasuno/Nhan vat/tsukishima-kei-1.png" },
            { id: 28, name: "Tsukishima Kei", cardId: "tsukishima-kei-2", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, artwork: "Card/Karasuno/Nhan vat/tsukishima-kei-2.png" },
            { id: 29, name: "Yamaguchi Tadashi", cardId: "yamaguchi-tadashi-1", school: "Karasuno", type: "character", serve: 3, receive: 4, toss: 0, attack: 0, block: 0, skill: "[2 Ý chí] Khi thẻ này ra sân, lấy 1 thẻ Karasuno từ Drop về tay.", artwork: "Card/Karasuno/Nhan vat/yamaguchi-tadashi-1.png" },
            { id: 30, name: "Nishinoya Yu", cardId: "nishinoya-yu-1", school: "Karasuno", type: "character", serve: 0, receive: 4, toss: 0, attack: 0, block: 0, skill: "[Libero] Không thể Giao bóng. [1 Ý chí] Tự + điểm Đỡ bằng điểm Chặn của Ý chí.", artwork: "Card/Karasuno/Nhan vat/nishinoya-yu-1.png" },
            { id: 31, name: "Nishinoya Yu", cardId: "nishinoya-yu-2", school: "Karasuno", type: "character", serve: 0, receive: 6, toss: 0, attack: 0, block: 0, skill: "[Libero] Không thể Giao bóng.", artwork: "Card/Karasuno/Nhan vat/nishinoya-yu-2.png" },
            { id: 32, name: "Azumane Asahi", cardId: "azumane-asahi-1", school: "Karasuno", type: "character", serve: 1, receive: 0, toss: 0, attack: 3, block: 3, skill: "Khi thẻ này xuất hiện ở khu vực Chặn Bóng, nếu có 2+ nhân vật Chặn, tự +2 điểm Chặn.", artwork: "Card/Karasuno/Nhan vat/azumane-asahi-1.png" },
            // SHIRATORIZAWA - NHÂN VẬT
            { id: 33, name: "Ushijima Wakatoshi", cardId: "ushijima-wakatoshi-1", school: "Shiratorizawa", type: "character", serve: 3, receive: 0, toss: 0, attack: 3, block: 0, skill: "Khi thẻ này xuất hiện ở khu vực Đập Bóng, nếu có 3+ Ý Chí và thẻ Action, tự +3 điểm Đập.", artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-1.png" },
            { id: 34, name: "Ushijima Wakatoshi", cardId: "ushijima-wakatoshi-2", school: "Shiratorizawa", type: "character", serve: 4, receive: 0, toss: 0, attack: 3, block: 0, skill: "Khi thẻ này xuất hiện ở khu vực Giao Bóng, có thể +2 điểm Giao.", artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-2.png" },
            { id: 35, name: "Ushijima Wakatoshi", cardId: "ushijima-wakatoshi-3", school: "Shiratorizawa", type: "character", serve: 2, receive: 3, toss: 0, attack: 3, block: 0, skill: "Khi thẻ này xuất hiện ở khu vực Đỡ Bóng, có thể bỏ 1 thẻ trên tay để tự +1 điểm Đỡ, sau đó đặt 1 thẻ trên cùng bộ bài đối phương vào Drop.", artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-3.png" },
            { id: 36, name: "Tendo Satori", cardId: "tendo-satori-1", school: "Shiratorizawa", type: "character", serve: 1, receive: 0, toss: 0, attack: 1, block: 4, skill: "Khi thẻ này xuất hiện ở khu vực Chặn Bóng, đặt 1 thẻ trên cùng bộ bài đối phương vào Drop. Nếu thẻ đó trùng tên với nhân vật Đập Bóng của đối phương, ngay lập tức Chặn Bóng thành công, sau đó đặt 2 thẻ trên cùng bộ bài đối phương vào Drop.", artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-1.png" },
            { id: 37, name: "Tendo Satori", cardId: "tendo-satori-2", school: "Shiratorizawa", type: "character", serve: 2, receive: 0, toss: 0, attack: 3, block: 2, skill: "[Bỏ thẻ này từ trên tay] : +2 điểm Đỡ hoặc Chặn cho 1 nhân vật trường Shiratorizawa trên sân mình.", artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-2.png" },
            { id: 38, name: "Tendo Satori", cardId: "tendo-satori-3", school: "Shiratorizawa", type: "character", serve: 3, receive: 1, toss: 0, attack: 3, block: 4, artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-3.png" },
            { id: 39, name: "Goshiki Tsutomu", cardId: "goshiki-tsutomu-1", school: "Shiratorizawa", type: "character", serve: 2, receive: 2, toss: 0, attack: 3, block: 0, skill: "[3 Ý chí] Khi thẻ này xuất hiện ở khu vực Đập Bóng từ trên tay, nếu có 3+ Ý Chí ở khu vực này, tự +1 điểm Đập. Nếu trên sân mình có nhân vật \"Ushijima Wakatoshi\", có thể loại bỏ 1 Ý Chí của 1 nhân vật trên sân đối phương.", artwork: "Card/Shiratorizawa/Nhan vat/goshiki-tsutomu-1.png" },
            { id: 40, name: "Goshiki Tsutomu", cardId: "goshiki-tsutomu-2", school: "Shiratorizawa", type: "character", serve: 4, receive: 1, toss: 0, attack: 3, block: 0, skill: "Khi thẻ này xuất hiện ở khu vực Giao Bóng, có thể bỏ 1 thẻ trên tay để đặt 2 thẻ trên cùng bộ bài đối phương vào Drop.", artwork: "Card/Shiratorizawa/Nhan vat/goshiki-tsutomu-2.png" },
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
            { id: 100, name: "Chuyền tới đây cho tôi!!", cardId: "chuyen-toi-day-cho-toi", school: "Karasuno", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đỡ] +2 điểm Đỡ cho nhân vật Đỡ Bóng trường Karasuno trên sân mình. Sau đó, nếu nhân vật đó là \"Nishinoya Yu\", có thể chọn tối đa 1 thẻ \"Nishinoya Yu\" từ bộ bài rồi thêm vào Ý Chí của nhân vật đó. Xáo lại bộ bài.", artwork: "Card/Karasuno/Hanh dong/chuyen-toi-day-cho-toi.png" },
            { id: 101, name: "Chú mày cũng có máu ăn thua đấy…!!", cardId: "chu-may-cung-co-mau-an-thua-day", school: "Karasuno", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đập] [3 Ý chí] +1 điểm Chuyền cho nhân vật Chuyền Bóng trường Karasuno trên sân mình. Hoặc nếu nhân vật đó và nhân vật Đập Bóng có từ 3 Ý Chí trở lên, +3 điểm Chuyền.", artwork: "Card/Karasuno/Hanh dong/chu-may-cung-co-mau-an-thua-day.png" },
            { id: 102, name: "Phòng thủ tuyệt đối!!", cardId: "phong-thu-tuyet-doi", school: "Karasuno", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đỡ][Chặn] +2 điểm Đỡ hoặc Chặn cho 1 nhân vật trường Karasuno trên sân mình. Nếu nhân vật đó là nhân vật Chặn Bóng, rút 2 thẻ từ bộ bài. Sau đó, trong lượt này không được phép sử dụng thẻ \"Phòng thủ tuyệt đối!!\" nữa.", artwork: "Card/Karasuno/Hanh dong/phong-thu-tuyet-doi.png" },
            { id: 103, name: "Dù chỉ là sinh hoạt CLB…", cardId: "du-chi-la-sinh-hoat-clb", school: "Karasuno", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Chặn] [3 Ý chí] +2 điểm Chặn cho 1 nhân vật \"Tsukishima Kei\" trên sân mình. Nếu trên sân mình có nhân vật Đỡ Bóng trường Karasuno với 3 Ý Chí trở lên, ở lượt tiếp theo của đối phương, đối phương chỉ Đỡ Bóng thành công với điểm Đỡ từ 8 trở lên.", artwork: "Card/Karasuno/Hanh dong/du-chi-la-sinh-hoat-clb.png" },
            { id: 104, name: "\"1 điểm bằng 100 điểm\" phải hôn!?", cardId: "1-diem-bang-100-diem-phai-hon", school: "Karasuno", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đỡ][Chuyền][Đập][Chặn] [2 Ý chí] +1 điểm bất kì cho 1 nhân vật trường Karasuno trên sân mình. Sau đó, có thể sử dụng 2 Ý Chí của 1 nhân vật trường Karasuno khác để thu hồi lên tay 1 thẻ nhân vật từ khu vực Loại Bỏ.", artwork: "Card/Karasuno/Hanh dong/1-diem-bang-100-diem-phai-hon.png" },
            // SHIRATORIZAWA - HÀNH ĐỘNG
            { id: 105, name: "Chuyền hết bóng cho anh.", cardId: "chuyen-het-bong-cho-anh", school: "Shiratorizawa", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Chuyền][Đập] [3 ý chí] +1 điểm cho nhân vật Shiratorizawa.", artwork: "Card/Shiratorizawa/Hanh dong/chuyen-het-bong-cho-anh.png" },
            { id: 106, name: "Mà là nghệ thuật đập bóng thẳng xuống sân.", cardId: "ma-la-nghe-thuat-dap-bong-thang-xuong-san", school: "Shiratorizawa", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Chặn] Rút 1 thẻ từ bộ bài. Sau đó, +2 điểm Chặn cho 1 nhân vật trường Shiratorizawa trên sân mình. Nếu nhân vật đó là \"Tendo Satori\", đặt 1 thẻ trên cùng bộ bài của đối phương vào khu vực Loại Bỏ.", artwork: "Card/Shiratorizawa/Hanh dong/ma-la-nghe-thuat-dap-bong-thang-xuong-san.png" },
            { id: 107, name: "Là một đối thủ \"vượt quá tầm hiểu biết\"…", cardId: "la-mot-doi-thu-vuot-qua-tam-hieu-biet", school: "Shiratorizawa", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đỡ][Chuyền][Đập][Chặn] [3 Ý chí] +1 điểm bất kì cho 1 nhân vật trường Shiratorizawa trên sân mình. Nếu nhân vật đó có từ 3 Ý Chí trở lên, và trên sân đối phương, trừ nhân vật Giao Bóng, có nhân vật có từ 2 Ý Chí trở xuống, rút 2 thẻ từ bộ bài. Sau đó, trong lượt này không được sử dụng thẻ \"Là một đối thủ 'vượt quá tầm hiểu biết'…\" nữa.", artwork: "Card/Shiratorizawa/Hanh dong/la-mot-doi-thu-vuot-qua-tam-hieu-biet.png" },
            { id: 108, name: "Thấy chưa hả? Cú bóng thần tốc của em đó!", cardId: "thay-chua-ha-cu-bong-than-toc-cua-em-do", school: "Shiratorizawa", type: "action", serve: 0, receive: 0, toss: 0, attack: 0, block: 0, skill: "[Đập] +1 điểm Đập cho 1 nhân vật trên sân mình. Sau đó, nếu nhân vật đó là \"Goshiki Tsutomu\", ở lượt tiếp theo của đối phương, đối phương không được đưa ra nhân vật Chặn Bóng.", artwork: "Card/Shiratorizawa/Hanh dong/thay-chua-ha-cu-bong-than-toc-cua-em-do.png" }
        ];
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
        if (this.btnCancelDeck) {
            this.btnCancelDeck.addEventListener('click', () => this.closeDeckBuilder());
        }
        if (this.btnSaveDeck) {
            this.btnSaveDeck.addEventListener('click', () => this.saveDeck());
        }
    }
    
    onDeckChange(deckId) {
        this.selectedDeck = deckId;
        
        if (deckId.startsWith('saved_')) {
            const id = parseInt(deckId.replace('saved_', ''));
            const deck = this.savedDecks.find(d => d.id === id);
            if (deck) {
                this.updateDeckInfo(deck.name, Object.values(deck.cards).reduce((a, b) => a + b, 0));
            }
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
        
        this.renderSavedDecksList();
        this.renderCollectionCards();
        this.renderDeckCards();
        this.updateDeckCount();
        
        this.deckBuilderModal.classList.add('show');
    }
    
    closeDeckBuilder() {
        if (this.deckBuilderModal) {
            this.deckBuilderModal.classList.remove('show');
        }
    }
    
    renderSavedDecksList() {
        if (!this.savedDecksList) return;
        
        this.savedDecksList.innerHTML = '';
        
        this.savedDecks.forEach(deck => {
            const item = document.createElement('div');
            item.className = 'saved-deck-item';
            item.innerHTML = `
                <span class="saved-deck-name">${deck.name}</span>
                <span class="saved-deck-delete" data-id="${deck.id}">×</span>
            `;
            
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('saved-deck-delete')) {
                    e.stopPropagation();
                    this.deleteDeckFromServer(e.target.dataset.id);
                    return;
                }
                // Load deck into builder
                this.buildingDeck = { ...deck.cards };
                this.deckNameInput.value = deck.name;
                this.renderCollectionCards();
                this.renderDeckCards();
                this.updateDeckCount();
            });
            
            this.savedDecksList.appendChild(item);
        });
    }
    
    renderCollectionCards() {
        if (!this.collectionCards) return;
        
        const schoolFilter = this.filterSchool ? this.filterSchool.value : 'all';
        const typeFilter = this.filterType ? this.filterType.value : 'all';
        const searchQuery = this.filterSearch ? this.filterSearch.value.toLowerCase().trim() : '';
        const cards = this.getCardDatabase();
        
        this.collectionCards.innerHTML = '';
        
        cards.forEach(card => {
            if (schoolFilter !== 'all' && card.school !== schoolFilter) return;
            if (typeFilter !== 'all' && card.type !== typeFilter) return;
            if (searchQuery && !card.name.toLowerCase().includes(searchQuery)) return;
            
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
        
        const typeLabel = card.type === 'action' ? '⚡' : '👤';
        
        item.innerHTML = `
            <div class="card-mini">
                ${card.artwork ? `<img src="${card.artwork}" alt="${card.name}">` : `<div class="card-placeholder">🏐</div>`}
            </div>
            <div class="card-info">
                <div class="name">${typeLabel} ${card.name}</div>
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
        
        // Add hover preview for deck builder
        item.addEventListener('mouseenter', () => this.showDeckCardPreview(card));
        item.addEventListener('mouseleave', () => this.hideDeckCardPreview());
        
        return item;
    }
    
    showDeckCardPreview(card) {
        const previewFullCard = document.getElementById('preview-full-card');
        const previewName = document.getElementById('preview-name');
        const previewStats = document.getElementById('preview-stats');
        const previewSkill = document.getElementById('preview-skill');
        
        if (previewFullCard) {
            if (card.artwork) {
                previewFullCard.innerHTML = `<img src="${card.artwork}" alt="${card.name}">`;
            } else {
                previewFullCard.innerHTML = '<div class="card-placeholder">🏐</div>';
            }
        }
        
        if (previewName) {
            previewName.textContent = card.name;
        }
        
        if (previewStats) {
            previewStats.innerHTML = `
                <div class="preview-stat" data-stat="serve"><span>Giao:</span><span class="stat-value" data-stat="serve">${card.serve}</span></div>
                <div class="preview-stat" data-stat="receive"><span>Đỡ:</span><span class="stat-value" data-stat="receive">${card.receive}</span></div>
                <div class="preview-stat" data-stat="toss"><span>Chuyền:</span><span class="stat-value" data-stat="toss">${card.toss}</span></div>
                <div class="preview-stat" data-stat="attack"><span>Đập:</span><span class="stat-value" data-stat="attack">${card.attack}</span></div>
                <div class="preview-stat" data-stat="block"><span>Chặn:</span><span class="stat-value" data-stat="block">${card.block}</span></div>
            `;
            // No click handlers for stat modification in deck builder
        }
        
        if (previewSkill) {
            previewSkill.textContent = card.skill || '';
            previewSkill.style.display = card.skill ? 'block' : 'none';
        }
    }
    
    hideDeckCardPreview() {
        // Optional: clear preview when leaving deck builder cards
        // Or keep last card preview visible
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
    }
    
    async saveDeck() {
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
        
        const result = await this.saveDeckToServer(deckName, this.buildingDeck);
        
        if (result.success) {
            await this.loadUserDecks();
            this.updateDeckSelect();
            
            // Select the new deck
            const newDeckId = result.deckId ? 'saved_' + result.deckId : 'default';
        if (this.deckSelect) {
                this.deckSelect.value = newDeckId;
            }
            this.selectedDeck = newDeckId;
        this.updateDeckInfo(deckName, 40);
        
        this.closeDeckBuilder();
            this.showSuccess(result.updated ? 'Đã cập nhật deck!' : 'Đã lưu deck thành công!');
        } else {
            this.showError(result.error || 'Lỗi lưu deck');
        }
    }
    
    saveLocally(deckName, cards) {
        const localDecks = JSON.parse(localStorage.getItem('haikyuu_local_decks') || '[]');
        localDecks.push({ name: deckName, cards, id: Date.now() });
        localStorage.setItem('haikyuu_local_decks', JSON.stringify(localDecks));
    }
    
    getCurrentDeck() {
        if (this.selectedDeck.startsWith('saved_')) {
            const id = parseInt(this.selectedDeck.replace('saved_', ''));
            const deck = this.savedDecks.find(d => d.id === id);
            if (deck) return deck.cards;
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
