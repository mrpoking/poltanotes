let notes         = [];
let editingNoteId = null;

function saveNotes() {localStorage.setItem('quickNotes', JSON.stringify(notes));}

function loadNotes() {
    const savedNotes = localStorage.getItem('quickNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
}

function generateId() {return Date.now().toString();}

function saveNote(event) {
    event.preventDefault();

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
    }

    closeNoteDialog();
    saveNotes();
    renderNotes();
}

function deleteNote(noteId) {
    event.stopPropagation();
    if (confirm("Delete This Note?")) {
        notes = notes.filter(note => note.id != noteId);
        saveNotes();
        renderNotes();
    }
}

function escapeDanHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderNotes() {
    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = notes.map(note => `
        <div class="note-card" onclick="openNoteDialog('${note.id}')">
            <h3 class="note-title">${escapeDanHTML(note.title)}</h3>
            <h3 class="note-content">${escapeDanHTML(note.content)}</h3>
            <button class="delete-button" onclick="deleteNote('${note.id}')">✕</button>
        </div>
    `).join('');
}

function openNoteDialog(noteId = null) {
    const dialog       = document.getElementById('noteDialog');
    const titleInput   = document.getElementById('formTitle');
    const contentInput = document.getElementById('formContent');

    if (noteId) {
        const noteToEdit   = notes.find(note => note.id === noteId);
        editingNoteId      = noteId;
        titleInput.value   = noteToEdit.title;
        contentInput.value = noteToEdit.content;
    } else {
        editingNoteId      = null;
        titleInput.value   = '';
        contentInput.value = '';
    }

    dialog.showModal();
    titleInput.focus();
}

function closeNoteDialog() {document.getElementById('noteDialog').close();}

const themeIcon          = document.getElementById('themeButton');
const darkmodeThemeIcon  = themeIcon.textContent;
const lightmodeThemeIcon = '☀️';

let themeMode = localStorage.getItem('themeMode') === 'darkmode'
    themeIcon.textContent = themeMode ? darkmodeThemeIcon : lightmodeThemeIcon;
    applyTheme();

function themeButton() { 
    themeMode = !themeMode;
    themeIcon.textContent = themeMode ? darkmodeThemeIcon : lightmodeThemeIcon;
    localStorage.setItem('themeMode', themeMode ? 'darkmode' : 'lightmode');
    applyTheme();
}
    
function applyTheme() {
    ['fontcolor-1-navbar', 'fontcolor-2-navbar', 'fontcolor-1-sidebar', 'fontcolor-2-sidebar', 'deletebutton-1', 'deletebutton-2', 'closebutton-1', 'closebutton-2', 'savebutton-1', 'savebutton-2', 'backgroundcolor-1', 'backgroundcolor-2', 'backgroundcolor-3', 'backgroundcolor-4', 'backgroundcolor-a', 'backgroundcolor-b']
    .forEach((s) => document.body.style.setProperty(`--${s}`, `var(--${localStorage.getItem('themeMode')}-${s})`));
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.form').addEventListener('submit', saveNote);
    notes = loadNotes();
    renderNotes();
});
