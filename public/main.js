// This script handles the dynamic loading of daily articles on the index.html page.

document.addEventListener('DOMContentLoaded', async () => {
  const latestArticleContainer = document.getElementById('latest-article-container');
  const otherArticlesContainer = document.getElementById('other-articles-container');

  // Function to create a URL-friendly slug
  function createSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-')       // collapse whitespace and replace by -
      .replace(/-+/g, '-');       // collapse dashes
  }

  // Only attempt to load articles if the containers exist (i.e., we are on index.html)
  if (latestArticleContainer && otherArticlesContainer) {
    try {
      // --- CORRECTED PATH TO JSON FILE based on your detailed structure ---
      // From public/index-script.js to public/daily_articles/assets/data/daily_articles.json
      // This path is relative to index.html, so for daily_articles_home.html, it would be 'assets/data/daily_articles.json'
      // We need to make this dynamic or ensure it's correct for the calling page.
      // For index.html, it's 'daily_articles/assets/data/daily_articles.json'
      // For daily_articles/daily_article_home.html, it's 'assets/data/daily_articles.json'
      // Let's adjust the path for robustness.
      const jsonPath = window.location.pathname.includes('/daily_articles/') ? 'assets/data/daily_articles.json' : 'daily_articles/assets/data/daily_articles.json';
      
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const articles = await response.json();

      if (articles.length === 0) {
        latestArticleContainer.innerHTML = '<p class="text-center text-gray-500">No articles available.</p>';
        otherArticlesContainer.innerHTML = '';
        return;
      }

      // Display the latest article (first one in the array)
      const latestArticle = articles[0];
      latestArticleContainer.innerHTML = `
        <div class="w-full mb-4">
          <div class="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="daily_articles/${latestArticle.img_path}" alt="${latestArticle.title}" class="object-cover w-full h-full" onerror="this.onerror=null; this.src='https://placehold.co/600x400/CCCCCC/888888?text=Image+Not+Found';">
          </div>
        </div>
        <div class="w-full">
          <span class="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mb-2">Latest</span>
          <h3 class="text-xl font-bold text-blue-900 mb-2">${latestArticle.title}</h3>
          <p class="text-gray-700 mb-4">${latestArticle.description}</p>
          <!-- Corrected HREF: Link to daily_article_detail_page.html with slug as query parameter -->
          <a href="daily_articles/daily_article_detail_page.html?article=${createSlug(latestArticle.title)}" class="text-blue-700 hover:underline font-semibold mt-2">Read Full Article</a>
        </div>
      `;

      // Display other articles (now limited to the last three from the remaining articles)
      otherArticlesContainer.innerHTML = ''; // Clear initial loading message
      const remainingArticles = articles.slice(1); // Get all articles except the first one
      const articlesToDisplay = remainingArticles.slice(-3); // Get only the last 3 of the remaining

      // --- Debugging: Log the number of articles expected to be displayed ---
      console.log(`[DEBUG] Number of 'other articles' to display: ${articlesToDisplay.length}`);

      articlesToDisplay.forEach((article, index) => {
        const articleSlug = createSlug(article.title);
        const articleHtml = `
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow transition flex items-center gap-4">
            <img src="daily_articles/${article.img_path}" alt="${article.title}" class="w-14 h-14 rounded-md object-cover flex-shrink-0" onerror="this.onerror=null; this.src='https://placehold.co/56x56/CCCCCC/888888?text=Img';">
            <div>
              <h4 class="text-base font-semibold text-blue-900 mb-1">${article.title}</h4>
              <p class="text-gray-600 text-sm mb-2">${article.description}</p>
              <!-- Corrected HREF: Link to daily_article_detail_page.html with slug as query parameter -->
              <a href="daily_articles/daily_article_detail_page.html?article=${createSlug(article.title)}" class="text-blue-700 hover:underline text-sm">Read more</a>
            </div>
          </div>
        `;
        otherArticlesContainer.insertAdjacentHTML('beforeend', articleHtml);
        // --- Debugging: Log each article as it's added to the DOM ---
        console.log(`[DEBUG] Added article ${index + 1} to 'other articles': "${article.title}"`);
      });

    } catch (error) {
      console.error('Error loading daily articles:', error);
      latestArticleContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load articles. Please try again later.</p>';
      otherArticlesContainer.innerHTML = '';
    }
  }


  // Main Mobile Navigation Menu Toggle
  const menuBtn = document.getElementById('menu-btn');
  const drawer = document.getElementById('drawer');
  const closeDrawerBtn = document.getElementById('close-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');

  console.log('--- Drawer Elements Check ---');
  console.log('menuBtn:', menuBtn);
  console.log('drawer:', drawer);
  console.log('closeDrawerBtn:', closeDrawerBtn);
  console.log('drawerOverlay:', drawerOverlay);
  console.log('-----------------------------');


  if (menuBtn && drawer && closeDrawerBtn && drawerOverlay) {
    console.log('All drawer elements found. Attaching event listeners.');

    // Ensure initial hidden state is applied via JS for robustness, if not already
    // This is a safety net; ideally, HTML/CSS should set initial hidden state.
    if (!drawer.style.transform || drawer.style.transform === 'translateX(0px)') { // Check if not set or if it's currently open
      drawer.style.transform = 'translateX(-100%)';
    }
    if (drawerOverlay.style.display !== 'none') { // Check if not set or if it's currently visible
        drawerOverlay.style.display = 'none';
    }


    menuBtn.addEventListener('click', () => {
      console.log('Menu button clicked. Opening drawer.');
      drawer.style.transform = 'translateX(0)'; // Move into view
      drawerOverlay.style.display = 'block'; // Make overlay visible
    });

    closeDrawerBtn.addEventListener('click', () => {
      console.log('Close drawer button clicked. Closing drawer.');
      drawer.style.transform = 'translateX(-100%)'; // Move out of view
      drawerOverlay.style.display = 'none'; // Hide overlay
    });

    drawerOverlay.addEventListener('click', () => {
      console.log('Drawer overlay clicked. Closing drawer.');
      drawer.style.transform = 'translateX(-100%)'; // Move out of view
      drawerOverlay.style.display = 'none'; // Hide overlay
    });

    // Close drawer when a link inside the drawer is clicked
    const drawerLinks = drawer.querySelectorAll('a');
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Only close if it's actually in mobile view
            // Check window.innerWidth directly as 'md:hidden' refers to md breakpoint
            if (window.innerWidth < 768) { // Default Tailwind 'md' breakpoint is 768px
                console.log('Drawer link clicked in mobile view. Closing drawer.');
                drawer.style.transform = 'translateX(-100%)';
                drawerOverlay.style.display = 'none';
            }
        });
    });
  } else {
    console.warn('Could not find all necessary drawer elements. Mobile menu functionality might be impaired.');
    console.warn('Missing elements:', {
      menuBtn: menuBtn,
      drawer: drawer,
      closeDrawerBtn: closeDrawerBtn,
      drawerOverlay: drawerOverlay
    });
  }
});