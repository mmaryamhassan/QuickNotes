// This script handles the sidebar toggle functionality for the QuickNotes application.
document.addEventListener('DOMContentLoaded', () => {
    const navSlider = document.getElementById('navslider');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('#navbar ul li a span'); // Text elements
    const navBrand = document.querySelector('#navbar a'); // QuickNotes text
    
    navSlider.addEventListener('click', () => {
        const isCollapsing = !navbar.classList.contains('w-20');
        
        // Toggle navbar width
        navbar.classList.toggle('w-56');
        navbar.classList.toggle('w-20');
        
        // Toggle text visibility
        if (isCollapsing) {
            // When collapsing
            navLinks.forEach(span => span.classList.add('hidden'));
            navBrand.classList.add('hidden');
        } else {
            // When expanding
            navLinks.forEach(span => span.classList.remove('hidden'));
            navBrand.classList.remove('hidden');
        }
        
        // Toggle between hamburger and close icon
        navSlider.innerHTML = isCollapsing ? 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' :
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });
});

// save notes functionality
function saveNotes(){
    const title = document.getElementById('title').value;
    const notes = document.getElementById('notes').value;
    const subject = document.getElementById('subjects').value;
    const timestamp = new Date().toLocaleString();
    const pdfs = `${title}.pdf`; // Name for the PDF file
    let notesobj = {
        title: title,
        notes: notes,
        subjects: subject,
        timestamp: timestamp,
        pdfs: pdfs
    }
    if (!title || !notes || !subject) {
        alert('Please fill in all fields before saving.');
        return;
    }
    const note = { title, notes, subject, timestamp };
    let allNotes = JSON.parse(localStorage.getItem('notes')) || [];

    allNotes.unshift(note); // add newest on top
    localStorage.setItem('notes', JSON.stringify(allNotes));
    alert('Notes saved successfully!');
    
    // Save the PDF name in localStorage
    let allPdfs = JSON.parse(localStorage.getItem('pdfs')) || [];
    allPdfs.unshift(pdfs); // add newest on top
    localStorage.setItem('pdfs', JSON.stringify(allPdfs));

    displaySavedNotes(); // created below 
    renderRecentNotes(); // created below in the recent notes section
    //reload the page to show the saved notes
    location.reload();
}

// clear notes functionality
function clearNotes() {
    if (!confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
        return; // User cancelled the action
    }
    // Clear the input fields
    document.getElementById('title').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('subjects').value = '';
    
    alert('Notes cleared successfully!');
    // clear the saved notes in localStorage
    localStorage.removeItem('notes');
}

//delete img functionality
function deleteImg(){
    if (!confirm('Are you sure you want to delete the image? This action cannot be undone')){
        return; // User cancelled the action
    }
    // Clear the image input field
    document.getElementById('imageInput').value = '';
    // Clear the image preview
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    alert('Image deleted successfully!');
}

//image preview functionality
function previewImage() {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
    }
}

//generate pdf functionality
function genPDF() {
    const title = document.getElementById('title').value;
    const notes = document.getElementById('notes').value;
    const subject = document.getElementById('subjects').value;

    if (!title || !notes || !subject) {
        alert('Please fill in all fields before generating the PDF.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const wrappedText = doc.splitTextToSize(notes, 180); // handle long content

    doc.setFont('Helvetica');
    doc.setFontSize(20);
    doc.text(title, 10, 10);
    doc.setFontSize(12);
    doc.text(`Subject: ${subject}`, 10, 20);
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 10, 30);
    doc.text(wrappedText, 10, 40); // Add wrapped text to the new page
    doc.addPage();
    // Add image if available
    const imageInput = document.getElementById('imageInput');
    if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            doc.addImage(e.target.result, 'png', 10, 50 + wrappedText.length * 6, 180, 160);
            doc.save(`${title}.pdf`);
        };
        reader.readAsDataURL(file);
    } else {
        doc.save(`${title}.pdf`);
    }
    alert('PDF generated successfully!');
}

//recent notes functionality
function renderRecentNotes() {
    const recentList = document.getElementById('recentNotesList');
    recentList.innerHTML = ''; // Clear current list

    const allNotes = JSON.parse(localStorage.getItem('notes')) || []; // Retrieve all notes from localStorage converts JSON to string format

    const maxNotes = 5;
    allNotes.slice(0, maxNotes).forEach((note, index) => {
        const li = document.createElement('li');
        li.className = 'cursor-pointer text-green-900 font-medium hover:underline';
        li.textContent = `${note.title} (${note.subject})`;
        li.onclick = () => previewNote(note);
        recentList.appendChild(li);
    });
}
// Function to preview a note
function previewNote(note) {
    document.getElementById('title').value = note.title;
    document.getElementById('notes').value = note.notes;
    document.getElementById('subjects').value = note.subject;
    
    // Clear the image preview
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.src = '';
    imagePreview.style.display = 'none';

    // Clear the image input field
    document.getElementById('imageInput').value = '';
    
    alert(`Previewing note: ${note.title}`);
}
// Initial call to render recent notes on page load
window.onload = function() {
    renderRecentNotes();
};

// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const closeSidebar = document.getElementById('closeSidebar');

    hamburger.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
});

