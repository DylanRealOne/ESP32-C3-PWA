let bleChar = null;
const S_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const C_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

async function connectBLE() {
    try {
        const device = await navigator.bluetooth.requestDevice({ filters: [{ services: [S_UUID] }] });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(S_UUID);
        bleChar = await service.getCharacteristic(C_UUID);
        document.getElementById('stat').innerText = "Status: Connected!";
    } catch (e) { alert("Connection Failed: " + e); }
}

async function sendConfig() {
    const data = JSON.stringify({
        s: document.getElementById('s').value,
        p: document.getElementById('p').value,
        k: document.getElementById('k').value,
        i: document.getElementById('i').value,
        m: document.getElementById('m').value
    });
    const encoder = new TextEncoder();
    await bleChar.writeValue(encoder.encode(data));
    document.getElementById('stat').innerText = "Status: Data Sent! Rebooting...";
}
