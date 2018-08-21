class ScheduleCalculator {
    constructor (devices, rates, maxPower) {
        this.devices = devices
        this.rates = rates
        this.maxPower = maxPower

        // TODO validate maxPower
        // TODO validate rates coverage

        this.schedule = []
        for (var i = 0; i < 24; ++i) {
            var targetRate = 0
            this.rates.forEach(rate => {
                if (rate.from <= rate.to) {
                    if (i >= rate.from && i < rate.to) {
                        targetRate = rate.value
                    }
                } else {
                    if (i >= rate.from || i < rate.to) {
                        targetRate = rate.value
                    }
                }
            })

            this.schedule.push({
                hour: i,
                isNight: (i < 7 || i > 21),
                leftPower: this.maxPower,
                rate: targetRate,
                devices: []
            })
        }
    }

    calcSchedule () {
        // Sort devices by power descending.
        let devicesSortedByPower = this.devices.slice(0)
        devicesSortedByPower.sort((d1, d2) => {
            return -(d1.power < d2.power ? -1 : (d1.power > d2.power ? 1 : 0))
        })

        devicesSortedByPower.forEach(d => {
            this.processDevice(d)
        })

        let result = {
            schedule: {},
            consumedEnergy: {
                value: 0,
                devices: {}
            }
        }

        this.schedule.forEach((s, i) => {
            result.schedule[`${i}`] = s.devices.map(d => d.id)
            s.devices.forEach(d => {
                const cost = d.power / 1000.0 * s.rate
                result.consumedEnergy.value += cost
                
                if (!result.consumedEnergy.devices[d.id]) {
                    result.consumedEnergy.devices[d.id] = 0
                }
                result.consumedEnergy.devices[d.id] += cost
            })
        })

        return result
    }

    findCheapiestTimeRangeForDevice(device) {
        var resultRange = null
        this.schedule.forEach(range => {
            if (device.mode) {
                const passByMode = (device.mode === 'night' && range.isNight || device.mode === 'day' && !range.isNight)
                if (!passByMode) {
                    return
                }
            }

            const passByPower = (range.leftPower >= device.power)
            if (!passByPower) {
                return
            }

            const isAlreadyUsed = (range.devices.includes(device))
            if (isAlreadyUsed) {
                return
            }

            var shouldSet = (resultRange === null || range.rate < resultRange.rate)
            if (shouldSet) {
                resultRange = range
            }
        })
        return resultRange
    }

    addDeviceToTimeRange(device, range) {
        range.devices.push(device)
        range.leftPower -= device.power
    }

    processDevice (device) {
        var usedDuration = 0

        while (usedDuration < device.duration) {
            // Find the cheapiest time range for running the device.
            const range = this.findCheapiestTimeRangeForDevice(device)
            if (range === null) {
                console.error(`Can't find range for device ${device}`)
            }

            this.addDeviceToTimeRange(device, range)
            usedDuration += 1
        }
    }
}

module.exports = ScheduleCalculator
