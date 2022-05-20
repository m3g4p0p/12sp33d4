import { TILE_SIZE } from './constants.js'

export function tileAt (x, y, width = 1, height = 1) {
  return {
    x: x * TILE_SIZE,
    y: y * TILE_SIZE,
    width: width * TILE_SIZE,
    height: height * TILE_SIZE,
    sliceX: width,
    sliceY: height
  }
}

export function range (length) {
  return Array.from({ length }, (_, i) => i)
}

function ranges (length, ...rest) {
  return Array.from({ length }, (_, i) => rest.length ? ranges(...rest) : i)
}

export function thresh (value, min) {
  return value < min ? 0 : value
}

export function tileset (name, x, y, width, height) {
  return ranges(height, width).reduce((result, row, iY) => ({
    ...result,
    ...Object.fromEntries(row.map(iX => [
      `${name}-${iX}-${iY}`,
      tileAt(x + iX, y + iY)
    ]))
  }), {})
}
