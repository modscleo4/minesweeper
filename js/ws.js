const socket = new WebSocket('ws://localhost:8000', 'msjs');

function sendClick(i, j) {
    if (socket.readyState !== socket.OPEN) {
        return;
    }

    socket.send(JSON.stringify({
        command: 'clickAt',
        i,
        j,
    }));
}

function sendToggleFlag(i, j) {
    if (socket.readyState !== socket.OPEN) {
        return;
    }

    socket.send(JSON.stringify({
        command: 'toggleFlag',
        i,
        j,
    }));
}

const commands = {
    seed: async (message) => {
        app.$data.seed = message.seed;
        app.regenerateArray();
    },

    lost: async (message) => {
        if (message.isPlayer) {
            app.$data.lost = true;
        }
    },

    won: async (message) => {
        if (message.isPlayer) {
            app.$data.won = true;
        } else {
            app.$data.lost = true;
        }
    },
};

socket.addEventListener('open', () => {
    socket.send(JSON.stringify({
        command: 'login',
        gameid: app.$data.gameid,
        config: {
            m: app.$data.config.m,
            n: app.$data.config.n,
            bombs: app.$data.config.bombs,
        },
    }));
});

socket.addEventListener('message', async e => {
    const message = JSON.parse(e.data);

    if (!(message.command in commands)) {
        return;
    }

    await commands[message.command](message);
});
