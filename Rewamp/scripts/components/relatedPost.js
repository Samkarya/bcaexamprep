// Function to get current post labels
function getCurrentPostLabels() {
    const labelsContainer = document.querySelector('.post-labels');
    if (!labelsContainer) return [];
    
    const labelLinks = labelsContainer.querySelectorAll('a');
    return Array.from(labelLinks).map(link => {
      return {
        name: link.textContent.trim(),
        url: link.getAttribute('href')
      };
    });
  }
  
  // Function to extract post information from feed entries
  function extractPostInfo(entry) {
    // Extract title
    const title = entry.querySelector('title').textContent;
    
    // Extract link
    const link = entry.querySelector('link[rel="alternate"]').getAttribute('href');
    
    // Extract published date
    const published = new Date(entry.querySelector('published').textContent);
    const formattedDate = published.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Extract labels/categories
    const categoryElements = entry.querySelectorAll('category');
    const categories = Array.from(categoryElements).map(cat => {
      return {
        name: cat.getAttribute('term'),
        url: `https://bcaexamprep.blogspot.com/search/label/${encodeURIComponent(cat.getAttribute('term'))}`
      };
    });
    
    // Extract first image (if any)
    let thumbnailUrl = '';
    const content = entry.querySelector('content').textContent;
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      thumbnailUrl = imgMatch[1];
      
      // Resize the image URL for thumbnail (if it's a Blogger image)
      if (thumbnailUrl.includes('blogger.googleusercontent.com/img')) {
        thumbnailUrl = thumbnailUrl.replace(/\/s\d+(-c)?\//, '/s320-c/');
      }
    } else {
      // Default image if no image found
      thumbnailUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj136IFa2gX3JX6cA0ijcmNnwdj8oFkr8f6q5OvlTdyo_2bXRDTZRAws9S_8_tej96VC7eSoPyIk7aiIhEy044IgkPcbUJxp6-OEblINbs9KdlRGcVq8kywuYDYlc1R9eAPiX_b2ayK-YJaN9ucbI71FxiEk-ozF-t1MdtqmDxLnwCaaOo9pjQLJZtRKmIv/s320/macintosh.jfif';
    }
    
    return {
      title,
      link,
      published: formattedDate,
      categories,
      thumbnailUrl
    };
  }
  
  // Function to calculate relevance score based on matching labels
  function calculateRelevance(postLabels, currentPostLabels) {
    let score = 0;
    const currentLabelNames = currentPostLabels.map(label => label.name);
    
    postLabels.forEach(label => {
      if (currentLabelNames.includes(label.name)) {
        score++;
      }
    });
    
    return score;
  }
  
  // Function to render related posts
  function renderRelatedPosts(relatedPosts) {
    const container = document.getElementById('related-posts-container');
    container.innerHTML = '';
    
    if (relatedPosts.length === 0) {
      container.innerHTML = '<div class="no-related-posts">No related posts found.</div>';
      return;
    }
    
    relatedPosts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'related-post-card';
      
      let labelsHtml = '';
      // Only show up to 3 labels to avoid clutter
      const displayLabels = post.categories.slice(0, 3);
      displayLabels.forEach(label => {
        labelsHtml += `<span class="related-post-label">${label.name}</span>`;
      });
      
      postElement.innerHTML = `
        <a href="${post.link}" title="${post.title}">
          <img src="${post.thumbnailUrl}" alt="${post.title}" class="related-post-image" onerror="this.src='https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj136IFa2gX3JX6cA0ijcmNnwdj8oFkr8f6q5OvlTdyo_2bXRDTZRAws9S_8_tej96VC7eSoPyIk7aiIhEy044IgkPcbUJxp6-OEblINbs9KdlRGcVq8kywuYDYlc1R9eAPiX_b2ayK-YJaN9ucbI71FxiEk-ozF-t1MdtqmDxLnwCaaOo9pjQLJZtRKmIv/s320/macintosh.jfif'">
        </a>
        <div class="related-post-content">
          <a href="${post.link}" title="${post.title}">
            <h4 class="related-post-title">${post.title}</h4>
          </a>
          <div class="related-post-meta">${post.published}</div>
          <div class="related-post-labels">${labelsHtml}</div>
        </div>
      `;
      
      container.appendChild(postElement);
    });
  }
  
  // Main function to fetch and display related posts
  function fetchRelatedPosts() {
    const currentPostLabels = getCurrentPostLabels();
    const currentPostUrl = window.location.href;
    
    if (currentPostLabels.length === 0) {
      const container = document.getElementById('related-posts-container');
      container.innerHTML = '<div class="no-related-posts">No labels found to determine related posts.</div>';
      return;
    }
    
    // Fetch the feed
    fetch('https://bcaexamprep.blogspot.com/feeds/posts/default?alt=json')
      .then(response => response.json())
      .then(data => {
        const entries = data.feed.entry || [];
        const posts = [];
        
        // Process each entry
        entries.forEach(entry => {
          const links = entry.link || [];
          const postLink = links.find(link => link.rel === "alternate")?.href || "";
          
          // Skip the current post
          if (postLink === currentPostUrl) return;
          
          const postInfo = {
            title: entry.title.$t,
            link: postLink,
            published: new Date(entry.published.$t).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            categories: (entry.category || []).map(cat => ({
              name: cat.term,
              url: `https://bcaexamprep.blogspot.com/search/label/${encodeURIComponent(cat.term)}`
            })),
            thumbnailUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj136IFa2gX3JX6cA0ijcmNnwdj8oFkr8f6q5OvlTdyo_2bXRDTZRAws9S_8_tej96VC7eSoPyIk7aiIhEy044IgkPcbUJxp6-OEblINbs9KdlRGcVq8kywuYDYlc1R9eAPiX_b2ayK-YJaN9ucbI71FxiEk-ozF-t1MdtqmDxLnwCaaOo9pjQLJZtRKmIv/s320/macintosh.jfif'
          };
          
          // Try to find a thumbnail
          if (entry.media$thumbnail) {
            postInfo.thumbnailUrl = entry.media$thumbnail.url.replace(/\/s\d+(-c)?\//, '/s320-c/');
          } else if (entry.content && entry.content.$t) {
            const imgMatch = entry.content.$t.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch && imgMatch[1]) {
              postInfo.thumbnailUrl = imgMatch[1].replace(/\/s\d+(-c)?\//, '/s320-c/');
            }
          }
          
          // Calculate relevance score
          postInfo.relevance = calculateRelevance(postInfo.categories, currentPostLabels);
          
          // Only include posts with at least one matching label
          if (postInfo.relevance > 0) {
            posts.push(postInfo);
          }
        });
        
        // Sort by relevance (higher score first)
        posts.sort((a, b) => b.relevance - a.relevance);
        
        // Display up to 4 related posts
        renderRelatedPosts(posts.slice(0, 4));
      })
      .catch(error => {
        console.error('Error fetching related posts:', error);
        const container = document.getElementById('related-posts-container');
        container.innerHTML = '<div class="no-related-posts">Error loading related posts. Please try again later.</div>';
      });
  }
  
  // Run the function when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', fetchRelatedPosts);