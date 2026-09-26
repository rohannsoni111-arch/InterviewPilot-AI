import React, { useState } from 'react';
import {
  SupportedLanguage,
  ICodeTestCase,
  CodeExecutionResult,
  CodeReviewResponse
} from '@interviewpilot/shared';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Terminal,
  Clock,
  Send,
  AlertTriangle,
  FileCode2,
  Code2
} from 'lucide-react';

const STARTER_TEMPLATES: Record<SupportedLanguage, string> = {
  [SupportedLanguage.PYTHON]: `# Two Sum - Implement an optimal O(n) solution
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Test execution
if __name__ == "__main__":
    print("Result:", two_sum([2, 7, 11, 15], 9))
`,
  [SupportedLanguage.JAVASCRIPT]: `// Two Sum - JavaScript implementation
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log("Result:", twoSum([2, 7, 11, 15], 9));
`,
  [SupportedLanguage.TYPESCRIPT]: `// Two Sum - TypeScript implementation
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log("Result:", twoSum([2, 7, 11, 15], 9));
`,
  [SupportedLanguage.SQL]: `-- Query top earning employees by department
SELECT 
    department,
    name,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees
WHERE salary >= 100000;
`,
  [SupportedLanguage.JAVA]: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] res = twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println(Arrays.toString(res));
    }
}
`,
  [SupportedLanguage.CPP]: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (seen.find(diff) != seen.end()) {
            return {seen[diff], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    vector<int> res = twoSum(nums, 9);
    cout << "[" << res[0] << ", " << res[1] << "]" << endl;
    return 0;
}
`,
  [SupportedLanguage.GO]: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        diff := target - num
        if idx, ok := seen[diff]; ok {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return nil
}

