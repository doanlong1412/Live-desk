# 💜 LiveDesk

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.1.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇻🇳 **Phiên bản tiếng Việt:** [README.vi.md](README.vi.md)

**Your Home Assistant dashboard just got a companion.** An anime Live2D character lives in your card, watches your sensors in real time, greets you by name, reacts to temperature and weather, warns you about smoke or motion — and speaks every word out loud. Pin her to any view and she floats above your entire dashboard, always visible, always present.

One card. Zero dependencies. Drops straight into Home Assistant.

---

## 📸 Preview

![LiveDesk Preview](assets/preview1.png)

![LiveDesk Preview](assets/preview2.png)

---

## ✨ What makes this different

Most Lovelace cards show data. LiveDesk gives that data **a voice and a face**. Neptune greets you with good morning when you walk in. Shizuku warns you when smoke is detected. Vert tells you it's too humid. The character cycles her speech bubble automatically, and everything — the greeting, the reaction, the voice — is driven by your actual Home Assistant sensors, in real time.

---

## 🚀 Features

---

### 💜 27 Anime Characters — switchable with ◀ ▶ buttons

Twenty-seven hand-picked Live2D anime characters, each with her own personality, greeting, and nickname. Switch between them directly on the card using the ◀ Prev and ▶ Next buttons — the character loads instantly from a CDN with no local files needed. The last chosen character is remembered via `localStorage`.

**Hyperdimension Neptunia:**

| Character | Personality |
|-----------|-------------|
| **Neptune 💜** | Cheerful, bubbly, calls herself "Nep" |
| **Neptune Sailor ⚓** | Nep in sailor outfit — nautical energy |
| **Neptune Santa 🎅** | Holiday Nep, brings gifts |
| **Vert 💚** | Calm and mature, onee-san energy |
| **Vert Classic 🌿** | Classic outfit variant |
| **Koharu 🌸** | Sweet and gentle, spring vibes |
| **Shizuku ❄️** | Cool and collected — has real sound files |
| **Noire 🖤** | Tsundere, tries to act indifferent |
| **Uni 🩷** | Energetic younger sister type |
| **Blanc 📖** | Quiet bookworm, few words but meaningful |
| **Tia 🧪** | Potion merchant, cheerful researcher |

**Girls' Frontline:**

| Character | Personality |
|-----------|-------------|
| **HK416 Normal 🎯** | Disciplined, mission-focused |
| **HK416 Destroy 💥** | Battle-damaged, still fighting |
| **UMP45 🔫** | Casual guardian, always on watch |
| **M4A1 🛡️** | Duty-first, steady protector |
| **SOPMOD-II 🔥** | Explosive personality, loves action |
| **WA2000 Destroy 🌹** | Tsundere sniper, damaged but proud |
| **G36 🎯** | Calm analyst, monitors everything |
| **NTW-20 🔭** | Silent observer, long-range focus |
| **K2 💜** | Warm protector, always reassuring |
| **PKP 🎀** | Deceptively gentle, still dangerous |
| **RFB 🎄** | Festive spirit, brings holiday cheer |
| **Lewis 🌸** | Kimono variant, refined and poised |
| **DSR-50 🔴** | Laid-back, invites you to stay a while |
| **Gelina ⚙️** | Mech enthusiast, DIY spirit |

**Other:**

| Character | Personality |
|-----------|-------------|
| **Len Space 🚀** | Cosmic traveller, stargazer vibes |

> **Shizuku** is the only character with actual voice audio files — her sounds play during interactions in addition to TTS.

> Each character has her own pool of unique dialogue lines that cycle through the bubble automatically.

---

### 🌐 Bilingual Interface — English & Vietnamese

LiveDesk ships with full English and Vietnamese support. Switch languages directly from the visual editor — every UI label, greeting bubble, sensor reaction message, alert, and character dialogue switches instantly. No reload required.

- **Editor UI** — all section labels, field hints, and button text switch with the language toggle
- **Character greetings** — each of the 27 characters has localised greeting text for both languages
- **Sensor reactions** — temperature, humidity, weather, and alert messages are fully translated
- **Greeting bubbles** — time-of-day greetings, idle quotes, and click reactions all adapt to the selected language
- **Device tooltips** — hover descriptions for toolbar entities switch language too

