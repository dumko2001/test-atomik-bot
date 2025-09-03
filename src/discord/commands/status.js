const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../../database/settings-manager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Display the current bindings for this server'),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            // Get guild settings from database
            const settings = await getGuildSettings(guildId);

            // Create status embed
            const embed = new EmbedBuilder()
                .setTitle('🔧 Server Configuration Status')
                .setColor(0x0099ff)
                .setTimestamp();

            // Check each resource
            const resources = [
                {
                    key: 'stats_channel_id',
                    name: 'Stats Channel',
                    type: 'channel',
                },
                {
                    key: 'leaderboard_channel_id',
                    name: 'Leaderboard Channel',
                    type: 'channel',
                },
                { key: 'admin_role_id', name: 'Admin Role', type: 'role' },
            ];

            for (const resource of resources) {
                let status = 'Not set';
                let statusIcon = '❌';

                if (settings && settings[resource.key]) {
                    const id = settings[resource.key];

                    try {
                        let target;
                        if (resource.type === 'channel') {
                            target = await interaction.guild.channels.fetch(id);
                        } else if (resource.type === 'role') {
                            target = await interaction.guild.roles.fetch(id);
                        }

                        if (target) {
                            status = `${target.name} - Healthy`;
                            statusIcon = '✅';
                        } else {
                            status = `${id} - Missing (Deleted)`;
                            statusIcon = '⚠️';
                            console.warn(
                                `WARN: Could not find ${resource.key} with ID '${id}' for guild '${guildId}'`
                            );
                        }
                    } catch (error) {
                        status = `${id} - Missing (Deleted)`;
                        statusIcon = '⚠️';
                        console.warn(
                            `WARN: Could not find ${resource.key} with ID '${id}' for guild '${guildId}' - Error: ${error.message}`
                        );
                    }
                }

                embed.addFields({
                    name: `${statusIcon} ${resource.name}`,
                    value: status,
                    inline: false,
                });
            }

            // Add footer with last updated time
            if (settings && settings.updated_at) {
                embed.setFooter({
                    text: `Last updated: ${new Date(settings.updated_at).toLocaleString()}`,
                });
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in status command:', error);
            await interaction.reply({
                content:
                    'There was an error while fetching the server status. Please try again.',
                ephemeral: true,
            });
        }
    },
};
