const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../../database/settings-manager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Post the leaderboard to the configured channel'),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            // Get guild settings from database
            const settings = await getGuildSettings(guildId);

            // Check if leaderboard channel is configured
            if (!settings || !settings.leaderboard_channel_id) {
                return await interaction.reply({
                    content:
                        '⚠️ The leaderboard channel has not been set. Please use `/bind leaderboard_channel #channel` to configure it first.',
                    ephemeral: true,
                });
            }

            // Try to fetch the leaderboard channel
            let leaderboardChannel;
            try {
                leaderboardChannel = await interaction.client.channels.fetch(
                    settings.leaderboard_channel_id
                );
            } catch {
                console.warn(
                    `WARN: Could not find leaderboard_channel with ID '${settings.leaderboard_channel_id}' for guild '${guildId}'`
                );
                return await interaction.reply({
                    content:
                        '⚠️ The bound leaderboard channel is missing or deleted. Please use `/bind leaderboard_channel #channel` to configure a new one.',
                    ephemeral: true,
                });
            }

            // Create mock leaderboard data
            const mockLeaderboard = [
                { rank: 1, user: 'UserA', points: 100 },
                { rank: 2, user: 'UserB', points: 80 },
                { rank: 3, user: 'UserC', points: 65 },
                { rank: 4, user: 'UserD', points: 45 },
                { rank: 5, user: 'UserE', points: 30 },
            ];

            // Create leaderboard embed
            const embed = new EmbedBuilder()
                .setTitle('🏆 Server Leaderboard')
                .setColor(0xffd700)
                .setTimestamp()
                .setFooter({ text: 'Mock data for demonstration purposes' });

            // Add leaderboard entries
            let description = '';
            for (const entry of mockLeaderboard) {
                const medal =
                    entry.rank === 1
                        ? '🥇'
                        : entry.rank === 2
                          ? '🥈'
                          : entry.rank === 3
                            ? '🥉'
                            : '🏅';
                description += `${medal} **${entry.rank}.** ${entry.user} - ${entry.points} pts\n`;
            }

            embed.setDescription(description);

            // Send leaderboard to the configured channel
            await leaderboardChannel.send({ embeds: [embed] });

            // Confirm to the user
            await interaction.reply({
                content: `✅ Leaderboard posted to ${leaderboardChannel}!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error in leaderboard command:', error);
            await interaction.reply({
                content:
                    'There was an error while posting the leaderboard. Please try again.',
                ephemeral: true,
            });
        }
    },
};
