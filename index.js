const { DISCORD_BOT_TOKEN, MONGODB_SRV } = require("./config.json");
const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
} = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

mongoose
    .connect(MONGODB_SRV, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(">> Successfully connected to database: MongoDB");
    })
    .catch((err) => {
        console.log(err);
    });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel],
});
client.commands = new Collection();

const functionFiles = fs
    .readdirSync("./functions")
    .filter((file) => file.endsWith(".js"));
const eventFiles = fs
    .readdirSync("./events")
    .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./commands");

(async () => {
    for (file of functionFiles) {
        require(`./functions/${file}`)(client);
    }

    client.handleEvents(eventFiles, "./events");
    client.handleCommands(commandFolders, "./commands");
    client.login(DISCORD_BOT_TOKEN);
})();
