const ids = ["login", "welcome", "home", "notifications", "keys", "bookingHistory", "history", "notifications-admin", "history-admin", "setting"]
// const halls = ["hall1", "hall2", "hall3"]
let active = 0

// let cHall = window.location.hash.substring(1) || "hall1"
// if (!halls.includes(cHall)) {
//     window.location.hash = "hall1"
//     window.location.reload()
// } else document.querySelector("select").value = cHall

// document.querySelector("select").onchange = e => {
//     if (halls.includes(e.target.value)) {
//         window.location.hash = e.target.value
//         window.location.reload()
//     }
// }

function switchTo(wind) {
    console.log(active, wind)
    ids.forEach(e => {
        document.querySelector(`#container div.${e}`).classList.add("hidden")
    })
    if (ids.includes(wind)) {
        console.log(active, wind)
        document.querySelector(`#container div.${wind}`).classList.remove("hidden")
        if (wind !== "welcome" || wind !== "login") {
            if (active) document.querySelector(`nav.bottom span.${active}`).classList.remove("nav-active")
            if (active) document.querySelector(`nav.bottom span.${active}`).classList.add("nav-inactive")
            document.querySelector(`nav.bottom span.${wind}`).classList.add("nav-active")
        }
    }
    active = wind
}

let tl = document.getElementById("loader")
function showLoader() {
    tl.classList.remove("hidden")
}

function hideLoader() {
    tl.classList.add("hidden")
}

let items = document.getElementsByTagName("form")
toggle.onclick = () => {
    items[0].classList.toggle("hidden")
    items[1].classList.toggle("hidden")
}
document.querySelectorAll("form span.toggle").forEach(e => {
    e.onclick = () => {
        items[1].classList.toggle("hidden")
        items[3].classList.toggle("hidden")
    }
})

function dismissToast(e) {
    e.parentNode.remove()
}

function toast(value) {
    let id = Math.round(Math.random() * 10000)
    document
        .querySelector("#smack")
        .insertAdjacentHTML("afterbegin", `<div id="t${id}" class="toast"><span class="value">${value}</span><span class="material-icons fr" onclick="this.parentNode.remove()" >close</span></div>`)
    setTimeout(() => {
        try {
            document.querySelector(`#t${id}`).remove()
        } catch (error) {
            console.log("Toast already Dismissed !")
        }
    }, 5000)
}

function dateFromDay(day, year) {
    if (!year) year = new Date().getFullYear()
    let date = new Date(year, 0) // initialize a date in `year-01-01`
    return new Date(date.setDate(day)) // add the number of days
}

function dayFromDate(date) {
    // requires mm-dd-yyy or Date object instance
    if (date) var now = new Date(date)
    else var now = new Date()
    var start = new Date(now.getFullYear(), 0, 0)
    return Math.floor((now - start) / (1000 * 60 * 60 * 24))
}

const monthsday = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
function dayFromMonth(month, week) {
    if (!week) week = 1
    if (!month) return dayFromDate()
    let day = 1
    for (let i = 1; i < month; i++) {
        day += monthsday[i]
    }
    if (month > 2) day++
    day += (week - 1) * 7
    return day
}

document.querySelector("body").onclick = () => {
    navigator.vibrate(14)
}
