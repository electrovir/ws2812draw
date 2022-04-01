import {drawScrollingText} from '../matrix-text';

function main() {
    /**
     *  Extra spaces are intentionally included at the end to make the text more legible in the simplest way possible. (For more complex padding, use custom alignment options.)
     */
    drawScrollingText(32, 50, 'hello world   ');
}

main();
