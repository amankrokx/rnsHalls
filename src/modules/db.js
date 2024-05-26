import { child, get, limitToLast, off, onChildAdded, onValue, query, ref, set, update } from "firebase/database"
import sendMail from "./sendMail.js"

class DBs {
    constructor(db, uid, hid) {
        this.hallid = hid
        this.db = db
        this.uid = uid
        this.secretVerified = false
        onValue(ref(this.db, `users/${uid}/secret`), snapshot => {
            this.secret = snapshot.val()
            document.querySelector("div.setting input.secret").value = this.secret

            onValue(
                ref(this.db, `admin/authorised/${this.secret}`),
                snap => {
                    if (snap.exists()) {
                        if (snap.val()) {
                            toast("Secret Verified !")
                            this.secretVerified = true
                        } else {
                            toast("This secred id has been banned")
                            this.secretVerified = false
                        }
                    } else {
                        toast("invalid secret")
                        this.secretVerified = false
                    }
                },
                {
                    onlyOnce: true,
                }
            )
        })
        this.dateEntry = Array.prototype.slice.call(document.querySelectorAll("div.date div.date-entry"), 1, 8)
        this.timeEntry = Array.prototype.slice.call(document.querySelectorAll("div.time div.time-entry"), 7, 56)
        this.cart = {
            value: 0,
        }
        this.bookingCache = {}
        this.initMonthSelector()
        // setTimeout(() => {
        //     // console.log(this.bookingCache)
        // }, 5000)
    }

    getUserProfile(_uid, callback) {
        if (this.uid === _uid || this.isAdmin) get(ref(this.db, `users/${_uid}/profile`)).then(snapshot => callback(snapshot))
        else get(child(ref(this.db), `users/${this.uid}/profile`)).then(snapshot => callback(snapshot))
    }

    initMonthSelector() {
        let cd = new Date().getMonth() + 1
        this.month = cd
        const mons = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        let eles = document.querySelector("div.months")
        eles.innerHTML = `<span class="active" id="m${cd}" >${mons[cd - 1]}</span>`
        for (let i = cd + 1; i <= 12; i++) {
            eles.innerHTML += `<span id="m${i}" >${mons[i - 1]}</span>`
        }
        let week = Math.floor((new Date().getDate() - 1) / 7) + 1
        this.week = week
        let elet = document.querySelector("div.weeks")
        elet.innerHTML = `<span class="active" id="w1${week}" >Week ${week}</span>`
        for (let w = week + 1; w <= 5; w++) elet.innerHTML += `<span id="w1${w}" >Week ${w}</span>`
        this.day = dayFromDate()
        // console.log("todays date index is " + this.day)
        this.dayListeners = []
        eles.onclick = e => {
            if (e.target.id) {
                // console.log(parseInt(e.target.id.substring(1)))
                document.querySelector(`#m${this.month}`).classList.remove("active")
                e.target.classList.add("active")
                if (new Date().getMonth() + 1 != parseInt(e.target.id.substring(1))) {
                    this.month = parseInt(e.target.id.substring(1))
                    this.week = 1
                    week = 1
                    elet.innerHTML = `<span class="active" id="w1${week}" >Week ${week}</span>`
                    for (let w = week + 1; w <= 5; w++) elet.innerHTML += `<span id="w1${w}" >Week ${w}</span>`
                } else {
                    this.month = parseInt(e.target.id.substring(1))
                    week = Math.floor((new Date().getDate() - 1) / 7) + 1
                    this.week = week
                    elet.innerHTML = `<span class="active" id="w1${week}" >Week ${week}</span>`
                    for (let w = week + 1; w <= 5; w++) elet.innerHTML += `<span id="w1${w}" >Week ${w}</span>`
                }
                this.initCalender({ month: this.month, week: this.week })
                document.querySelector("input.book").scrollIntoView()
            }
        }
        elet.onclick = e => {
            if (e.target.id) {
                // console.log(parseInt(e.target.id.substring(1))%10)
                document.querySelector(`#w1${this.week}`).classList.remove("active")
                e.target.classList.add("active")
                this.week = parseInt(e.target.id.substring(1)) % 10
                this.initCalender({ month: this.month, week: this.week })
                document.querySelector("input.book").scrollIntoView()
            }
        }
        this.initCalender({ day: this.day })
    }

    bookingCounter(c) {
        if (c) this.cart.value += c
        else this.cart.value = 0
        document.querySelector("input.book").value = `Book (${this.cart.value})`
    }

