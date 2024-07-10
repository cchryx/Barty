const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        items: {
            type: Object,
            required: true,
            default: {},
        },
        stocks: {
            type: Object,
            required: true,
            default: {},
        },
        createdAt: {
            type: Number,
            default: Date.now(),
        },
    },
    { minimize: false }
);

const model = mongoose.model("Inventories", inventorySchema);

module.exports = model;
