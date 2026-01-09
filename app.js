// These MUST match the UUIDs in your ESP32 code exactly
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

async function connectBLE() {
    const ssid = document.getElementById('ssid').value;
    const pass = document.getElementById('pass').value;
    const api = document.getElementById('api').value;
    const site = document.getElementById('site').value;

    if (!ssid || !pass || !api || !site) {
        alert("Please fill in all fields");
        return;
    }

    const statusBody = document.getElementById('status');
    
    try {
        statusBody.innerText = "Searching for Nexus Node...";
        
        // 1. Request Bluetooth Device
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'NEXUS_NODE' }],
            optionalServices: [SERVICE_UUID]
        });

        statusBody.innerText = "Connecting...";
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        // 2. Prepare the data (Format: SSID|PASS|APIKEY|SITEID)
        const payload = `${ssid}|${pass}|${api}|${site}`;
        const encoder = new TextEncoder();
        
        statusBody.innerText = "Sending credentials...";
        await characteristic.writeValue(encoder.encode(payload));

        statusBody.innerText = "Success! Device rebooting...";
        await device.gatt.disconnect();
        
    } catch (error) {
        console.log(error);
        statusBody.innerText = "Error: " + error.message;
    }
}
