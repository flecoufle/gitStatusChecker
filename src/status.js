const fs = require('fs')
const exec = require('child_process').exec
const os = require('os')
const electron = require('electron')
const ipc = electron.ipcRenderer // inter process communication. Main process <=> Render process

const defaultTimeOut = 3

function isDir (dir) {
  try {
    return fs.lstatSync(dir).isDirectory()
  } catch (e) {
    return false
  }
}

electron.ipcRenderer.on('stageRequest', (event, message) => {
  gitStage(document.getElementById('path-input').value)
})

electron.ipcRenderer.on('commitRequest', (event, message) => {
  gitCommit(document.getElementById('path-input').value)
})

electron.ipcRenderer.on('commitPushRequest', (event, message) => {
  gitCommit(document.getElementById('path-input').value)
  gitPush(document.getElementById('path-input').value)
})

electron.ipcRenderer.on('pushRequest', (event, message) => {
  gitPush(document.getElementById('path-input').value)
})

electron.ipcRenderer.on('stageCommitPushRequest', (event, message) => {
  gitCommit(document.getElementById('path-input').value)
})

/* function getRepoName (dir) {
  exec('basename `git rev-parse --show-toplevel`', {
    cwd: dir
  }, (err, stdout, stderr) => {
    // Used to debug :
    console.log('err', err)
    console.log('stdout', stdout)
    console.log('stderr', stderr)

    return stdout
  })
} */

function gitCommit (dir) {
  exec('git commit -m "update"', {
    cwd: dir
  }, (err, stdout, stderr) => {
    // Used to debug :
    console.log('err', err)
    console.log('stdout', stdout)
    console.log('stderr', stderr)

    return err
  })
}

function gitStage (dir) {
  exec('git add .', {
    cwd: dir
  }, (err, stdout, stderr) => {
    // Used to debug :
    console.log('err', err)
    console.log('stdout', stdout)
    console.log('stderr', stderr)

    return err
  })
}

function gitPush (dir) {
  exec('git push', {
    cwd: dir
  }, (err, stdout, stderr) => {
    // Used to debug :
    console.log('err', err)
    console.log('stdout', stdout)
    console.log('stderr', stderr)

    return err
  })
}

function checkGitStatus (dir) {
  exec('git status', {
    cwd: dir
  }, (err, stdout, stderr) => {
    // Used to debug :
    console.log('err', err)
    console.log('stdout', stdout)
    console.log('stderr', stderr)

    if (err) return setStatus('unknown')

    if (/nothing to commit/.test(stdout)) return setStatus('clean')

    return setStatus('dirty')
  })
}

function formatDir (dir) {
  return /^~/.test(dir)
    ? os.homedir() + dir.substr(1).trim()
    : dir.trim()
}

function removeStatus () {
  const el = document.getElementById('status')
  el.classList.remove('unknown', 'clean', 'dirty')
  ipc.send('status-change', 'unknown') // ipc : send the status to set the tray icon
  return el
}

function setStatus (status) {
  const el = removeStatus()
  el.classList.add(status)
  ipc.send('status-change', status) // ipc : send the status to set the tray icon
}

function run () {
  // Seconds
  let timeout = document.getElementById('time-interval-input').value
  try {
    timeout = parseInt(timeout)
  } finally {
    timeout = timeout || defaultTimeOut
    if (timeout < 1) {
      timeout = defaultTimeOut
    }
  }

  // Miliseconds
  timeout *= 1000

  // Set interval
  let timer = setInterval(_ => {
    let value = document.getElementById('path-input').value
    const dir = formatDir(value)
    if (isDir(dir)) {
      checkGitStatus(dir)
    }
  }, timeout)
  return timer
}

function setUpdateTimeout (timer) {
  document.getElementById('time-interval-input').addEventListener('keyup', evt => {
    clearInterval(timer)
    removeStatus()
    try {
      timer = run()
    } finally {}
  })
}

removeStatus()
checkGitStatus(document.getElementById('path-input').value)
let timer = run()
setUpdateTimeout(timer)
