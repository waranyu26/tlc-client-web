# Tokyo Lucky Card — Premium Vault · Design Spec

> Hand this file to Claude Code as the authoritative brand + UI reference for the Premium Vault direction.

---

## Brand Identity

**Product:** Tokyo Lucky Card — authenticated card gacha platform (THB, Thai market, global expansion)  
**Direction:** Premium Vault — dark, gold, restrained. "Authenticated treasure."  
**Personality:** Trust at rest. Every card is a verified, graded asset.  
**Tagline:** *"Every card is a verified asset."*  
**Logo lockup:** Wordmark "Tokyo **Lucky** Card" (Lucky in gold), Thai sub-lockup "โตเกียว ลัคกี้ การ์ด"  
**Mark:** Star/sparkle glyph (SVG `M12 2c.6 5 2.9 7.4 8 8-5.1.6-7.4 2.9-8 8-.6-5.1-2.9-7.4-8-8 5.1-.6 7.4-2.9 8-8z`) on a gold→bronze gradient square with rounded corners (r=13px).

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#E7CE92` | Gold — CTAs, accents, rarity labels, active nav |
| `--color-secondary` | `#D9B45B` | Deeper gold — gradient pair for buttons |
| `--color-accent-dark` | `#8A6D2F` | Bronze — logo mark, gradient tail |
| `--color-bg` | `#0B0B0D` | App background |
| `--color-bg-screen` | `#0D0D10` | Phone screen / page fill |
| `--color-surface` | `#17161B` | Cards, input fields, bottom nav |
| `--color-surface-alt` | `#111019` | Nested panels, vault cells, ticker |
| `--color-border` | `rgba(231,206,146,0.16)` | Default gold-tinted border |
| `--color-border-dim` | `rgba(231,206,146,0.08)` | Subtle dividers |
| `--color-ink` | `#F4ECDD` | Primary text (warm off-white) |
| `--color-ink-sub` | `#9A9285` | Secondary / label text |
| `--color-ink-muted` | `#4A4844` | Tertiary, timestamps |
| `--color-success` | `#6FBF8E` | Buyback credit, positive amounts |
| `--color-error` | `#C9605B` | Pull debits, errors |
| `--color-rarity-legendary` | `#E7CE92` | Legendary rarity |
| `--color-rarity-mythic` | `#C77DFF` | Mythic rarity |
| `--color-rarity-epic` | `#18E0D0` | Epic rarity |
| `--color-rarity-rare` | `#7C8CFF` | Rare rarity |
| `--color-rarity-common` | `#4A4844` | Common rarity |

**Background radial:** `radial-gradient(ellipse at 50% -10%, #1A1610 0%, #08080A 55%)` — warm amber ember fading to near-black.

---

## Typography

### Display / Headlines
**Cormorant Garamond** (Google Fonts)  
Weights: 400, 500, 600, italic  
Rationale: A refined serif gives every card the weight of an appraised collectible — reads premium without being stuffy.

| Style | Size | Weight | Extra |
|---|---|---|---|
| Hero heading | 48px | 600 | letter-spacing: -0.01em |
| Section heading | 25–27px | 600 | — |
| Card title | 20–23px | 600 | — |
| Persona quote | 15.5px | 400 | italic |
| Wordmark | 21px | 600 | — |

### Body / UI
**Jost** (Google Fonts)  
Weights: 300, 400, 500, 600  
Thai fallback: **Noto Sans Thai** (same weight range)  
Rationale: Quietly modern geometric sans. Good Thai rendering, clean wallet-app feel.

| Style | Size | Weight |
|---|---|---|
| Button primary | 15–16px | 700 |
| Button secondary | 13–14px | 600 |
| Body | 13–14px | 400 |
| Label / caption | 11–12px | 400–500 |
| Micro / letter-spaced caps | 9–10.5px | 600, tracking 0.16–0.22em |

**Secondary UI font:** Space Grotesk — used for PSA slab labels, cert numbers, monospace-feel data (grades, hex codes).

**Line height:** Body 1.5–1.65 (Thai-comfortable). Display 1.0–1.1.

---

## Spacing & Radius

| Token | Value |
|---|---|
| Screen padding (horizontal) | 13–18px |
| Section gap | 14px |
| Button radius | 12–13px |
| Panel / card radius | 11–15px |
| Card frame radius (real card) | **4px** (near-square — do NOT round card images) |
| Pill / badge radius | 999px |
| Mark / icon badge radius | 13–15px |

---

## Components

### Primary Button
```css
background: linear-gradient(90deg, #E7CE92, #D9B45B);
color: #0B0B0D;
font-family: 'Jost', sans-serif;
font-weight: 700;
font-size: 15px;
border-radius: 12px;
padding: 14–15px;
border: none;
box-shadow: 0 8px 26px rgba(231,206,146,0.25);
```

### Secondary Button (ghost)
```css
background: transparent;
border: 1px solid rgba(231,206,146,0.16);
color: #9A9285;
border-radius: 12px;
```

