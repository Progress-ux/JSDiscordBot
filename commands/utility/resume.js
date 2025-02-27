const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Возобновляет воспроизведение текущего трека'),

    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            return interaction.reply('Бот не в голосовом канале!');
        }

        const player = connection.state.subscription?.player;
        if (!player || player.state.status !== 'paused') {
            return interaction.reply('Воспроизведение не приостановлено!');
        }

        // Возобновляем воспроизведение
        player.unpause();
        await interaction.reply('▶ Воспроизведение возобновлено.');
    },
};
