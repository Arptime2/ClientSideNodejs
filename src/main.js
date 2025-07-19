import { WebContainer } from '@webcontainer/api';

async function main() {
    console.log("Script module starting...");

    // --- COI Service Worker ---
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
        terminalOutput.scrollTop = terminalOutput.scrollHeight; // Auto-scroll
    }

    async function initializeWebContainer() {
        console.log("Initializing WebContainer...");
        writeToTerminal('Booting WebContainer...\n');
        try {
            webcontainerInstance = await WebContainer.boot();
            writeToTerminal('WebContainer booted successfully!\n');
            console.log("WebContainer booted successfully.");
        } catch (error) {
            writeToTerminal(`Error booting WebContainer: ${error}\n`);
            console.error("Error booting WebContainer:", error);
        }
    }

    async function runCode() {
        console.log("'Run Code' button clicked.");
        if (!webcontainerInstance) {
            const msg = "WebContainer is not ready.";
            writeToTerminal(msg + '\n');
            console.error(msg);
            return;
        }

        const code = codeInput.value;
        writeToTerminal(`> node -e "..."\n`);

        try {
            const process = await webcontainerInstance.spawn('node', ['-e', code]);
            process.output.pipeTo(new WritableStream({
                write(data) {
                    writeToTerminal(data);
                }
            }));
        } catch (error) {
            writeToTerminal(`Error running code: ${error}\n`);
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