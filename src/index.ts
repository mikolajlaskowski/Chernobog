import {Client, Collection, Events, GatewayIntentBits, InteractionReplyOptions, MessageFlags} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import { Command } from './types';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection<string, Command>();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const ext = __filename.endsWith('.ts') ? '.ts' : '.js';

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(ext));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command: Command = require(filePath).default;

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[VAROVÁNÍ] Příkaz na ${filePath} nemá vlastnost "data" nebo "execute".`);
        }
    }
}

client.once(Events.ClientReady, (c): void => {
    console.log(`Přihlášen jako ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction): Promise<void> => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Příkaz ${interaction.commandName} nebyl nalezen.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const errorMessage: InteractionReplyOptions = {
            content: 'Při provádění příkazu došlo k chybě!',
            flags: [MessageFlags.Ephemeral]
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('DISCORD_TOKEN není nastaven v .env souboru');

client.login(token).catch(console.error);