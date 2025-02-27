let queue = [];

function getQueue() {
    return queue;
}

function addToQueue(track) {
    queue.push(track);
}

function removeFromQueue() {
    return queue.shift();
}

function clearQueue() {
    queue = [];
}

module.exports = {
    getQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
};