The selected language is saved to `localStorage` and restored on every page load.

---

### 🗂️ Mini Mode — shrinks to corner, pins to every view

Tap the **📌 Pin** button and the character collapses into a compact floating widget — anchored to the bottom-right corner of your screen. She stays visible as you navigate between dashboards, views, and subpages. Switch back to full card mode anytime with a single tap.

**What Mini Mode does:**
- Character shrinks and floats to the bottom-right corner of the browser window
- Persists across all Lovelace views — she follows you everywhere
- Speech bubble still pops up with reactions and alerts
- TTS still speaks — you'll hear her even when she's minimized
- Double-click the pinned character to expand back to full card

---

### 💬 Smart Greeting Bubbles — context-aware, always fresh

The speech bubble knows what time it is, what the weather is doing, and how warm it is — and it greets you accordingly.

**Greeting logic:**
- **Early morning / Morning / Noon / Afternoon / Evening / Late night** — different greeting sets for each period
- **Temperature reaction** — too cold 🥶, comfortable 😊, hot 🥵, scorching 🔥
- **Humidity reaction** — dry air warning, comfortable range, muggy alert
- **Weather reaction** — sunny ☀️, rainy 🌧️, stormy ⛈️, foggy 🌫️, snowy ❄️, and more
- **Owner name** — the character calls you by the name you set in config
- **Character nickname** — fully customisable (`{c}` in every message resolves to her name)
- **Per-character idle quotes** — each character has her own pool of personality-driven lines

The bubble cycles automatically every 5 seconds through available messages.

---

### 🚨 Real-Time Alert Reactions

Wire up binary sensors and the character reacts the moment state changes — no polling delay, no refresh needed.

| Sensor | On event | Off event |
|--------|----------|-----------|
| 🚶 Motion | Surprised, spots movement | Relieved, all quiet |
| 🚪 Door | Reports door opened, asks who | Confirms door closed |
| 🔥 Smoke | **URGENT — evacuate now!** | All clear, relieved |

Smoke alerts are treated as the highest priority — the message is urgent and emphatic, not playful.

**Welcome home detection** — when both door and motion sensors are configured, LiveDesk can tell the difference between someone arriving and someone leaving. If the door opens while motion is off, then motion triggers within 15 seconds, the character fires a personalised welcome-home reaction with TTS and a dance animation. If motion was already active when the door opened, it's treated as someone leaving and no welcome plays. The welcome fires exactly once per door event.

---

### 🔊 TTS — 4 engines, fully configurable

The character speaks every greeting and alert out loud. Four TTS engines are supported — pick the one that fits your setup.

| Engine | Description |
|--------|-------------|
| **Web Speech** | Browser built-in voices — works everywhere, zero setup |
| **Google Translate** | Crisp Google voices via audio tag — no HA addon required |
| **HA Service (tts.speak)** | HA 2023.8+ native — plays on browser or physical speaker |
| **HA Service (legacy)** | `tts.google_translate_say` / `tts.cloud_say` — older setups |
| **None** | Disable TTS completely |

```yaml
tts:
  engine: ha_service
  service: tts.speak
  entity_id: tts.google_translate_en_com
  media_player_entity_id: media_player.living_room_speaker
  cache: true
```

---

### 🌡️ Environment Sensors — live reactions

Connect temperature, humidity, and weather sensors and the character reacts in real time whenever values shift into a new range.

```yaml
temp_sensor:    sensor.temperature
humid_sensor:   sensor.humidity
weather_entity: weather.home
```

Temperature thresholds: ≤16°C 🥶 · 17–22°C 😊 · 23–28°C 😊 · 29–33°C 🥵 · 34°C+ 🔥  
Humidity thresholds: ≤30% 💨 · 31–60% 💧 · 61–80% 💦 · 81%+ 🌊

---

### 🔧 Device Toolbar — quick controls

Add any Home Assistant entities to the toolbar inside the card — lights, fans, switches, climate, covers, media players, cameras, sensors, automations, scripts, scenes, locks, vacuums, and more. The card auto-detects the device type from the entity ID prefix and applies the correct icon and label.

When hovering over any entity button on the dashboard, the character introduces that device with a personalised line — localised to the selected interface language.

