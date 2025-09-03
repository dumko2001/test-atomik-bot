const { getQuery, runQuery } = require('./database');

/**
 * Get guild settings from the database
 * @param {string} guildId - The Discord guild ID
 * @returns {Promise<Object|null>} Guild settings object or null if not found
 */
async function getGuildSettings(guildId) {
    try {
        const sql = 'SELECT * FROM guild_settings WHERE guild_id = ?';
        const result = await getQuery(sql, [guildId]);
        return result || null;
    } catch (error) {
        console.error('Error getting guild settings:', error);
        throw error;
    }
}

/**
 * Update a specific guild setting
 * @param {string} guildId - The Discord guild ID
 * @param {string} resource - The resource type (stats_channel, leaderboard_channel, admin_role)
 * @param {string} id - The channel or role ID to bind
 * @returns {Promise<void>}
 */
async function updateGuildSetting(guildId, resource, id) {
    try {
        // Map resource names to database column names
        const resourceMap = {
            stats_channel: 'stats_channel_id',
            leaderboard_channel: 'leaderboard_channel_id',
            admin_role: 'admin_role_id',
        };

        const columnName = resourceMap[resource];
        if (!columnName) {
            throw new Error(`Invalid resource type: ${resource}`);
        }

        const currentTime = new Date().toISOString();

        // Check if guild settings exist
        const existingSettings = await getGuildSettings(guildId);

        if (existingSettings) {
            // Update existing record
            const sql = `UPDATE guild_settings SET ${columnName} = ?, updated_at = ? WHERE guild_id = ?`;
            await runQuery(sql, [id, currentTime, guildId]);
        } else {
            // Insert new record
            const sql = `
                INSERT INTO guild_settings (guild_id, ${columnName}, updated_at)
                VALUES (?, ?, ?)
            `;
            await runQuery(sql, [guildId, id, currentTime]);
        }

        console.log(`Updated ${resource} for guild ${guildId} to ${id}`);
    } catch (error) {
        console.error('Error updating guild setting:', error);
        throw error;
    }
}

module.exports = {
    getGuildSettings,
    updateGuildSetting,
};
