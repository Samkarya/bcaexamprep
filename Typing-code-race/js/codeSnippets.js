const codeSnippets = [
    {
        code: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);`,
        language: 'javascript',
        description: 'Recursive implementation of the Fibonacci sequence. This algorithm showcases the power of recursion but has exponential time complexity O(2^n).'
    },
    {
        code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quick_sort(numbers)`,
        language: 'python',
        description: 'QuickSort implementation using Python list comprehensions. This efficient sorting algorithm has an average time complexity of O(n log n).'
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
}

// Create a new linked list
const list = new LinkedList();
list.append(10);
list.append(20);`,
        language: 'javascript',
        description: 'Implementation of a singly linked list data structure. Linked lists are fundamental in computer science, offering dynamic memory allocation and O(1) insertion at the beginning.'
    },
    {
        code: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}

// Example usage
const sortedArray = [1, 3, 5, 7, 9, 11, 13];
const index = binarySearch(sortedArray, 7);`,
        language: 'javascript',
        description: 'Binary search implementation for finding elements in a sorted array. This algorithm has a time complexity of O(log n), making it highly efficient for large datasets.'
    }
];

function getRandomCodeSnippet() {
    return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
}

function applySyntaxHighlighting(code, language) {
    const keywords = {
        'javascript': ['function', 'return', 'if', 'class', 'constructor', 'let', 'const', 'while', 'else', 'new'],
        'python': ['def', 'return', 'if', 'for', 'in', 'len', 'while']
    };
    
    const operators = {
        'javascript': ['+', '-', '*', '/', '=', '==', '===', '<=', '>=', '=>'],
        'python': ['+', '-', '*', '/', '=', '==', '<=', '>=', ':']
    };

    let highlighted = code;

    // Highlight strings first
    highlighted = highlighted.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');

    // Highlight comments
    if (language === 'javascript') {
        highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$&</span>');
    } else if (language === 'python') {
        highlighted = highlighted.replace(/(#.*$)/gm, '<span class="comment">$&</span>');
    }

    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$&</span>');

    // Highlight keywords
    const keywordRegex = new RegExp(`\\b(${keywords[language].join('|')})\\b`, 'g');
    highlighted = highlighted.replace(keywordRegex, '<span class="keyword">$&</span>');

    // Highlight operators
    const operatorRegex = new RegExp(operators[language].map(op => 
        op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    highlighted = highlighted.replace(operatorRegex, '<span class="operator">$&</span>');

    // Highlight function declarations
    if (language === 'javascript') {
        highlighted = highlighted.replace(/\b(function\s+)(\w+)/g, '$1<span class="function">$2</span>');
    } else if (language === 'python') {
        highlighted = highlighted.replace(/\b(def\s+)(\w+)/g, '$1<span class="function">$2</span>');
    }

    return highlighted;
}
