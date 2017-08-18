import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class NineAnimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('9anime.to') >= 0 && url.indexOf('watch') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('h1.title')[0].children[0].data.trim()

    let episode = $('.episodes.active li .active')[0].children[0].data.trim()
    episode = super.parseChapter(episode)

    return { source: '9anime', title: title, episode: episode }
  }
}
