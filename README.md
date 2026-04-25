# 💜 LiveDesk

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.0-blue)
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

### 💜 7 Anime Characters — switchable in one tap

Seven hand-picked Live2D anime characters, each with her own personality, greeting, and nickname. Switch between them directly on the card — the character loads instantly from a CDN with no local files needed.

| Character | Personality |
|-----------|-------------|
| **Neptune 💜** | Cheerful, bubbly, calls herself "Nep" |
| **Vert 💚** | Calm and mature, onee-san energy |
| **Koharu 🌸** | Sweet and gentle, spring vibes |
| **Shizuku ❄️** | Cool and collected — has real sound files |
| **Noire 🖤** | Tsundere, tries to act indifferent |
| **Uni 🩷** | Energetic younger sister type |
| **Blanc 📖** | Quiet bookworm, few words but meaningful |

The 🔄 button on the card cycles through all characters. The last chosen character is remembered via `localStorage` — she'll be there when you come back.

> **Shizuku** is the only character with actual voice audio files — her sounds will play during interactions in addition to TTS.

---

### 🗂️ Mini Mode — shrinks to corner, pins to every view

Tap the **📌 Pin** button and the character collapses into a compact floating widget — anchored to the bottom corner of your screen. She stays visible as you navigate between dashboards, views, and subpages. Switch back to full card mode anytime with a single tap.

**What Mini Mode does:**
- Character shrinks and floats to the bottom-right corner of the browser window
- Persists across all Lovelace views — she follows you everywhere
- Speech bubble still pops up with reactions and alerts
- TTS still speaks — you'll hear her even when she's minimized
- Tap the pinned character to expand back to full card

This is the feature that makes LiveDesk feel like a real companion rather than just a card. She's always there — not just on the dashboard view where the card lives.

---

### 💬 Smart Greeting Bubbles — context-aware, always fresh

The speech bubble doesn't just say "Hello." It knows what time it is, what the weather is doing, and how warm it is — and it greets you accordingly.

**Greeting logic:**
- **Morning / Afternoon / Evening / Night** — different greeting sets for each period
- **Temperature reaction** — too cold 🥶, comfortable 😊, hot 🥵, scorching 🔥
- **Humidity reaction** — dry air warning, comfortable range, muggy alert
- **Weather reaction** — sunny ☀️, rainy 🌧️, stormy ⛈️, foggy 🌫️, snowy ❄️, and more
- **Owner name** — the character calls you by the name you set in config
- **Character nickname** — fully customisable (`{c}` in every message resolves to her name)

The bubble cycles automatically every 3 seconds through available messages. You'll never see the same greeting twice in a row.

---

### 🚨 Real-Time Alert Reactions

Wire up binary sensors and the character reacts the moment state changes — no polling delay, no refresh needed.

| Sensor | On event | Off event |
|--------|----------|-----------|
| 🚶 Motion | Surprised, spots movement | Relieved, all quiet |
| 🚪 Door | Reports door opened, asks who | Confirms door closed |
| 🔥 Smoke | **URGENT — evacuate now!** | All clear, relieved |

Smoke alerts are treated as the highest priority — the message is urgent and emphatic, not playful.

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

Configurable per character nickname — the character introduces herself by her own name when TTS fires.

```yaml
tts:
  engine: ha_service
  service: tts.speak
  entity_id: tts.google_translate_vi_com
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

```yaml
entities:
  - entity: light.living_room
    name: Living Room Light
  - entity: fan.bedroom
  - entity: switch.tv_socket
  - entity: climate.aircon
```

Each button shows current state and toggles the entity on tap.

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
| 🔧 **Devices** | Entity list with names (up to 12) |

Badge counters on each section show how many entities are connected.

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
name: Long                        # your name — the character calls you this
char_nickname: Nep                # optional: override character's self-name
height: 440                       # card height in px
float_height: 650                 # mini mode character height
float_width:  400                 # mini mode width
card_blur: 8                      # background blur (0 = fully transparent)

temp_sensor:    sensor.temperature
humid_sensor:   sensor.humidity
weather_entity: weather.home
motion_sensor:  binary_sensor.motion
door_sensor:    binary_sensor.front_door
smoke_sensor:   binary_sensor.smoke_detector

tts:
  engine: webspeech
  lang: vi-VN
  rate: 1.05
  pitch: 1.2

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
| `name` | `bạn` | Owner name — used in greetings |
| `char_nickname` | *(character default)* | Override character's self-name |
| `height` | `440` | Card height (px) |
| `float_height` | `650` | Mini mode character height (px) |
| `float_width` | `400` | Mini mode width (px) |
| `card_blur` | `8` | Background blur (0–30) |
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
  lang: vi-VN      # optional
  rate: 1.05       # 0.5–2.0
  pitch: 1.2       # 0–2
```

#### Google Translate
```yaml
tts:
  engine: google_translate
  lang: vi
```

#### HA Service — tts.speak (HA 2023.8+, recommended)
```yaml
tts:
  engine: ha_service
  service: tts.speak
  entity_id: tts.google_translate_vi_com
  media_player_entity_id: media_player.living_room_speaker  # optional
  cache: true
```

#### HA Service — legacy
```yaml
tts:
  engine: ha_service
  service: tts.google_translate_say
  entity_id: media_player.living_room_speaker
  lang: vi
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

### v1.0.0
- 💜 **7 anime characters** — Neptune, Vert, Koharu, Shizuku, Noire, Uni, Blanc — switchable via 🔄 button, saved in localStorage
- 📌 **Mini Mode / Pin** — character collapses to floating corner widget, persists across all Lovelace views
- 💬 **Smart greeting bubbles** — time-aware, sensor-driven, cycles automatically every 3s
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
