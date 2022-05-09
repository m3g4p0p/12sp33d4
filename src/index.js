import tiles from './assets/tiles.png'
import { k } from './init.js'
import { range, thresh, tileAt, tileset, TILE_SIZE } from './util.js'

const playerTile = tileAt(18, 9, 6)
playerTile.y++

k.loadSpriteAtlas(tiles, {
  ...tileset('wall', 18, 0, 3, 3),
  player: {
    ...playerTile,
    anims: {
      idle: 0,
      walk: { from: 1, to: 2 },
      jump: 3,
      fall: 4
    }
  }
})

function addWall (pos, x, y) {
  return k.add([
    'wall',
    k.sprite(`wall-${x}-${y}`),
    k.pos(pos),
    k.area(),
    k.solid(),
    k.cleanup()
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

function setAnim (obj, anim, options) {
  if (obj.curAnim() !== anim) {
    obj.play(anim, options)
  }
}

k.scene('main', () => {
  const start = k.vec2(TILE_SIZE, k.height() / 2)

  const player = k.add([
    'player',
    k.sprite('player'),
    k.pos(start),
    k.area(),
    k.body(),
    k.cleanup(),
    { dest: start }
  ])

  Array.from({ length: 5 }).reduce(pos => {
    return platform(pos, k.randi(10))
  }, player.pos.add(k.DOWN))

  player.play('idle')
  k.gravity(100)

  k.onClick(() => {
    if (player.isGrounded()) {
      player.jump(100)
    }
  })

  k.onMouseDown(() => {
    player.dest = player.pos.add(100, 0)
  })

  k.onCollide('player', 'wall', (player, _, collision) => {
    if (collision.isRight()) {
      player.dest = player.pos
    }
  })

  player.onUpdate(() => {
    const velocity = thresh(player.dest.sub(player.pos).x, 5)
    player.move(velocity, 0)

    setAnim(
      player,
      player.isGrounded()
        ? velocity > 0
          ? 'walk'
          : 'idle'
        : player.isFalling()
          ? 'fall'
          : 'jump'
    )
  })

  player.onDestroy(() => {
    k.go('main')
  })
})

k.go('main')
