import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const style = document.createElement('style');
style.innerHTML = `@import url('https://cdn.jsdelivr.net/npm/xterm@^5.0.0/css/xterm.css');`;
document.head.appendChild(style);

const codeInput = document.getElementById('code-input');
const runButton = document.getElementById('run-button');
const terminalContainer = document.querySelector('.terminal-container');

let terminal;
let webcontainerInstance;

async function initializeWebContainer() {
    terminal = new Terminal({
        cursorBlink: true,
    });
    const fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalContainer);
    fitAddon.fit();

    terminal.write('Starting WebContainer...\n');
    try {
        webcontainerInstance = await WebContainer.boot();
        terminal.write('WebContainer started successfully!\n');
    } catch (error) {
        terminal.write(`Error starting WebContainer: ${error}\n`);
    }
}

async function runCode() {
    if (!webcontainerInstance) {
        terminal.write('WebContainer is not initialized.\n');
        return;
    }

    const code = codeInput.value;
    if (!code) {
        terminal.write('Please enter some code to run.\n');
        return;
    }

    terminal.write('Running code...\n');
    try {
        const process = await webcontainerInstance.spawn('node', ['-e', code]);
        process.output.pipeTo(new WritableStream({
            write(data) {
                terminal.write(data);
            }
        }));
    } catch (error) {
        terminal.write(`Error running code: ${error}\n`);
    }
}

window.addEventListener('load', initializeWebContainer);
runButton.addEventListener('click', runCode);
