function neighbours(arr, i, j, m, n) {
    let r = 0;

    // N
    if (i - 1 >= 0 && arr[i - 1][j] === -1) {
        r++;
    }

    // NE
    if (i - 1 >= 0 && j + 1 < n && arr[i - 1][j + 1] === -1) {
        r++;
    }

    // E
    if (j + 1 < n && arr[i][j + 1] === -1) {
        r++;
    }

    // SE
    if (i + 1 < m && j + 1 < n && arr[i + 1][j + 1] === -1) {
        r++;
    }

    // S
    if (i + 1 < m && arr[i + 1][j] === -1) {
        r++;
    }

    // SW
    if (i + 1 < m && j - 1 >= 0 && arr[i + 1][j - 1] === -1) {
        r++;
    }

    // W
    if (j - 1 >= 0 && arr[i][j - 1] === -1) {
        r++;
    }

    // NW
    if (i - 1 >= 0 && j - 1 >= 0 && arr[i - 1][j - 1] === -1) {
        r++;
    }

    return r;
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

String.prototype.replaceAt = function (index, replacement) {
    return `${this.substring(0, index)}${replacement}${this.substring(index + 1)}`;
}

function generateSeed(m, n, bombs) {
    let seed = '0'.repeat(m * n);
    let randb = [];
    while (randb.length < bombs) {
        let i;
        while (randb.includes(i = randomBetween(0, seed.length - 1)));
        randb.push(i);
        seed = seed.replaceAt(i, '1');
    }

    return bin2hex(seed);
}

function bin2hex(bin) {
    bin = bin.padStart(Math.ceil(bin.length / 4) * 4, '0');
    let hex = '';

    for (let i = 0; i < bin.length; i += 4) {
        hex += parseInt(`${bin[i]}${bin[i + 1]}${bin[i + 2]}${bin[i + 3]}`, 2).toString(16);
    }

    return hex;
}

function hex2bin(hex) {
    let bin = '';

    for (let i = 0; i < hex.length; i++) {
        bin += parseInt(hex[i], 16).toString(2).padStart(4, '0');
    }

    return bin;
}

function generateArray(seed, m, n) {
    console.log(`Seed: ${seed}`);
    seed = hex2bin(seed);
    seed = seed.slice(seed.length - m * n);
    const arr = Array.from(new Array(m), () => new Array(n).fill(0));
    const arr_flag = Array.from(new Array(m), () => new Array(n).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (seed[n * i + j] === '1') {
                arr[i][j] = -1;
            }
        }
    }

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (arr[i][j] !== -1) {
                arr[i][j] = neighbours(arr, i, j, m, n);
            }
        }
    }

    return [arr, arr_flag];
}

function reveal(arr, arr_flag, i, j, m, n) {
    if (i < 0 || i >= m || j < 0 || j >= n) {
        return;
    }
    
    if (arr[i][j] === -1) {
        return;
    }

    if (arr_flag[i][j] === 0) {
        arr_flag[i][j] = 1;

        if (arr[i][j] === 0) {
            // N
            reveal(arr, arr_flag, i - 1, j, m, n);

            // NE
            reveal(arr, arr_flag, i - 1, j + 1, m, n);

            // E
            reveal(arr, arr_flag, i, j + 1, m, n);

            // SE
            reveal(arr, arr_flag, i + 1, j + 1, m, n);

            // S
            reveal(arr, arr_flag, i + 1, j, m, n);

            // SW
            reveal(arr, arr_flag, i + 1, j - 1, m, n);

            // W
            reveal(arr, arr_flag, i, j - 1, m, n);

            // NW
            reveal(arr, arr_flag, i - 1, j - 1, m, n);
        }
    }
}

function count_flags(arr_flag, i, j, m, n) {
    let r = 0;

    // N
    if (i - 1 >= 0 && arr_flag[i - 1][j] === 2) {
        r++;
    }

    // NE
    if (i - 1 >= 0 && j + 1 < n && arr_flag[i - 1][j + 1] === 2) {
        r++;
    }

    // E
    if (j + 1 < n && arr_flag[i][j + 1] === 2) {
        r++;
    }

    // SE
    if (i + 1 < m && j + 1 < n && arr_flag[i + 1][j + 1] === 2) {
        r++;
    }

    // S
    if (i + 1 < m && arr_flag[i + 1][j] === 2) {
        r++;
    }

    // SW
    if (i + 1 < m && j - 1 >= 0 && arr_flag[i + 1][j - 1] === 2) {
        r++;
    }

    // W
    if (j - 1 >= 0 && arr_flag[i][j - 1] === 2) {
        r++;
    }

    // NW
    if (i - 1 >= 0 && j - 1 >= 0 && arr_flag[i - 1][j - 1] === 2) {
        r++;
    }

    return r;
}

function only_flags(arr_flag, m, n) {
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (arr_flag[i][j] === 0 || arr_flag[i][j] === 3) {
                return false;
            }
        }
    }

    return true;
}
