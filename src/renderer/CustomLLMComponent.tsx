import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AppCard from './AppCard';
import { useCustomLLMHealth } from './hooks/useCustomLLM';

export type CustomLLMComponentProperties = {
  aiName: string;
};

export default function CustomLLMComponent({ aiName }: CustomLLMComponentProperties) {
  const { customLLMStatus, testCustomLLM } = useCustomLLMHealth();

  return (
    <AppCard>
      <Typography sx={{ marginBottom: 3 }}>
        {aiName} Status: {customLLMStatus.status}
      </Typography>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <LoadingButton
            loading={customLLMStatus.loading}
            onClick={() => {
              testCustomLLM();
            }}
            color="primary"
            variant="outlined"
          >
            Test
          </LoadingButton>
        </div>
      </div>
    </AppCard>
  );
}
