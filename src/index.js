import { fade, followSpin } from './components.js'
import { PLAYER_JUMP_FORCE, PLAYER_SPEED, TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { groundLevel, platformGenerator } from './platforms.js'
import { spawnGem, spawnIndicator, spawnPlayer, spawnScore, spawnSword } from './spawn.js'
import { tileAt, tileset } from './tilemath.js'
import { requestFullscreen, shake } from './util.js'
import tiles from './assets/tiles.png'

const playerTile = tileAt(18, 9, 6)
playerTile.y++

k.loadSpriteAtlas(tiles, {
  ...tileset('wall', 18, 0, 3, 3),
  ...tileset('bevel', 20, 3, 2, 2),
  ...tileset('plant', 0, 1, 4, 2),
  ...tileset('sword', 32, 7, 5, 1),
  'gem-small': tileAt(22, 4),
  'gem-large': tileAt(32, 10),
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

function addUiText (text, x, y) {
  return k.add([
    k.text(text, { size: 10 }),
    k.layer('ui'),
    k.pos(x, y),
    k.fixed()
  ])
}

k.scene('start', () => {
  k.add([
    k.text('Tap to start', { size: 10 }),
    k.pos(10, 10)
  ])

  k.onMouseRelease(() => {
    requestFullscreen()
    k.go('main')
  })
})

k.scene('main', () => {
  const player = spawnPlayer()

  const spawnPlatforms = platformGenerator(
    player.pos.add(k.DOWN), 10)

  const scoreLabel = addUiText('SCORE', 10, 10)
  const score = addUiText(0, scoreLabel.width + 20, 10)
  const speedLabel = addUiText('SPEED', 10, k.height() - 20)
  const indicatorOffset = k.vec2(speedLabel.width + 20, speedLabel.pos.y)
  const maxCamOffset = k.center().x / TILE_SIZE

  let camOffset = maxCamOffset
  let activeBooster = null
  let wieldedSword = null

  k.layers([
    'background',
    'effects',
    'game',
    'ui'
  ], 'game')

  player.play('idle')
  k.camPos(player.pos)
  k.gravity(100)

  spawnPlatforms()
  spawnIndicator(indicatorOffset)
  k.on('destroy', 'wall', spawnPlatforms)

  k.onClick(() => {
    if (activeBooster || (
      player.isGrounded() &&
      player.velocity() > PLAYER_SPEED / 2
    )) {
      player.startJump(PLAYER_JUMP_FORCE)
    }

    activeBooster = null
  })

  k.onMouseDown(() => {
    player.accelerate(PLAYER_SPEED)
  })

  k.onMouseRelease(() => {
    player.stopJump()
  })

  k.onCollide('player', 'wall', (player, _, collision) => {
    if (collision.isRight()) {
      player.velocity(0)
    }
  })

  k.onCollide('gem', 'player', gem => {
    score.text += player.speed

    spawnScore(player.speed, gem.pos)
    gem.unuse('gem')
    gem.use(fade())
  })

  k.onCollide('booster', 'player', booster => {
    activeBooster = booster
    player.speed++

    booster.unuse('booster')
    player.accelerate(PLAYER_SPEED)
    spawnIndicator(indicatorOffset)
    shake(6)
  })

  k.onCollide('sword', 'player', sword => {
    if (wieldedSword) {
      wieldedSword.destroy()
    }

    wieldedSword = sword

    sword.use(followSpin(player, k.vec2(
      TILE_SIZE / 2,
      TILE_SIZE / -8
    )))

    k.wait(5, () => {
      sword.use(fade(0.5))
    })
  })

  k.onCollide('sword', 'boulder', (sword, boulder) => {
    if (sword !== wieldedSword) {
      return
    }

    shake(6)
    player.spin(1000)
    boulder.unuse('wall')
    boulder.use(fade(0.5))
    spawnGem('gem-small', boulder.pos)
  })

  k.on('update', 'gem', gem => {
    if (
      player.worldArea().p1.x <
      gem.worldArea().p2.x
    ) {
      return
    }

    gem.unuse('gem')
    gem.use(fade(1, -1))
  })

  k.on('destroy', 'booster', () => {
    player.speed = Math.ceil(player.speed / 2)
    k.get('indicator').splice(player.speed).forEach(k.destroy)
  })

  k.on('destroy', 'booster', booster => {
    if (booster === activeBooster) {
      activeBooster = null
    }
  })

  k.on('destroy', 'sword', sword => {
    if (sword === wieldedSword) {
      wieldedSword = null
    }
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
      ? Math.min(maxCamOffset, camOffset + k.dt())
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
    shake(12)
    k.go('start')
  })

  score.onUpdate(() => {
    score.textSize = 10 + player.speed
  })

  if (!DEVELOP) {
    return
  }

  k.onKeyPress('x', () => {
    player.destroy()
  })

  k.onKeyPress('y', () => {
    player.accelerate(PLAYER_SPEED)
    player.jump(PLAYER_JUMP_FORCE)
  })

  k.onKeyPress('<', () => {
    player.speed++
    spawnIndicator(indicatorOffset)
  })

  k.onKeyPress('s', () => {
    spawnSword(player.pos)
  })

  window.player = player
})

k.go('start')
