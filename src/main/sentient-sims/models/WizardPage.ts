export enum WizardPage {
  INIT = 'init',
  MOD_SETUP = 'mod_setup',
  CONNECT_MOD = 'connect_mod',
  INSTALL_MOD = 'install_mod',
  AI_PROVIDER_SETUP = 'ai_provider_setup',
  SENTIENT_SIMS_AI_SETUP = 'sentient_sims_ai_setup',
  OPEN_AI_SETUP = 'open_ai_setup',
  GEMINI_SETUP = 'gemini_setup',
  SELF_HOSTED_SETUP = 'self_hosted_setup',
}

export function toWizardPage(wizardPage?: string): WizardPage {
  if (Object.values(WizardPage).includes(wizardPage as WizardPage)) {
    return wizardPage as WizardPage;
  }

  throw Error(`Unknown WizardPage ${wizardPage}`);
}
