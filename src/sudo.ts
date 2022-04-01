export function checkSudo(): void {
    const isSudo = !!process.env.SUDO_UID;
    if (!isSudo) {
        console.error(`
SUDO_UID is not set, it is likely that you don't have permissions to properly run this library and it won't work.
Try running with sudo access like this: sudo -E env "PATH=$PATH" node dist/tests/simple-example.js
`);
    }
}
