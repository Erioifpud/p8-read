function run () {
  window.Pico8Reader.readP8('./jelpi.p8.png').then((data) => {
    console.log('[P8]', data)
  })
}

document.addEventListener('DOMContentLoaded', run)
