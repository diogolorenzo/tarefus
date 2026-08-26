import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { X, Building2, Palette } from 'lucide-react';

const COLOR_OPTIONS = [
  { id: 'emerald', label: 'Verde', bg: 'bg-emerald-500' },
  { id: 'blue', label: 'Azul', bg: 'bg-blue-600' },
  { id: 'violet', label: 'Roxo', bg: 'bg-violet-600' },
  { id: 'amber', label: 'Laranja / Âmbar', bg: 'bg-amber-500' },
  { id: 'rose', label: 'Vermelho / Rosa', bg: 'bg-rose-500' },
  { id: 'slate', label: 'Cinza Neutro', bg: 'bg-slate-600' },
];

export const BoardModal: React.FC = () => {
  const { isBoardModalOpen, setIsBoardModalOpen, addBoard, setSelectedBoardId } = useTaskContext();

  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [description, setDescription] = useState('');

  if (!isBoardModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBoard = addBoard(name, color, 'Building2', description);
    setSelectedBoardId(newBoard.id);
    setName('');
    setDescription('');
    setColor('blue');
    setIsBoardModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="bg-white dark:bg-[#121826] rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-white/[0.08] overflow-hidden dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#161F32]/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Nova Área / Quadro</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsBoardModalOpen(false)}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nome da Área <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Suporte, Jurídico, Logística..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Descrição Curta (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Demandas e atendimentos do setor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Cor de Destaque
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    color === c.id
                      ? 'border-slate-800 dark:border-indigo-500 ring-2 ring-slate-800/10 dark:ring-indigo-500/30 bg-slate-50 dark:bg-[#192336] text-slate-900 dark:text-white font-bold'
                      : 'border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBoardModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/[0.06] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer"
            >
              Criar Quadro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
