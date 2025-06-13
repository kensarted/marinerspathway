document.addEventListener('DOMContentLoaded', () => {
  fetch('assets/data/daily_articles.json')
    .then(response => response.json())
    .then(data => {
      // Sort by publication_date descending
      const sorted = data.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
      renderTopStory(sorted[0]);
      renderFeaturedStories(sorted.slice(1, 3));
      renderAllArticles(sorted.slice(3));
    })
    .catch(error => console.error('Failed to load articles:', error));
});

// Helper function to create slug from title
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')  // remove invalid chars
    .replace(/\s+/g, '-')         // replace spaces with -
    .replace(/-+/g, '-');         // collapse multiple dashes
}

function renderTopStory(article) {
  const container = document.getElementById('top-story');
  const slug = createSlug(article.title);
  container.innerHTML = `
    <a href="daily_article_detail_page.html?article=${slug}" class="block relative h-[60vh] rounded-lg overflow-hidden group">
      <img src="${article.img_path}" alt="${article.title}" class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
      <div class="absolute bottom-0 z-20 p-6 text-white space-y-3">
        <h2 class="text-3xl font-extrabold leading-tight">${article.title}</h2>
        <p class="text-base text-gray-200 max-w-2xl">${article.description}</p>
        <span class="text-sm text-gray-400">${article.author} • ${article.publication_date}</span>
      </div>
    </a>
  `;
}

function renderFeaturedStories(articles) {
  const container = document.getElementById('featured-stories');
  container.innerHTML = '';
  articles.forEach(article => {
    const slug = createSlug(article.title);
    const card = document.createElement('a');
    card.href = `daily_article_detail_page.html?article=${slug}`;
    card.className = 'bg-white rounded-xl shadow group overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition';
    card.innerHTML = `
      <img src="${article.img_path}" alt="${article.title}" class="w-full sm:w-56 h-48 sm:h-auto object-cover group-hover:scale-105 transition duration-500" />
      <div class="p-4 flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">${article.title}</h3>
          <p class="text-sm text-gray-600 mt-2 line-clamp-3">${article.description}</p>
        </div>
        <p class="text-xs text-gray-500 mt-4">${article.author} • ${article.publication_date}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAllArticles(articles) {
  const container = document.getElementById('all-articles');
  container.innerHTML = '';
  articles.forEach(article => {
    const slug = createSlug(article.title);
    const card = document.createElement('a');
    card.href = `daily_article_detail_page.html?article=${slug}`;
    card.className = 'bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden block';
    card.innerHTML = `
      <img src="${article.img_path}" alt="${article.title}" class="w-full h-40 object-cover" />
      <div class="p-4 space-y-2">
        <h4 class="text-lg font-semibold text-gray-800">${article.title}</h4>
        <p class="text-sm text-gray-600 line-clamp-3">${article.description}</p>
        <p class="text-xs text-gray-500">${article.publication_date}</p>
      </div>
    `;
    container.appendChild(card);
  });
}
