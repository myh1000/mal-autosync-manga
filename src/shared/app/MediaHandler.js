export const MIN_CYCLE = (1000 * 60 * 5)

export class MediaHandler {

  accept (url) {
    return false
  }

  verify (source, cycle, $) {
    return true
  }

  parseData (source, $) {
    return null
  }

  lifeOf (cycle) {
    return (cycle.end ? cycle.end - cycle.start : new Date().getTime() - cycle.start)
  }

  parseNumber (data) {
    return parseInt(data.match(/\d+/g), 10)
  }
}
