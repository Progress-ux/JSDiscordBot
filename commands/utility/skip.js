const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Пропускает текущий трек'),
    
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            return interaction.reply('Бот не в голосовом канале!');
        }

        const player = connection.state.subscription?.player;
        if (!player) {
            return interaction.reply('Сейчас ничего не играет!');
        }

        player.stop();
        await interaction.reply('⏭ Пропущен текущий трек.');
    },
};
