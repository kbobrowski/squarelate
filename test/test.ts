import Squarelate from "../src";
import $ from 'jquery'

const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(() => resolve(), ms))
}

test("Squarelate exported", () => {
  expect(Squarelate).toBeInstanceOf(Object);
});

test('translate to two languages', async () => {
  const builder = Squarelate.builder()
    .textTranslation((lang, callback) => {
      if (lang === 'pl') {
        callback({
          'hi': 'hej'
        })
      } else if (lang === 'de') {
        callback({
          'hi': 'hallo'
        })
      }
    }, 'p')
    .sourceLang('en')
    .useCookie('lang')

  document.body.innerHTML = '<p id="test">hi</p>'
  const selector = $('#test')

  window.history.replaceState({}, '', '/?lang=pl');
  builder.init()
  await sleep(100)
  expect(selector.text()).toEqual('hej')

  selector.text('hi')
  window.history.replaceState({}, '', '/?lang=de');
  builder.init()
  await sleep(100)
  expect(selector.text()).toEqual('hallo')
})

test('translate nested tags', async () => {
  const builder = Squarelate.builder()
    .textTranslation((lang, callback) =>
      callback({
        'hi': 'hej'
      }), 'p, span, b'
    )
    .sourceLang('en')
    .useCookie('lang')

  document.body.innerHTML = '<p>hi<span>hi</span>hi<b>hi</b>hi</p>'
  window.history.replaceState({}, '', '/?lang=pl');
  builder.init()
  await sleep(100)
  expect(document.body.innerHTML).toEqual('<p>hej<span>hej</span>hej<b>hej</b>hej</p>')
})

test('translate image', async () => {
  const builder = Squarelate.builder()
    .imageTranslation(
      (lang, filename) => `/images/${lang}/${filename}`,
      ((lang, callback) => callback(['test.png']))
    )
    .sourceLang('en')
    .useCookie('lang')
  document.body.innerHTML = '<img data-src="/images/test.png" src="/images/test.png?width=200"/>'
  window.history.replaceState({}, '', '/?lang=pl');
  builder.init()
  await sleep(100)
  expect(document.body.innerHTML).toEqual('<img data-src="/images/pl/test.png" src="/images/pl/test.png?width=200">')
})

test('translate link', async () => {
  const builder = Squarelate.builder()
    .linkTranslation(
      (lang, filename) => `/assets/${lang}/${filename}`,
      (lang, callback) => callback(['test.pdf']),
      (url) => url.startsWith('/assets/') ? url.substring('/assets/'.length) : null)
    .sourceLang('en')
    .useCookie('lang')
  document.body.innerHTML = '<a href="/assets/test.pdf">test</a>'
  window.history.replaceState({}, '', '/?lang=pl');
  builder.init()
  await sleep(100)
  expect(document.body.innerHTML).toEqual('<a href="/assets/pl/test.pdf">test</a>')
})
