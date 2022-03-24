const ids = ['login', 'welcome', 'home', 'notifications', 'history', 'setting']
let active = 0

function switchTo(wind) {
    console.log(active, wind)
    if (!active) ids.forEach(e => {
        document.querySelector(`#container div.${e}`).classList.remove('hidden')
    })
    if (wind !== active && ids.includes(wind)) {
        console.log(active, wind)
        if (active) document.querySelector(`#container div.${active}`).classList.add('hidden')
        document.querySelector(`#container div.${wind}`).classList.remove('hidden')
            if (wind !== 'welcome' || wind !== 'login') {
                if (active) document.querySelector(`nav.bottom span.${active}`).classList.remove('nav-active')
                if (active) document.querySelector(`nav.bottom span.${active}`).classList.remove('nav-inactive')
                document.querySelector(`nav.bottom span.${wind}`).classList.add('nav-active')
            }
    }
    active = wind
}
