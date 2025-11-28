const fs = require('fs');
require('dotenv').config();

const requiredVars = [
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_HOST',
  'EMAIL_PORT',
];
const missingVars = [];
const emptyVars = [];

requiredVars.forEach((varName) => {
  if (!(varName in process.env)) {
    missingVars.push(varName);
  } else if (!process.env[varName]) {
    emptyVars.push(varName);
  }
});

let output = '';

if (missingVars.length > 0) {
  output += 'Missing environment variables: ' + missingVars.join(', ') + '\n';
} else {
  output += 'All required environment variables are present.\n';
}

if (emptyVars.length > 0) {
  output +=
    'Environment variables present but empty: ' + emptyVars.join(', ') + '\n';
}

output += 'EMAIL_HOST: ' + (process.env.EMAIL_HOST || 'undefined') + '\n';
output += 'EMAIL_PORT: ' + (process.env.EMAIL_PORT || 'undefined') + '\n';
output +=
  'EMAIL_USER length: ' +
  (process.env.EMAIL_USER ? process.env.EMAIL_USER.length : 0) +
  '\n';
output +=
  'EMAIL_PASSWORD length: ' +
  (process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0) +
  '\n';

fs.writeFileSync('debug-env-output.txt', output);
console.log('Done writing to debug-env-output.txt');
