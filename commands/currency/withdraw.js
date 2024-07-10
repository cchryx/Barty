const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const {
    balanceFetch,
    balanceWithdraw,
} = require("../../utils/currency/balanceFunctions");
const {
    transactionsStartFunction,
    transactionsEndFunction,
} = require("../../utils/actions/processesFunctions");
const { errorReply } = require("../../utils/errors/errorFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Withdraw your pocket coin balance into your bank.")
        .addStringOption((opt) => {
            return opt
                .setName("coins")
                .setDescription("Specify quantity of coins.")
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
            coins: interaction.options.getString("coins"),
        };
        const targetData_DSCD = optionsData.user
            ? optionsData.user
            : interaction.user;

        // balance data
        const balanceData = await balanceFetch(targetData_DSCD.id);
        const storageBank_t =
            balanceData.storage.bank.pernament +
            balanceData.storage.bank.experience;

        // sell data
        let withdrawCoins = Math.abs(parseInt(Number(optionsData.coins)));
        if (withdrawCoins === 0) {
            ERROR_DESC = "*Withdraw something more realistic, not 0.*";
            return errorReply(interaction, ERROR_DESC);
        }

        if (!withdrawCoins) {
            if (optionsData.coins === "all" || optionsData.coins === "max") {
                withdrawCoins = balanceData.balance.bank;
            } else {
                ERROR_DESC = "*Specify a valid number.*";
                return errorReply(interaction, ERROR_DESC);
            }
        }

        if (balanceData.balance.bank <= 0) {
            ERROR_DESC = "*No coins in your bank to withdraw.*";
            return errorReply(interaction, ERROR_DESC);
        } else if (withdrawCoins > balanceData.balance.bank) {
            ERROR_DESC =
                "*You don't have that quantity of coins to withdraw from your bank.*";
            return errorReply(interaction, ERROR_DESC);
        }

        transactionsStartFunction(targetData_DSCD);
        balanceWithdraw(targetData_DSCD.id, withdrawCoins);
        transactionsEndFunction(targetData_DSCD);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Withdraw")
                    .setThumbnail(targetData_DSCD.displayAvatarURL())
                    .setDescription(
                        `\`${
                            targetData_DSCD.tag
                        }\`\n\n**Withdraw:** <:coin:1099801213098270911>\`${withdrawCoins.toLocaleString()}\`\n> New Pocket: \`${(
                            balanceData.balance.pocket + withdrawCoins
                        ).toLocaleString()}\`\n> New Bank: \`${(
                            balanceData.balance.bank - withdrawCoins
                        ).toLocaleString()}\``
                    ),
            ],
        });
    },
};
