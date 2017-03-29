import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class BatotoHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('bato.to') >= 0 && url.indexOf('reader#') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('ul:first-child a', $('.moderation_bar').first()).eq(0)[0].children[0].data.trim()
    console.log(title)
    let episode = $('[name=chapter_select] option:selected')[0].children[0].data.trim()
    episode = super.parseChapter(episode)

    return { title: title, episode: episode }
  }
}
