import React, { useState, useMemo, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  KEYBOARD_SHORTCUTS,
  AI_PROMPT_EXAMPLES,
} from '../../data/helpData';
import {
  HelpCircle,
  Search,
  X,
  ChevronDown,
  Sparkles,
  Command,
  Compass,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Keyboard,
  Play,
} from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { startTour, openTaskModal } = useTaskContext();
  const [activeTab, setActiveTab] = useState<'faq' | 'shortcuts' | 'ai-guide' | 'tour'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter FAQ items
  const filteredFaqItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      if (!matchCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inQuestion = item.question.toLowerCase().includes(query);
        const inAnswer = item.answer.toLowerCase().includes(query);
        const inTags = item.tags.some((tag) => tag.toLowerCase().includes(query));
        return inQuestion || inAnswer || inTags;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleStartTourFromHelp = () => {
    onClose();
    setTimeout(() => {
      startTour();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0E1424] border border-slate-200/90 dark:border-white/[0.08] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Central de Ajuda & Conhecimento
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/50">
                  Tarefus MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guias práticos, atalhos de produtividade e tutorial interativo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Central de Ajuda"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#0E1424]">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.03]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Perguntas Frequentes (FAQ)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shortcuts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'shortcuts'
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.03]'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Atalhos de Teclado</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ai-guide'
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.03]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>Guia de IA & Boas Práticas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tour')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tour'
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.03]'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Tour Interativo</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: FAQ Pesquisável */}
          {activeTab === 'faq' && (
            <div className="space-y-5">
              {/* Search Bar & Category Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar por dúvidas, recursos, atalhos ou permissões..."
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {FAQ_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-2.5">
                {filteredFaqItems.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Nenhuma dúvida encontrada para "{searchQuery}"
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Tente buscar com outros termos ou navegue pelas categorias acima.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Limpar pesquisa e filtros
                    </button>
                  </div>
                ) : (
                  filteredFaqItems.map((item) => {
                    const isExpanded = expandedFaqId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`border rounded-2xl transition-all overflow-hidden ${
                          isExpanded
                            ? 'bg-slate-50/70 dark:bg-white/[0.03] border-indigo-200 dark:border-indigo-500/30 shadow-xs'
                            : 'bg-white dark:bg-white/[0.01] border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(item.id)}
                          className="w-full px-4 py-3.5 flex items-center justify-between text-left gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 shrink-0">
                              {item.categoryLabel}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {item.question}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] space-y-2 whitespace-pre-line animate-fade-in">
                            <p>{item.answer}</p>
                            {item.tags.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Guia de Atalhos de Teclado */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
                <Command className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <strong className="font-bold">Produtividade Máxima:</strong> Pressione as teclas correspondentes em qualquer tela do sistema para realizar ações instantâneas sem tirar as mãos do teclado.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {KEYBOARD_SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="p-3.5 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {shortcut.description}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {shortcut.categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-[#1A2234] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/[0.15] rounded-lg shadow-2xs min-w-[28px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Guia de IA & Boas Práticas */}
          {activeTab === 'ai-guide' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/60 dark:border-purple-500/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Como tirar o máximo proveito do Assistente Tarefus IA
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    O Tarefus entende linguagem natural tanto por <strong>voz (microfone)</strong> quanto por <strong>digitação livre</strong>. Ele extrai automaticamente prazos, nomes de responsáveis, quadro de destino e sub-etapas.
                  </p>
                </div>
              </div>

              {/* Do's & Don'ts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Boas Práticas (Do's) */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/80 dark:border-emerald-800/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Como obter o melhor resultado</span>
                  </div>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Cite datas relativas:</strong> "amanhã às 14h", "até sexta-feira", "no fim do mês".</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Mencione o colaborador:</strong> "com a Beatriz", "atribuir para o Carlos e Rodrigo".</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Peça checklist:</strong> "com checklist de orçamento, contrato e envio".</span>
                    </li>
                  </ul>
                </div>

                {/* Evitar (Don'ts) */}
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/80 dark:border-rose-800/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs sm:text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>O que evitar</span>
                  </div>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span><strong>Comandos vagos:</strong> "fazer uma reunião" (sem contexto de tema, participante ou data).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span><strong>Múltiplos tópicos misturados:</strong> Tente criar uma tarefa para cada objetivo principal.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Real Examples by Department */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Exemplos Reais por Área Corporativa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {AI_PROMPT_EXAMPLES.map((ex) => (
                    <div
                      key={ex.department}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {ex.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-md bg-gradient-to-r ${ex.departmentColor}`}
                          >
                            {ex.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-[#121826] p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                          "{ex.prompt}"
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          ✨ <strong>Resultado:</strong> {ex.resultSummary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openTaskModal(null, 'todo');
                        }}
                        className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Testar agora no criador de tarefas</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Tour Interativo */}
          {activeTab === 'tour' && (
            <div className="space-y-6">
              <div className="text-center py-6 px-4 bg-gradient-to-b from-indigo-50/70 to-violet-50/30 dark:from-indigo-950/30 dark:to-purple-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Tutorial Interativo de Primeiro Acesso
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Um tour guiado e interativo de 5 passos que destaca cada área do sistema, demonstrando como operar o Kanban, criar tarefas com IA e gerenciar demandas.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartTourFromHelp}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Iniciar Tour Guiado Agora</span>
                  </button>
                </div>
              </div>

              {/* Steps Overview */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  O que você aprenderá no Tour:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Navegação e Visões</p>
                      <p className="text-slate-500 dark:text-slate-400">Quadros por Área e Minhas Tarefas</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Painel Kanban</p>
                      <p className="text-slate-500 dark:text-slate-400">Arrastar, soltar e fluxo de cartões</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Criação com IA & Voz</p>
                      <p className="text-slate-500 dark:text-slate-400">Automação de prazos e checklists</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Filtros & Busca</p>
                      <p className="text-slate-500 dark:text-slate-400">Pesquisa instantânea e responsáveis</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-xl flex items-start gap-2.5 sm:col-span-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                      5
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Alertas, Ajuda e Perfil</p>
                      <p className="text-slate-500 dark:text-slate-400">Notificações, temas, Central de Ajuda e perfil corporativo com RBAC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] rounded text-[10px] font-mono font-bold">
              Esc
            </kbd>
            <span>para fechar</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200/80 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
