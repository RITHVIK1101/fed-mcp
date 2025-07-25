import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendQuery = async () => {
    setLoading(true);     //Start loading
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
      console.error("❌ Error sending prompt:", error);
      setResponse("Failed to fetch response.");
    }

    setLoading(false); // 👈 Stop loading
  };

  return (
    <div className="App">
      <h1>Smart Cloud Assistant</h1>

      <textarea
        rows="4"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask something about AWS or Azure..."
      />
      <br />

      <button onClick={sendQuery} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>

      <h2>Response:</h2>

      {loading ? (
        <div className="loader" /> // 👈 Spinner
      ) : (
        <pre>{response}</pre>
      )}
    </div>
  );
}

export default App;
