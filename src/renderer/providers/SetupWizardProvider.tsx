import { createContext, Dispatch, ReactNode, SetStateAction, use, useMemo, useState } from 'react';
import { SetupWizardModal } from 'renderer/components/SetupWizardModal';

interface SetupWizardContextType {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SetupWizardContext = createContext<SetupWizardContextType | undefined>(undefined);

interface SetupWizardProviderProps {
  children: ReactNode;
}

// Custom hook to use the SetupWizardContext
export function useSetupWizard() {
  const context = use(SetupWizardContext);
  if (!context) {
    throw new Error('useSetupWizard must be used within a SetupWizardProvider');
  }
  return context;
}

export function SetupWizardProvider({ children }: SetupWizardProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const contextValue = useMemo(() => {
    return { isOpen, setOpen: setIsOpen };
  }, [isOpen]);

  return (
    <SetupWizardContext value={contextValue}>
      <SetupWizardModal open={isOpen} setOpen={setIsOpen} />
      {children}
    </SetupWizardContext>
  );
}