    finaliseBooking() {
        let boook = true
        for (const key in this.cart) {
            if (key != "value" && Object.hasOwnProperty.call(this.cart, key)) {
                this.cart[key].forEach(e => {
                    if (this.bookingCache && this.bookingCache[key] && this.bookingCache[key].indexOf(e) > -1) {
                        toast("Removed one Conflicted slot !")
                        boook = false
                        this.addToCart(key, e, false)
                        this.timeEntry[(key - this.day) * 7 + (e - 1)].classList.remove("selected")
                    }
                })
            }
        }
        if (!boook) toast("Please review and Click again !")
        else {
            if (this.cart.value > 0) {
                if (this.secretVerified) {
                    let clone = { slots: JSON.parse(JSON.stringify(this.cart)), status: "p" }
                    delete clone.slots.value
                    for (const key in clone.slots) {
                        if (Object.hasOwnProperty.call(clone.slots, key)) {
                            clone.slots[key] = clone.slots[key].join(", ")
                        }
                    }
                    // console.log(clone)
                    const t = Date.now()
                    delete this.cart
                    this.cart = { value: 0 }
                    this.writeToPath(`users/${this.uid}/bookingRequests/${this.hallid}/${t}`, clone)
                    clone.uid = this.uid
                    // send email to admin
                    sendMail(window.userDisplayName || window.userEmail || "RNSHalls User")
                    this.writeToPath(`admin/bookingRequests/${this.hallid}/${t}`, clone)
                    for (let i = 0; i < this.timeEntry.length; i++) this.timeEntry[i].classList.remove("selected")
                    this.bookingCounter(0)
                    toast("Booking Request Sent !")
                } else toast("Please Enter Correct Secret !")
            } else toast("Cart value is Empty !")
        }
    }

    addToCart(day, slot, status) {
        if (status) {
            if (this.cart[day]) this.cart[day].push(slot)
            else this.cart[day] = [slot]
            this.bookingCounter(1)
        } else {
            if (this.cart[day]) {
                while (this.cart[day].indexOf(slot) > -1) this.cart[day].splice(this.cart[day].indexOf(slot), 1)
            }
            this.bookingCounter(-1)
        }
    }

    initCalender(dates) {
        let day
        if (dates && dates.day) day = dates.day
        else if (dates && dates.month && dates.week) day = dayFromMonth(dates.month, dates.week)
        else if (dates && dates.month) day = dayFromMonth(dates.month, this.week)
        else day = dayFromDate()
        if (day < this.day) day = this.day
        let currYear = new Date().getFullYear()
        if (this.dayListeners && this.dayListeners.length > 0) {
            while (this.dayListeners.length > 0) {
                off(ref(this.db, `bookings/${this.hallid}/${currYear}/${this.dayListeners.shift()}`))
            }
        }
        for (let i = 0; i < 7; i++) {
            onValue(ref(this.db, `bookings/${this.hallid}/${currYear}/${i + day}`), snapshot => {
                this.dayListeners.push(i)
                this.dateEntry[i].innerText = dateFromDay(i + day, currYear).toDateString()
                let dayBookings = snapshot.val()
                if (!dayBookings) dayBookings = []
                // console.log(snapshot.key, snapshot.val())
                for (let j = 0; j < 7; j++) {
                    if (dayBookings[j + 1]) {
                        if (this.timeEntry[i * 7 + j].classList.contains("selected")) {
                            this.timeEntry[i * 7 + j].classList.remove("selected")
                            this.addToCart(i + day, j + 1, false)
                            toast("Someone Booked This Slot")
                        }
                        if (this.bookingCache[i + day] && !(j + 1 in this.bookingCache[i + day])) this.bookingCache[i + day].push(j + 1)
                        else if (!this.bookingCache[i + day]) this.bookingCache[i + day] = [j + 1]
                        this.timeEntry[i * 7 + j].innerHTML = '<span class="bcr" >Booked</span>'
                    } else {
                        this.timeEntry[i * 7 + j].innerHTML = '<span class="nbcr" >Available</span>'
                        this.timeEntry[i * 7 + j].classList.remove("selected")
                        this.timeEntry[i * 7 + j].onclick = () => {
                            if (this.timeEntry[i * 7 + j].classList.contains("selected")) {
                                this.addToCart(i + day, j + 1, false)
                                this.timeEntry[i * 7 + j].classList.remove("selected")
                            } else {
                                this.addToCart(i + day, j + 1, true)
                                this.timeEntry[i * 7 + j].classList.add("selected")
                            }
                        }
                    }
                }
            })
            // Require changes here ..............
            console.log(day + i)
            if (this.cart[i + day]) {
                // console.log(this.cart[i + this.day])
                for (let k = 0; k < this.cart[i + day].length; k++) {
                    this.timeEntry[i * 7 + this.cart[i + day][k] - 1].classList.add("selected")
                }
            }
        }
        document.querySelector("input.book").onclick = () => {
            this.finaliseBooking()
        }
    }

