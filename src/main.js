

// Imports MUST be at the top level of the module.
import { WebContainer } from '@webcontainer/api';
import * as xterm from 'xterm'; // Corrected: Import all of xterm as a namespace.

// All executable code is wrapped in a main() function to ensure
// we can use a top-level try/catch block for fatal errors.
async function main() {
    console.log("Script module starting...");

    // --- COI Service Worker ---
    if (typeof SharedArrayBuffer === 'undefined') {
        console.log("SharedArrayBuffer is not available. Registering COI service worker.");
        const swCode = `
            self.addEventListener('install', () => self.skipWaiting());
            self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
            self.addEventListener('fetch', (event) => {
                if (event.request.mode === 'navigate') {
                    event.respondWith(
                        fetch(event.request).then((response) => {
                            const newHeaders = new Headers(response.headers);
                            newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
                            newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
                            return new Response(response.body, { headers: newHeaders });
                        })
                    );
                }
            });
        `;
        const swBlob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(swBlob);

        navigator.serviceWorker.register(swUrl).then(() => {
            console.log("Service worker registered. Reloading page to apply headers.");
            window.location.reload();
        });
        // Stop further execution until the page reloads with the new headers
        return;
    }

    // --- Main Application Logic ---
    console.log("Modules imported. Initializing application.");

    const xtermCss = document.createElement('link');
    xtermCss.rel = 'stylesheet';
    xtermCss.href = 'https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css';
    document.head.appendChild(xtermCss);

    const runButton = document.getElementById('run-button');
    const codeInput = document.getElementById('code-input');
    const terminalDiv = document.getElementById('terminal');

    let webcontainerInstance;
    const terminal = new xterm.Terminal({ convertEol: true, cursorBlink: true }); // Corrected: Use xterm.Terminal
    terminal.open(terminalDiv);

    // --- Manual Terminal Resizing --- 
    function fitTerminal() {
        const termContainer = terminal.element.parentElement;
        const core = terminal._core;
        if (!termContainer || !core) return; // Guard against early execution
        const dims = core.renderer.dimensions;

        if (dims.actualCellWidth === 0 || dims.actualCellHeight === 0) {
            return;
        }

        const containerWidth = termContainer.clientWidth;
        const containerHeight = termContainer.clientHeight;
        
        const cols = Math.floor(containerWidth / dims.actualCellWidth);
        const rows = Math.floor(containerHeight / dims.actualCellHeight);

        terminal.resize(cols, rows);
        console.log(`Resized terminal to ${cols}x${rows}`);
    }

    setTimeout(fitTerminal, 100);
    window.addEventListener('resize', fitTerminal);

    async function initializeWebContainer() {
        console.log("Initializing WebContainer...");
        terminal.write('\x1b[33mBooting WebContainer...\x1b[0m\r\n');
        try {
            webcontainerInstance = await WebContainer.boot();
            terminal.write('\x1b[32mWebContainer booted successfully!\x1b[0m\r\n');
            console.log("WebContainer booted successfully.");
        } catch (error) {
            terminal.write('\x1b[31mError booting WebContainer: ' + error + '\x1b[0m\r\n');
            console.error("Error booting WebContainer:", error);
        }
    }

    async function runCode() {
        console.log("'Run Code' button clicked.");
        if (!webcontainerInstance) {
            const msg = "WebContainer is not ready.";
            terminal.write('\x1b[31m' + msg + '\x1b[0m\r\n');
            console.error(msg);
            return;
        }

        const code = codeInput.value;
        terminal.write('\x1b[36m> node -e "..."\x1b[0m\r\n');

        try {
            const process = await webcontainerInstance.spawn('node', ['-e', code]);
            process.output.pipeTo(new WritableStream({
                write(data) {
                    terminal.write(data);
                }
            }));
        } catch (error) {
            terminal.write('\x1b[31mError running code: ' + error + '\x1b[0m\r\n');
            console.error("Error running code:", error);
        }
    }

    runButton.addEventListener('click', runCode);
    console.log("Event listener attached to 'Run Code' button.");

    await initializeWebContainer();
}

// This top-level try/catch will handle any fatal script errors.
try {
    main();
} catch (error) {
    console.error("A fatal error occurred in the main script:", error);
    document.body.innerHTML = `<pre style="color: red; padding: 20px;">A fatal error occurred: ${error.message}.\n\nCheck the developer console for details.</pre>`;
}
