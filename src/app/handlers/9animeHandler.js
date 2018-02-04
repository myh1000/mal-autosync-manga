import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class NineAnimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('9anime.is') >= 0 && url.indexOf('watch') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $("h1[class='title']").text()
    let episode = parseInt($("ul[class~='episodes'] > li > a[class='active']").text())
    episode = super.parseChapter(episode)

    return { source: '9anime', title: title, episode: episode }
  }
}
