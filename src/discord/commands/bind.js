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
                    { name: 'Leaderboard Channel', value: 'leaderboard_channel' },
                    { name: 'Admin Role', value: 'admin_role' }
                )
        )
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel to bind (if binding a channel)')
                .setRequired(false)
        )
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('The role to bind (if binding a role)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const resource = interaction.options.getString('resource');
        const channelTarget = interaction.options.getChannel('channel');
        const roleTarget = interaction.options.getRole('role');
        const guildId = interaction.guild.id;

        // --- New, more robust validation ---

        // 1. Check if both or neither were provided
        if ((channelTarget && roleTarget) || (!channelTarget && !roleTarget)) {
            return await interaction.reply({
                content: 'Error: You must provide exactly ONE target (either a channel OR a role).',
                ephemeral: true,
            });
        }

        // 2. Determine the single target that was provided
        const target = channelTarget || roleTarget;

        // 3. Check if the target type matches the resource type
        if (resource === 'admin_role' && !roleTarget) {
            return await interaction.reply({
                content: 'Error: The "Admin Role" resource can only be bound to a ROLE.',
                ephemeral: true,
            });
        }

        if (['stats_channel', 'leaderboard_channel'].includes(resource) && !channelTarget) {
            return await interaction.reply({
                content: 'Error: This resource can only be bound to a CHANNEL.',
                ephemeral: true,
            });
        }

        // --- End of new validation ---

        try {
            await updateGuildSetting(guildId, resource, target.id);
            const resourceName = resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            await interaction.reply({
                content: `✅ Successfully bound **${resourceName}** to ${target}`,
                ephemeral: false,
            });
        } catch (error) {
            console.error('Error in bind command:', error);
            await interaction.reply({
                content: 'There was an error while binding the resource. Please try again.',
                ephemeral: true,
            });
        }
    },
};