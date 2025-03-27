export function GlowingGreenOrb() {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // height: '100vh',
  };

  const orbStyle = {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    backgroundColor: '#32CD32', // LimeGreen
    boxShadow: '0 0 10px 5px #32CD32',
    marginLeft: '10',
  };

  return (
    <div style={containerStyle}>
      <div style={orbStyle} />
    </div>
  );
}
