const { EmbedBuilder, Collection } = require("discord.js");
const cooldowns = require("../../data/cooldowns");
const { humanizeSeconds } = require("../tools/timeFunctions");

class Cooldownfunctions {
    static async cdHandle(client, interaction) {
        async function cdReply(cooldown_data) {
            const embed_cd = new EmbedBuilder().setDescription(
                `**You are on cooldown for this action_**\n\nCommand: </${
                    interaction.commandName
                }:${interaction.commandId}>\nReady: <t:${Math.floor(
                    cooldown_data.endTime / 1000
                )}:R>\nDefault Cooldown: \`${await humanizeSeconds(
                    cooldown_data.defaultTime
                )}\``
            );

            const msg_cd = await interaction.reply({
                embeds: [embed_cd],
                ephemeral: true,
                fetchReply: true,
            });

            return;
        }
        const CMD_DATA = client.commands.get(interaction.commandName);
        const CMD_COOLDOWN_DATA = CMD_DATA.cooldown;

        if (!cooldowns.has(interaction.commandName)) {
            cooldowns.set(interaction.commandName, new Collection());
        }

        if (
            cooldowns.get(interaction.commandName).has(interaction.user.id) &&
            cooldowns.get(interaction.commandName).get(interaction.user.id) >
                Date.now()
        ) {
            cdReply({
                endTime: cooldowns
                    .get(interaction.commandName)
                    .get(interaction.user.id),
                defaultTime: CMD_COOLDOWN_DATA.defaultTime,
            });

            return true;
        } else {
            if (
                !cooldowns.get(interaction.commandName).has(interaction.user.id)
            ) {
                cooldowns
                    .get(interaction.commandName)
                    .set(
                        interaction.user.id,
                        Date.now() + CMD_COOLDOWN_DATA.defaultTime * 1000
                    );
            } else {
                cooldowns
                    .get(interaction.commandName)
                    .set(
                        interaction.user.id,
                        Date.now() + CMD_COOLDOWN_DATA.defaultTime * 1000
                    );
            }
        }
    }
}

module.exports = Cooldownfunctions;
