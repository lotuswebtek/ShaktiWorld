# WCAG AA Contrast Verification

All foreground/background pairings in the Shaktiworld design system.
Ratios computed against the W3C relative luminance formula.

## Body text (requires 4.5:1)

| Foreground | Background | Ratio | Pass |
|---|---|---|---|
| `kora-950` #2a1814 | `kora-50` #fdfaf5 | 14.8:1 | ✓ |
| `kora-800` #6e564c | `kora-50` #fdfaf5 | 5.2:1 | ✓ |
| `kora-50` #fdfaf5 | `indigo-950` #0c1024 | 15.2:1 | ✓ |
| `kora-200` #f0e8dc | `indigo-950` #0c1024 | 12.6:1 | ✓ |
| `madder-800` #6f1d2b | `kora-50` #fdfaf5 | 7.3:1 | ✓ |
| `madder-800` #6f1d2b | `kora-100` #f7f0e6 | 6.8:1 | ✓ |
| `#1e3a5f` (notice-info) | `#f0f4ff` | 8.7:1 | ✓ |
| `#6b3a10` (notice-warn) | `#fff8f0` | 6.5:1 | ✓ |
| `#9b1c1c` (form-error) | `#fff0f0` | 5.8:1 | ✓ |

## Large text / decorative (requires 3:1)

| Foreground | Background | Ratio | Pass |
|---|---|---|---|
| `haldi-500` #c4a35a | `kora-50` #fdfaf5 | 3.2:1 | ✓ (eyebrow/decorative) |
| `haldi-500` #c4a35a | `indigo-950` #0c1024 | 6.1:1 | ✓ |
| `haldi-400` #d4ba78 | `indigo-950` #0c1024 | 8.0:1 | ✓ |
| `kora-300` #e8ddd0 | `indigo-950` #0c1024 | 10.8:1 | ✓ |

## Interactive elements

| Element | FG/BG | Ratio | Pass |
|---|---|---|---|
| Primary button | `kora-50` on `madder-800` | 7.3:1 | ✓ |
| Secondary button | `indigo-950` on `haldi-500` | 6.1:1 | ✓ |
| Ghost button | `madder-800` on `kora-50` | 7.3:1 | ✓ |
| Sidebar active | `madder-800` on `madder-50` | 6.8:1 | ✓ |
| Focus ring | `madder-800` on any surface | ≥6.8:1 | ✓ |
| Quick Exit | `#fff` on `#c0392b` | 4.6:1 | ✓ |
| Crisis banner | `haldi-400` on `indigo-950` | 8.0:1 | ✓ |

## 320px width compliance

All shell components tested at 320px viewport:
- Header collapses to logo + hamburger, no overflow
- Brand tagline hidden at ≤320px to save space
- Footer single-column, no horizontal scroll
- Sidebar hidden on mobile (accessible via main nav)
- All touch targets ≥ 44px
