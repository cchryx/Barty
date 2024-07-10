const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
} = require("discord.js");
const {
    processesStartFunction,
    processesEndFunction,
} = require("../actions/processesFunctions");

class Buttonfunctions {
    static async paginationFunction(interaction, embeds, embedhold, data) {
        let page_current = 1;
        let page_max =
            Math.ceil(embeds.length / embedhold) !== 0
                ? Math.ceil(embeds.length / embedhold)
                : 1;

        const button_back = new ButtonBuilder()
            .setCustomId("back")
            .setStyle(ButtonStyle.Primary)
            .setLabel("<");
        const button_forward = new ButtonBuilder()
            .setCustomId("forward")
            .setStyle(ButtonStyle.Primary)
            .setLabel(">");
        const button_page = new ButtonBuilder()
            .setCustomId("page")
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`${page_current} / ${page_max}`)
            .setDisabled(true);

        const button_endinteraction = new ButtonBuilder()
            .setCustomId("endinteraction")
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`End Interaction`);

        if (page_current === 1) button_back.setDisabled();
        if (page_current === page_max) {
            button_forward.setDisabled();
            button_endinteraction.setDisabled();
        }

        let msg_pagination;
        let slice_start = (page_current - 1) * embedhold;
        let slice_end = (page_current - 1) * embedhold + embedhold;

        if (data.reply === "interaction") {
            msg_pagination = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${data.title ? data.title : "Title"}`)
                        .setDescription(
                            `${data.desc_start ? data.desc_start : ""}${embeds
                                .slice(slice_start, slice_end)
                                .join("\n\n")}`
                        )
                        .setThumbnail(data.thumbnail),
                ],
                components: [
                    new ActionRowBuilder().setComponents(
                        button_back,
                        button_page,
                        button_forward
                    ),
                    new ActionRowBuilder().setComponents(button_endinteraction),
                ],
                fetchReply: true,
            });
        } else {
            msg_pagination = await interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${data.title ? data.title : "Title"}`)
                        .setDescription(
                            `${data.desc_start ? data.desc_start : ""}${embeds
                                .slice(slice_start, slice_end)
                                .join("\n\n")}`
                        )
                        .setThumbnail(data.thumbnail),
                ],
                components: [
                    new ActionRowBuilder().setComponents(
                        button_back,
                        button_page,
                        button_forward
                    ),
                    new ActionRowBuilder().setComponents(button_endinteraction),
                ],
            });
        }

        processesStartFunction(interaction.user.id, {
            messageId: msg_pagination.id,
            channelId: msg_pagination.channelId,
            guildId: msg_pagination.guildId,
        });

        const collector = msg_pagination.createMessageComponentCollector({
            idle: 10000,
        });

        if (page_max !== 1) {
            collector.on("collect", (m) => {
                if (m.user.id !== interaction.user.id) return;

                m.deferUpdate();
                if (m.customId === "endinteraction") {
                    collector.stop();
                } else if (m.customId === "forward") {
                    page_current += 1;
                    slice_start = (page_current - 1) * embedhold;
                    slice_end = (page_current - 1) * embedhold + embedhold;
                    button_page.setLabel(`${page_current} / ${page_max}`);
                    if (page_current !== 1) button_back.setDisabled(false);
                    if (page_current === page_max) button_forward.setDisabled();

                    msg_pagination.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    `${data.title ? data.title : "Title"}`
                                )
                                .setDescription(
                                    `${
                                        data.desc_start ? data.desc_start : ""
                                    }${embeds
                                        .slice(slice_start, slice_end)
                                        .join("\n\n")}`
                                )
                                .setThumbnail(data.thumbnail),
                        ],
                        components: [
                            new ActionRowBuilder().setComponents(
                                button_back,
                                button_page,
                                button_forward
                            ),
                            new ActionRowBuilder().setComponents(
                                button_endinteraction
                            ),
                        ],
                    });
                } else if (m.customId === "back") {
                    page_current -= 1;
                    slice_start = (page_current - 1) * embedhold;
                    slice_end = (page_current - 1) * embedhold + embedhold;
                    button_page.setLabel(`${page_current} / ${page_max}`);
                    if (page_current === 1) button_back.setDisabled();
                    if (page_current !== page_max)
                        button_forward.setDisabled(false);

                    msg_pagination.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    `${data.title ? data.title : "Title"}`
                                )
                                .setDescription(
                                    `${
                                        data.desc_start ? data.desc_start : ""
                                    }${embeds
                                        .slice(slice_start, slice_end)
                                        .join("\n\n")}`
                                )
                                .setThumbnail(data.thumbnail),
                        ],
                        components: [
                            new ActionRowBuilder().setComponents(
                                button_back,
                                button_page,
                                button_forward
                            ),
                            new ActionRowBuilder().setComponents(
                                button_endinteraction
                            ),
                        ],
                    });
                }
            });

            collector.on("end", (collected) => {
                processesEndFunction(interaction.user.id);
                button_endinteraction.setDisabled();
                button_back.setDisabled();
                button_forward.setDisabled();
                return msg_pagination.edit({
                    components: [
                        new ActionRowBuilder().setComponents(
                            button_back,
                            button_page,
                            button_forward
                        ),
                        new ActionRowBuilder().setComponents(
                            button_endinteraction
                        ),
                    ],
                });
            });
        } else {
            processesEndFunction(interaction.user.id);
        }
    }

    static async confirmationFunction(interaction, data) {
        let returnValue;
        let msg_confirmation;
        const button_cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setStyle(ButtonStyle.Danger)
            .setLabel("Cancel");
        const button_confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setStyle(ButtonStyle.Success)
            .setLabel("Confirm");

        if (data.reply === "interaction") {
            msg_confirmation = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            `${
                                data.title
                                    ? `Action Confirmation: ${data.title}`
                                    : `Action Confirmation:`
                            }`
                        )
                        .setDescription(
                            `${
                                data.desc
                                    ? data.desc
                                    : "*Do you confirm this action?*"
                            }`
                        )
                        .setThumbnail(data.thumbnail),
                ],
                components: [
                    new ActionRowBuilder().setComponents(
                        button_cancel,
                        button_confirm
                    ),
                ],
                fetchReply: true,
            });
        } else {
            msg_confirmation = await interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            `${
                                data.title
                                    ? `Action Confirmation: ${data.title}`
                                    : `Action Confirmation:`
                            }`
                        )
                        .setDescription(
                            `${
                                data.desc
                                    ? data.desc
                                    : "*Do you confirm this action?*"
                            }`
                        )
                        .setThumbnail(data.thumbnail),
                ],
                components: [
                    new ActionRowBuilder().setComponents(
                        button_cancel,
                        button_confirm
                    ),
                ],
                fetchReply: true,
            });
        }

        processesStartFunction(interaction.user.id, {
            messageId: msg_confirmation.id,
            channelId: msg_confirmation.channelId,
            guildId: msg_confirmation.guildId,
        });

        const collectorFilter = (i) => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        };

        returnValue = await msg_confirmation
            .awaitMessageComponent({
                filter: collectorFilter,
                componentType: ComponentType.Button,
                time: 20000,
            })
            .then((i) => {
                if (i.customId === "confirm") {
                    processesEndFunction(interaction.user.id);
                    button_cancel.setDisabled().setStyle(ButtonStyle.Secondary);
                    button_confirm.setDisabled();

                    msg_confirmation.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    `${
                                        data.title
                                            ? `Action Confirmed: ${data.title}`
                                            : `Action Confirmed:`
                                    }`
                                )
                                .setDescription(
                                    `${
                                        data.desc
                                            ? `**This action has been confirmed, you can no longer interact with it_**\n\n${data.desc}`
                                            : "**This action has been confirmed, you can no longer interact with it_**"
                                    }`
                                )
                                .setThumbnail(data.thumbnail)
                                .setColor("#34eb86"),
                        ],
                        components: [
                            new ActionRowBuilder().setComponents(
                                button_cancel,
                                button_confirm
                            ),
                        ],
                    });
                    return true;
                } else if (i.customId === "cancel") {
                    processesEndFunction(interaction.user.id);
                    button_cancel.setDisabled();
                    button_confirm
                        .setDisabled()
                        .setStyle(ButtonStyle.Secondary);

                    msg_confirmation.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    `${
                                        data.title
                                            ? `Action Canceled: ${data.title}`
                                            : `Action Canceled:`
                                    }`
                                )
                                .setDescription(
                                    `${
                                        data.desc
                                            ? `**This action has been canceled, you can no longer interact with it_**\n\n~~${data.desc}~~`
                                            : "**This action has been canceled, you can no longer interact with it_**"
                                    }`
                                )
                                .setThumbnail(data.thumbnail)
                                .setColor("#eb3434"),
                        ],
                        components: [
                            new ActionRowBuilder().setComponents(
                                button_cancel,
                                button_confirm
                            ),
                        ],
                    });

                    return false;
                }
            })
            .catch((err) => {
                processesEndFunction(interaction.user.id);
                button_cancel.setDisabled().setStyle(ButtonStyle.Secondary);
                button_confirm.setDisabled().setStyle(ButtonStyle.Secondary);

                msg_confirmation.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(
                                `${
                                    data.title
                                        ? `Action Confirmation Timed Out: ${data.title}`
                                        : `Action Confirmation Timed Out:`
                                }`
                            )
                            .setDescription(
                                `${
                                    data.desc
                                        ? `**This action has timed out, you can no longer interact with it_**\n\n~~${data.desc}~~`
                                        : "**This action has timed out, you can no longer interact with it_**"
                                }`
                            )
                            .setThumbnail(data.thumbnail),
                    ],
                    components: [
                        new ActionRowBuilder().setComponents(
                            button_cancel,
                            button_confirm
                        ),
                    ],
                });

                return null;
            });
        return returnValue;
    }
}

module.exports = Buttonfunctions;
