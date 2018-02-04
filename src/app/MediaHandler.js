export const MIN_CYCLE = (1000 * 7) /* 7 seconds */

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

  parseChapter (string) {
    var result

    if ((result = string.match(/(\W+?)(chapter|chap|ch)\.*(\s*[\d.]*)/i))) {
      if (parseFloat(result[3])) {
        if (result[3].match(/\.+(\d+)/g)) {
          return parseFloat(result[3].replace(result[3].match(/\.+(\d+)/g), '.' + (parseFloat(result[3].match(/\.+(\d+)/)[1]))))
        } else {
          return parseFloat(result[3])
        }
      }
    }

    if ((result = string.match(/(\d+(\.\d+)?)/g))) {
      if (result[0].match(/\.+(\d+)/g)) {
        return parseFloat(result[0].replace(result[0].match(/\.+(\d+)/g), '.' + (parseFloat(result[0].match(/\.+(\d+)/)[1]))))
      } else {
        return parseFloat(result[0])
      }
    }
    // if all else fails
    return 1
  }
}
