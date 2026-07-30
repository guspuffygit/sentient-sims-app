import { Box, Button, IconButton, List, ListItemButton, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { useState } from 'react';
import { LastExceptionFile } from 'main/sentient-sims/services/LastExceptionService';
import AppCard from './AppCard';
import useLastExceptionFiles from './hooks/useLastExceptionFiles';
import { EmptyState } from './components/EmptyState';

function ExceptionDetail({ file, onBack }: { file: LastExceptionFile; onBack: () => void }) {
  return (
    <AppCard
      title={file.filename}
      subtitle={file.created.toLocaleString()}
      icon={<ReportProblemOutlinedIcon sx={{ fontSize: 18 }} />}
      headerAction={
        <Tooltip title="Back to all exceptions">
          <IconButton size="small" onClick={onBack}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    >
      <textarea
        value={file.text}
        rows={Math.min(file.text.split('\n').length + 1, 28)}
        className="code-window"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 8,
          resize: 'vertical',
        }}
        spellCheck={false}
        autoCorrect="off"
        readOnly
      />
    </AppCard>
  );
}

export default function LastExceptionPage() {
  const [selectedException, setSelectedException] = useState<LastExceptionFile | undefined>();
  const { lastExceptionFiles, deleteFiles, refresh } = useLastExceptionFiles();

  return (
    <>
      {selectedException ? (
        <ExceptionDetail
          file={selectedException}
          onBack={() => {
            setSelectedException(undefined);
          }}
        />
      ) : (
        <>
          {lastExceptionFiles.length === 0 ? (
            <EmptyState
              icon={<ReportProblemOutlinedIcon />}
              title="No exceptions logged"
              description="When the mod hits an error in The Sims 4, the exception file will show up here."
            />
          ) : (
            <AppCard
              title="Exception files"
              subtitle={`${lastExceptionFiles.length} file${lastExceptionFiles.length === 1 ? '' : 's'}`}
              icon={<ReportProblemOutlinedIcon sx={{ fontSize: 18 }} />}
              headerAction={
                <>
                  <Button
                    variant="text"
                    color="secondary"
                    startIcon={<RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      void refresh();
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    color="error"
                    variant="text"
                    startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      void deleteFiles();
                    }}
                  >
                    Clear All
                  </Button>
                </>
              }
            >
              <List disablePadding>
                {lastExceptionFiles.map((lastExceptionFile) => (
                  <ListItemButton
                    key={lastExceptionFile.filename}
                    onClick={() => {
                      setSelectedException(lastExceptionFile);
                    }}
                    sx={{
                      borderRadius: 2,
                      paddingY: 1,
                      marginBottom: 0.25,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 600 }} noWrap>
                        {lastExceptionFile.filename}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {lastExceptionFile.created.toLocaleString()}
                      </Typography>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </AppCard>
          )}
        </>
      )}
    </>
  );
}
