const JOB_MODEL = require("../../models/currency/jobSchema");
const { humanizeSeconds } = require("../tools/timeFunctions");

class Jobfunctions {
    static async jobsFetch() {
        let jobsData_display;
        let jobsData = await JOB_MODEL.find({});
        jobsData = jobsData.sort((a, b) => {
            return a.jobPayments.max - b.jobPayments.max;
        });
        const jobsData_map = [];

        for (let i = 0; i < jobsData.length; i++) {
            const jobData = jobsData[i];
            const salary_bonus =
                typeof jobData.jobPayments.bonus === "string"
                    ? `\`${jobData.jobPayments.bonus}\``
                    : `<:coin:1099801213098270911>\`${jobData.jobPayments.bonus.toLocaleString()}\``;
            const job_cooldown = await humanizeSeconds(jobData.jobCooldown);
            const job_display = `**${
                jobData.jobName
            }**\n<:reply_continue:1102285987935174706>Shift Salary Base: <:coin:1099801213098270911>\`${jobData.jobPayments.base.toLocaleString()}\`\n<:reply_continue:1102285987935174706>Shift Salary Max: <:coin:1099801213098270911>\`${jobData.jobPayments.max.toLocaleString()}\`\n<:reply_continue:1102285987935174706>Shift Salary Bonus: ${salary_bonus}\n<:reply_continue:1102285987935174706>Salary Promotion: <:coin:1099801213098270911>\`${jobData.jobPayments.promotion_increase.toLocaleString()}\`\n<:reply_end:1102285982897803385>Shift Cooldown: \`${job_cooldown}\``;
            jobsData_map.push(job_display);
        }

        jobsData_display = jobsData_map.join("\n\n");

        return {
            data: jobsData,
            map: jobsData_map,
            display: jobsData_display,
        };
    }
}

module.exports = Jobfunctions;
