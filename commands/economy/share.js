const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const {
    confirmationFunction,
} = require("../../utils/graphics/buttonFunctions");
const { errorReply } = require("../../utils/errors/errorFunctions");
const {
    balanceEdit,
    balanceFetch,
} = require("../../utils/currency/balanceFunctions");
const {
    transactionsStartFunction,
    transactionsEndFunction,
    transactionsCheckFunction,
} = require("../../utils/actions/processesFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("share")
        .setDescription("Share coins to another user.")
        .addUserOption((opt) => {
            return opt
                .setName("user")
                .setDescription("Specify a user.")
                .setRequired(true);
        })
        .addStringOption((opt) => {
            return opt
                .setName("coins")
                .setDescription("Specify how much coins you want to share.")
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
            coins: interaction.options.getString("coins"),
        };
        const targetData_DSCD = optionsData.user;

        // check proccesses
        if (targetData_DSCD.id === interaction.user.id) {
            ERROR_DESC = `*Shared those coins to yourself.*`;
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

        // balance data
        const balanceData = await balanceFetch(interaction.user.id);

        // share data
        let shareCoins = Math.abs(parseInt(Number(optionsData.coins)));
        if (shareCoins === 0) {
            ERROR_DESC = "*Share something more realistic, not 0.*";
            return errorReply(interaction, ERROR_DESC);
        }

        if (!shareCoins) {
            if (optionsData.coins === "all" || optionsData.coins === "max") {
                shareCoins = balanceData.balance.pocket;
            } else {
                ERROR_DESC = "*Specify a valid number.*";
                return errorReply(interaction, ERROR_DESC);
            }
        }

        if (balanceData.balance.pocket <= 0) {
            ERROR_DESC = "*No coins in your pocket to share.*";
            return errorReply(interaction, ERROR_DESC);
        } else if (shareCoins > balanceData.balance.pocket) {
            ERROR_DESC =
                "*You don't have that quantity of coins to share from your pocket.*";
            return errorReply(interaction, ERROR_DESC);
        }

        // transaction proccess
        transactionsStartFunction(interaction.user.id);
        const confirmationData = await confirmationFunction(interaction, {
            reply: "interaction",
            title: "Share",
            desc: `*Are you sure you want to share the coins below?*\nCoins: <:coin:1099801213098270911>\`${shareCoins.toLocaleString()}\`\nUser: ${targetData_DSCD} \`${
                targetData_DSCD.id
            }\``,
            thumbnail: targetData_DSCD.displayAvatarURL(),
        });

        if (confirmationData === true) {
            balanceEdit(interaction.user.id, "pocket", "minus", shareCoins);
            balanceEdit(targetData_DSCD.id, "pocket", "add", shareCoins);
        }
        transactionsEndFunction(interaction.user.id);
    },
};
