// This script handles the dynamic loading of individual article content
// into the article detail page.

// Helper function to create a URL-friendly slug
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-')       // collapse whitespace and replace by -
    .replace(/-+/g, '-');       // collapse dashes
}

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Function to load and display article details
async function loadArticleDetails() {
  const params = new URLSearchParams(window.location.search);
  const articleSlug = params.get('article'); // Expects a query parameter like ?article=understanding-colregs

  const articleHeroSection = document.getElementById('article-hero');
  const heroArticleTitle = document.getElementById('hero-article-title');
  const heroArticleDescription = document.getElementById('hero-article-description');
  const articleAuthor = document.getElementById('article-author');
  const articleDate = document.getElementById('article-date');
  const articleContentElement = document.getElementById('article-content');
  const relatedArticlesContainer = document.getElementById('related-articles-container'); // Get related articles container
  const pageTitleElement = document.querySelector('head title');

  const notFoundMessage = `
    <div class="text-center p-8 text-red-500">
      <h2 class="text-2xl font-bold mb-4">Article Not Found</h2>
      <p>The requested article could not be found.</p>
      <a href="../index.html#daily-articles" class="mt-4 inline-block text-blue-600 hover:underline">Back to Daily Articles</a>
    </div>
  `;

  if (!articleSlug) {
    articleContentElement.innerHTML = notFoundMessage;
    pageTitleElement.textContent = 'Article Not Found | Mariner\'s Pathway';
    articleHeroSection.style.backgroundImage = 'none';
    heroArticleTitle.textContent = 'Article Not Found';
    heroArticleDescription.textContent = 'No article specified.';
    if (articleAuthor) articleAuthor.innerHTML = '';
    if (articleDate) articleDate.innerHTML = '';
    if (relatedArticlesContainer) relatedArticlesContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">No related articles found.</p>';
    return;
  }

  // Show a loading message initially
  articleContentElement.innerHTML = `
    <p class="text-center text-gray-500 text-lg mb-6">Loading article content...</p>
  `;
  heroArticleTitle.textContent = 'Loading Article...';
  heroArticleDescription.textContent = 'Please wait while we fetch the content.';
  if (articleAuthor) articleAuthor.innerHTML = '<i class="fas fa-user-circle mr-1"></i> Loading...';
  if (articleDate) articleDate.innerHTML = '<i class="fas fa-calendar-alt mr-1"></i> Loading...';
  if (relatedArticlesContainer) relatedArticlesContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">Loading related articles...</p>';
  pageTitleElement.textContent = 'Loading... | Mariner\'s Pathway';


  try {
    // Path to daily_articles.json relative to daily_article_detail_page.js
    // Assuming daily_article_detail_page.js is in public/daily_articles/ and daily_articles.json is in public/daily_articles/assets/data/
    const response = await fetch('assets/data/daily_articles.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const articles = await response.json();

    // Find the current article
    const foundArticle = articles.find(article => createSlug(article.title) === articleSlug);

    if (foundArticle) {
      // Update page title
      pageTitleElement.textContent = `${foundArticle.title} | Mariner's Pathway`;

      // Update Hero Section background
      articleHeroSection.style.backgroundImage = `url('${foundArticle.img_path}')`;
      heroArticleTitle.textContent = foundArticle.title;
      heroArticleDescription.textContent = foundArticle.description;

      // Update Author and Date
      if (articleAuthor) articleAuthor.innerHTML = `<i class="fas fa-user-circle mr-1"></i> By ${foundArticle.author || 'Unknown Author'}`;
      if (articleDate) articleDate.innerHTML = `<i class="fas fa-calendar-alt mr-1"></i> ${foundArticle.publication_date || 'N/A'}`;

      // Fetch and display the actual article HTML content
      try {
        const contentResponse = await fetch(foundArticle.html_path);
        if (!contentResponse.ok) {
          throw new Error(`Failed to load article content from ${foundArticle.html_path}: status ${contentResponse.status}`);
        }
        const contentHtml = await contentResponse.text();

        // Inject the content into the article-content div
        articleContentElement.innerHTML = contentHtml;
      } catch (contentError) {
        console.error('Error loading article content:', contentError);
        articleContentElement.innerHTML = `<p class="text-red-500 text-center">Failed to load article content: ${contentError.message}</p>
                                          <a href="../index.html#daily-articles" class="mt-4 inline-block text-blue-600 hover:underline">Back to Daily Articles</a>`;
      }

      // --- Load Related Articles ---
      if (relatedArticlesContainer) {
        const otherArticles = articles.filter(article => createSlug(article.title) !== articleSlug);
        const shuffledOtherArticles = shuffleArray(otherArticles);
        const relatedArticlesToDisplay = shuffledOtherArticles.slice(0, 9); // Get up to 2 random related articles

        relatedArticlesContainer.innerHTML = ''; // Clear placeholders

        if (relatedArticlesToDisplay.length > 0) {
          relatedArticlesToDisplay.forEach(relatedArticle => {
            const relatedArticleHtml = `
  <a href="daily_article_detail_page.html?article=${createSlug(relatedArticle.title)}"
     class="block bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 duration-300 max-w-sm w-full mx-auto p-4 box-border">

    <!-- Fixed Image Section -->
    <div class="w-full h-[160px] bg-gray-100 rounded-md overflow-hidden mb-4">
  <img src="${relatedArticle.img_path}" 
       alt="${relatedArticle.title}" 
       class="w-full h-[160px] object-cover"
       onerror="this.onerror=null; this.src='https://placehold.co/300x160?text=No+Image';">
</div>

    <!-- Fixed Content Section -->
    <div class="h-[200px] flex flex-col justify-between">
      <div>
        <h4 class="text-lg font-semibold text-gray-900 mb-2 truncate">${relatedArticle.title}</h4>
        <p class="text-gray-600 text-sm leading-snug overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${relatedArticle.description}</p>
      </div>
      <span class="mt-4 inline-block text-blue-700 hover:underline text-sm font-medium">Read more →</span>
</div>

  </a>
`;


            relatedArticlesContainer.insertAdjacentHTML('beforeend', relatedArticleHtml);

          });


        } else {
          relatedArticlesContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">No other articles available.</p>';
        }
      }

    } else {
      // Article not found in JSON data
      articleContentElement.innerHTML = notFoundMessage;
      pageTitleElement.textContent = 'Article Not Found | Mariner\'s Pathway';
      articleHeroSection.style.backgroundImage = 'none';
      heroArticleTitle.textContent = 'Article Not Found';
      heroArticleDescription.textContent = 'The article you are looking for does not exist.';
      if (articleAuthor) articleAuthor.innerHTML = '';
      if (articleDate) articleDate.innerHTML = '';
      if (relatedArticlesContainer) relatedArticlesContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">No related articles found.</p>';
    }

  } catch (error) {
    console.error('Error fetching daily articles data:', error);
    articleContentElement.innerHTML = `<p class="text-red-500 text-center">Error fetching articles data. Please try again later.</p>
                                      <a href="../index.html#daily-articles" class="mt-4 inline-block text-blue-600 hover:underline">Back to Daily Articles</a>`;
    pageTitleElement.textContent = 'Error | Mariner\'s Pathway';
    articleHeroSection.style.backgroundImage = 'none';
    heroArticleTitle.textContent = 'Error Loading';
    heroArticleDescription.textContent = 'Could not load article data.';
    if (articleAuthor) articleAuthor.innerHTML = '';
    if (articleDate) articleDate.innerHTML = '';
    if (relatedArticlesContainer) relatedArticlesContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Failed to load related articles.</p>';
  }
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadArticleDetails);

// Main Mobile Navigation Menu Toggle (ensuring it works on this page too)
const menuBtn = document.getElementById('menu-btn');
const drawer = document.getElementById('drawer');
const closeDrawerBtn = document.getElementById('close-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const menu = document.getElementById('menu');

if (menuBtn && drawer && closeDrawerBtn && drawerOverlay) {
  menuBtn.addEventListener('click', () => {
    drawer.classList.remove('-translate-x-full');
    drawerOverlay.classList.remove('hidden');
  });

  closeDrawerBtn.addEventListener('click', () => {
    drawer.classList.add('-translate-x-full');
    drawerOverlay.classList.add('hidden');
  });

  drawerOverlay.addEventListener('click', () => {
    drawer.classList.add('-translate-x-full');
    drawerOverlay.classList.add('hidden');
  });

  if (menu) {
    Array.from(menu.querySelectorAll('a')).forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          drawer.classList.add('-translate-x-full');
          drawerOverlay.classList.add('hidden');
        }
      });
    });
  }
}