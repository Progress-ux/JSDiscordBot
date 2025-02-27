const { SlashCommandBuilder } = require('discord.js');
const { getQueue } = require('../utility/queue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Показывает текущую очередь треков'),

    async execute(interaction) {
        const queue = getQueue();

        if (queue.length === 0) {
            return interaction.reply('📭 Очередь пуста!');
        }

        let playlistMessage = '🎵 **Очередь треков:**\n';
        queue.forEach((track, index) => {
            playlistMessage += `${index + 1}. ${track.title}\n`;
        });

        await interaction.reply(playlistMessage);
    },
};
