# Discord Bot Mini-Version

A well-structured Discord bot skeleton built as a proof-of-concept to validate core architectural principles for modular, resilient bot development.

## Features

- **Modular Command & Event Loading**: Automatically loads commands and events from designated folders
- **Guild-Specific Configuration**: Persistent settings storage with SQLite database
- **Graceful Degradation**: Handles deleted channels/roles without crashing
- **Mock Commands**: Leaderboard and stats functionality for demonstration
- **Code Quality**: ESLint and Prettier configured for consistent code style
- **CI/CD**: GitHub Actions workflow for automated linting

## Commands

- `/bind <resource> <target>` - Bind a resource (stats_channel, leaderboard_channel, admin_role) to a channel or role
- `/status` - Display current bindings and their health status
- `/leaderboard` - Post mock leaderboard data to the configured channel
- `/ping-stats` - Send a ping message to the configured stats channel

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm
- A Discord application with bot token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test-discor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Discord credentials:
   ```
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   ```

4. **Deploy slash commands**
   ```bash
   npm run deploy
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## Development

### Available Scripts

- `npm start` - Start the bot
- `npm run deploy` - Deploy slash commands to Discord
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Project Structure

```
├── src/
│   ├── index.js                 # Main bot entry point
│   ├── database/
│   │   ├── database.js          # Database connection and utilities
│   │   └── settings-manager.js  # Guild settings management
│   └── discord/
│       ├── commands/            # Slash command implementations
│       │   ├── bind.js
│       │   ├── status.js
│       │   ├── leaderboard.js
│       │   └── ping-stats.js
│       └── events/              # Event handlers
│           ├── ready.js
│           └── interactionCreate.js
├── migrations/                  # Database migrations
│   └── 001_create_guild_settings.js
├── deploy-commands.js           # Command deployment script
├── .github/workflows/           # CI/CD workflows
└── docs/                        # Project documentation
```

### Database

The bot uses SQLite for simplicity. The database file (`database.sqlite`) is created automatically when the bot starts. Migrations run automatically on startup.

### Error Handling

The bot implements graceful degradation:
- Missing channels/roles are reported as "Missing (Deleted)" in status
- Commands that depend on missing resources show helpful error messages
- The bot logs warnings but continues operating

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run format` to ensure code quality
5. Submit a pull request

The CI workflow will automatically run linting checks on pull requests.

## License

ISC
