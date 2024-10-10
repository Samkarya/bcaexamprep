        document.addEventListener('DOMContentLoaded', () => {
                    const fetchUniversities = async () => {
                try {
                    const response = await fetch('https://samkarya.github.io/bcaexamprep/bca-syllabus/syllabus-link.json'); // Path to your JSON file
                    if (!response.ok) {
                        throw new Error('Failed to fetch university data');
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error:', error);
                    return [];
                }
            };

            const itemsPerPage = 6;
            let currentPage = 1;
            let filteredUniversities = [];

            // Fetch universities and use the data
            fetchUniversities().then(universities => {
                filteredUniversities = [...universities];

            const universityCards = document.getElementById('universityCards');
            const searchInput = document.getElementById('searchInput');
            const pagination = document.getElementById('pagination');
            const pageNumbers = document.getElementById('pageNumbers');
            const prevPageBtn = document.getElementById('prevPage');
            const nextPageBtn = document.getElementById('nextPage');
            const noResults = document.getElementById('noResults');
            const requestButton = document.getElementById('requestButton');

            function createUniversityCard(university) {
                const article = document.createElement('article');
                article.className = 'bg-card rounded-lg shadow-md overflow-hidden';
                article.innerHTML = `
                    <div class="p-6">
                        <h2 class="text-xl font-semibold mb-4">${university.name}</h2>
                        <ul class="space-y-2">
                            ${university.links.map(link => `
                                <li>
                                    <a href="${link.url}" class="text-blue-500 hover:underline flex items-center">
                                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                                        </svg>
                                        <span>${link.title}</span>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
                return article;
            }

            function renderUniversities() {
                const start = (currentPage - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const paginatedUniversities = filteredUniversities.slice(start, end);

                universityCards.innerHTML = '';
                paginatedUniversities.forEach(university => {
                    universityCards.appendChild(createUniversityCard(university));
                });

                updatePagination();
                updateNoResultsMessage();
            }

            function updatePagination() {
                const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
                pagination.classList.toggle('hidden', totalPages <= 1);

                pageNumbers.innerHTML = '';
                for (let i = 1; i <= totalPages; i++) {
                    const button = document.createElement('button');
                    button.className = `relative inline-flex items-center px-4 py-2 border border-custom bg-card text-sm font-medium ${i === currentPage ? 'bg-blue-100 text-blue-600' : 'text-custom-secondary hover:bg-opacity-75'}`;
                    button.textContent = i;
                    button.addEventListener('click', () => {
                        currentPage = i;
                        renderUniversities();
                    });
                    pageNumbers.appendChild(button);
                }

                prevPageBtn.disabled = currentPage === 1;
                nextPageBtn.disabled = currentPage === totalPages;
            }

            function updateNoResultsMessage() {
                noResults.classList.toggle('hidden', filteredUniversities.length > 0);
            }

            function filterUniversities() {
                const searchTerm = searchInput.value.toLowerCase();
                filteredUniversities = universities.filter(uni => 
                    uni.name.toLowerCase().includes(searchTerm)
                );
                currentPage = 1;
                renderUniversities();
            }

            function updateSchema() {
                const schemaData = {
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "itemListElement": universities.map((uni, index) => ({
                        "@type": "Course",
                        "position": index + 1,
                        "name": `Bachelor of Computer Applications - ${uni.name}`,
                        "description": `BCA program syllabus from ${uni.name}`,
                        "provider": {
                            "@type": "CollegeOrUniversity",
                            "name": uni.name
                        }
                    }))
                };
                document.getElementById('schemaData').textContent = JSON.stringify(schemaData);
            }

            // Event Listeners
            searchInput.addEventListener('input', filterUniversities);
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderUniversities();
                }
            });
            nextPageBtn.addEventListener('click', () => {
                if (currentPage < Math.ceil(filteredUniversities.length / itemsPerPage)) {
                    currentPage++;
                    renderUniversities();
                }
            });

            // Initial render
            renderUniversities();
            updateSchema();
        });
    });
