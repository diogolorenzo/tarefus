import React from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { DueTodayAlertBanner } from './components/DueTodayAlertBanner';
import { CommercialStatusBanner } from './components/CommercialStatusBanner';
import { BoardView } from './components/BoardView';
import { MyTasksView } from './components/MyTasksView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/TaskModal';
import { BoardModal } from './components/BoardModal';
import { LoginModal } from './components/LoginModal';
import { HelpCenterModal } from './components/help/HelpCenterModal';
import { GuidedTour } from './components/tour/GuidedTour';
import { AuthPage } from './components/auth/AuthPage';
import { ToastContainer } from './components/ToastContainer';

const MainContent: React.FC = () => {
  const { activeTab, isAuthenticated, currentUser, isHelpCenterOpen, setIsHelpCenterOpen } = useTaskContext();

  if (!isAuthenticated || !currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200 transition-colors duration-200 relative">
      <Navbar />
      <CommercialStatusBanner />
      <DueTodayAlertBanner />
      <main className="flex-1 flex flex-col">
        {activeTab === 'board' && <BoardView />}
        {activeTab === 'my-tasks' && <MyTasksView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Modals & Overlays */}
      <TaskModal />
      <BoardModal />
      <LoginModal />
      <HelpCenterModal
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
      />
      <GuidedTour />
    </div>
  );
};

function App() {
  return (
    <TaskProvider>
      <MainContent />
      <ToastContainer />
    </TaskProvider>
  );
}

export default App;
