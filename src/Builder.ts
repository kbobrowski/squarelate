import $ from 'jquery'
import { saveAs } from 'file-saver'

const imageArgsToFilename = (fileArgs: string): string => {
  const qIndex = fileArgs.indexOf('?')
  let file = fileArgs
  if (qIndex >= 0) {
    file = fileArgs.substring(0, qIndex)
  }
  return file
}

export class Builder {
  translateImage_?: (url: string, list: string[], lang: string) => string
  translateAsset_?: (url: string, list: string[], lang: string) => string
  getLang_?: () => string
  setLang_?: (lang: string) => void
  sourceLang_?: string
  tags_?: string
  processDict_?: (lang: string, callback: (data: Record<string, string>) => void) => void
  processAssetList_?: (lang: string, callback: (data: string[]) => void) => void
  processImagesList_?: (lang: string, callback: (data: string[]) => void) => void
  urlToFilename_?: (url: string) => string

  imageTranslation(translatedPath: (lang: string, filename: string) => string, listProducer: (lang: string, callback: (data: string[]) => void) => void) {
    this.translateImage_ = (url: string, list: string[], lang: string): string => {
      const fileArgs = url.substring(url.lastIndexOf('/') + 1)
      const file = imageArgsToFilename(fileArgs)
      if (list.includes(file)) {
        return translatedPath(lang, fileArgs)
      }
      return url
    }
    this.processImagesList_ = listProducer
    return this
  }

  linkTranslation(translatedPath: (lang: string, filename: string) => string,
                  listProducer: (lang: string, callback: (data: string[]) => void) => void,
                  urlToFilename: (url: string) => string) {
    this.urlToFilename_ = urlToFilename
    this.translateAsset_ = (url: string, list: string[], lang: string): string => {
      if (urlToFilename) {
        const file = urlToFilename(url)
        if (file && list.includes(file)) {
          return translatedPath(lang, file)
        }
      }
      return url
    }
    this.processAssetList_ = listProducer
    return this
  }

  textTranslation(dictProducer: (lang: string, callback: (data: Record<string, string>) => void) => void, tags: string) {
    this.processDict_ = dictProducer
    this.tags_ = tags
    return this
  }

  getLang(arg: () => string) {
    this.getLang_ = arg
    return this
  }

  setLang(arg: (lang: string) => void) {
    this.setLang_ = arg
    return this
  }

  useLocalStorage(keyName: string) {
    this.getLang_ = () => localStorage.getItem(keyName)
    this.setLang_ = (lang: string) => localStorage.setItem(keyName, lang)
    return this
  }

  sourceLang(arg: string) {
    this.sourceLang_ = arg
    return this
  }

  tags(arg: string) {
    this.tags_ = arg
    return this
  }

  textDownload() {
    const set: Set<string> = new Set<string>()
    $(this.tags_).contents()
      .each(function() {
        if (this.nodeType == 3) {
          const data = this['data']
          if (data) {
            set.add(data)
          }
        }
      })
    const list = Array.from(set)
    const blob = new Blob([JSON.stringify(list, undefined, 2)], {type: "application/json;charset=utf-8"})
    saveAs(blob, "texts.json")
  }

  imageDownload() {
    const set: Set<string> = new Set<string>()
    const addToSet = (src: string): void => {
      if (src) {
        const fileArgs = src.substring(src.lastIndexOf('/') + 1)
        const file = imageArgsToFilename(fileArgs)
        if (file) {
          set.add(file)
        }
      }
    }
    $('img').each(function() {
      $(this).attr('data-src', (i, src) => {
        addToSet(src)
      })
      $(this).attr('src', (i, src) => {
        addToSet(src)
      })
    })
    const list = Array.from(set)
    const blob = new Blob([JSON.stringify(list, undefined, 2)], {type: "application/json;charset=utf-8"})
    saveAs(blob, "images.json")
  }

  linkDownload() {
    const set: Set<string> = new Set<string>()
    const self = this
    $('a').each(function() {
      $(this).attr('href', (i, href) => {
        if (href) {
          const file = self.urlToFilename_(href)
          if (file) {
            set.add(file)
          }
        }
      })
    })
    const list = Array.from(set)
    const blob = new Blob([JSON.stringify(list, undefined, 2)], {type: "application/json;charset=utf-8"})
    saveAs(blob, "links.json")
  }

  init() {
    $(() => {
      if (!this.sourceLang_) {
        console.error("Squarelate: source lang not set")
        return
      }
      if (!this.setLang_ || !this.getLang_) {
        console.error("Squarelate: setLang or getLang not set")
        return
      }
      const queryDict = {}
      location.search.substr(1).split("&").forEach((item) => {
        queryDict[item.split("=")[0]] = item.split("=")[1]
      })
      let lang = this.sourceLang_
      const savedLang = this.getLang_()
      if (queryDict.hasOwnProperty('lang')) {
        lang = queryDict['lang']
      } else if (savedLang) {
        lang = savedLang
      }
      this.setLang_(lang)
      history.pushState({}, '', `${window.location.pathname}?lang=${lang}`)
      if (lang !== this.sourceLang_) {
        if (this.processDict_ && this.tags_) {
          this.processDict_(lang, (data) => {
            $(this.tags_).contents()
              .each(function() {
                if (this.nodeType == 3 && data.hasOwnProperty(this['data'])) {
                  this['data'] = data[this['data']]
                }
              })
          })
        }
        const self = this
        if (this.processAssetList_ && this.translateAsset_) {
          this.processAssetList_(lang, (data) => {
            $('a').each(function() {
              $(this).attr('href', (i, href) => {
                if (href) {
                  return self.translateAsset_(href, data, lang)
                }
              })
            })
          })
        }
        if (this.processImagesList_ && this.translateImage_) {
          this.processImagesList_(lang, (data) => {
            $('img').each(function() {
              $(this).attr('data-src', (i, src) => {
                if (src) {
                  return self.translateImage_(src, data, lang)
                }
              })
              $(this).attr('src', (i, src) => {
                if (src) {
                  return self.translateImage_(src, data, lang)
                }
              })
            })
          })
        }
      }
    })
  }
}
