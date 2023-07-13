const exp = /^((?<predefined>@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(?<every>@every (?<every_value>((\d+)(ns|us|µs|ms|s|m|h))+))|(?<cron>(?<cron_minute>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_hour>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_day_month>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_month>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_day_week>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*))))$/

const lines = [
    '20 16 * * *',
    '0 0 0 1 1',
    '0 0 0 1 1,2',
    '0 0 0 1 1,2,3',
    '0 0 * * 1/4',
    '0 0 * 0 1-4',
    '0 * * * 2/4',
    '* * * * *',
    // '@annually',
    // '@yearly',
    // '@monthly',
    // '@weekly',
    // '@daily',
    // '@hourly',
    // '@reboot',
    // '@every 5s',
    // '@every 20h30m',
]

export class Cron {
    constructor(
        readonly minute: string,
        readonly hour: string,
        readonly day_month: string,
        readonly month: string,
        readonly day_week: string,
    ) { }
    static parse(value: string) {
        const res = exp.exec(value)?.groups
        if (typeof res?.cron === 'string') {
            return new Cron(
                res.cron_minute,
                res.cron_hour,
                res.cron_day_month,
                res.cron_month,
                res.cron_day_week,
            )
        }
    }
}

for (const l of lines) {
    console.log(l, Cron.parse(l))
}