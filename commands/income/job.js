const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { jobsFetch } = require("../../utils/currency/jobFunctions");
const { paginationFunction } = require("../../utils/graphics/buttonFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("job")
        .setDescription("Job related commands")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("List of all the jobs avaliable.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("apply")
                .setDescription("Apply to one of the jobs avaliable.")
        ),
    category: "income",
    cooldown: {
        defaultTime: 10,
        premiumTime: 0,
    },
    async execute(interaction, client) {
        let ERROR_DESC;

        if (interaction.options.getSubcommand() === "list") {
            const jobsData_fetch = await jobsFetch();
            paginationFunction(interaction, jobsData_fetch.map, 3, {
                reply: "interaction",
                title: "Jobs - List",
            });
        }
    },
};
