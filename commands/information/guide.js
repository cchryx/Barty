const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType,
} = require("discord.js");
const fs = require("fs");
const {
    processesStartFunction,
    processesEndFunction,
} = require("../../utils/actions/processesFunctions");
const { paginationFunction } = require("../../utils/graphics/buttonFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("guide")
        .setDescription("All of the commands will be listed here."),
    category: "information",
    cooldown: {
        defaultTime: 3,
        premiumTime: 0,
    },
    async execute(interaction, client) {
        let ERROR_DESC;
        const CMDS_DATA = client.commands;
        const CMDS_DATA_DISCD = await client.application.commands.fetch();

        const menu_options = [];
        const folderContents = fs.readdirSync("./commands");
        const commandCategories = folderContents.filter((item) =>
            fs.statSync("./commands/" + item).isDirectory()
        );

        commandCategories.forEach((category) => {
            menu_options.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(
                        category.charAt(0).toUpperCase() + category.slice(1)
                    )
                    .setValue(category)
            );
        });

        const component_select = new StringSelectMenuBuilder()
            .setCustomId("category_selection")
            .setPlaceholder("Select a category")
            .addOptions(menu_options);

        const component_row = new ActionRowBuilder().addComponents(
            component_select
        );

        const msg_guide = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Guide")
                    .setDescription(
                        `This command shows all the existing commands with their descriptions.\n*Select from the menu below which category of commands you want to view.\nThis menu expires <t:${Math.floor(
                            (Date.now() + 20000) / 1000
                        )}:R>*`
                    ),
            ],
            components: [component_row],
            fetchReply: true,
        });

        processesStartFunction(interaction.user.id, {
            messageId: msg_guide.id,
            channelId: msg_guide.channelId,
            guildId: msg_guide.guildId,
        });

        const collectorFilter = (i) => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        };

        msg_guide
            .awaitMessageComponent({
                filter: collectorFilter,
                componentType: ComponentType.StringSelect,
                time: 20000,
            })
            .then((i) => {
                const cmds_filtered = CMDS_DATA.filter(
                    (command) => command.category === i.values[0]
                );
                const cmds_mapped = cmds_filtered
                    .map((commandData) => {
                        const CMD_DATA = CMDS_DATA_DISCD.find(
                            (c) =>
                                c.name === commandData.data.name ||
                                c.id === commandData.data.name
                        );
                        return `</${commandData.data.name}:${CMD_DATA.id}>\n> *${commandData.data.description}*`;
                    })
                    .sort((a, b) => {
                        return a - b;
                    });

                component_select
                    .setDisabled()
                    .setPlaceholder(
                        i.values[0].charAt(0).toUpperCase() +
                            i.values[0].slice(1)
                    );
                msg_guide.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Guide")
                            .setDescription(
                                `*This command shows all the existing commands with their descriptions.*\nSelect from the menu below which category of commands you want to view.\nThis menu expired <t:${Math.floor(
                                    Date.now() / 1000
                                )}:R>`
                            ),
                    ],
                    components: [component_row],
                });
                processesEndFunction(interaction.user.id);
                paginationFunction(interaction, cmds_mapped, 5, {
                    title: `Help - ${
                        i.values[0].charAt(0).toUpperCase() +
                        i.values[0].slice(1)
                    }`,
                });
            })
            .catch((err) => {
                processesEndFunction(interaction.user.id);
                component_select.setDisabled();
                msg_guide.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Guide")
                            .setDescription(
                                `*This command shows all the existing commands with their descriptions.*\nSelect from the menu below which category of commands you want to view.\nThis menu expired <t:${Math.floor(
                                    Date.now() / 1000
                                )}:R>`
                            ),
                    ],
                    components: [component_row],
                });
            });
    },
};
