import { onMounted, onBeforeUnmount } from 'vue'
import { useState } from '#imports'

type Options = {
  movementThresholdPx?: number
}

// singleton guards (module scope)
let ctrl: AbortController | null = null
let armed = false

export function useIsRealUser(options: Options = {}) {
  const { movementThresholdPx = 8 } = options

  // shared across the whole Nuxt app
  const isRealUser = useState<boolean>('isRealUser', () => false)

  const cleanup = () => {
    ctrl?.abort()
    ctrl = null
    armed = false
  }

  const confirmRealUser = () => {
    isRealUser.value = true
    cleanup()
  }

  onMounted(() => {
    if (isRealUser.value || armed) return
    armed = true

    ctrl = new AbortController()
    const { signal } = ctrl

    window.addEventListener('pointerdown', confirmRealUser, { capture: true, once: true, signal })
    window.addEventListener('touchstart', confirmRealUser, { capture: true, passive: true, once: true, signal })
    window.addEventListener('keydown', confirmRealUser, { capture: true, once: true, signal })
    window.addEventListener('scroll', confirmRealUser, { capture: true, passive: true, once: true, signal })
    window.addEventListener('wheel', confirmRealUser, { capture: true, passive: true, once: true, signal })

    const thresholdSq = movementThresholdPx * movementThresholdPx
    let lastX: number | null = null
    let lastY: number | null = null

    const onMove = (e: PointerEvent) => {
      if (lastX === null || lastY === null) {
        lastX = e.clientX
        lastY = e.clientY
        return
      }
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      if (dx * dx + dy * dy > thresholdSq) confirmRealUser()
    }

    window.addEventListener('pointermove', onMove, { capture: true, passive: true, signal })
  })

  onBeforeUnmount(() => {
    if (!isRealUser.value) cleanup()
  })

  return { isRealUser }
}