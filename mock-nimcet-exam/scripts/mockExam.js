// Constants and State
const COUNTDOWN_DURATION = 5; // seconds
let examStartTime;
let questionStartTimes = [];
let questionEndTimes = [];
let selectedYear = '';
let isFullScreen = false;

// Utility Functions
function getTimeDifference(start, end) {
    return Math.round((end - start) / 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Exam Setup Functions
function showYearSelector() {
    const overlay = document.createElement('div');
    overlay.id = 'yearSelector';
    overlay.innerHTML = `
        <h2>Select Exam Year</h2>
        <select id="yearSelect">
            <option value="2024">2024</option>
            <option value="2023">2023</option>
        </select>
        <button id="startExam">Start Exam</button>
    `;
    document.getElementById('exam-container').appendChild(overlay);

    document.getElementById('startExam').addEventListener('click', () => {
        selectedYear = document.getElementById('yearSelect').value;
        overlay.remove();
        requestFullScreen();
        startCountdown();
    });
}

function requestFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
    isFullScreen = true;
}

function startCountdown() {
    let countdown = COUNTDOWN_DURATION;
    const overlay = document.createElement('div');
    overlay.id = 'countdown';
    overlay.innerHTML = `<h2>Exam starts in ${countdown}</h2>`;
    document.getElementById('exam-container').appendChild(overlay);

    const countdownInterval = setInterval(() => {
        countdown--;
        overlay.innerHTML = `<h2>Exam starts in ${countdown}</h2>`;
        if (countdown === 0) {
            clearInterval(countdownInterval);
            overlay.remove();
            startExam();
        }
    }, 1000);
}

function startExam() {
    examStartTime = new Date();
    fetchAndExtractData().then(questions => {
        initializeExam(questions);
    });
}

// Main Exam Functions
function initializeExam(questions) {
    let currentQuestion = 0;
    const totalQuestions = questions.length;
    let timeLeft = totalQuestions * 60;
    const userAnswers = new Array(totalQuestions).fill(null);
    const markedQuestions = new Array(totalQuestions).fill(false);

    // Initialize question timing arrays
    questionStartTimes = new Array(totalQuestions).fill(null);
    questionEndTimes = new Array(totalQuestions).fill(null);

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft > 0) {
            timeLeft--;
            setTimeout(updateTimer, 1000);
        } else {
            submitExam();
        }
    }

    function displayQuestion(index) {
        if (questionStartTimes[index] === null) {
            questionStartTimes[index] = new Date();
        }
        if (index > 0 && questionEndTimes[index - 1] === null) {
            questionEndTimes[index - 1] = new Date();
        }

        const question = questions[index];
        const questionContainer = document.getElementById('questionContainer');
        questionContainer.innerHTML = `
            <h2 class="question">Question ${index + 1}: ${question.question}</h2>
            <div class="options">
                ${question.options.map((option, i) => `
                    <div class="option${userAnswers[index] === i ? ' selected' : ''}" data-index="${i}" data-letter="${String.fromCharCode(65 + i)}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;

        questionContainer.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => {
                userAnswers[currentQuestion] = parseInt(option.dataset.index);
                updateNavigatorBox(currentQuestion);
                updateSummary();
                displayQuestion(currentQuestion);
            });
        });

        document.getElementById('markBtn').textContent = markedQuestions[currentQuestion] ? 'Unmark for Review' : 'Mark for Review';
    }

    function createNavigator() {
        const navigatorGrid = document.querySelector('.navigator-grid');
        for (let i = 0; i < totalQuestions; i++) {
            const box = document.createElement('div');
            box.className = 'question-box unattempted';
            box.textContent = i + 1;
            box.addEventListener('click', () => {
                currentQuestion = i;
                displayQuestion(currentQuestion);
            });
            navigatorGrid.appendChild(box);
        }
    }

    function updateNavigatorBox(index) {
        const box = document.querySelector('.navigator-grid').children[index];
        if (markedQuestions[index]) {
            box.className = 'question-box marked';
        } else if (userAnswers[index] !== null) {
            box.className = 'question-box attempted';
        } else {
            box.className = 'question-box unattempted';
        }
    }

    function updateSummary() {
        const attempted = userAnswers.filter(answer => answer !== null).length;
        const marked = markedQuestions.filter(Boolean).length;
        const unattempted = totalQuestions - attempted;

        document.getElementById('attemptedQuestions').textContent = attempted;
        document.getElementById('markedQuestions').textContent = marked;
        document.getElementById('unattemptedQuestions').textContent = unattempted;

        const progress = (attempted / totalQuestions) * 100;
        document.querySelector('.progress').style.width = `${progress}%`;
    }

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            displayQuestion(currentQuestion);
        }
        MathJax.typeset();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentQuestion < totalQuestions - 1) {
            currentQuestion++;
            displayQuestion(currentQuestion);
        } else {
            const confirm = window.confirm('You have reached the end of the exam. Do you want to submit?');
            if (confirm) {
                submitExam();
            }
        }
        MathJax.typeset();

    });

    document.getElementById('markBtn').addEventListener('click', () => {
        markedQuestions[currentQuestion] = !markedQuestions[currentQuestion];
        updateNavigatorBox(currentQuestion);
        updateSummary();
        displayQuestion(currentQuestion);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            document.getElementById('prevBtn').click();
        } else if (e.key === 'ArrowRight') {
            document.getElementById('nextBtn').click();
        } else if (e.key >= '1' && e.key <= '4') {
            const optionIndex = e.key - 1;
            const options = document.querySelectorAll('.option');
            if (options[optionIndex]) {
                options[optionIndex].click();
            }
        }
    });

    function submitExam() {
        questionEndTimes[currentQuestion] = new Date();
        showResultScreen(questions, userAnswers);
    }

    // Initialize
    updateTimer();
    createNavigator();
    displayQuestion(currentQuestion);
    updateSummary();

    // Add event listener for beforeunload
    window.addEventListener('beforeunload', (e) => {
        if (isFullScreen) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Constants
const ITEMS_PER_PAGE = 10;

function showResultScreen(questions, userAnswers) {
    const examEndTime = new Date();
    const totalTimeTaken = getTimeDifference(examStartTime, examEndTime);
    const correctAnswers = questions.reduce((sum, question, index) => 
        sum + (parseInt(question.answer) - 1 === userAnswers[index] ? 1 : 0), 0);
    const score = (correctAnswers / questions.length) * 100;

    // Show animation overlay
    const overlay = document.createElement('div');
    overlay.id = 'animationOverlay';
    overlay.innerHTML = `
        <div class="animation-content">
            <div class="loader"></div>
            <h2>Analyzing your performance...</h2>
        </div>
    `;
    document.getElementById('exam-container').appendChild(overlay);

    // Simulate analysis time
    setTimeout(() => {
        overlay.remove();
        displayResultContent();
    }, 3000); // 3 seconds animation

    function displayResultContent() {
        const resultHTML = `
            <div id="resultScreen">
                <h1>NIMCET Mock Exam Results</h1>
                <div class="result-summary">
                    <p>Total Time Taken: ${formatTime(totalTimeTaken)}</p>
                    <p>Final Score: ${score.toFixed(2)}%</p>
                    <p>Correct Answers: ${correctAnswers} / ${questions.length}</p>
                </div>
                <button id="showAnalysisBtn">Show Question Analysis</button>
                <div id="analysisContainer" style="display: none;">
                    <h2>Question Analysis</h2>
                    <div id="resultTableContainer"></div>
                    <div id="paginationContainer"></div>
                </div>
                <button id="saveResult">Save Result</button>
            </div>
        `;

        document.getElementById('exam-container').innerHTML = resultHTML;

        let currentPage = 1;
        const ITEMS_PER_PAGE = 10;

        document.getElementById('showAnalysisBtn').addEventListener('click', function() {
            const analysisContainer = document.getElementById('analysisContainer');
            if (analysisContainer.style.display === 'none') {
                analysisContainer.style.display = 'block';
                this.textContent = 'Hide Question Analysis';
                updateResultScreen();
            } else {
                analysisContainer.style.display = 'none';
                this.textContent = 'Show Question Analysis';
            }
        });

        function updateResultScreen() {
            const resultTableContainer = document.getElementById('resultTableContainer');
            resultTableContainer.innerHTML = renderResultTable(currentPage);

            const paginationContainer = document.getElementById('paginationContainer');
            paginationContainer.innerHTML = renderPagination();

            // Add event listeners to pagination buttons
            document.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentPage = parseInt(btn.dataset.page);
                    updateResultScreen();
                });
            });

            document.getElementById('prevPage').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateResultScreen();
                }
            });

            document.getElementById('nextPage').addEventListener('click', () => {
                if (currentPage < Math.ceil(questions.length / ITEMS_PER_PAGE)) {
                    currentPage++;
                    updateResultScreen();
                }
            });
        }

        function renderResultTable(page) {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const pageQuestions = questions.slice(startIndex, endIndex);

            return `
                <table>
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Your Answer</th>
                            <th>Correct Answer</th>
                            <th>Time Taken</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageQuestions.map((question, index) => `
                            <tr>
                                <td>${startIndex + index + 1}</td>
                                <td>${userAnswers[startIndex + index] !== null ? String.fromCharCode(65 + userAnswers[startIndex + index]) : 'Not Answered'}</td>
                                <td>${String.fromCharCode(64 + parseInt(question.answer))}</td>
                                <td>${formatTime(getTimeDifference(questionStartTimes[startIndex + index], questionEndTimes[startIndex + index]))}</td>
                                <td>${parseInt(question.answer) - 1 === userAnswers[startIndex + index] ? 'Correct' : 'Incorrect'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        function renderPagination() {
            const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
            let paginationHTML = '';

            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }

            return `
                <div class="pagination">
                    <button id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                    ${paginationHTML}
                    <button id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
                </div>
            `;
        }

        document.getElementById('saveResult').addEventListener('click', () => {
            const resultData = {
                date: new Date().toISOString(),
                year: selectedYear,
                score: score,
                totalTimeTaken: totalTimeTaken,
                correctAnswers: correctAnswers,
                totalQuestions: questions.length,
                questionAnalysis: questions.map((question, index) => ({
                    questionNumber: index + 1,
                    userAnswer: userAnswers[index],
                    correctAnswer: parseInt(question.answer) - 1,
                    timeTaken: getTimeDifference(questionStartTimes[index], questionEndTimes[index]),
                    isCorrect: parseInt(question.answer) - 1 === userAnswers[index]
                }))
            };

            localStorage.setItem('examResult', JSON.stringify(resultData));
            alert('Result saved successfully!');
        });
    }
}

// Data Fetching Function
function fetchAndExtractData() {
    const urls = [
        'https://samkarya.github.io/bcaexamprep/mock-nimcet-exam/data/nimcet-math.json',
        'https://samkarya.github.io/bcaexamprep/mock-nimcet-exam/data/nimcet-analytics.json',
        'https://samkarya.github.io/bcaexamprep/mock-nimcet-exam/data/nimcet-computer.json',
        'https://samkarya.github.io/bcaexamprep/mock-nimcet-exam/data/nimcet-general.json',
    ];

    const fetchPromises = urls.map(url => 
        fetch(url)
            .then(res => res.json())
            .then(data => data.year[selectedYear] || [])
            .catch(error => {
                console.error('Error parsing the JSON from', url, ':', error);
                return [];
            })
    );

    return Promise.all(fetchPromises)
        .then(results => results.flat())
        .catch(error => {
            console.error('Error fetching the JSON:', error);
            return [];
        });
}

// Initialize the exam process
document.addEventListener('DOMContentLoaded', showYearSelector);
