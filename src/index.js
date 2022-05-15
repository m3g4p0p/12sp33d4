import tiles from './assets/tiles.png'
import { fade } from './components.js'
import { PLAYER_JUMP_FORCE, PLAYER_SPEED, TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { groundLevel, platformGenerator } from './platforms.js'
import { spawnPlayer } from './spawn.js'
import { tileAt, tileset } from './util.js'

const playerTile = tileAt(18, 9, 6)
playerTile.y++

k.loadSpriteAtlas(tiles, {
  ...tileset('wall', 18, 0, 3, 3),
  gem: tileAt(32, 10),
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

function setAnim (obj, anim, options) {
  if (obj.curAnim() !== anim) {
    obj.play(anim, options)
  }
}

k.scene('start', () => {
  k.add([
    k.text('Tap to start', { size: 10 }),
    k.pos(10, 10)
  ])

  k.onMouseRelease(() => {
    k.go('main')
  })
})

k.scene('main', () => {
  const player = spawnPlayer()

  const spawnPlatforms = platformGenerator(
    player.pos.add(k.DOWN), 10)

  const score = k.add([
    k.text(0, { size: 10 }),
    k.layer('ui'),
    k.pos(10, 10),
    k.fixed()
  ])

  const maxOffset = k.width() / TILE_SIZE
  let camOffset = 5
  let airJump = null

  k.layers([
    'background',
    'game',
    'ui'
  ], 'game')

  player.play('idle')
  k.camPos(player.pos)
  k.gravity(100)

  spawnPlatforms()
  k.on('destroy', 'wall', spawnPlatforms)

  k.onDraw(() => {
    Array.from({ length: player.speed - 1 }).forEach((_, index) => {
      k.drawRect({
        width: 5,
        height: 5,
        color: k.rgb(0, (index + 1) * 32, 0),
        pos: k.toWorld(k.vec2(10 + 6 * index, k.height() - 10))
      })
    })
  })

  k.onClick(() => {
    if (
      player.isGrounded() &&
      player.velocity() > PLAYER_SPEED / 2
    ) {
      player.startJump(PLAYER_JUMP_FORCE)
    }
  })

  k.onMouseDown(() => {
    player.accelerate(PLAYER_SPEED)

    if (airJump && airJump.exists()) {
      player.startJump(PLAYER_JUMP_FORCE)
    }

    airJump = null
  })

  k.onMouseRelease(() => {
    player.stopJump()
  })

  k.onCollide('player', 'wall', (player, _, collision) => {
    if (collision.isRight()) {
      player.velocity(0)
    }
  })

  k.onCollide('player', 'gem', (player, gem) => {
    score.text += player.speed
    player.speed++
    airJump = gem

    gem.unuse('gem')
    gem.use(fade(1))
    player.accelerate(PLAYER_SPEED)
  })

  k.on('destroy', 'gem', gem => {
    player.speed = Math.max(1, player.speed - 1)
  })

  player.onUpdate(() => {
    const velocity = player.velocity()

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

    camOffset = velocity > PLAYER_SPEED / 2
      ? Math.min(maxOffset, camOffset + k.dt())
      : camOffset - k.dt()

    k.camPos(
      k.center().x + player.pos.x - camOffset * TILE_SIZE,
      Math.min(player.pos.y, Math.max(
        groundLevel(),
        k.camPos().y
      ))
    )
  })

  player.onDestroy(() => {
    k.go('start')
  })

  score.onUpdate(() => {
    score.textSize = 10 + player.speed
  })
})

k.go('start')
