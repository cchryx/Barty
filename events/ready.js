const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`>> Successful client logged in: ${client.user.tag}`);
        // client.emit("tickGiveaway");
        // client.emit("tickGrinder");
        // client.emit("tickPartnership");
        // client.emit("tickTimer");

        client.user.setPresence({
            activities: [
                { name: `The New Currency`, type: ActivityType.Watching },
            ],
        });
    },
};
