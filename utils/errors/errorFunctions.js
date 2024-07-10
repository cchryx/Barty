const { EmbedBuilder } = require("discord.js");

class Errorfunctions {
    static async errorReply(interaction, description) {
        const embed_error = new EmbedBuilder()
            .setDescription(
                `**An error occured during this action, details below_**\n\n${description}`
            )
            .setColor("#ff946e");

        return interaction.reply({ embeds: [embed_error], ephemeral: true });
    }
}

module.exports = Errorfunctions;
