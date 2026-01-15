let characteristic;
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
function updateStatus(msg, isError = false) {
    const el = document.getElementById('statusMessage');
    el.innerText = msg;
    el.style.color = isError ? 'red' : '#6b7280';
}
async function connectBLE() {
    try {
        updateStatus("Requesting device...");
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'NEXUS' }],
            optionalServices: [SERVICE_UUID]
        });
        device.addEventListener('gattserverdisconnected', onDisconnected);
        updateStatus("Connecting to GATT Server...");
        const server = await device.gatt.connect();
        updateStatus("Getting Service...");
        const service = await server.getPrimaryService(SERVICE_UUID);
        updateStatus("Getting Characteristic...");
        characteristic = await service.getCharacteristic(CHAR_UUID);
        updateStatus("Connected! Ready to configure.", false);
        document.getElementById('saveBtn').disabled = false;
        document.getElementById('btIcon').innerText = "✅";
        
    } catch (error) {
        console.error(error);
        updateStatus("Connection failed: " + error, true);
    }
}
function onDisconnected() {
    updateStatus("Device disconnected.", true);
    characteristic = null;
    document.getElementById('saveBtn').disabled = true;
    document.getElementById('btIcon').innerText = "📡";
}
async function sendConfig() {
    if (!characteristic) {
        alert("Please pair via Bluetooth first!");
        return;
    }
    // Basic Validation
    const ssid = document.getElementById('ssid').value;
    const pass = document.getElementById('pass').value;
    if(!ssid || !pass) {
        updateStatus("Error: WiFi SSID and Password required", true);
        return;
    }
    
    const data = {
        s: ssid,
        p: pass,
        k: document.getElementById('key').value,
        i: document.getElementById('site').value,
        m: document.getElementById('mode').value
    };
    const encoder = new TextEncoder();
    const payload = encoder.encode(JSON.stringify(data));
    
    try {
        document.getElementById('saveBtn').disabled = true; // Prevent double click
        await sendChunkedData(characteristic, payload);
        alert("Settings Saved! Device will reboot.");
        updateStatus("Configuration sent successfully.");
    } catch (error) {
        console.error(error);
        alert("Transmission failed: " + error);
        updateStatus("Transmission failed.", true);
    } finally {
        document.getElementById('saveBtn').disabled = false;
    }
}
// Function to send data in 20-byte chunks to respect BLE MTU
async function sendChunkedData(characteristic, data) {
    const CHUNK_SIZE = 20;
    const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, data.length);
        const chunk = data.slice(start, end);
        updateStatus(`Sending chunk ${i + 1}/${totalChunks}...`);
        
        // Write chunk and wait for acknowledgement
        await characteristic.writeValue(chunk);
        
        // Optional: slight delay to ensure stability if the receiver is slow
        await new Promise(r => setTimeout(r, 50)); 
    }
}
