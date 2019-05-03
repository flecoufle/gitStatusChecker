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

function updateToolTip (name) {
  ipc.send('repo-name', name)
}

function getDir () {
  let dir = document.getElementById('path-input').value
  getRepoName(dir) // and updateToolTip via collback
  // TODO : must be in a sub-process
  return dir
}

ipc.on('stageRequest', (event, message) => {
  gitStage(getDir())
})

ipc.on('commitRequest', (event, message) => {
  gitCommit(getDir())
})

ipc.on('commitPushRequest', (event, message) => {
  let dir = getDir()
  gitCommit(dir)
  gitPush(dir)
})

ipc.on('pushRequest', (event, message) => {
  gitPush(getDir())
})

ipc.on('stageCommitPushRequest', (event, message) => {
  let dir = getDir()
  gitStage(dir)
  gitCommit(dir)
  gitPush(dir)
})

ipc.on('testRequest', (event, message) => {
  let dir = getDir()
  console.log(dir)
})

function getRepoName (dir) {
  exec('git rev-parse --show-toplevel', {
    cwd: dir
  }, (err, stdout, stderr) => {
    // Used to debug :
    console.log('err', err)
    console.log('stdout', stdout)
    console.log('stderr', stderr)
    updateToolTip(stdout)
    return stdout
  })
  return 'new name'
}

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
getDir()
