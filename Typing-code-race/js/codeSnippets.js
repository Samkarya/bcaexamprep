const codeSnippets = [
    {
        code: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);`,
        language: 'javascript',
        description: 'Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem. It breaks down a complex problem into simpler sub-problems, with a base case to stop the recursive calls. Recursion is widely used in algorithms for problems like tree traversal, factorial computation, and dynamic programming. While elegant, recursive solutions can be less efficient than iterative ones in terms of space due to the use of the call stack.'
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
        description: 'QuickSort is a fast, divide-and-conquer sorting algorithm that works by selecting a pivot element from the array and partitioning the other elements into two groups—those less than the pivot and those greater than the pivot. The process is recursively applied to both groups, leading to a sorted array. QuickSort has an average-case time complexity of O(n log n) but can degrade to O(n²) in the worst case if the pivot selection is poor.'
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
        description: 'A linked list is a linear data structure where elements, called nodes, are connected by pointers. Each node contains two parts: the data and a reference to the next node in the sequence. Unlike arrays, linked lists allow for efficient insertion and deletion of elements without the need to shift other elements. There are different types of linked lists, including singly linked lists, doubly linked lists, and circular linked lists, each varying in how they connect the nodes.'
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
        description: 'Binary search is an efficient algorithm used to find the position of a target value within a sorted array. It works by repeatedly dividing the search interval in half, comparing the target with the middle element of the array. If the target matches the middle element, the search is complete. Otherwise, the search continues in the half where the target could possibly exist. Binary search operates in O(log n) time complexity, making it faster than linear search for large datasets.'
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
