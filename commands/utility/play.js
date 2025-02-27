const { exec } = require('child_process');
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const { cleanURL } = require('../utility/utils');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { createReadStream } = require('fs');
const { Readable } = require('stream');
const fs = require('fs').promises;
const { addToQueue, getQueue } = require('../utility/queue');

let isPlaying = false;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Проигрывает трек или плейлист из YouTube')
        .addStringOption(option => option.setName('url').setDescription('URL видео или плейлиста на YouTube').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const url = interaction.options.getString('url');
        const cleanedUrl = cleanURL(url);
        console.log(`Очистка URL: ${cleanedUrl}`);

        let tracks = [];

        try {
            if (cleanedUrl.includes("playlist")) {
                console.log('Обнаружен плейлист, извлекаем треки...');
                tracks = await getPlaylistInfo(cleanedUrl);
            } else {
                console.log('Обнаружено одиночное видео.');
                tracks.push(await getVideoInfo(cleanedUrl));
            }

            if (tracks.length === 0) {
                return interaction.editReply('Не удалось найти треки.');
            }

            tracks.forEach(track => addToQueue(track));

            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) {
                return interaction.editReply('Вы должны быть в голосовом канале!');
            }

            let connection = getVoiceConnection(interaction.guild.id);
            if (!connection || connection.state.status === 'disconnected') {
                connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
            }

            if (isPlaying) {
                return interaction.editReply(`Трек добавлен в очередь: ${tracks[0].title}`);
            }
            
            isPlaying = true;
            const player = createAudioPlayer();
            connection.subscribe(player);
            playNextTrack(player, connection, interaction);
        } catch (error) {
            console.error('Ошибка при выполнении команды:', error);
            await interaction.editReply('Ошибка при загрузке трека.');
        }
    },
};

async function playNextTrack(player, connection, interaction) {
    if (getQueue().length === 0) {
        isPlaying = false;
        return;
    }

    const track = getQueue().shift();
    console.log(`▶ Воспроизведение: ${track.title}`);

    try {
        const audioUrl = await getAudioUrl(track.url);
        const resource = await createAudioResourceFromFFmpeg(audioUrl);
        player.play(resource);

        await interaction.editReply(`▶ Сейчас играет: ${track.title}`);

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('▶ Трек играет!');
        });
        
        player.once(AudioPlayerStatus.Idle, () => {
            console.log('⏭ Переход к следующему треку...');
            playNextTrack(player, connection, interaction);
        });
        
    } catch (error) {
        console.error('Ошибка при воспроизведении трека:', error);
        playNextTrack(player, connection, interaction);
    }
}

async function getAudioUrl(videoUrl) {
    return new Promise((resolve, reject) => {
        exec(`yt-dlp -f bestaudio -g ${videoUrl}`, (error, stdout) => {
            if (error) return reject(error);
            const audioUrl = stdout.trim();
            if (!audioUrl || !audioUrl.startsWith('http')) return reject(new Error('Недействительный аудио URL.'));
            resolve(audioUrl);
        });
    });
}

// Папка для временных файлов в проекте
const TEMP_DIR = path.join(__dirname, 'temp');

async function ensureTempDir() {
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch (err) {
        console.error(`Ошибка при создании папки temp: ${err.message}`);
    }
}

async function createAudioResourceFromFFmpeg(url) {
    await ensureTempDir(); // Проверяем и создаём папку при необходимости

    return new Promise((resolve, reject) => {
        const tmpFile = path.join(TEMP_DIR, `audio-${Date.now()}.mp3`);

        console.log(`FFmpeg сохраняет аудио в: ${tmpFile}`);

        ffmpeg(url)
            .audioCodec('libmp3lame')
            .format('mp3')
            .save(tmpFile)
            .on('end', async () => {
                console.log('FFmpeg завершил обработку, начинаем воспроизведение...');

                const stream = createReadStream(tmpFile);
                const resource = createAudioResource(Readable.from(stream));

                // Автоматическое удаление файла после воспроизведения
                resource.playStream.on('close', async () => {
                    try {
                        await fs.unlink(tmpFile);
                        console.log(`Удалён временный файл: ${tmpFile}`);
                    } catch (err) {
                        console.error(`Ошибка удаления файла: ${err.message}`);
                    }
                });

                resolve(resource);
            })
            .on('error', (err) => {
                console.error(`Ошибка FFmpeg: ${err.message}`);
                reject(err);
            });
    });
}

async function getVideoInfo(videoUrl) {
    return new Promise((resolve, reject) => {
        exec(`yt-dlp -j ${videoUrl}`, (error, stdout) => {
            if (error) return reject(error);
            try {
                const data = JSON.parse(stdout);
                resolve({ title: data.title, url: videoUrl });
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
}

async function getPlaylistInfo(playlistUrl) {
    return new Promise((resolve, reject) => {
        exec(`yt-dlp -j --flat-playlist ${playlistUrl}`, (error, stdout) => {
            if (error) return reject(error);
            try {
                const entries = stdout.trim().split('\n').map(JSON.parse);
                const tracks = entries.map(entry => ({ title: entry.title, url: `https://www.youtube.com/watch?v=${entry.id}` }));
                resolve(tracks);
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
}
