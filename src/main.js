

import { WebContainer } from '@webcontainer/api';

async function main() {
    console.log("Script module starting...");

    // --- Smart COI Service Worker Registration ---
    if (typeof SharedArrayBuffer === 'undefined') {
        console.log("SharedArrayBuffer is not available. Registering COI service worker.");
        const swPath = new URL('coi-serviceworker.js', window.location.href).pathname;
        navigator.serviceWorker.register(swPath).then(() => {
            console.log("Service worker registered. Reloading page to apply headers.");
            window.location.reload();
        });
        return;
    }

    // --- Main Application Logic ---
    console.log("Initializing application.");

    const runButton = document.getElementById('run-button');
    const codeInput = document.getElementById('code-input');
    const terminalOutput = document.getElementById('terminal-output');

    let webcontainerInstance;

    function writeToTerminal(data) {
        terminalOutput.textContent += data;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    async function initializeWebContainer() {
        writeToTerminal('Booting WebContainer...\n');
        try {
            webcontainerInstance = await WebContainer.boot();
            writeToTerminal('WebContainer booted successfully!\n');

            webcontainerInstance.on('server-ready', (port, url) => {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.textContent = `Server is ready! Click to open: ${url}`;
                terminalOutput.appendChild(document.createElement('br'));
                terminalOutput.appendChild(link);
                terminalOutput.appendChild(document.createElement('br'));
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            });

        } catch (error) {
            writeToTerminal(`Error booting WebContainer: ${error}\n`);
        }
    }

    async function runCode() {
        if (!webcontainerInstance) {
            writeToTerminal("WebContainer is not ready.\n");
            return;
        }

        const code = codeInput.value;
        writeToTerminal(`> node script.js\n`);

        try {
            await webcontainerInstance.fs.writeFile('script.js', code);
            const process = await webcontainerInstance.spawn('node', ['script.js']);
            process.output.pipeTo(new WritableStream({
                write(data) {
                    writeToTerminal(data);
                }
            }));
        } catch (error) {
            writeToTerminal(`Error running code: ${error}\n`);
        }
    }

    runButton.addEventListener('click', runCode);
    await initializeWebContainer();
}

// This top-level try/catch will handle any fatal script errors.
try {
    main();
} catch (error) {
    console.error("A fatal error occurred:", error);
    document.body.innerHTML = `<pre style="color: red; padding: 20px;">A fatal error occurred: ${error.message}.</pre>`;
}

