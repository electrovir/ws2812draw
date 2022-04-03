import {drawScrollingText} from '..';

function main() {
    /**
     * Extra spaces are intentionally included at the end to make the text more legible in the
     * simplest way possible. (For more complex padding, use custom alignment options.)
     */
    drawScrollingText({width: 32, brightness: 50, text: 'hello world   '});
}

main();