### Buyback Button
```css
background: rgba(111,191,142,0.10);
border: 1px solid rgba(111,191,142,0.35);
color: #6FBF8E;
border-radius: 12px;
```

### Surface Panel
```css
background: #17161B;          /* or #111019 for nested */
border: 1px solid rgba(231,206,146,0.16);
border-radius: 11–15px;
```

### Rarity Badge (pill)
```css
padding: 4–5px 10–12px;
border-radius: 999px;
background: rgba({rarityColor}, 0.10);
border: 1px solid rgba({rarityColor}, 0.28);
color: {rarityColor};
font-size: 9.5px;
font-weight: 600;
letter-spacing: 0.18em;
```

### Live Dot (pulsing)
```css
width: 5–8px; height: 5–8px;
border-radius: 999px;
background: #E7CE92;
box-shadow: 0 0 10px #E7CE92;
animation: dot-pulse 1.3–1.4s ease-in-out infinite;

@keyframes dot-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.35; transform:scale(.65); }
}
```

### Live Ticker Strip
```css
background: #111019;
border-bottom: 1px solid rgba(231,206,146,0.08);
padding: 8px 0;
/* Content: LIVE dot | masked marquee text */
/* mask: linear-gradient(90deg, transparent, #000 7%, #000 90%, transparent) */
animation: marquee 20s linear infinite;
```

### Authenticated PSA Slab
Structure (top → card → bottom):
- **Header bar:** `linear-gradient(90deg,#201D15,#2E2A1E,#201D15)` · border-bottom `2px solid #3A3624`
  - Left: "TOKYO LUCKY" in Space Grotesk, 7.5px, tracking 0.22em, gold `#E7CE92`
  - Center: 3-color stripe decorations (red/green/blue — 8×3px each)
  - Right: "VAULT AUTH" in muted
- **Card area:** `background: #0A0808` · card image `object-fit: contain` · holo sheen overlay sweeping
- **Footer bar:** same gradient · left "GEM MINT" + cert # · right **grade number** in gold (32px, font-weight 700)
- Outer border: `2.5px solid #2A2820`, border-radius `4px`
- Box shadow: `0 18px 52px rgba(0,0,0,0.65), 0 0 38px rgba(231,206,146,0.09)`

### Card Frame (in reveal / vault)
```css
border-radius: 4px;          /* near-square corners */
border: 1.5px solid {rarityColor};
box-shadow: 0 0 36px {rarityColor}55, inset 0 0 50px rgba(0,0,0,0.35);
overflow: hidden;
/* Holo sheen: */
.sheen {
  position: absolute;
  width: 45%; height: 120%;
  background: linear-gradient(90deg, transparent, rgba(231,206,146,0.13), transparent);
  animation: sheen 3.8s ease-in-out infinite;
  mix-blend-mode: screen;
}
@keyframes sheen {
  0%   { transform: translateX(-100%) rotate(8deg); }
  100% { transform: translateX(220%) rotate(8deg); }
}
```

### Bottom Nav Bar
```css
border-top: 1px solid rgba(231,206,146,0.09);
background: #0D0D10;
height: 54px + 16px home-indicator;
/* Active icon/label: #E7CE92 | Inactive: #5A5550 */
```
Icons (stroke, not fill): Home, Lock (Vault), Credit card (Wallet), Radio waves (Live)

### Wallet Balance Hero
```css
font-family: 'Cormorant Garamond', serif;
font-size: 48px;
font-weight: 600;
color: #E7CE92;
/* Above: 9.5px AVAILABLE BALANCE label, tracking 0.2em, color #9A9285 */
/* Below: green success note with star SVG */
```

---

## Animations

| Name | Usage |
|---|---|
| `sheen` | Holo sweep across card/slab — `translateX(-100% → 220%) rotate(8deg)`, 3.4–4.5s ease-in-out infinite |
| `float` | Phone bezel idle — `translateY(0 → -7px)`, 7s ease-in-out infinite |
| `glow` | Legendary card box-shadow pulse — alternates 28px/52px spread, 2s infinite |
| `marquee` | Live ticker — `translateX(0 → -50%)`, 16–20s linear infinite (duplicate content for seamless loop) |
| `dot-pulse` | Live indicator dot, 1.3–1.4s |
| `fade-up` | Entry animation — `opacity 0→1, translateY 14px→0`, 0.5–0.6s ease |
| `pop-in` | Buyback success number — `scale(.7)+translateY(18px) → scale(1.04) → scale(1)`, 0.7s |
| `scale-in` | Card reveal appear — spring, initial scale by tier (`.92` standard → `.6` legendary) |
| `sigil-drift` | Card-back compass sigil — `rotate(0→6deg) scale(1→1.04)`, 6s ease-in-out infinite |
| `deal` | Pick card entry — from `y:-170 scale:.62` with a per-index 45ms stagger, spring 210/20 |
| `disperse` | Unpicked cards leaving — outward from grid centre + fade, 0.55s ease-in |
| `charge-motes` | Gold particles spiralling into the card, count by tier (10 → 34) |
| `burst` | Reveal payoff — shockwave ring (scale .2→3.2), conic light rays, shards by tier (0 → 40) |

