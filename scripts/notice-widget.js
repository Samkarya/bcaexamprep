// Notice configuration
const notices = {
    "career-options": [
        "📢 New articles on each career option are coming soon! Stay tuned!"
    ],
    "blog6": [
        "📢 BHU postgraduate admissions are now conducted through CUET PG."
    ]
};

const globalNotices = [];
//"📢 New Feature Alert: Try out our Bisection and False Position Method calculators—<a href='https://bcaexamprep.blogspot.com/p/portfolio-hub-tools-projects.html'>now available</a> for you!"
// Helper functions
const getMatchedNotices = (url) => {
    const matchedNotices = Object.entries(notices)
        .filter(([key]) => url.includes(key))
        .flatMap(([key, value]) => value.map(notice => ({text: notice, key})));
    return [...matchedNotices, ...globalNotices.map(notice => ({text: notice, key: 'global'}))];
};

const createNoticeElement = (notice, index) => {
    const noticeContent = document.createElement('div');
    noticeContent.className = 'notice-content';
    noticeContent.style.display = 'none';
    noticeContent.innerHTML = `
        <p>${notice.text}</p>
        <button class="close-btn" data-key="${notice.key}" data-index="${index}">✖</button>
    `;
    return noticeContent;
};

const hideNotice = (key, index) => {
    sessionStorage.setItem(`hidden-notice-${key}-${index}`, 'true');
    const noticeContents = document.querySelectorAll('.notice-content');
    noticeContents[index].style.display = 'none';
    
    const visibleNotices = Array.from(noticeContents).filter(notice => notice.style.display !== 'none');
    document.getElementById('noticeWidget').style.display = visibleNotices.length ? 'block' : 'none';
};

// Main function
window.addEventListener('load', () => {
    const url = window.location.href;
    const noticeContainer = document.getElementById('noticeContainer');
    const matchedNotices = getMatchedNotices(url);

    matchedNotices.forEach((notice, index) => {
        if (!sessionStorage.getItem(`hidden-notice-${notice.key}-${index}`)) {
            const noticeElement = createNoticeElement(notice, index);
            noticeContainer.appendChild(noticeElement);
        }
    });

    const noticeElements = document.querySelectorAll('.notice-content');
    let currentIndex = 0;

    const showNextNotice = () => {
        if (noticeElements.length > 0) {
            noticeElements[currentIndex].style.display = 'none';
            currentIndex = (currentIndex + 1) % noticeElements.length;
            noticeElements[currentIndex].style.display = 'block';
        }
    };

    if (noticeElements.length > 0) {
        noticeElements[0].style.display = 'block';
        document.getElementById('noticeWidget').style.display = 'block';
        setInterval(showNextNotice, 5000);
    }

    // Event delegation for close buttons
    noticeContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('close-btn')) {
            hideNotice(event.target.dataset.key, event.target.dataset.index);
        }
    });

    // Contact form handling
    document.querySelectorAll('.contactusurl').forEach(element => {
        element.addEventListener('click', () => {
            document.getElementById('contact-popup-overlay').style.display = 'flex';
        });
    });

    document.getElementById('closeForm').addEventListener('click', () => {
        document.getElementById('contact-popup-overlay').style.display = 'none';
    });
});
