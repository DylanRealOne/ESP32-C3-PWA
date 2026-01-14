let characteristic;

async function connectBLE() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'NEXUS' }],
            optionalServices: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
        characteristic = await service.getCharacteristic("beb5483e-36e1-4688-b7f5-ea07361b26a8");
        alert("Connected to Nexus Node!");
    } catch (error) {
        alert("Bluetooth Error: " + error);
    }
}

async function sendConfig() {
    if (!characteristic) return alert("Please pair via Bluetooth first!");
    
    const data = {
        s: document.getElementById('ssid').value,
        p: document.getElementById('pass').value,
        k: document.getElementById('key').value,
        i: document.getElementById('site').value,
        m: document.getElementById('mode').value
    };

    const encoder = new TextEncoder();
    const payload = encoder.encode(JSON.stringify(data));
    
    try {
        // Send data
        await characteristic.writeValue(payload);
        alert("Settings Saved! The device will now reboot and auto-connect.");
    } catch (error) {
        alert("Transmission failed. If your API key is long, we may need to use the 'chunking' version. Error: " + error);
    }
}
