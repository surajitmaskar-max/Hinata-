import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PersonalMemoryData } from '../firebase/userRepository';
import {
  ArrowLeft,
  Brain,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Edit2,
  ShieldCheck,
  Lock,
  Database,
  Calendar,
} from 'lucide-react';

interface MemoryScreenProps {
  onBack: () => void;
  memories: PersonalMemoryData[];
  onAddMemory: (approvedMemory: string, category?: string) => Promise<void>;
  onUpdateMemory: (id: string, approvedMemory: string, category?: string) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
}

export const MemoryScreen: React.FC<MemoryScreenProps> = ({
  onBack,
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newMemory, setNewMemory] = useState('');
  const [newCategory, setNewCategory] = useState('preference');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('preference');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;
    await onAddMemory(newMemory.trim(), newCategory);
    setNewMemory('');
    setIsAdding(false);
  };

  const handleStartEdit = (mem: PersonalMemoryData) => {
    setEditingId(mem.id);
    setEditText(mem.approvedMemory);
    setEditCategory(mem.category || 'preference');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    await onUpdateMemory(id, editText.trim(), editCategory);
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Personal AI Memory Vault
            </h1>
            <p className="text-xs text-slate-400">
              Only user-approved information remembered by HINATA • 100% User-Isolated
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Approve New Memory</span>
        </button>
      </div>

      {/* Security Isolation Notice */}
      <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">
              Authenticated Account:{' '}
              <span className="text-pink-300">{userProfile?.displayName || currentUser?.email || 'Guest User'}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Isolated Firestore Path:{' '}
              <code className="text-purple-300 font-mono">users/{currentUser?.uid || 'local'}/memory</code>. No other
              user can read or write these facts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px]">
          <Lock className="w-3 h-3" />
          <span>Firestore ABAC Enforced</span>
        </div>
      </div>

      {/* Add Memory Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-3.5 text-xs animate-fade-in shadow-xl shadow-purple-950/30"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Store User-Approved Memory
            </h3>
            <span className="text-[10px] text-slate-400">Remembered across sessions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="text-slate-400 block mb-1">Approved Fact or Preference</label>
              <input
                type="text"
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                placeholder="e.g. My favorite anime is Violet Evergarden; My sister is Rimi"
                required
                maxLength={1000}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="preference">Preference</option>
                <option value="identity">Identity</option>
                <option value="contact">Contact</option>
                <option value="schedule">Schedule</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium cursor-pointer shadow-md shadow-purple-600/30"
            >
              Save to Firestore Vault
            </button>
          </div>
        </form>
      )}

      {/* Memory List */}
      {memories.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-8 space-y-3">
          <Brain className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Approved Memories Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            HINATA strictly respects user privacy and will never store unapproved personal facts. Click 'Approve New
            Memory' to teach Hinata your preferences.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 hover:border-purple-500/40 transition-all text-xs group flex flex-col justify-between space-y-3 shadow-md"
            >
              {editingId === mem.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-purple-500 text-white text-xs"
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]"
                    >
                      <option value="preference">Preference</option>
                      <option value="identity">Identity</option>
                      <option value="contact">Contact</option>
                      <option value="schedule">Schedule</option>
                    </select>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(mem.id)}
                        className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-950/80 border border-purple-500/30 text-purple-300 uppercase font-mono tracking-wider">
                        {mem.category || 'General'}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(mem)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-purple-300 cursor-pointer"
                          title="Edit memory"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMemory(mem.id)}
                          className="p-1 rounded hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Delete memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-100 font-medium leading-relaxed">"{mem.approvedMemory}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-purple-400/80">Approved</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
