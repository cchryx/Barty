const fs = require("node:fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { DISCORD_BOT_TOKEN } = require("../config.json");

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        const clientId = "1099423982756835338";
        const guildId = "1099425906075897917";

        client.commandArray = [];
        for (folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`${path}/${folder}`)
                .filter((file) => file.endsWith(".js"));

            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: "9" }).setToken(DISCORD_BOT_TOKEN);

        (async () => {
            const mode = "global";
            if (mode === "global") {
                try {
                    console.log(
                        ">> Started refreshing application (/) commands [global]"
                    );

                    await rest.put(Routes.applicationCommands(clientId), {
                        body: client.commandArray,
                    });

                    console.log(
                        ">> Successfully reloaded application (/) commands [global]"
                    );
                } catch (error) {
                    console.error(error);
                }
            } else {
                try {
                    console.log(
                        ">> Started refreshing application (/) commands [development]"
                    );

                    await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        { body: client.commandArray }
                    );

                    console.log(
                        ">> Successfully reloaded application (/) commands [development]"
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    };
};
