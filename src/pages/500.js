// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 20:44:21
// Current User's Login: NUbivek

export default function Custom500() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        500 - Server Error
      </h1>
      <p style={{ color: '#666' }}>
        Something went wrong on our end. Please try again later.
      </p>
      <a 
        href="/searchbar"
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '14px'
        }}
      >
        Go Back Home
      </a>
    </div>
  );
}
