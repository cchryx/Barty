const { EmbedBuilder, Collection, AttachmentBuilder } = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const {
    processesEndFunction,
    processesStartFunction,
} = require("../actions/processesFunctions");

function calculateAccuracy(input, reference) {
    const inputWords = input.trim().split(/\s+/);
    const referenceWords = reference.trim().split(/\s+/);
    let totalAccuracy = 0;
    for (let i = 0; i < inputWords.length; i++) {
        let wordAccuracy = 0;
        const inputWord = inputWords[i];
        const referenceWord = referenceWords[i];
        const minLength = Math.min(inputWord.length, referenceWord.length);
        let numCorrectChars = 0;
        for (let j = 0; j < minLength; j++) {
            if (inputWord[j] === referenceWord[j]) {
                numCorrectChars++;
            }
        }
        wordAccuracy = numCorrectChars / referenceWord.length;
        totalAccuracy += wordAccuracy;
    }
    const accuracy =
        Math.round((totalAccuracy / referenceWords.length) * 100) / 100;
    return accuracy;
}

function calculateWPM(input, timeInSeconds) {
    const words = input.trim().split(/\s+/);
    const numCharacters = input.length;
    const numWords = words.length;

    if (numWords === 0) {
        return null; // or "N/A" or any other value that represents no words
    }

    const timeInMinutes = timeInSeconds / 60;
    const wpm = numCharacters / 5 / timeInMinutes;
    return Math.round(wpm);
}

function calculateTypingTime(input, wpm) {
    const numWords = input.trim().split(/\s+/).length;
    const timeInMinutes = numWords / wpm;
    const timeInSeconds = timeInMinutes * 65;
    return timeInSeconds;
}

class Typergames {
    static async typeit(interaction, textData, data) {
        const choosenText =
            textData[Math.floor(Math.random() * textData.length)];
        const choosenText_chars = choosenText.length;
        const choosenText_typingTime = calculateTypingTime(choosenText, 60);

        // Set up canvas
        const canvas = Canvas.createCanvas(750, 250);
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.width - 50;
        canvas.height = canvas.height - 50;

        // Draw sentence on canvas
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#a7fcbe";
        ctx.font = "25px Roboto";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Split sentence into words
        const words = choosenText.split(" ");

        // Calculate line height based on font size
        const lineHeight = parseInt(ctx.font, 10) * 1.2;

        // Create lines of text
        const lines = [];
        let currentLine = "";
        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + " ";
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > canvas.width && i > 0) {
                lines.push(currentLine);
                currentLine = words[i] + " ";
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        // Draw lines on canvas
        const x = canvas.width / 2;
        const y = canvas.height / 2 - (lines.length / 2) * lineHeight;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y + i * lineHeight);
        }

        const buffer = await canvas.encode("png");

        let accuracy;
        let wordsperminute;
        const time_start = Date.now();

        const msg_typeit = await interaction.reply({
            files: [{ attachment: buffer, name: "sentence.png" }],
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `${
                            data.desc_start
                                ? data.desc_start
                                : "*Type the sentence below.*"
                        }\n*Expires <t:${Math.floor(
                            Date.now() / 1000 + choosenText_typingTime
                        )}:R>*`
                    )
                    .setImage("attachment://sentence.png"),
            ],
            fetchReply: true,
        });

        processesStartFunction(interaction.user.id, {
            messageId: msg_typeit.id,
            channelId: msg_typeit.channelId,
            guildId: msg_typeit.guildId,
        });

        const collectorFilter = (m) => m.author.id === interaction.user.id;
        const collector = await interaction.channel.createMessageCollector({
            filter: collectorFilter,
            time: choosenText_typingTime * 1000,
        });

        return new Promise((resolve, reject) => {
            collector.on("collect", (m) => {
                accuracy = calculateAccuracy(m.content, choosenText);
                wordsperminute = calculateWPM(
                    m.content,
                    Math.floor((Date.now() - time_start) / 1000)
                );
                collector.stop();
            });

            collector.on("end", (collected) => {
                processesEndFunction(interaction.user.id);
                resolve({
                    accuracy,
                    wordsperminute,
                });
                msg_typeit.edit({
                    files: [{ attachment: buffer, name: "sentence.png" }],
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${
                                    data.desc_end
                                        ? data.desc_end
                                        : "*Type it event ended.*"
                                }\n*Expired <t:${Math.floor(
                                    Date.now() / 1000
                                )}:R>*\n\nAccuracy: \`${
                                    accuracy ? `${accuracy * 100}%` : "0%"
                                }\`\nWords Per Minute: \`${
                                    wordsperminute
                                        ? `${wordsperminute} WPM`
                                        : "0 WPM"
                                }\``
                            )
                            .setImage("attachment://sentence.png"),
                    ],
                });
            });
        });
    }
}

module.exports = Typergames;