    setAdmin(b) {
        if (b) {
            this.isAdmin = true
            this.enableAdminFeatures()
        } else {
            this.isAdmin = false
            this.enableUserFeatures()
        }
    }

    writeToPath(path, data) {
        // console.log('Writing to ' + path, data)
        set(ref(this.db, path), data)
    }

    readFromPath(path, callback) {
        // console.log('Reading from ' + path)
        get(child(ref(this.db), path)).then(snapshot => callback(snapshot))
    }

    acceptBooking(data, callback) {
        if (this.isAdmin) {
            let updates = {}
            let year = new Date().getFullYear()
            let conflict = false
            for (const key in data.slots) {
                if (Object.hasOwnProperty.call(data.slots, key)) {
                    let times = data.slots[key].split(",")
                    times.forEach(ele => {
                        if (this.bookingCache && this.bookingCache[key] && this.bookingCache[key].indexOf(ele) > -1) {
                            toast("Request has Conflicted slot !")
                            conflict = true
                        }
                    })
                }
            }
            if (conflict) {
                this.declineBooking(data, stat => {
                    if (stat) {
                        document.querySelector(`#brq-${data.key}`).remove()
                        toast(`Booking ${data.key} Declined !`)
                    } else toast(`Error Declining ${data.key}`)
                })
            } else {
                for (const key in data.slots) {
                    if (Object.hasOwnProperty.call(data.slots, key)) {
                        let times = data.slots[key].split(",")
                        times.forEach(ele => {
                            updates[`bookings/${this.hallid}/${year}/${parseInt(key)}/${parseInt(ele)}`] = true
                        })
                    }
                }
                updates[`users/${data.uid}/bookingRequests/${this.hallid}/${data.key}/status`] = "a"
                updates[`admin/bookingRequests/${this.hallid}/${data.key}`] = null
                updates[`admin/requestsHistory/${this.hallid}/${data.key}`] = data.uid
                // console.log(updates)
                update(ref(this.db), updates)
                    .then(() => {
                        callback(true)
                    })
                    .catch(error => {
                        console.error(error)
                        callback(false)
                    })
            }
        } else callback(false)
    }

    declineBooking(data, callback) {
        if (this.isAdmin || data.uid === this.uid) {
            let updates = {}
            let year = new Date().getFullYear()
            if (data.status === "a") {
                for (const key in data.slots) {
                    if (Object.hasOwnProperty.call(data.slots, key)) {
                        let times = data.slots[key].split(",")
                        times.forEach(ele => {
                            updates[`bookings/${this.hallid}/${year}/${parseInt(key)}/${parseInt(ele)}`] = null
                        })
                    }
                }
                updates[`admin/requestsHistory/${this.hallid}/${data.key}`] = null
                updates[`users/${data.uid}/bookingRequests/${this.hallid}/${data.key}`] = null
            }
            if (data.status === "p") {
                updates[`users/${data.uid}/bookingRequests/${this.hallid}/${data.key}`] = null
            }
            updates[`admin/bookingRequests/${this.hallid}/${data.key}`] = null
            // console.log(updates)
            update(ref(this.db), updates)
                .then(() => {
                    callback(true)
                })
                .catch(error => {
                    console.error(error)
                    callback(false)
                })
        } else {
            toast("Permission Denied !")
            callback(false)
        }
    }

