const codeSnippets = [
    {
        code: 
"def fibonacci(n):\n\tif n <= 0:\n\t\treturn 0\n\telif n == 1:\n\t\treturn 1\n\telse:\n\t\treturn fibonacci(n-1) + fibonacci(n-2)\n\n# Calculate Fibonacci for n = 7\nresult = fibonacci(7)\0",
        language: 'python',
        description: 
"Fibonacci sequence is a popular\nsequence in mathematics. The\nfunction recursively calculates\neach term as the sum of the previous\ntwo terms. The base cases handle\n0 and 1. It can be optimized using\ndynamic programming. This approach,\nthough simple, becomes slow for\nlarge inputs because of repeated\ncalculations of the same\nsub-problems.\0"
    },
    {
        code: 
"public class Palindrome {\n\tpublic static boolean isPalindrome(String s) {\n\t\tint i = 0, j = s.length() - 1;\n\t\twhile (i < j) {\n\t\t\tif (s.charAt(i) != s.charAt(j))\n\t\t\t\treturn false;\n\t\t\ti++;\n\t\t\tj--;\n\t\t}\n\t\treturn true;\n\t}\n\n\tpublic static void main(String[] args) {\n\t\tString str = \"madam\";\n\t\tSystem.out.println(isPalindrome(str));\n\t}\n}\0",
        language: 'java',
        description: 
"A palindrome is a word or phrase\nthat reads the same backward as\nforward. The method checks each\ncharacter from both ends of the\nstring and returns false if a\nmismatch is found. Otherwise,\nthe loop terminates when the middle\nis reached, confirming it is a\npalindrome. It's a linear-time\nsolution with O(n) complexity.\0"
    },
    {
        code: 
"#include<stdio.h>\n\nint factorial(int n) {\n\tif (n == 0)\n\t\treturn 1;\n\telse\n\t\treturn n * factorial(n-1);\n}\n\nint main() {\n\tint num = 6;\n\tprintf(\"Factorial of %d is %d\\n\", num, factorial(num));\n\treturn 0;\n}\0",
        language: 'c',
        description: 
"The factorial function calculates\nthe product of an integer and all\nthe integers below it. This code\nuses recursion to compute the\nfactorial. A base case of 0 is\nhandled, returning 1. Recursion is\nwidely used but can lead to\nperformance problems for large\nnumbers due to stack overflow risks.\0"
    },
    {
        code: 
"#include<iostream>\nusing namespace std;\n\nint main() {\n\tint n, sum = 0;\n\tcout << \"Enter a positive integer: \";\n\tcin >> n;\n\tfor (int i = 1; i <= n; ++i) {\n\t\tsum += i;\n\t}\n\tcout << \"Sum = \" << sum << endl;\n\treturn 0;\n}\0",
        language: 'cpp',
        description: 
"This C++ program calculates the\nsum of the first n positive\nintegers using a for loop. The\nuser inputs a value for n, and the\nprogram iterates from 1 to n,\naccumulating the sum. The time\ncomplexity is O(n), as the loop\nexecutes n times. It demonstrates\nthe use of loops and basic I/O in C++.\0"
    },
    {
        code: 
"def binary_search(arr, x):\n\tlow = 0\n\thigh = len(arr) - 1\n\twhile low <= high:\n\t\tmid = (low + high) // 2\n\t\tif arr[mid] == x:\n\t\t\treturn mid\n\t\telif arr[mid] < x:\n\t\t\tlow = mid + 1\n\t\telse:\n\t\t\thigh = mid - 1\n\treturn -1\n\n# Binary Search Example\nresult = binary_search([1, 3, 5, 7, 9], 7)\0",
        language: 'python',
        description: 
"Binary search is an efficient search\nalgorithm for sorted arrays. The\nalgorithm repeatedly divides the\nsearch range in half, checking the\nmiddle element and adjusting the\nrange based on comparisons. This\nmethod operates in logarithmic time,\nO(log n), making it faster than\nlinear search for large datasets.\0"
    },
    {
        code: 
"public class BubbleSort {\n\tpublic static void bubbleSort(int[] arr) {\n\t\tint n = arr.length;\n\t\tfor (int i = 0; i < n-1; i++) {\n\t\t\tfor (int j = 0; n-i-1 > j; j++) {\n\t\t\t\tif (arr[j] > arr[j+1]) {\n\t\t\t\t\tint temp = arr[j];\n\t\t\t\t\tarr[j] = arr[j+1];\n\t\t\t\t\tarr[j+1] = temp;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\n\tpublic static void main(String[] args) {\n\t\tint[] arr = {64, 34, 25, 12, 22};\n\t\tbubbleSort(arr);\n\t\tfor (int i = 0; i < arr.length; i++)\n\t\t\tSystem.out.print(arr[i] + \" \");\n\t}\n}\0",
        language: 'java',
        description: 
"Bubble Sort is a simple\ncomparison-based sorting algorithm\nthat repeatedly steps through the\nlist, compares adjacent elements,\nand swaps them if they are in the\nwrong order. It has a time complexity\nof O(n^2) in the worst case, which\nmakes it inefficient for large datasets.\0"
    },
    {
        code: 
"#include<stdio.h>\n\nint gcd(int a, int b) {\n\tif (b == 0)\n\t\treturn a;\n\telse\n\t\treturn gcd(b, a % b);\n}\n\nint main() {\n\tint a = 56, b = 98;\n\tprintf(\"GCD of %d and %d is %d\\n\", a, b, gcd(a, b));\n\treturn 0;\n}\0",
        language: 'c',
        description: 
"The greatest common divisor (GCD)\nof two integers is the largest\ninteger that divides both without\nleaving a remainder. This\nimplementation uses the Euclidean\nalgorithm, which recursively\ncalculates the GCD by dividing\nthe larger number by the smaller\none and taking the remainder until\nzero is reached.\0"
    },
    {
        code: 
"#include<iostream>\nusing namespace std;\n\nvoid quickSort(int arr[], int low, int high) {\n\tif (low < high) {\n\t\tint pi = partition(arr, low, high);\n\t\tquickSort(arr, low, pi - 1);\n\t\tquickSort(arr, pi + 1, high);\n\t}\n}\n\nint partition(int arr[], int low, int high) {\n\tint pivot = arr[high];\n\tint i = (low - 1);\n\tfor (int j = low; j <= high - 1; j++) {\n\t\tif (arr[j] < pivot) {\n\t\t\ti++;\n\t\t\tswap(arr[i], arr[j]);\n\t\t}\n\t}\n\tswap(arr[i + 1], arr[high]);\n\treturn (i + 1);\n}\n\nint main() {\n\tint arr[] = {10, 7, 8, 9, 1, 5};\n\tint n = sizeof(arr)/sizeof(arr[0]);\n\tquickSort(arr, 0, n-1);\n\tcout << \"Sorted array: \\n\";\n\tfor (int i = 0; i < n; i++)\n\t\tcout << arr[i] << \" \";\n\treturn 0;\n}\0",
        language: 'cpp',
        description: 
"QuickSort is a divide-and-conquer\nalgorithm that selects a pivot\nelement from the array and\npartitions the other elements into\ntwo sub-arrays according to whether\nthey are less than or greater than\nthe pivot. The sub-arrays are then\nsorted recursively. QuickSort has an\naverage-case time complexity of\nO(n log n).\0"
    },
    {
        code: 
"def merge_sort(arr):\n\tif len(arr) > 1:\n\t\tmid = len(arr) // 2\n\t\tL = arr[:mid]\n\t\tR = arr[mid:]\n\t\tmerge_sort(L)\n\t\tmerge_sort(R)\n\t\ti = j = k = 0\n\t\twhile i < len(L) and j < len(R):\n\t\t\tif L[i] < R[j]:\n\t\t\t\tarr[k] = L[i]\n\t\t\t\ti += 1\n\t\t\telse:\n\t\t\t\tarr[k] = R[j]\n\t\t\t\tj += 1\n\t\t\tk += 1\n\t\twhile i < len(L):\n\t\t\tarr[k] = L[i]\n\t\t\ti += 1\n\t\t\tk += 1\n\t\twhile j < len(R):\n\t\t\tarr[k] = R[j]\n\t\t\tj += 1\n\t\t\tk += 1\n\narr = [12, 11, 13, 5, 6, 7]\nmerge_sort(arr)\nprint(arr)\0",
        language: 'python',
        description: 
"Merge Sort is a stable, comparison-based\nsorting algorithm. It divides the array\ninto halves, recursively sorts each half,\nand then merges the two sorted halves.\nIt has a time complexity of O(n log n),\nwhich makes it efficient for large\ndatasets compared to simpler sorting\nalgorithms like Bubble Sort.\0"
    },
    {
        code: 
"public class BinaryTree {\n\tclass Node {\n\t\tint key;\n\t\tNode left, right;\n\t\tpublic Node(int item) {\n\t\t\tkey = item;\n\t\t\tleft = right = null;\n\t\t}\n\t}\n\n\tNode root;\n\n\tBinaryTree() {\n\t\troot = null;\n\t}\n\n\tvoid insert(int key) {\n\t\troot = insertRec(root, key);\n\t}\n\n\tNode insertRec(Node root, int key) {\n\t\tif (root == null) {\n\t\t\troot = new Node(key);\n\t\t\treturn root;\n\t\t}\n\t\tif (key < root.key)\n\t\t\troot.left = insertRec(root.left, key);\n\t\telse if (key > root.key)\n\t\t\troot.right = insertRec(root.right, key);\n\t\treturn root;\n\t}\n\n\tpublic static void main(String[] args) {\n\t\tBinaryTree tree = new BinaryTree();\n\t\ttree.insert(50);\n\t\ttree.insert(30);\n\t\ttree.insert(20);\n\t\ttree.insert(40);\n\t\ttree.insert(70);\n\t\ttree.insert(60);\n\t\ttree.insert(80);\n\t}\n}\0",
        language: 'java',
        description: 
"A binary tree is a hierarchical\ndata structure in which each node\nhas at most two children. This code\ndefines a binary tree and provides\nan insert method to add nodes in\nthe correct position. The tree\nensures that left children are\nsmaller, and right children are\nlarger than the root.\0"
    }
];



function getRandomCodeSnippet() {
    return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
}

