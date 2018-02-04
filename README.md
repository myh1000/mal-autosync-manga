# patchouli-chan

### mal scrobbler/autosync for manga

![extension icon](src/images/icon128.png)

Get it on the [Chrome Web Store](https://chrome.google.com/webstore/detail/patchouli-chan-auto-sync/dinnbkcfnmmhapafnjcknpncdonhmmlf) and [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/patchouli-chan/)!

## Table of Contents
* [Introduction](#introduction)
* [Installation](#installation)
* [Adding Support/Contributing](#adding-supportcontributing)

# Introduction

A browser extension that scrobbles what you're reading with MyAnimeList

#### Currently Supported Sites:
* Batoto
* KissManga
* MangaDex
* 9Anime

There came the need for an extension to update MAL because the one I have for anime, [MAL Updater OS X](https://github.com/myh1000/malupdaterosx-cocoa), uses Chrome's applescript to get a list of tabs (not necessarily the active one) and take the first one that it came upon that matched its search parameter's (eg. KissAnime or Crunchyroll).

While it may be normal to have only one anime tab open, I typically have tens of manga tabs open -- thus came the need for a solution to the active tab problem: **mal-autosync-manga**.

Original source code and inspiration from [mal-scrobble](https://github.com/TSedlar/mal-scrobble).

![](spread.png)

# Installation

## Chrome
The extension itself is within the ```build/chrome/``` folder.

1. Download the zip file or clone the git repository
2. Unpack and save **```build/chrome/```** to a secure location
3. Go to the extension list: chrome://extensions
4. Activate "Developers Mode"
5. Click "Load unpacked extension…"
6. Select the folder with the extension and enjoy

## Firefox
The extension itself is within the ```build/firefox/``` folder.

1. Download the zip file or clone the git repository
2. Unpack and save **```build/firefox/```** to a secure location
3. Go to about:debugging
4. Click "Load Temporary Add-on"
5. Select manifest.json and enjoy

**OR** load from the xpi at ```build/firefox/web-ext-artifacts/*.xpi```

## Building from source

```shell
git clone https://github.com/myh1000/mal-autosync-manga.git
cd mal-autosync-manga
npm install
npm run build (buildf for firefox)
```

# Adding Support/Contributing

Please look under ```src/app/handlers``` for examples as guidance for how to add support for your favorite manga reader.

 Edit ```accept``` and ```parseData``` so the extension runs and syncs only on the manga chapter pages.
