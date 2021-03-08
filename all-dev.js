const concurrently = require('concurrently')

concurrently(
  [
    { command: 'yarn workspace @middle/earth dev', name: 'main' },
    { command: 'yarn dev:orthanc', name: 'orthanc' },
  ],
  {
    restartTries: 10,
    maxProcesses: 4,
  },
)
