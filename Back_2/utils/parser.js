function parseBmsData(data) {
    if (data.length < 16) {
        throw new Error(`Invalid data length: ${data.length}. Expected at least 16 bytes.`);
    }

    const cellVoltage1 = data.readUInt16LE(0) / 10000;
    const cellVoltage2 = data.readUInt16LE(2) / 10000;
    const cellVoltage3 = data.readUInt16LE(4) / 10000;
    const cellVoltage4 = data.readUInt16LE(6) / 10000;

    const packVoltage = data.readUInt16LE(8) / 1000;
    const temperature = data.readInt16LE(10) / 1000;
    const current = data.readUInt16LE(12) / 100;
    const chargeRelay = data.readUInt8(14) === 1;
    const dischargeRelay = data.readUInt8(15) === 1;

    return {
        cellVoltages: [cellVoltage1, cellVoltage2, cellVoltage3, cellVoltage4],
        packVoltage,
        temperature,
        current,
        chargeRelay,
        dischargeRelay,
    };
}

module.exports = { parseBmsData };
