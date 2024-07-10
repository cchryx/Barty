const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { itemFetch } = require("../../utils/currency/itemFunctions");
const {
    inventoryItemEdit,
} = require("../../utils/currency/inventoryFunctions");
const {
    confirmationFunction,
} = require("../../utils/graphics/buttonFunctions");
const { errorReply } = require("../../utils/errors/errorFunctions");
const {
    balanceFetch,
    balanceEdit,
} = require("../../utils/currency/balanceFunctions");
const {
    transactionsStartFunction,
    transactionsEndFunction,
} = require("../../utils/actions/processesFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Buy an item from the Barty shop.")
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
                    "Specify how much of this item you want to purchase."
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
        } else if (itemData.itemPrices.shop_buy === null) {
            ERROR_DESC = "*You can't buy this item from the Barty shop.*";
            return errorReply(interaction, ERROR_DESC);
        }

        // balance data
        const balanceData = await balanceFetch(targetData_DSCD.id);

        // buy data
        let buyQuantity = Math.abs(parseInt(optionsData.quantity));
        if (!optionsData.quantity) {
            buyQuantity = 1;
        } else if (!buyQuantity) {
            ERROR_DESC = "*Specify a valid number.*";
            return errorReply(interaction, ERROR_DESC);
        }

        const buyPrice = buyQuantity * itemData.itemPrices.shop_buy;
        if (buyPrice > balanceData.balance.pocket) {
            ERROR_DESC =
                "*Not enough money in pocket to buy this many of this item.*";
            return errorReply(interaction, ERROR_DESC);
        }

        // transaction proccess
        const confirmationData = await confirmationFunction(interaction, {
            reply: "interaction",
            title: "Purchase",
            desc: `*Are you sure you want to buy the item below?*\nItem: ${
                itemData.itemGraphics.emoji
            } **${
                itemData.itemName
            }** \`x${buyQuantity.toLocaleString()}\`\nCost: <:coin:1099801213098270911>\`-${buyPrice.toLocaleString()}\``,
            thumbnail: targetData_DSCD.displayAvatarURL(),
        });

        if (confirmationData === true) {
            transactionsStartFunction(targetData_DSCD.id);
            balanceEdit(targetData_DSCD.id, "pocket", "minus", buyPrice);
            inventoryItemEdit(
                targetData_DSCD.id,
                itemData.itemNumber,
                "add",
                buyQuantity
            );
            transactionsEndFunction(targetData_DSCD.id);
        }
    },
};
