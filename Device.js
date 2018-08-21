class Device {
    constructor (params) {
        // TODO validate
        this.id = params.id
        this.name = params.name
        this.power = params.power
        this.duration = params.duration
        this.mode = params.mode
    }
}

module.exports = Device