**Pull flow timing** — the API fires at `shuffle` and resolves underneath the deal and the
user's thinking time, so only `charge` ever has to wait. Timings compress ~60% under
`prefers-reduced-motion`.

| Phase | Duration | Stage |
|---|---|---|
| `shuffle` | 1300ms | Deck riffles, then deals 12 backs into the pick grid |
| `choosing` | user-paced | 12 interactive backs — pointer tilt, hover lift, rim glow |
| `converge` | 750ms | 11 cards blow outward; the picked one flies to centre (shared `layoutId`) |
| `charge` | 900ms + tier bonus (0/300/700/1200) | Motes spiral in, glow tightens. Holds if the API is still in flight |
| `flip` | 650ms | 3D `rotateY` turn — onto a **sleeve**, not the art; screen shake on epic/legendary |
| `peel` | user-paced | Drag the sleeve off in **any** direction — up, down, left or right. `dragDirectionLock` snaps to the axis you start on, so the four cardinal peels stay clean. Every edge carries a gold rim + sparks, grain ticks every 12%. Release past 38% of that axis (or flick) commits and the sleeve continues along its own vector; short of that it springs back. Tap, Enter or any arrow key uncovers it outright |
| `reveal` | — | PSA slab seals around the card, `RevealBurst` plays, payoff chime |

Tier comes from the pack's live `rarity_odds` (`< 2% legendary`, `< 8% epic`, `< 25% rare`,
else standard) — never a hardcoded rarity-name list, since rarities are free-form server-side.
The rarity colour is deliberately withheld until the flip so `charge` can't spoil the result.

Tap anywhere fast-forwards the current phase — except during `choosing` and `peel`, where the
user is holding the wheel and the cards/sleeve are their own affordance. "Skip the pick" and
"Sound" are persisted preferences on the idle screen; sound is procedurally synthesised via the
Web Audio API — there are no audio assets.

---

## Screen Inventory

| Screen | Route / State | Key elements |
|---|---|---|
| Onboarding / Login | `loggedIn: false` | Logo, tagline, email CTA, Google OAuth, trust footnote |
| Home | `tab: 'home'` | Ticker strip, greeting + wallet balance, featured pack card, 2×grid of smaller packs |
| Pack Detail | `overlay: 'pack'` | Pack hero, pull rates table (audited), trust badge, Pull · ฿300 CTA |
| Choose Your Card | `phase: 'shuffle' \| 'choosing'` | Deck riffle, 12 face-down backs (3×4 / 4×3 / 6×2), honesty note that the card is already drawn |
| Suspense | `phase: 'converge' \| 'charge' \| 'flip'` | Picked card flies to centre, gathers motes, turns over onto a sleeve |
| Uncover | `phase: 'peel'` | Drag the sleeve off any side — up, down, left or right — to expose the art at your own pace; rarity halo blooms behind |
| Card Reveal | `phase: 'reveal'` | PSA slab, burst, rarity badge, card name, Sell Instantly / Add to Vault / Pull Again |
| Instant Buyback | `overlay: 'buyback'` | Success checkmark, credit amount (+฿), new wallet balance, Pull Again |
| Vault | `tab: 'vault'` | 2×grid of owned cards with PSA grade badge overlay, total portfolio value |
| Wallet | `tab: 'wallet'` | Balance hero, Add Funds / Withdraw, transaction history list |
| Live Feed | `tab: 'feed'` | Event cards with avatar initials, rarity/credit badges, timestamps |

---

## Trust Signals (embed wherever relevant)

- "Payments via Stripe · Audited pull rates · 100% authentic inventory" — login footer
- Green shield badge: "Authenticated inventory. All cards graded and vaulted before listing. Pull rates audited monthly."
- PSA slab treatment on every revealed card (grade, cert number, VAULT AUTH label)
- Buyback rate always shown alongside rarity odds in pull rate table

---

## IP / Legal Notes

- All card art must be original or licensed — **no Pokémon, Nintendo, or WOTC trademarks**
- Abstract glyphs for placeholder cards: star, sparkle, diamond, flame (all original SVGs)
- Card names are original: Solar Phoenix, Void Tiger, Aurora Koi, Frost Serpent, Ember Drake, Storm Lynx
- "Obsidian Archive", "Gilded Era Vault", "Midnight Séance", "Apex Collection" — original pack names
- Pull rates must be audited and disclosed (legal requirement in Thai gambling-adjacent regulation)

---

## Tech Stack Notes

- **Payments:** Stripe (instant wallet credit on buyback)
- **Currency:** Thai Baht (฿ THB) — format as `฿12,480` (no decimal for whole baht)
- **Thai script:** Noto Sans Thai fallback on all body text; line-height ≥ 1.5 for Thai readability
- **Dark mode:** Dark-first, no light mode defined yet
- **Mobile-first:** Primary canvas 368×796px (≈ iPhone 14 Pro screen area)
- **Fonts to load:** Cormorant Garamond, Jost, Space Grotesk, Noto Sans Thai (all Google Fonts)
