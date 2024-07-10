const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        balance: {
            type: Object,
            required: true,
            default: {
                pocket: 0,
                bank: 0,
            },
        },
        storage: {
            type: Object,
            required: true,
            default: {
                pocket: 1000000000,
                bank: {
                    experience: 0,
                    pernament: 0,
                },
            },
        },
        createdAt: {
            type: Number,
            default: Date.now(),
        },
    },
    { minimize: false }
);

const model = mongoose.model("Balances", balanceSchema);

module.exports = model;
