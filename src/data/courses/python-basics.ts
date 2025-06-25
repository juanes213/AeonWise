export interface LessonSection {
  heading: string;
  body: string;
  codeExamples?: { code: string; explanation?: string }[];
  images?: string[];
}

export interface LessonExample {
  code: string;
  explanation: string;
}

export interface LessonTestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface Lesson {
  id: string;
  title: string;
  sections: LessonSection[];
  keyPoints: string[];
  examples: LessonExample[];
  exercise: {
    description: string;
    defaultCode: string;
    solution: string;
    testCases: LessonTestCase[];
    hints: string[];
  };
  estimatedTime: number;
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
      sections: [
        {
          heading: 'What are Variables?',
          body: 'Variables are containers for storing data values. In Python, you do not need to declare the type of a variable. Python figures it out automatically!'
        },
        {
          heading: 'Creating Variables',
          body: 'You can create variables by assigning a value to a name using the equals sign (=).',
          codeExamples: [
            { code: 'name = "Alice"  # String\nage = 25      # Integer\nheight = 5.8  # Float\nis_student = True  # Boolean', explanation: 'Here we create variables of different types.' }
          ]
        },
        {
          heading: 'Data Types',
          body: 'Python has several built-in data types: String (str), Integer (int), Float (float), and Boolean (bool).',
          codeExamples: [
            { code: 'print(type("Alice"))  # <class \'str\'>\nprint(type(25))      # <class \'int\'>', explanation: 'Use type() to check the data type.' }
          ]
        },
        {
          heading: 'Variable Naming Rules',
          body: 'Variable names must start with a letter or underscore, can contain letters, numbers, and underscores, are case-sensitive, and cannot use Python keywords.'
        }
      ],
      keyPoints: [
        'Variables store data values',
        'No need to declare type in Python',
        'Common types: str, int, float, bool',
        'Follow naming rules for variables'
      ],
      examples: [
        {
          code: 'user_name = "Maria"\ntotal_score = 100\nis_valid = False',
          explanation: 'Good variable names and different data types.'
        },
        {
          code: '2name = "bad"  # Invalid\nuser-name = "bad"  # Invalid\nclass = "bad"  # Invalid',
          explanation: 'Examples of invalid variable names.'
        }
      ],
      exercise: {
        description: 'Create variables for a person\'s information: name (string), age (integer), height (float), and whether they are a student (boolean). Then print each variable with its type.',
        defaultCode: `# Create variables for a person's information\n# name = \n# age = \n# height = \n# is_student = \n\n# Print each variable and its type\n# print("Name:", name, "Type:", type(name))\n`,
        solution: `name = "John Doe"\nage = 22\nheight = 5.9\nis_student = True\nprint("Name:", name, "Type:", type(name))\nprint("Age:", age, "Type:", type(age))\nprint("Height:", height, "Type:", type(height))\nprint("Is Student:", is_student, "Type:", type(is_student))`,
        testCases: [
          {
            input: '',
            expectedOutput: 'Name: John Doe Type: <class \'str\'>\nAge: 22 Type: <class \'int\'>\nHeight: 5.9 Type: <class \'float\'>\nIs Student: True Type: <class \'bool\'>',
            description: 'Should print all variables and their types.'
          }
        ],
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
      sections: [
        { heading: 'What are Conditionals?', body: '...' },
        // Add more structured sections here
      ],
      keyPoints: ['...'],
      examples: [
        { code: '...', explanation: '...' }
      ],
      exercise: {
        description: '...',
        defaultCode: '',
        solution: '',
        testCases: [],
        hints: []
      },
      estimatedTime: 20
    },
    {
      id: 'loops',
      title: 'Loops and Iteration',
      sections: [
        { heading: 'What are Loops?', body: '...' },
      ],
      keyPoints: ['...'],
      examples: [
        { code: '...', explanation: '...' }
      ],
      exercise: {
        description: '...',
        defaultCode: '',
        solution: '',
        testCases: [],
        hints: []
      },
      estimatedTime: 25
    },
    {
      id: 'functions',
      title: 'Functions and Code Organization',
      sections: [
        { heading: 'What are Functions?', body: '...' },
      ],
      keyPoints: ['...'],
      examples: [
        { code: '...', explanation: '...' }
      ],
      exercise: {
        description: '...',
        defaultCode: '',
        solution: '',
        testCases: [],
        hints: []
      },
      estimatedTime: 30
    },
    {
      id: 'lists',
      title: 'Lists and Data Collections',
      sections: [
        { heading: 'What are Lists?', body: '...' },
      ],
      keyPoints: ['...'],
      examples: [
        { code: '...', explanation: '...' }
      ],
      exercise: {
        description: '...',
        defaultCode: '',
        solution: '',
        testCases: [],
        hints: []
      },
      estimatedTime: 25
    }
  ]
};