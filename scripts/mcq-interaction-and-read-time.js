// Function to calculate the reading time
function calculateReadingTime() {
    const postContent = document.querySelector(".post-body.entry-content");
    const readingTimeElem = document.querySelector("#reading-time");
    const clonedContent = postContent.cloneNode(true);
    
    // Remove unnecessary elements
    clonedContent.querySelectorAll(".table-of-content, .disclaimer").forEach(element => element.remove());
    
    // Calculate word count and reading time (assuming 250 words/minute)
    const wordCount = (clonedContent.textContent || clonedContent.innerText).split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 250);
    
    // Update the reading time text
    readingTimeElem.textContent = `${minutes} min read`;
}

// Manage interactive MCQs state using localStorage
let interactiveEnabled = localStorage.getItem("interactiveMCQs") === "true";

// Function to toggle interactive MCQs
function toggleInteractiveMCQs() {
    interactiveEnabled = !interactiveEnabled;
    localStorage.setItem("interactiveMCQs", interactiveEnabled);
    
    const button = document.querySelector(".interactivemcq-button");
    if (button) {
        button.textContent = interactiveEnabled ? "Deactivate Interactive MCQs" : "Activate Interactive MCQs";
        button.setAttribute('aria-pressed', interactiveEnabled);
    }
    
    interactiveEnabled ? enableInteractiveMCQs() : disableInteractiveMCQs();
}

// Function to create styled radio input
function createStyledRadio() {
    const radioContainer = document.createElement("div");
    radioContainer.className = "custom-radio";
    
    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    
    const radioMark = document.createElement("span");
    radioMark.className = "radio-mark";
    
    radioContainer.appendChild(radioInput);
    radioContainer.appendChild(radioMark);
    
    return { radioContainer, radioInput };
}

// Function to enable interactive MCQs
function enableInteractiveMCQs() {
    document.querySelectorAll(".question-box").forEach((questionBox, questionIndex) => {
        const answersList = questionBox.querySelector('ol[type="A"]');
        if (!answersList) return;

        const listItems = answersList.getElementsByTagName("li");
        
        // Extract the correct answer
        const answerElement = questionBox.querySelector(".answer details p i");
        if (!answerElement) return;
        
        const correctAnswer = answerElement.textContent.trim().charCodeAt(16) - "A".charCodeAt(0);
        
        Array.from(listItems).forEach((listItem, index) => {
            const choiceText = listItem.textContent.trim();
            
            // Clear existing content
            listItem.innerHTML = '';
            
            // Create new elements
            const { radioContainer, radioInput } = createStyledRadio();
            radioInput.name = `answerOption${questionIndex}`;
            radioInput.value = index;
            
            const choiceLabel = document.createElement("span");
            choiceLabel.className = "choice-text";
            choiceLabel.textContent = choiceText;
            
            // Append elements
            listItem.appendChild(radioContainer);
            listItem.appendChild(choiceLabel);
            
            // Make entire li clickable
            listItem.addEventListener("click", (e) => {
                if (e.target !== radioInput) {
                    radioInput.checked = true;
                    radioInput.dispatchEvent(new Event('change'));
                }
            });
            
            // Add answer checking logic
            radioInput.addEventListener("change", () => {
                const isCorrect = index === correctAnswer;
                questionBox.className = 'question-box ' + (isCorrect ? 'correct-answer' : 'incorrect-answer');                
                checkAllCorrect();
            });
        });
    });
}

// Function to disable interactive MCQs
function disableInteractiveMCQs() {
    document.querySelectorAll(".question-box").forEach(questionBox => {
        const answersList = questionBox.querySelector('ol[type="A"]');
        if (!answersList) return;

        const listItems = answersList.getElementsByTagName("li");
        
        Array.from(listItems).forEach(listItem => {
            const choiceText = listItem.querySelector('.choice-text')?.textContent || 
                              listItem.textContent.trim();
            listItem.innerHTML = choiceText;
        });
}
                                                       }                                

// Function to check if all MCQs are answered correctly
function checkAllCorrect() {
    const allQuestions = document.querySelectorAll(".question-box");
    let allCorrect = true;

    allQuestions.forEach(question => {
        if (!question.classList.contains("correct-answer")) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        triggerConfetti();
    }
}

// Function to trigger confetti animation
function triggerConfetti() {
    confetti({ particleCount: 200, spread: 120, startVelocity: 30, origin: { y: 0.6 } });
    
    setTimeout(() => confetti({ particleCount: 100, spread: 100, startVelocity: 50, origin: { y: 0.3 } }), 500);
    setTimeout(() => confetti({ particleCount: 150, spread: 150, startVelocity: 20, origin: { y: 0.8 } }), 1000);
    setTimeout(() => confetti({ particleCount: 50, spread: 80, startVelocity: 40, origin: { y: 0.4 } }), 1500);
    setTimeout(() => confetti({ particleCount: 200, spread: 180, startVelocity: 60, origin: { y: 0.2 } }), 2000);
}
