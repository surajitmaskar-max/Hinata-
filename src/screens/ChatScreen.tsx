import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, JarvisLanguage } from '../types/jarvis';
import { speechManager } from '../utils/speech';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  Sparkles,
  User,
  Wrench,
  CheckCircle2,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  X,
} from 'lucide-react';

interface ChatScreenProps {
  onBack: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, lang: JarvisLanguage) => Promise<void>;
  currentLanguage: JarvisLanguage;
  onChangeLanguage: (lang: JarvisLanguage) => void;
  onClearChat: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack,
  messages,
  onSendMessage,
  currentLanguage,
  onChangeLanguage,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachedFiles.length === 0) || isSubmitting) return;

    let query = inputText.trim();
    if (attachedFiles.length > 0) {
      query += ` [Attached: ${attachedFiles.map((f) => f.name).join(', ')}]`;
    }

    setInputText('');
    setAttachedFiles([]);
    setIsSubmitting(true);

    try {
      await onSendMessage(query, currentLanguage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      speechManager.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechManager.startListening(
        (text, isFinal) => {
          setInputText(text);
          if (isFinal && text.trim()) {
            setIsListening(false);
          }
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
    }
  };

  const handleSpeakMessage = (text: string) => {
    speechManager.speak(text, currentLanguage);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((f) => ({
        name: f.name,
        size: `${Math.round(f.size / 1024)} KB`,
      }));
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-3.5rem)] pb-20">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-violet-500/20 pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>HINATA Neural Chat</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Google Gemini 3.8 Flash &bull; Context Aware
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-violet-500/20 text-xs">
            <button
              type="button"
              onClick={() => onChangeLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                currentLanguage === 'en' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('bn')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                currentLanguage === 'bn' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('hi')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                currentLanguage === 'hi' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            type="button"
            onClick={onClearChat}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-sky-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-3 shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              HINATA AI Online
            </h3>
            <p className="text-xs max-w-sm mb-4">
              Ask Hinata anything, orchestrate phone automations, or talk in English, Bengali, or Hindi.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              <button
                type="button"
                onClick={() => setInputText('How does Hinata automate Android applications?')}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-violet-500/30 cursor-pointer"
              >
                "How does Android Automation work?"
              </button>
              <button
                type="button"
                onClick={() => setInputText('টর্চলাইট অন করে ভলিউম বাড়াও')}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-violet-500/30 cursor-pointer"
              >
                "টর্চলাইট অন করে ভলিউম বাড়াও" (Bengali)
              </button>
              <button
                type="button"
                onClick={() => setInputText('मॉर्निंग रूटीन चलाओ')}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-violet-500/30 cursor-pointer"
              >
                "मॉर्निंग रूटीन चलाओ" (Hindi)
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              {/* Glassmorphism Message Bubble */}
              <div
                className={`max-w-[85%] rounded-3xl p-4 backdrop-blur-xl shadow-xl transition-all ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 text-white rounded-tr-sm border border-violet-400/30'
                    : 'bg-slate-900/80 text-slate-100 border border-violet-500/20 rounded-tl-sm'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {msg.content}
                </div>

                {/* Tool calls card if present */}
                {msg.functionCalls && msg.functionCalls.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-violet-500/20 space-y-2">
                    <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 font-semibold">
                      <Wrench className="w-3 h-3" />
                      ANDROID HARDWARE DISPATCH
                    </span>
                    {msg.functionCalls.map((fc: any, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-violet-500/25 text-[11px] font-mono"
                      >
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-semibold text-violet-300">{fc.name}()</span>
                          <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            VERIFIED BY HINATA
                          </span>
                        </div>
                        {fc.args && Object.keys(fc.args).length > 0 && (
                          <div className="text-slate-400 mt-1 text-[10px]">
                            {JSON.stringify(fc.args)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleSpeakMessage(msg.content)}
                      className="hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Speak Message"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak</span>
                    </button>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isSubmitting && (
          <div className="flex gap-3 text-sm justify-start items-center animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-violet-500/30 rounded-2xl px-4 py-3 text-xs text-violet-300 flex items-center gap-3 font-mono shadow-lg">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Hinata is thinking & verifying Android actions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment previews */}
      {attachedFiles.length > 0 && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto">
          {attachedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1 rounded-xl bg-violet-950/60 border border-violet-500/30 text-[11px] text-violet-200"
            >
              <Paperclip className="w-3 h-3 text-violet-400" />
              <span>{file.name}</span>
              <span className="text-slate-400 font-mono text-[10px]">({file.size})</span>
              <button
                type="button"
                onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form with Attachment Button */}
      <form
        onSubmit={handleSubmit}
        className="pt-3 border-t border-violet-500/20 flex items-center gap-2 shrink-0"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileAttach}
          multiple
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/30 text-slate-400 hover:text-violet-300 transition-colors cursor-pointer shadow-md"
          title="Attach Screenshot / Logs"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to microphone...'
              : currentLanguage === 'bn'
              ? 'হিনাতাকে বার্তা লিখুন বা প্রশ্ন করুন...'
              : currentLanguage === 'hi'
              ? 'हिनाता को संदेश लिखें या प्रश्न पूछें...'
              : 'Ask Hinata anything...'
          }
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-violet-500/20 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-sans"
        />

        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-2.5 rounded-xl border transition-colors cursor-pointer shadow-md ${
            isListening
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-violet-300 hover:border-violet-500/30'
          }`}
          title="Voice Input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          type="submit"
          disabled={(!inputText.trim() && attachedFiles.length === 0) || isSubmitting}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 active:from-violet-700 active:to-sky-700 disabled:opacity-50 text-white font-medium transition-all shadow-md shadow-violet-600/30 flex items-center gap-1.5 cursor-pointer text-xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
