/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { useEffect, useState, JSX, ChangeEvent } from 'react';
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
import { TraitMapping } from 'main/sentient-sims/descriptions/traitDescriptions2';
import AppCard from './AppCard';

type TraitResponse = {
  data: TraitMapping[];
};

export default function TraitsPage() {
  const [traits, setTraits] = useState<TraitMapping[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputField, setInputField] = useState('');
  const [filterTraitType, setFilterTraitType] = useState<string>('');

  useEffect(() => {
    fetch(`${appApiUrl}/traits?searchClass=Preference`)
      .then((result) => result.json())
      .then((response: TraitResponse) => {
        log.debug(JSON.stringify(response.data, null, 2));
        setTraits(response.data);
      });
  }, []);

  useEffect(() => {
    if (traits.length > 0) {
      setInputField(traits[selectedIndex]?.description || '');
    }
  }, [selectedIndex, traits]);

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
      if (filterTraitType) {
        log.debug(`Filter trait type: ${filterTraitType}`);
        for (let i = selectedIndex - 1; i > 0; i += -1) {
          if (traits[i]?.trait_type === filterTraitType) {
            setSelectedIndex(i);
            setInputField(traits[i]?.description || '');
            break;
          }
        }
      } else {
        const newIndex = selectedIndex - 1;
        setSelectedIndex(newIndex);
        setInputField(traits[newIndex]?.description || '');
      }
    }
  };

  const handleForward = () => {
    if (selectedIndex + 1 < traits.length) {
      updateDescription();
      if (filterTraitType) {
        for (let i = selectedIndex + 1; i < traits.length; i += +1) {
          if (traits[i]?.trait_type === filterTraitType) {
            setSelectedIndex(i);
            setInputField(traits[i]?.description || '');
            break;
          }
        }
      } else {
        const newIndex = selectedIndex + 1;
        setSelectedIndex(newIndex);
        setInputField(traits[newIndex]?.description || '');
      }
    }
  };

  const handleSkip = () => {
    updateDescription();
    // eslint-disable-next-line no-plusplus
    for (let i = selectedIndex + 1; i < traits.length; i++) {
      if (!traits[i]?.description && traits[i]?.ignored === undefined) {
        setSelectedIndex(i);
        setInputField(traits[i]?.description || '');
        break;
      }
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputField(event.target.value);
  };

  const exportResults = () => {
    const results: Record<string, TraitMapping> = {};

    traits
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

  const data: JSX.Element[] = [];

  traits.forEach((trait) => {
    data.push(<Typography>{trait.name}</Typography>);
  });

  if (traits.length === 0) {
    return null;
  }

  const xml: string | string[] = traits[selectedIndex]?.xml || [];

  let ignored = 0;
  if (traits[selectedIndex].ignored === true) {
    ignored = 1;
  } else if (traits[selectedIndex].ignored === false) {
    ignored = 2;
  }

  let unmapped = 0;
  traits.forEach((trait) => {
    if (!trait?.description && trait?.ignored === undefined) {
      unmapped += 1;
    }
  });

  return (
    <AppCard>
      <Box sx={{ m: 1 }} display="flex">
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <FormHelperText>Name: {traits[selectedIndex].name}</FormHelperText>
            <FormHelperText>
              Class: {traits[selectedIndex].class}
            </FormHelperText>
          </Grid>
          <Grid item xs={5}>
            <Box display="flex">
              <Button
                onClick={() => {
                  updateIgnored(1);
                  setInputField('');
                  handleForward();
                }}
              >
                Next (IGNORE)
              </Button>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={ignored}
                label="Ignored?"
                onChange={handleChangeIgnored}
              >
                <MenuItem value={0}>Ignored?</MenuItem>
                <MenuItem value={1}>True</MenuItem>
                <MenuItem value={2}>False</MenuItem>
              </Select>
              <Select
                labelId="trait-type-label"
                id="trait-type"
                value={filterTraitType}
                label="Trait Type"
                onChange={handleChangeTraitType}
              >
                <MenuItem value="">NO FILTER</MenuItem>
                <MenuItem value="LIKE">LIKE</MenuItem>
                <MenuItem value="DISLIKE">DISLIKE</MenuItem>
              </Select>
              <TextField
                id="outlined-basic"
                label="Outlined"
                variant="outlined"
                fullWidth
                value={inputField}
                onChange={handleDescriptionChange}
              />
            </Box>
          </Grid>
          <Grid item xs={1}>
            <Box sx={{ m: 1 }} display="flex">
              <Typography>
                {selectedIndex + 1} / {traits.length} - Unmapped: {unmapped}
              </Typography>
              <Button onClick={() => handleBack()}>Back</Button>
              <Button onClick={() => handleForward()}>Next</Button>
              <Button onClick={() => handleSkip()}>Skip</Button>
              <Button onClick={() => exportResults()}>Export</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <SyntaxHighlighter language="xml" style={atomOneDarkReasonable}>
        {xml}
      </SyntaxHighlighter>
    </AppCard>
  );
}
