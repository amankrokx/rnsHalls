const ids = ['login', 'welcome', 'home', 'notifications', 'history', 'setting']
let active = 0

function switchTo(wind) {
    console.log(active, wind)
    ids.forEach(e => {
        document.querySelector(`#container div.${e}`).classList.add('hidden')
    })
    if (ids.includes(wind)) {
        console.log(active, wind)
        document.querySelector(`#container div.${wind}`).classList.remove('hidden')
            if (wind !== 'welcome' || wind !== 'login') {
                if (active) document.querySelector(`nav.bottom span.${active}`).classList.remove('nav-active')
                if (active) document.querySelector(`nav.bottom span.${active}`).classList.remove('nav-inactive')
                document.querySelector(`nav.bottom span.${wind}`).classList.add('nav-active')
            }
    }
    active = wind
}
