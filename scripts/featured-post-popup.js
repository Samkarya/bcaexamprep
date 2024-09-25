document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("Featured-Post");
    if (!popup) return;  // Exit if #Featured-Post is not found

    // Create a close button for the popup
    const closeBtn = document.createElement("span");
    closeBtn.className = "close-btn";
    closeBtn.innerHTML = "&times;";
    popup.appendChild(closeBtn);

    // The featured post link URL
    const featuredPostLink = "https://bcaexamprep.blogspot.com/2024/07/blog1-career-options-after-bca-guide.html";

    // Function to determine if the popup should be shown based on probability
    function showPopupWithProbability(chance) {
        return Math.random() < chance;
    }

    // Check if the current page URL matches the featured post link to avoid showing the popup on the featured post page
    const currentPageURL = window.location.href;
    if (currentPageURL === featuredPostLink) return;  // Exit if on the featured post page

    // Check if the popup was closed in this session
    const popupClosed = sessionStorage.getItem('popupClosed');

    // Initial probability for showing the popup
    let probability = 0.3;

    // If the popup has been closed, reduce the probability for the rest of the session
    if (popupClosed) {
        probability = 0.1; // Lowered probability after close
    }

    // Show the popup based on the adjusted probability
    if (showPopupWithProbability(probability)) {
        popup.classList.add("active");
    }

    // Close the popup when the close button is clicked and set the session flag
    closeBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent the popup click event
        popup.classList.remove("active");
        sessionStorage.setItem('popupClosed', 'true'); // Set flag that popup was closed
    });

    // Make the entire Featured Post div clickable and link to the featured post
    popup.addEventListener("click", function () {
        window.location.href = featuredPostLink;
    });
});
