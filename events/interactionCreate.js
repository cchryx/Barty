const {
    InteractionType,
    EmbedBuilder,
    PermissionsBitField,
    Collection,
} = require("discord.js");
const { errorReply } = require("../utils/errors/errorFunctions");
const { cdHandle } = require("../utils/cooldowns/cooldownFunctions");
const {
    processesCheckFunction,
} = require("../utils/actions/processesFunctions");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        let ERROR_DESC;
        const PERMISSIONS_REQUIRED = new PermissionsBitField([
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.AddReactions,
        ]);
        const PERMISSIONS_REQUIRED_RH = PERMISSIONS_REQUIRED.toArray()
            .map((element) => {
                return `\`${element}\``;
            })
            .join(", ");

        const clientData_DSCD = interaction.guild.members.cache.get(
            client.user.id
        );

        if (!clientData_DSCD.permissions.has(PERMISSIONS_REQUIRED)) {
            ERROR_DESC = `*I am missing the following permissions in this server to function properly:\n${PERMISSIONS_REQUIRED_RH}*`;
            return errorReply(interaction, ERROR_DESC);
        }

        if (
            !interaction.channel
                .permissionsFor(client.user.id)
                .has(PERMISSIONS_REQUIRED)
        ) {
            ERROR_DESC = `*I am missing the following permissions in this server to function properly:\n${PERMISSIONS_REQUIRED_RH}*`;
            return errorReply(interaction, ERROR_DESC);
        }

        if (interaction.type === InteractionType.ApplicationCommand) {
            const commandname = interaction.commandName;
            const command = client.commands.get(commandname);

            const processesCheck = await processesCheckFunction(
                interaction.user.id
            );
            if (processesCheck) {
                if (processesCheck.status === true) {
                    ERROR_DESC = `*Currently you have a message interaction that is active.*\nLink: ${processesCheck.data.readable}`;
                    return errorReply(interaction, ERROR_DESC);
                }
            }

            const cooldownHandle = cdHandle(client, interaction);
            if (cooldownHandle === true) {
                return;
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                if (error.code !== "InteractionAlreadyReplied") {
                    console.error(error);
                }
                ERROR_DESC =
                    "*An error occured when executing this application command.*";
                errorReply(interaction, ERROR_DESC);
            }
        } else if (interaction.isButton()) {
        }
    },
};
