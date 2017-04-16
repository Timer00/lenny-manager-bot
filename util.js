/**
 * Tagged template literal to unindent strings.
 * @param {Array<string>} strings
 * @param {...*} args
 * @return {string}
 */
function unindent(strings, ...args) {
    const pattern = /^ *\|/gm;
    let result = strings[0].replace(pattern, "");
    for (let i = 0; i < strings.length - 1; i++) {
        result += args[i];
        result += strings[i + 1].replace(pattern, "");
    }
    return result;
}

/**
 * Time string to milliseconds.
 * Example:
 *   parseTime('1000') => 1000
 *   parseTime('2s') => 2000
 *   parseTime('1m5s') => 65000
 *   parseTime('1h30m1s') => 5401000
 *   parseTime('1d') => 86400000
 * @param {string} time
 * @return {number}
 */
function parseTime(time) {
    const timeUnits = [
        // days
        { pattern: /(\d*\.?\d*)d/i, multiplier: 86400e3 },
        // hours
        { pattern: /(\d*\.?\d*)h/i, multiplier: 3600e3 },
        // minutes
        { pattern: /(\d*\.?\d*)m/i, multiplier: 60e3 },
        // seconds
        { pattern: /(\d*\.?\d*)s/i, multiplier: 1e3 },
        // milliseconds
        { pattern: /(\d*\.?\d*)\b/i, multiplier: 1 },
    ];

    return timeUnits.reduce((duration, { pattern, multiplier }) => {
        const match = time.match(pattern);
        const amount = match && Number(match[1]);
        if (amount) {
            return amount * multiplier + duration;
        } else {
            return duration;
        }
    }, 0);
}

module.exports = {
    unindent,
    parseTime,
};
