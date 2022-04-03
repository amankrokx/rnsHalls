import { ref, set, update, onValue, get, child, onChildAdded, query, limitToLast, off } from "firebase/database";

class DBs {
    constructor (db, uid) {
        this.db = db
        this.uid = uid
        this.secretVerified = false
        onValue(ref(this.db, `users/${uid}/secret`), (snapshot) => {
            this.secret = snapshot.val()
            document.querySelector('div.setting input.secret').value = this.secret

            onValue(ref(this.db, `admin/authorised/${this.secret}`), (snap) => {
                if (snap.exists()) {
                    if (snap.val()) {
                        toast('good to go !')
                        this.secretVerified = true
                    }
                    else {
                        toast('This secred id has been banned')
                        this.secretVerified = false
                    }
                } else {
                    toast('invalid secret')
                    this.secretVerified = false
                }
              }, {
                onlyOnce: true
              });
        })
        this.dateEntry = Array.prototype.slice.call(document.querySelectorAll('div.date div.date-entry'),  1, 8)
        this.timeEntry = Array.prototype.slice.call(document.querySelectorAll('div.time div.time-entry'),  7, 56)
        this.initMonthSelector()
    }

    getUserProfile ( _uid, callback ) {
        if (this.uid === _uid || this.isAdmin) get(ref(this.db, `users/${_uid}/profile`)).then(snapshot => callback(snapshot) )
        else get(child(ref(this.db), `users/${this.uid}/profile`)).then(snapshot => callback(snapshot) )
    }
    
