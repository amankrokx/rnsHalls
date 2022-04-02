import { ref, set, onValue, get, child, onChildAdded, query, limitToLast } from "firebase/database";

class DBs {
    constructor (db, uid) {
        this.db = db
        this.uid = uid
        onValue(ref(this.db, `users/${uid}/secret`), (snapshot) => {
            this.secret = snapshot.val()
            document.querySelector('div.setting input.secret').value = this.secret

            onValue(ref(this.db, `admin/authorised/${this.secret}`), (snap) => {
                if (snap.exists()) {
                    if (snap.val()) toast('good to go !')
                    else toast('This secred id has been banned')
                } else toast('invalid secret')
              }, {
                onlyOnce: true
              });
        })
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
        set(ref(this.db, path) , data)
    }

    enableAdminFeatures () {
        // Enable notifications and booking requests
        const q = query(ref(this.db, `notifications/`), limitToLast(15))
        this.adminNotififcationElement = document.querySelector('div.notifications-admin div.content')
        onChildAdded(q, (snapshot) => {
            // attach notifications here
            let dt = new Date(parseInt(snapshot.key))
            this.adminNotififcationElement.insertAdjacentHTML("afterbegin", `<div id="${snapshot.key}" class="notification-card">
            <div class="symbol">
                <span class="material-icons" style="float: left; font-size: 25px;">admin_panel_settings</span>     
            </div>
            <div class="message_display" style="font-size: 0.6rem;">
                <span>${snapshot.val()}<span style="color: var(--ao);"></span></span>
            </div><br />
                <span style="float: right; font-size: 0.4rem;">${dt}</span>
            </div>`)
        })

        document.querySelector("div.notifications-admin div.message span").onclick = () => {
            let text = document.querySelector("div.notifications-admin div.message input").value
            if (text) {
                this.writeToPath(`notifications/${Date.now()}`, text)
                document.querySelector("div.notifications-admin div.message input").value = ""
            }
        }
    }

    enableUserFeatures () {
        // Enable notifications and booking requests
        const q = query(ref(this.db, `notifications/`), limitToLast(15))
        this.adminNotififcationElement = document.querySelector('div.notifications div.content')
        onChildAdded(q, (snapshot) => {
            // attach notifications here
            let dt = new Date(parseInt(snapshot.key))
            this.adminNotififcationElement.insertAdjacentHTML("afterbegin", `<div id="${snapshot.key}" class="notification-card">
            <div class="symbol">
                <span class="material-icons" style="float: left; font-size: 25px;">admin_panel_settings</span>     
            </div>
            <div class="message_display" style="font-size: 0.6rem;">
                <span>${snapshot.val()}<span style="color: var(--ao);"></span></span>
            </div><br />
                <span style="float: right; font-size: 0.4rem;">${dt}</span>
            </div>`)
        })
    }



}

export { DBs }