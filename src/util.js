import { k } from './init.js'

export function range (start, stop) {
  if (stop === undefined) {
    stop = start
    start = 0
  }

  return Array.from(
    { length: stop - start },
    (_, i) => i + start
  )
}

export function ranges (length, ...rest) {
  return Array.from({ length }, (_, i) => rest.length ? ranges(...rest) : i)
}

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

export function thresh (value, min) {
  return value < min ? 0 : value
}
