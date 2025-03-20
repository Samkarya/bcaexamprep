document.addEventListener('DOMContentLoaded', function() {
const mcqsData = [
  {
    id: 1,
    title: "PYQS By MGKVP Online",
    college: "Mahatma Gandhi Kashi Vidyapith University",
    year: "N/A",
    subject: "BCA",
    link: "https://www.mgkvponline.com/bca.html#list"
  },
  {
    id: 2,
    title: "PYQs by BCA Notes Nepal",
    college: "Tribhuvan University",
    year: "N/A",
    subject: "BCA",
    link: "https://bcanotesnepal.com/category/yearly-question-paper/"
  },
  {
    id: 3,
    title: "PYQs By CCSU Study",
    college: "Chaudhary Charan Singh University, Meerut",
    year: "N/A",
    subject: "BCA",
    link: "https://www.ccsustudy.com/ccsu-bca-papers.html#list"
  },
  {
    id: 4,
    title: "PYQs by MGSU Online",
    college: "Maharaja Ganga Singh University",
    year: "N/A",
    subject: "BCA",
    link: "https://www.mgsuonline.com/mgsu-university-bca.html#list"
  },
  {
    id: 5,
    title: "PYQs by IGNOU Assignment Guru",
    college: "The Indira Gandhi National Open University",
    year: "N/A",
    subject: "BCA",
    link: "https://www.ignouassignmentguru.com/ignou-bachelor-of-computer-application-bca-previous-year-question-papers/#IGNOU_Bachelor_of_Computer_Application_BCA_Previous_Year_Question_Papers"
  }
];


const searchInput = document.getElementById('pyqs-search');
const searchBtn = document.getElementById('pyqs-search-btn');
const collegeFilter = document.getElementById('pyqs-college-filter');
const yearFilter = document.getElementById('pyqs-year-filter');
const subjectFilter = document.getElementById('pyqs-subject-filter');
const resultsContainer = document.getElementById('pyqs-results');
const noResultsElement = document.getElementById('pyqs-no-results');

// Populate filters
populateFilters();

// Initial rendering
renderMCQs(mcqsData);

// Add event listeners
searchBtn.addEventListener('click', filterMCQs);
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
    filterMCQs();
    }
});

collegeFilter.addEventListener('change', filterMCQs);
yearFilter.addEventListener('change', filterMCQs);
subjectFilter.addEventListener('change', filterMCQs);

function populateFilters() {
    // Get unique values for each filter
    const colleges = [...new Set(mcqsData.map(item => item.college))];
    const years = [...new Set(mcqsData.map(item => item.year))];
    const subjects = [...new Set(mcqsData.map(item => item.subject))];
    
    // Populate college filter
    colleges.forEach(college => {
    const option = document.createElement('option');
    option.value = college;
    option.textContent = college;
    collegeFilter.appendChild(option);
    });
    
    // Populate year filter
    years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
    });
    
    // Populate subject filter
    subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject;
    option.textContent = subject;
    subjectFilter.appendChild(option);
    });
}

function filterMCQs() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedCollege = collegeFilter.value;
    const selectedYear = yearFilter.value;
    const selectedSubject = subjectFilter.value;
    
    const filteredData = mcqsData.filter(item => {
    const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery) ||
        item.college.toLowerCase().includes(searchQuery) ||
        item.subject.toLowerCase().includes(searchQuery) ||
        item.year.toLowerCase().includes(searchQuery);
        
    const matchesCollege = selectedCollege === '' || item.college === selectedCollege;
    const matchesYear = selectedYear === '' || item.year === selectedYear;
    const matchesSubject = selectedSubject === '' || item.subject === selectedSubject;
    
    return matchesSearch && matchesCollege && matchesYear && matchesSubject;
    });
    
    renderMCQs(filteredData);
}

function renderMCQs(data) {
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (data.length === 0) {
    noResultsElement.style.display = 'block';
    return;
    }
    
    noResultsElement.style.display = 'none';
    
    // Group by college
    const groupedByCollege = {};
    data.forEach(item => {
    if (!groupedByCollege[item.college]) {
        groupedByCollege[item.college] = [];
    }
    groupedByCollege[item.college].push(item);
    });
    
    // Render each college section
    Object.keys(groupedByCollege).forEach(college => {
    const collegeTemplate = document.getElementById('pyqs-college-template');
    const collegeClone = document.importNode(collegeTemplate.content, true);
    
    collegeClone.querySelector('.pyqs-college-name').textContent = college;
    const papersGrid = collegeClone.querySelector('.pyqs-papers-grid');
    
    // Add papers for this college
    groupedByCollege[college].forEach(paper => {
        const paperTemplate = document.getElementById('pyqs-paper-template');
        const paperClone = document.importNode(paperTemplate.content, true);
        
        const paperCard = paperClone.querySelector('.pyqs-paper-card');
        paperCard.href = paper.link;
        
        paperClone.querySelector('.pyqs-paper-title').textContent = paper.title;
        paperClone.querySelector('.pyqs-paper-meta').textContent = `${paper.subject} | ${paper.year}`;
        
        papersGrid.appendChild(paperClone);
    });
    
    resultsContainer.appendChild(collegeClone);
    });
}
});