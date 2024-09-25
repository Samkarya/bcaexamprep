document.addEventListener('DOMContentLoaded', function() {
    var disclaimerDiv = document.querySelector(".disclaimer");

    if (disclaimerDiv && disclaimerDiv.textContent.trim() === "") {
        disclaimerDiv.innerHTML = '<strong>Disclaimer:</strong>This article is tailored to address the specific audience of BCA (Bachelor of Computer Applications) graduates or a focus on BCA-related topics. Therefore, statistics, eligibility criteria, and other details are provided with BCA graduates in mind. These details may vary for other groups or in different contexts. Please consider this when interpreting the information provided.';
    }

    function toggleDisplay(element, displayStyle) {
        element.style.display = (element.style.display === displayStyle) ? 'none' : displayStyle;
    }

    document.getElementById('menu-toggle').addEventListener('click', function() {
        toggleDisplay(document.getElementById('menu'), 'flex');
    });

    document.getElementById('menu-close').addEventListener('click', function() {
        document.getElementById('menu').style.display = 'none';
    });

    document.getElementById('search-toggle').addEventListener('click', function() {
        toggleDisplay(document.getElementById('search-widget'), 'block');
    });

    document.getElementById('filter-toggle').addEventListener('click', function() {
        toggleDisplay(document.getElementById('filter-widget'), 'contents');
    });
});
