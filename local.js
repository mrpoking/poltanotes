let notes         = []; 
let editingNoteId = null; 
let currentNoteId = null;

// FUNCTION SAVE NOTES
function saveNotes() {localStorage.setItem('quickNotes', JSON.stringify(notes));} 

// FUNCTION LOAD NOTES
function loadNotes() { 
    const savedNotes = localStorage.getItem('quickNotes'); 
    return savedNotes ? JSON.parse(savedNotes) : []; 
};

// FUNCTION GENERATE ID
function generateId() {return Date.now().toString(36) + Math.random().toString(36).slice(2);} 

// FUNCTION SAVE NOTE
function saveNote(e) {
    e.preventDefault();

    const title   = document.getElementById('formTitle').value;
    const content = document.getElementById('formContent').value;

    if (editingNoteId) {
        const noteIndex  = notes.findIndex(note => note.id === editingNoteId);
        notes[noteIndex] = {
            ...notes[noteIndex],
            title  : title,
            content: content,
        }
    } else {
        notes.unshift ({
            id     : generateId(),
            title  : title,
            content: content,
        });
    };

    saveNotes();
    closeNoteDialog();
    renderNotes();
};

// FUNCTION DELETE NOTE
function deleteNote(event) {
    event.stopPropagation();
    if (!currentNoteId) return;
    if (confirm("Delete This Note🐧?!")) {
        notes = notes.filter(note => note.id !== currentNoteId);
        saveNotes();
        renderNotes();
        closeNoteDialog();
        currentNoteId = null;
    };
};

// FUNCTION ESCAPE DANGEROUS HTML
function escapeDanHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// FUNCTION RENDER NOTES
function renderNotes(list = notes) {
    const notesContainer     = document.getElementById('notesContainer');
    notesContainer.innerHTML = list.map(note => `
        <div class="note-card" onclick="openNoteDialog('${note.id}')">
            <h3 class="note-title">${escapeDanHTML(note.title)}</h3>
            <h3 class="note-content">${escapeDanHTML(note.content)}</h3>
        </div>
    `).join('');
};

// FUNCTION SEARCH NOTE
let searchTimeout;
const searchInput = document.querySelector('[data-search]');
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const value = e.target.value.toLowerCase();
        const filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(value) || note.content.toLowerCase().includes(value)
        );

        renderNotes(filteredNotes);
    }, 150);
});

// FUNCTION OPEN DIALOG
function openNoteDialog(noteId = null) {
    currentNoteId = noteId;

    const dialog       = document.getElementById('noteDialog');
    const titleInput   = document.getElementById('formTitle');
    const contentInput = document.getElementById('formContent');

    if (noteId || !noteId) {
        const noteToEdit   = notes.find(note => note.id === noteId);
        editingNoteId      = noteId ? noteId : null;
        titleInput.value   = noteId ? noteToEdit.title   : '';
        contentInput.value = noteId ? noteToEdit.content : '';
    };

    dialog.showModal();
};

// FUNCTION CLOSE NOTE DIALOG
function closeNoteDialog() {document.getElementById('noteDialog').close();}

const themeIcon          = document.getElementById('themeButton');
const darkmodeThemeIcon  = themeIcon.textContent;
const lightmodeThemeIcon = '☀️';

let themeMode = localStorage.getItem('themeMode') === 'darkmode';
    themeIcon.textContent = themeMode ? darkmodeThemeIcon : lightmodeThemeIcon;
    applyTheme();

// FUNCTION THEME BUTTON 
function themeButton() { 
    themeMode = !themeMode;
    themeIcon.textContent = themeMode ? darkmodeThemeIcon : lightmodeThemeIcon;
    localStorage.setItem('themeMode', themeMode ? 'darkmode' : 'lightmode');
    applyTheme();
};

// FUNCTION APPLY THEME
function applyTheme() {
    ['fontcolor-1', 'fontcolor-2', 'fontcolor-3', 'fontcolor-4', 'deletebutton-1', 'deletebutton-2', 'closebutton-1', 'closebutton-2', 'savebutton-1', 'savebutton-2', 'backgroundcolor-1', 'backgroundcolor-2', 'backgroundcolor-3', 'backgroundcolor-4', 'backgroundcolor-a', 'backgroundcolor-b', 'backgroundcolor-c', 'backgroundcolor-d']
    .forEach((s) => document.body.style.setProperty(`--${s}`, `var(--${localStorage.getItem('themeMode')}-${s})`));
};

const formText = [document.getElementById('formTitle'), document.getElementById('formContent')];
for (let i = 0; i < formText.length; i++) {
    formText[i].addEventListener('keydown', function(e) {
        if (e.key === "Tab" || e.keyCode === 9) {
            e.preventDefault();

            const value  = this.value;
            const start  = this.selectionStart;
            const end    = this.selectionEnd;
            const indent = '    ';

            if (start === end) {
                this.value          = value.substring(0, start) + indent + value.substring(end);
                this.selectionStart = this.selectionEnd = start + indent.length;
            } else {
                const lines = value.substring(start, end).split('\n');
                if (e.shiftKey) {
                    const dedentedLines = lines.map(line => {
                        if (line.startsWith(indent)) {return line.substring(4);}
                        if (line.startsWith('\t'))   {return line.substring(0);}
                        return line;
                    });

                    this.value = value.substring(0, start) + dedentedLines.join('\n') + value.substring(end);
                } else {
                    const indentedLines = lines.map(line => indent + line);
                    this.value          = value.substring(0, start) + indentedLines.join('\n') + value.substring(end);
                };

                this.selectionStart = start;
                this.selectionEnd   = start + (e.shiftKey - indent.length);
            };
        };
    });
};

// FUNCTION AWAIT
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.form-note').addEventListener('submit', saveNote);
    notes = loadNotes();
    renderNotes();
});
