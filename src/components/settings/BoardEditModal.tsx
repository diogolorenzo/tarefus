import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import type { Board } from '../../types';
import {
  X,
  Building2,
  Palette,
  LayoutGrid,
  Folder,
  Briefcase,
  Shield,
  Zap,
  BarChart3,
  Layers,
  Globe,
  Tag,
  Check,
} from 'lucide-react';

interface BoardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  board?: Board | null;
}

const COLOR_OPTIONS = [
  { id: 'blue', label: 'Azul', bg: 'bg-blue-600', ring: 'ring-blue-600' },
  { id: 'emerald', label: 'Verde', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'violet', label: 'Violeta', bg: 'bg-violet-600', ring: 'ring-violet-600' },
  { id: 'amber', label: 'Âmbar', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'rose', label: 'Rosa / Carmim', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-600', ring: 'ring-indigo-600' },
  { id: 'cyan', label: 'Ciano', bg: 'bg-cyan-600', ring: 'ring-cyan-600' },
  { id: 'slate', label: 'Cinza Neutro', bg: 'bg-slate-600', ring: 'ring-slate-600' },
];

const ICON_OPTIONS = [
  { id: 'Building2', label: 'Empresa', Icon: Building2 },
  { id: 'LayoutGrid', label: 'Quadro', Icon: LayoutGrid },
  { id: 'Folder', label: 'Pasta', Icon: Folder },
  { id: 'Briefcase', label: 'Negócios', Icon: Briefcase },
  { id: 'Shield', label: 'Segurança', Icon: Shield },
  { id: 'Zap', label: 'Ágil', Icon: Zap },
  { id: 'BarChart3', label: 'Métricas', Icon: BarChart3 },
  { id: 'Layers', label: 'Camadas', Icon: Layers },
  { id: 'Globe', label: 'Global', Icon: Globe },
  { id: 'Tag', label: 'Etiqueta', Icon: Tag },
];

export const BoardEditModal: React.FC<BoardEditModalProps> = ({ isOpen, onClose, board }) => {
  const { addBoard, updateBoard, setSelectedBoardId } = useTaskContext();

  const [name, setName] = useState(board?.name || '');
  const [color, setColor] = useState(board?.color || 'blue');
  const [icon, setIcon] = useState(board?.icon || 'Building2');
  const [description, setDescription] = useState(board?.description || '');

  const isEditing = Boolean(board);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && board) {
      updateBoard(board.id, {
        name: name.trim(),
        color,
        icon,
        description: description.trim(),
      });
    } else {
      const created = addBoard(name.trim(), color, icon, description.trim());
      setSelectedBoardId(created.id);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-[#121826] rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200/80 dark:border-white/[0.08] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#161F32]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Editar Área / Quadro' : 'Nova Área / Quadro'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Atualize o nome, cor e identificação visual deste quadro'
                  : 'Crie um novo espaço para organizar tarefas da equipe'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nome da Área / Quadro <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Suporte, Jurídico, Logística, Marketing..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Descrição Curta (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Demandas internas, acompanhamento e atendimentos deste setor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Cor de Identificação
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-bold'
                        : 'border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${c.bg}`} />
                    <span className="truncate">{c.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-blue-600 dark:text-blue-400 shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Ícone Representativo
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {ICON_OPTIONS.map((opt) => {
                const IconComponent = opt.Icon;
                const isSelected = icon === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIcon(opt.id)}
                    title={opt.label}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-transparent rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/25 active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Alterações' : 'Criar Área'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
