let notes         = []; 
let editingNoteId = null; 

function saveNotes() {localStorage.setItem('quickNotes', JSON.stringify(notes));} 

function loadNotes() { 
    const savedNotes = localStorage.getItem('quickNotes'); 
    return savedNotes ? JSON.parse(savedNotes) : []; 
}

function generateId() {return Date.now().toString(36) + Math.random().toString(36).slice(2);} 

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
    const div       = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderNotes(list = notes) {
    const notesContainer     = document.getElementById('notesContainer');
    notesContainer.innerHTML = list.map(note => `
        <div class="note-card" onclick="openNoteDialog('${note.id}')">
            <h3 class="note-title">${escapeDanHTML(note.title)}</h3>
            <h3 class="note-content">${escapeDanHTML(note.content)}</h3>
            <button class="delete-note" onclick="deleteNote('${note.id}')">✕</button>
        </div>
    `).join('');
}

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
    }, 200);
});

function openNoteDialog(noteId = null) {
    const dialog       = document.getElementById('noteDialog');
    const titleInput   = document.getElementById('formTitle');
    const contentInput = document.getElementById('formContent');

    if (noteId || !noteId) {
        const noteToEdit   = notes.find(note => note.id === noteId);
        editingNoteId      = noteId ? noteId : null;
        titleInput.value   = noteId ? noteToEdit.title   : '';
        contentInput.value = noteId ? noteToEdit.content : '';
    }

    dialog.showModal();
}

function closeNoteDialog() {document.getElementById('noteDialog').close();}

const themeIcon          = document.getElementById('themeButton');
const darkmodeThemeIcon  = themeIcon.textContent;
const lightmodeThemeIcon = '☀️';

let themeMode = localStorage.getItem('themeMode') === 'darkmode';
    themeIcon.textContent = themeMode ? darkmodeThemeIcon : lightmodeThemeIcon;
    applyTheme();

function themeButton() { 
    themeMode = !themeMode;
    themeIcon.textContent = themeMode ? darkmodeThemeIcon : lightmodeThemeIcon;
    localStorage.setItem('themeMode', themeMode ? 'darkmode' : 'lightmode');
    applyTheme();
}
    
function applyTheme() {
    ['fontcolor-1', 'fontcolor-2', 'fontcolor-3', 'fontcolor-4', 'deletebutton-1', 'deletebutton-2', 'closebutton-1', 'closebutton-2', 'savebutton-1', 'savebutton-2', 'backgroundcolor-1', 'backgroundcolor-2', 'backgroundcolor-3', 'backgroundcolor-4', 'backgroundcolor-a', 'backgroundcolor-b', 'backgroundcolor-c', 'backgroundcolor-d']
    .forEach((s) => document.body.style.setProperty(`--${s}`, `var(--${localStorage.getItem('themeMode')}-${s})`));
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.form-note').addEventListener('submit', saveNote);
    notes = loadNotes();
    renderNotes();
});