// Table of Contents Generator
document.addEventListener('DOMContentLoaded', function() {
  // Select elements
  const contentElement = document.querySelector('.edublog-content');
  const tocElement = document.querySelector('.edublog-toc');
  
  if (!contentElement || !tocElement) return;
  
  // Find all headings in the content
  const headings = contentElement.querySelectorAll('h2, h3, h4');
  
  if (headings.length === 0) {
    tocElement.style.display = 'none';
    return;
  }
  
  // Create TOC container
  const tocTitle = document.createElement('div');
  tocTitle.className = 'edublog-toc-title';
  tocTitle.textContent = 'Table of Contents';
  
  const tocList = document.createElement('ul');
  tocList.className = 'edublog-toc-list';
  
  // Track heading levels for nesting
  const levels = { h2: 0, h3: 1, h4: 2 };
  let prevLevel = 0;
  let listStack = [tocList];
  
  // Process each heading
  headings.forEach((heading, index) => {
    // Add ID to heading if it doesn't have one
    if (!heading.id) {
      heading.id = 'heading-' + index;
    }
    
    const level = levels[heading.tagName.toLowerCase()];
    const item = document.createElement('li');
    item.className = 'edublog-toc-item';
    
    const link = document.createElement('a');
    link.className = 'edublog-toc-link';
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    
    item.appendChild(link);
    
    // Handle nesting
    if (level > prevLevel) {
      // Create a new nested list
      const nestedList = document.createElement('ul');
      nestedList.className = 'edublog-toc-list edublog-toc-nested';
      listStack[listStack.length - 1].lastChild.appendChild(nestedList);
      listStack.push(nestedList);
    } else if (level < prevLevel) {
      // Go back up the stack
      for (let i = 0; i < prevLevel - level; i++) {
        listStack.pop();
      }
    }
    
    // Add item to the current list
    listStack[listStack.length - 1].appendChild(item);
    prevLevel = level;
  });
  
  // Add TOC to the page
  tocElement.appendChild(tocTitle);
  tocElement.appendChild(tocList);
  
  // Add scroll highlighting
  window.addEventListener('scroll', highlightTocOnScroll);
});

// Highlight TOC items on scroll
function highlightTocOnScroll() {
  const headings = Array.from(document.querySelectorAll('.edublog-content h2, .edublog-content h3, .edublog-content h4'));
  if (headings.length === 0) return;
  
  // Get all link elements in TOC
  const tocLinks = document.querySelectorAll('.edublog-toc-link');
  
  // Remove active class from all links
  tocLinks.forEach(link => {
    link.classList.remove('edublog-toc-link-active');
  });
  
  // Find the heading that's currently in view
  let currentHeadingIndex = 0;
  const scrollPosition = window.scrollY + 100; // Offset for better UX
  
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].offsetTop <= scrollPosition) {
      currentHeadingIndex = i;
    } else {
      break;
    }
  }
  
  // Highlight the corresponding TOC link
  const currentHeadingId = headings[currentHeadingIndex].id;
  const activeLink = document.querySelector(`.edublog-toc-link[href="#${currentHeadingId}"]`);
  
  if (activeLink) {
    activeLink.classList.add('edublog-toc-link-active');
  }
}

// Calculate and display reading time
document.addEventListener('DOMContentLoaded', function() {
  const contentElement = document.querySelector('.edublog-content');
  const metaElement = document.querySelector('.edublog-post-meta');
  
  if (!contentElement || !metaElement) return;
  
  // Get all text content
  const text = contentElement.textContent;
  const wordCount = text.split(/\s+/).length;
  
  // Average reading speed: 200-250 words per minute
  const readingTime = Math.ceil(wordCount / 225);
  
  // Create reading time element
  const readTimeElement = document.createElement('div');
  readTimeElement.className = 'edublog-post-read-time';
  
  // Add clock icon
  const icon = document.createElement('span');
  icon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
  
  const texth= document.createElement('span');
  texth.textContent = `${readingTime} min read`;
  
  readTimeElement.appendChild(icon);
  readTimeElement.appendChild(texth);
  
  // Add to meta section
  metaElement.appendChild(readTimeElement);
});

// Smooth scroll for TOC links
document.addEventListener('DOMContentLoaded', function() {
  const tocLinks = document.querySelectorAll('.edublog-toc-link');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    });
  });
});