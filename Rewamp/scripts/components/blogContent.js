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
  const postMeta = document.querySelector('.post-meta');

  if (!content || !postMeta) return;

  // Count words in the content
  const text = content.textContent || content.innerText;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Average reading speed: 220 words per minute
  const readingSpeed = 220;
  const readingTimeMinutes = Math.ceil(wordCount / readingSpeed);

  // Check if reading time element already exists
  let readingTimeElement = postMeta.querySelector('.reading-time');

  if (!readingTimeElement) {
    // Create the reading time div and append it
    readingTimeElement = document.createElement('div');
    readingTimeElement.className = 'blog-post-meta-item reading-time';

    const icon = document.createElement('i');
    icon.className = 'far fa-clock';

    const timeText = document.createElement('span');
    timeText.textContent = `${readingTimeMinutes} min read`;

    readingTimeElement.appendChild(icon);
    readingTimeElement.appendChild(timeText);

    postMeta.appendChild(readingTimeElement);
  } else {
    // Update existing reading time
    const timeText = readingTimeElement.querySelector('span');
    if (timeText) {
      timeText.textContent = `${readingTimeMinutes} min read`;
    }
  }
}


/**
 * Initialize reading progress bar
 * Improved to ensure proper positioning
 */
function initReadingProgressBar() {
  // Create progress bar container if it doesn't exist
  if (!document.querySelector('.reading-progress-container')) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    
    progressContainer.appendChild(progressBar);
    document.body.insertAdjacentElement('afterbegin', progressContainer);
    
    // Add some basic styling if not already in CSS
    progressContainer.style.position = 'fixed';
    progressContainer.style.top = '0';
    progressContainer.style.left = '0';
    progressContainer.style.width = '100%';
    progressContainer.style.height = '4px';
    progressContainer.style.zIndex = '1000';
    progressContainer.style.backgroundColor = 'transparent';
    
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#0088cc';
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 0.2s ease-out';
  }
  
  // Update progress bar on scroll
  window.addEventListener('scroll', updateReadingProgress);
  
  // Initial update
  updateReadingProgress();
}

/**
 * Update reading progress bar width based on scroll 
 */
function updateReadingProgress() {
  const content = document.querySelector('.blog-post-content');
  const progressBar = document.querySelector('.reading-progress-bar');
  
  if (!content || !progressBar) return;
  
  // Get total scrollable distance (document height minus viewport height)
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  // Get current scroll position
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Calculate progress percentage
  const progress = (scrollTop / scrollHeight) * 100;
  
  // Update progress bar width
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}
/**
 * Reveal content elements as they scroll into view
 * Improved to be less disruptive to reading
 */
function initScrollReveal() {
  // Check if we should disable animations (smaller screens, reduced motion preference)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileDevice = window.innerWidth < 768;
  
  // Get all content elements
  const elements = document.querySelectorAll('.blog-post-content > *');
  
  if (!elements.length) return;
  
  // If reduced motion is preferred or it's a mobile device, just make everything visible
  if (prefersReducedMotion || isMobileDevice) {
    elements.forEach(element => {
      element.classList.add('visible');
    });
    return;
  }
  
  // For devices that can handle animations, use a gentler approach
  elements.forEach((element, index) => {
    // Reduce the delay between elements
    const delay = index * 0.03;
    element.style.transitionDelay = `${delay}s`;
    
    // Use a shorter and subtler transition
    element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  });
  
  // Create an observer with a larger threshold for earlier reveals
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px', // Start revealing a bit earlier
    threshold: 0.05 // Require less visibility to trigger
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
      this.src = '';
      this.alt = 'Image could not be loaded';
    });
  });
}

// Call this function to handle image errors
handleImageErrors();