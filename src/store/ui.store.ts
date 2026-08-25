import { create } from 'zustand';
import { DEFAULT_INDENT_FILTERS } from '@/services/indent.service';
import type { IndentFilters } from '@/types';

export interface Toast {
  id: string;
  message: string;
  tone: 'success' | 'error' | 'info';
}

interface UiState {
  /** Indent filters live here so the sheet and the list share one source. */
  indentFilters: IndentFilters;
  setIndentFilters: (filters: IndentFilters) => void;
  resetIndentFilters: () => void;

  filterSheetOpen: boolean;
  setFilterSheetOpen: (open: boolean) => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  toasts: Toast[];
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  indentFilters: DEFAULT_INDENT_FILTERS,
  setIndentFilters: (indentFilters) => set({ indentFilters }),
  resetIndentFilters: () => set({ indentFilters: DEFAULT_INDENT_FILTERS }),

  filterSheetOpen: false,
  setFilterSheetOpen: (filterSheetOpen) => set({ filterSheetOpen }),

  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toasts: [],
  pushToast: (message, tone = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: `t_${Date.now()}_${state.toasts.length}`, message, tone }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
