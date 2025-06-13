// This script handles the mobile menu toggle for the subject-details.html page,
// and dynamically loads syllabus topics and their content with an expandable list.

// Helper function to create a URL-friendly slug
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-')       // collapse whitespace and replace by -
    .replace(/-+/g, '-');       // collapse dashes
}

// Function to load and display topic details
async function loadTopicDetails() {
  const params = new URLSearchParams(window.location.search);
  const topicSlug = params.get('topic'); // Can be a main topic or subtopic slug

  const subjectTitleElement = document.getElementById('subject-title');
  const subjectDescriptionElement = document.getElementById('subject-description');
  const pageTitleElement = document.querySelector('head title');
  const detailedContentElement = document.getElementById('detailed-content');
  const subjectContentArea = document.getElementById('subject-content');
  const subjectNotFoundArea = document.getElementById('subject-not-found');
  const syllabusCategoriesList = document.getElementById('syllabus-categories');

  // Clear previous content and reset visibility
  subjectContentArea.classList.remove('hidden');
  subjectNotFoundArea.classList.add('hidden');
  syllabusCategoriesList.innerHTML = '<li class="text-gray-600 italic">Loading topics...</li>';

  try {
    // --- CORRECTED PATH TO JSON FILE ---
    // Assuming class_II_subjects.json is in public/courses/deck_officer_class_II/assets/data/
    // relative to subject_details_script.js (which is in public/courses/deck_officer_class_II/)
    const response = await fetch('./assets/data/class_II_subjects.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const syllabusData = await response.json();

    syllabusCategoriesList.innerHTML = ''; // Clear loading message

    let foundTopic = null; // Will store the actual topic/subtopic object to display

    // Function to display content in the main section
    async function displayContent(item) {
      subjectTitleElement.textContent = item.title;
      subjectDescriptionElement.textContent = item.description || ''; // Subtopics might not have a description
      pageTitleElement.textContent = `${item.title} | Mariner's Pathway`;

      detailedContentElement.innerHTML = '<p class="text-center text-gray-500">Loading content...</p>';

      try {
        // The path in item.relevant_html_ (e.g., "content/practical_navigation.html")
        // is correctly relative to subject_details.html's location.
        const contentResponse = await fetch(item.relevant_html_);
        if (!contentResponse.ok) {
          throw new Error(`Failed to load content for ${item.title}: status ${contentResponse.status}`);
        }
        const contentHtml = await contentResponse.text();
        detailedContentElement.innerHTML = contentHtml;
      } catch (contentError) {
        console.error('Error loading detailed content:', contentError);
        detailedContentElement.innerHTML = `<p class="text-red-500">Failed to load detailed content for "${item.title}". Please ensure the content file exists at "${item.relevant_html_}".</p>`;
      }
    }

    // Function to highlight the current active topic/subtopic and expand its parent
    function highlightCurrentTopic(currentSlug) {
      // Remove all existing highlights and close all subtopic lists first
      Array.from(syllabusCategoriesList.querySelectorAll('.bg-blue-200')).forEach(el => {
        el.classList.remove('bg-blue-200', 'font-semibold', 'text-blue-900');
      });
      Array.from(syllabusCategoriesList.querySelectorAll('.subtopics-list')).forEach(ul => {
        ul.classList.add('hidden'); // Ensure all subtopic lists are closed
        const parentIcon = ul.previousElementSibling ? ul.previousElementSibling.querySelector('.expand-icon') : null;
        if (parentIcon) {
          parentIcon.classList.remove('rotate-90'); // Reset icon rotation
        }
      });

      // Find and highlight the current topic/subtopic
      let foundActiveElement = false;
      syllabusData.forEach(mainTopic => {
        const mainTopicSlug = createSlug(mainTopic.title);
        const mainTopicElement = document.getElementById(`topic-${mainTopicSlug}`);
        const subtopicsListElement = document.getElementById(`subtopics-${mainTopicSlug}`);
        const expandIcon = mainTopicElement ? mainTopicElement.querySelector('.expand-icon') : null;

        if (mainTopicSlug === currentSlug) {
          // It's a main topic and it's active
          mainTopicElement.classList.add('bg-blue-200', 'font-semibold', 'text-blue-900');
          foundActiveElement = true;
          // Ensure its subtopics list is visible if it has one
          if (subtopicsListElement) {
            subtopicsListElement.classList.remove('hidden');
            if (expandIcon) expandIcon.classList.add('rotate-90');
          }
        }

        mainTopic.subtopics.forEach(subtopic => {
          const subtopicSlug = createSlug(subtopic.title);
          if (subtopicSlug === currentSlug) {
            // It's a subtopic and it's active
            const subtopicLinkElement = document.getElementById(`topic-${subtopicSlug}`);
            if (subtopicLinkElement) {
              subtopicLinkElement.classList.add('bg-blue-200', 'font-semibold', 'text-blue-900');
              foundActiveElement = true;
            }
            // Ensure its parent main topic's subtopic list is visible
            if (subtopicsListElement) {
              subtopicsListElement.classList.remove('hidden');
              if (expandIcon) expandIcon.classList.add('rotate-90');
            }
          }
        });
      });

      // If no active element was found in the initial check (e.g., if it's a default load for the first item without a slug)
      // This part ensures the first item is active if no specific slug is provided.
      if (!foundActiveElement && syllabusData.length > 0) {
          const firstTopicSlug = createSlug(syllabusData[0].title);
          const firstTopicElement = document.getElementById(`topic-${firstTopicSlug}`);
          if (firstTopicElement) {
            firstTopicElement.classList.add('bg-blue-200', 'font-semibold', 'text-blue-900');
             const firstSubtopicsList = document.getElementById(`subtopics-${firstTopicSlug}`);
             if (firstSubtopicsList) {
               firstSubtopicsList.classList.remove('hidden');
               const firstExpandIcon = firstTopicElement.querySelector('.expand-icon');
               if (firstExpandIcon) firstExpandIcon.classList.add('rotate-90');
             }
          }
      }
    }


    // Iterate and build the expandable syllabus structure
    syllabusData.forEach(mainTopic => {
      const mainTopicSlug = createSlug(mainTopic.title);
      const listItem = document.createElement('li');
      listItem.className = 'mb-1'; // Small margin between main topics

      // Main topic header (clickable for expanding/collapsing subtopics and loading its own content)
      const mainTopicHeader = document.createElement('div');
      mainTopicHeader.id = `topic-${mainTopicSlug}`; // Add ID for highlighting
      mainTopicHeader.className = 'flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200';
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = mainTopic.title;
      mainTopicHeader.appendChild(titleSpan);

      // Add expand/collapse icon if subtopics exist
      let expandIcon = null;
      if (mainTopic.subtopics && mainTopic.subtopics.length > 0) {
        expandIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        expandIcon.setAttribute("class", "expand-icon w-4 h-4 text-gray-600 transform transition-transform duration-200");
        expandIcon.setAttribute("fill", "none");
        expandIcon.setAttribute("viewBox", "0 0 24 24");
        expandIcon.setAttribute("stroke", "currentColor");
        expandIcon.setAttribute("stroke-width", "2");
        expandIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />'; // Chevron right
        mainTopicHeader.appendChild(expandIcon);
      }

      listItem.appendChild(mainTopicHeader);

      // Subtopics list
      const subtopicsList = document.createElement('ul');
      subtopicsList.id = `subtopics-${mainTopicSlug}`; // Add ID for direct access
      subtopicsList.className = 'subtopics-list hidden space-y-1 ml-4 border-l border-blue-200 pl-2'; // Initially hidden

      mainTopic.subtopics.forEach(subtopic => {
        const subtopicSlug = createSlug(subtopic.title);
        const subListItem = document.createElement('li');
        const subLink = document.createElement('a');
        subLink.id = `topic-${subtopicSlug}`; // Add ID for highlighting subtopic
        subLink.href = `?topic=${subtopicSlug}`;
        subLink.className = 'block p-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 cursor-pointer';
        subLink.textContent = subtopic.title;

        subLink.addEventListener('click', async (event) => {
          event.preventDefault();
          history.pushState(null, '', `?topic=${subtopicSlug}`);
          await displayContent(subtopic); // Display subtopic content
          highlightCurrentTopic(subtopicSlug);
          // Close mobile sidebar if open
          if (window.innerWidth < 768) {
            const subjectSidebar = document.getElementById('subject-sidebar');
            const subjectSidebarOverlay = document.getElementById('subject-sidebar-overlay');
            if (subjectSidebar && subjectSidebarOverlay) {
              subjectSidebar.classList.add('-translate-x-full');
              subjectSidebarOverlay.classList.add('hidden');
            }
          }
        });
        subListItem.appendChild(subLink);
        subtopicsList.appendChild(subListItem);
      });

      listItem.appendChild(subtopicsList);
      syllabusCategoriesList.appendChild(listItem);

      // Event listener for main topic header to toggle subtopics and load its own content
      mainTopicHeader.addEventListener('click', async () => {
        // Toggle visibility of subtopics if they exist
        if (subtopicsList && mainTopic.subtopics && mainTopic.subtopics.length > 0) {
          subtopicsList.classList.toggle('hidden');
          if (expandIcon) {
            expandIcon.classList.toggle('rotate-90'); // Rotate icon on toggle
          }
        }

        // Always load the main topic's content when its header is clicked
        // Update URL and display content
        const newTopicSlug = createSlug(mainTopic.title);
        history.pushState(null, '', `?topic=${newTopicSlug}`);
        await displayContent(mainTopic); // Display main topic content
        highlightCurrentTopic(newTopicSlug);
         // Close mobile sidebar if open
         if (window.innerWidth < 768) {
            const subjectSidebar = document.getElementById('subject-sidebar');
            const subjectSidebarOverlay = document.getElementById('subject-sidebar-overlay');
            if (subjectSidebar && subjectSidebarOverlay) {
              subjectSidebar.classList.add('-translate-x-full');
              subjectSidebarOverlay.classList.add('hidden');
            }
         }
      });
    });

    // Determine which topic to display initially
    if (topicSlug) {
      // Find the topic (main or sub) based on the URL slug
      let initialItem = null;
      for (const mainTopic of syllabusData) {
        if (createSlug(mainTopic.title) === topicSlug) {
          initialItem = mainTopic;
          break;
        }
        for (const subtopic of mainTopic.subtopics) {
          if (createSlug(subtopic.title) === topicSlug) {
            initialItem = subtopic;
            break;
          }
        }
        if (initialItem) break;
      }

      if (initialItem) {
        await displayContent(initialItem);
        highlightCurrentTopic(topicSlug);
      } else {
        // Topic not found from URL, default to first topic
        subjectNotFoundArea.classList.remove('hidden');
        subjectContentArea.classList.add('hidden');
        pageTitleElement.textContent = 'Topic Not Found | Mariner\'s Pathway';
        if (syllabusData.length > 0) {
          await displayContent(syllabusData[0]);
          highlightCurrentTopic(createSlug(syllabusData[0].title));
          history.replaceState(null, '', `?topic=${createSlug(syllabusData[0].title)}`);
        } else {
          subjectTitleElement.textContent = 'No Topics Available';
          subjectDescriptionElement.textContent = 'There are no syllabus topics to display.';
          syllabusCategoriesList.innerHTML = '<li class="text-red-500">No topics found in data.</li>';
        }
      }
    } else if (syllabusData.length > 0) {
      // No topic specified in URL, default to displaying the first main topic
      await displayContent(syllabusData[0]);
      highlightCurrentTopic(createSlug(syllabusData[0].title));
      history.replaceState(null, '', `?topic=${createSlug(syllabusData[0].title)}`);
    } else {
      // No topics available at all
      subjectTitleElement.textContent = 'No Topics Available';
      subjectDescriptionElement.textContent = 'There are no syllabus topics to display.';
      pageTitleElement.textContent = 'No Topics | Mariner\'s Pathway';
      subjectNotFoundArea.classList.remove('hidden');
      subjectContentArea.classList.add('hidden');
      syllabusCategoriesList.innerHTML = '<li class="text-red-500">No topics found in data.</li>';
    }

  } catch (error) {
    console.error('Error loading syllabus topics:', error);
    subjectTitleElement.textContent = 'Error Loading Topics';
    subjectDescriptionElement.textContent = 'There was an error loading the syllabus topics. Please try again.';
    pageTitleElement.textContent = 'Error | Mariner\'s Pathway';
    subjectNotFoundArea.classList.remove('hidden');
    subjectContentArea.classList.add('hidden');
    syllabusCategoriesList.innerHTML = '<li class="text-red-500">Failed to load topics.</li>';
  }
}

// Call the main function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadTopicDetails);


// --- Main Mobile Navigation Menu Toggle (remains separate) ---
const menuBtn = document.getElementById('menu-btn');
const drawer = document.getElementById('drawer');
const closeDrawerBtn = document.getElementById('close-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const menu = document.getElementById('menu'); // 'menu' refers to the desktop navigation items.

if (menuBtn && drawer && closeDrawerBtn && drawerOverlay) {
  // Event listener to open the main mobile drawer
  menuBtn.addEventListener('click', () => {
    drawer.classList.remove('-translate-x-full'); // Show drawer
    drawerOverlay.classList.remove('hidden'); // Show overlay
  });

  // Event listener to close the main mobile drawer from its close button
  closeDrawerBtn.addEventListener('click', () => {
    drawer.classList.add('-translate-x-full'); // Hide drawer
    drawerOverlay.classList.add('hidden'); // Hide overlay
  });

  // Event listener to close the main mobile drawer by clicking the overlay
  drawerOverlay.addEventListener('click', () => {
    drawer.classList.add('-translate-x-full'); // Hide drawer
    drawerOverlay.classList.add('hidden'); // Hide overlay
  });

  // Handle clicks on main menu items in the drawer to close it (improves UX)
  // Ensure 'menu' element is not null before trying to query its descendants
  if (menu) {
    Array.from(menu.querySelectorAll('a')).forEach(link => {
      link.addEventListener('click', () => {
        // Only close if it's actually in a 'drawer' state (i.e., on mobile)
        if (window.innerWidth < 768) { // Assuming 'md' breakpoint is 768px as per Tailwind
          drawer.classList.add('-translate-x-full');
          drawerOverlay.classList.add('hidden');
        }
      });
    });
  }
}

// The JavaScript for Subject Details Sidebar Toggle has been removed as the corresponding HTML button is no longer present.
// If you decide to re-introduce a mobile toggle for this sidebar in the future,
// you would need to add back its HTML button and the corresponding JavaScript logic.
