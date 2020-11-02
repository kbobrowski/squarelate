export namespace Squarelate {
  export const init = (githubUrl: string) => {
    const translatedImage = (url: string, list: string[], lang: string): string => {
      const fileArgs = url.substring(url.lastIndexOf('/') + 1)
      const qIndex = fileArgs.indexOf('?')
      let file = fileArgs
      if (qIndex >= 0) {
        file = fileArgs.substring(0, qIndex)
      }
      if (list.includes(file)) {
        return `${githubUrl}/${lang}/images/${fileArgs}`
      }
      return url
    }
    const translatedPdf = (url: string, list: string[], lang: string): string => {
      if (url.startsWith('/s/')) {
        const file = url.substring(3)
        if (list.includes(file)) {
          return `${githubUrl}/${lang}/assets/${file}`
        }
      }
      return url
    }
    $(() => {
      const queryDict = {}
      location.search.substr(1).split("&").forEach((item) => {
        queryDict[item.split("=")[0]] = item.split("=")[1]
      })
      let lang = 'en'
      const savedLang = localStorage.getItem('ecv-lang')
      if (queryDict.hasOwnProperty('lang')) {
        lang = queryDict['lang']
      } else if (savedLang) {
        lang = savedLang
      }
      localStorage.setItem('ecv-lang', lang)
      history.pushState({}, '', `${window.location.pathname}?lang=${lang}`)
      if (lang !== 'en') {
        $.getJSON(`${githubUrl}/${lang}/dict.json`, (data) => {
          $('p, span, :header, a').contents()
            .each(function() {
              if (this.nodeType == 3 && data.hasOwnProperty(this['data'])) {
                this['data'] = data[this['data']]
              }
            })
        })
        $.getJSON(`${githubUrl}/${lang}/assets/list.json`, (data) => {
          $('a').each(function() {
            $(this).attr('href', (i, href) => {
              if (href) {
                return translatedPdf(href, data, lang)
              }
            })
          })
        })
        $.getJSON(`${githubUrl}/${lang}/images/list.json`, (data) => {
          $('img').each(function() {
            $(this).attr('data-src', (i, src) => {
              if (src) {
                return translatedImage(src, data, lang)
              }
            })
            $(this).attr('src', (i, src) => {
              if (src) {
                return translatedImage(src, data, lang)
              }
            })
          })
        })
      }
    })
  }
}
