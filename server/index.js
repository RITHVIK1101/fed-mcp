const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const app = express();
const port = process.env.PORT || 3001;
// express, cors for rest server, exec for python 

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  next();
});

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  console.log(`Received prompt: ${prompt}`);

  exec(`python3 ../unified/smart_router.py "${prompt}"`, (error, stdout, stderr) => {
    //stdout gets the response from the python script
    if (error) {
      console.error(`Exec error: ${error}`);
      return res.status(500).json({ answer: "Error processing your request." });
    }

    if (stderr) {
      console.warn(`Python stderr: ${stderr}`);
    }

    //Return full output instead of just last line
    const fullOutput = stdout.trim();
    console.log(`Sending response: ${fullOutput}`);
    res.json({ answer: fullOutput });
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({
    message: "Smart Cloud Assistant server is up and running!",
    time: new Date().toISOString(),
    endpoints: ["/ask (POST)", "/health (GET)"]
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Available endpoints:`);
  console.log(`GET  http://localhost:${port}/`);
  console.log(`GET  http://localhost:${port}/health`);
  console.log(`POST http://localhost:${port}/ask`);
  console.log(`Watching for requests`);
});

process.on("SIGINT", () => {
  console.log("\n Server shutting down");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("\n Server shutting down");
  process.exit(0);
});
