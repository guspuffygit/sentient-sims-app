/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import {
  Box,
  Button,
  Card,
  CardContent,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';
import { DbClient } from 'main/sentient-sims/clients/DbClient';
import { SaveGame } from 'main/sentient-sims/models/SaveGame';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';

const dbClient = new DbClient();

type SaveGameParticipants = {
  saveGame: SaveGame;
  participants?: ParticipantDTO[];
};

export default function OfflineMemory() {
  const [saveGames, setSaveGames] = useState<Record<string, SaveGameParticipants>>({});
  const [selectedSaveGame, setSelectedSaveGame] = useState('');
  const [simsViewOpen, setSimsViewOpen] = useState(false);

  useEffect(() => {
    dbClient.getSaveGames().then((newSaveGames) => {
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
    const response = await fetch(
      `${appApiUrl}/participants?saveGameId=${saveGame.name}&saveGameType=${saveGame.type.toString()}`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const result: ParticipantDTO[] = await response.json();
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

  const tableRows: any = [];
  if (selectedSaveGame in saveGames) {
    saveGames[selectedSaveGame].participants?.forEach((sim) => {
      tableRows.push(
        <TableRow key={sim.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
          <TableCell component="th" scope="row">
            {sim.name}
          </TableCell>
          <TableCell align="left">{sim.description}</TableCell>
        </TableRow>,
      );
    });
  }

  return (
    <Card
      sx={{
        minWidth: 275,
        maxHeight: 700,
        marginBottom: 2,
        overflow: 'auto',
      }}
    >
      <CardContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
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
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {saveGameParticipants.saveGame.name}
                  </TableCell>
                  <TableCell align="left">{saveGameParticipants.saveGame.type}</TableCell>
                  <TableCell align="left">
                    {saveGameParticipants.participants !== undefined ? (
                      <Button onClick={() => viewSims(saveGameParticipants.saveGame)}>View Sims</Button>
                    ) : (
                      <Typography>-</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <Modal open={simsViewOpen} onClose={() => setSimsViewOpen(false)}>
        <Box
          height={700}
          overflow="auto"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 1000,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 800 }} aria-label="simple table">
              <TableHead>
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
    </Card>
  );
}
