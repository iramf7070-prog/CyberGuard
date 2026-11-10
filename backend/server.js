require("dotenv").config();

const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const { Server } = require("socket.io");

const Incident = require("./models/Incident");
const incidentRoutes = require("./routes/incidentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");




const {
  detectPhishing
} = require("./utils/detection");

const {
  detectNetworkIntrusion
} = require("./utils/networkDetection");

const multer = require("multer");

const {
  detectMalware
} = require("./utils/malwareDetection");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/incidents", incidentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.get("/api/dashboard-test", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard route is working!"
  });
});

// Home API
app.get("/", (req, res) => {
  res.send("AI Based Cyber Threat Detection System is Running!");
});

// Test API
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend API Working Successfully!"
  });
});

// SYSTEM HEALTH MONITOR API

app.get("/api/health", async (req, res) => {
  try {
    const mongoose = require("mongoose");

    const databaseConnected =
      mongoose.connection.readyState === 1;

    const socketConnected =
      io.engine.clientsCount > 0;

    res.json({
      success: true,

      backend: {
        status: "Online"
      },

      database: {
        status: databaseConnected
          ? "Connected"
          : "Disconnected"
      },

      socket: {
        status: socketConnected
          ? "Connected"
          : "Waiting for clients"
      },

      api: {
        status: "Working"
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// PHISHING DETECTION API

app.post("/api/analyze/phishing", async (req, res) => {
  try {

    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid URL"
      });
    }

    


    // Analyze URL
   const result = detectPhishing(url);
const mlResult = await getPhishingMLPrediction(url);

    // Save suspicious result in MongoDB
   
if (result.suspicious) {

  const incident = await Incident.create({
    threatType: "Phishing",

    description: result.reasons.join(", "),

    riskScore: result.riskScore,

    securityLevel: result.securityLevel,

    status: "Detected",

    source: url,

    details: {
      url: url
    }
  });

  req.app.get("io")?.emit("newThreat", incident);

}


    res.json({
  success: true,
  message: "URL Analysis Completed",
  ...result,
  mlPrediction: mlResult.prediction,
  mlConfidence: mlResult.confidence
});

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});


function getPhishingMLPrediction(url) {
  return new Promise((resolve, reject) => {
    const mlModelDir = path.join(__dirname, "..", "ml-model");
    const predictScript = path.join(mlModelDir, "predict_phishing.py");

    const python = spawn("python", [predictScript], {
      cwd: mlModelDir
    });

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("error", reject);

    python.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(errorOutput || "Phishing ML prediction failed"));
      }

      try {
        const result = JSON.parse(output.trim());

        if (result.error) {
          return reject(new Error(result.error));
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    python.stdin.write(JSON.stringify({ url }));
    python.stdin.end();
  });
}



// MACHINE LEARNING PREDICTION FUNCTION

function getMLPrediction(networkData) {
  return new Promise((resolve, reject) => {

    const mlModelDir = path.join(__dirname, "..", "ml-model");
    const predictScript = path.join(mlModelDir, "predict.py");

    const python = spawn("python", [predictScript], {
      cwd: mlModelDir
    });

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("error", reject);

    python.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(errorOutput || "Python prediction failed")
        );
      }

      try {
        const result = JSON.parse(output.trim());

        if (result.error) {
          return reject(new Error(result.error));
        }

        resolve(result);

      } catch (error) {
        reject(error);
      }
    });

    python.stdin.write(JSON.stringify({
      failed_attempts: networkData.failedAttempts,
      requests_per_minute: networkData.requestsPerMinute,
      bytes_transferred: networkData.bytesTransferred,
      destination_port: networkData.destinationPort
    }));

    python.stdin.end();
  });
}

// NETWORK INTRUSION DETECTION API

app.post("/api/analyze/network", async (req, res) => {

  try {

    const {
      failedAttempts = 0,
      requestsPerMinute = 0,
      bytesTransferred = 0,
      destinationPort = 443
    } = req.body;

    const values = [
      failedAttempts,
      requestsPerMinute,
      bytesTransferred,
      destinationPort
    ];

    if (
      values.some(value =>
        !Number.isFinite(value) || value < 0
      ) ||
      !Number.isInteger(destinationPort) ||
      destinationPort > 65535
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid numeric network data"
      });
    }

    const result = detectNetworkIntrusion({
      failedAttempts,
      requestsPerMinute,
      bytesTransferred,
      destinationPort
    });
    const mlResult = await getMLPrediction({
  failedAttempts,
  requestsPerMinute,
  bytesTransferred,
  destinationPort
});

    if (result.suspicious) {

      const incident = await Incident.create({
        threatType: "Network Intrusion",

        description: result.reasons.join(", "),

        riskScore: result.riskScore,

        securityLevel: result.securityLevel,

        status: "Detected",

        source: "Authorized Network Log",

        details: {
          failedAttempts,
          requestsPerMinute,
          bytesTransferred,
          destinationPort
        }
      });

      req.app.get("io")?.emit("newThreat", incident);
    }

    res.json({
  success: true,
  message: "Network Log Analysis Completed",
  ...result,

  mlPrediction: mlResult.prediction,
  mlConfidence: mlResult.confidence
});

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});



//Malware API
app.post(
  "/api/analyze/malware",
  upload.single("file"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file"
        });
      }

      const result = detectMalware(req.file);

      if (result.suspicious) {

        const incident = await Incident.create({
          threatType: "Malware",
          description: result.reasons.join(", "),
          riskScore: result.riskScore,
          securityLevel: result.securityLevel,
          status: "Detected",
          source: result.fileName,

          details: {
            fileName: result.fileName,
            fileSize: result.fileSize,
            sha256: result.sha256
          }
        });

        // Real-time alert (if Socket.IO is configured)
        req.app.get("io")?.emit("newThreat", incident);
      }

      res.json({
        success: true,
        message: "File Analysis Completed",
        ...result
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }
);


// Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
