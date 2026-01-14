const S_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const C_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

document.getElementById('pairBtn').addEventListener('click', async () => {
    // This alert confirms the browser is listening to your click
    alert("Starting Bluetooth search..."); 
    
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [S_UUID]
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(S_UUID);
        const char = await service.getCharacteristic(C_UUID);

        document.getElementById('step1').classList.add('hidden');
        document.getElementById('step2').classList.remove('hidden');
        document.getElementById('status').innerText = "Connected: " + device.name;
        
        // Save char globally for the next button
        window.activeChar = char;
    } catch (err) {
        alert("Bluetooth Error: " + err.message);
    }
});
