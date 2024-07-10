const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { errorReply } = require("../../utils/errors/errorFunctions");
const { typeit } = require("../../utils/minigames/typerGames");
const { balanceEdit } = require("../../utils/currency/balanceFunctions");

function fetchQuotes(numQuotes) {
    return new Promise((resolve, reject) => {
        const quotesArray = [];

        fetch("https://type.fit/api/quotes?minLength=200&maxLength=250")
            .then((response) => response.json())
            .then((data) => {
                for (let i = 0; i < numQuotes; i++) {
                    const quote =
                        data[Math.floor(Math.random() * data.length)].text;
                    quotesArray.push(quote);
                }
                resolve(quotesArray);
            })
            .catch((error) => reject(error));
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("typeit")
        .setDescription("Type some text to earn some coins."),
    category: "income",
    cooldown: {
        defaultTime: 30,
        premiumTime: 0,
    },
    async execute(interaction, client) {
        let coins_gained;
        const coins_total = 10;
        const sentencesData = await fetchQuotes(100);
        const typeitData = await typeit(interaction, sentencesData, {});

        coins_gained = Math.round(typeitData.accuracy * coins_total);

        if (typeitData.wordsperminute >= 100) {
            coins_gained *= 12;
        } else if (typeitData.wordsperminute >= 80) {
            coins_gained *= 6;
        } else if (typeitData.wordsperminute >= 60) {
            coins_gained *= 3;
        }

        interaction.followUp({
            embeds: [
                new EmbedBuilder().setDescription(
                    `**According to your typeit performance, you are paid the following.**\nCoins: <:coin:1099801213098270911>\`${
                        coins_gained ? coins_gained.toLocaleString() : 0
                    }\``
                ),
            ],
        });

        if (coins_gained)
            await balanceEdit(
                interaction.user.id,
                "pocket",
                "add",
                coins_gained
            );
    },
};
