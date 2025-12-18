// ============================================
// DATABASE MODULE - SQLite with better-sqlite3
// ============================================
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create/open database
const db = new Database(path.join(__dirname, 'haikyuu_game.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// ============================================
// INITIALIZE DATABASE SCHEMA
// ============================================
function initializeDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            display_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            session_token TEXT
        )
    `);
    
    // Decks table
    db.exec(`
        CREATE TABLE IF NOT EXISTS decks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            cards TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    
    // Game stats table (optional, for future)
    db.exec(`
        CREATE TABLE IF NOT EXISTS game_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    
    console.log('✅ Database initialized successfully');
}

// ============================================
// USER MANAGEMENT
// ============================================
function createUser(username, password, displayName = null) {
    try {
        // Check if username already exists
        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (existing) {
            return { success: false, error: 'Username đã tồn tại' };
        }
        
        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        // Insert user
        const stmt = db.prepare(`
            INSERT INTO users (username, password, display_name)
            VALUES (?, ?, ?)
        `);
        const result = stmt.run(username, hashedPassword, displayName || username);
        
        // Create initial stats
        db.prepare('INSERT INTO game_stats (user_id) VALUES (?)').run(result.lastInsertRowid);
        
        return { success: true, userId: result.lastInsertRowid };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error: 'Lỗi tạo tài khoản' };
    }
}

function loginUser(username, password) {
    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        
        if (!user) {
            return { success: false, error: 'Tài khoản không tồn tại' };
        }
        
        if (!bcrypt.compareSync(password, user.password)) {
            return { success: false, error: 'Mật khẩu không đúng' };
        }
        
        // Generate session token
        const sessionToken = generateSessionToken();
        
        // Update last login and session token
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP, session_token = ? WHERE id = ?')
            .run(sessionToken, user.id);
        
        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.display_name,
                sessionToken
            }
        };
    } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, error: 'Lỗi đăng nhập' };
    }
}

function validateSession(sessionToken) {
    if (!sessionToken) return null;
    
    try {
        const user = db.prepare('SELECT id, username, display_name FROM users WHERE session_token = ?')
            .get(sessionToken);
        
        if (user) {
            return {
                id: user.id,
                username: user.username,
                displayName: user.display_name
            };
        }
        return null;
    } catch (error) {
        console.error('Error validating session:', error);
        return null;
    }
}

function logoutUser(userId) {
    try {
        db.prepare('UPDATE users SET session_token = NULL WHERE id = ?').run(userId);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Lỗi đăng xuất' };
    }
}

function generateSessionToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// ============================================
// DECK MANAGEMENT
// ============================================
function saveDeck(userId, deckName, cards) {
    try {
        const cardsJson = JSON.stringify(cards);
        
        // Check if deck with same name exists
        const existing = db.prepare('SELECT id FROM decks WHERE user_id = ? AND name = ?')
            .get(userId, deckName);
        
        if (existing) {
            // Update existing deck
            db.prepare('UPDATE decks SET cards = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(cardsJson, existing.id);
            return { success: true, deckId: existing.id, updated: true };
        } else {
            // Create new deck
            const result = db.prepare('INSERT INTO decks (user_id, name, cards) VALUES (?, ?, ?)')
                .run(userId, deckName, cardsJson);
            return { success: true, deckId: result.lastInsertRowid, updated: false };
        }
    } catch (error) {
        console.error('Error saving deck:', error);
        return { success: false, error: 'Lỗi lưu deck' };
    }
}

function getUserDecks(userId) {
    try {
        const decks = db.prepare('SELECT id, name, cards, created_at, updated_at FROM decks WHERE user_id = ?')
            .all(userId);
        
        return decks.map(deck => ({
            id: deck.id,
            name: deck.name,
            cards: JSON.parse(deck.cards),
            createdAt: deck.created_at,
            updatedAt: deck.updated_at
        }));
    } catch (error) {
        console.error('Error getting decks:', error);
        return [];
    }
}

function deleteDeck(userId, deckId) {
    try {
        const result = db.prepare('DELETE FROM decks WHERE id = ? AND user_id = ?')
            .run(deckId, userId);
        return { success: result.changes > 0 };
    } catch (error) {
        console.error('Error deleting deck:', error);
        return { success: false, error: 'Lỗi xóa deck' };
    }
}

function getDeckById(deckId, userId) {
    try {
        const deck = db.prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?')
            .get(deckId, userId);
        
        if (deck) {
            return {
                id: deck.id,
                name: deck.name,
                cards: JSON.parse(deck.cards)
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting deck:', error);
        return null;
    }
}

// Initialize database on module load
initializeDatabase();

module.exports = {
    createUser,
    loginUser,
    validateSession,
    logoutUser,
    saveDeck,
    getUserDecks,
    deleteDeck,
    getDeckById
};

