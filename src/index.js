import * as _ from 'lodash'
const cheerio = require('cheerio')

import { WebExtension } from './app/WebExtension'
import { Task } from './app/helpers/Task'
import { MyAnimeList } from './app/helpers/MyAnimeList'
import { KissMangaHandler } from './app/handlers/KissMangaHandler'
import { BatotoHandler } from './app/handlers/BatotoHandler'
import { MangaDexHandler } from './app/handlers/MangaDexHandler'
import { NineAnimeHandler } from './app/handlers/9animeHandler'

const HANDLERS = [
  new KissMangaHandler(),
  new BatotoHandler(),
  new MangaDexHandler(),
  new NineAnimeHandler()
]

const READ_CACHE = []
const INJECTED = []
const CYCLES = {}

const auth = (user, pass) => {
  const joined = `${user}:${pass}`
  const b64 = new Buffer(joined).toString('base64')
  return `Basic ${b64}`
}

let inject = (tabId) => {
  // eslint-disable-next-line no-undef
  chrome.tabs.executeScript(tabId, { file: 'content.js' })
}

let handleInject = (tabId) => {
  WebExtension.getCurrentTabURL()
    .then(url => {
      if (url.startsWith('http')) {
        console.log('Injecting content')
        inject(tabId)
        INJECTED.push(tabId)
        console.log('Injected')
      }
    })
}

// eslint-disable-next-line no-undef
chrome.tabs.onActivated.addListener((obj) => {
  // eslint-disable-next-line no-undef
  chrome.tabs.get(obj.tabId, (tab) => {
    console.log('chrome.tabs activated')
    let key = tab.url.toLowerCase()
    if (CYCLES[key]) {
      CYCLES[key].end = undefined
    } else {
      CYCLES[key] = { start: new Date().getTime() }
    }
    handleInject(obj.tabId)
  })
})

let oldTabURL = null

// eslint-disable-next-line no-undef
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('chrome.tabs updated')
  if (changeInfo.status === 'complete') {
    if (oldTabURL) {
      console.log(`set end cycle for ${oldTabURL}`)
      CYCLES[oldTabURL].end = new Date().getTime()
    }
    console.log(`set cycle start for ${tab.url}`)
    let key = tab.url.toLowerCase()
    CYCLES[key] = { start: new Date().getTime() }
    oldTabURL = key
    if (!_.includes(INJECTED, tabId)) {
      handleInject(tabId)
    }
  }
})

let checkCredentials = () => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    chrome.storage.local.get('credentials', (storage) => {
      if (storage && storage.credentials) {
        resolve(storage)
      } else {
        reject('Please click my icon and sign in to enable scrobbling')
      }
    })
  })
}

let notified = false

// eslint-disable-next-line no-undef
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    if (msg && msg.action) {
      switch (msg.action) {
        case 'auth':
          // eslint-disable-next-line no-undef
          chrome.storage.local.set({ credentials: { username: msg.username, authorization: auth(msg.username, msg.password) } }, () => {
            checkCredentials()
              .then(storage => {
                MyAnimeList.authenticate(storage.credentials.username, storage.credentials.authorization)
                MyAnimeList.verifyCredentials()
                  .then(result => {
                    let success = (result && result.responseCode === 200)
                    port.postMessage({ action: 'auth', success: success })
                  })
                  .catch(err => port.postMessage({ action: 'auth', success: false, message: err }))
              })
          })
          break

        case 'requestCreds':
          checkCredentials()
            .then(storage => {
              storage.action = 'requestCreds'
              port.postMessage(storage)
            })
          break
      }
    }
  })
})

let lastValidTabVal = null

let lastValidTab = () => {
  return new Promise((resolve, reject) => {
    WebExtension.getCurrentTab()
      .then(tab => {
        let resolved = false
        _.each(HANDLERS, (handler) => {
          if (handler.accept(tab.url)) {
            resolved = true
            lastValidTabVal = tab
            resolve(lastValidTabVal)
          }
        })
        if (!resolved) {
          if (lastValidTabVal) {
            resolve(lastValidTabVal)
          } else {
            reject('last valid tab not found')
          }
        }
      })
      .catch(err => reject(err))
  })
}

console.log('Started background task')
new Task(() => {
  checkCredentials()
    .then(storage => {
      MyAnimeList.authenticate(storage.credentials.username, storage.credentials.authorization)
      lastValidTab()
        .then(tab => {
          let url = tab.url.toLowerCase()
          _.each(HANDLERS, (handler) => {
            if (handler.accept(url)) {
              if (!_.includes(READ_CACHE, url)) {
                console.log(`Handling ${url}`)
                WebExtension.getPageSource(tab.id)
                  .then(source => {
                    let $ = cheerio.load(source)
                    console.log(`life: ${handler.lifeOf(CYCLES[url])}`)
                    if (handler.verify(source, CYCLES[url], $)) {
                      let data = handler.parseData(source, $)
                      console.log(`source: ${data.source}`)
                      console.log(`title: ${data.title}`)
                      if (data.source === '9anime') {
                        console.log(`episode: ${data.episode}`)
                        MyAnimeList.resolveAnimeSearch(data.title)
                        .then(entries => {
                          var result = MyAnimeList.fuzzyCompare(entries, data.title)
                          console.log(`id: ${result.id}`)
                          MyAnimeList.checkEpisode(result.id, 'anime')
                            .then(epCount => {
                              console.log(`Updating MyAnimeList... MAL count: ${epCount}`)
                              if (data.episode <= epCount) {
                                console.log('Already up to date')
                                READ_CACHE.push(url)
                              } else {
                                let totalEpisodes = parseInt(result.episodes[0])
                                let status = (data.episode === totalEpisodes ? 2 : 1)
                                console.log(`status: ${status}`)
                                MyAnimeList.updateAnimeList(result.id, status, data.episode)
                                  .then(res => {
                                    if (res.responseCode < 400) {
                                      console.log('Updated!', status)
                                    } else {
                                      console.log('Error!', res)
                                    }
                                    READ_CACHE.push(url)
                                  })
                              }
                            })
                        })
                      } else {
                        console.log(`chapter: ${data.episode}`)
                        MyAnimeList.resolveMangaSearch(data.title)
                          .then(entries => {
                            var result = MyAnimeList.fuzzyCompare(entries, data.title)
                            console.log(`id: ${result.id}`)
                            MyAnimeList.checkEpisode(result.id, 'manga')
                              .then(epCount => {
                                console.log(`Updating MyAnimeList... MAL count: ${epCount}`)
                                if (data.episode <= epCount) {
                                  console.log('Already up to date')
                                  READ_CACHE.push(url)
                                } else {
                                  let totalChapters = parseInt(result.chapters[0])
                                  let status = (data.episode === totalChapters ? 2 : 1)
                                  console.log(`status: ${status}`)
                                  MyAnimeList.updateMangaList(result.id, status, data.episode)
                                    .then(res => {
                                      if (res.responseCode < 400) {
                                        console.log('Updated!', status)
                                      } else {
                                        console.log('Error!', res)
                                      }
                                      READ_CACHE.push(url)
                                    })
                                }
                              })
                          })
                      }
                    }
                  })
              }
            }
          })
        })
    })
    .catch(err => {
      if (!notified) {
        // eslint-disable-next-line no-undef
        chrome.notifications.create('cred-notif', {
          type: 'basic',
          title: 'mal-scrobble',
          message: err,
          iconUrl: 'images/icon128.png'
        })
        notified = true
      }
    })
}, 10000).start()
