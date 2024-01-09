export default function handleOpenExternalLink(url: string) {
  const handleClick = function handle(event: any) {
    event.preventDefault();
    window.electron.openBrowserLink(url);
  };

  return handleClick;
}
