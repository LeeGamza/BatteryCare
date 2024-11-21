const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    cellVoltages: [Number],
    packVoltage: Number,
    temperature: Number,
    current: Number,
    chargeRelay: Boolean,
    dischargeRelay: Boolean,
    timestamp: { type: Date, default: Date.now },
});

const lastStatusSchema = new mongoose.Schema({
    ...dataSchema.obj,
});

const lowDataSchema = new mongoose.Schema({
    ...dataSchema.obj,
    hourperdata: [{
        hour: Number,
        data: [dataSchema],
    }],
});

const Data = mongoose.model('Data', dataSchema);
const LastStatus = mongoose.model('LastStatus', lastStatusSchema);
const LowData = mongoose.model('LowData', lowDataSchema);

module.exports = { Data, LastStatus, LowData };
