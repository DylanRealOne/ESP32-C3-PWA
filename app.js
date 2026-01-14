let bleChar = null;
const S_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const C_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

async function connectBLE() {
    try {
        // Requesting the device named 'NEXUS_NODE' as defined in C++
        const device = await navigator.bluetooth.requestDevice({ 
            filters: [{ services: [S_UUID] }] 
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(S_UUID);
        bleChar = await service.getCharacteristic(C_UUID);
        document.getElementById('stat').innerText = "Status: Connected to Node!";
    } catch (e) { 
        alert("Connection Failed: " + e); 
    }
}

async function sendConfig() {
    if (!bleChar) {
        alert("Please connect Bluetooth first!");
        return;
    }
    
    // Creating the JSON object that the ESP32 C++ code is expecting
    const configData = {
        s: document.getElementById('s').value, // WiFi SSID
        p: document.getElementById('p').value, // WiFi Password
        k: document.getElementById('k').value, // API Key
        i: document.getElementById('i').value, // Site ID (e.g. NXS377)
        m: document.getElementById('m').value  // Mode (Dev/Prod)
    };

    const dataString = JSON.stringify(configData);
    const encoder = new TextEncoder();
    
    try {
        await bleChar.writeValue(encoder.encode(dataString));
        document.getElementById('stat').innerText = "Status: Data Sent! Node is Rebooting...";
    } catch (e) {
        alert("Send Failed: " + e);
    }
}
