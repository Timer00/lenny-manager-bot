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

module.exports = {
    unindent,
};
