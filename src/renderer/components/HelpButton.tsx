import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { IconButton, Tooltip } from '@mui/material';
import handleOpenExternalLink from 'renderer/hooks/handleOpenExternalLink';

export type HelpButtonProperties = {
  url: string;
};

export default function HelpButton({ url }: HelpButtonProperties) {
  const handleOpenAnimationMappingWiki = handleOpenExternalLink(url);

  return (
    <Tooltip title="Open Wiki to related information">
      <IconButton onClick={handleOpenAnimationMappingWiki}>
        <HelpOutlineRoundedIcon />
      </IconButton>
    </Tooltip>
  );
}
