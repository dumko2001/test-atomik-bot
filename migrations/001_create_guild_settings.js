// Migration: Create guild_settings table
module.exports = {
    async up(db) {
        const sql = `
            CREATE TABLE IF NOT EXISTS guild_settings (
                guild_id TEXT PRIMARY KEY NOT NULL,
                stats_channel_id TEXT,
                leaderboard_channel_id TEXT,
                admin_role_id TEXT,
                updated_at TEXT NOT NULL
            )
        `;

        return new Promise((resolve, reject) => {
            db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(
                        'Created guild_settings table (if not exists).'
                    );
                    resolve();
                }
            });
        });
    },
};
