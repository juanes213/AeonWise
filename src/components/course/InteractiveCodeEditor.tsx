import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, Eye, EyeOff, Lightbulb, CheckCircle, 
  XCircle, AlertCircle, Copy, Download, Settings, Maximize2,
  Minimize2, Terminal, Code2
} from 'lucide-react';
import Editor from '@monaco-editor/react';

interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  defaultCode: string;
  solution: string;
  hints: string[];
  testCases: TestCase[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface InteractiveCodeEditorProps {
  exercise: Exercise;
  onComplete: (completed: boolean) => void;
  onCodeChange: (code: string) => void;
  initialCode?: string;
}

export const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({
  exercise,
  onComplete,
  onCodeChange,
  initialCode
}) => {
  const [code, setCode] = useState(initialCode || exercise.defaultCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [testResults, setTestResults] = useState<Array<{passed: boolean, error?: string}>>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    theme: 'vs-dark',
    wordWrap: 'on' as const,
    minimap: false
  });

  const editorRef = useRef<any>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onCodeChange(code);
  }, [code, onCodeChange]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);

    try {
      // Simulate code execution (in a real implementation, this would use a Python interpreter)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock execution results
      const results = exercise.testCases.map((testCase, index) => {
        // Simple mock logic - in reality, this would execute the actual Python code
        const passed = Math.random() > 0.3; // 70% pass rate for demo
        return {
          passed,
          error: passed ? undefined : `Test case ${index + 1} failed: Expected "${testCase.expectedOutput}", got different result`
        };
      });

      setTestResults(results);
      
      const allPassed = results.every(r => r.passed);
      if (allPassed) {
        setOutput('✅ All tests passed! Great job!');
        onComplete(true);
      } else {
        const failedCount = results.filter(r => !r.passed).length;
        setOutput(`❌ ${failedCount} test(s) failed. Check the test results below.`);
      }

    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(exercise.defaultCode);
    setOutput('');
    setTestResults([]);
    setShowSolution(false);
    onComplete(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exercise.id}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nextHint = () => {
    if (currentHint < exercise.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'hard': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-cosmic-black' : 'relative'}`}>
      <div className="cosmos-card p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-cosmic-black/50 border-b border-cosmic-purple-700/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Code2 className="h-5 w-5 text-cosmic-gold-400" />
              <h3 className="text-lg font-display">{exercise.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditorSettings(prev => ({ ...prev, minimap: !prev.minimap }))}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Toggle Minimap"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-gray-300 text-sm">{exercise.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-96">
          {/* Code Editor */}
          <div className="relative border-r border-cosmic-purple-700/30">
            <div className="absolute top-2 right-2 z-10 flex space-x-1">
              <button
                onClick={copyCode}
                className="p-1 bg-cosmic-black/70 text-gray-400 hover:text-white rounded transition-colors"
                title="Copy Code"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                onClick={downloadCode}
                className="p-1 bg-cosmic-black/70 text-gray-400 hover:text-white rounded transition-colors"
                title="Download Code"
              >
                <Download className="h-3 w-3" />
              </button>
            </div>
            <Editor
              ref={editorRef}
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={editorSettings.theme}
              options={{
                fontSize: editorSettings.fontSize,
                minimap: { enabled: editorSettings.minimap },
                wordWrap: editorSettings.wordWrap,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                suggest: {
                  showKeywords: true,
                  showSnippets: true,
                },
              }}
            />
          </div>

          {/* Output and Controls */}
          <div className="flex flex-col">
            {/* Control Buttons */}
            <div className="bg-cosmic-black/30 p-3 border-b border-cosmic-purple-700/30">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
                  >
                    {isRunning ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                  </button>
                  <button
                    onClick={resetCode}
                    className="btn-secondary text-sm px-3 py-2 flex items-center space-x-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="btn-secondary text-sm px-3 py-2 flex items-center space-x-1"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>Hints</span>
                  </button>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="btn-secondary text-sm px-3 py-2 flex items-center space-x-1"
                  >
                    {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showSolution ? 'Hide' : 'Show'} Solution</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Output Area */}
            <div className="flex-1 p-4 bg-cosmic-black/20 overflow-y-auto">
              <div className="flex items-center mb-2">
                <Terminal className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                <span className="text-sm font-medium text-cosmic-gold-400">Output</span>
              </div>
              <div
                ref={outputRef}
                className="bg-cosmic-black/50 rounded-md p-3 font-mono text-sm text-gray-300 min-h-[100px] whitespace-pre-wrap"
              >
                {output || 'Click "Run Code" to see output...'}
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-cosmic-gold-400 mb-2">Test Results</h4>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-2 p-2 rounded-md ${
                          result.passed ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'
                        }`}
                      >
                        {result.passed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm">
                          Test {index + 1}: {exercise.testCases[index].description}
                        </span>
                        {result.error && (
                          <div className="text-xs text-red-400 mt-1">{result.error}</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hints Panel */}
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-cosmic-purple-700/30 bg-cosmic-blue-900/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-cosmic-gold-400" />
                  <span className="text-sm font-medium">Hint {currentHint + 1} of {exercise.hints.length}</span>
                </div>
                {currentHint < exercise.hints.length - 1 && (
                  <button
                    onClick={nextHint}
                    className="btn-secondary text-xs px-2 py-1"
                  >
                    Next Hint
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-300">{exercise.hints[currentHint]}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solution Panel */}
        <AnimatePresence>
          {showSolution && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-cosmic-purple-700/30 bg-cosmic-gold-900/20 p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="h-4 w-4 text-cosmic-gold-400" />
                <span className="text-sm font-medium">Solution</span>
              </div>
              <div className="bg-cosmic-black/50 rounded-md p-3 font-mono text-sm text-gray-300 overflow-x-auto">
                <pre>{exercise.solution}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};