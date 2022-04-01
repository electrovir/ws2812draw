import {initMatrix, cleanUp, drawFrame, LedColor, MatrixDimensions} from '..';

const colorValues = Object.keys(LedColor)
    .filter(key => isNaN(Number(key)))
    .map(key => (LedColor as any)[key] as LedColor);

let values: number[][];
let frameDelay = 100;
let lastTime = process.hrtime()[0];
let frameCount = 0;

function draw(increment: boolean) {
    drawFrame(values);
    if (increment) {
        values = values.map(row =>
            row.map(value => colorValues[(colorValues.indexOf(value) + 1) % colorValues.length]),
        );
    }
    return true;
}

function animate(increment: boolean) {
    if (draw(increment)) {
        setTimeout(() => {
            animate(increment);
        }, frameDelay);
    }
    frameCount++;
    const newTime = process.hrtime()[0];
    if (newTime > lastTime) {
        const diff = newTime - lastTime;
        lastTime = newTime;
        // log the fps
        // getting 60 fps on raspberry pi
        process.stdout.write(`\r                         `);
        process.stdout.write(`\r${frameCount / diff}`);
        frameCount = 0;
    }
}

export function testDraw(dimensions: MatrixDimensions, brightness: number, inputColor?: number) {
    initMatrix(dimensions, brightness);

    var stdin = process.stdin;
    // without this, we would only get streams once enter is pressed
    stdin.setRawMode(true);
    // resume stdin in the parent process (node app won't quit all by itself
    // unless an error or process.exit() happens)
    stdin.resume();
    stdin.setEncoding('utf8');
    // on any data into stdin
    stdin.on('data', buffer => {
        const key = buffer.toString();
        const oldDelay = frameDelay;
        // ctrl-c ( end of text )
        if (key === '\u0003') {
            cleanUp();
            process.exit();
        }
        // write the key to stdout all normal like
        if (key === '=' || key === '+') {
            frameDelay += 10;
        } else if (key === '-') {
            frameDelay -= 10;
        }
        if (frameDelay < 0) {
            frameDelay = 0;
        }

        if (oldDelay !== frameDelay) {
            console.log(`\nNew frame delay: ${frameDelay}ms`);
        }
    });
    // values = Array(height)
    //     .fill(0)
    //     .map((_, index) => Array(width).fill(inputColor ? inputColor : colorValues[index % colorValues.length]));
    values = Array(dimensions.height)
        .fill(0)
        .map(() => Array(dimensions.width).fill(LedColor.Green));
    console.log('Starting led test');
    console.log(`Starting with frame delay of ${frameDelay}ms`);
    console.log('Type "=" to increase delay, "-" to decrease');
    console.log('Logging fps...');
    animate(inputColor == undefined);
}

function main() {
    const width = Number(process.argv[2]) || 8;
    const height = Number(process.argv[3]) || 8;
    const brightness = Number(process.argv[4]) || 50;
    const color = Number(process.argv[5]) || undefined;
    console.log(`Running with led array size ${height}x${width}, brightness ${brightness}`);

    testDraw({width, height}, brightness, color);
}

main();
