import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetDb } from '@/services/mock/db';

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  resetDb();
  window.localStorage.clear();
});

// jsdom implements neither of these, and several components rely on them.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);

if (!('structuredClone' in globalThis)) {
  vi.stubGlobal('structuredClone', <T,>(value: T): T => JSON.parse(JSON.stringify(value)));
}
