const BALANCE_MODEL = require("../../models/currency/balanceSchema");
const INVENTORY_MODEL = require("../../models/currency/inventorySchema");

class Createfunctions {
    static async createBalance(userId) {
        const balance_create = await BALANCE_MODEL.create({
            userId: userId,
            createdAt: Date.now(),
        });
        return balance_create;
    }

    static async createInventory(userId) {
        const inventory_create = await INVENTORY_MODEL.create({
            userId: userId,
            createdAt: Date.now(),
        });
        return inventory_create;
    }
}

module.exports = Createfunctions;
