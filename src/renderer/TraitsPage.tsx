/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { useEffect, useState, ChangeEvent, useMemo, useCallback, JSX } from 'react';
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
import vkbeautify from 'vkbeautify';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDarkReasonable } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { TraitMapping } from 'main/sentient-sims/descriptions/traitDescriptions';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { LoadingButton } from '@mui/lab';
import { ExportTraitsRequest } from 'main/sentient-sims/services/MappingService';
import { toTraitType } from 'main/sentient-sims/models/TraitType';
import AppCard from './AppCard';
import useSetting from './hooks/useSetting';

type TraitResponse = {
  data: TraitMapping[];
};

function getFormattedXml(xmlString?: string) {
  if (xmlString) {
    return vkbeautify.xml(xmlString, 2);
  }

  return [];
}

type TraitCount = {
  unmapped: number;
  mapped: number;
};

export default function TraitsPage() {
  const [loadingTraits, setLoadingTraits] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [traits, setTraits] = useState<TraitMapping[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputField, setInputField] = useState('');
  const extractedPath = useSetting<string>(SettingsEnum.TRAIT_MAPPING_PATH, '');
  const [filterTraitType, setFilterTraitType] = useState<string>('');
  const [variableName, setVariableName] = useState('');
  const [modDescription, setModDescription] = useState('');

  const filteredTraits = useMemo(() => {
    if (filterTraitType) {
      return traits.filter((trait) => trait.trait_type === filterTraitType);
    }

    return traits;
  }, [traits, filterTraitType]);

  const traitCounts: Record<string, TraitCount> = useMemo(() => {
    const traitTypeCounts: Record<string, TraitCount> = {};
    traits.forEach((trait) => {
      if (trait.trait_type) {
        const unmapped = !trait?.description && trait?.ignored === undefined;
        if (trait.trait_type in traitTypeCounts) {
          traitTypeCounts[trait.trait_type].mapped += 1;
          if (unmapped) {
            traitTypeCounts[trait.trait_type].unmapped += 1;
          }
        } else {
          traitTypeCounts[trait.trait_type] = {
            mapped: 1,
            unmapped: unmapped ? 1 : 0,
          };
        }
      }
    });
    return traitTypeCounts;
  }, [traits]);

  let prefix = '';
  if (filteredTraits[selectedIndex]?.trait_type) {
    const traitType = filteredTraits[selectedIndex]?.trait_type;
    const traitClass = filteredTraits[selectedIndex]?.class;
    if (traitType === 'DISLIKE' && traitClass && traitClass === 'AttractionPreference') {
      prefix = 'John Doe is turned off by a partner who';
    } else if (traitType === 'LIKE' && traitClass && traitClass === 'AttractionPreference') {
      prefix = 'John Doe is attracted to a partner who';
    } else if (traitType === 'FEAR') {
      prefix = 'John Doe fears';
    } else if (traitType === 'ASPIRATION') {
      prefix = 'John Doe';
    } else if (traitType === 'PERSONALITY') {
      prefix = 'John Doe';
    } else if (traitType === 'NONE' && traitClass === 'Trait') {
      prefix = 'John Doe';
    }
  }

  const selectMenuItems: JSX.Element[] = [];
  Object.keys(traitCounts).forEach((traitTypeKey) => {
    if (traitCounts[traitTypeKey].mapped === traitCounts[traitTypeKey].mapped - traitCounts[traitTypeKey].unmapped) {
      selectMenuItems.push(
        <MenuItem value={traitTypeKey}>
          {traitTypeKey}: {traitCounts[traitTypeKey].mapped}
        </MenuItem>,
      );
    } else {
      selectMenuItems.push(
        <MenuItem value={traitTypeKey}>
          {traitTypeKey}: {traitCounts[traitTypeKey].mapped - traitCounts[traitTypeKey].unmapped}/
          {traitCounts[traitTypeKey].mapped}
        </MenuItem>,
      );
    }
  });

  const loadItems = useCallback(() => {
    setLoadingTraits(true);
    const params = new URLSearchParams({ extractedPath: extractedPath.value });
    fetch(`${appApiUrl}/traits?${params.toString()}`)
      .then((result) => result.json())
      .then((response: TraitResponse) => {
        // log.debug(JSON.stringify(response.data, null, 2));
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
    updateDescription();
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setInputField(filteredTraits[newIndex]?.description || '');
    }
  };

  const handleForward = () => {
    updateDescription();
    if (selectedIndex + 1 < filteredTraits.length) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setInputField(filteredTraits[newIndex]?.description || '');
    }
  };

  const handleSkip = () => {
    updateDescription();

    for (let i = selectedIndex + 1; i < filteredTraits.length; i++) {
      if (!filteredTraits[i]?.description && filteredTraits[i]?.ignored === undefined) {
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

  const handleVariableNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVariableName(event.target.value);
  };

  const handleModDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setModDescription(event.target.value);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleForward();
    }
  };

  const exportResults = () => {
    updateDescription();
    setLoadingExport(true);
    const results: Record<string, TraitMapping> = {};

    traits
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((trait) => {
        if (trait.name in results) {
          log.debug(`Duplicate trait name: ${trait.name}`);
        }
        results[trait.name] = {
          name: trait.name,
          ignored: trait.ignored,
          description: trait.description,
          class: trait.class,
          trait_type: toTraitType(trait.trait_type),
        };
      });

    log.debug(`Results Length: ${Object.keys(traits).length}`);

    const exportTraitsRequest: ExportTraitsRequest = {
      extractedPath: extractedPath.value,
      traits: results,
      variableName: variableName,
      modDescription: modDescription,
    };

    fetch(`${appApiUrl}/traits/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportTraitsRequest),
    }).finally(() => setLoadingExport(false));
  };

  const xml: string | string[] = getFormattedXml(filteredTraits[selectedIndex]?.xml);

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
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Trait Information */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              Trait Details - {selectedIndex + 1} / {filteredTraits.length} - Unmapped: {unmapped}
            </Typography>
            <FormHelperText>Name: {filteredTraits[selectedIndex]?.name}</FormHelperText>
            <FormHelperText>Class: {filteredTraits[selectedIndex]?.class}</FormHelperText>
            <FormHelperText>Trait Type: {filteredTraits[selectedIndex]?.trait_type}</FormHelperText>
          </Grid>

          {/* Select Menus */}
          <Grid item xs={12} sm={4} container spacing={2}>
            <Grid item xs={6}>
              <Select value={ignored} onChange={handleChangeIgnored} fullWidth displayEmpty>
                <MenuItem value={0}>Ignored?</MenuItem>
                <MenuItem value={1}>Ignored = True</MenuItem>
                <MenuItem value={2}>Ignored = False</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={6}>
              <Select value={filterTraitType} onChange={handleChangeTraitType} fullWidth displayEmpty>
                <MenuItem value="">No Filter</MenuItem>
                {selectMenuItems}
              </Select>
            </Grid>
          </Grid>

          {/* Miscellaneous Information */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Mod Name (Use _ instant of space)"
              variant="outlined"
              fullWidth
              value={variableName}
              onChange={handleVariableNameChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Mod Description"
              variant="outlined"
              fullWidth
              value={modDescription}
              onChange={handleModDescriptionChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="S4tk Extracted Path"
              variant="outlined"
              fullWidth
              value={extractedPath.value}
              onChange={handleExtractedPathChange}
            />
          </Grid>

          {/* Input Field */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">{prefix}</Typography>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={inputField}
              onKeyDown={handleKeyDown}
              onChange={handleDescriptionChange}
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} sm={5} container spacing={2} justifyContent="center">
            <Grid item>
              <Button variant="contained" color="secondary" onClick={handleBack}>
                Back
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  updateIgnored(1);
                  handleForward();
                }}
              >
                Next (Ignore)
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleForward}>
                Next
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleSkip}>
                Skip
              </Button>
            </Grid>
            <Grid item>
              <LoadingButton variant="contained" loading={loadingExport} onClick={exportResults}>
                Export
              </LoadingButton>
            </Grid>
            <Grid item>
              <LoadingButton variant="contained" loading={loadingTraits} onClick={loadItems}>
                Load
              </LoadingButton>
            </Grid>
          </Grid>
        </Grid>

        {/* XML Code Display */}
        <Box sx={{ mt: 3 }}>
          <SyntaxHighlighter language="xml" style={atomOneDarkReasonable}>
            {xml}
          </SyntaxHighlighter>
        </Box>
      </Box>
    </AppCard>
  );
}
