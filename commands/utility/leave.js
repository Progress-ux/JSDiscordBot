const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Отключает бота из голосового канала'),
    async execute(interaction) {
        const voiceChannel = interaction.guild.members.me.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('Бот не в голосовом канале!');
        }

        try {
            await voiceChannel.leave();
            await interaction.reply('Отключился от голосового канала');
        } catch (error) {
            console.error(error);
            await interaction.reply('Не удалось отключиться от канала.');
        }
    },
};
