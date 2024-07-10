const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const {
    confirmationFunction,
} = require("../../utils/graphics/buttonFunctions");
const { errorReply } = require("../../utils/errors/errorFunctions");
const {
    transactionsStartFunction,
    transactionsEndFunction,
    transactionsCheckFunction,
} = require("../../utils/actions/processesFunctions");
const {
    inventoryFetch,
    inventoryItemEdit,
} = require("../../utils/currency/inventoryFunctions");
const { itemFetch } = require("../../utils/currency/itemFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gift")
        .setDescription("Gift items to another user.")
        .addUserOption((opt) => {
            return opt
                .setName("user")
                .setDescription("Specify a user.")
                .setRequired(true);
        })
        .addStringOption((opt) => {
            return opt
                .setName("item")
                .setDescription("Specify the item you want to gift.")
                .setRequired(true);
        })
        .addStringOption((opt) => {
            return opt
                .setName("quantity")
                .setDescription(
                    "Specify the amount of this item you want to gift."
                )
                .setRequired(true);
        }),
    category: "economy",
    cooldown: {
        defaultTime: 3,
        premiumTime: 0,
    },
    async execute(interaction, client) {
        let ERROR_DESC;
        const optionsData = {
            user: interaction.options.getUser("user"),
            item: interaction.options.getString("item"),
            quantity: interaction.options.getString("quantity"),
        };
        const targetData_DSCD = optionsData.user;

        // check proccesses
        if (targetData_DSCD.id === interaction.user.id) {
            ERROR_DESC = `*Gifted those items to yourself.*`;
            return errorReply(interaction, ERROR_DESC);
        }

        const transactionCheck = await transactionsCheckFunction(
            targetData_DSCD.id
        );
        if (transactionCheck) {
            if (transactionCheck.status === true) {
                ERROR_DESC = `*This user is currently doing something with their stuff, try again later.*`;
                return errorReply(interaction, ERROR_DESC);
            }
        }

        // item data
        const itemData = await itemFetch(optionsData.item);
        if (!itemData) {
            ERROR_DESC = `**Item not found**\nRecieved Query: \`${optionsData.item}\``;
            return errorReply(interaction, ERROR_DESC);
        }

        // balance data
        const inventoryData_fetch = await inventoryFetch(interaction.user.id);
        const inventoryData = inventoryData_fetch.data;

        // gift data
        let giftQuantity = Math.abs(parseInt(Number(optionsData.quantity)));
        if (giftQuantity === 0) {
            ERROR_DESC = "*Gift something more realistic, not 0 of that item.*";
            return errorReply(interaction, ERROR_DESC);
        }

        if (!giftQuantity) {
            if (
                optionsData.quantity === "all" ||
                optionsData.quantity === "max"
            ) {
                giftQuantity = inventoryData.items[itemData.itemNumber];
            } else {
                ERROR_DESC = "*Specify a valid number.*";
                return errorReply(interaction, ERROR_DESC);
            }
        }

        if (
            !inventoryData.items[itemData.itemNumber] ||
            inventoryData.items[itemData.itemNumber] <= 0
        ) {
            ERROR_DESC = `*You don't own any quantity of this item, therefore you can't gift any.*\nItem: ${itemData.itemGraphics.emoji} ${itemData.itemName}`;
            return errorReply(interaction, ERROR_DESC);
        } else if (giftQuantity > inventoryData.items[itemData.itemNumber]) {
            ERROR_DESC = `*You don't have that quantity of that item to share from your pocket.*\nItem: ${itemData.itemGraphics.emoji} ${itemData.itemName}`;
            return errorReply(interaction, ERROR_DESC);
        }

        // transaction proccess
        transactionsStartFunction(interaction.user.id);
        const confirmationData = await confirmationFunction(interaction, {
            reply: "interaction",
            title: "Gift",
            desc: `*Are you sure you want to gift that quantity of this item below?*\nItem: ${
                itemData.itemGraphics.emoji
            } ${
                itemData.itemName
            } \`x${giftQuantity.toLocaleString()}\`\nUser: ${targetData_DSCD} \`${
                targetData_DSCD.id
            }\``,
            thumbnail: targetData_DSCD.displayAvatarURL(),
        });

        if (confirmationData === true) {
            inventoryItemEdit(
                interaction.user.id,
                itemData.itemNumber,
                "minus",
                giftQuantity
            );
            inventoryItemEdit(
                targetData_DSCD.id,
                itemData.itemNumber,
                "add",
                giftQuantity
            );
        }
        transactionsEndFunction(interaction.user.id);
    },
};
