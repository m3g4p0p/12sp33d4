import tiles from './assets/tiles.png'
import { deltaPos } from './components.js'
import { k } from './init.js'
import { range, tileAt, tileset, TILE_SIZE } from './util.js'

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

function setState (obj, state) {
  if (obj.state !== state) {
    obj.enterState(state)
  }
}

function setAnim (obj, anim, options) {
  if (obj.curAnim() !== anim) {
    obj.play(anim, options)
  }
}

k.scene('main', () => {
  const player = k.add([
    'player',
    k.sprite('player'),
    k.pos(k.vec2(TILE_SIZE, k.height() / 2)),
    deltaPos(),
    k.area(),
    k.body(),
    k.cleanup()
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

  player.onUpdate(() => {
    if (k.isMouseDown()) {
      player.move(100, 0)
    }

    if (player.deltaPos.y < 0) {
      return setAnim(player, 'jump')
    }

    if (player.deltaPos.y > 0) {
      return setAnim(player, 'fall')
    }

    if (player.deltaPos.x > 0) {
      return setAnim(player, 'walk', { loop: true })
    }

    setAnim(player, 'idle')
  })

  player.onDestroy(() => {
    k.go('main')
  })
})

k.go('main')
