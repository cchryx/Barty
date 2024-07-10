const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const processes = require("../../data/processes");
const transactions = require("../../data/transactions");

class Processesfunctions {
    static async processesStartFunction(userId, data) {
        if (!processes.has(userId)) {
            processes.set(userId, data);
        }
    }
    static async processesEndFunction(userId) {
        if (processes.has(userId)) processes.delete(userId);
    }
    static async processesCheckFunction(userId) {
        if (processes.has(userId)) {
            const data = processes.get(userId);
            return {
                status: true,
                data: {
                    readable: `https://discord.com/channels/${data.guildId}/${data.channelId}/${data.messageId}`,
                },
            };
        }
    }
    static async transactionsStartFunction(userId, data) {
        if (!transactions.has(userId)) {
            transactions.set(userId, data);
        }
    }
    static async transactionsEndFunction(userId) {
        if (transactions.has(userId)) transactions.delete(userId);
    }
    static async transactionsCheckFunction(userId) {
        if (transactions.has(userId)) {
            const data = transactions.get(userId);
            return {
                status: true,
            };
        }
    }
}

module.exports = Processesfunctions;
