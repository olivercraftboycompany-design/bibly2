// app.js
// Modern Bible Reader Core Engine

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Declarations
    const sidebar = document.getElementById('sidebar');
    const readerView = document.getElementById('reader-view');
    const searchBar = document.getElementById('search-bar');
    const themeToggle = document.getElementById('theme-toggle');
    const fontUp = document.getElementById('font-up');
    const fontDown = document.getElementById('font-down');

    let currentFontSize = 1.2; // Baseline font size in rem

    // ==========================================================================
    // 1. SIDEBAR ACCORDION NAVIGATION GENERATOR
    // ==========================================================================
    function initNavigation() {
        if (typeof bibleData === 'undefined' || !bibleData.length) {
            readerView.innerHTML = '<h2 style="color: red; text-align:center; font-family:sans-serif;">Error: bible-data.js configuration empty or missing.</h2>';
            return;
        }
        
        // Reset Sidebar Structure
        sidebar.innerHTML = '';

        // Generate Sidebar Mini Filter Search Bar
        const searchContainer = document.createElement('div');
        searchContainer.className = 'sidebar-search-container';
        
        const sideSearch = document.createElement('input');
        sideSearch.type = 'text';
        sideSearch.id = 'sidebar-search';
        sideSearch.placeholder = 'Filter books or chapters...';
        
        searchContainer.appendChild(sideSearch);
        sidebar.appendChild(searchContainer);

        // Container element holding generated lists
        const menuContainer = document.createElement('div');
        menuContainer.id = 'sidebar-menu-items';
        sidebar.appendChild(menuContainer);

        // Map plain source array into grouped Books
        const booksMap = {};
        bibleData.forEach((item) => {
            if (!booksMap[item.book]) {
                booksMap[item.book] = [];
            }
            booksMap[item.book].push({
                chapter: item.chapter,
                originalData: item
            });
        });

        // Sub-render loop function handling key filters
        function renderTree(filterText = '') {
            menuContainer.innerHTML = '';
            const cleanFilter = filterText.toLowerCase().trim();

            Object.keys(booksMap).forEach(bookName => {
                const chapters = booksMap[bookName];
                
                // Track matches within current loop instance
                const matchedChapters = chapters.filter(ch => {
                    const searchLabel = `${bookName} ${ch.chapter}`.toLowerCase();
                    return searchLabel.includes(cleanFilter);
                });

                // Escape group generation if search yields no results
                if (cleanFilter && matchedChapters.length === 0) return;

                const groupDiv = document.createElement('div');
                groupDiv.className = 'book-group';
                
                // Keep groups open if filtering inputs
                if (cleanFilter) groupDiv.classList.add('expanded');

                const toggleDiv = document.createElement('div');
                toggleDiv.className = 'book-toggle';
                toggleDiv.textContent = bookName;

                const listDiv = document.createElement('div');
                listDiv.className = 'chapters-list';

                matchedChapters.forEach(ch => {
                    const navItem = document.createElement('div');
                    navItem.className = 'nav-item';
                    navItem.textContent = `Chapter ${ch.chapter}`;
                    
                    navItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                        navItem.classList.add('active');
                        displayChapter(ch.originalData);
                    });
                    
                    listDiv.appendChild(navItem);
                });

                toggleDiv.addEventListener('click', () => {
                    groupDiv.classList.toggle('expanded');
                });

                groupDiv.appendChild(toggleDiv);
                groupDiv.appendChild(listDiv);
                menuContainer.appendChild(groupDiv);
            });
        }

        // Bind Live Input Event to Sidebar Filter Box
        sideSearch.addEventListener('input', (e) => {
            renderTree(e.target.value);
        });

        // Execute dynamic generation script
        renderTree();

        // Bootstrapping: Auto-Open first choice options if entries exist
        if(bibleData.length > 0) {
            displayChapter(bibleData[0]);
            const firstGroup = menuContainer.querySelector('.book-group');
            if(firstGroup) {
                firstGroup.classList.add('expanded');
                const firstChapterItem = firstGroup.querySelector('.nav-item');
                if(firstChapterItem) firstChapterItem.classList.add('active');
            }
        }
    }

    // ==========================================================================
    // 2. TEXT RENDERING COMPONENT ENGINE
    // ==========================================================================
    function displayChapter(data) {
        let html = `<h1 class="book-title">${data.book} ${data.chapter}</h1>`;
        data.verses.forEach((verse, index) => {
            html += `
                <div class="verse-container">
                    <span class="verse-num">${index + 1}</span>
                    <span class="verse-text">${verse}</span>
                </div>
            `;
        });
        readerView.innerHTML = html;
        readerView.scrollTop = 0; 
    }

    // ==========================================================================
    // 3. GLOBAL KEYWORD DATABASE SEARCH ENGINE
    // ==========================================================================
    function handleGlobalSearch(query) {
        if (!query.trim()) {
            initNavigation(); // Revert back to basic navigation structure if input cleared
            return;
        }

        const lowerQuery = query.toLowerCase().trim();
        let resultsHtml = `<h2 class="search-results-title">Search Results for "${query}"</h2>`;
        let matchCount = 0;

        bibleData.forEach(data => {
            data.verses.forEach((verse, index) => {
                if (verse.toLowerCase().includes(lowerQuery)) {
                    matchCount++;
                    const regex = new RegExp(`(${query})`, "gi");
                    const highlightedText = verse.replace(regex, "<span class='highlight'>$1</span>");
                    
                    resultsHtml += `
                        <div class="verse-container" style="margin-bottom: 1.5rem; text-align: left;">
                            <div style="font-size: 0.85em; color: var(--accent-color); font-weight: bold; font-family:-apple-system, sans-serif; margin-bottom: 2px;">
                                ${data.book} ${data.chapter}:${index + 1}
                            </div>
                            <span class="verse-text">${highlightedText}</span>
                        </div>
                    `;
                }
            });
        });

        if (matchCount === 0) {
            resultsHtml += `<p style="color: #888; text-align: center; margin-top: 40px; font-family:sans-serif;">No verse matches found matching that criteria.</p>`;
        }

        readerView.innerHTML = resultsHtml;
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    }

    // ==========================================================================
    // 4. HEADER ACCESSIBILITY & UTILITY CONTROLS
    // ==========================================================================
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', targetTheme);
        themeToggle.textContent = targetTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    });

    fontUp.addEventListener('click', () => {
        if (currentFontSize < 2.2) {
            currentFontSize += 0.1;
            readerView.style.fontSize = `${currentFontSize}rem`;
        }
    });

    fontDown.addEventListener('click', () => {
        if (currentFontSize > 0.8) {
            currentFontSize -= 0.1;
            readerView.style.fontSize = `${currentFontSize}rem`;
        }
    });

    // Attach Event Listeners to Top Global Navbar Search
    searchBar.addEventListener('input', (e) => handleGlobalSearch(e.target.value));

    // Runtime Initialization Sequence
    initNavigation();
});
