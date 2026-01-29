const fs = require('fs');
const path = require('path');

// Log directory is managed here; simulator passes episodeId per entry.
const LOG_DIR = path.join(__dirname, 'logs');

function createLogDirectory() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getLogPath(episodeId) {
  return path.join(LOG_DIR, `${episodeId}.jsonl`);
}

function appendLog(entry) {
  // Expect episodeId on the log entry itself
  if (!entry || !entry.episodeId) return;
  const line = JSON.stringify(entry) + '\n';
  fs.appendFile(getLogPath(entry.episodeId), line, (err) => {
    if (err) {
      console.error('Failed to append log:', err);
    }
  });
}

module.exports = { appendLog, getLogPath, createLogDirectory };


