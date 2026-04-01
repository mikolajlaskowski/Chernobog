import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config();

const token: string | undefined = process.env.DISCORD_TOKEN;
const clientId: string | undefined = process.env.CLIENT_ID;
const guildId: string | undefined = process.env.GUILD_ID;

if (!token) throw new Error('DISCORD_TOKEN není nastaven v .env souboru');
if (!clientId) throw new Error('CLIENT_ID není nastaven v .env souboru');
if (!guildId) throw new Error('GUILD_ID není nastaven v .env souboru');

const commands: object[] = [];

const foldersPath: string = path.join(__dirname, 'commands');
const commandFolders: string[] = fs.readdirSync(foldersPath);
const ext: ".ts" | ".js" = __filename.endsWith('.ts') ? '.ts' : '.js';

for (const folder of commandFolders) {
    const commandsPath: string = path.join(foldersPath, folder);
    const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith(ext));

    for (const file of commandFiles) {
        const filePath: string = path.join(commandsPath, file);
        const command: any = require(filePath).default;

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.warn(`[VAROVÁNÍ] Příkaz na ${filePath} nemá vlastnost "data" nebo "execute".`);
        }
    }
}

const rest = new REST().setToken(token);

async function deploy(): Promise<void> {
    try {
        console.log(`Začínám obnovovat ${commands.length} příkazů (/)`);
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId!, guildId!),
            { body: commands }
        ) as object[];
        console.log(`Úspěšně obnoveno ${data.length} příkazů (/)`);
    } catch (error) {
        console.error(error);
    }
}

deploy().catch((error: any): never => {console.error(error); process.exit(1); });