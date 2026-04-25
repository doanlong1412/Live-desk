# Changelog

All notable changes to LiveDesk will be documented here.

---

## [v1.0.0] — 2025

### Added
- 💜 **7 anime characters** — Neptune, Vert, Koharu, Shizuku, Noire, Uni, Blanc
  - Switchable via 🔄 button on card
  - Last selected character saved in `localStorage`
  - Shizuku has real audio sound files
- 📌 **Mini Mode / Pin** — character collapses to floating corner widget
  - Persists across all Lovelace views
  - Speech bubble and TTS still active in mini mode
  - Tap to expand back to full card
- 💬 **Smart greeting bubbles**
  - Time-aware: Morning / Afternoon / Evening / Night sets
  - Sensor-driven: temperature, humidity, weather reactions
  - Auto-cycles every 3 seconds
  - Customisable owner name (`name`) and character nickname (`char_nickname`)
- 🌡️ **Environment sensors**
  - Temperature reactions across 5 ranges (≤16°C → 34°C+)
  - Humidity reactions across 4 ranges (≤30% → 81%+)
  - Full weather condition set (sunny, cloudy, rainy, stormy, foggy, snowy, windy, hail…)
- 🚨 **Real-time alert system**
  - Motion sensor — character spots movement / relaxes
  - Door sensor — reports open/close
  - Smoke sensor — urgent evacuation alert / all clear
- 🔊 **4 TTS engines**
  - Web Speech API (browser built-in, zero setup)
  - Google Translate TTS (no HA addon needed)
  - HA Service `tts.speak` (HA 2023.8+, recommended)
  - HA Service legacy (`tts.google_translate_say`, `tts.cloud_say`)
  - Option to disable TTS completely
- 🔧 **Device toolbar** — up to 12 entities
  - Auto icon detection from entity ID prefix (light, fan, switch, climate, cover, media_player, camera, sensor, binary_sensor, input_boolean, automation, script, scene, lock, alarm_control, vacuum)
  - Custom name per entity
- 🎛️ **Visual Config Editor** — accordion sections, no YAML required
  - General, Appearance, Sensors, Alerts, TTS, Devices
  - Badge counters per section
