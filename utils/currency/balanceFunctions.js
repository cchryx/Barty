const BALANCE_MODEL = require("../../models/currency/balanceSchema");
const { createBalance } = require("./createFunctions");

class Balancefunctions {
    static async balanceFetch(userId) {
        let balanceData = await BALANCE_MODEL.findOne({ userId: userId });
        if (!balanceData) {
            balanceData = await createBalance(userId);
        }
        return balanceData;
    }

    static async balanceEdit(userId, type, action, value) {
        let balanceData = await BALANCE_MODEL.findOne({ userId: userId });
        if (!balanceData) {
            balanceData = await createBalance(userId);
        }

        if (!balanceData.balance[type]) balanceData.balance[type] = 0;

        if (action === "minus") {
            balanceData.balance[type] -= value;
        } else if (action === "add") {
            balanceData.balance[type] += value;
        } else if (action === "set") {
            balanceData.balance[type] = value;
        }

        return await BALANCE_MODEL.findOneAndUpdate(
            {
                userId: userId,
            },
            balanceData
        );
    }

    static async balanceWithdraw(userId, value) {
        let balanceData = await BALANCE_MODEL.findOne({ userId: userId });
        if (!balanceData) {
            balanceData = await createBalance(userId);
        }

        balanceData.balance.bank -= value;
        balanceData.balance.pocket += value;

        return await BALANCE_MODEL.findOneAndUpdate(
            {
                userId: userId,
            },
            balanceData
        );
    }

    static async balanceDeposit(userId, value) {
        let balanceData = await BALANCE_MODEL.findOne({ userId: userId });
        if (!balanceData) {
            balanceData = await createBalance(userId);
        }

        balanceData.balance.bank += value;
        balanceData.balance.pocket -= value;

        return await BALANCE_MODEL.findOneAndUpdate(
            {
                userId: userId,
            },
            balanceData
        );
    }
}

module.exports = Balancefunctions;
