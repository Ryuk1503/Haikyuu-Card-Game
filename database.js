// ============================================
// DATABASE MODULE - PostgreSQL
// ============================================
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create PostgreSQL connection pool
// Connection string format: postgresql://user:password@host:port/database
// Or use individual environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Or use individual config (if DATABASE_URL not provided)
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'haikyuu_game',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});

// ============================================
// INITIALIZE DATABASE SCHEMA
// ============================================
async function initializeDatabase() {
    try {
        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                display_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                session_token TEXT
            )
        `);
        
        // Decks table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS decks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                cards TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        // Game stats table (optional, for future)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS game_stats (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                games_played INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        console.log('✅ Database initialized successfully');
        console.log(`📁 Using PostgreSQL database`);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    }
}

// ============================================
// USER MANAGEMENT
// ============================================
async function createUser(username, password, displayName = null) {
    try {
        // Check if username already exists
        const existingResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingResult.rows.length > 0) {
            return { success: false, error: 'Username đã tồn tại' };
        }
        
        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        // Insert user
        const result = await pool.query(
            `INSERT INTO users (username, password, display_name)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [username, hashedPassword, displayName || username]
        );
        
        const userId = result.rows[0].id;
        
        // Create initial stats
        await pool.query('INSERT INTO game_stats (user_id) VALUES ($1)', [userId]);
        
        return { success: true, userId };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error: 'Lỗi tạo tài khoản' };
    }
}

async function loginUser(username, password) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return { success: false, error: 'Tài khoản không tồn tại' };
        }
        
        const user = result.rows[0];
        
        if (!bcrypt.compareSync(password, user.password)) {
            return { success: false, error: 'Mật khẩu không đúng' };
        }
        
        // Generate session token
        const sessionToken = generateSessionToken();
        
        // Update last login and session token
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, session_token = $1 WHERE id = $2',
            [sessionToken, user.id]
        );
        
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

async function validateSession(sessionToken) {
    if (!sessionToken) return null;
    
    try {
        const result = await pool.query(
            'SELECT id, username, display_name FROM users WHERE session_token = $1',
            [sessionToken]
        );
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
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

async function logoutUser(userId) {
    try {
        await pool.query('UPDATE users SET session_token = NULL WHERE id = $1', [userId]);
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
async function saveDeck(userId, deckName, cards) {
    try {
        const cardsJson = JSON.stringify(cards);
        
        // Check if deck with same name exists
        const existingResult = await pool.query(
            'SELECT id FROM decks WHERE user_id = $1 AND name = $2',
            [userId, deckName]
        );
        
        if (existingResult.rows.length > 0) {
            // Update existing deck
            await pool.query(
                'UPDATE decks SET cards = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [cardsJson, existingResult.rows[0].id]
            );
            return { success: true, deckId: existingResult.rows[0].id, updated: true };
        } else {
            // Create new deck
            const result = await pool.query(
                `INSERT INTO decks (user_id, name, cards) 
                 VALUES ($1, $2, $3) 
                 RETURNING id`,
                [userId, deckName, cardsJson]
            );
            return { success: true, deckId: result.rows[0].id, updated: false };
        }
    } catch (error) {
        console.error('Error saving deck:', error);
        return { success: false, error: 'Lỗi lưu deck' };
    }
}

async function getUserDecks(userId) {
    try {
        const result = await pool.query(
            'SELECT id, name, cards, created_at, updated_at FROM decks WHERE user_id = $1',
            [userId]
        );
        
        return result.rows.map(deck => ({
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

async function deleteDeck(userId, deckId) {
    try {
        const result = await pool.query(
            'DELETE FROM decks WHERE id = $1 AND user_id = $2',
            [deckId, userId]
        );
        return { success: result.rowCount > 0 };
    } catch (error) {
        console.error('Error deleting deck:', error);
        return { success: false, error: 'Lỗi xóa deck' };
    }
}

async function getDeckById(deckId, userId) {
    try {
        const result = await pool.query(
            'SELECT * FROM decks WHERE id = $1 AND user_id = $2',
            [deckId, userId]
        );
        
        if (result.rows.length > 0) {
            const deck = result.rows[0];
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

// Initialize database on module load (async)
initializeDatabase().catch(err => {
    console.error('⚠️ Failed to initialize database:', err.message);
    console.log('⚠️ Server will continue but database features will not work.');
    console.log('⚠️ Set DATABASE_URL environment variable to enable database features.');
    // Don't exit - allow server to run without database for testing
});

module.exports = {
    createUser,
    loginUser,
    validateSession,
    logoutUser,
    saveDeck,
    getUserDecks,
    deleteDeck,
    getDeckById,
    pool // Export pool for direct queries if needed
};
