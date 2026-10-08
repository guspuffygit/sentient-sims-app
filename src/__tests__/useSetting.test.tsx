/* eslint-disable @typescript-eslint/no-deprecated -- the test runtime has no DOM, so react-test-renderer is the only way to mount hooks here */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createContext, createElement, ReactNode, use, useEffect, useState } from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting, { SettingsHook } from 'renderer/hooks/useSetting';

const SettingContext = createContext<SettingsHook<string> | undefined>(undefined);

let effectRuns = 0;

// Mirrors the setup wizard: a provider that re-renders on its own, and a page whose
// mount effect writes the setting. With a fresh hook result per render the effect
// re-ran on every provider render and the tree looped until React gave up.
function Provider({ children, pokeRef }: { children?: ReactNode; pokeRef: { current: () => void } }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    pokeRef.current = () => {
      setTick(tick + 1);
    };
  }, [pokeRef, tick]);
  const setting = useSetting<string>(SettingsEnum.AI_API_TYPE, 'sentientsimsai');
  return createElement(SettingContext, { value: setting }, children);
}

function Page() {
  const setting = use(SettingContext);
  useEffect(() => {
    effectRuns += 1;
    void setting?.setSetting('sentientsimsai');
  }, [setting]);
  return null;
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
  });
}

describe('useSetting', () => {
  beforeEach(() => {
    effectRuns = 0;
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('window', {
      electron: {
        setSetting: vi.fn(),
        resetSetting: vi.fn(),
        onSettingChange: vi.fn(() => () => {}),
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ value: 'sentientsimsai' })))),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a stable result so a mount effect keyed on it does not loop', async () => {
    const pokeRef = { current: () => {} };
    let renderer: ReactTestRenderer | undefined;

    await act(() => {
      renderer = create(
        createElement(
          QueryClientProvider,
          { client: new QueryClient() },
          createElement(Provider, { pokeRef }, createElement(Page)),
        ),
      );
    });
    await settle();
    const runsAfterLoad = effectRuns;

    await act(() => {
      pokeRef.current();
    });
    await settle();

    expect(effectRuns).toBe(runsAfterLoad);
    expect(effectRuns).toBeLessThanOrEqual(2);
    renderer?.unmount();
  });
});