    enableAdminFeatures() {
        // Enable notifications and booking requests
        const q = query(ref(this.db, `notifications/`), limitToLast(15))
        this.adminNotififcationElement = document.querySelector("div.notifications-admin div.content")
        onChildAdded(q, snapshot => {
            // attach notifications here
            let dt = new Date(parseInt(snapshot.key))
            this.adminNotififcationElement.insertAdjacentHTML(
                "afterbegin",
                `<div id="notif-${snapshot.key}" class="notification-card"><span class="material-icons">campaign</span><span>${snapshot.val()}</span><br><span>${dt}</span></div>`
            )
        })
        // Broadcaster
        document.querySelector("div.notifications-admin div.message span").onclick = () => {
            let text = document.querySelector("div.notifications-admin div.message input").value
            if (text) {
                this.writeToPath(`notifications/${Date.now()}`, text)
                document.querySelector("div.notifications-admin div.message input").value = ""
            }
        }
        // Booking accepter list
        this.adminBookingElement = document.querySelector("div.history-admin div.content")
        onChildAdded(ref(this.db, `admin/bookingRequests/${this.hallid}`), snapshot => {
            let dt = new Date(parseInt(snapshot.key)).toUTCString()
            let data = snapshot.val()
            data.key = snapshot.key
            if (data.uid) {
                this.getUserProfile(data.uid, snap => {
                    let prof = snap.val()
                    let names = ``
                    let photo = ``
                    if (prof.displayName) names += `<span style="font-size: 1rem; font-weight: bold;">${prof.displayName}</span><br />`
                    if (prof.email) names += `<span style="font-size: 0.7rem;">${prof.email}</span><br />`
                    if (prof.phoneNumber) names += `<span style="font-size: 0.7rem;">${prof.phoneNumber}</span><br />`
                    if (prof.photoURL) photo += `<img src="${prof.photoURL}" />`
                    else photo += `<span class="material-icons" style="font-size: 70px; padding: 10px ;">account_circle</span>`
                    let htm = ""
                    for (const key in data.slots) {
                        if (Object.hasOwnProperty.call(data.slots, key)) {
                            let dat = dateFromDay(key).toDateString()
                            htm += `<span>${dat}</span><span class="fr" style="color: var(--ao);">${data.slots[key]}</span><br />`
                        }
                    }
                    this.adminBookingElement.insertAdjacentHTML(
                        "afterbegin",
                        `<div id="brq-${snapshot.key}" class="request"><div class="display_page"><div class="profdiv">${photo}<span class="material-icons">verified</span></div><div class="reqbody"><span>${snapshot.key}</span><br>${names}<div style="display: inline; font-weight: bold;">${htm}</div></div></div><hr style="margin: 10px;"><span class="fr" style="font-size: 0.6rem" >${dt}</span><br><div style="display: flex;"><input type="submit" class="otp" value="Accept" /><input type="submit" class="otp fr" value="Reject" /></div></div>`
                    )
                    document.querySelector(`#brq-${snapshot.key} div input.otp:last-of-type`).onclick = e => {
                        this.declineBooking(data, success => {
                            if (success) {
                                document.querySelector(`#brq-${snapshot.key}`).remove()
                                toast(`Booking ${data.key} Declined !`)
                            } else toast("Some Error Occured !")
                        })
                    }
                    document.querySelector(`#brq-${snapshot.key} div input.otp:first-of-type`).onclick = e => {
                        this.acceptBooking(data, success => {
                            if (success) {
                                document.querySelector(`#brq-${snapshot.key}`).remove()
                                toast(`Booking ${data.key} Accepted !`)
                            } else toast("Some Error Occured !")
                        })
                    }
                })
            }
        })
        // keys management
        this.adminKeysElement = document.querySelector("div.keys div.content div.keyslist")
        onChildAdded(ref(this.db, "admin/authorised/"), snapshot => {
            if (snapshot.val()) {
                this.adminKeysElement.innerHTML += `<li class="key"><span>${snapshot.key}</span><span class="material-icons" id="${snapshot.key}">delete</span> </li>`
            }
        })
        this.adminKeysElement.onclick = e => {
            if (e.target.id) {
                this.writeToPath(`admin/authorised/${e.target.id}`, null)
                e.target.parentElement.remove()
                toast(`Removed access key ${e.target.id}`)
            }
        }
        document.querySelector("div.add_secret span").onclick = () => {
            // console.log('asd')
            let secret = document.querySelector("div.add_secret input").value.replace(/\s/g, "")
            this.writeToPath(`admin/authorised/${secret}`, true)
            document.querySelector("div.add_secret input").value = ""
        }
        // Seek accepted history only if clicked
        this.adminAcceptedElement = document.querySelector("div.bookingHistory div.content")
        this.adminAcceptedElement.children[0].children[0].onclick = () => {
            this.adminAcceptedElement.children[0].remove()
            const q = query(ref(this.db, `admin/requestsHistory/${this.hallid}`), limitToLast(8))
            onChildAdded(q, snapshot => {
                let dt = new Date(parseInt(snapshot.key))
                let uid = snapshot.val()
                this.readFromPath(`users/${uid}/bookingRequests/${this.hallid}/${snapshot.key}`, snap => {
                    let data = snap.val()
                    data.key = snapshot.key
                    data.uid = uid
                    // console.warn(data)
                    let stat
                    if (data.status == "p") stat = `<span class="fr" style="margin-right: 7px; color: var(--ab);">Pending</span>`
                    if (data.status == "d") stat = `<span class="fr" style="margin-right: 7px; color: var(--ao);">Declined</span>`
                    if (data.status == "a") stat = `<span class="fr" style="margin-right: 7px; color: #6c3;">Aproved</span>`
                    let htm = ""
                    for (const key in data.slots) {
                        if (Object.hasOwnProperty.call(data.slots, key)) {
                            let dat = dateFromDay(key).toDateString()
                            htm += `<span style="margin-left: 7px;">${dat}</span><span class="fr" style="margin-right: 7px;">${data.slots[key]}</span><br />`
                        }
                    }
                    this.adminAcceptedElement.insertAdjacentHTML(
                        "afterbegin",
                        `<div id="booked-${snapshot.key}" class="notify"> <div class="info"><span style="color: #FFF;">Booking ID : ${snapshot.key}</span><br /><br />${htm}<span class="fr" style="font-size: 0.7em; display: block;">${dt}</span><hr style="margin: 15px;"/><span style="margin-left: 7px;">Booking Status : </span>${stat}<br /><br /><center><input type="submit" class="otp" value="Cancel Booking" style="background: var(--ab);color: var(--bgh);" /></center></div></div>`
                    )
                    document.querySelector(`#booked-${snapshot.key} div,info input`).onclick = e => {
                        this.declineBooking(data, success => {
                            if (success) {
                                document.querySelector(`#booked-${snapshot.key}`).remove()
                                toast(`Booking ${data.key} Declined !`)
                            } else toast("Some Error Occured !")
                        })
                    }
                })
            })
        }
    }

