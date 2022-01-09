const cache_container = "static_v2"
const files = [
    './',
    './styles.css',
    './js/script.js',
    './js/anime.min.js'
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cache_container).then(cache => {
            cache.addAll(files)
        })
    )
})

self.addEventListener('activate', event => console.log('activated', event))

self.addEventListener("fetch", event => {
    event.respondWith(
      caches.match(event.request).then(res => {
        return res || fetch(event.request)
      })
    )
  })