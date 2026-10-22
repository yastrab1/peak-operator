const express = require('express');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SSH_TARGET = 'peak@peak';

function runSsh(remoteCmd, cb) {
  execFile('ssh', ['-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=10', SSH_TARGET, remoteCmd], { timeout: 120000 }, (err, stdout, stderr) => {
    const code = err && typeof err.code === 'number' ? err.code : (err ? 1 : 0);
    cb({ stdout, stderr, code, error: err ? err.message : null });
  });
}

app.post('/api/run', (req, res) => {
  const { op, ssid, password } = req.body || {};
  let remoteCmd;
  if (op === 'reboot') remoteCmd = 'sudo reboot';
  else if (op === 'shutdown') remoteCmd = 'sudo shutdown -h now';
  else if (op === 'docker-reboot') remoteCmd = 'cd /home/peak && docker compose -f /home/peak/docker-compose.yml down && docker compose -f /home/peak/docker-compose.yml up -d';
  else if (op === 'wifi') {
    const s = String(ssid || '').replace(/'/g, '');
    const p = String(password || '').replace(/'/g, '');
    remoteCmd = `sudo nmcli dev wifi connect '${s}' password '${p}'`;
  } else {
    return res.status(400).json({ error: 'unknown op' });
  }
  runSsh(remoteCmd, (r) => res.json(r));
});

app.listen(1111, '0.0.0.0', () => console.log('peak-operator listening on 1111'));
