function cleanURL(url) {
    // Если это плейлист, оставляем URL без изменений
    if (url.includes("youtube.com/playlist")) {
        if(url.includes('&'))
        {
            return url.split('&')[0];
        }
        else
        {
            return url;
        }
    } else {
        return url.split('?')[0]; // Удаляем всё после "?" для одиночного видео
    }
}

module.exports = { cleanURL };