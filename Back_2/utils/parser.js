function parseBmsData(data) {
    const cellVoltage1 = data.readUInt16BE(0) / 1000;
    const cellVoltage2 = data.readUInt16BE(2) / 1000;
    const cellVoltage3 = data.readUInt16BE(4) / 1000;
    const cellVoltage4 = data.readUInt16BE(6) / 1000;
    const packVoltage = data.readUInt16BE(8) / 1000;
    const temperature = data.readInt16BE(10) / 100;
    const current = data.readInt16BE(11) / 100;
    const chargeRelay = data.readUInt8(12) === 1;
    const dischargeRelay = data.readUInt8(13) === 1;

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
