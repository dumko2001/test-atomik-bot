const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Function to run migrations
async function runMigrations() {
    const migrationsPath = path.join(__dirname, '..', '..', 'migrations');

    // Check if migrations directory exists
    if (!fs.existsSync(migrationsPath)) {
        console.log('Migrations directory not found, skipping migrations.');
        return;
    }

    const migrationFiles = fs
        .readdirSync(migrationsPath)
        .filter((file) => file.endsWith('.js'))
        .sort(); // Ensure migrations run in order

    for (const file of migrationFiles) {
        const filePath = path.join(migrationsPath, file);
        const migration = require(filePath);

        try {
            await migration.up(db);
            console.log(`Migration ${file} completed successfully.`);
        } catch (error) {
            console.error(`Error running migration ${file}:`, error);
            throw error;
        }
    }
}

// Promisify database operations
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Close database connection
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Database connection closed.');
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    runMigrations,
    runQuery,
    getQuery,
    allQuery,
    closeDatabase,
};
