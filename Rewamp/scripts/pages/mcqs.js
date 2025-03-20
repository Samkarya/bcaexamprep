// Load and display MCQs from JSON
document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const itemsPerPage = 9;
  let currentPage = 1;
  let filteredMcqs = [];
  
  // DOM elements
  const searchInput = document.getElementById('mcqs-search-input');
  const searchButton = document.getElementById('mcqs-search-btn');
  const subjectFilter = document.getElementById('mcqs-subject-filter');
  const sortOption = document.getElementById('mcqs-sort-option');
  const resultsContainer = document.getElementById('mcqs-results');
  const paginationElement = document.getElementById('mcqs-pagination');
  const prevButton = document.querySelector('.mcqs-prev-btn');
  const nextButton = document.querySelector('.mcqs-next-btn');
  const currentPageSpan = document.querySelector('.mcqs-current-page');
  const totalPagesSpan = document.querySelector('.mcqs-total-pages');
  const cardTemplate = document.getElementById('mcqs-card-template');
  
const mcqsData = [
  {
    id: 1,
    title: "C Programming",
    description: "Master the fundamentals of C programming with our curated MCQs covering syntax, functions, pointers, and more.",
    subject: "computer science",
    count: 330,
    link: "https://bcaexamprep.blogspot.com/2024/08/c-programming-mcqs.html",
    dateAdded: "2024-08-01"
  },
  {
    id: 2,
    title: "Digital Electronics",
    description: "Test your knowledge on computer organization and digital logic with comprehensive questions.",
    subject: "electronics",
    count: 440,
    link: "https://bcaexamprep.blogspot.com/2024/09/digital-electronics-and-computer-organization-mcqs.html",
    dateAdded: "2024-09-01"
  },
  {
    id: 3,
    title: "Organization Behaviour",
    description: "Content is coming soon.",
    subject: "management",
    count: 0,
    link: "",
    dateAdded: ""
  },
  {
    id: 4,
    title: "Financial Accounting and Management",
    description: "Content is coming soon.",
    subject: "finance",
    count: 0,
    link: "",
    dateAdded: ""
  },
  {
    id: 5,
    title: "Computer Graphics",
    description: "Explore MCQs on computer graphics concepts and multimedia applications.",
    subject: "computer science",
    count: 530,
    link: "https://bcaexamprep.blogspot.com/2024/08/computer-graphics-and-multimedia-mcqs.html",
    dateAdded: "2024-08-01"
  },
  {
    id: 6,
    title: "Operating System",
    description: "Challenge yourself with questions on OS concepts, process management, and more.",
    subject: "computer science",
    count: 700,
    link: "https://bcaexamprep.blogspot.com/2024/08/operating-system-mcqs.html",
    dateAdded: "2024-08-01"
  },
  {
    id: 7,
    title: "Software Engineering",
    description: "Test your understanding of software development lifecycle and methodologies.",
    subject: "computer science",
    count: 290,
    link: "https://bcaexamprep.blogspot.com/2024/08/software-engineering-mcqs.html",
    dateAdded: "2024-08-01"
  },
  {
    id: 8,
    title: "Graph Theory",
    description: "Practice questions on graph concepts, algorithms, and applications in computer science.",
    subject: "mathematics",
    count: 530,
    link: "https://bcaexamprep.blogspot.com/2024/08/graph-theory-mcqs.html",
    dateAdded: "2024-08-01"
  },
  {
    id: 9,
    title: "Optimization Research",
    description: "Practice questions on optimization concepts, algorithms, and applications in computer science.",
    subject: "mathematics",
    count: 190,
    link: "https://bcaexamprep.blogspot.com/2024/08/optimization-research-mcqs.html",
    dateAdded: "2024-08-01"
  }
];

  
  // Initialize
  function init() {
    filteredMcqs = [...mcqsData];
    renderMcqs();
    setupEventListeners();
  }
  
  // Render MCQs
  function renderMcqs() {
    // Clear existing content
    resultsContainer.innerHTML = '';
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredMcqs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredMcqs.length);
    
    // Update pagination display
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    
    // If no results
    if (filteredMcqs.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'mcqs-no-results';
      noResults.textContent = 'No MCQs found matching your criteria. Try a different search term or filter.';
      resultsContainer.appendChild(noResults);
      return;
    }
    
    // Create and append MCQ cards
    for (let i = startIndex; i < endIndex; i++) {
      const mcq = filteredMcqs[i];
      const card = document.importNode(cardTemplate.content, true);
      
      // Fill in template data
      card.querySelector('.mcqs-card-title').textContent = mcq.title;
      card.querySelector('.mcqs-card-description').textContent = mcq.description;
      card.querySelector('.mcqs-card-subject').textContent = mcq.subject.charAt(0).toUpperCase() + mcq.subject.slice(1);
      card.querySelector('.mcqs-card-count').textContent = `${mcq.count} questions`;
      card.querySelector('.mcqs-card-link').href = mcq.link;
      
      resultsContainer.appendChild(card);
    }
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Search functionality
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    // Filter and sort functionality
    subjectFilter.addEventListener('change', filterAndSort);
    sortOption.addEventListener('change', filterAndSort);
    
    // Pagination
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderMcqs();
      }
    });
    
    nextButton.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredMcqs.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderMcqs();
      }
    });
  }
  
  // Search functionality
  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    filterAndSort(searchTerm);
  }
  
  // Filter and sort
  function filterAndSort(searchTerm = null) {
    // If called from event listener
    if (typeof searchTerm === 'object') {
      searchTerm = searchInput.value.toLowerCase().trim();
    }
    
    const subject = subjectFilter.value;
    const sort = sortOption.value;
    
    // Filter by search term and subject
    filteredMcqs = mcqsData.filter(mcq => {
      const matchesSearch = searchTerm ? 
        mcq.title.toLowerCase().includes(searchTerm) || 
        mcq.description.toLowerCase().includes(searchTerm) : 
        true;
      
      const matchesSubject = subject === 'all' || mcq.subject === subject;
      
      return matchesSearch && matchesSubject;
    });
    
    // Sort results
    filteredMcqs.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'oldest':
          return new Date(a.dateAdded) - new Date(b.dateAdded);
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    // Reset to first page and render
    currentPage = 1;
    renderMcqs();
  }
  
  // Initialize the page
  init();
});