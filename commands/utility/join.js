const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Подключает бота к голосовому каналу'),
    
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        
        if (!voiceChannel) {
            return interaction.reply('Вы должны быть в голосовом канале!');
        }

        try {
            // Используем joinVoiceChannel из @discordjs/voice для подключения
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            await interaction.reply(`Подключился к каналу ${voiceChannel.name}`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Не удалось подключиться к голосовому каналу.');
        }
    },
};
