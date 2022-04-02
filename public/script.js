const ids = ['login', 'welcome', 'home', 'notifications', 'history', 'notifications-admin', 'history-admin', 'setting']
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
                if (active) document.querySelector(`nav.bottom span.${active}`).classList.add('nav-inactive')
                document.querySelector(`nav.bottom span.${wind}`).classList.add('nav-active')
            }
    }
    active = wind
}

let tl = document.getElementById('loader')
function showLoader() {
    tl.classList.remove('hidden')
}

function hideLoader() {
    tl.classList.add('hidden')
}

let items = document.getElementsByTagName('form')
toggle.onclick = () => {
    items[0].classList.toggle('hidden')
    items[1].classList.toggle('hidden')
}
document.querySelectorAll('form span.toggle').forEach(e => {
    e.onclick = () => {
        items[1].classList.toggle('hidden')
        items[3].classList.toggle('hidden')
    }
})

function dismissToast(e) {
    e.parentNode.remove()
}

function toast(value) {
    let id = Math.round( Math.random() * 10000 )
    document.querySelector('#smack').insertAdjacentHTML("afterbegin", `<div id="t${id}" class="toast"><span class="value">${value}</span><span class="material-icons fr" onclick="this.parentNode.remove()" >close</span></div>`)
    setTimeout(() => {
        try {
            document.querySelector(`#t${id}`).remove()
        } catch (error) {
            console.log("Toast already Dismissed !")
        }
    }, 3500);
}
