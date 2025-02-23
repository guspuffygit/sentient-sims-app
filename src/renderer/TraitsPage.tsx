/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { useEffect, useState, ChangeEvent, use, useMemoMemo } from 'react';
import { appApiUrl } from 'main/sentient-sims/constants';
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import log from 'electron-log';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDarkReasonable } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { TraitMapping } from 'main/sentient-sims/descriptions/traitDescriptions';
import { TraitXMLType } from 'main/sentient-sims/models/TraitType';
import AppCard from './AppCard';

type TraitResponse = {
  data: TraitMapping[];
};

const selectMenuItems = [<MenuItem value="">NO FILTER</MenuItem>];
Object.values(TraitXMLType).forEach((trait) => {
  selectMenuItems.push(<MenuItem value={trait}>{trait}</MenuItem>);
});

export default function TraitsPage() {
  const [traits, setTraits] = useState<TraitMapping[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputField, setInputField] = useState('');
  const [filterTraitType, setFilterTraitType] = useState<string>('');

  const filteredTraits = useMemo(() => {
    if (filterTraitType) {
      return traits.filter((trait) => trait.trait_type === filterTraitType);
    }

    return traits;
  }, [traits, filterTraitType]);

  useEffect(() => {
    fetch(`${appApiUrl}/traits`)
      .then((result) => result.json())
      .then((response: TraitResponse) => {
        log.debug(JSON.stringify(response.data, null, 2));
        setTraits(response.data);
      });
  }, []);

  useEffect(() => {
    if (filteredTraits.length > 0) {
      setInputField(filteredTraits[selectedIndex]?.description || '');
    } else {
      setInputField('');
    }
  }, [selectedIndex, filteredTraits]);

  const updateIgnored = (value: number | string) => {
    setTraits((previousTraits) => {
      const updatedTraits = [...previousTraits];

      let ignored: boolean | undefined;
      if (value === 1) {
        ignored = true;
      } else if (value === 2) {
        ignored = false;
      }

      updatedTraits[selectedIndex] = {
        ...updatedTraits[selectedIndex],
        ignored,
      };
      return updatedTraits;
    });
  };

  const handleChangeIgnored = (event: SelectChangeEvent<number>) => {
    updateIgnored(event.target.value);
  };

  const handleChangeTraitType = (event: SelectChangeEvent<string>) => {
    setFilterTraitType(event.target.value);
  };

  function updateDescription() {
    setTraits((previousTraits) => {
      const updatedTraits = [...previousTraits];

      let description: string | undefined;
      if (inputField) {
        description = inputField;
      }

      updatedTraits[selectedIndex] = {
        ...updatedTraits[selectedIndex],
        description,
      };
      return updatedTraits;
    });
  }

  const handleBack = () => {
    if (selectedIndex > 0) {
      updateDescription();
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setInputField(filteredTraits[newIndex]?.description || '');
    }
  };

  const handleForward = () => {
    if (selectedIndex + 1 < filteredTraits.length) {
      updateDescription();
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setInputField(filteredTraits[newIndex]?.description || '');
    }
  };

  const handleSkip = () => {
    updateDescription();
    // eslint-disable-next-line no-plusplus
    for (let i = selectedIndex + 1; i < filteredTraits.length; i++) {
      if (
        !filteredTraits[i]?.description &&
        filteredTraits[i]?.ignored === undefined
      ) {
        setSelectedIndex(i);
        setInputField(filteredTraits[i]?.description || '');
        break;
      }
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputField(event.target.value);
  };

  const exportResults = () => {
    const results: Record<string, TraitMapping> = {};

    filteredTraits
      .filter((trait) => trait.description || trait?.ignored)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((trait) => {
        results[trait.name] = {
          name: trait.name,
          ignored: trait.ignored,
          description: trait.description,
        };
      });

    log.info(JSON.stringify(results, null, 2));
  };

  const xml: string | string[] = filteredTraits[selectedIndex]?.xml || [];

  let ignored = 0;
  if (filteredTraits[selectedIndex]?.ignored === true) {
    ignored = 1;
  } else if (filteredTraits[selectedIndex]?.ignored === false) {
    ignored = 2;
  }

  let unmapped = 0;
  filteredTraits.forEach((trait) => {
    if (!trait?.description && trait?.ignored === undefined) {
      unmapped += 1;
    }
  });

  return (
    <AppCard>
      <Box sx={{ m: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormHelperText>
              Name: {filteredTraits[selectedIndex]?.name}
            </FormHelperText>
            <FormHelperText>
              Class: {filteredTraits[selectedIndex]?.class}
            </FormHelperText>
          </Grid>

          <Grid item xs={12} sm={4} container spacing={1}>
            <Grid item xs={6}>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={ignored}
                label="Ignored?"
                onChange={handleChangeIgnored}
                fullWidth
              >
                <MenuItem value={0}>Ignored?</MenuItem>
                <MenuItem value={1}>True</MenuItem>
                <MenuItem value={2}>False</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={6}>
              <Select
                labelId="trait-type-label"
                id="trait-type"
                value={filterTraitType}
                label="Trait Type"
                onChange={handleChangeTraitType}
                fullWidth
              >
                {selectMenuItems}
              </Select>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography>
              {selectedIndex + 1} / {filteredTraits.length} - Unmapped:{' '}
              {unmapped}
            </Typography>
          </Grid>

          {/* Row 2: TextField */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="outlined-basic"
              label="Outlined"
              variant="outlined"
              fullWidth
              value={inputField}
              onChange={handleDescriptionChange}
            />
          </Grid>

          {/* Row 4: Buttons */}
          <Grid
            item
            xs={12}
            container
            spacing={1}
            justifyContent="center"
            sm={5}
          >
            <Grid item>
              <Button onClick={handleBack}>Back</Button>
            </Grid>
            <Grid item>
              <Button
                onClick={() => {
                  updateIgnored(1);
                  setInputField('');
                  handleForward();
                }}
              >
                Next (IGNORE)
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={handleForward}>Next</Button>
            </Grid>
            <Grid item>
              <Button onClick={handleSkip}>Skip</Button>
            </Grid>
            <Grid item>
              <Button onClick={exportResults}>Export</Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <SyntaxHighlighter language="xml" style={atomOneDarkReasonable}>
        {xml}
      </SyntaxHighlighter>
    </AppCard>
  );
}
