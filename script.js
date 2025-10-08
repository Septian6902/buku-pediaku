const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const bookList = document.getElementById('book-list');
const loading = document.getElementById('loading');
const recommended = document.getElementById('recommended');
const darkToggle = document.getElementById('darkToggle');
const modeIcon = document.getElementById('modeIcon');
const modeText = document.getElementById('modeText');
const categorySelect = document.getElementById('category');

// 🌗 Dark mode toggle
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  modeIcon.textContent = isLight ? '🌙' : '☀️';
  modeText.textContent = isLight ? 'Mode Gelap' : 'Mode Terang';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// 🌗 Apply saved theme on load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    modeIcon.textContent = '🌙';
    modeText.textContent = 'Mode Gelap';
  }

  // ⬇️ Sembunyikan judul hasil pencarian saat awal
  document.getElementById('searchTitle').classList.add('hidden');
});

// 🔍 Search books by query
async function searchBooks(query) {
  loading.classList.remove('hidden');
  bookList.innerHTML = '';

  // ⬇️ Sembunyikan rekomendasi dan tampilkan hasil pencarian
  document.getElementById('recommendationSection').classList.add('hidden');
  document.getElementById('searchTitle').classList.remove('hidden');

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
    const data = await response.json();
    loading.classList.add('hidden');

    if (data.docs && data.docs.length > 0) {
      data.docs.forEach(book => {
        const card = createBookCard(book);
        bookList.appendChild(card);
      });
    } else {
      bookList.innerHTML = `
        <p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">
          Tidak ada hasil ditemukan
        </p>`;
    }
  } catch (error) {
    loading.classList.add('hidden');
    bookList.innerHTML = `
      <p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">
        Terjadi kesalahan saat mencari buku
      </p>`;
  }
}


// 🧱 Create book card
function createBookCard(book) {
  const card = document.createElement('a');
  card.className = 'book-card';
  card.style.textDecoration = 'none';

  const coverId = book.cover_i;
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : 'https://via.placeholder.com/200x280?text=No+Cover';

  const title = book.title || 'Judul tidak tersedia';
  const author = book.author_name ? book.author_name.join(', ') : 'Penulis tidak diketahui';
  const workId = book.key?.split('/').pop();

  card.href = workId ? `detail.html?id=${workId}` : '#';

  card.innerHTML = `
    <img src="${coverUrl}" alt="${title}" class="book-cover">
    <h3 class="book-title">${title}</h3>
    <p class="book-author">${author}</p>
  `;

  return card;
}

// 🎯 Load random recommendations
async function loadRecommendations() {
  const topics = ['fiction', 'science', 'history', 'fantasy', 'mystery'];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  try {
    const response = await fetch(`https://openlibrary.org/subjects/${randomTopic}.json?limit=12`);
    const data = await response.json();

    if (data.works && data.works.length > 0) {
      data.works.forEach(book => {
        const card = createBookCard({
          title: book.title,
          author_name: book.authors?.map(a => a.name),
          cover_i: book.cover_id,
          key: book.key
        });
        recommended.appendChild(card);
      });
    }
  } catch (error) {
    console.error('Error loading recommendations:', error);
  }
}

async function loadDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const loadingEl = document.getElementById("loading");
  const detailEl = document.getElementById("book-detail");

  loadingEl.classList.remove("hidden");
  detailEl.classList.add("hidden"); // pastikan disembunyikan dulu

  try {
    const res = await fetch(`https://openlibrary.org/works/${id}.json`);
    const data = await res.json();

    const title = data.title || "Judul tidak tersedia";
    const cover = data.covers
      ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
      : "https://via.placeholder.com/300x400?text=No+Cover";

    const description = data.description
      ? typeof data.description === "string"
        ? data.description
        : data.description.value
      : "Tidak ada deskripsi.";

    const subjects = data.subjects ? data.subjects.join(", ") : "Tidak tersedia.";
    const createdDate = data.created
      ? new Date(data.created.value).toLocaleDateString("id-ID")
      : "Tidak diketahui";

    detailEl.innerHTML = `
      <div class="detail-container">
        <div class="cover-wrapper">
          <img src="${cover}" alt="${title}" class="book-cover" />
        </div>
        <div class="detail-info">
          <h1>${title}</h1>
          <p><strong>Deskripsi:</strong> ${description}</p>
          <p><strong>Subjek:</strong> ${subjects}</p>
          <p><strong>Dibuat pada:</strong> ${createdDate}</p>
        </div>
      </div>
    `;

    detailEl.classList.remove("hidden");
  } catch (error) {
    detailEl.innerHTML = `<p class="error">❌ Gagal memuat detail buku.</p>`;
    detailEl.classList.remove("hidden");
  } finally {
    loadingEl.classList.add("hidden");
  }
}

  function goHome() {
    window.location.href = "index.html";
  }

  loadDetail();



// 🎯 Event listeners
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) searchBooks(query);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) searchBooks(query);
  }
});


// 🚀 Initial load
loadRecommendations();
