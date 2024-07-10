const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { itemFetch } = require("../../utils/currency/itemFunctions");
const { inventoryFetch } = require("../../utils/currency/inventoryFunctions");
const { errorReply } = require("../../utils/errors/errorFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("item")
        .setDescription("View the details of a specific item.")
        .addStringOption((opt) => {
            return opt
                .setName("item")
                .setDescription("Specify an item name or id.")
                .setRequired(true);
        }),
    category: "currency",
    cooldown: {
        defaultTime: 3,
        premiumTime: 0,
    },
    async execute(interaction, client) {
        let ERROR_DESC;
        const optionsData = {
            item: interaction.options.getString("item"),
        };

        // item data
        const itemData = await itemFetch(optionsData.item);
        if (!itemData) {
            ERROR_DESC = `**Item not found**\nRecieved Query: \`${optionsData.item}\``;
            return errorReply(interaction, ERROR_DESC);
        }

        // inventory data
        const inventoryData_fetch = await inventoryFetch(interaction.user.id);
        const inventoryData = inventoryData_fetch.data;
        const inventoryOwned = inventoryData.items[itemData.itemNumber]
            ? inventoryData.items[itemData.itemNumber].toLocaleString()
            : 0;
        const inventoryShares_price =
            inventoryData_fetch.values.networth_perItem[itemData.itemNumber] ||
            0;
        const inventoryShares_percent = !isNaN(
            (inventoryShares_price /
                inventoryData_fetch.values.networth_items) *
                100
        )
            ? (
                  (inventoryShares_price /
                      inventoryData_fetch.values.networth_items) *
                  100
              ).toFixed(2)
            : (0).toFixed(2);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        `Item: ${itemData.itemGraphics.emoji} ${itemData.itemName}`
                    )
                    .setDescription(
                        `\`${
                            interaction.user.tag
                        }\`\nInventory Owned: \`${inventoryOwned}\`\nInventory Shares: <:coin:1099801213098270911>\`${inventoryShares_price.toLocaleString()}\` \`${inventoryShares_percent}%\`\n\n${
                            itemData.itemDescription
                        }`
                    )
                    .setThumbnail(itemData.itemGraphics.image_url)
                    .setFields(
                        {
                            inline: true,
                            name: "Details",
                            value: `Category: \`${itemData.itemCategory}\`\nItem Number: \`${itemData.itemNumber}\`\nItem Identity: \`${itemData.itemId}\``,
                        },
                        {
                            inline: true,
                            name: "Shop Values",
                            value: `Buy: <:coin:1099801213098270911>\`${
                                itemData.itemPrices.shop_buy
                                    ? itemData.itemPrices.shop_buy.toLocaleString()
                                    : "unable to be bought"
                            }\`\nSell: <:coin:1099801213098270911>\`${
                                itemData.itemPrices.shop_sell
                                    ? itemData.itemPrices.shop_sell.toLocaleString()
                                    : "unable to be sold"
                            }\``,
                        }
                    ),
            ],
        });
    },
};