func main() {
    res := twoSum([]int{2, 7, 11, 15}, 9)
    fmt.Println("Result:", res)
}
`
};

interface CodeEditorProps {
  initialLanguage?: SupportedLanguage;
  onAttachToResponse?: (code: string, language: SupportedLanguage) => void;
  onSubmitForTurn?: (code: string, language: SupportedLanguage) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialLanguage = SupportedLanguage.PYTHON,
  onAttachToResponse,
  onSubmitForTurn
}) => {
  const { showToast } = useToast();
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(STARTER_TEMPLATES[initialLanguage]);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'tests' | 'review'>('output');

  const [execResult, setExecResult] = useState<CodeExecutionResult | null>(null);
  const [reviewResult, setReviewResult] = useState<CodeReviewResponse | null>(null);
  const [testCases] = useState<ICodeTestCase[]>([
    { id: '1', input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: 'Result: [0, 1]' },
    { id: '2', input: 'nums = [3, 2, 4], target = 6', expectedOutput: 'Result: [1, 2]' }
  ]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setCode(STARTER_TEMPLATES[newLang]);
    setExecResult(null);
    setReviewResult(null);
  };

  const handleReset = () => {
    setCode(STARTER_TEMPLATES[language]);
    setExecResult(null);
    setReviewResult(null);
    showToast('Code reset to default template', 'info');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Code copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy code', 'error');
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('output');
    try {
      const res = await api.post('/code/run', {
        code,
        language,
        testCases
      });
      if (res.data?.success) {
        setExecResult(res.data.data);
        showToast('Execution finished', 'success');
      }
    } catch {
      showToast('Error executing code', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReviewCode = async () => {
    setIsReviewing(true);
    setActiveTab('review');
    try {
      const res = await api.post('/code/review', {
        code,
        language,
        problemContext: 'Technical Assessment Live Coding Exercise'
      });
      if (res.data?.success) {
        setReviewResult(res.data.data);
        showToast('AI Code review analysis generated', 'success');
      }
    } catch {
      showToast('Failed to review code', 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineNumbers = code.split('\n').map((_, index) => index + 1);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-sm">
            <Code2 className="w-4 h-4" />
            <span>Code Workspace</span>
          </div>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={SupportedLanguage.PYTHON}>Python 3</option>
            <option value={SupportedLanguage.JAVASCRIPT}>JavaScript (Node.js)</option>
            <option value={SupportedLanguage.TYPESCRIPT}>TypeScript</option>
            <option value={SupportedLanguage.SQL}>SQL (SQLite Sandbox)</option>
            <option value={SupportedLanguage.JAVA}>Java 17</option>
            <option value={SupportedLanguage.CPP}>C++ 20</option>
            <option value={SupportedLanguage.GO}>Go 1.22</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Reset code template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleReviewCode}
            disabled={isReviewing}
            className="px-3 py-1.5 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isReviewing ? 'Analyzing...' : 'AI Review'}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-900/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex min-h-[260px] max-h-[460px] overflow-hidden bg-slate-950 font-mono text-xs">
        {/* Line Numbers */}
        <div className="w-10 py-3 bg-slate-900/50 text-slate-600 text-right pr-2 select-none border-r border-slate-800/80">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-5">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea Code Buffer */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-slate-200 resize-none outline-none leading-5 font-mono whitespace-pre overflow-auto selection:bg-indigo-500/30"
          placeholder="Write your technical solution here..."
        />
      </div>

      {/* Action Footer Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('output')}
            className={`pb-0.5 font-medium transition-colors ${
              activeTab === 'output' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'hover:text-slate-200'
            }`}
          >
            Output Console
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-0.5 font-medium transition-colors ${
              activeTab === 'tests' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'hover:text-slate-200'
            }`}
          >
            Test Cases ({testCases.length})
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`pb-0.5 font-medium transition-colors ${
              activeTab === 'review' ? 'text-purple-400 border-b-2 border-purple-400' : 'hover:text-slate-200'
            }`}
          >
            AI Complexity Critique
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onAttachToResponse && (
            <button
              onClick={() => onAttachToResponse(code, language)}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Attach to Chat
            </button>
          )}

          {onSubmitForTurn && (
            <button
              onClick={() => onSubmitForTurn(code, language)}
              className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Code to AI
            </button>
          )}
        </div>
      </div>

      {/* Output / Review Console Panel */}
      <div className="h-44 bg-slate-900/95 border-t border-slate-800 p-3 overflow-y-auto font-mono text-xs">
        {activeTab === 'output' && (
          <div>
            <div className="flex items-center justify-between text-slate-400 pb-1.5 mb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Terminal className="w-3.5 h-3.5" /> Execution Console
              </span>
              {execResult && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" /> {execResult.executionTimeMs} ms
                </span>
              )}
            </div>

            {execResult ? (
              <div className="space-y-1.5">
                {execResult.stdout && (
                  <pre className="text-emerald-400 font-mono whitespace-pre-wrap">{execResult.stdout}</pre>
                )}
                {execResult.stderr && (
                  <pre className="text-rose-400 font-mono whitespace-pre-wrap">{execResult.stderr}</pre>
                )}
                {execResult.testResults && (
                  <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                    {execResult.testResults.map((tc, i) => (
                      <div
                        key={tc.id}
                        className={`p-2 rounded border ${
                          tc.passed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <div className="font-semibold">Case {i + 1}: {tc.passed ? 'PASSED' : 'FAILED'}</div>
                        <div className="text-[10px] opacity-80">Input: {tc.input}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic flex items-center gap-1.5 py-4 justify-center">
                <span>Click "Run Code" above to execute this solution against sample inputs.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-2">
            <div className="text-slate-400 font-semibold mb-2">Sample Evaluation Test Cases</div>
            {testCases.map((tc, idx) => (
              <div key={tc.id} className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-slate-300 font-medium">Test Case #{idx + 1}</div>
                  <div className="text-slate-400 text-[11px]">Input: {tc.input}</div>
                  <div className="text-slate-400 text-[11px]">Expected: {tc.expectedOutput}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded">Sample</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'review' && (
          <div>
            {reviewResult ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      reviewResult.verdict === 'optimal'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {reviewResult.verdict.replace('_', ' ')}
                  </span>
                  <span className="text-indigo-300 font-medium">Time: {reviewResult.timeComplexity}</span>
                  <span className="text-indigo-300 font-medium">Space: {reviewResult.spaceComplexity}</span>
                </div>

                <p className="text-slate-300">{reviewResult.summary}</p>

                {reviewResult.keyInsights.length > 0 && (
                  <div>
                    <div className="font-semibold text-slate-300 mb-1">Key Insights:</div>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {reviewResult.keyInsights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {reviewResult.edgeCaseWarnings.length > 0 && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300">
                    <div className="font-semibold flex items-center gap-1 mb-0.5">
                      <AlertTriangle className="w-3 h-3" /> Edge Case Watchlist:
                    </div>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      {reviewResult.edgeCaseWarnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic flex items-center gap-1.5 py-4 justify-center">
                <span>Click "AI Review" to analyze time/space complexity and potential algorithmic bottlenecks.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
