const themes = {
    'default': {
        background: '#ffffff',
        text: '#2e3440',
        lineNumbers: '#636b74',
        lineNumbersBg: '#f8f9fa',
        selectionBg: '#e3e8ef',
        comment: '#808080',
        keyword: '#0000ff',
        string: '#a31515',
        number: '#098658',
        operator: '#000000',
    },
    'vscode-dark': {
        background: '#1e1e1e',
        text: '#d4d4d4',
        lineNumbers: '#858585',
        lineNumbersBg: '#252526',
        selectionBg: '#264f78',
        comment: '#6A9955',
        keyword: '#569CD6',
        string: '#CE9178',
        number: '#B5CEA8',
        operator: '#D4D4D4',
    },
    'word-light': {
        background: '#ffffff',
        text: '#333333',
        lineNumbers: '#999999',
        lineNumbersBg: '#fafafa',
        selectionBg: '#e6f1ff',
        comment: '#008000',
        keyword: '#0070c1',
        string: '#a31515',
        number: '#098658',
        operator: '#000000',
    },
    'material': {
        background: '#263238',
        text: '#eeffff',
        lineNumbers: '#546e7a',
        lineNumbersBg: '#202b31',
        selectionBg: '#80cbc4',
        comment: '#546e7a',
        keyword: '#c792ea',
        string: '#c3e88d',
        number: '#f78c6c',
        operator: '#89ddff',
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName];
    const themeTargets = document.querySelectorAll('.theme-target');
    
    themeTargets.forEach(target => {
        const codeArea = target.querySelector('.code-area');
        const lineNumbers = target.querySelector('.line-numbers');
        
        // Apply theme styles
        target.style.backgroundColor = theme.background;
        codeArea.style.color = theme.text;
        codeArea.style.backgroundColor = theme.background;
        
        lineNumbers.style.color = theme.lineNumbers;
        lineNumbers.style.backgroundColor = theme.lineNumbersBg;
        
        // Apply syntax highlighting classes
        if (codeArea.dataset.type === 'code') {
            applySyntaxHighlighting(codeArea, theme);
        }
    });
}

function applySyntaxHighlighting(element, theme) {
    // Add syntax highlighting logic here
    // This is a simplified version - you might want to use a proper syntax highlighting library
    const text = element.value;
    const keywords = ['class', 'public', 'static', 'void', 'main', 'String'];
    
    let highlightedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlightedText = highlightedText.replace(
            regex,
            `<span style="color: ${theme.keyword}">${keyword}</span>`
        );
    });
    
    // Add more syntax highlighting rules as needed
    return highlightedText;
}

// Update line numbers
function updateLineNumbers(textarea) {
    const lineNumbers = textarea.parentElement.querySelector('.line-numbers');
    const lines = textarea.value.split('\n').length;
    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1)
        .map(num => `<div class="line-number">${num}</div>`)
        .join('');
}