```yaml
entities:
  - entity: light.living_room
    name: Living Room Light
  - entity: fan.bedroom
  - entity: switch.tv_socket
  - entity: climate.aircon
```

---

### 🎛️ Visual Config Editor

Everything configurable without touching YAML. The editor uses accordion sections for a clean layout:

| Section | Contents |
|---------|----------|
| ⚙️ **General** | Owner name, character nickname, card height |
| 🎨 **Appearance** | Background blur, mini mode dimensions |
| 🌡️ **Sensors** | Temperature, humidity, weather entity |
| 🚨 **Alerts** | Motion, door, smoke sensor |
| 🔊 **TTS** | Engine, language, rate, pitch, HA service config |
| 🏠 **Devices** | Entity list with names (up to 12) |

Badge counters on each section show how many entities are connected. A language switcher at the top of the editor toggles between 🇻🇳 Vietnamese and 🇬🇧 English instantly.

---

## 📦 Installation

### Option 1 — HACS (recommended, 30 seconds)

**Step 1** — Add this repository to HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=live-desk&category=plugin)

> If the button doesn't work, add manually:
> **HACS → Frontend → ⋮ → Custom repositories**
> URL: `https://github.com/doanlong1412/live-desk` → Type: **Dashboard** → Add

**Step 2** — Search **LiveDesk** → **Install**

**Step 3** — Hard-reload your browser (`Ctrl+Shift+R`)

---

### Option 2 — Manual

