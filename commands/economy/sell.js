const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { itemFetch } = require("../../utils/currency/itemFunctions");
const {
    inventoryItemEdit,
    inventoryFetch,
} = require("../../utils/currency/inventoryFunctions");
const {
    confirmationFunction,
} = require("../../utils/graphics/buttonFunctions");
const { errorReply } = require("../../utils/errors/errorFunctions");
const { balanceEdit } = require("../../utils/currency/balanceFunctions");
const {
    transactionsStartFunction,
    transactionsEndFunction,
} = require("../../utils/actions/processesFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sell")
        .setDescription("Sell an item to the Barty shop.")
        .addStringOption((opt) => {
            return opt
                .setName("item")
                .setDescription("Specify an item.")
                .setRequired(true);
        })
        .addStringOption((opt) => {
            return opt
                .setName("quantity")
                .setDescription(
                    "Specify how much of this item you want to sell."
                );
        }),
    category: "economy",
    cooldown: {
        defaultTime: 3,
        premiumTime: 0,
    },
    async execute(interaction, client) {
        let ERROR_DESC;
        const optionsData = {
            item: interaction.options.getString("item"),
            quantity: interaction.options.getString("quantity"),
        };
        const targetData_DSCD = interaction.user;

        // item data
        const itemData = await itemFetch(optionsData.item);
        if (!itemData) {
            ERROR_DESC = "*Couldn't find your specified item.*";
            return errorReply(interaction, ERROR_DESC);
        } else if (itemData.itemPrices.shop_sell === null) {
            ERROR_DESC = "*You can't sell this item to the Barty shop.*";
            return errorReply(interaction, ERROR_DESC);
        }

        // inventory data
        const inventoryData_fetch = await inventoryFetch(targetData_DSCD.id);
        const inventoryData = inventoryData_fetch.data;

        // sell data
        let sellQuantity = Math.abs(parseInt(optionsData.quantity));
        if (!optionsData.quantity) {
            sellQuantity = 1;
        } else if (!sellQuantity) {
            ERROR_DESC = "*Specify a valid number.*";
            return errorReply(interaction, ERROR_DESC);
        }

        const sellPrice = sellQuantity * itemData.itemPrices.shop_sell;
        if (
            !inventoryData.items[itemData.itemNumber] ||
            inventoryData.items[itemData.itemNumber] < sellQuantity
        ) {
            ERROR_DESC = `*You do not have that quantity of that item to sell.*`;
            return errorReply(interaction, ERROR_DESC);
        }

        // transaction proccess
        const confirmationData = await confirmationFunction(interaction, {
            reply: "interaction",
            title: "Sell",
            desc: `*Are you sure you want to sell the item below?*\nItem: ${
                itemData.itemGraphics.emoji
            } **${
                itemData.itemName
            }** \`x${sellQuantity.toLocaleString()}\`\nIncome: <:coin:1099801213098270911>\`+${sellPrice.toLocaleString()}\``,
            thumbnail: targetData_DSCD.displayAvatarURL(),
        });

        if (confirmationData === true) {
            transactionsStartFunction(targetData_DSCD.id);
            balanceEdit(targetData_DSCD.id, "pocket", "add", sellPrice);
            inventoryItemEdit(
                targetData_DSCD.id,
                itemData.itemNumber,
                "minus",
                sellQuantity
            );
            transactionsEndFunction(targetData_DSCD.id);
        }
    },
};
