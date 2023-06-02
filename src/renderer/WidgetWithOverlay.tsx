/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import WidgetBot from '@widgetbot/react-embed';

function WidgetWithOverlay() {
  const handleClick = () => {
    // Handle click event and navigate to the desired link
    window.open('https://discord.gg/JTjbydmUAp', '_blank');
  };

  return (
    <div className="widget-wrapper">
      <WidgetBot
        server="1098029759201542144"
        channel="1098054540181381222"
        height={700}
        width={300}
      />

      <div className="overlay" onClick={handleClick} />
    </div>
  );
}

export default WidgetWithOverlay;
