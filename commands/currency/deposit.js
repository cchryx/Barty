const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const {
    balanceFetch,
    balanceDeposit,
} = require("../../utils/currency/balanceFunctions");
const {
    transactionsStartFunction,
    transactionsEndFunction,
} = require("../../utils/actions/processesFunctions");
const { errorReply } = require("../../utils/errors/errorFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Deposit your pocket coin balance into your bank.")
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

        // deposit data
        let depositCoins = Math.abs(parseInt(Number(optionsData.coins)));
        if (depositCoins === 0) {
            ERROR_DESC = "*Deposit something more realistic, not 0.*";
            return errorReply(interaction, ERROR_DESC);
        }

        if (!depositCoins) {
            if (optionsData.coins === "all" || optionsData.coins === "max") {
                depositCoins = balanceData.balance.pocket;
            } else {
                ERROR_DESC = "*Specify a valid number.*";
                return errorReply(interaction, ERROR_DESC);
            }
        }

        if (balanceData.balance.pocket <= 0) {
            ERROR_DESC = "*No coins in your pocket to deposit.*";
            return errorReply(interaction, ERROR_DESC);
        } else if (
            storageBank_t <= 0 ||
            balanceData.balance.bank === storageBank_t
        ) {
            ERROR_DESC = "*No space in you bank to store more coins.*";
            return errorReply(interaction, ERROR_DESC);
        } else if (depositCoins > balanceData.balance.pocket) {
            ERROR_DESC =
                "*You don't have that quantity of coins to deposit from your pocket.*";
            return errorReply(interaction, ERROR_DESC);
        }

        depositCoins =
            depositCoins > storageBank_t - balanceData.balance.bank
                ? storageBank_t - balanceData.balance.bank
                : depositCoins;

        transactionsStartFunction(targetData_DSCD);
        balanceDeposit(targetData_DSCD.id, depositCoins);
        transactionsEndFunction(targetData_DSCD);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Deposit")
                    .setThumbnail(targetData_DSCD.displayAvatarURL())
                    .setDescription(
                        `\`${
                            targetData_DSCD.tag
                        }\`\n\n**Deposit:** <:coin:1099801213098270911>\`${depositCoins.toLocaleString()}\`\n> New Pocket: \`${(
                            balanceData.balance.pocket - depositCoins
                        ).toLocaleString()}\`\n> New Bank: \`${(
                            balanceData.balance.bank + depositCoins
                        ).toLocaleString()}\``
                    ),
            ],
        });
    },
};
