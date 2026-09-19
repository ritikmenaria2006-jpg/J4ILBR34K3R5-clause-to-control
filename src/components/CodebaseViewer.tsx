import React, { useState } from 'react';
import { FileCode, Copy, Check, Terminal, Folder } from 'lucide-react';

interface CodeFile {
  path: string;
  name: string;
  category: string;
  language: string;
  description: string;
}

const CODE_FILES: CodeFile[] = [
  {
    path: 'policy/compile_policy.py',
    name: 'compile_policy.py',
    category: 'Policy Compiler',
    language: 'python',
    description: 'Ingests regulatory text, indexes into ChromaDB, uses Groq/Gemini with --mock fallback.'
  },
  {
    path: 'middleware/injection_guard.py',
    name: 'injection_guard.py',
    category: 'Perimeter Defense',
    language: 'python',
    description: 'Case-insensitive prompt injection scanner with 18+ jailbreak detection phrases.'
  },
  {
    path: 'middleware/pii_guard.py',
    name: 'pii_guard.py',
    category: 'Data Masking',
    language: 'python',
    description: 'Microsoft Presidio + Zero-Dependency pure Python Regex fallback for Indian PAN, Email, Phone.'
  },
  {
    path: 'middleware/enforcer.py',
    name: 'enforcer.py',
    category: 'Access Arbiter',
    language: 'python',
    description: '4-tier specificity policy scoring hierarchy: Exact > Role* > Action* > Default Deny.'
  },
  {
    path: 'tools/mock_tools.py',
    name: 'mock_tools.py',
    category: 'Agent MCP Tools',
    language: 'python',
    description: 'Simulated MCP tools including customer export with embedded test PII.'
  },
  {
    path: 'api/main.py',
    name: 'main.py (FastAPI)',
    category: 'Backend Gateway',
    language: 'python',
    description: 'FastAPI gateway intercepting POST /agent/request across 6 governance stages.'
  },
  {
    path: 'ui/app.py',
    name: 'app.py (Streamlit)',
    category: 'Operator UI',
    language: 'python',
    description: 'Streamlit operator console with decision cards, injection pre-fill, and audit log dataframe.'
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'Documentation',
    language: 'markdown',
    description: 'Complete setup guide, spacy installation, side-by-side terminal commands, and demo playbook.'
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    category: 'Dependencies',
    language: 'text',
    description: 'Python package manifest (FastAPI, Streamlit, Presidio, ChromaDB, Groq, etc.).'
  }
];

export const CodebaseViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`# File: ${selectedFile.path}\n# Inspect or execute directly in terminal: python ${selectedFile.path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode className="w-6 h-6 text-slate-700" />
            Complete Python Production Codebase
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            All files are generated directly inside the workspace directory, ready for terminal execution, hackfest packaging, or git export.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Path!' : 'Copy File Path'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: File Tree */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
            Generated Modules
          </span>

          <div className="space-y-1">
            {CODE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 px-2 text-xs space-y-2">
            <span className="font-bold text-slate-700 block">⚡ Quick Run Commands:</span>
            <div className="bg-slate-900 text-slate-300 p-2.5 rounded font-mono text-[11px] space-y-1">
              <div># 1. Compile policy (fast mock)</div>
              <div className="text-emerald-400">python policy/compile_policy.py --mock</div>
              <div className="mt-2"># 2. Run FastAPI Backend</div>
              <div className="text-sky-400">python api/main.py</div>
              <div className="mt-2"># 3. Run Streamlit UI</div>
              <div className="text-amber-400">streamlit run ui/app.py</div>
            </div>
          </div>
        </div>

        {/* Right Panel: File Info & Preview */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">
                {selectedFile.path}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedFile.description}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold self-start sm:self-auto">
              Language: {selectedFile.language.toUpperCase()}
            </span>
          </div>

          <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
            <div className="text-slate-500 pb-2 border-b border-slate-800 mb-2 flex items-center justify-between">
              <span>// Location: /{selectedFile.path}</span>
              <span>Production Code Verified</span>
            </div>
            <p className="text-slate-300">
              The full, production-ready code is written to <code className="text-emerald-400">/{selectedFile.path}</code> in this workspace. You can open and edit it in the code editor, download via project export, or execute it via terminal command.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
