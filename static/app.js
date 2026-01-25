
function newNote(title, body) {
    return {"title": makeUniqueTitle(title), "body": body}
}

function makeUniqueTitle(title) {
    const d = new Date(Date.now())

    const formattedTitle = title.replaceAll(" ", "_")

    const pad = (m) => {
        if (String(m).length == 1) {
            return "0" + String(m)
        } else {
            return String(m)
        }
    }

    const year = d.getFullYear()
    const month = pad(d.getMonth()+1)
    const day = pad(d.getDate())
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())

    return `${year}${month}${day}T${hours}${minutes}_${formattedTitle}`
}

function app(){
    this.notes = []

    this.root = document.getElementById("root")
    this.noteTitleInput = document.getElementById("note-title-input")
    this.noteBodyInput = document.getElementById("note-body-input")
    this.saveNoteButton = document.getElementById("save-note-btn")
    this.writeNoteView = document.getElementById("write-note-view")
    this.viewAllNotesView = document.getElementById("view-all-notes")
    this.viewNotesnavBtn = document.getElementById("view-notes")
    this.newNoteBtn = document.getElementById("new-note")
    this.syncBtn = document.getElementById("sync-button")
    this.clearBtn = document.getElementById("clear-storage")

    this.saveToSession = function() {
        window.sessionStorage.setItem("notes", JSON.stringify(this.notes))
    }

    this.loadFromSession = function() {
        const loadedNotes = window.sessionStorage.getItem("notes")
        if (loadedNotes != null) {
            this.notes = JSON.parse(loadedNotes)
        }
    }

    this.createNote = function(title, body) {
        const foundNote = this.notes.find((note) => {return note["title"] == title})

        if (foundNote != null) {
            foundNote["body"] = body;
            return
        }
        this.notes.push(newNote(title, body))
    }

    this.removeNote = function(title) {
        const removeNoteIdx = this.notes.findIndex((note) => {return note.title == title})
        if (removeNoteIdx != -1) {
            this.notes.splice(removeNoteIdx,1)
        }
        this.saveToSession()
    }

    this.changeView = function(newView, props) {
        this.root.replaceChildren()
        this.root.appendChild(newView)
        if (props != null) {
            this.noteTitleInput.value = props.title
            this.noteBodyInput.value = props.body
        } else {
            this.noteTitleInput.value = ""
            this.noteBodyInput.value = ""
        }
    }

    this.buildNotesList = function() {
        this.viewAllNotesView.replaceChildren()
        const t = document.createElement("h1")
        t.textContent = "View Notes"
        this.viewAllNotesView.appendChild(t)
        
        const newListDiv = document.createElement("div")
        const newUnorderedList = document.createElement("ul")
        for (const note of this.notes) {
            const listItem = document.createElement("li")
            const noteButton = document.createElement("button")
            noteButton.type = "button"
            noteButton.textContent = note.title
            noteButton.onclick = () => {
                const foundNote = this.notes.find((note) => { return note.title == noteButton.textContent});
                this.changeView(this.writeNoteView, foundNote)
            }
            listItem.appendChild(noteButton)
            newUnorderedList.appendChild(listItem)
        }
        newListDiv.appendChild(newUnorderedList)
        this.viewAllNotesView.appendChild(newListDiv)
    }

    this.init = function(){
        this.root.replaceChildren();
        this.viewNotesnavBtn.onclick = () => {
            this.buildNotesList()
            this.changeView(this.viewAllNotesView, null)
        };
        this.newNoteBtn.onclick = () => {
            this.changeView(this.writeNoteView, null)
        }
        this.clearBtn.onclick = () => {
            window.sessionStorage.clear()
        }

        this.saveNoteButton.onclick = () => {
            this.createNote(this.noteTitleInput.value, this.noteBodyInput.value)
            this.saveToSession()
            this.buildNotesList()

            this.noteTitleInput.value = ""
            this.noteBodyInput.value = ""

            this.changeView(this.viewAllNotesView, null)

        }

        // todo: sync button
        this.syncBtn.onclick = () => {
            fetch("/api",{method: "POST", body: JSON.stringify(this.notes), headers: {"Content-Type": "application/json"}}).then(res => {
                if (!res.ok) {
                    console.log("failed")
                } else {
                    console.log("success")
                }
            })
        }

    }

}

const App = new app()

App.init()


window.app = App;