/* eslint-disable promise/always-return */
import {
  Box,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import { ReactNode, useEffect, useState } from 'react';
import log from 'electron-log';
import { SaveGame } from 'main/sentient-sims/models/SaveGame';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import AppCard from './AppCard';
import { EmptyState } from './components/EmptyState';

const client = new SentientSimsAppClient();

type SaveGameParticipants = {
  saveGame: SaveGame;
  participants?: ParticipantDTO[];
};

export default function OfflineMemory() {
  const [saveGames, setSaveGames] = useState<Record<string, SaveGameParticipants>>({});
  const [selectedSaveGame, setSelectedSaveGame] = useState('');
  const [simsViewOpen, setSimsViewOpen] = useState(false);

  useEffect(() => {
    void client.db.getSaveGames().then((newSaveGames) => {
      const newSaveGameRecords: Record<string, SaveGameParticipants> = {};
      newSaveGames.forEach((saveGame) => {
        newSaveGameRecords[`${saveGame.name}${saveGame.type}`] = {
          saveGame,
          participants: [],
        };
      });
      setSaveGames(newSaveGameRecords);
    });
  }, []);

  const viewSims = async (saveGame: SaveGame) => {
    const result = await client.participant.getParticipants(saveGame.name, saveGame.type);
    const newSaveGameRecords = { ...saveGames };
    if (result.length > 0) {
      newSaveGameRecords[`${saveGame.name}${saveGame.type}`].participants = result;
      setSaveGames(newSaveGameRecords);
      setSelectedSaveGame(`${saveGame.name}${saveGame.type}`);
      setSimsViewOpen(true);
    } else {
      newSaveGameRecords[`${saveGame.name}${saveGame.type}`].participants = undefined;
      setSaveGames(newSaveGameRecords);
    }
    log.info(`Got sims: ${result.length}`);
  };

  const tableRows: ReactNode[] = [];
  if (selectedSaveGame in saveGames) {
    saveGames[selectedSaveGame].participants?.forEach((sim) => {
      tableRows.push(
        <TableRow key={sim.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
          <TableCell component="th" scope="row" sx={{ fontWeight: 600, verticalAlign: 'top' }}>
            {sim.name}
          </TableCell>
          <TableCell align="left">{sim.description}</TableCell>
        </TableRow>,
      );
    });
  }

  const saveGameCount = Object.keys(saveGames).length;
  const selectedSaveGameParticipants = selectedSaveGame in saveGames ? saveGames[selectedSaveGame] : undefined;

  return (
    <>
      {saveGameCount === 0 ? (
        <EmptyState
          icon={<StorageOutlinedIcon />}
          title="No save games found"
          description="Save games recorded by the mod in the local database will show up here."
        />
      ) : (
        <AppCard
          title="Save games"
          subtitle={`${saveGameCount} save game${saveGameCount === 1 ? '' : 's'} in the local database`}
          icon={<SaveOutlinedIcon sx={{ fontSize: 18 }} />}
        >
          <TableContainer sx={{ maxHeight: 560, overflow: 'auto' }}>
            <Table sx={{ 'minWidth': 650, '& td, & th': { borderColor: 'divider' } }} aria-label="simple table">
              <TableHead sx={{ '& th': { color: 'text.secondary', fontWeight: 600 } }}>
                <TableRow>
                  <TableCell align="left">Save Game</TableCell>
                  <TableCell align="left">Type</TableCell>
                  <TableCell align="left">Sims</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(saveGames).map((saveGameParticipants) => (
                  <TableRow
                    key={saveGameParticipants.saveGame.name}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      {saveGameParticipants.saveGame.name}
                    </TableCell>
                    <TableCell align="left" sx={{ color: 'text.secondary' }}>
                      {saveGameParticipants.saveGame.type}
                    </TableCell>
                    <TableCell align="left">
                      {saveGameParticipants.participants !== undefined ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={() => {
                            void viewSims(saveGameParticipants.saveGame);
                          }}
                        >
                          View Sims
                        </Button>
                      ) : (
                        <Typography sx={{ color: 'text.disabled' }}>-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AppCard>
      )}
      <Modal
        open={simsViewOpen}
        onClose={() => {
          setSimsViewOpen(false);
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 1000,
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 700,
            overflow: 'auto',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '14px',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
            padding: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, marginBottom: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: '10px',
                backgroundColor: (theme) => `${theme.palette.primary.main}1f`,
                color: 'primary.light',
                flexShrink: 0,
              }}
            >
              <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <div>
              <Typography variant="h6">Sims</Typography>
              {selectedSaveGameParticipants ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {selectedSaveGameParticipants.saveGame.name}
                </Typography>
              ) : null}
            </div>
          </Box>
          <TableContainer>
            <Table sx={{ 'minWidth': 800, '& td, & th': { borderColor: 'divider' } }} aria-label="simple table">
              <TableHead sx={{ '& th': { color: 'text.secondary', fontWeight: 600 } }}>
                <TableRow>
                  <TableCell align="left">Sim Name</TableCell>
                  <TableCell align="left">Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{tableRows}</TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
    </>
  );
}
