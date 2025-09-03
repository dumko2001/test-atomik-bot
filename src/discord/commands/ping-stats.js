const { SlashCommandBuilder } = require('discord.js');
const { getGuildSettings } = require('../../database/settings-manager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping-stats')
        .setDescription('Send a ping message to the configured stats channel'),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            // Get guild settings from database
            const settings = await getGuildSettings(guildId);

            // Check if stats channel is configured
            if (!settings || !settings.stats_channel_id) {
                return await interaction.reply({
                    content:
                        '⚠️ The stats channel has not been set. Please use `/bind stats_channel #channel` to configure it first.',
                    ephemeral: true,
                });
            }

            // Try to fetch the stats channel
            let statsChannel;
            try {
                statsChannel = await interaction.client.channels.fetch(
                    settings.stats_channel_id
                );
            } catch {
                console.warn(
                    `WARN: Could not find stats_channel with ID '${settings.stats_channel_id}' for guild '${guildId}'`
                );
                return await interaction.reply({
                    content:
                        '⚠️ The bound stats channel is missing or deleted. Please use `/bind stats_channel #channel` to configure a new one.',
                    ephemeral: true,
                });
            }

            // Send pong message to the stats channel
            await statsChannel.send('🏓 pong');

            // Confirm to the user
            await interaction.reply({
                content: `✅ Pong sent to ${statsChannel}!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error in ping-stats command:', error);
            await interaction.reply({
                content:
                    'There was an error while sending the ping. Please try again.',
                ephemeral: true,
            });
        }
    },
};
