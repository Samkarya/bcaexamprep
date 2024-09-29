document.addEventListener('DOMContentLoaded', function() {
    const searchFilterToggle = document.getElementById('filter-toggle');
    const searchFilterPanel = document.getElementById('filter-widget');
    const searchFilterForm = document.getElementById('filter-form');

   

    searchFilterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchQuery = document.getElementById('search-query').value.trim();
      const subjectFilter = document.getElementById('subject-filter').value;
      const contentTypeFilter = document.getElementById('other-filter').value;

      let searchUrl = 'https://bcaexamprep.blogspot.com/search?';
      const params = new URLSearchParams();

      if (searchQuery) {
        params.append('q', searchQuery);
      }

      if (subjectFilter) {
        params.append('label', subjectFilter);
      }

      if (contentTypeFilter) {
        params.append('label', contentTypeFilter);
      }

      window.location.href = searchUrl + params.toString();
    });
  });
