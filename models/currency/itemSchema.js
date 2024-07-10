const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        itemNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        itemId: {
            type: String,
            required: true,
            unique: true,
        },
        itemName: {
            type: String,
            required: true,
        },
        itemDescription: {
            type: String,
            required: true,
        },
        itemUsage: {
            type: String,
            default: null,
        },
        itemCategory: {
            type: String,
            required: true,
        },
        itemPrices: {
            type: Object,
            required: true,
            default: {
                shop_buy: null,
                shop_sell: null,
                value: null,
            },
        },
        itemProperties: {
            type: Object,
            required: true,
            default: {},
        },
        itemGraphics: {
            type: Object,
            required: true,
            default: {
                emoji: null,
                image_url: null,
            },
        },
        itemExtraData: {
            type: Object,
            required: true,
            default: {},
        },
    },
    { minimize: false }
);

const model = mongoose.model("Items", itemSchema);

module.exports = model;
