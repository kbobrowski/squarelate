import { Builder } from './Builder'

export namespace Squarelate {
  export const builder = (): Builder => {
    return new Builder()
  }

  export const init = (baseUrl: string, localStorageKey: string, sourceLang: string): void => {
    new Builder()
      .imagesTranslation(
        (lang, filename) => `${baseUrl}/${lang}/images/${filename}`,
        (lang, callback) => $.getJSON(`${baseUrl}/${lang}/images/list.json`, callback))
      .assetsTranslation(
        (lang, filename) => `${baseUrl}/${lang}/assets/${filename}`,
        (lang, callback) => $.getJSON(`${baseUrl}/${lang}/assets/list.json`, callback))
      .textTranslation((lang, callback) => $.getJSON(`${baseUrl}/${lang}/dict.json`, callback))
      .useLocalStorage(localStorageKey)
      .sourceLang(sourceLang)
      .init()
  }
}
