import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  History,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  Trash2,
  Plus,
} from 'lucide-react';

export const AuditLogsSettings: React.FC = () => {
  const { activityLogs } = useTaskContext();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      (log.taskTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterAction !== 'all') {
      if (filterAction === 'move') {
        if (log.action !== 'move' && log.action !== 'status_change') return false;
      } else if (log.action !== filterAction) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-line">
        <div>
          <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Auditoria de Atividades</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Histórico e logs de eventos operacionais
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por responsável, tarefa ou ação..."
            className="w-full pl-9.5 pr-4 py-2 bg-surface border border-line rounded-xl text-xs font-semibold text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filterAction === 'all'
                ? 'bg-surface text-ink shadow-2xs font-bold'
                : 'text-muted'
            }`}
          >
            Todos ({activityLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('create')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filterAction === 'create'
                ? 'bg-surface text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                : 'text-muted'
            }`}
          >
            Criações
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('move')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filterAction === 'move'
                ? 'bg-surface text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                : 'text-muted'
            }`}
          >
            Movimentações
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('complete')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filterAction === 'complete'
                ? 'bg-surface text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                : 'text-muted'
            }`}
          >
            Conclusões
          </button>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-ink">Nenhum registro de atividade encontrado</p>
            <p className="text-xs text-subtle mt-1">
              As ações de criação, movimentação e edição de tarefas serão registradas aqui em tempo real.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {filteredLogs.map((log) => {
              const formattedDate = new Date(log.timestamp).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:px-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      {log.action === 'create' ? (
                        <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : log.action === 'complete' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : log.action === 'delete' ? (
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-ink">
                          {log.userName}
                        </span>
                        <span className="text-xs text-muted">
                          {log.details}
                        </span>
                      </div>
                      {log.taskTitle && (
                        <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                          Tarefa: {log.taskTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-subtle shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