    initMonthSelector () {
        let cd = new Date().getMonth() + 1
        this.month = cd
        const mons = ['January', 'February', 'March', 'April', 'May' ,'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let eles = document.querySelector('div.months')
        eles.innerHTML = `<span class="active">${mons[cd - 1]}</span>`
        for (let i = cd + 1; i <= 12; i++) {
            eles.innerHTML += `<span>${mons[i - 1]}</span>`
        }
        let week = Math.floor((new Date().getDate() - 1)/7) + 1
        this.week = week
        let elet = document.querySelector('div.weeks')
        elet.innerHTML = `<span class="active">Week ${week}</span>`
        for (let w = week + 1; w <= 5; w++)  elet.innerHTML += `<span>Week ${w}</span>`
        this.day = dayFromDate()
        console.log("todays date index is " + this.day)
        this.dayListeners = []
        this.initCalender({day: this.day})
    }

    initCalender (dates) {
        let day
        if (dates && dates.day) day = dates.day
        else if (dates && dates.month && dates.week) day = dayFromMonth(dates.month, dates.week)
        else if (dates && dates.month) day = dayFromMonth(dates.month, this.week)
        else day = dayFromDate()
        let currYear = new Date().getFullYear()
        if (this.dayListeners && this.dayListeners.length > 0) {
            this.dayListeners.forEach(e => {
                off(ref(this.db, `bookings/hall1/${currYear}/${e}`))
            });
        }
        for (let i = 0; i < 7; i++) {
            this.dayListeners.push(i)
            onValue(ref(this.db, `bookings/hall1/${currYear}/${i + day}`), (snapshot) => {
                this.dateEntry[i].innerText = dateFromDay(i + day, currYear).toDateString()
                let dayBookings = snapshot.val()
                if (!dayBookings) dayBookings = []
                console.log(snapshot.key, snapshot.val())
                for (let j = 0; j < 7; j++) {
                    if (dayBookings[j+1]) {
                        this.timeEntry[(i * 7) + j].innerHTML = '<span class="bcr" >Booked</span>'
                    } else {
                        this.timeEntry[(i * 7) + j].innerHTML = '<span class="nbcr" >Available</span>'
                    }
                }
            })
        }
    }

    setAdmin (b) {
        if (b) {
            this.isAdmin = true
            this.enableAdminFeatures()
        }
        else {
            this.isAdmin = false
            this.enableUserFeatures()
        }
    }

    writeToPath (path, data) {
        console.log('Writing to ' + path, data)
        set(ref(this.db, path) , data)
    }

    readFromPath (path, callback) {
        console.log('Reading from ' + path)
        get(child(ref(this.db), path)).then(snapshot => callback(snapshot) )
    }

    acceptBooking (data, callback) {
        if (this.isAdmin) {
            let updates = {}
            let year = new Date().getFullYear()
            for (const key in data.slots) {
                if (Object.hasOwnProperty.call(data.slots, key)) {
                    let times = data.slots[key].split(",")
                    times.forEach(ele => {
                        updates[`bookings/hall1/${year}/${parseInt(key)}/${parseInt(ele)}`] = true
                    })
                }
            }
            updates[`users/${data.uid}/bookingRequests/${data.key}/status`] = "a"
            updates[`admin/bookingRequests/${data.key}`] = null
            updates[`admin/requestsHistory/${data.key}`] = data.uid
            console.log(updates)
            update(ref(this.db), updates).then(() => {callback(true)}).catch((error) => {
                console.error(error)
                callback(false)
            })
        } else callback(false)
    }

    declineBooking (data, callback) {
        console.log(data)
        callback(true)
    }
    
    enableAdminFeatures () {
        // Enable notifications and booking requests
        const q = query(ref(this.db, `notifications/`), limitToLast(15))
        this.adminNotififcationElement = document.querySelector('div.notifications-admin div.content')
        onChildAdded(q, (snapshot) => {
            // attach notifications here
            let dt = new Date(parseInt(snapshot.key))
            this.adminNotififcationElement.insertAdjacentHTML("afterbegin", `<div id="notif-${snapshot.key}" class="notification-card">
            <div class="symbol">
                <span class="material-icons" style="float: left; font-size: 25px;">admin_panel_settings</span>     
            </div>
            <div class="message_display" style="font-size: 0.6rem;">
                <span>${snapshot.val()}<span style="color: var(--ao);"></span></span>
            </div><br />
                <span style="float: right; font-size: 0.4rem;">${dt}</span>
            </div>`)
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
        this.adminBookingElement = document.querySelector('div.history-admin div.content')
        onChildAdded(ref(this.db, 'admin/bookingRequests/'), (snapshot) => {
            let dt = new Date(parseInt(snapshot.key)).toUTCString()
            let data = snapshot.val()
            data.key = snapshot.key
            if (data.uid) {
                this.getUserProfile(data.uid, (snap) => {
                    let prof = snap.val()
                    let names = ``
                    let photo = ``
                    if (prof.displayName) names += `<span style="font-size: 1rem;">${prof.displayName}</span><br />`
                    if (prof.email) names += `<span style="font-size: 0.7rem;">${prof.email}</span><br />`
                    if (prof.phoneNumber) names += `<span style="font-size: 0.7rem;">${prof.phoneNumber}</span><br />`
                    if (prof.photoURL) photo += `<img src="${prof.photoURL}" style="height: 70px; width: 70px; border-radius: 50%;"/>`
                    else photo += `<span class="material-icons" style="font-size: 70px; padding-top: 15px ;">account_circle</span>`
                    let htm = ""
                    for (const key in data.slots) {
                        if (Object.hasOwnProperty.call(data.slots, key)) {
                            let dat = dateFromDay(key).toDateString()
                            htm += `<span>${dat}</span>
                            <span class="fr" style="margin-right: 15px;">${data.slots[key]}</span><br />`
                        }
                    }
                    this.adminBookingElement.insertAdjacentHTML("afterbegin", `
                    <div id="brq-${snapshot.key}" class="request">
                        <div class="display_page">
                            <div class="profdiv">
                                ${photo}
                                <span class="material-icons">verified</span>
                            </div>
                            <div class="reqbody">
                                <span>${snapshot.key}</span><br>
                                ${names}
                                <div style="display: inline;">
                                    ${htm}
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 10px;">
                        <span class="fr" style="font-size: 0.6rem" >${dt}</span>
                        <span onclick="this.classList.add('hidden'); document.querySelector('#bnq-${snapshot.key} input.bookingcommentinput').classList.remove('hidden');" class="comment addCommentonbooking" >Add Comment</span><br>
                        <input type="text" class="box bookingcommentinput hidden" style="width: 100%;">
                        <div style="display: flex;">
                            <input type="submit" class="otp" value="Accept" />
                            <input type="submit" class="otp fr" value="Reject" />
                        </div>
                    </div>`)
                    document.querySelector(`#brq-${snapshot.key} div input.otp:last-of-type`).onclick = (e) => {
                        this.declineBooking(data, (success) => {
                            if (success) {
                                document.querySelector(`#brq-${snapshot.key}`).remove()
                                toast(`Booking ${data.key} Declined !`)
                            } else toast("Some Error Occured !")
                        })
                    }
                    document.querySelector(`#brq-${snapshot.key} div input.otp:first-of-type`).onclick = (e) => {
                        this.acceptBooking(data, (success) => {
                            if (success) {
                                document.querySelector(`#brq-${snapshot.key}`).remove()
                                toast(`Booking ${data.key} Declined !`)
                            } else toast("Some Error Occured !")
                        })
                    }
                })
            }
        })
    }

    enableUserFeatures () {
        // Enable notifications and booking requests
        const q = query(ref(this.db, `notifications/`), limitToLast(15))
        this.userNotififcationElement = document.querySelector('div.notifications div.content')
        onChildAdded(q, (snapshot) => {
            // attach notifications here
            let dt = new Date(parseInt(snapshot.key))
            this.userNotififcationElement.insertAdjacentHTML("afterbegin", `<div id="noti-${snapshot.key}" class="notification-card">
            <div class="symbol">
            <span class="material-icons" style="float: left; font-size: 25px;">admin_panel_settings</span>     
            </div>
            <div class="message_display" style="font-size: 0.6rem;">
                <span>${snapshot.val()}<span style="color: var(--ao);"></span></span>
            </div><br />
            <span style="float: right; font-size: 0.4rem;">${dt}</span>
            </div>`)
        })
        
        // Booking requests listner
        const r = query(ref(this.db, `users/${this.uid}/bookingRequests`), limitToLast(10))
        this.userBookingListElement = document.querySelector("div.history div.content")
        onChildAdded(r, (snapshot) => {
            let dt = new Date(parseInt(snapshot.key)).toUTCString()
            let data = snapshot.val()
            console.log(data)
            let stat
            if (data.status == 'p') stat = "Pending"
            if (data.status == 'd') stat = "Declined"
            if (data.status == 'a') stat = "Aproved"
            let htm = ""
            for (const key in data.slots) {
                if (Object.hasOwnProperty.call(data.slots, key)) {
                    let dat = dateFromDay(key).toDateString()
                    htm += `<span style="margin-left: 7px;">${dat}</span>
                    <span class="fr" style="margin-right: 7px;">${data.slots[key]}</span>
                    <br />`
                }
            }
            this.userBookingListElement.insertAdjacentHTML("afterbegin", `
            <div id="book-${snapshot.key}" class="notify"> 
                <div class="info">
                    <span style="color: #FFF;">Booking ID : ${snapshot.key}</span><br /><br />
                    ${htm}
                    <span class="fr" style="font-size: 0.7em; display: block;">${dt}</span>
                    <hr style="margin: 15px;"/>
                    <span style="margin-left: 7px;">Booking Status : </span>
                    <span class="fr" style="margin-right: 7px; color: #6c3;">${stat}</span>
                    <br /><br />
                    <center><input type="submit" class="otp" value="Cancel Booking" style="background: var(--ab);color: var(--bgh);" /></center>
                    
                </div>
            </div>`)
        })
        
    }
    

    
}

export { DBs }