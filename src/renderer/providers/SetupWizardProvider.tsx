import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SetupWizardModal } from 'renderer/components/SetupWizardModal';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { useWebsocket } from './WebsocketProvider';
import { useSnackBar } from './SnackBarProvider';

interface SetupWizardContextType {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SetupWizardContext = createContext<SetupWizardContextType | undefined>(undefined);

interface SetupWizardProviderProps {
  children: ReactNode;
}

// How long a set-up player's game may stay disconnected before the app offers the wizard
const NOT_CONNECTED_HINT_MS = 60_000;

// Custom hook to use the SetupWizardContext
export function useSetupWizard() {
  const context = use(SetupWizardContext);
  if (!context) {
    throw new Error('useSetupWizard must be used within a SetupWizardProvider');
  }
  return context;
}

export function SetupWizardProvider({ children }: SetupWizardProviderProps) {
  const setupComplete = useSetting<boolean>(SettingsEnum.SETUP_COMPLETE, false);
  const { status } = useWebsocket();
  const { showMessage } = useSnackBar();

  // Until the wizard has been finished once, it opens on its own at every
  // launch; once the player opens or closes it, their choice wins
  const [chosenOpen, setChosenOpen] = useState<boolean>();
  const isOpen = chosenOpen ?? (!setupComplete.isLoading && !setupComplete.value);
  const setIsOpen = useCallback((value: SetStateAction<boolean>) => {
    setChosenOpen((previous) => (typeof value === 'function' ? value(previous ?? false) : value));
  }, []);

  // A set-up player whose game never connects is offered the wizard once per launch
  const connectedRef = useRef(status.mod);
  useEffect(() => {
    connectedRef.current = status.mod;
  }, [status.mod]);
  const hintShownRef = useRef(false);
  useEffect(() => {
    if (setupComplete.isLoading || !setupComplete.value || hintShownRef.current) {
      return undefined;
    }
    const timer = setTimeout(() => {
      if (connectedRef.current || hintShownRef.current) {
        return;
      }
      hintShownRef.current = true;
      showMessage('The game is not connected yet. Having any trouble? Run the Setup Wizard.', 'info', {
        label: 'Setup Wizard',
        onClick: () => {
          setIsOpen(true);
        },
      });
    }, NOT_CONNECTED_HINT_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [setupComplete.isLoading, setupComplete.value, showMessage, setIsOpen]);

  const contextValue = useMemo(() => {
    return { isOpen, setOpen: setIsOpen };
  }, [isOpen, setIsOpen]);

  return (
    <SetupWizardContext value={contextValue}>
      <SetupWizardModal open={isOpen} setOpen={setIsOpen} />
      {children}
    </SetupWizardContext>
  );
}
