import tiles from './assets/tiles.png'
import { k } from './init.js'
import { range, tileAt, tileset, TILE_SIZE } from './util.js'

k.loadSpriteAtlas(tiles, {
  wallTopLeft: tileAt(18, 0),
  ...tileset('wall', 18, 0, 3, 3)
})

function addWall (pos, x, y) {
  return k.add([
    k.sprite(`wall-${x}-${y}`),
    k.pos(pos),
    k.area(),
    k.solid()
  ]).pos.add(k.RIGHT.scale(TILE_SIZE))
}

function platform (start, length) {
  const pos = range(length - 2).reduce(pos => {
    return addWall(pos, 0, 1)
  }, addWall(start, 0, 0))

  return addWall(pos, 0, 2).add(
    k.randi(1, 2) * TILE_SIZE,
    k.randi(-2, 2) * TILE_SIZE
  )
}

k.scene('main', () => {
  Array.from({ length: 5 }).reduce(pos => {
    return platform(pos, k.randi(10))
  }, k.vec2(0, k.height() / 2))
})

k.go('main')
