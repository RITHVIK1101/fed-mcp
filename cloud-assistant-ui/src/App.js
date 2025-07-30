import React, { useState } from 'react';
import { Cloud, Send, Sparkles, Brain } from 'lucide-react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
// sending and recieveing reponse from the server
  const sendQuery = async () => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch("http://localhost:3001/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      setResponse(data.answer);
    } catch (error) {
      console.error("Error sending prompt:", error);
      setResponse("Failed to fetch response. Please check your connection.");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      sendQuery();
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundEffects: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none'
    },
    orb1: {
      position: 'absolute',
      top: '-160px',
      right: '-128px',
      width: '384px',
      height: '384px',
      background: 'rgba(168, 85, 247, 0.2)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 3s ease-in-out infinite'
    },
    orb2: {
      position: 'absolute',
      bottom: '-160px',
      left: '-128px',
      width: '384px',
      height: '384px',
      background: 'rgba(59, 130, 246, 0.2)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 3s ease-in-out infinite 1s'
    },
    orb3: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '384px',
      height: '384px',
      background: 'rgba(99, 102, 241, 0.1)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 3s ease-in-out infinite 0.5s'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '896px',
      margin: '0 auto',
      padding: '48px 24px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px'
    },
    iconBox: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '16px',
      lineHeight: '1.1'
    },
    subtitle: {
      color: '#d1d5db',
      fontSize: '1.125rem',
      maxWidth: '512px',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    inputSection: {
      backdropFilter: 'blur(20px)',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '32px'
    },
    textareaContainer: {
      position: 'relative'
    },
    textarea: {
      width: '95%',
      height: '128px',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      padding: '16px 24px',
      color: 'white',
      fontSize: '16px',
      resize: 'none',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    },
    textareaFocus: {
      boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.5)',
      borderColor: 'transparent'
    },
    keyboardHint: {
      position: 'absolute',
      bottom: '16px',
      right: '16px',
      color: '#9ca3af',
      fontSize: '12px'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '24px'
    },
    button: {
      position: 'relative',
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none'
    },
    responseSection: {
      backdropFilter: 'blur(20px)',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    responseHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px'
    },
    responseTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#f3f4f6',
      marginLeft: '12px'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 0'
    },
    spinnerContainer: {
      position: 'relative'
    },
    spinner1: {
      width: '64px',
      height: '64px',
      border: '4px solid rgba(168, 85, 247, 0.3)',
      borderTop: '4px solid #a855f7',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    spinner2: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      width: '48px',
      height: '48px',
      border: '4px solid rgba(59, 130, 246, 0.3)',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spinReverse 1s linear infinite'
    },
    loadingText: {
      marginLeft: '24px',
      color: '#d1d5db'
    },
    loadingTitle: {
      fontSize: '1.125rem',
      fontWeight: '500',
      marginBottom: '8px'
    },
    loadingSubtitle: {
      fontSize: '14px',
      color: '#9ca3af'
    },
    responseContent: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    responseText: {
      color: '#f3f4f6',
      whiteSpace: 'pre-wrap',
      fontSize: '14px',
      lineHeight: '1.6',
      fontFamily: 'Monaco, Consolas, "Courier New", monospace'
    },
    footer: {
      textAlign: 'center',
      marginTop: '48px',
      color: '#9ca3af',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Effects */}
      <div style={styles.backgroundEffects}>
        <div style={styles.orb1}></div>
        <div style={styles.orb2}></div>
        <div style={styles.orb3}></div>
      </div>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <div style={styles.iconBox}>
              <Cloud size={48} color="white" />
            </div>
          </div>
          <h1 style={styles.title}>Smart Cloud Assistant</h1>
          <p style={styles.subtitle}>
            Your intelligent companion for AWS and Azure queries. Ask anything about cloud infrastructure, services, and best practices.
          </p>
        </div>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.textareaContainer}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about AWS Lambda, Azure Functions, cloud architecture, or any cloud topic..."
              style={{
                ...styles.textarea,
                ...(document.activeElement === document.querySelector('textarea') ? styles.textareaFocus : {})
              }}
              disabled={loading}
            />
            <div style={styles.keyboardHint}>
              Ctrl/Cmd + Enter to send
            </div>
          </div>
          
          <div style={styles.buttonContainer}>
            <button
              onClick={sendQuery}
              disabled={loading || !prompt.trim()}
              style={{
                ...styles.button,
                ...(loading || !prompt.trim() ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!loading && prompt.trim()) {
                  Object.assign(e.target.style, styles.buttonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && prompt.trim()) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <Brain size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Ask Assistant</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Response Section */}
        {(response || loading) && (
          <div style={styles.responseSection}>
            <div style={styles.responseHeader}>
              <Sparkles size={24} color="#a78bfa" />
              <h2 style={styles.responseTitle}>Response</h2>
            </div>
            
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinnerContainer}>
                  <div style={styles.spinner1}></div>
                  <div style={styles.spinner2}></div>
                </div>
                <div style={styles.loadingText}>
                  <div style={styles.loadingTitle}>Processing your query...</div>
                  <div style={styles.loadingSubtitle}>This may take a few moments</div>
                </div>
              </div>
            ) : (
              <div style={styles.responseContent}>
                <pre style={styles.responseText}>{response}</pre>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p>Powered by AI • Secure • Reliable</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        textarea::placeholder {
          color: #9ca3af;
        }
        
        textarea:focus {
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.5) !important;
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
}

export default App;