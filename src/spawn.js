import { accelerate, bounce, cleanLeft, dynamicJump, flicker, velocity } from './components.js'
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
    dynamicJump(0.5),
    k.area(),
    k.body(),
    k.cleanup()
  ])
}

export function spawnGem (pos) {
  const gem = k.add([
    'gem',
    k.sprite('gem'),
    k.pos(pos),
    k.area(),
    k.scale(),
    k.opacity(),
    k.body({ solid: false }),
    bounce(k.randi(40, 50)),
    cleanLeft()
  ])

  const glow = k.add([
    k.circle(TILE_SIZE / 2),
    k.color(k.YELLOW),
    k.opacity(),
    k.scale(),
    k.layer('effects'),
    k.pos(gem.pos),
    k.follow(gem, TILE_SIZE / 2),
    flicker(0.2)
  ])

  glow.onUpdate(() => {
    if (gem.c('fade')) {
      glow.destroy()
    }
  })

  gem.onDestroy(() => {
    glow.destroy()
  })

  return gem
}

export function spawnWall (pos, x, y) {
  return k.add([
    'wall',
    k.sprite(`wall-${x}-${y}`),
    k.pos(pos),
    k.area(),
    k.solid(),
    cleanLeft()
  ])
}
