module.exports = (client) => {
    process.on("uncaughtException", (error) => {
        console.log("uncaughtException");
        console.log(error);
    });

    process.on("unhandledRejection", (error) => {
        if (error.code !== "InteractionAlreadyReplied") {
            console.log("unhandledRejection");
            console.error(error);
        }
    });
};
