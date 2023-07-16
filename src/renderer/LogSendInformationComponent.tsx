import { Link, Typography } from '@mui/material';

export default function LogSendInformationComponent() {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Privacy Notice
      </Typography>
      <Typography variant="body1" gutterBottom>
        You are about to send data to the developer.
      </Typography>
      <p />
      <Typography variant="body1" gutterBottom>
        Data sent will include:
      </Typography>
      <p />
      <ul>
        <li>
          <Typography variant="body1" gutterBottom>
            lastException.txt and lastCrash.txt files from the The Sims 4 folder
          </Typography>
        </li>
        <li>
          <Typography variant="body1" gutterBottom>
            A list of file and directory names inside the Mods folder
          </Typography>
        </li>
        <li>
          <Typography variant="body1" gutterBottom>
            The files within the Mods/sentient-sims folder
          </Typography>
        </li>
      </ul>
      <p />
      <Typography variant="body1" gutterBottom>
        The Open AI API key will be removed from the data when it is sent to the
        developer.
      </Typography>
      <p />
      <Typography variant="body1" gutterBottom>
        The data will be deleted once it has been reviewed.
      </Typography>
      <p />
      <Typography variant="body1" gutterBottom>
        Copy and paste the generated id to the{' '}
        {
          <Link
            href="https://discord.com/channels/1098029759201542144/1110714954492940410"
            underline="none"
            target="_blank"
            rel="noopener"
          >
            #support
          </Link>
        }{' '}
        channel in Discord to claim the logs and describe your issue.
      </Typography>
      <p />
      <Typography variant="body1" gutterBottom>
        Logs are anonymous until they are claimed!
      </Typography>
    </>
  );
}