1. Download [`livedesk.js`](https://github.com/doanlong1412/live-desk/releases/latest)
2. Copy to `/config/www/livedesk.js`
3. **Settings → Dashboards → Resources → Add resource:**
   ```
   URL:  /local/livedesk.js
   Type: JavaScript module
   ```
4. Hard reload (`Ctrl+Shift+R`)

---

## ⚙️ Configuration

Add the card to your dashboard:

```yaml
type: custom:live-desk
```

Then click **✏️ Edit** — the visual editor handles the rest.

---

### Full YAML example

```yaml
type: custom:live-desk
name: Alex                        # your name — the character calls you this
char_nickname: Nep                # optional: override character's self-name
height: 440                       # card height in px
float_height: 650                 # mini mode character height
float_width:  400                 # mini mode width
card_blur: 8                      # background blur (0 = fully transparent)
lang: en                          # interface language: en or vi (default vi)

temp_sensor:    sensor.temperature
humid_sensor:   sensor.humidity
weather_entity: weather.home
motion_sensor:  binary_sensor.motion
door_sensor:    binary_sensor.front_door
smoke_sensor:   binary_sensor.smoke_detector

tts:
  engine: webspeech
  lang: en-US
  rate: 1.05
  pitch: 1.2

toolbar_enabled: true
alert_tts_enabled: true

entities:
  - entity: light.living_room
    name: Living Room
  - entity: fan.bedroom
  - entity: switch.tv_socket
  - entity: climate.aircon
```

---

### Config reference

| Key | Default | Description |
|-----|---------|-------------|
| `name` | `you` / `bạn` | Owner name — used in greetings |
| `char_nickname` | *(character default)* | Override character's self-name |
| `lang` | `vi` | Interface language: `en` or `vi` |
| `height` | `440` | Card height (px) |
| `float_height` | `650` | Mini mode character height (px) |
| `float_width` | `400` | Mini mode width (px) |
| `card_blur` | `8` | Background blur (0–30) |
| `toolbar_enabled` | `false` | Enable device toolbar & hover reactions |
| `alert_tts_enabled` | `true` | Read alerts aloud via TTS |
| `temp_sensor` | — | Temperature sensor entity |
| `humid_sensor` | — | Humidity sensor entity |
| `weather_entity` | — | HA weather entity |
| `motion_sensor` | — | Motion binary sensor |
| `door_sensor` | — | Door binary sensor |
| `smoke_sensor` | — | Smoke / fire binary sensor |
| `entities` | `[]` | Device list for toolbar (max 12) |

---

### TTS engine reference

#### Web Speech (default)
```yaml
tts:
  engine: webspeech
  lang: en-US      # optional
  rate: 1.05       # 0.5–2.0
  pitch: 1.2       # 0–2
```

#### Google Translate
```yaml
tts:
  engine: google_translate
  lang: en
```

#### HA Service — tts.speak (HA 2023.8+, recommended)
```yaml
tts:
  engine: ha_service
  service: tts.speak
  entity_id: tts.google_translate_en_com
  media_player_entity_id: media_player.living_room_speaker  # optional
  cache: true
```

#### HA Service — legacy
```yaml
tts:
  engine: ha_service
  service: tts.google_translate_say
  entity_id: media_player.living_room_speaker
  lang: en
```

#### Disable TTS
```yaml
tts:
  engine: none
```

---

## 🖥️ Compatibility

| | |
|---|---|
| Home Assistant | 2023.1+ |
| Lovelace | Default & custom dashboards |
| Devices | Mobile & Desktop |
| Dependencies | **None** |
| Browsers | Chrome, Firefox, Safari, Edge |

---

## 📋 Changelog

### v1.1.1
- 🔧 **`_ownerName()` helper** — centralised owner name resolution; removes repeated inline fallback scattered across the codebase
- 🌍 **`getStubConfig` neutral entity IDs** — default stub now uses `sensor.temperature` / `sensor.humidity` instead of Vietnamese-named entities
- 💜 **Vietnamese dialogue for 12 new characters** — `byModel_vi` now includes full personality-matched quote pools for Neptune Sailor, Neptune Santa, Vert Classic, G36, NTW-20, Len Space, K2, PKP, RFB, Lewis, DSR-50, and Gelina; `lang: vi` no longer falls back to Neptune for these characters
- 🏠 **Welcome home detection** — when door + motion sensors are both configured, the character now distinguishes arrivals from departures; a personalised welcome with TTS and dance animation fires when motion triggers within 15 s of door opening (only if motion was off at door open time); fires exactly once per door event
- 📋 **Config reference** — added missing `toolbar_enabled` and `alert_tts_enabled` fields to documentation

### v1.1.0
- 🌐 **Full bilingual support** — English and Vietnamese, switchable live from the editor; greetings, sensor reactions, alerts, device tooltips, and all UI text adapt instantly
- 💜 **27 characters** — added 20 new characters: Neptune Sailor, Neptune Santa, Vert Classic, Tia, HK416 (Normal & Destroy), UMP45, M4A1, SOPMOD-II, WA2000 Destroy, G36, NTW-20, K2, PKP, RFB, Lewis, DSR-50, Gelina, Len Space — each with unique dialogue pool and bilingual greeting
- 🔄 **◀ Prev / ▶ Next navigation** — replaced single cycle button with two-directional character switching
- 🔁 **Reload button** — instantly reloads character iframe without full page refresh, with localised status message
- 🏠 **Bilingual device tooltips** — hover descriptions for all 17 entity domains now fully translated
- 🌐 **`lang` config key** — set interface language via YAML in addition to the editor toggle

### v1.0.0
- 💜 **7 anime characters** — Neptune, Vert, Koharu, Shizuku, Noire, Uni, Blanc — switchable via 🔄 button, saved in localStorage
- 📌 **Mini Mode / Pin** — character collapses to floating corner widget, persists across all Lovelace views
- 💬 **Smart greeting bubbles** — time-aware, sensor-driven, cycles automatically every 5s
- 🌡️ **Live sensor reactions** — temperature, humidity, weather conditions, all with contextual messages
- 🚨 **Real-time alert system** — motion, door, smoke binary sensors with instant character reaction
- 🔊 **4 TTS engines** — Web Speech, Google Translate, HA Service (tts.speak + legacy), or None
- 🔧 **Device toolbar** — up to 12 entities, auto-detected icon per domain
- 🎛️ **Visual Config Editor** — accordion sections, no YAML required
- 🌐 **Custom owner name + character nickname** — personalise every line of dialogue

---

## 📄 License

MIT — free to use, modify, and distribute.  
If LiveDesk makes your dashboard feel alive, please ⭐ **star the repo** — it genuinely helps.

---

## 🙏 Credits

Built by **[@doanlong1412](https://github.com/doanlong1412)** from 🇻🇳 Vietnam.

Live2D models hosted via [jsdelivr CDN](https://www.jsdelivr.com/) — credits to original model authors.  
Live2D rendering powered by [live2d-widget](https://github.com/stevenjoezhang/live2d-widget).
