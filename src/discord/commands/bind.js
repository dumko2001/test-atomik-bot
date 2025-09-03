const { SlashCommandBuilder } = require('discord.js');
const { updateGuildSetting } = require('../../database/settings-manager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bind')
        .setDescription('Bind a resource to a channel or role')
        .addStringOption((option) =>
            option
                .setName('resource')
                .setDescription('The resource to bind')
                .setRequired(true)
                .addChoices(
                    { name: 'Stats Channel', value: 'stats_channel' },
                    {
                        name: 'Leaderboard Channel',
                        value: 'leaderboard_channel',
                    },
                    { name: 'Admin Role', value: 'admin_role' }
                )
        )
        .addMentionableOption((option) =>
            option
                .setName('target')
                .setDescription('The channel or role to bind')
                .setRequired(true)
        ),

    async execute(interaction) {
        const resource = interaction.options.getString('resource');
        const target = interaction.options.getMentionable('target');
        const guildId = interaction.guild.id;

        // Validate that the target is appropriate for the resource
        if (resource === 'admin_role' && !target.roles) {
            return await interaction.reply({
                content: 'Admin role must be bound to a role, not a channel.',
                ephemeral: true,
            });
        }

        if (
            (resource === 'stats_channel' ||
                resource === 'leaderboard_channel') &&
            target.roles
        ) {
            return await interaction.reply({
                content: 'Channels must be bound to channels, not roles.',
                ephemeral: true,
            });
        }

        try {
            // Update the guild setting in the database
            await updateGuildSetting(guildId, resource, target.id);

            // Create a user-friendly resource name
            const resourceNames = {
                stats_channel: 'Stats Channel',
                leaderboard_channel: 'Leaderboard Channel',
                admin_role: 'Admin Role',
            };

            const resourceName = resourceNames[resource];
            const targetName = target.name || target.displayName;

            await interaction.reply({
                content: `✅ Successfully bound **${resourceName}** to ${target} (${targetName})`,
                ephemeral: false,
            });
        } catch (error) {
            console.error('Error in bind command:', error);
            await interaction.reply({
                content:
                    'There was an error while binding the resource. Please try again.',
                ephemeral: true,
            });
        }
    },
};
