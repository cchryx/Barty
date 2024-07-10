const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { inventoryFetch } = require("../../utils/currency/inventoryFunctions");
const { paginationFunction } = require("../../utils/graphics/buttonFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Check inventory here.")
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

        // inventory data
        const inventoryData = await inventoryFetch(targetData_DSCD.id);

        return paginationFunction(interaction, inventoryData.display.raw, 5, {
            thumbnail: targetData_DSCD.displayAvatarURL(),
            reply: "interaction",
            title: "Inventory",
            desc_start: `\`${targetData_DSCD.tag}\`\n\n${
                inventoryData.display.raw.length === 0
                    ? inventoryData.display.string
                    : ""
            }`,
        });
    },
};
