// University data with syllabuses
const shSyllabusData = [
    {
        id: 1,
        name: "Mahatma Gandhi Kashi Vidyapith University",
        shortName: "MGKVP",
        tags: ["regular"],
        links: [
            { title: "Complete Detailed Syllabus", url: "https://mgkvp.ac.in/Uploads/SyllabusHome/B.C.A._79.pdf", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 2,
        name: "Guru Jambheshwar University of Science and Technology",
        shortName: "GJUST",
        tags: ["regular"],
        links: [
            { title: "Complete Course Syllabus", url: "https://gjust.ac.in/portal/upload/c6d75bf3-d50d-4eaf-85ac-eb409a415626.pdf", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 3,
        name: "Chaudhary Charan Singh University, Meerut",
        shortName: "CCSU",
        tags: ["regular"],
        links: [
            { title: "Complete Course Syllabus", url: "https://www.gngroup.org/asset/pdf/syllabus/management/BCA.pdf", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 4,
        name: "Maharaja Ganga Singh University",
        shortName: "MGSU",
        tags: ["regular"],
        links: [
            { title: "Complete Course Syllabus", url: "https://www.mgsubikaner.ac.in/PDF/63da0c4b9bd9e.pdf", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 5,
        name: "Hemvati Nandan Bahuguna Garhwal University",
        shortName: "HNBGU",
        tags: ["nep"],
        links: [
            { title: "Complete Course Syllabus (NEP)", url: "https://www.hnbgu.ac.in/sites/default/files/2023-09/BCA%20NEP%20SYLLABUS%20%281%29.pdf", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 6,
        name: "The Indira Gandhi National Open University",
        shortName: "IGNOU",
        tags: ["online"],
        links: [
            { title: "Complete Course Syllabus", url: "https://www.ignou.ac.in/schools/programme/BCA_NEW", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 7,
        name: "Mahatma Gandhi Mission University",
        shortName: "MGM",
        tags: ["specialization"],
        links: [
            { title: "B.C.A (Hons) Science", url: "https://www.mgmgyp.org/pdf/BCA%20Science.pdf", icon: "fa-flask" },
            { title: "B.C.A (Hons) Digital Marketing", url: "https://www.mgmgyp.org/pdf/BCA%20Digital%20Marketing.pdf", icon: "fa-bullhorn" }
        ]
    },
    {
        id: 8,
        name: "Prof. Rajendra Singh (Rajju Bhaiya) University, Prayagraj",
        shortName: "PRSU",
        tags: ["nep"],
        links: [
            { title: "B.C.A NEP (2020) onwards Syllabus", url: "https://prsuniv.ac.in/Syllabus2122/B.C.A.pdf", icon: "fa-file-pdf" },
            { title: "B.C.A NEP (2022) onwards Syllabus", url: "https://prsuniv.ac.in/Syllabus2223/UG/B.C.A.pdf", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 9,
        name: "Manipal University Jaipur",
        shortName: "MUJ",
        tags: ["specialization", "online"],
        links: [
            { title: "BCA Complete Syllabus", url: "https://jaipur.manipal.edu/fos/img/program-format/BCA-Complete-Syllabus.pdf", icon: "fa-file-pdf" },
            { title: "BCA - Data Science", url: "https://jaipur.manipal.edu/fos/img/program-format/Bachelor%20of%20Computer%20Applications%20(BCA)%20-%20Data%20Science%20Structure%20-2023-2024.pdf", icon: "fa-database" },
            { title: "BCA - Cyber Security", url: "https://jaipur.manipal.edu/fos/img/program-format/Bachelor%20of%20Computer%20Applications%20(BCA)%20-%20Cyber%20Security%20Structure%20-2023-2024.pdf", icon: "fa-shield-alt" },
            { title: "BCA Online-Program", url: "https://www.onlinemanipal.com/wp-content/uploads/2021/06/BCA-Online-Program-details-with-Syllabus.pdf", icon: "fa-laptop" }
        ]
    },
    {
        id: 10,
        name: "Maulana Abul Kalam Azad University of Technology, West Bengal",
        shortName: "MAKAUT-WB",
        tags: ["regular"],
        links: [
            { title: "BCA Course Structure", url: "https://makautexam.net/aicte_details/CourseStructure4/BCA23.pdf", icon: "fa-sitemap" },
            { title: "BCA Syllabus", url: "https://makautexam.net/aicte_details/CourseStructure4/CURRICULUM_BCA.pdf", icon: "fa-file-pdf" }
        ]
    }
];

// DOM elements
const shSyllabusGrid = document.getElementById('sh-syllabus-grid');
const shLoadMoreBtn = document.getElementById('sh-load-more');
const shSearchInput = document.getElementById('sh-search-input');
const shFilterButtons = document.querySelectorAll('.sh-filter__chip');
const shNoResultsEl = document.getElementById('sh-no-results');

// State management
let shCurrentPage = 1;
const shItemsPerPage = 6;
let shActiveFilter = 'all';
let shSearchQuery = '';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    shRenderSyllabuses();
    shSetupEventListeners();
});

// Set up event listeners
function shSetupEventListeners() {
    // Search functionality
    shSearchInput.addEventListener('input', (e) => {
        shSearchQuery = e.target.value.toLowerCase();
        shCurrentPage = 1;
        shRenderSyllabuses();
    });

    // Filter buttons
    shFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            shFilterButtons.forEach(btn => btn.classList.remove('sh-filter__chip--active'));
            button.classList.add('sh-filter__chip--active');
            shActiveFilter = button.dataset.filter;
            shCurrentPage = 1;
            shRenderSyllabuses();
        });
    });

    // Load more button
    shLoadMoreBtn.addEventListener('click', () => {
        shCurrentPage++;
        shRenderSyllabuses(true);
    });
}

// Filter and search syllabuses
function shFilterSyllabuses() {
    return shSyllabusData.filter(university => {
        // Apply search - now includes shortName
        const nameMatch = university.name.toLowerCase().includes(shSearchQuery);
        const shortNameMatch = university.shortName.toLowerCase().includes(shSearchQuery);
        const linksMatch = university.links.some(link => 
            link.title.toLowerCase().includes(shSearchQuery)
        );

        // Apply filters
        let filterMatch = true;
        if (shActiveFilter !== 'all') {
            filterMatch = university.tags.includes(shActiveFilter);
        }

        return (nameMatch || shortNameMatch || linksMatch) && filterMatch;
    });
}

// Render syllabuses to the grid
function shRenderSyllabuses(append = false) {
    const filteredData = shFilterSyllabuses();
    
    // Calculate pagination
    const startIndex = (shCurrentPage - 1) * shItemsPerPage;
    const endIndex = startIndex + shItemsPerPage;
    const paginatedData = filteredData.slice(0, endIndex);

    // Toggle "Load More" button visibility
    shLoadMoreBtn.style.display = filteredData.length > endIndex ? 'block' : 'none';
    
    // Show/hide no results message
    shNoResultsEl.style.display = filteredData.length === 0 ? 'block' : 'none';

    // Clear the grid if not appending
    if (!append) {
        shSyllabusGrid.innerHTML = '';
    }

    // Create and append cards for this page
    const thisPageData = filteredData.slice(startIndex, endIndex);
    
    thisPageData.forEach(university => {
        const card = shCreateUniversityCard(university);
        shSyllabusGrid.appendChild(card);
    });
}

// Create a card for a university
function shCreateUniversityCard(university) {
    const card = document.createElement('div');
    card.className = 'sh-card';
    card.id = `sh-uni-${university.shortName.toLowerCase()}`;
    
    // Create card header
    const header = document.createElement('div');
    header.className = 'sh-card__header';
    
    // Add university name and shortname
    header.innerHTML = `
        <h3 class="sh-card__title">${university.name}</h3>
        <span class="sh-card__short-name">${university.shortName}</span>
    `;
    
    // Create card body with syllabus links
    const body = document.createElement('div');
    body.className = 'sh-card__body';
    
    const linksList = document.createElement('ul');
    linksList.className = 'sh-card__links';
    
    university.links.forEach(link => {
        const listItem = document.createElement('li');
        listItem.className = 'sh-card__link-item';
        listItem.innerHTML = `
            <a href="${link.url}" class="sh-card__link" target="_blank" rel="noopener">
                <i class="fas ${link.icon || 'fa-file-pdf'} sh-card__link-icon"></i>
                <span class="sh-card__link-text">${link.title}</span>
            </a>
        `;
        linksList.appendChild(listItem);
    });
    
    body.appendChild(linksList);
    
    // Create card tags
    const footer = document.createElement('div');
    footer.className = 'sh-card__footer';
    
    if (university.tags && university.tags.length > 0) {
        const tagsList = document.createElement('div');
        tagsList.className = 'sh-card__tags';
        
        university.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = `sh-card__tag sh-card__tag--${tag}`;
            tagElement.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            tagsList.appendChild(tagElement);
        });
        
        footer.appendChild(tagsList);
    }
    
    // Assemble the card
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    
    return card;
}