import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { FourPanelLayout } from './components/layout/FourPanelLayout';
import { CategoryPanel } from './components/panels/CategoryPanel';
import { SubItemPanel } from './components/panels/SubItemPanel';
import { DetailPanel } from './components/panels/DetailPanel';
import { GanttMemoPanel } from './components/panels/GanttMemoPanel';
import { GoogleCalendarLayout } from './components/googlecalendar/GoogleCalendarLayout';

const AppContent: React.FC = () => {
  const { appMode } = useWorkspace();

  if (appMode === 'calendar') {
    return <GoogleCalendarLayout />;
  }

  return (
    <FourPanelLayout
      panel1={<CategoryPanel />}
      panel2={<SubItemPanel />}
      panel3={<DetailPanel panelId="panel-3" />}
      panel4={<GanttMemoPanel />}
    />
  );
};

export const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
};

export default App;
