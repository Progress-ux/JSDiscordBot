const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Останавливает воспроизведение и очищает очередь'),

    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            return interaction.reply('🚫 Бот не находится в голосовом канале!');
        }

        queue = [];
        connection.destroy();
        await interaction.reply('⏹ Воспроизведение остановлено, очередь очищена.');
    },
};
