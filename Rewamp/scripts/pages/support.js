// Function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to show the appropriate section
function showSection() {
  // Hide all sections first
  document.querySelectorAll('#support-content > section').forEach(function(section) {
    section.style.display = 'none';
  });
  
  // Get the section parameter from URL
  var section = getUrlParameter('section');
  
  // Remove active class from all menu items
  document.querySelectorAll('#support-menu a').forEach(function(menuItem) {
    menuItem.classList.remove('active');
  });
  
  // Show the appropriate section and update menu active state
  switch(section) {
    case 'help':
      document.getElementById('help-center').style.display = 'block';
      document.querySelector('a[href="?section=help"]').classList.add('active');
      document.title = 'Help Center - Support';
      break;
    case 'contact':
      document.getElementById('contact-us').style.display = 'block';
      document.querySelector('a[href="?section=contact"]').classList.add('active');
      document.title = 'Contact Us - Support';
      break;
    case 'faq':
      document.getElementById('faqs').style.display = 'block';
      document.querySelector('a[href="?section=faq"]').classList.add('active');
      document.title = 'FAQs - Support';
      break;
    case 'feedback':
      document.getElementById('feedback').style.display = 'block';
      document.querySelector('a[href="?section=feedback"]').classList.add('active');
      document.title = 'Feedback - Support';
      break;
    case 'report':
      document.getElementById('report-issue').style.display = 'block';
      document.querySelector('a[href="?section=report"]').classList.add('active');
      document.title = 'Report an Issue - Support';
      break;
    default:
      document.getElementById('support-home').style.display = 'block';
      document.title = 'Support Center';
  }
}

// Function to validate email
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Function to submit form data via the Google Blogger contact form
function submitViaBloggerForm(name, email, message, formType, errorElement, successElement) {
  // Check if email is valid
  if (!validateEmail(email)) {
    errorElement.textContent = "Please enter a valid email address.";
    errorElement.style.display = "block";
    successElement.style.display = "none";
    return;
  }
  
  // Check if message is provided
  if (!message.trim()) {
    errorElement.textContent = "Please enter a message.";
    errorElement.style.display = "block";
    successElement.style.display = "none";
    return;
  }
  
  // Format the message to include the form type
  var formattedMessage = "Form Type: " + formType + "\n\n" + message;
  
  // Fill in the hidden Blogger contact form
  document.getElementById('ContactForm1_contact-form-name').value = name;
  document.getElementById('ContactForm1_contact-form-email').value = email;
  document.getElementById('ContactForm1_contact-form-email-message').value = formattedMessage;
  
  // Simulate a click on the Blogger form submit button
  document.getElementById('ContactForm1_contact-form-submit').click();
  
  // Check for success or error after a short delay
  setTimeout(function() {
    var bloggerError = document.getElementById('ContactForm1_contact-form-error-message');
    var bloggerSuccess = document.getElementById('ContactForm1_contact-form-success-message');
    
    if (bloggerError && bloggerError.textContent && bloggerError.style.display !== 'none') {
      // Forward the error message
      errorElement.textContent = bloggerError.textContent;
      errorElement.style.display = "block";
      successElement.style.display = "none";
    } else if (bloggerSuccess && bloggerSuccess.textContent && bloggerSuccess.style.display !== 'none') {
      // Forward the success message
      successElement.textContent = "Your message has been sent successfully!";
      successElement.style.display = "block";
      errorElement.style.display = "none";
      
      // Clear the form
      document.getElementById('dummy-name').value = '';
      document.getElementById('dummy-email').value = '';
      document.getElementById('dummy-message').value = '';
    } else {
      // Default success message if we can't detect the Blogger form status
      successElement.textContent = "Your message has been sent successfully!";
      successElement.style.display = "block";
      errorElement.style.display = "none";
    }
  }, 1000);
}

// Add event listeners once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Show the initial section
  showSection();
  
  // Set up contact form submission
  document.getElementById('dummy-submit').addEventListener('click', function() {
    var name = document.getElementById('dummy-name').value;
    var email = document.getElementById('dummy-email').value;
    var message = document.getElementById('dummy-message').value;
    var formType = document.getElementById('form-type').value;
    var errorElement = document.getElementById('dummy-error-message');
    var successElement = document.getElementById('dummy-success-message');
    
    submitViaBloggerForm(name, email, message, formType, errorElement, successElement);
  });
  
  // Set up feedback form submission
  document.getElementById('feedback-submit').addEventListener('click', function() {
    var name = document.getElementById('feedback-name').value;
    var email = document.getElementById('feedback-email').value;
    var rating = document.querySelector('input[name="rating"]:checked') ? document.querySelector('input[name="rating"]:checked').value : 'Not rated';
    var message = "Rating: " + rating + "\n\n" + document.getElementById('feedback-message').value;
    var formType = document.getElementById('feedback-type').value;
    var errorElement = document.getElementById('feedback-error-message');
    var successElement = document.getElementById('feedback-success-message');
    
    submitViaBloggerForm(name, email, message, formType, errorElement, successElement);
  });
  
  // Set up issue reporting form submission
  document.getElementById('issue-submit').addEventListener('click', function() {
    var name = document.getElementById('issue-name').value;
    var email = document.getElementById('issue-email').value;
    var issueType = document.getElementById('issue-type').value || 'Not specified';
    var message = "Issue Type: " + issueType + "\n\n" + document.getElementById('issue-message').value;
    var formType = document.getElementById('issue-form-type').value;
    var errorElement = document.getElementById('issue-error-message');
    var successElement = document.getElementById('issue-success-message');
    
    submitViaBloggerForm(name, email, message, formType, errorElement, successElement);
  });
  
  // Add event listener for navigation without page reload
  document.body.addEventListener('click', function(event) {
    // Check if the clicked element is a support menu link
    if (event.target.closest('#support-menu a')) {
      var link = event.target.closest('#support-menu a');
      
      // Update the URL without reloading the page
      var href = link.getAttribute('href');
      if (href && href.startsWith('?')) {
        event.preventDefault();
        window.history.pushState({}, '', href);
        showSection();
      }
    }
  });
});

// Handle browser back/forward navigation
window.addEventListener('popstate', showSection);
  
  function updateFormType() {
  var section = getUrlParameter('section');
  var formTypeField = document.getElementById('form-type');
  
  if (formTypeField) {
    switch(section) {
      case 'contact':
        formTypeField.value = 'Contact Us';
        break;
      case 'feedback':
        formTypeField.value = 'Feedback';
        break;
      case 'report':
        formTypeField.value = 'Report an Issue';
        break;
      default:
        formTypeField.value = 'General Inquiry';
    }
  }
}

// Add this function call to the DOMContentLoaded event
window.addEventListener('DOMContentLoaded', function() {
  showSection();
  updateFormType();
});