/* jshint esversion:6 */

let array = Array.from({
    length: 9
}, () => Array.from({
    length: 9
}, () => " "));

export default function callback(candidate) {
    if (candidate.length() === 0) {
        const text = candidate.toString();
        const match = text.match(/\(\(Cell (\d) (\d)\) = \(Literal (\d)\)\)/);
        if (match) {
            const row = parseInt(match[1], 10);
            const col = parseInt(match[2], 10);
            const value = match[3];
            array[row - 1][col - 1] = value;
            console.log("Current partial solution:");
            for (let i = 0; i < 9; i++) {
                console.log(array[i].join("|"));
            }
        }
    }
}
