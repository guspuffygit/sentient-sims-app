import { SyntheticEvent } from 'react';

export default function handleOpenExternalLink(url: string) {
  const handleClick = function handle(event: SyntheticEvent) {
    event.preventDefault();
    window.electron.openBrowserLink(url);
  };

  return handleClick;
}
