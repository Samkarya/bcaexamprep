/**
 * Modern Blog Functionality
 * Features:
 * - Reading time calculator
 * - Reading progress bar
 * - Reveal content on scroll
 * - AI-generated summary (simulated)
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all blog features
  initReadingTime();
  initReadingProgressBar();
  initScrollReveal();
  generateAISummary();
});

/**
 * Calculate and display reading time for blog post
 */
function initReadingTime() {
  const content = document.querySelector('.blog-post-content');
  const readingTimeElement = document.querySelector('.reading-time');
  
  if (!content || !readingTimeElement) return;
  
  // Count words in the content
  const text = content.textContent || content.innerText;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  // Average reading speed: 200-250 words per minute
  const readingSpeed = 225;
  const readingTimeMinutes = Math.ceil(wordCount / readingSpeed);
  
  // Update the reading time element
  readingTimeElement.innerHTML = `<i class="far fa-clock"></i> ${readingTimeMinutes} min read`;
}

/**
 * Initialize reading progress bar
 */
function initReadingProgressBar() {
  // Create progress bar container if it doesn't exist
  if (!document.querySelector('.reading-progress-container')) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
  }
  
  // Update progress bar on scroll
  window.addEventListener('scroll', updateReadingProgress);
}

/**
 * Update reading progress bar width based on scroll position
 */
function updateReadingProgress() {
  const content = document.querySelector('.blog-post-content');
  const progressBar = document.querySelector('.reading-progress-bar');
  
  if (!content || !progressBar) return;
  
  const contentBox = content.getBoundingClientRect();
  const contentHeight = contentBox.height;
  const contentTop = contentBox.top;
  const windowHeight = window.innerHeight;
  
  // Calculate how much of the content has been read
  let progress;
  
  if (contentTop >= 0) {
    // Content hasn't started being read yet
    progress = 0;
  } else if (contentTop <= -contentHeight + windowHeight) {
    // Content has been fully read
    progress = 100;
  } else {
    // Content is being read
    progress = (-contentTop / (contentHeight - windowHeight)) * 100;
  }
  
  // Update progress bar width
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

/**
 * Reveal content elements as they scroll into view
 */
function initScrollReveal() {
  const elements = document.querySelectorAll('.blog-post-content > *');
  
  if (!elements.length) return;
  
  // Set initial state
  elements.forEach((element, index) => {
    // Stagger the animation delay for a more natural effect
    const delay = index * 0.05;
    element.style.transitionDelay = `${delay}s`;
  });
  
  // Create an observer for scroll reveal
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stop observing once the element is visible
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });
  
  // Observe each element
  elements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Generate a simulated AI summary of the blog post
 */
function generateAISummary() {
  const container = document.querySelector('.blog-ai-summary-content');
  const title = document.querySelector('.post-title.entry-title');
  const content = document.querySelector('.blog-post-content');
  
  if (!container || !title || !content) return;
  
  // Extract first two paragraphs for simulation
  const paragraphs = content.querySelectorAll('p');
  let summaryText = '';
  
  if (paragraphs.length >= 2) {
    summaryText = paragraphs[0].textContent.trim();
    
    // Truncate if too long
    if (summaryText.length > 200) {
      summaryText = summaryText.substring(0, 200).trim() + '...';
    }
  } else if (paragraphs.length === 1) {
    summaryText = paragraphs[0].textContent.trim();
    
    if (summaryText.length > 200) {
      summaryText = summaryText.substring(0, 200).trim() + '...';
    }
  } else {
    // Fallback text if no paragraphs found
    summaryText = "This article discusses " + title.textContent.trim() + ". Read on to learn more.";
  }
  
  // Add a prefix to make it feel AI-generated
  const aiPrefixes = [
    "This article explores ",
    "The author discusses ",
    "Key takeaways include ",
    "In this post, you'll learn about ",
    "The main focus of this article is "
  ];
  
  const randomPrefix = aiPrefixes[Math.floor(Math.random() * aiPrefixes.length)];
  container.textContent = randomPrefix + summaryText.replace(/^This article/i, '').replace(/^the author/i, '');
}


/**
 * Utility: Properly format a date for blog display
 * @param {Date|string} date - The date to format
 * @return {string} Formatted date string
 */
function formatBlogDate(date) {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString(undefined, options);
}

/**
 * Handle image load failures with fallback
 */
function handleImageErrors() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.addEventListener('error', function() {
      this.src = 'https://via.placeholder.com/800x450?text=Image+Not+Found';
      this.alt = 'Image could not be loaded';
    });
  });
}

// Call this function to handle image errors
handleImageErrors();