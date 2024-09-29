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
updateInteractiveMCQButton();

function toggleInteractiveMCQs() {
    interactiveEnabled = !interactiveEnabled;
    localStorage.setItem("interactiveMCQs", interactiveEnabled);
    updateInteractiveMCQButton();
    if (interactiveEnabled) {
        enableInteractiveMCQs();
    } else {
        disableInteractiveMCQs();
    }
}
 function updateInteractiveMCQButton() {
      interactiveMCQButton.textContent = interactiveEnabled ? "Deactivate Interactive MCQs" : "Activate Interactive MCQs";
  }
// Function to enable interactive MCQs
function enableInteractiveMCQs() {
    document.querySelectorAll(".question-box").forEach((questionBox, questionIndex) => {
        const answersList = questionBox.querySelector('ol[type="A"]');
        if (answersList) {
            const listItems = answersList.getElementsByTagName("li");
            
            for (let i = 0; i < listItems.length; i++) {
                const choiceText = listItems[i].textContent.trim();
                
                const label = document.createElement("label");
                label.style.cursor = "pointer";

                const radioInput = document.createElement("input");
                radioInput.type = "radio";
                radioInput.name = "answerOption" + questionIndex;
                radioInput.value = i;
                label.appendChild(radioInput);

                const choiceLabel = document.createElement("span");
                choiceLabel.textContent = choiceText;
                label.appendChild(choiceLabel);

                listItems[i].innerHTML = "";
                listItems[i].appendChild(label);
            }

            // Extract the correct answer
            const correctAnswer = questionBox.querySelector(".answer details p i").textContent.trim().charCodeAt(16) - "A".charCodeAt(0);
            
            // Set up event listeners for answer checking
            questionBox.querySelectorAll('input[name="answerOption' + questionIndex + '"]').forEach(input => {
                input.addEventListener("change", () => {
                    const isCorrect = input.value == correctAnswer;
                    questionBox.classList.toggle("correct-answer", isCorrect);
                    questionBox.classList.toggle("incorrect-answer", !isCorrect);
                    checkAllCorrect();
                });
            });
        }
    });
}

// Function to disable interactive MCQs
function disableInteractiveMCQs() {
    document.querySelectorAll(".question-box").forEach(questionBox => {
        const answersList = questionBox.querySelector('ol[type="A"]');
        if (answersList) {
            const listItems = answersList.getElementsByTagName("li");
            for (let listItem of listItems) {
                const label = listItem.querySelector("label");
                if (label) {
                    listItem.textContent = label.textContent.trim();
                }
            }
            questionBox.classList.remove("correct-answer", "incorrect-answer");
        }
    });
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
