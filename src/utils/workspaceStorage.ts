import { ActivePanel, AppMode, MobileStep, PanelDetailState } from '../types';

export const defaultPanelState: PanelDetailState = {
  topCategoryId: 'top-1',
  categoryId: null,
  subItemId: null,
  activeTab: 'check',
};

export const loadPanelState = (key: string): PanelDetailState => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.topCategoryId) {
        return { ...parsed, activeTab: parsed.activeTab || 'check' };
      }
    }
  } catch {}
  return defaultPanelState;
};

export const loadAppMode = (): AppMode => {
  try {
    const m = localStorage.getItem('sb_app_mode');
    if (m === 'workspace' || m === 'calendar') return m;
  } catch {}
  return 'workspace';
};

export const loadActivePanel = (): ActivePanel => {
  try {
    const p = localStorage.getItem('sb_active_panel');
    if (p === 'panel-3' || p === 'panel-4') return p;
  } catch {}
  return 'panel-3';
};

export const loadMobileStep = (p: PanelDetailState): MobileStep => {
  try {
    const s = localStorage.getItem('sb_mobile_step');
    if (s === 'detail' || s === 'memo') return p.subItemId ? 'detail' : (p.categoryId ? 'subitem' : 'category');
    if (s === 'subitem') return p.categoryId ? 'subitem' : 'category';
    if (s === 'category') return 'category';
  } catch {}
  return p.subItemId ? 'detail' : (p.categoryId ? 'subitem' : 'category');
};

export const saveWorkspaceLocalState = (
  panel3: PanelDetailState,
  panel4: PanelDetailState,
  appMode: AppMode,
  mobileStep: MobileStep,
  activePanel: ActivePanel
) => {
  try {
    localStorage.setItem('sb_panel3_state_v2', JSON.stringify(panel3));
    localStorage.setItem('sb_panel4_state_v2', JSON.stringify(panel4));
    localStorage.setItem('sb_app_mode', appMode);
    localStorage.setItem('sb_mobile_step', mobileStep);
    localStorage.setItem('sb_active_panel', activePanel);
  } catch {}
};
