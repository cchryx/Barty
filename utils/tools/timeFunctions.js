const { EmbedBuilder } = require("discord.js");

class Timerfunctions {
    static async humanizeSeconds(seconds) {
        const days = Math.floor(seconds / 86400);
        seconds %= 86400;
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds %= 60;

        const parts = [];
        if (days) {
            parts.push(`${days}d`);
        }
        if (hours) {
            parts.push(`${hours}h`);
        }
        if (minutes) {
            parts.push(`${minutes}m`);
        }
        if (seconds) {
            parts.push(`${seconds}s`);
        }

        if (parts.length === 0) {
            return "0s";
        }

        return parts.join(", ");
    }
}

module.exports = Timerfunctions;
