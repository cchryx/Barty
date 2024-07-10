const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { balanceFetch } = require("../../utils/currency/balanceFunctions");
const { inventoryFetch } = require("../../utils/currency/inventoryFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check coin balance here.")
        .addUserOption((opt) => {
            return opt.setName("user").setDescription("Specify a user.");
        }),
    category: "currency",
    cooldown: {
        defaultTime: 3,
        premiumTime: 0,
    },
    async execute(interaction, client) {
        let ERROR_DESC;
        const optionsData = {
            user: interaction.options.getUser("user"),
        };
        const targetData_DSCD = optionsData.user
            ? optionsData.user
            : interaction.user;

        // balance data
        const balanceData = await balanceFetch(targetData_DSCD.id);
        const storagePocket_t = balanceData.storage.pocket;
        const storageBank_t =
            balanceData.storage.bank.pernament +
            balanceData.storage.bank.experience;
        const balancePocket_fill = !isNaN(
            balanceData.balance.pocket / storagePocket_t
        )
            ? (balanceData.balance.pocket / storagePocket_t).toFixed(2)
            : (0).toFixed(2);
        const balanceBank_fill = !isNaN(
            balanceData.balance.bank / storageBank_t
        )
            ? ((balanceData.balance.bank / storageBank_t) * 100).toFixed(2)
            : (0).toFixed(2);
        const balance_networth =
            balanceData.balance.bank + balanceData.balance.pocket;

        // inventory data
        const inventoryData_fetch = await inventoryFetch(targetData_DSCD.id);
        const inventory_networth = inventoryData_fetch.values.networth_items;

        //totals data
        const total_networth = balance_networth + inventory_networth;

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Balance")
                    .setThumbnail(targetData_DSCD.displayAvatarURL())
                    .setDescription(
                        `\`${
                            targetData_DSCD.tag
                        }\`\n\n**Pocket:** <:coin:1099801213098270911>\`${balanceData.balance.pocket.toLocaleString()}\`\n**Bank:** <:coin:1099801213098270911>\`${balanceData.balance.bank.toLocaleString()}\`/\`${storageBank_t.toLocaleString()}\`\n> \`${balanceBank_fill}%\`\n\n**Balance Networth:** <:coin:1099801213098270911>\`${balance_networth.toLocaleString()}\`\n**Inventory Networth:** <:coin:1099801213098270911>\`${inventory_networth.toLocaleString()}\`\n**Total Networth:** <:coin:1099801213098270911>\`${total_networth.toLocaleString()}\``
                    ),
            ],
        });
    },
};
