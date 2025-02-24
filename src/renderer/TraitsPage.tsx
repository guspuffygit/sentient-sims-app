/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import {
  useEffect,
  useState,
  ChangeEvent,
  useMemo,
  useCallback,
  JSX,
} from 'react';
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
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { LoadingButton } from '@mui/lab';
import { ExportTraitsRequest } from 'main/sentient-sims/services/MappingService';
import AppCard from './AppCard';
import useSetting from './hooks/useSetting';

type TraitResponse = {
  data: TraitMapping[];
};

export default function TraitsPage() {
  const [loadingTraits, setLoadingTraits] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [traits, setTraits] = useState<TraitMapping[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputField, setInputField] = useState('');
  const extractedPath = useSetting<string>(SettingsEnum.TRAIT_MAPPING_PATH, '');
  const [filterTraitType, setFilterTraitType] = useState<string>('');

  const filteredTraits = useMemo(() => {
    if (filterTraitType) {
      return traits.filter((trait) => trait.trait_type === filterTraitType);
    }

    return traits;
  }, [traits, filterTraitType]);

  const traitTypes: Record<string, number> = useMemo(() => {
    const traitTypeCounts: Record<string, number> = {};
    traits.forEach((trait) => {
      if (trait.trait_type) {
        if (trait.trait_type in traitTypeCounts) {
          traitTypeCounts[trait.trait_type] += 1;
        } else {
          traitTypeCounts[trait.trait_type] = 1;
        }
      }
    });
    return traitTypeCounts;
  }, [traits]);

  let prefix = '';
  if (filteredTraits[selectedIndex]?.trait_type) {
    const traitType = filteredTraits[selectedIndex]?.trait_type;
    const traitClass = filteredTraits[selectedIndex]?.class;
    if (
      traitType === 'DISLIKE' &&
      traitClass &&
      traitClass === 'AttractionPreference'
    ) {
      prefix = 'John Doe is turned off by a partner who';
    } else if (
      traitType === 'LIKE' &&
      traitClass &&
      traitClass === 'AttractionPreference'
    ) {
      prefix = 'John Doe is attracted to a partner who';
    }
  }

  const selectMenuItems: JSX.Element[] = [];
  Object.keys(traitTypes).forEach((traitTypeKey) => {
    selectMenuItems.push(
      <MenuItem value={traitTypeKey}>
        {traitTypeKey}: {traitTypes[traitTypeKey]}
      </MenuItem>
    );
  });

  const loadItems = useCallback(() => {
    setLoadingTraits(true);
    const params = new URLSearchParams({ extractedPath: extractedPath.value });
    fetch(`${appApiUrl}/traits?${params.toString()}`)
      .then((result) => result.json())
      .then((response: TraitResponse) => {
        log.debug(JSON.stringify(response.data, null, 2));
        setTraits(response.data);
      })
      .finally(() => setLoadingTraits(false));
  }, [extractedPath.value]);

  useEffect(() => {
    if (filteredTraits.length > 0) {
      setInputField(filteredTraits[selectedIndex]?.description || '');
    } else {
      setInputField('');
    }
  }, [selectedIndex, filteredTraits]);

  const updateIgnored = (value: number | string) => {
    setTraits((previousTraits) => {
      const updatedTraits: TraitMapping[] = [];
      previousTraits.forEach((trait) => {
        if (trait.name === filteredTraits[selectedIndex].name) {
          if (value === 1) {
            trait.ignored = true;
          } else if (value === 2) {
            trait.ignored = false;
          } else {
            trait.ignored = undefined;
          }
        }
        updatedTraits.push(trait);
      });

      return updatedTraits;
    });
  };

  const handleChangeIgnored = (event: SelectChangeEvent<number>) => {
    updateIgnored(event.target.value);
  };

  const handleChangeTraitType = (event: SelectChangeEvent<string>) => {
    setFilterTraitType(event.target.value);
    setSelectedIndex(0);
    setInputField(filteredTraits[0]?.description || '');
  };

  function updateDescription() {
    setTraits((previousTraits) => {
      const updatedTraits: TraitMapping[] = [];
      previousTraits.forEach((trait) => {
        if (trait.name === filteredTraits[selectedIndex].name) {
          let description: string | undefined;
          if (inputField) {
            description = inputField;
          }
          trait.description = description;
        }
        updatedTraits.push(trait);
      });

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

  const handleExtractedPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    extractedPath.setSetting(event.target.value);
  };

  const exportResults = () => {
    setLoadingExport(true);
    const results: Record<string, TraitMapping> = {};

    traits
      // .filter((trait) => trait.description || trait?.ignored)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((trait) => {
        results[trait.name] = {
          name: trait.name,
          ignored: trait.ignored,
          description: trait.description,
        };
      });

    const exportTraitsRequest: ExportTraitsRequest = {
      extractedPath: extractedPath.value,
      traits: results,
    };

    fetch(`${appApiUrl}/traits/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportTraitsRequest),
    }).finally(() => setLoadingExport(false));
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
                <MenuItem value={1}>ignored=true</MenuItem>
                <MenuItem value={2}>ignored=false</MenuItem>
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
                <MenuItem value="">NO FILTER</MenuItem>
                {selectMenuItems}
              </Select>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography>
              {selectedIndex + 1} / {filteredTraits.length} - Unmapped:{' '}
              {unmapped}
            </Typography>
            <TextField
              id="extracted-path"
              label="S4tk Extracted Path"
              variant="outlined"
              fullWidth
              value={extractedPath.value}
              onChange={handleExtractedPathChange}
            />
          </Grid>

          {/* Row 2: TextField */}
          <Grid item xs={12} sm={6}>
            <Typography>{prefix}</Typography>
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
              <LoadingButton loading={loadingExport} onClick={exportResults}>
                Export
              </LoadingButton>
            </Grid>
            <Grid item>
              <LoadingButton
                loading={loadingTraits}
                onClick={() => loadItems()}
              >
                Load
              </LoadingButton>
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
