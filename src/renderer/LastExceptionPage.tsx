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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LastExceptionFile } from 'main/sentient-sims/lastException';
import { useState } from 'react';
import AppCard from './AppCard';
import useLastExceptionFiles from './hooks/useLastExceptionFiles';
import SpaceBetweenDiv from './components/SpaceBetweenDiv';

export default function LastExceptionPage() {
  const [selectedException, setSelectedException] = useState<
    LastExceptionFile | undefined
  >();
  const { lastExceptionFiles, deleteFiles } = useLastExceptionFiles();

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
          <SpaceBetweenDiv>
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
              <Button
                color="error"
                variant="outlined"
                onClick={() => deleteFiles()}
              >
                Clear All
              </Button>
            </div>
          </SpaceBetweenDiv>
          <div>
            <Divider sx={{ margin: 2 }} />
            <List component="nav">{renderRows}</List>
          </div>
        </div>
      )}
    </AppCard>
  );
}
