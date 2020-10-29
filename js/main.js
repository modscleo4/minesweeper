'use strict';

window.addEventListener('appinstalled', () => {
    console.log('A2HS installed');
});

let timerFn = null;

const app = Vue.createApp({
    data: () => ({
        connection: {
            socket: null,
            address: null,
            gameid: new URLSearchParams(new URL(window.location).search).get('gameid') ?? null,
        },
        gamemode: null,
        sidebarOpened: false,
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        timer: 0,
        lost: false,
        won: false,
        flags: 0,
        seed: new URLSearchParams(new URL(window.location).search).get('seed') ?? null,
        _field: null,
        _field_flag: null,
        config: {
            get theme() {
                return localStorage.getItem('theme') ?? 'system';
            },

            set theme(val) {
                localStorage.setItem('theme', val);
                document.querySelector('html').setAttribute('theme', val);
            },

            get m() {
                return parseInt(localStorage.getItem('m') ?? '15');
            },

            set m(val) {
                localStorage.setItem('m', val);
            },

            get n() {
                return parseInt(localStorage.getItem('n') ?? '20');
            },

            set n(val) {
                localStorage.setItem('n', val);
            },

            get bombs() {
                return parseInt(localStorage.getItem('bombs') ?? '40');
            },

            set bombs(val) {
                localStorage.setItem('bombs', val);
            },
        },
    }),

    computed: {
        field: function () {
            if (this.gamemode === 'mp' && !this.seed) {
                return null;
            }

            if (!this._field) {
                if (!this.seed) {
                    this.regenerateSeed();
                }

                [this._field, this._field_flag] = generateArray(this.seed, this.config.m, this.config.n);
            }

            return this._field;
        },

        field_flag: function () {
            return this._field_flag;
        },
    },

    methods: {
        play: function () {
            this.gamemode = 'sp';
            this.regenerateArray();
        },

        regenerateSeed: function () {
            if (this.gamemode === 'sp') {
                this.seed = generateSeed(this.config.m, this.config.n, this.config.bombs);
            }
        },

        regenerateArray: function () {
            this.flags = 0;
            this.timer = 0;
            this.regenerateSeed();
            if (timerFn) {
                clearInterval(timerFn);
                timerFn = null;
            }

            [this._field, this._field_flag] = generateArray(this.seed, this.config.m, this.config.n);
        },

        format_val: function (i, j) {
            const v = this._field[i][j];
            if (this._field_flag[i][j] === 2) {
                return '<i class="fa fa-flag"></i>';
            } else if (this._field_flag[i][j] === 3) {
                return '?';
            }

            return v === -1 ? '<i class="fa fa-bomb"></i>' : v === 0 ? '&nbsp;' : v;
        },

        showAll: function () {
            for (let i = 0; i < this.config.m; i++) {
                for (let j = 0; j < this.config.n; j++) {
                    this._field_flag[i][j] = 1;
                }
            }
        },

        clickAt: function (i, j, noRecurse = false) {
            if (this.gamemode === 'mp') {
                sendClick(i, j);
            }

            if (i < 0 || i >= this.config.m || j < 0 || j >= this.config.n) {
                return;
            }

            if (this.won || this.lost) {
                return;
            }

            if (!timerFn) {
                timerFn = setInterval(() => this.timer++, 1000);
            }

            if (this._field_flag[i][j] === 2) {
                return;
            } else if (this._field_flag[i][j] === 3) {
                this._field_flag[i][j] === 0;
            } else if (!noRecurse && this._field[i][j] > 0 && this._field_flag[i][j] === 1 && count_flags(this._field_flag, i, j, this.config.m, this.config.n) === this._field[i][j]) {
                // N
                this.clickAt(i - 1, j, true);

                // NE
                this.clickAt(i - 1, j + 1, true);

                // E
                this.clickAt(i, j + 1, true);

                // SE
                this.clickAt(i + 1, j + 1, true);

                // S
                this.clickAt(i + 1, j, true);

                // SW
                this.clickAt(i + 1, j - 1, true);

                // W
                this.clickAt(i, j - 1, true);

                // NW
                this.clickAt(i - 1, j - 1, true);
            }

            if (this._field[i][j] === -1) {
                for (let i = 0; i < this.config.m; i++) {
                    for (let j = 0; j < this.config.n; j++) {
                        if (this._field[i][j] === -1) {
                            this._field_flag[i][j] = 1;
                        }
                    }
                }

                if (this.gamemode === 'sp') {
                    this.lost = true;
                    clearInterval(timerFn);
                    timerFn = null;
                }

                return;
            }

            reveal(this._field, this._field_flag, i, j, this.config.m, this.config.n);

            if (this.gamemode === 'sp' && this.flags === this.config.bombs && only_flags(this._field_flag, this.config.m, this.config.n)) {
                this.won = true;
                clearInterval(timerFn);
                timerFn = null;
            }
        },

        toggleFlag: function (i, j) {
            sendToggleFlag(i, j);

            if (this._field_flag[i][j] === 1) {
                return;
            }

            switch (this._field_flag[i][j]) {
                case 0:
                    this._field_flag[i][j] = 2;
                    this.flags++;

                    if (this.flags === this.config.bombs && only_flags(this._field_flag, this.config.m, this.config.n)) {
                        this.won = true;
                        clearInterval(timerFn);
                        timerFn = null;
                    }
                    break;

                case 2:
                    this._field_flag[i][j] = 3;
                    this.flags--;
                    break;

                case 3:
                    this._field_flag[i][j] = 0;
                    break;
            }
        },

        hover: function (i, j) {
            if (this._field_flag[i][j] !== 1) {
                return;
            }

            // N
            if (i - 1 >= 0) {
                document.querySelector(`#cell_${i - 1}_${j}`).classList.add('hovering');
            }

            // NE
            if (i - 1 >= 0 && j + 1 < this.config.n) {
                document.querySelector(`#cell_${i - 1}_${j + 1}`).classList.add('hovering');
            }

            // E
            if (j + 1 < this.config.n) {
                document.querySelector(`#cell_${i}_${j + 1}`).classList.add('hovering');
            }

            // SE
            if (i + 1 < this.config.m && j + 1 < this.config.n) {
                document.querySelector(`#cell_${i + 1}_${j + 1}`).classList.add('hovering');
            }

            // S
            if (i + 1 < this.config.m) {
                document.querySelector(`#cell_${i + 1}_${j}`).classList.add('hovering');
            }

            // SW
            if (i + 1 < this.config.m && j - 1 >= 0) {
                document.querySelector(`#cell_${i + 1}_${j - 1}`).classList.add('hovering');
            }

            // W
            if (j - 1 >= 0) {
                document.querySelector(`#cell_${i}_${j - 1}`).classList.add('hovering');
            }

            // NW
            if (i - 1 >= 0 && j - 1 >= 0) {
                document.querySelector(`#cell_${i - 1}_${j - 1}`).classList.add('hovering');
            }
        },

        hoverout: function (i, j) {
            Array.from(document.querySelectorAll('.field_cell.hovering')).forEach(el => {
                el.classList.remove('hovering');
            });
        },
    },
}).mount('#app');


