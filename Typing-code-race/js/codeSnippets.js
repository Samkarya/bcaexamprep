const codeSnippets = [
    {
        code: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        language: 'javascript'
    },
    {
        code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
        language: 'python'
    },
    {
        code: `class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }

    append(data) {
        if (!this.head) {
            this.head = new Node(data);
            return;
        }
        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = new Node(data);
    }
}`,
        language: 'javascript'
    }
];

function getRandomCodeSnippet() {
    return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
}

function applySyntaxHighlighting(code, language) {
    // This is a simple syntax highlighting function
    // You may want to use a more robust solution like Prism.js for production
    const keywords = {
        'javascript': ['function', 'return', 'if', 'class', 'constructor', 'let', 'const', 'while'],
        'python': ['def', 'return', 'if', 'for', 'in', 'len']
    };

    const highlighted = code.replace(/\b(\w+)\b/g, (match) => {
        if (keywords[language] && keywords[language].includes(match)) {
            return `<span class="keyword">${match}</span>`;
        }
        if (match.startsWith('function') || match.startsWith('def')) {
            return `<span class="function">${match}</span>`;
        }
        return match;
    });

    return highlighted
        .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>')
        .replace(/(\d+)/g, '<span class="number">$&</span>')
        .replace(/(\/\/.*)/g, '<span class="comment">$&</span>')
        .replace(/(#.*)/g, '<span class="comment">$&</span>');
}
