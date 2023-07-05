import {
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { LastExceptionFile } from 'main/sentient-sims/lastException';
import { useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppCard from './AppCard';

export default function LastExceptionPage() {
  const [lastExceptionFiles, setLastExceptionFiles] = useState<
    LastExceptionFile[]
  >([]);
  const [selectedException, setSelectedException] = useState<
    LastExceptionFile | undefined
  >();

  async function getLastExceptionFiles() {
    const response = await fetch('http://localhost:25148/files/last-exception');
    const jsonResponse = await response.json();
    setLastExceptionFiles(jsonResponse);
  }

  useEffect(() => {
    getLastExceptionFiles();
  });

  async function handleClearAll() {
    await fetch('http://localhost:25148/files/last-exception', {
      method: 'DELETE',
    });
    await getLastExceptionFiles();
  }

  const renderRows: any = [];

  lastExceptionFiles.forEach((lastExceptionFile) => {
    renderRows.push(
      <ListItem key={lastExceptionFile.filename} component="div" disablePadding>
        <ListItemButton onClick={() => setSelectedException(lastExceptionFile)}>
          <ListItemText primary={`${lastExceptionFile.filename}`} />
        </ListItemButton>
      </ListItem>
    );
  });

  if (lastExceptionFiles.length === 0) {
    return <AppCard>No lastException files exist</AppCard>;
  }

  return (
    <AppCard>
      {selectedException ? (
        <div style={{ marginBottom: 2 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => setSelectedException(undefined)}
              >
                <ArrowBackIcon sx={{ margin: 1 }} />
              </IconButton>
            </div>
            <div>
              <Typography variant="body1" sx={{ margin: 1 }}>
                {selectedException.filename}
              </Typography>
            </div>
          </div>
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div />
            <div style={{ marginRight: 2 }}>
              <Button
                color="error"
                variant="outlined"
                onClick={() => handleClearAll()}
              >
                Clear All
              </Button>
            </div>
          </div>
          <div>
            <Divider sx={{ margin: 2 }} />
            <List component="nav">{renderRows}</List>
          </div>
        </div>
      )}
    </AppCard>
  );
}
