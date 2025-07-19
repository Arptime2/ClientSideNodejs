import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const terminalEl = document.querySelector('.terminal');

const terminal = new Terminal({
    cursorBlink: true,
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(terminalEl);

fitAddon.fit();

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

window.addEventListener('load', async () => {
    terminal.write('Starting WebContainer...\n');
    try {
        webcontainerInstance = await WebContainer.boot();
        terminal.write('WebContainer started successfully!\n');
        startNodeRepl();
    } catch (error) {
        terminal.write(`Error starting WebContainer: ${error}\n`);
    }
});

async function startNodeRepl() {
    if (!webcontainerInstance) {
        terminal.write('WebContainer is not initialized.\n');
        return;
    }

    terminal.write('Starting Node.js REPL...\n');
    try {
        const process = await webcontainerInstance.spawn('node');
        process.output.pipeTo(new WritableStream({
            write(data) {
                terminal.write(data);
            }
        }));

        const input = process.input.getWriter();
        terminal.onData((data) => {
            input.write(data);
        });
    } catch (error) {
        terminal.write(`Error starting Node.js REPL: ${error}\n`);
    }
}
