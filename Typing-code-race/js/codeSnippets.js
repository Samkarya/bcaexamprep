const codeSnippets = [
    `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    `const quickSort = (arr) => {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = [], right = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < pivot) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
};`,
    `class Node {
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
}`
];

function getRandomCodeSnippet() {
    return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
}
