// Declare variables for DOM elements
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

// Check if the current page is the notes page
if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Function to display an element
const showElement = (elem) => {
  elem.style.display = 'inline';
};

// Function to hide an element
const hideElement = (elem) => {
  elem.style.display = 'none';
};

// Initialize an object to keep track of the active note
let activeNote = {};

// Function to fetch notes from the API
const fetchNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

// Function to save a note using the API
const saveNewNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

// Function to delete a note using the API
const deleteExistingNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

// Function to render the active note
const renderActiveNote = () => {
  hideElement(saveNoteBtn);

  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

// Function to handle saving a note
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNewNote(newNote).then(() => {
    fetchAndRenderNotes();
    renderActiveNote();
  });
};

// Function to handle deleting a note
const handleNoteDelete = (e) => {
  // Prevent the click listener for the list from being called when the button inside it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteExistingNote(noteId).then(() => {
    fetchAndRenderNotes();
    renderActiveNote();
  });
};

// Function to handle viewing a note
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Function to handle creating a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

// Function to render the save button
const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hideElement(saveNoteBtn);
  } else {
    showElement(saveNoteBtn);
  }
};

// Function to render the list of note titles
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Function to create an HTML list item with or without a delete button
  const createListItem = (text, delBtn = true) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('list-item-title');
    titleSpan.innerText = text;
    titleSpan.addEventListener('click', handleNoteView);

    listItem.append(titleSpan);

    if (delBtn) {
      const deleteBtn = document.createElement('i');
      deleteBtn.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      deleteBtn.addEventListener('click', handleNoteDelete);

      listItem.append(deleteBtn);
    }

    return listItem;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createListItem('No saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    const listItem = createListItem(note.title);
    listItem.dataset.note = JSON.stringify(note);

    noteListItems.push(listItem);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((listItem) => noteList[0].append(listItem));
  }
};

// Function to fetch and render notes
const fetchAndRenderNotes = () => fetchNotes().then(renderNoteList);

// Check if the current page is the notes page
if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
}

// Fetch and render notes when the page loads
fetchAndRenderNotes();
