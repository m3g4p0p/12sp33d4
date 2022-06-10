import { PLAYER_COLOR, TILE_SIZE } from './constants.js'

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

function ranges (length, ...rest) {
  return Array.from({ length }, (_, i) => rest.length ? ranges(...rest) : i)
}

export function thresh (value, min) {
  return value < min ? 0 : value
}

export function playerTiles () {
  return PLAYER_COLOR.reduce((result, color, index) => {
    const tile = tileAt(18, 7 + index, 6)

    tile.y++
    return {
      ...result,
      [`player-${color}`]: {
        ...tile,
        anims: {
          idle: 0,
          walk: { from: 1, to: 2 },
          jump: 3,
          fall: 4
        }
      }
    }
  }, {})
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
