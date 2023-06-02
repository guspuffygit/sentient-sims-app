import { AppBar, Box, Button, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function MenuBar() {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 2 }}>
      <AppBar
        position="static"
        color="transparent"
        sx={{ backgroundColor: '#313339' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <div>
            <Button
              color="secondary"
              onClick={() => navigate('/')}
              sx={{ margin: '10px' }}
            >
              HOME
            </Button>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuBar;
