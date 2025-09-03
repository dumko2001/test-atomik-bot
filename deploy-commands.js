require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Startup validation
if (!process.env.DISCORD_TOKEN) {
    console.error('ERROR: DISCORD_TOKEN is missing from .env file.');
    process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
    console.error('ERROR: DISCORD_CLIENT_ID is missing from .env file.');
    process.exit(1);
}

const commands = [];

// Grab all the command files from the commands directory
const commandsPath = path.join(__dirname, 'src', 'discord', 'commands');

// Check if commands directory exists
if (!fs.existsSync(commandsPath)) {
    console.log('Commands directory not found. No commands to deploy.');
    process.exit(0);
}

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`Loaded command: ${command.data.name}`);
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands globally
(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        // The put method is used to fully refresh all commands globally
        const data = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        console.error(error);
    }
})();
