window.onload = function() {
    const url = window.location.href;
    const noticeContainer = document.getElementById('noticeContainer');

    // Notices for specific URLs
    const notices = {
        "career-options": [
            "📢 New articles on each career option are coming soon! Stay tuned!"
        ],
        "blog6": [
            "📢 BHU postgraduate admissions are now conducted through CUET PG."
        ]
    };

    // Global notices (if any)
    const globalNotices = [];

    // Display notices based on the current URL
    const matchedNotices = [];
    for (const [key, value] of Object.entries(notices)) {
        if (url.includes(key)) {
            matchedNotices.push(...value.map(notice => ({text: notice, key})));
        }
    }
    matchedNotices.push(...globalNotices.map(notice => ({text: notice, key: 'global'})));

    // Populate the notice container with the matched notices
    matchedNotices.forEach((notice, index) => {
        if (!sessionStorage.getItem(`hidden-notice-${notice.key}-${index}`)) {
            const noticeContent = document.createElement('div');
            noticeContent.className = 'notice-content';
            noticeContent.style.display = 'none';  // Initially hidden
            noticeContent.innerHTML = `
                <p>${notice.text}</p>
                <button class="close-btn" onclick="hideNotice('${notice.key}', ${index})">✖</button>
            `;
            noticeContainer.appendChild(noticeContent);
        }
    });

    const noticeElements = document.querySelectorAll('.notice-content');
    const totalNotices = noticeElements.length;
    let currentIndex = 0;

    // Function to display the next notice
    function showNextNotice() {
        if (totalNotices > 0) {
            noticeElements[currentIndex].style.display = 'none'; // Hide current notice
            currentIndex = (currentIndex + 1) % totalNotices;     // Move to next notice
            noticeElements[currentIndex].style.display = 'block'; // Show next notice
        }
    }

    // Show the first notice initially
    if (totalNotices > 0) {
        noticeElements[currentIndex].style.display = 'block'; // Display the first notice
        document.getElementById('noticeWidget').style.display = 'block'; // Make the widget visible
    }

    // Rotate through the notices every 5 seconds
    setInterval(showNextNotice, 5000);

    // Attach event listeners for "Contact Us" elements
    document.querySelectorAll('.contactusurl').forEach(element => {
        element.addEventListener('click', () => {
            document.getElementById('contact-popup-overlay').style.display = 'flex';
        });
    });

    // Close the contact form when the close button is clicked
    document.getElementById('closeForm').addEventListener('click', () => {
        document.getElementById('contact-popup-overlay').style.display = 'none';
    });
};

// Function to hide a specific notice and store the action in sessionStorage
function hideNotice(key, index) {
    sessionStorage.setItem(`hidden-notice-${key}-${index}`, 'true');
    const noticeContents = document.querySelectorAll('.notice-content');
    noticeContents[index].style.display = 'none';

    // Hide the notice widget if all notices are hidden
    const visibleNotices = Array.from(noticeContents).filter(notice => notice.style.display !== 'none');
    if (visibleNotices.length === 0) {
        document.getElementById('noticeWidget').style.display = 'none';
    }
}
