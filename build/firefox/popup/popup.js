// eslint-disable-next-line no-undef
var port = chrome.runtime.connect({ name: 'Popup Communication' })

var user = document.getElementById('user')
var pass = document.getElementById('pass')
var save = document.getElementById('save')
var info = document.getElementById('info')
var link = document.createElement('a')
port.postMessage({ action: 'requestCreds' })
var submit = document.getElementById('save')
submit.onclick = function () {
  port.postMessage({ action: 'auth', username: user.value, password: pass.value })
}
port.onMessage.addListener(function (msg) {
  if (msg) {
    if (msg.action === 'auth') {
      if (msg.success === true) {
        pass.style.outline = '1px solid #4bd653'
        // window.close()
        pass.focus()
      } else {
        pass.style.outline = '1px solid red'
        pass.value = ''
        pass.focus()
      }
    } else if (msg.action === 'requestCreds') {
      user.value = msg.credentials.username
      pass.value = msg.credentials.password
      pass.style.outline = '1px solid #4bd653'
      save.value = 'Update credentials'
      info.textContent = null
      console.log(info.textContent)
      if (msg.READ_CACHE_TITLE[0]) {
        link.href = 'https://myanimelist.net/' + msg.READ_CACHE_TITLE[0][1]
        link.target = '_blank'
        link.textContent = msg.READ_CACHE_TITLE[0][0]
        info.textContent = 'Last seen:\n'
        info.appendChild(link)
      }
      pass.focus()
    }
  }
})
