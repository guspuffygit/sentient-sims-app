import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, FormHelperText, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeName, generationApiTypes } from 'main/sentient-sims/models/ApiType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { useProviderConnectionStatus } from '../hooks/useProviderConnectionStatus';
import useSetting from '../hooks/useSetting';
import { ProviderConnectionPanel } from './ProviderConnectionPanel';

export function ConnectionStatusChip({ apiType }: { apiType: ApiType }) {
  const status = useProviderConnectionStatus(apiType);
  if (status.loading) {
    return null;
  }
  return <Chip size="small" variant="outlined" color={status.ready ? 'success' : 'default'} label={status.label} />;
}

function connectionUsageCount(configs: AIProviderConfig[], apiType: ApiType): number {
  return configs.filter(
    (config) =>
      config.apiType === apiType ||
      // CustomAI configs use the Sentient Sims AI connection
      (apiType === ApiType.SentientSimsAI && config.apiType === ApiType.CustomAI),
  ).length;
}

function usageLabel(count: number): string {
  if (count === 0) {
    return 'Not used by any configuration';
  }
  return `Used by ${count} configuration${count === 1 ? '' : 's'}`;
}

// Every generation provider is always listed so its connection can be set up
// before the first configuration referencing it exists.
export function ProviderConnectionSettingsComponent() {
  const configsSetting = useSetting<AIProviderConfig[]>(SettingsEnum.AI_PROVIDER_CONFIGS, []);

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Typography variant="h6">Provider Connections</Typography>
      <FormHelperText sx={{ marginBottom: 1 }}>
        API keys and endpoints are set once per provider and shared by every configuration using that provider.
      </FormHelperText>
      {generationApiTypes.map((apiType) => (
        <Accordion key={apiType} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginRight: 1 }}>
              <Typography sx={{ marginRight: 2 }}>{ApiTypeName(apiType)}</Typography>
              <ConnectionStatusChip apiType={apiType} />
              <Typography variant="body2" sx={{ marginLeft: 'auto', color: 'text.secondary' }}>
                {usageLabel(connectionUsageCount(configsSetting.value, apiType))}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <ProviderConnectionPanel apiType={apiType} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
