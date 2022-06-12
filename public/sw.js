// version development 1.2.10 oyea oyea
// ALMOST WROKING oh yeaysvgadjkfvgvgh696969jv
// final preview
// lets see
//changes done
// very good
// halls selection now available !
self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open("rnsHalls").then(function (cache) {
            return cache.addAll([
                "./android-chrome-192x192.png",
                "./apple-touch-icon.png",
                "./browserconfig.xml",
                "./favicon-16x16.png",
                "./favicon-32x32.png",
                "./main.js",
                "./script.js",
                "./loader.css",
                "./index.html",
                "./favicon.ico",
                "./mstile-144x144.png",
                "./mstile-70x70.png",
                "./safari-pinned-tab.svg",
                "./site.webmanifest",
                "./assets/material-icons.css",
                "./assets/material-icons.woff2",
                "./assets/Roboto-Regular.ttf",
                "./media/fb.webp",
                "./media/google.webp",
                "./media/twitter.webp",
                "./media/back.webp",
                "./media/avatar.webp",
            ])
        })
    )
    self.skipWaiting()
})

self.addEventListener("fetch", function (e) {
    console.log(e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request)
        })
    )
})
