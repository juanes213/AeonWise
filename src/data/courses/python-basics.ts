export interface Lesson {
  id: string;
  title: string;
  content: string;
  narrationText: string;
  exercise: {
    description: string;
    defaultCode: string;
    solution: string;
    hints: string[];
  };
  estimatedTime: number; // in minutes
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  modules: number;
  category: string;
  lessons: Lesson[];
}

export const pythonBasicsCourse: Course = {
  id: 'python-basics',
  title: 'Python Programming Fundamentals',
  description: 'Learn the core concepts of Python programming from variables to functions',
  level: 'beginner',
  duration: 5,
  modules: 5,
  category: 'Programming',
  lessons: [
    {
      id: 'variables',
      title: 'Variables and Data Types',
      content: `# Variables and Data Types

Variables are containers for storing data values. In Python, you don't need to declare the type of a variable - Python figures it out automatically!

## Creating Variables

\`\`\`python
# String variables
name = "Alice"
greeting = 'Hello, World!'

# Number variables
age = 25
height = 5.8
temperature = -10

# Boolean variables
is_student = True
is_working = False
\`\`\`

## Data Types

Python has several built-in data types:

- **String (str)**: Text data like "Hello"
- **Integer (int)**: Whole numbers like 42
- **Float (float)**: Decimal numbers like 3.14
- **Boolean (bool)**: True or False values

## Checking Data Types

\`\`\`python
name = "Alice"
age = 25

print(type(name))  # <class 'str'>
print(type(age))   # <class 'int'>
\`\`\`

## Variable Naming Rules

- Must start with a letter or underscore
- Can contain letters, numbers, and underscores
- Case-sensitive (age and Age are different)
- Cannot use Python keywords (like if, for, while)

Good variable names: \`user_name\`, \`total_score\`, \`is_valid\`
Bad variable names: \`2name\`, \`user-name\`, \`class\``,
      narrationText: `Welcome to your first Python lesson! Today we'll learn about variables and data types. Variables are like containers that store information in your program. Think of them as labeled boxes where you can put different types of data. In Python, creating a variable is simple - you just give it a name and assign a value using the equals sign. Python automatically figures out what type of data you're storing, whether it's text, numbers, or true-false values. Let's explore the main data types: strings for text, integers for whole numbers, floats for decimal numbers, and booleans for true or false values. Remember to follow Python's naming rules when creating variables - start with a letter or underscore, use descriptive names, and avoid Python keywords.`,
      exercise: {
        description: 'Create variables for a person\'s information: name (string), age (integer), height (float), and whether they are a student (boolean). Then print each variable with its type.',
        defaultCode: `# Create variables for a person's information
# name = 
# age = 
# height = 
# is_student = 

# Print each variable and its type
# print("Name:", name, "Type:", type(name))
`,
        solution: `# Create variables for a person's information
name = "John Doe"
age = 22
height = 5.9
is_student = True

# Print each variable and its type
print("Name:", name, "Type:", type(name))
print("Age:", age, "Type:", type(age))
print("Height:", height, "Type:", type(height))
print("Is Student:", is_student, "Type:", type(is_student))`,
        hints: [
          'Use quotes for string values',
          'Numbers don\'t need quotes',
          'Boolean values are True or False (capitalized)',
          'Use the type() function to check data types'
        ]
      },
      estimatedTime: 15
    },
    {
      id: 'conditionals',
      title: 'Conditional Statements',
      content: `# Conditional Statements

Conditional statements allow your program to make decisions based on different conditions. They're like asking questions and doing different things based on the answers.

## If Statements

\`\`\`python
age = 18

if age >= 18:
    print("You are an adult")
\`\`\`

## If-Else Statements

\`\`\`python
temperature = 25

if temperature > 30:
    print("It's hot outside!")
else:
    print("It's not too hot")
\`\`\`

## If-Elif-Else Statements

\`\`\`python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
\`\`\`

## Comparison Operators

- \`==\` Equal to
- \`!=\` Not equal to
- \`>\` Greater than
- \`<\` Less than
- \`>=\` Greater than or equal to
- \`<=\` Less than or equal to

## Logical Operators

\`\`\`python
age = 25
has_license = True

# AND operator
if age >= 18 and has_license:
    print("Can drive")

# OR operator
if age < 16 or age > 65:
    print("Special consideration")

# NOT operator
if not has_license:
    print("Cannot drive")
\`\`\``,
      narrationText: `Now let's learn about conditional statements - one of the most powerful features in programming! Conditionals allow your program to make decisions, just like how you make choices in real life. We start with the simple 'if' statement, which executes code only when a condition is true. Then we have 'if-else' statements for handling two possibilities, and 'if-elif-else' for multiple conditions. Python uses comparison operators like equals, greater than, and less than to compare values. You can also combine conditions using logical operators: 'and' requires both conditions to be true, 'or' requires at least one to be true, and 'not' reverses the condition. Remember that Python uses indentation to group code blocks - this is crucial for conditionals to work properly!`,
      exercise: {
        description: 'Create a program that determines if someone can vote based on their age and citizenship status. Use conditional statements to check different scenarios.',
        defaultCode: `# Get user information
age = 20
is_citizen = True

# Write conditional statements to determine voting eligibility
# Consider: must be 18+ and a citizen to vote

`,
        solution: `# Get user information
age = 20
is_citizen = True

# Write conditional statements to determine voting eligibility
if age >= 18 and is_citizen:
    print("You are eligible to vote!")
elif age >= 18 and not is_citizen:
    print("You must be a citizen to vote.")
elif age < 18 and is_citizen:
    print("You must be 18 or older to vote.")
else:
    print("You must be 18+ and a citizen to vote.")

# Additional check
if age < 18:
    years_to_wait = 18 - age
    print(f"You can vote in {years_to_wait} years.")`,
        hints: [
          'Use the "and" operator to check both conditions',
          'Consider all possible combinations of age and citizenship',
          'Use elif for multiple conditions',
          'Remember that age >= 18 is required for voting'
        ]
      },
      estimatedTime: 20
    },
    {
      id: 'loops',
      title: 'Loops and Iteration',
      content: `# Loops and Iteration

Loops allow you to repeat code multiple times without writing it over and over again. Python has two main types of loops: for loops and while loops.

## For Loops

For loops are great when you know how many times you want to repeat something.

\`\`\`python
# Loop through a range of numbers
for i in range(5):
    print(f"Count: {i}")

# Loop through a list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"I like {fruit}")

# Loop through a string
for letter in "Python":
    print(letter)
\`\`\`

## While Loops

While loops continue as long as a condition is true.

\`\`\`python
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1  # Same as count = count + 1

# Be careful with infinite loops!
# while True:  # This would run forever
#     print("This never stops!")
\`\`\`

## Range Function

The range function generates sequences of numbers:

\`\`\`python
# range(stop)
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)

# range(start, stop)
for i in range(2, 7):  # 2, 3, 4, 5, 6
    print(i)

# range(start, stop, step)
for i in range(0, 10, 2):  # 0, 2, 4, 6, 8
    print(i)
\`\`\`

## Loop Control

\`\`\`python
# Break - exit the loop
for i in range(10):
    if i == 5:
        break
    print(i)  # Prints 0, 1, 2, 3, 4

# Continue - skip to next iteration
for i in range(5):
    if i == 2:
        continue
    print(i)  # Prints 0, 1, 3, 4
\`\`\``,
      narrationText: `Loops are incredibly powerful tools that let you repeat actions without writing the same code multiple times. Imagine having to write 'print hello' a hundred times - that's where loops save the day! Python offers two main types of loops. For loops are perfect when you know exactly how many times you want to repeat something, like counting from one to ten or going through a list of items. While loops keep running as long as a condition remains true, making them great for situations where you don't know exactly when to stop. The range function is your best friend with for loops - it generates sequences of numbers that you can customize with start, stop, and step values. You can also control loop behavior with break to exit early and continue to skip iterations. Remember to be careful with while loops to avoid infinite loops that never end!`,
      exercise: {
        description: 'Create a program that prints a multiplication table for a given number using a for loop. Also create a guessing game using a while loop.',
        defaultCode: `# Part 1: Multiplication table
number = 7
# Create a for loop to print multiplication table for 'number'

print("\\n" + "="*30 + "\\n")

# Part 2: Simple guessing game
secret_number = 42
guess = 0
attempts = 0

# Create a while loop for the guessing game
# The user should guess until they get it right
# For demo purposes, simulate guesses: 25, 50, 42

`,
        solution: `# Part 1: Multiplication table
number = 7
print(f"Multiplication table for {number}:")
for i in range(1, 11):
    result = number * i
    print(f"{number} x {i} = {result}")

print("\\n" + "="*30 + "\\n")

# Part 2: Simple guessing game
secret_number = 42
guesses = [25, 50, 42]  # Simulated guesses for demo
attempts = 0

print("Guessing game started! Secret number is between 1-100")
for guess in guesses:
    attempts += 1
    print(f"Attempt {attempts}: Guessing {guess}")
    
    if guess == secret_number:
        print(f"Congratulations! You guessed it in {attempts} attempts!")
        break
    elif guess < secret_number:
        print("Too low! Try again.")
    else:
        print("Too high! Try again.")`,
        hints: [
          'Use range(1, 11) for multiplication table 1-10',
          'Use f-strings for formatted output',
          'For the guessing game, compare guess with secret_number',
          'Use break to exit the loop when correct guess is made'
        ]
      },
      estimatedTime: 25
    },
    {
      id: 'functions',
      title: 'Functions and Code Organization',
      content: `# Functions and Code Organization

Functions are reusable blocks of code that perform specific tasks. They help organize your code and avoid repetition.

## Defining Functions

\`\`\`python
def greet():
    print("Hello, World!")

# Call the function
greet()
\`\`\`

## Functions with Parameters

\`\`\`python
def greet_person(name):
    print(f"Hello, {name}!")

def add_numbers(a, b):
    result = a + b
    print(f"{a} + {b} = {result}")

# Call functions with arguments
greet_person("Alice")
add_numbers(5, 3)
\`\`\`

## Return Values

\`\`\`python
def multiply(x, y):
    return x * y

def get_full_name(first, last):
    return f"{first} {last}"

# Use return values
product = multiply(4, 7)
print(product)  # 28

name = get_full_name("John", "Doe")
print(name)  # John Doe
\`\`\`

## Default Parameters

\`\`\`python
def greet_with_title(name, title="Mr."):
    return f"Hello, {title} {name}!"

print(greet_with_title("Smith"))        # Hello, Mr. Smith!
print(greet_with_title("Johnson", "Dr."))  # Hello, Dr. Johnson!
\`\`\`

## Local vs Global Variables

\`\`\`python
global_var = "I'm global"

def my_function():
    local_var = "I'm local"
    print(global_var)  # Can access global
    print(local_var)   # Can access local

my_function()
# print(local_var)  # Error! Can't access local var outside function
\`\`\`

## Docstrings

\`\`\`python
def calculate_area(length, width):
    """
    Calculate the area of a rectangle.
    
    Args:
        length (float): The length of the rectangle
        width (float): The width of the rectangle
    
    Returns:
        float: The area of the rectangle
    """
    return length * width
\`\`\``,
      narrationText: `Functions are the building blocks of well-organized code! Think of functions as mini-programs that do specific jobs. Just like how you might have different tools for different tasks, functions let you break your code into manageable, reusable pieces. You define a function once and can use it many times throughout your program. Functions can accept parameters - these are like ingredients you pass to a recipe. They can also return values, giving you back a result after doing their work. Default parameters let you make some inputs optional, and docstrings help document what your function does. Understanding the difference between local and global variables is crucial - local variables exist only inside the function, while global variables can be accessed anywhere. Functions make your code cleaner, easier to test, and much more maintainable!`,
      exercise: {
        description: 'Create a calculator program with separate functions for different operations. Include functions for addition, subtraction, multiplication, division, and a main function that uses them all.',
        defaultCode: `# Create calculator functions

def add(a, b):
    # Return the sum of a and b
    pass

def subtract(a, b):
    # Return the difference of a and b
    pass

def multiply(a, b):
    # Return the product of a and b
    pass

def divide(a, b):
    # Return the quotient of a and b
    # Handle division by zero
    pass

def calculator_demo():
    # Demonstrate all calculator functions
    # Use numbers: 10 and 3
    pass

# Call the demo function

`,
        solution: `# Create calculator functions

def add(a, b):
    """Return the sum of a and b"""
    return a + b

def subtract(a, b):
    """Return the difference of a and b"""
    return a - b

def multiply(a, b):
    """Return the product of a and b"""
    return a * b

def divide(a, b):
    """Return the quotient of a and b"""
    if b == 0:
        return "Error: Cannot divide by zero!"
    return a / b

def calculator_demo():
    """Demonstrate all calculator functions"""
    num1, num2 = 10, 3
    
    print(f"Calculator Demo with {num1} and {num2}:")
    print(f"Addition: {num1} + {num2} = {add(num1, num2)}")
    print(f"Subtraction: {num1} - {num2} = {subtract(num1, num2)}")
    print(f"Multiplication: {num1} × {num2} = {multiply(num1, num2)}")
    print(f"Division: {num1} ÷ {num2} = {divide(num1, num2)}")
    
    # Test division by zero
    print(f"Division by zero: {num1} ÷ 0 = {divide(num1, 0)}")

# Call the demo function
calculator_demo()`,
        hints: [
          'Use the return statement to send back results',
          'Check for division by zero before dividing',
          'Use docstrings to document your functions',
          'Call each function from calculator_demo() to test them'
        ]
      },
      estimatedTime: 30
    },
    {
      id: 'lists',
      title: 'Lists and Data Collections',
      content: `# Lists and Data Collections

Lists are ordered collections that can store multiple items. They're one of the most useful data structures in Python!

## Creating Lists

\`\`\`python
# Empty list
empty_list = []

# List with items
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]
mixed = ["hello", 42, True, 3.14]
\`\`\`

## Accessing List Items

\`\`\`python
fruits = ["apple", "banana", "orange", "grape"]

# Positive indexing (starts at 0)
print(fruits[0])   # apple
print(fruits[1])   # banana

# Negative indexing (starts from end)
print(fruits[-1])  # grape
print(fruits[-2])  # orange

# Slicing
print(fruits[1:3])   # ['banana', 'orange']
print(fruits[:2])    # ['apple', 'banana']
print(fruits[2:])    # ['orange', 'grape']
\`\`\`

## Modifying Lists

\`\`\`python
fruits = ["apple", "banana"]

# Add items
fruits.append("orange")        # Add to end
fruits.insert(1, "grape")      # Insert at position
fruits.extend(["kiwi", "mango"])  # Add multiple items

# Remove items
fruits.remove("banana")        # Remove by value
popped = fruits.pop()          # Remove and return last item
del fruits[0]                  # Remove by index

# Change items
fruits[0] = "strawberry"       # Change by index
\`\`\`

## List Methods

\`\`\`python
numbers = [3, 1, 4, 1, 5, 9, 2]

# Useful methods
print(len(numbers))           # Length: 7
print(numbers.count(1))       # Count occurrences: 2
print(numbers.index(4))       # Find index: 2

# Sorting
numbers.sort()                # Sort in place
print(numbers)                # [1, 1, 2, 3, 4, 5, 9]

sorted_desc = sorted(numbers, reverse=True)  # Create new sorted list
print(sorted_desc)            # [9, 5, 4, 3, 2, 1, 1]
\`\`\`

## List Comprehensions

\`\`\`python
# Traditional way
squares = []
for i in range(5):
    squares.append(i ** 2)

# List comprehension (more Pythonic)
squares = [i ** 2 for i in range(5)]
print(squares)  # [0, 1, 4, 9, 16]

# With condition
even_squares = [i ** 2 for i in range(10) if i % 2 == 0]
print(even_squares)  # [0, 4, 16, 36, 64]
\`\`\`

## Nested Lists

\`\`\`python
# 2D list (list of lists)
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

print(matrix[1][2])  # Access row 1, column 2: 6
\`\`\``,
      narrationText: `Lists are incredibly versatile and powerful data structures in Python! Think of a list as a container that can hold multiple items in a specific order, like a shopping list or a playlist. You can store any type of data in lists - numbers, text, even other lists! Python uses zero-based indexing, meaning the first item is at position 0. You can access items from the beginning with positive numbers or from the end with negative numbers. Lists are mutable, which means you can change them after creation - add items, remove items, or modify existing ones. Python provides many built-in methods to work with lists efficiently. List comprehensions are a powerful feature that lets you create new lists in a concise, readable way. You can even have lists inside lists, creating multi-dimensional data structures. Mastering lists is essential for effective Python programming!`,
      exercise: {
        description: 'Create a student grade management system using lists. Store student names and their grades, then perform various operations like calculating averages and finding top performers.',
        defaultCode: `# Student Grade Management System

# Create lists for student data
students = ["Alice", "Bob", "Charlie", "Diana", "Eve"]
grades = [85, 92, 78, 96, 88]

# Task 1: Print all students with their grades

# Task 2: Calculate and print the average grade

# Task 3: Find the student with the highest grade

# Task 4: Add a new student and grade

# Task 5: Create a list of students who scored above 90

`,
        solution: `# Student Grade Management System

# Create lists for student data
students = ["Alice", "Bob", "Charlie", "Diana", "Eve"]
grades = [85, 92, 78, 96, 88]

# Task 1: Print all students with their grades
print("Student Grades:")
for i in range(len(students)):
    print(f"{students[i]}: {grades[i]}")

print("\\n" + "="*30 + "\\n")

# Task 2: Calculate and print the average grade
average = sum(grades) / len(grades)
print(f"Class Average: {average:.2f}")

# Task 3: Find the student with the highest grade
max_grade = max(grades)
top_student_index = grades.index(max_grade)
top_student = students[top_student_index]
print(f"Top Student: {top_student} with {max_grade} points")

# Task 4: Add a new student and grade
students.append("Frank")
grades.append(94)
print(f"Added new student: {students[-1]} with grade {grades[-1]}")

# Task 5: Create a list of students who scored above 90
high_achievers = [students[i] for i in range(len(students)) if grades[i] > 90]
print(f"Students with grades above 90: {high_achievers}")

# Bonus: Sort students by grade (highest first)
student_grade_pairs = list(zip(students, grades))
student_grade_pairs.sort(key=lambda x: x[1], reverse=True)
print("\\nStudents ranked by grade:")
for student, grade in student_grade_pairs:
    print(f"{student}: {grade}")`,
        hints: [
          'Use range(len(list)) to iterate with indices',
          'Use sum() and len() to calculate average',
          'Use max() and index() to find the highest grade',
          'List comprehensions can filter based on conditions',
          'zip() can combine two lists for sorting'
        ]
      },
      estimatedTime: 25
    }
  ]
};