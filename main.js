const getStdin = require('get-stdin');
const Device = require('./Device')
const ScheduleCalculator = require('./ScheduleCalculator')

main()

function main() {
    getStdin().then(str => {
        let json = JSON.parse(str)

        let devices = json.devices.map(d => new Device(d))
        let rates = json.rates
        let maxPower = json.maxPower

        let calc = new ScheduleCalculator(devices, rates, maxPower)
        let result = calc.calcSchedule()
        console.log(JSON.stringify(result, null, '  '))
    })
}
