import { Builder } from './Builder'
import $ from 'jquery'

export namespace Squarelate {
  export const builder = (): Builder => {
    return new Builder()
  }

  export const defaultBuilder = (baseUrl: string, localStorageKey: string, sourceLang: string): Builder => {
    return new Builder()
      .imageTranslation(
        (lang, filename) => `${baseUrl}/${lang}/images/${filename}`,
        (lang, callback) => $.getJSON(`${baseUrl}/${lang}/images/list.json`, callback))
      .linkTranslation(
        (lang, filename) => `${baseUrl}/${lang}/assets/${filename}`,
        (lang, callback) => $.getJSON(`${baseUrl}/${lang}/assets/list.json`, callback),
        (url) => url.startsWith('/s/') ? url.substring(3) : null)
      .textTranslation(
        (lang, callback) => $.getJSON(`${baseUrl}/${lang}/dict.json`, callback),
        'p, :header, span, a, b, i'
      )
      .useLocalStorage(localStorageKey)
      .sourceLang(sourceLang)
  }
}
