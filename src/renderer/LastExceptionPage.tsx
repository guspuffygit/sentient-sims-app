import { Button, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import { LastExceptionFile } from 'main/sentient-sims/services/LastExceptionService';
import AppCard from './AppCard';
import useLastExceptionFiles from './hooks/useLastExceptionFiles';
import SpaceBetweenDiv from './components/SpaceBetweenDiv';

export default function LastExceptionPage() {
  const [selectedException, setSelectedException] = useState<LastExceptionFile | undefined>();
  const { lastExceptionFiles, deleteFiles, refresh } = useLastExceptionFiles();

  const renderRows: any = [];

  lastExceptionFiles.forEach((lastExceptionFile) => {
    renderRows.push(
      <ListItem key={lastExceptionFile.filename} component="div" disablePadding>
        <ListItemButton onClick={() => setSelectedException(lastExceptionFile)}>
          <ListItemText primary={`${lastExceptionFile.filename}`} secondary={lastExceptionFile.created.toUTCString()} />
        </ListItemButton>
      </ListItem>,
    );
  });

  return (
    <AppCard>
      {selectedException ? (
        <div style={{ marginBottom: 2 }}>
          <SpaceBetweenDiv>
            <div>
              <IconButton aria-label="delete" size="small" onClick={() => setSelectedException(undefined)}>
                <ArrowBackIcon sx={{ margin: 1 }} />
              </IconButton>
            </div>
            <div>
              <Typography variant="body1" sx={{ margin: 1 }}>
                {selectedException.filename}
              </Typography>
            </div>
          </SpaceBetweenDiv>
          <textarea
            value={selectedException.text}
            rows={selectedException.text.split('\n').length}
            style={{ marginTop: 5 }}
            className="code-window"
            spellCheck={false}
            autoCorrect="off"
            readOnly
          />
        </div>
      ) : (
        <div>
          <SpaceBetweenDiv>
            <div />
            <div style={{ marginRight: 2 }}>
              <Button onClick={() => refresh()} variant="outlined" sx={{ marginRight: 2 }}>
                Refresh
              </Button>
              <Button
                color="error"
                variant="outlined"
                disabled={lastExceptionFiles.length === 0}
                onClick={() => deleteFiles()}
              >
                Clear All
              </Button>
            </div>
          </SpaceBetweenDiv>
          <div>
            <Divider sx={{ margin: 2 }} />
            {lastExceptionFiles.length === 0 ? (
              <Typography>No lastException files exist</Typography>
            ) : (
              <List component="nav">{renderRows}</List>
            )}
          </div>
        </div>
      )}
    </AppCard>
  );
}
