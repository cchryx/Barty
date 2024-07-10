const ITEM_MODEL = require("../../models/currency/itemSchema");

class Itemfunctions {
    static async itemFetch(query) {
        let itemData = Number(query)
            ? await ITEM_MODEL.findOne({ itemNumber: query })
            : (await ITEM_MODEL.findOne({ itemId: query })) ||
              (await ITEM_MODEL.findOne({
                  itemId: { $gt: query },
              }));
        return itemData;
    }

    static async itemShopFetch() {
        const itemsData = await ITEM_MODEL.find({
            "itemPrices.shop_buy": { $exists: true, $ne: null },
        });

        return itemsData;
    }
}

module.exports = Itemfunctions;
