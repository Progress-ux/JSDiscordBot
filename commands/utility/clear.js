const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Очищает текущую очередь треков'),

    async execute(interaction) {
        // Очистка очереди
        queue = [];
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            return interaction.reply('Бот не в голосовом канале!');
        }

        const player = connection.state.subscription?.player;
        if (player && player.state.status === 'playing') {
            // Прекращаем текущий трек
            player.stop();
        }

        await interaction.reply('Очередь очищена.');
    },
};
