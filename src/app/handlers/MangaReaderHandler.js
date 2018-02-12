import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class MangaReaderHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('mangareader.net') >= 0 && !isNaN(url.split('/')[4]) && (url.match(/\//g) || []).length >= 4
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('title')[0].children[0].data.split('-')[0].trim()
    let episode = super.parseChapter(title)
    title = title.substring(0, title.lastIndexOf(' '))

    console.log(title, episode)

    return { source: 'MangaReader', title: title, episode: episode }
  }
}
