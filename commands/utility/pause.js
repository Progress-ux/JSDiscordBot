const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Приостанавливает воспроизведение текущего трека'),

    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            return interaction.reply('Бот не в голосовом канале!');
        }

        const player = connection.state.subscription?.player;
        if (!player || player.state.status !== 'playing') {
            return interaction.reply('Сейчас ничего не играет!');
        }

        // Приостанавливаем воспроизведение
        player.pause();
        await interaction.reply('⏸ Воспроизведение приостановлено.');
    },
};
