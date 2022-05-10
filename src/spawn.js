import { accelerate, velocity } from './components.js'
import { TILE_SIZE } from './constants.js'
import { k } from './init.js'

export function spawnPlayer () {
  const start = k.vec2(TILE_SIZE, k.height() / 2)

  return k.add([
    'player',
    k.sprite('player'),
    k.pos(start),
    velocity(5),
    accelerate(),
    k.area(),
    k.body(),
    k.cleanup()
  ])
}
