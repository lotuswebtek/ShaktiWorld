import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SELECTOR = [
  '.hero-content',
  '.page-hero-copy',
  '.section > .container',
  '.pillar',
  '.media-card',
  '.work-block',
  '.do-item',
  '.quote-card',
  '.split-image',
  '.form',
  '.cta-panel',
].join(', ')

export default function RevealObserver() {
  const location = useLocation()

  useLayoutEffect(() => {
    const nodes = [...document.querySelectorAll(SELECTOR)]
    nodes.forEach((el, index) => {
      el.classList.add('reveal')
      el.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`)
    })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('in')
      } else {
        io.observe(el)
      }
    })

    return () => io.disconnect()
  }, [location.pathname])

  return null
}
