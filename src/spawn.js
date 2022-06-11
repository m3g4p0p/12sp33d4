import { accelerate, bounce, cleanLeft, colorWave, dieWith, dynamicJump, fade, flicker, followSpin, glitch, moveTowards, parallax, spinning, velocity } from './components.js'
import { GHOST_SPEED, SQRT_2, TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { range } from './util.js'

function withGlow (target, color) {
  const glow = spawnGlow(target, color)
  return Object.assign(target, { glow })
}

function withShadow (target) {
  const shadow = spawnShadow(target)
  return Object.assign(target, { shadow })
}

export function spawnPlayer (color) {
  const start = k.vec2(TILE_SIZE, k.height() / 2)

  return k.add([
    'player',
    k.sprite(`player-${color}`),
    k.origin('center'),
    k.pos(start),
    velocity(5),
    accelerate(),
    dynamicJump(0.5),
    spinning(),
    k.area(),
    k.body(),
    k.rotate(),
    k.cleanup()
  ])
}

export function spawnGhost (pos, target) {
  return withShadow(k.add([
    'ghost',
    k.sprite('ghost'),
    k.origin('center'),
    k.pos(pos),
    k.rotate(),
    k.area(),
    k.opacity(),
    k.scale(),
    moveTowards(target, GHOST_SPEED, -45),
    cleanLeft()
  ]))
}

export function spawnGlow (target, color) {
  return k.add([
    k.circle(TILE_SIZE / 2),
    k.origin('center'),
    k.color(color),
    k.opacity(),
    k.scale(),
    k.layer('effects'),
    k.pos(target.pos),
    k.follow(target),
    dieWith(target, ['destroy', 'fade']),
    flicker(0.2)
  ])
}

export function spawnShadow (target) {
  const { sprite } = target.inspect()

  return k.add([
    k.layer('effects'),
    k.origin('center'),
    k.sprite(JSON.parse(sprite)),
    k.pos(target.pos),
    k.opacity(0.5),
    k.rotate(),
    k.color(),
    k.follow(target),
    followSpin(),
    dieWith(target, ['destroy', 'fade']),
    glitch(4)
  ])
}

export function spawnGem (name, pos, jumpForce = 50) {
  return withGlow(k.add([
    'gem',
    'booster',
    k.sprite(name),
    k.origin('center'),
    k.pos(pos),
    k.area(),
    k.scale(),
    k.opacity(),
    k.body({ solid: false }),
    bounce(jumpForce),
    cleanLeft()
  ]), k.YELLOW)
}

export function spawnWall (pos, spriteName) {
  return k.add([
    'wall',
    k.sprite(spriteName),
    k.origin('center'),
    k.pos(pos),
    k.area(),
    k.solid(),
    cleanLeft()
  ])
}

export function spawnPlant (pos) {
  return k.add([
    k.sprite(`plant-${k.randi(4)}-${k.randi(1, 2)}`),
    k.layer('background'),
    k.origin('center'),
    k.pos(pos),
    k.opacity(k.rand(0.5))
  ])
}

export function spawnTorch (pos) {
  const torch = k.add([
    k.sprite('torch'),
    k.layer('background'),
    k.origin('center'),
    k.opacity(0.5),
    k.pos(pos),
    parallax(0.1),
    cleanLeft()
  ])

  range(3).forEach(i => {
    k.add([
      k.circle(torch.width / 2 * SQRT_2 ** i),
      k.layer('effects'),
      k.origin('center'),
      k.color(k.YELLOW),
      k.opacity(0.05),
      k.pos(pos),
      parallax(0.1 + 0.01 * i),
      dieWith(torch)
    ])
  })

  return torch
}

export function spawnSword (pos) {
  const sword = k.add([
    'sword',
    k.sprite(`sword-${k.randi(4)}-0`),
    k.origin('center'),
    k.pos(pos),
    k.z(-1),
    k.health(3),
    k.area(),
    k.scale(),
    k.rotate(),
    k.opacity(),
    spinning(),
    cleanLeft()
  ])

  spawnShadow(sword).use(colorWave())
  return sword
}

export function spawnIndicator (label) {
  const { r = 0, g = 0, b = 0 } = label.indicatorColor
  const offset = k.vec2(label.width + 20, label.pos.y)
  const tag = 'indicator:' + label.text.toLowerCase()
  const index = k.get(tag).length

  return k.add([
    tag,
    k.layer('ui'),
    k.fixed(),
    k.rect(8, 8),
    k.pos(k.vec2(10 * index, 1).add(offset)),
    k.color(k.rgb(...[r, g, b].map(
      value => value * (index + 1)
    )))
  ])
}

export function spawnScore (value, pos, color) {
  return k.add([
    k.text(value, {
      size: 20 + value,
      font: 'sinko'
    }),
    k.layer('ui'),
    k.origin('center'),
    k.color(color),
    k.pos(pos),
    k.opacity(),
    k.scale(),
    fade(1, 2)
  ])
}

export function spawnDeath () {
  return k.add([
    'death',
    k.sprite('skull'),
    k.origin('center'),
    k.pos(k.center()),
    k.opacity(),
    k.scale(),
    k.fixed(),
    fade(1, 10)
  ])
}