    enableUserFeatures() {
        // Enable notifications and booking requests
        const q = query(ref(this.db, `notifications/`), limitToLast(15))
        this.userNotififcationElement = document.querySelector("div.notifications div.content")
        onChildAdded(q, snapshot => {
            // attach notifications here
            let dt = new Date(parseInt(snapshot.key))
            this.userNotififcationElement.insertAdjacentHTML(
                "afterbegin",
                `<div id="notif-${snapshot.key}" class="notification-card"><span class="material-icons">campaign</span><span>${snapshot.val()}</span><br><span>${dt}</span></div>`
            )
        })

        // Booking requests listner
        // later upgrade to be able to view all hall's bookings
        const r = query(ref(this.db, `users/${this.uid}/bookingRequests/${this.hallid}`), limitToLast(20))
        this.userBookingListElement = document.querySelector("div.history div.content")
        onChildAdded(r, snapshot => {
            let dt = new Date(parseInt(snapshot.key)).toUTCString()
            let data = snapshot.val()
            data.key = snapshot.key
            data.uid = this.uid
            // console.warn(data)
            let stat
            if (data.status == "p") stat = `<span class="fr" style="margin-right: 7px; color: var(--ab);">Pending</span>`
            if (data.status == "d") stat = `<span class="fr" style="margin-right: 7px; color: var(--ao);">Declined</span>`
            if (data.status == "a") stat = `<span class="fr" style="margin-right: 7px; color: #6c3;">Aproved</span>`
            let htm = ""
            for (const key in data.slots) {
                if (Object.hasOwnProperty.call(data.slots, key)) {
                    let dat = dateFromDay(key).toDateString()
                    htm += `<span style="margin-left: 7px;">${dat}</span><span class="fr" style="margin-right: 7px;">${data.slots[key]}</span><br />`
                }
            }
            this.userBookingListElement.insertAdjacentHTML(
                "afterbegin",
                `<div id="book-${snapshot.key}" class="notify"><div class="info"><span style="color: #FFF;">Booking ID : ${snapshot.key}</span><br /><br /><b>${htm}</b><span class="fr" style="font-size: 0.7em; display: block;"><b>${dt}</b></span><hr style="margin: 15px;"/><span style="margin-left: 7px;">Booking Status : </span><b>${stat}</b><br /><br /><center><input type="submit" class="otp" value="Cancel Booking" style="background: var(--ab);color: var(--bgh);" /></center></div></div>`
            )
            document.querySelector(`#book-${snapshot.key} div,info input`).onclick = e => {
                this.declineBooking(data, success => {
                    if (success) {
                        document.querySelector(`#book-${snapshot.key}`).remove()
                        toast(`Booking ${data.key} Declined !`)
                    } else toast("Some Error Occured !")
                })
            }
        })
    }
}

export { DBs }

