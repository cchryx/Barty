const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const {
    itemShopFetch,
    itemFetch,
} = require("../../utils/currency/itemFunctions");
const { inventoryFetch } = require("../../utils/currency/inventoryFunctions");
const { paginationFunction } = require("../../utils/graphics/buttonFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription(
            "This is where you look at all the items sold at the barty shop."
        ),
    category: "economy",
    cooldown: {
        defaultTime: 3,
        premiumTime: 0,
    },
    async execute(interaction, client) {
        let ERROR_DESC;
        const targetData_DSCD = interaction.user;

        // inventory data
        const inventoryData_fetch = await inventoryFetch(targetData_DSCD.id);
        const inventoryData = inventoryData_fetch.data;

        // shop data
        const shopData = await itemShopFetch();
        const shopData_sort = shopData.sort((a, b) => {
            return b.itemPrices.shop_buy - a.itemPrices.shop_buy;
        });
        const shopData_map = shopData_sort.map((itemData) => {
            return `${itemData.itemGraphics.emoji} **${
                itemData.itemName
            }** - \`Units Owned: ${
                inventoryData.items[itemData.itemNumber]
                    ? inventoryData.items[itemData.itemNumber].toLocaleString()
                    : 0
            }\`\n> Buy Price: <:coin:1099801213098270911>\`${itemData.itemPrices.shop_buy.toLocaleString()}\`\n> ItemId: \`${
                itemData.itemId
            }\``;
        });
        return paginationFunction(interaction, shopData_map, 1, {
            thumbnail: client.user.displayAvatarURL(),
            reply: "interaction",
            title: "Barty All Purpose Shop",
            desc_start: ``,
        });
    },
};
