import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Zkontrolujte latenci bota'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply(`Pong! 🏓 \`${interaction.client.ws.ping}ms\``);
    },
};

export default command;