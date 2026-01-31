export default function shuffle(length: number): object {
    let arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(i);
    }
    for (let i = length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
    }
    // console.log(`Shuffle2: ${arr}`);
    return arr;
} 