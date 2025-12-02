require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

require("./models/connection");

// Import du service de reset quotidien
const { scheduleDailyReset } = require("./services/dailyResetService");
// Import du service d'initialisation des playlists
const { initSystemPlaylists } = require("./services/playlistInitService");

const indexRouter = require("./routes/index");
const usersRoutes = require("./routes/users.routes");
const streamRoutes = require("./routes/streams.routes");
const playlistRoutes = require("./routes/playlists.routes");
const songsRoutes = require("./routes/songs.routes");
const playerRoutes = require("./routes/player.routes");
const sunoApiRoutes = require("./routes/suno-api.routes");
const trendingRoutes = require("./routes/trending.routes");

const app = express();

// Security Middleware
// app.use(helmet());

// Rate Limiting
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
*/

// Compression
/*
app.use(compression({
  filter: (req, res) => {
    if (req.url.includes('/player/connection')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
*/

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Middleware pour les headers SSE
app.use("/player/connection", (req, res, next) => {
  console.log('SSE Middleware hit:', req.url);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN || "http://localhost:5173"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (res.flushHeaders) res.flushHeaders();
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Initialisation du service de reset quotidien
scheduleDailyReset();

app.use("/", indexRouter);
app.use("/users", usersRoutes);
app.use("/streams", streamRoutes);
app.use("/playlists", playlistRoutes);
app.use("/songs", songsRoutes);
app.use("/player", playerRoutes);
app.use("/suno-api", sunoApiRoutes);
app.use("/trending", trendingRoutes);

// 📌 Gestion des erreurs 404
app.use(function (req, res, next) {
  next(createError(404));
});

// 📌 Gestion des erreurs globales
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.sendFile(path.join(__dirname, "views", "error.html"));
});

// Initialisation des playlists système une fois la connexion MongoDB établie
mongoose.connection.once("open", () => {
  console.log("MongoDB connection open, initializing system playlists...");
  initSystemPlaylists()
    .then(() =>
      console.log("Playlists système vérifiées/initialisées avec succès")
    )
    .catch((err) =>
      console.error(
        "Erreur lors de l'initialisation des playlists système:",
        err
      )
    );
});

module.exports = app;
