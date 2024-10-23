import { defaultPrograms } from 'https://samkarya.github.io/bcaexamprep/javaprograms/programs.js';

// Initialize program data from localStorage or use defaults
let programData = JSON.parse(localStorage.getItem('programs')) || defaultPrograms;

// Program Management
function createProgram(program) {
    const template = document.getElementById('programTemplate');
    const clone = template.content.cloneNode(true);
    
    const container = clone.querySelector('.program-container');
    container.dataset.id = program.id;
    
    const title = clone.querySelector('.program-title');
    title.value = program.title;
    
    const codeArea = clone.querySelector('[data-type="code"]');
    const outputArea = clone.querySelector('[data-type="output"]');
    
    codeArea.value = program.code;
    outputArea.value = program.output;
    
    // Initialize line numbers
    updateLineNumbers(codeArea);
    updateLineNumbers(outputArea);
    
    // Add event listeners
    title.addEventListener('change', () => savePrograms());
    codeArea.addEventListener('input', function() {
        updateLineNumbers(this);
        savePrograms();
    });
    outputArea.addEventListener('input', function() {
        updateLineNumbers(this);
        savePrograms();
    });
    
    return clone;
}

function renderPrograms() {
    const container = document.getElementById('programsContainer');
    container.innerHTML = '';
    programData.programs.forEach(program => {
        container.appendChild(createProgram(program));
    });
    
    // Apply current theme
    applyTheme(document.getElementById('themeSelect').value);
}

export function addNewProgram() {
    const newId = Math.max(0, ...programData.programs.map(p => p.id)) + 1;
    const newProgram = {
        id: newId,
        title: `Program ${newId}`,
        code: "// Enter your code here",
        output: "// Output will appear here"
    };
    
    programData.programs.push(newProgram);
    renderPrograms();
    savePrograms();
}

// Utility Functions
export function savePrograms() {
    const containers = document.querySelectorAll('.program-container');
    programData.programs = Array.from(containers).map(container => ({
        id: parseInt(container.dataset.id),
        title: container.querySelector('.program-title').value,
        code: container.querySelector('[data-type="code"]').value,
        output: container.querySelector('[data-type="output"]').value
    }));
    
    localStorage.setItem('programs', JSON.stringify(programData));
    showToast('Changes saved successfully');
}

export function deleteProgram(button) {
    if (confirm('Are you sure you want to delete this program?')) {
        const container = button.closest('.program-container');
        const id = parseInt(container.dataset.id);
        programData.programs = programData.programs.filter(p => p.id !== id);
        renderPrograms();
        savePrograms();
    }
}

export function copyCode(button) {
    const container = button.closest('.code-section');
    const code = container.querySelector('.code-area').value;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Code copied to clipboard');
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 100);
}

export function preparePrint() {
    // Update print metadata
    document.getElementById('printDate').textContent = new Date().toLocaleString();
    document.getElementById('programCount').textContent = programData.programs.length;
    
    // Remove focus from any active element
    document.activeElement.blur();
    
    // Add print styles dynamically
    const printStyle = document.createElement('style');
    printStyle.textContent = `
        @media print {
            body > *:not(.page-container) {
                display: none !important;
            }
            .page-container {
                display: block !important;
            }
        }
    `;
    document.head.appendChild(printStyle);
    
    // Print the page
    window.print();
    
    // Remove the print styles after printing
    setTimeout(() => {
        printStyle.remove();
    }, 100);
}
// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    renderPrograms();
    
    // Add CSS for toast notifications
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            opacity: 0;
            transform: translateY(100%);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});

// Add resize observer for line numbers
const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        if (entry.target.classList.contains('code-area')) {
            updateLineNumbers(entry.target);
        }
    }
});

document.querySelectorAll('.code-area').forEach(area => {
    resizeObserver.observe(area);
});
