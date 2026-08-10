/* eslint-disable promise/always-return */

import { useState, ChangeEvent, useMemo, useCallback, JSX, KeyboardEvent } from 'react';
import { appApiUrl } from 'main/sentient-sims/constants';
import { Box, Button, Grid, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import log from 'electron-log';
import { xml as vkbeautifyXml } from 'vkbeautify';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDarkReasonable } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { TraitMapping } from 'main/sentient-sims/descriptions/traitDescriptions';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ExportTraitsRequest } from 'main/sentient-sims/services/MappingService';
import { toTraitType, TraitType } from 'main/sentient-sims/models/TraitType';
import AppCard from './AppCard';
import useSetting from './hooks/useSetting';
import { EmptyState } from './components/EmptyState';

type TraitResponse = {
  data: TraitMapping[];
};

function getFormattedXml(xmlString?: string): string {
  if (xmlString) {
    return vkbeautifyXml(xmlString, 2);
  }

  return '';
}

type TraitCount = {
  unmapped: number;
  mapped: number;
};

type TraitMetaItemProps = {
  label: string;
  value?: string;
  mono?: boolean;
};

function TraitMetaItem({ label, value, mono }: TraitMetaItemProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: 'text.secondary',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          overflowWrap: 'anywhere',
          ...(mono ? { fontFamily: "'Courier New', Courier, monospace" } : {}),
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function TraitsPage() {
  const [loadingTraits, setLoadingTraits] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [traits, setTraits] = useState<TraitMapping[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputField, setInputField] = useState('');
  const extractedPath = useSetting<string>(SettingsEnum.TRAIT_MAPPING_PATH, '');
  const [filterTraitType, setFilterTraitType] = useState<TraitType | ''>('');
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
      const unmapped = !trait.description && trait.ignored === undefined;
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
    });
    return traitTypeCounts;
  }, [traits]);

  let prefix = '';
  if (filteredTraits[selectedIndex]) {
    const traitType = filteredTraits[selectedIndex].trait_type;
    const traitClass = filteredTraits[selectedIndex].class;
    if (traitType === TraitType.DISLIKE && traitClass === 'AttractionPreference') {
      prefix = 'John Doe is turned off by a partner who';
    } else if (traitType === TraitType.LIKE && traitClass === 'AttractionPreference') {
      prefix = 'John Doe is attracted to a partner who';
    } else if (traitType === TraitType.FEAR) {
      prefix = 'John Doe fears';
    } else if (traitType === TraitType.ASPIRATION) {
      prefix = 'John Doe';
    } else if (traitType === TraitType.PERSONALITY) {
      prefix = 'John Doe';
    } else if (traitType === TraitType.NONE && traitClass === 'Trait') {
      prefix = 'John Doe';
    }
  }

  const selectMenuItems: JSX.Element[] = [];
  Object.keys(traitCounts).forEach((traitTypeKey) => {
    if (traitCounts[traitTypeKey].mapped === traitCounts[traitTypeKey].mapped - traitCounts[traitTypeKey].unmapped) {
      selectMenuItems.push(
        <MenuItem value={traitTypeKey} key={traitTypeKey}>
          {traitTypeKey}: {traitCounts[traitTypeKey].mapped}
        </MenuItem>,
      );
    } else {
      selectMenuItems.push(
        <MenuItem value={traitTypeKey} key={traitTypeKey}>
          {traitTypeKey}: {traitCounts[traitTypeKey].mapped - traitCounts[traitTypeKey].unmapped}/
          {traitCounts[traitTypeKey].mapped}
        </MenuItem>,
      );
    }
  });

  const loadItems = useCallback(() => {
    setLoadingTraits(true);
    const params = new URLSearchParams({ extractedPath: extractedPath.value });
    void fetch(`${appApiUrl}/traits?${params.toString()}`)
      .then((result) => result.json())
      .then((response: TraitResponse) => {
        // log.debug(JSON.stringify(response.data, null, 2));
        setTraits(response.data);

        const initialFiltered = filterTraitType
          ? response.data.filter((t) => t.trait_type === filterTraitType)
          : response.data;

        if (initialFiltered.length > 0) {
          setInputField(initialFiltered[0]?.description || '');
        } else {
          setInputField('');
        }
        setSelectedIndex(0);
      })
      .finally(() => {
        setLoadingTraits(false);
      });
  }, [extractedPath.value, filterTraitType]);

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

  const handleChangeTraitType = (event: SelectChangeEvent) => {
    const newFilterType = event.target.value ? toTraitType(event.target.value) : '';
    setFilterTraitType(newFilterType);
    setSelectedIndex(0);

    // FIX 3: Manually calculate the next description and set it immediately
    // This avoids waiting for a render cycle
    let nextTrait: TraitMapping | undefined;

    if (newFilterType) {
      nextTrait = traits.find((trait) => trait.trait_type === newFilterType);
    } else {
      nextTrait = traits[0];
    }

    setInputField(nextTrait?.description || '');
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
      // Already correct: sets input based on new index immediately
      setInputField(filteredTraits[newIndex]?.description || '');
    }
  };

  const handleForward = () => {
    updateDescription();
    if (selectedIndex + 1 < filteredTraits.length) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      // Already correct: sets input based on new index immediately
      setInputField(filteredTraits[newIndex]?.description || '');
    }
  };

  const handleSkip = () => {
    updateDescription();

    for (let i = selectedIndex + 1; i < filteredTraits.length; i++) {
      if (!filteredTraits[i]?.description && filteredTraits[i]?.ignored === undefined) {
        setSelectedIndex(i);
        // Already correct: sets input based on new index immediately
        setInputField(filteredTraits[i]?.description || '');
        break;
      }
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputField(event.target.value);
  };

  const handleExtractedPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    void extractedPath.setSetting(event.target.value);
  };

  const handleVariableNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVariableName(event.target.value);
  };

  const handleModDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setModDescription(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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

    void fetch(`${appApiUrl}/traits/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportTraitsRequest),
    }).finally(() => {
      setLoadingExport(false);
    });
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
    if (!trait.description && trait.ignored === undefined) {
      unmapped += 1;
    }
  });

  return (
    <>
      <AppCard
        title="Trait source"
        subtitle="Point at an S4tk extraction, then load traits and export the finished mapping"
        icon={<FolderOpenOutlinedIcon sx={{ fontSize: 18 }} />}
        headerAction={
          <>
            <Button
              variant="outlined"
              color="secondary"
              loading={loadingTraits}
              startIcon={<RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={loadItems}
            >
              Load
            </Button>
            <Button
              variant="contained"
              color="primary"
              loading={loadingExport}
              startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={exportResults}
            >
              Export
            </Button>
          </>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="S4tk Extracted Path"
              variant="outlined"
              fullWidth
              value={extractedPath.value}
              onChange={handleExtractedPathChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Variable Name (for Export)"
              variant="outlined"
              fullWidth
              value={variableName}
              onChange={handleVariableNameChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Mod Description (for Export)"
              variant="outlined"
              fullWidth
              value={modDescription}
              onChange={handleModDescriptionChange}
            />
          </Grid>
        </Grid>
      </AppCard>

      {traits.length === 0 ? (
        <EmptyState
          icon={<PsychologyOutlinedIcon />}
          title="No traits loaded"
          description="Set the S4tk extracted path above, then press Load to start mapping trait descriptions."
        />
      ) : (
        <>
          <AppCard
            title="Trait editor"
            subtitle={`Trait ${selectedIndex + 1} of ${filteredTraits.length} · ${unmapped} unmapped`}
            icon={<PsychologyOutlinedIcon sx={{ fontSize: 18 }} />}
            headerAction={
              <Box sx={{ minWidth: 200 }}>
                <Select size="small" value={filterTraitType} onChange={handleChangeTraitType} fullWidth displayEmpty>
                  <MenuItem value="">No Filter</MenuItem>
                  {selectMenuItems}
                </Select>
              </Box>
            }
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: 4,
                rowGap: 1.5,
                paddingBottom: 2,
                marginBottom: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <TraitMetaItem label="Name" value={filteredTraits[selectedIndex]?.name} mono />
              <TraitMetaItem label="Class" value={filteredTraits[selectedIndex]?.class} />
              <TraitMetaItem label="Trait Type" value={filteredTraits[selectedIndex]?.trait_type} />
            </Box>

            {prefix ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', marginBottom: 1 }}>
                {prefix}
              </Typography>
            ) : null}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  value={inputField}
                  onKeyDown={handleKeyDown}
                  onChange={handleDescriptionChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <Select value={ignored} onChange={handleChangeIgnored} fullWidth displayEmpty>
                  <MenuItem value={0}>Ignored?</MenuItem>
                  <MenuItem value={1}>Ignored = True</MenuItem>
                  <MenuItem value={2}>Ignored = False</MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 2.5 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  updateIgnored(1);
                  handleForward();
                }}
              >
                Next (Ignore)
              </Button>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                onClick={handleForward}
              >
                Next
              </Button>
              <Button variant="text" color="secondary" onClick={handleSkip}>
                Skip
              </Button>
            </Box>
          </AppCard>

          {xml ? (
            <AppCard
              title="Tuning XML"
              subtitle="Raw tuning for the selected trait"
              icon={<CodeOutlinedIcon sx={{ fontSize: 18 }} />}
            >
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <SyntaxHighlighter
                  language="xml"
                  style={atomOneDarkReasonable}
                  customStyle={{
                    margin: 0,
                    padding: '14px 16px',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    background: 'rgba(0, 0, 0, 0.25)',
                  }}
                >
                  {xml}
                </SyntaxHighlighter>
              </Box>
            </AppCard>
          ) : null}
        </>
      )}
    </>
  );
}
