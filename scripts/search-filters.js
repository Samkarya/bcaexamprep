// Function to apply search filters
function applyFilters() {
    // Get the search query and filter values
    var searchQuery = document.getElementById('search-query').value.trim();
    var subjectFilter = document.getElementById('subject-filter').value;
    // Uncomment the lines below if additional filters are used
    // var unitFilter = document.getElementById('unit-filter').value;
    // var semesterFilter = document.getElementById('semester-filter').value;
    var otherFilter = document.getElementById('other-filter').value;

    // Create an array of filters and remove empty (falsey) values
    var filters = [subjectFilter, otherFilter].filter(Boolean);

    // Join the filters with a plus sign (+) for the search URL
    var filterString = filters.join('+');
    var searchUrl = 'https://bcaexamprep.blogspot.com/search/label/' + encodeURIComponent(filterString);

    // If there is a search query, append it to the URL
    if (searchQuery) {
        searchUrl += '%20' + encodeURIComponent(searchQuery); // Use %20 for space
    }

    // Redirect to the search URL with applied filters and query
    window.location.href = searchUrl;
}
