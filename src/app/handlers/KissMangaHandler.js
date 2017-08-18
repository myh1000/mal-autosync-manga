import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class KissMangaHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('kissmanga.com') >= 0 && url.split('/')[3].toLowerCase() === 'manga' && (url.match(/\//g) || []).length > 4
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('div[id=navsubbar]').find('a').text().trim()
    title = title.split('\n')[1].trim()

    let episode
    if ($('#selectReadType option:selected').text() === 'All pages') {
      episode = $('.selectChapter option:selected')[0].children[0].data.trim()
    } else {
      episode = $('#selectChapter option:selected')[0].children[0].data.trim()
    }
    episode = super.parseChapter(episode)

    return { source: 'KissManga', title: title, episode: episode }
  }
}
