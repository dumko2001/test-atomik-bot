require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { runMigrations } = require('./database/database');

// Startup validation - check for required environment variables
if (!process.env.DISCORD_TOKEN) {
    console.error('ERROR: DISCORD_TOKEN is missing from .env file.');
    process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
    console.error('ERROR: DISCORD_CLIENT_ID is missing from .env file.');
    process.exit(1);
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Create a collection to store commands
client.commands = new Collection();

// Dynamic event loader
function loadEvents() {
    const eventsPath = path.join(__dirname, 'discord', 'events');

    // Check if events directory exists
    if (!fs.existsSync(eventsPath)) {
        console.log('Events directory not found, skipping event loading.');
        return;
    }

    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        console.log(`Loaded event: ${event.name}`);
    }
}

// Dynamic command loader
function loadCommands() {
    const commandsPath = path.join(__dirname, 'discord', 'commands');

    // Check if commands directory exists
    if (!fs.existsSync(commandsPath)) {
        console.log('Commands directory not found, skipping command loading.');
        return;
    }

    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// Load events and commands
loadEvents();
loadCommands();

// Run database migrations and then login
(async () => {
    try {
        await runMigrations();
        console.log('Database migrations completed.');

        // Login to Discord with your client's token
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('Error during startup:', error);
        process.exit(1);
    }
})();
