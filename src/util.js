import { k } from './init.js'

export function requestFullscreen () {
  if (document.fullscreenElement || !k.isTouch()) {
    return
  }

  const canvas = document.querySelector('canvas')
  canvas.requestFullscreen().catch(console.error)
}

export function shake (intensity) {
  k.shake(intensity)

  if (navigator.vibrate) {
    navigator.vibrate(intensity * 10)
  }
}
