const defaultPrograms = {
    "programs": [
        {
            "id": 1,
            "title": "Welcome Message Program",
            "code": `//program to display a welcome message
class WelcomeMessage {
    public static void main(String[] args) {
        System.out.println("Welcome to Java Programming!"); //prints welcome message
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac WelcomeMessage.java
c:/users/user/samkarya/javaprograms> java WelcomeMessage
Welcome to Java Programming!`
        },
        {
            "id": 2,
            "title": "Command Line Arguments Program",
            "code": `//program to demonstrate command line arguments
class CommandLineDemo {
    public static void main(String[] args) {
        System.out.println("Number of command line arguments: " + args.length); //prints number of arguments
        for (int i = 0; i < args.length; i++) {
            System.out.println("Argument " + (i + 1) + ": " + args[i]); //prints each argument
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac CommandLineDemo.java
c:/users/user/samkarya/javaprograms> java CommandLineDemo arg1 arg2 arg3
Number of command line arguments: 3
Argument 1: arg1
Argument 2: arg2
Argument 3: arg3`
        },
        {
            "id": 3,
            "title": "Armstrong Number Program",
            "code": `//program to check if a number is an Armstrong number
import java.util.Scanner;

class ArmstrongNumber {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int number = scanner.nextInt();
        int originalNumber = number, result = 0, remainder;

        while (originalNumber != 0) {
            remainder = originalNumber % 10;
            result += Math.pow(remainder, 3);
            originalNumber /= 10;
        }

        if (result == number)
            System.out.println(number + " is an Armstrong number.");
        else
            System.out.println(number + " is not an Armstrong number.");
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac ArmstrongNumber.java
c:/users/user/samkarya/javaprograms> java ArmstrongNumber
Enter a number: 153
153 is an Armstrong number.`
        },
        {
            "id": 4,
            "title": "Prime Number Program",
            "code": `//program to check if a number is prime
import java.util.Scanner;

class PrimeNumber {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int number = scanner.nextInt();
        boolean isPrime = true;

        if (number <= 1) {
            isPrime = false;
        } else {
            for (int i = 2; i <= number / 2; i++) {
                if (number % i == 0) {
                    isPrime = false;
                    break;
                }
            }
        }

        if (isPrime)
            System.out.println(number + " is a prime number.");
        else
            System.out.println(number + " is not a prime number.");
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac PrimeNumber.java
c:/users/user/samkarya/javaprograms> java PrimeNumber
Enter a number: 17
17 is a prime number.`
        },
        {
            "id": 5,
            "title": "Prime Numbers Between Intervals Program",
            "code": `//program to display prime numbers between intervals
import java.util.Scanner;

class PrimeNumbersInInterval {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the lower bound: ");
        int lower = scanner.nextInt();
        System.out.print("Enter the upper bound: ");
        int upper = scanner.nextInt();

        for (int number = lower; number <= upper; number++) {
            boolean isPrime = true;

            if (number <= 1) {
                continue;
            }

            for (int i = 2; i <= number / 2; i++) {
                if (number % i == 0) {
                    isPrime = false;
                    break;
                }
            }

            if (isPrime) {
                System.out.println(number + " is a prime number.");
            }
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac PrimeNumbersInInterval.java
c:/users/user/samkarya/javaprograms> java PrimeNumbersInInterval
Enter the lower bound: 10
Enter the upper bound: 20
11 is a prime number.
13 is a prime number.
17 is a prime number.
19 is a prime number.`
        },
        {
            "id": 6,
            "title": "LCM of Two Numbers Program",
            "code": `//program to find LCM of two numbers
import java.util.Scanner;

class LCMCalculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the first number: ");
        int num1 = scanner.nextInt();
        System.out.print("Enter the second number: ");
        int num2 = scanner.nextInt();

        int lcm = (num1 > num2) ? num1 : num2;

        while (true) {
            if (lcm % num1 == 0 && lcm % num2 == 0) {
                System.out.println("LCM of " + num1 + " and " + num2 + " is " + lcm);
                break;
            }
            ++lcm;
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac LCMCalculator.java
c:/users/user/samkarya/javaprograms> java LCMCalculator
Enter the first number: 12
Enter the second number: 18
LCM of 12 and 18 is 36`
        },
        {
            "id": 7,
            "title": "Factorial Program Using Recursion",
            "code": `//program to print factorial of a number using recursion
import java.util.Scanner;

class FactorialRecursion {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int number = scanner.nextInt();
        System.out.println("Factorial of " + number + " is: " + factorial(number));
    }

    public static int factorial(int n) {
        if (n == 0) {
            return 1;
        } else {
            return n * factorial(n - 1);
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac FactorialRecursion.java
c:/users/user/samkarya/javaprograms> java FactorialRecursion
Enter a number: 5
Factorial of 5 is: 120`
        },
        {
            "id": 8,
            "title": "GCD Program Using Recursion",
            "code": `//program to find GCD of two numbers using recursion
import java.util.Scanner;

class GCDRecursion {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter first number: ");
        int num1 = scanner.nextInt();
        System.out.print("Enter second number: ");
        int num2 = scanner.nextInt();
        System.out.println("GCD of " + num1 + " and " + num2 + " is: " + gcd(num1, num2));
    }

    public static int gcd(int a, int b) {
        if (b == 0) {
            return a;
        } else {
            return gcd(b, a % b);
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac GCDRecursion.java
c:/users/user/samkarya/javaprograms> java GCDRecursion
Enter first number: 54
Enter second number: 24
GCD of 54 and 24 is: 6`
        },
        {
            "id": 9,
            "title": "Constructor Overloading Program",
            "code": `//program to illustrate constructor overloading
class Box {
    double width, height, depth;

    // constructor with no parameters
    Box() {
        width = height = depth = 0;
    }

    // constructor with one parameter
    Box(double len) {
        width = height = depth = len;
    }

    // constructor with three parameters
    Box(double w, double h, double d) {
        width = w;
        height = h;
        depth = d;
    }

    // method to calculate volume
    double volume() {
        return width * height * depth;
    }
}

class ConstructorOverloading {
    public static void main(String[] args) {
        Box box1 = new Box(); // using no-parameter constructor
        Box box2 = new Box(5); // using single-parameter constructor
        Box box3 = new Box(3, 4, 5); // using three-parameter constructor

        System.out.println("Volume of box1: " + box1.volume());
        System.out.println("Volume of box2: " + box2.volume());
        System.out.println("Volume of box3: " + box3.volume());
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac ConstructorOverloading.java
c:/users/user/samkarya/javaprograms> java ConstructorOverloading
Volume of box1: 0.0
Volume of box2: 125.0
Volume of box3: 60.0`
        },
        {
            "id": 10,
            "title": "Scanner Demonstration Program",
            "code": `//program to demonstrate the use of Scanner (I/O streams)
import java.util.Scanner;

class ScannerDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = scanner.nextLine();

        System.out.print("Enter your age: ");
        int age = scanner.nextInt();

        System.out.print("Enter your favorite number: ");
        double favoriteNumber = scanner.nextDouble();

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Favorite Number: " + favoriteNumber);
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac ScannerDemo.java
c:/users/user/samkarya/javaprograms> java ScannerDemo
Enter your name: John
Enter your age: 25
Enter your favorite number: 7.5
Name: John
Age: 25
Favorite Number: 7.5`
        },
        {
            "id": 11,
            "title": "Array Demonstration Program",
            "code": `//program to demonstrate the use of arrays in Java
class ArrayDemo {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5}; // declare and initialize an array
        System.out.println("Elements of the array are: ");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Element at index " + i + ": " + numbers[i]); // print each element
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac ArrayDemo.java
c:/users/user/samkarya/javaprograms> java ArrayDemo
Elements of the array are:
Element at index 0: 1
Element at index 1: 2
Element at index 2: 3
Element at index 3: 4
Element at index 4: 5`
        },
        {
            "id": 12,
            "title": "Smallest, Greatest, and Average of Array",
            "code": `//program to find smallest, greatest number and average of 10 numbers entered by user
import java.util.Scanner;

class ArrayStats {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int[] numbers = new int[10];
        int sum = 0, min, max;

        System.out.println("Enter 10 numbers:");
        for (int i = 0; i < 10; i++) {
            numbers[i] = scanner.nextInt();
            sum += numbers[i];
        }

        min = max = numbers[0];
        for (int i = 1; i < numbers.length; i++) {
            if (numbers[i] < min) {
                min = numbers[i];
            }
            if (numbers[i] > max) {
                max = numbers[i];
            }
        }

        double average = sum / 10.0;
        System.out.println("Smallest number: " + min);
        System.out.println("Greatest number: " + max);
        System.out.println("Average: " + average);
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac ArrayStats.java
c:/users/user/samkarya/javaprograms> java ArrayStats
Enter 10 numbers:
5
10
15
2
25
8
30
1
18
6
Smallest number: 1
Greatest number: 30
Average: 12.0`
        },
        {
            "id": 13,
            "title": "Sum of Series Program",
            "code": `//program to find the sum of the series S = a^2 + a^2 / 2 + a^2 / 3 + ... + a^2 / 10
import java.util.Scanner;

class SeriesSum {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the value of a: ");
        double a = scanner.nextDouble();
        double sum = 0;
        double aSquared = a * a;

        for (int i = 1; i <= 10; i++) {
            sum += aSquared / i;
        }

        System.out.println("Sum of the series is: " + sum);
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac SeriesSum.java
c:/users/user/samkarya/javaprograms> java SeriesSum
Enter the value of a: 3
Sum of the series is: 23.55`
        },
        {
            "id": 14,
            "title": "Reverse Number and Difference Program",
            "code": `//program to reverse a number and find the absolute difference between original and reversed number
import java.util.Scanner;

class ReverseNumber {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int originalNumber = scanner.nextInt();
        int reversedNumber = 0;
        int temp = originalNumber;

        while (temp != 0) {
            int remainder = temp % 10;
            reversedNumber = reversedNumber * 10 + remainder;
            temp /= 10;
        }

        int difference = Math.abs(originalNumber - reversedNumber);
        System.out.println("Reversed number: " + reversedNumber);
        System.out.println("Absolute difference: " + difference);
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac ReverseNumber.java
c:/users/user/samkarya/javaprograms> java ReverseNumber
Enter a number: 1234
Reversed number: 4321
Absolute difference: 3087`
        },
        {
            "id": 15,
            "title": "Simple Calculator Using Switch Case",
            "code": `//program to create a simple calculator using switch case
import java.util.Scanner;

class SimpleCalculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter first number: ");
        double num1 = scanner.nextDouble();
        System.out.print("Enter second number: ");
        double num2 = scanner.nextDouble();
        System.out.print("Choose an operation (+, -, *, /): ");
        char operator = scanner.next().charAt(0);

        double result;
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 != 0) {
                    result = num1 / num2;
                } else {
                    System.out.println("Error! Division by zero.");
                    return;
                }
                break;
            default:
                System.out.println("Invalid operator!");
                return;
        }

        System.out.println("The result is: " + result);
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac SimpleCalculator.java
c:/users/user/samkarya/javaprograms> java SimpleCalculator
Enter first number: 10
Enter second number: 5
Choose an operation (+, -, *, /): *
The result is: 50.0`
        },
        {
            "id": 16,
            "title": "Vowel Frequency Finder",
            "code": `//program to find the frequency of vowels in a given string
import java.util.Scanner;

class VowelFrequency {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a string: ");
        String input = scanner.nextLine().toLowerCase();

        int aCount = 0, eCount = 0, iCount = 0, oCount = 0, uCount = 0;

        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);
            switch (ch) {
                case 'a': aCount++; break;
                case 'e': eCount++; break;
                case 'i': iCount++; break;
                case 'o': oCount++; break;
                case 'u': uCount++; break;
            }
        }

        System.out.println("Vowel Frequencies:");
        System.out.println("a: " + aCount);
        System.out.println("e: " + eCount);
        System.out.println("i: " + iCount);
        System.out.println("o: " + oCount);
        System.out.println("u: " + uCount);
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac VowelFrequency.java
c:/users/user/samkarya/javaprograms> java VowelFrequency
Enter a string: Hello Universe
Vowel Frequencies:
a: 0
e: 3
i: 1
o: 1
u: 2`
        },
        {
            "id": 17,
            "title": "Lexicographical Order Sorter",
            "code": `//program to sort given strings in lexicographical order
import java.util.Scanner;
import java.util.Arrays;

class LexicographicalSort {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the number of strings: ");
        int n = scanner.nextInt();
        scanner.nextLine();  // consume the leftover newline

        String[] strings = new String[n];
        System.out.println("Enter the strings:");
        for (int i = 0; i < n; i++) {
            strings[i] = scanner.nextLine();
        }

        Arrays.sort(strings); // sort in lexicographical order

        System.out.println("Strings in lexicographical order:");
        for (String str : strings) {
            System.out.println(str);
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac LexicographicalSort.java
c:/users/user/samkarya/javaprograms> java LexicographicalSort
Enter the number of strings: 3
Enter the strings:
banana
apple
cherry
Strings in lexicographical order:
apple
banana
cherry`
        },
        {
            "id": 18,
            "title": "Matrix Multiplication Program",
            "code": `//program to find the multiplication of two matrices
import java.util.Scanner;

class MatrixMultiplication {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the number of rows and columns of the first matrix: ");
        int r1 = scanner.nextInt();
        int c1 = scanner.nextInt();
        int[][] matrix1 = new int[r1][c1];

        System.out.print("Enter the number of rows and columns of the second matrix: ");
        int r2 = scanner.nextInt();
        int c2 = scanner.nextInt();
        if (c1 != r2) {
            System.out.println("Matrix multiplication is not possible.");
            return;
        }
        int[][] matrix2 = new int[r2][c2];
        int[][] result = new int[r1][c2];

        System.out.println("Enter the elements of the first matrix:");
        for (int i = 0; i < r1; i++) {
            for (int j = 0; j < c1; j++) {
                matrix1[i][j] = scanner.nextInt();
            }
        }

        System.out.println("Enter the elements of the second matrix:");
        for (int i = 0; i < r2; i++) {
            for (int j = 0; j < c2; j++) {
                matrix2[i][j] = scanner.nextInt();
            }
        }

        // multiply the matrices
        for (int i = 0; i < r1; i++) {
            for (int j = 0; j < c2; j++) {
                for (int k = 0; k < c1; k++) {
                    result[i][j] += matrix1[i][k] * matrix2[k][j];
                }
            }
        }

        System.out.println("The resulting matrix is:");
        for (int i = 0; i < r1; i++) {
            for (int j = 0; j < c2; j++) {
                System.out.print(result[i][j] + " ");
            }
            System.out.println();
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac MatrixMultiplication.java
c:/users/user/samkarya/javaprograms> java MatrixMultiplication
Enter the number of rows and columns of the first matrix: 2 3
Enter the number of rows and columns of the second matrix: 3 2
Enter the elements of the first matrix:
1 2 3
4 5 6
Enter the elements of the second matrix:
7 8
9 10
11 12
The resulting matrix is:
58 64 
139 154`
        },
        {
            "id": 19,
            "title": "Quadratic Equation Solver",
            "code": `//program to find real solutions to the quadratic equation ax^2 + bx + c = 0
import java.util.Scanner;

class QuadraticEquationSolver {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter the coefficient a: ");
        double a = scanner.nextDouble();
        System.out.print("Enter the coefficient b: ");
        double b = scanner.nextDouble();
        System.out.print("Enter the constant c: ");
        double c = scanner.nextDouble();

        double discriminant = (b * b) - (4 * a * c);
        
        if (discriminant > 0) {
            double root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            double root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            System.out.println("The roots are real and different.");
            System.out.println("Root 1: " + root1);
            System.out.println("Root 2: " + root2);
        } else if (discriminant == 0) {
            double root = -b / (2 * a);
            System.out.println("The roots are real and equal.");
            System.out.println("Root: " + root);
        } else {
            System.out.println("There are no real solutions.");
        }
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac QuadraticEquationSolver.java
c:/users/user/samkarya/javaprograms> java QuadraticEquationSolver
Enter the coefficient a: 1
Enter the coefficient b: -3
Enter the constant c: 2
The roots are real and different.
Root 1: 2.0
Root 2: 1.0`
        },
        {
            "id": 20,
            "title": "Fibonacci Sequence with Recursive and Non-recursive Methods",
            "code": `//program to print the nth Fibonacci number using both recursive and non-recursive methods
import java.util.Scanner;

class Fibonacci {
    // Recursive method to find nth Fibonacci number
    public static int fibonacciRecursive(int n) {
        if (n <= 1) {
            return n;
        } else {
            return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
        }
    }

    // Non-recursive method to find nth Fibonacci number
    public static int fibonacciNonRecursive(int n) {
        if (n <= 1) {
            return n;
        }
        int fib = 1;
        int prevFib = 0;
        for (int i = 2; i <= n; i++) {
            int temp = fib;
            fib += prevFib;
            prevFib = temp;
        }
        return fib;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the value of n: ");
        int n = scanner.nextInt();

        // Using recursive function
        int recursiveFib = fibonacciRecursive(n);
        System.out.println("Fibonacci number using recursion: " + recursiveFib);

        // Using non-recursive function
        int nonRecursiveFib = fibonacciNonRecursive(n);
        System.out.println("Fibonacci number using non-recursion: " + nonRecursiveFib);
    }
}`,
            "output": `c:/users/user/samkarya/javaprograms> javac Fibonacci.java
c:/users/user/samkarya/javaprograms> java Fibonacci
Enter the value of n: 7
Fibonacci number using recursion: 13
Fibonacci number using non-recursion: 13`
        }
    ]
};
