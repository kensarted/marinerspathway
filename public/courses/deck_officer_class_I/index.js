// Helper function to create a URL-friendly slug
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-')       // collapse whitespace and replace by -
    .replace(/-+/g, '-');       // collapse dashes
}

// This function will now be asynchronous to fetch data
async function renderSyllabusCards() {
  const container = document.getElementById('syllabus-cards');

  if (!container) {
    console.error('Element with ID "syllabus-cards" not found.');
    return;
  }

  try {
    // Fetch data from the class_II_subjects.json file
    // Path corrected to be relative to index.js which is in public/courses/deck_officer_class_II/
    const response = await fetch('./assets/data/class_II_subjects.json');

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON data
    const syllabusData = await response.json();

    // Iterate over the fetched data and create cards
    syllabusData.forEach(item => {
      const card = document.createElement('div');
      // Added 'cursor-pointer' class for hover effect
      card.className = 'bg-white rounded-lg shadow p-6 cursor-pointer transform transition-transform duration-200 hover:scale-105'; // Added hover effect
      card.innerHTML = `
        <h3 class="text-lg font-semibold text-blue-700 mb-2">${item.title}</h3>
        <p class="text-gray-700 text-sm">${item.description}</p>
      `;
      
      // Add a click event listener to navigate to the subject details page
      card.addEventListener('click', () => {
        // --- CORRECTED: Use 'topic' instead of 'subject' as the query parameter ---
        window.location.href = `subject_details.html?topic=${createSlug(item.title)}`;
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching or parsing syllabus data:', error);
    // You might want to display a user-friendly error message on the page
    container.innerHTML = '<p class="text-red-500">Failed to load syllabus data. Please try again later.</p>';
  }
}

// Call the function when the DOM is fully loaded
// This ensures that the 'syllabus-cards' div exists before the script tries to access it.
document.addEventListener('DOMContentLoaded', renderSyllabusCards);
