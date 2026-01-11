const { spawn } = require('child_process');
const fs = require('fs');

const logStream = fs.createWriteStream('build_log.txt', { flags: 'a' });
console.log("Starting build debug...");
logStream.write("Starting build...\n");

const child = spawn('npm', ['run', 'build'], { cwd: 'frontend', shell: true });

child.stdout.on('data', (data) => {
    logStream.write(data);
});

child.stderr.on('data', (data) => {
    logStream.write(data);
});

child.on('error', (err) => {
    logStream.write("SPAWN ERROR: " + err.message + "\n");
});

child.on('close', (code) => {
    logStream.write(`\nChild process exited with code ${code}\n`);
    console.log(`Exited with ${code}`);
});
