export namespace Squarelate {
  export function init(githubUrl: string) {
    function translatedImage(url, list, lang) {
      const fileArgs = url.substring(url.lastIndexOf('/') + 1);
      const qIndex = fileArgs.indexOf('?');
      let file = fileArgs;
      if (qIndex >= 0) {
        file = fileArgs.substring(0, qIndex);
      }
      if (list.includes(file)) {
        return `${githubUrl}/${lang}/images/${fileArgs}`;
      }
      return url;
    }
    function translatedPdf(url, list, lang) {
      if (url.startsWith('/s/')) {
        const file = url.substring(3);
        if (list.includes(file)) {
          return `${githubUrl}/${lang}/assets/${file}`;
        }
      }
      return url;
    }
    $(function() {
      const queryDict = {}
      location.search.substr(1).split("&").forEach(function(item) {
        queryDict[item.split("=")[0]] = item.split("=")[1]
      })
      let lang = 'en';
      const savedLang = localStorage.getItem('ecv-lang');
      if (queryDict.hasOwnProperty('lang')) {
        lang = queryDict['lang'];
      } else if (savedLang) {
        lang = savedLang
      }
      localStorage.setItem('ecv-lang', lang);
      history.pushState({}, '', `${window.location.pathname}?lang=${lang}`);
      if (lang !== 'en') {
        $.getJSON(`${githubUrl}/${lang}/dict.json`, function(data) {
          $('p, span, :header, a').contents()
            .each(function() {
              if (this.nodeType == 3 && data.hasOwnProperty(this['data'])) {
                this['data'] = data[this['data']];
              }
            });
        });
        $.getJSON(`${githubUrl}/${lang}/assets/list.json`, function(data) {
          $('a').each(function() {
            $(this).attr('href', function(i, href) {
              if (href) {
                return translatedPdf(href, data, lang);
              }
            });
          });
        });
        $.getJSON(`${githubUrl}/${lang}/images/list.json`, function(data) {
          $('img').each(function() {
            $(this).attr('data-src', function(i, src) {
              if (src) {
                return translatedImage(src, data, lang);
              }
            });
            $(this).attr('src', function(i, src) {
              if (src) {
                return translatedImage(src, data, lang);
              }
            });
          });
        });
      }
    });
  }
}
