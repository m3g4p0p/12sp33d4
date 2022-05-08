const TILE_SIZE = 16

export function tileAt (x, y) {
  return {
    x: x * TILE_SIZE,
    y: y * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE
  }
}

function range (length) {
  return Array.from({ length }, (_, i) => i)
}

function ranges (length, ...rest) {
  return Array.from({ length }, (_, i) => rest.length ? ranges(...rest) : i)
}

export function tileset (name, x, y, width, height) {
  return ranges(height, width).reduce((result, row, iY) => ({
    ...result,
    ...Object.fromEntries(row.map(iX => [
      `${name}-${iY}-${iX}`,
      tileAt(x + iX, y + iY)
    ]))
  }), {})
}
