import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidSourceFile } from '../android_code/projectFiles';
import { downloadAndroidProjectZip } from '../utils/zipExporter';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Folder,
  Layers,
  Terminal,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface ProjectExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectExporterModal: React.FC<ProjectExporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<AndroidSourceFile>(
    ANDROID_PROJECT_FILES[3] || ANDROID_PROJECT_FILES[0] // Manifest or MainActivity
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    setExportProgress(10);
    try {
      await downloadAndroidProjectZip((pct) => {
        setExportProgress(pct);
      });
    } catch (err) {
      console.error('Failed to export Android project:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-6xl h-[90vh] rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                HINATA AI – Android Studio &amp; GitHub Exporter
              </h2>
              <p className="text-[11px] text-slate-400">
                Complete Kotlin, Jetpack Compose, Gemini AI, Firebase &amp; GitHub Actions CI/CD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-sky-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isExporting ? `Zipping (${exportProgress}%)` : 'Download Project (.ZIP)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-full md:w-72 border-r border-slate-800 bg-slate-950/50 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800 text-[11px] font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-2">
              <Folder className="w-3.5 h-3.5 text-sky-400" />
              <span>PROJECT DIRECTORY</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;

                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className={`w-full p-2 rounded-lg text-left text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Build Command Box */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-[11px] font-mono text-slate-400 space-y-1.5">
              <span className="text-sky-400 font-bold block flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                GRADLE CLI COMMAND:
              </span>
              <code className="p-1.5 rounded bg-slate-900 text-slate-200 block border border-slate-800">
                ./gradlew assembleDebug
              </code>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* File info bar */}
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono bg-slate-900/60">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-sky-400">{selectedFile.path}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-slate-400">{selectedFile.description}</span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-slate-200 leading-relaxed selection:bg-sky-500/30">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer with Android Studio hedgehog setup instructions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Ready for Android Studio Hedgehog, Iguana, Ladybug or Meerkat</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Target SDK: 35 (Android 15) &bull; Min SDK: 26 (Android 8.0) &bull; Kotlin 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
