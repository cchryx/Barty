const INVENTORY_MODEL = require("../../models/currency/inventorySchema");
const { createInventory } = require("./createFunctions");
const { itemFetch } = require("./itemFunctions");

class Inventoryfunctions {
    static async inventoryFetch(userId) {
        let inventoryData = await INVENTORY_MODEL.findOne({ userId: userId });
        if (!inventoryData) {
            inventoryData = await createInventory(userId);
        }

        Object.keys(inventoryData.items).forEach((key) => {
            if (inventoryData.items[key] === 0) {
                delete inventoryData.items[key];
            }
        });

        const inventoryItemKeys = Object.keys(inventoryData.items);
        const perItemNetWorth = {};
        let inventoryNetworth = 0;
        let inventoryDisplay_array = [];
        let inventoryDisplay;

        for (let i = 0; i < 1; i++) {
            const itemData = await itemFetch(inventoryItemKeys[i]);
            if (!itemData) continue;

            const itemValue_net =
                inventoryData.items[inventoryItemKeys[i]] *
                itemData.itemPrices.value;

            inventoryNetworth += itemValue_net;
            perItemNetWorth[inventoryItemKeys[i]] = itemValue_net;
            inventoryDisplay_array.push(
                `${itemData.itemGraphics.emoji} **${
                    itemData.itemName
                }** - \`${inventoryData.items[
                    inventoryItemKeys[i]
                ].toLocaleString()}\`\n> ItemId: \`${itemData.itemId}\``
            );
        }

        inventoryDisplay =
            inventoryDisplay_array.length > 1
                ? inventoryDisplay_array
                      .map((element) => {
                          return element;
                      })
                      .join("\n")
                : "`No items present in this inventory.`";

        return {
            display: {
                raw: inventoryDisplay_array,
                string: inventoryDisplay,
            },
            values: {
                networth_items: inventoryNetworth || 0,
                networth_perItem: perItemNetWorth,
            },
            data: inventoryData,
        };
    }

    static async inventoryItemEdit(userId, itemNumber, action, value) {
        let inventoryData = await INVENTORY_MODEL.findOne({ userId: userId });
        if (!inventoryData) {
            inventoryData = await createInventory(userId);
        }

        if (!inventoryData.items[itemNumber]) {
            inventoryData.items[itemNumber] = 0;
        }

        if (action === "minus") {
            inventoryData.items[itemNumber] -= value;
        } else if (action === "add") {
            inventoryData.items[itemNumber] += value;
        } else if (action === "set") {
            inventoryData.items[itemNumber] = value;
        }

        return await INVENTORY_MODEL.findOneAndUpdate(
            {
                userId: userId,
            },
            inventoryData
        );
    }
}

module.exports = Inventoryfunctions;
