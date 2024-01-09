import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { IconButton } from '@mui/material';
import handleOpenExternalLink from 'renderer/hooks/handleOpenExternalLink';

export type HelpButtonProperties = {
  url: string;
};

export default function HelpButton({ url }: HelpButtonProperties) {
  const handleOpenAnimationMappingWiki = handleOpenExternalLink(url);

  return (
    <IconButton onClick={handleOpenAnimationMappingWiki}>
      <HelpOutlineRoundedIcon />
    </IconButton>
  );
}
