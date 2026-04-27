# 💜 LiveDesk

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇬🇧 **English version (main):** [README.md](README.md)

**Dashboard Home Assistant của bạn vừa có thêm một người bạn đồng hành.** Một nhân vật anime Live2D sống ngay trong card, theo dõi sensor thời gian thực, chào bạn bằng tên, phản ứng với nhiệt độ và thời tiết, cảnh báo khói hoặc chuyển động — và nói to mọi thứ bằng giọng thật. Ghim nhân vật vào bất kỳ view nào và cô ấy sẽ nổi trên toàn bộ dashboard, luôn hiển thị, luôn ở đó.

Một card. Không cần cài thêm gì. Chạy thẳng vào Home Assistant.

---

## 📸 Preview

![LiveDesk Preview](assets/preview1.png)
![LiveDesk Preview](assets/preview2.png)

---

## ✨ Điểm khác biệt

Hầu hết các Lovelace card chỉ hiển thị dữ liệu. LiveDesk **trao cho dữ liệu đó một giọng nói và một khuôn mặt**. Neptune chào buổi sáng khi bạn bước vào. Shizuku cảnh báo khi phát hiện khói. Vert nhắc khi độ ẩm quá cao. Bong bóng thoại tự chuyển đổi liên tục, và tất cả — lời chào, phản ứng, giọng nói — đều được điều khiển bởi sensor Home Assistant thực tế của bạn, theo thời gian thực.

---

## 🚀 Tính năng

---

### 💜 27 Nhân vật Anime — đổi bằng nút ◀ ▶

Hai mươi bảy nhân vật Live2D anime được tuyển chọn kỹ càng, mỗi nhân vật có cá tính, lời chào và tên tự xưng riêng. Chuyển đổi trực tiếp trên card bằng nút ◀ Trước và ▶ Sau — nhân vật tải tức thì từ CDN, không cần file cục bộ. Nhân vật được chọn cuối cùng được lưu qua `localStorage`.

**Hyperdimension Neptunia:**

| Nhân vật | Cá tính |
|----------|---------|
| **Neptune 💜** | Vui vẻ, hoạt bát, tự xưng là "Nep" |
| **Neptune Sailor ⚓** | Nep mặc đồ thủy thủ — năng lượng biển cả |
| **Neptune Santa 🎅** | Nep Giáng sinh, mang quà cho mọi người |
| **Vert 💚** | Điềm tĩnh, chín chắn, kiểu onee-san |
| **Vert Classic 🌿** | Biến thể trang phục cổ điển |
| **Koharu 🌸** | Dịu dàng, ngọt ngào, hơi thở mùa xuân |
| **Shizuku ❄️** | Mát mẻ, gọn gàng — có file âm thanh thật |
| **Noire 🖤** | Tsundere, cố tỏ ra thờ ơ |
| **Uni 🩷** | Kiểu em gái năng động |
| **Blanc 📖** | Mọt sách trầm lặng, ít lời nhưng đáng nghe |
| **Tia 🧪** | Thương nhân potion, nhà nghiên cứu vui vẻ |

**Girls' Frontline:**

| Nhân vật | Cá tính |
|----------|---------|
| **HK416 Normal 🎯** | Kỷ luật, luôn tập trung nhiệm vụ |
| **HK416 Destroy 💥** | Bị thương nhưng vẫn chiến đấu |
| **UMP45 🔫** | Canh nhà thoải mái, luôn trong tư thế sẵn sàng |
| **M4A1 🛡️** | Nhiệm vụ trên hết, bảo vệ vững chắc |
| **SOPMOD-II 🔥** | Cá tính bùng nổ, thích hành động |
| **WA2000 Destroy 🌹** | Tsundere xạ thủ, bị thương nhưng kiêu hãnh |
| **G36 🎯** | Phân tích điềm tĩnh, giám sát mọi thứ |
| **NTW-20 🔭** | Quan sát viên im lặng, tầm nhìn xa |
| **K2 💜** | Bảo vệ ấm áp, luôn trấn an |
| **PKP 🎀** | Dịu dàng bề ngoài, vẫn nguy hiểm |
| **RFB 🎄** | Tinh thần lễ hội, mang niềm vui Giáng sinh |
| **Lewis 🌸** | Biến thể kimono, thanh lịch và duyên dáng |
| **DSR-50 🔴** | Thoải mái, mời bạn ngồi xuống tâm sự |
| **Gelina ⚙️** | Mê cơ khí, tinh thần DIY |

**Khác:**

| Nhân vật | Cá tính |
|----------|---------|
| **Len Space 🚀** | Du hành vũ trụ, mơ mộng về các vì sao |

> **Shizuku** là nhân vật duy nhất có file âm thanh thật — tiếng của cô ấy sẽ phát trong các tương tác, bên cạnh TTS.

> Mỗi nhân vật có bộ câu thoại riêng biệt tự động xoay vòng trong bong bóng.

---

### 🌐 Giao diện song ngữ — Tiếng Việt & Tiếng Anh

LiveDesk hỗ trợ đầy đủ cả tiếng Việt và tiếng Anh. Chuyển ngôn ngữ trực tiếp từ visual editor — toàn bộ nhãn giao diện, lời chào trong bong bóng, phản ứng sensor, cảnh báo và câu thoại nhân vật đều chuyển đổi ngay lập tức. Không cần reload.

- **Giao diện Editor** — toàn bộ nhãn section, gợi ý field và nút bấm chuyển theo ngôn ngữ
- **Lời chào nhân vật** — cả 27 nhân vật đều có lời chào riêng cho cả hai ngôn ngữ
- **Phản ứng sensor** — nhiệt độ, độ ẩm, thời tiết và cảnh báo đều được dịch đầy đủ
- **Bong bóng thoại** — lời chào theo giờ, câu idle và phản ứng click đều theo ngôn ngữ đã chọn
- **Tooltip thiết bị** — mô tả hover cho entity trong toolbar cũng chuyển ngôn ngữ

Ngôn ngữ được lưu vào `localStorage` và tự khôi phục mỗi khi tải trang.

---

### 🗂️ Chế độ Mini — thu nhỏ xuống góc, ghim trên mọi view

Nhấn nút **📌 Ghim** và nhân vật sẽ thu gọn thành widget nổi nhỏ — neo vào góc dưới bên phải màn hình. Cô ấy hiển thị liên tục khi bạn điều hướng giữa các dashboard, view và subpage. Quay lại chế độ card đầy đủ bất cứ lúc nào chỉ với một cú chạm.

**Chế độ Mini làm gì:**
- Nhân vật thu nhỏ và nổi ở góc dưới bên phải cửa sổ trình duyệt
- Hiển thị liên tục qua tất cả các Lovelace view — cô ấy đi theo bạn khắp nơi
- Bong bóng thoại vẫn hiện với phản ứng và cảnh báo
- TTS vẫn nói — bạn sẽ nghe thấy cô ấy ngay cả khi thu nhỏ
- Đúp click vào nhân vật đang ghim để mở rộng lại thành card đầy đủ

---

### 💬 Bong bóng thoại thông minh — nhận biết ngữ cảnh, luôn mới

Bong bóng thoại biết mấy giờ rồi, thời tiết đang thế nào, nhiệt độ bao nhiêu — rồi chào bạn theo đúng ngữ cảnh đó.

**Logic lời chào:**
- **Sáng sớm / Sáng / Trưa / Chiều / Tối / Đêm khuya** — bộ lời chào khác nhau cho từng buổi
- **Phản ứng nhiệt độ** — lạnh quá 🥶, dễ chịu 😊, nóng 🥵, hầm hập 🔥
- **Phản ứng độ ẩm** — cảnh báo khô, khoảng dễ chịu, ngột ngạt
- **Phản ứng thời tiết** — nắng ☀️, mưa 🌧️, bão ⛈️, sương mù 🌫️, tuyết ❄️, và nhiều hơn
- **Tên chủ nhân** — nhân vật gọi bạn bằng tên bạn đặt trong config
- **Tên tự xưng** — tuỳ chỉnh được (`{c}` trong mọi câu thoại sẽ thành tên cô ấy)
- **Câu idle riêng theo nhân vật** — mỗi nhân vật có bộ câu thoại thể hiện cá tính riêng

Bong bóng tự chuyển mỗi 5 giây qua các câu có sẵn.

---

### 🚨 Phản ứng cảnh báo thời gian thực

Kết nối binary sensor và nhân vật phản ứng ngay khi trạng thái thay đổi — không cần polling, không cần refresh.

| Sensor | Khi bật | Khi tắt |
|--------|---------|---------|
| 🚶 Chuyển động | Ngạc nhiên, phát hiện người | Nhẹ nhõm, yên tĩnh trở lại |
| 🚪 Cửa | Báo cửa mở, hỏi ai ra vào | Xác nhận cửa đóng |
| 🔥 Khói | **KHẨN CẤP — thoát ngay!** | Hết khói, thở phào |

Cảnh báo khói được ưu tiên cao nhất — câu nói mang tính khẩn cấp và quyết đoán, không vui vẻ.

---

### 🔊 TTS — 4 engine, cấu hình linh hoạt

Nhân vật nói to mọi lời chào và cảnh báo. Bốn TTS engine được hỗ trợ — chọn cái phù hợp với thiết lập của bạn.

| Engine | Mô tả |
|--------|-------|
| **Web Speech** | Giọng nói có sẵn trong trình duyệt — chạy mọi nơi, không cần cấu hình |
| **Google Translate** | Giọng Google rõ ràng qua audio tag — không cần addon HA |
| **HA Service (tts.speak)** | HA 2023.8+ native — phát trên trình duyệt hoặc loa vật lý |
| **HA Service (legacy)** | `tts.google_translate_say` / `tts.cloud_say` — thiết lập cũ |
| **None** | Tắt hoàn toàn TTS |

```yaml
tts:
  engine: ha_service
  service: tts.speak
  entity_id: tts.google_translate_vi_com
  media_player_entity_id: media_player.loa_phong_khach
  cache: true
```

---

### 🌡️ Cảm biến môi trường — phản ứng trực tiếp

Kết nối cảm biến nhiệt độ, độ ẩm và thời tiết để nhân vật phản ứng thời gian thực mỗi khi giá trị chuyển sang ngưỡng mới.

```yaml
temp_sensor:    sensor.nhiet_do
humid_sensor:   sensor.do_am
weather_entity: weather.home
```

Ngưỡng nhiệt độ: ≤16°C 🥶 · 17–22°C 😊 · 23–28°C 😊 · 29–33°C 🥵 · 34°C+ 🔥  
Ngưỡng độ ẩm: ≤30% 💨 · 31–60% 💧 · 61–80% 💦 · 81%+ 🌊

---

### 🔧 Thanh công cụ thiết bị — điều khiển nhanh

Thêm bất kỳ entity Home Assistant nào vào toolbar trong card — đèn, quạt, công tắc, điều hòa, rèm, TV/loa, camera, cảm biến, tự động hóa, script, cảnh, khóa, robot hút bụi, và nhiều hơn. Card tự nhận loại thiết bị từ prefix của entity ID và áp đúng icon, nhãn tương ứng.

Khi hover vào bất kỳ nút entity nào trên dashboard, nhân vật sẽ giới thiệu thiết bị đó bằng câu thoại cá nhân hóa — dịch theo ngôn ngữ giao diện đang chọn.

```yaml
entities:
  - entity: light.phong_khach
    name: Đèn phòng khách
  - entity: fan.phong_ngu
  - entity: switch.o_cam_tivi
  - entity: climate.dieu_hoa
```

---

### 🎛️ Visual Config Editor

Cấu hình mọi thứ mà không cần chạm vào YAML. Editor dùng accordion section gọn gàng:

| Section | Nội dung |
|---------|----------|
| ⚙️ **Cài đặt chung** | Tên chủ nhân, tên tự xưng, chiều cao card |
| 🎨 **Giao diện & Hiệu ứng** | Blur nền, kích thước chế độ mini |
| 🌡️ **Cảm biến môi trường** | Nhiệt độ, độ ẩm, entity thời tiết |
| 🚨 **Cảm biến cảnh báo** | Chuyển động, cửa, khói |
| 🔊 **Giọng nói (TTS)** | Engine, ngôn ngữ, tốc độ, pitch, cấu hình HA service |
| 🏠 **Thiết bị hiển thị (toolbar)** | Danh sách entity kèm tên (tối đa 12) |

Badge đếm trên từng section cho biết bao nhiêu entity đã kết nối. Bộ chuyển ngôn ngữ ở đầu editor cho phép chuyển đổi ngay lập tức giữa 🇻🇳 Tiếng Việt và 🇬🇧 English.

---

## 📦 Cài đặt

### Cách 1 — HACS (khuyên dùng, 30 giây)

**Bước 1** — Thêm repo vào HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=live-desk&category=plugin)

> Nếu nút không hoạt động, thêm thủ công:
> **HACS → Frontend → ⋮ → Custom repositories**
> URL: `https://github.com/doanlong1412/live-desk` → Type: **Dashboard** → Add

**Bước 2** — Tìm **LiveDesk** → **Install**

**Bước 3** — Hard reload trình duyệt (`Ctrl+Shift+R`)

---

### Cách 2 — Thủ công

1. Tải file [`livedesk.js`](https://github.com/doanlong1412/live-desk/releases/latest)
2. Copy vào `/config/www/livedesk.js`
3. **Settings → Dashboards → Resources → Add resource:**
   ```
   URL:  /local/livedesk.js
   Type: JavaScript module
   ```
4. Hard reload (`Ctrl+Shift+R`)

---

## ⚙️ Cấu hình

Thêm card vào dashboard:

```yaml
type: custom:live-desk
```

Rồi nhấn **✏️ Edit** — visual editor lo hết phần còn lại.

---

### Ví dụ YAML đầy đủ

```yaml
type: custom:live-desk
name: Long                        # tên của bạn — nhân vật sẽ gọi tên này
char_nickname: Nep                # tuỳ chọn: ghi đè tên tự xưng của nhân vật
height: 440                       # chiều cao card (px)
float_height: 650                 # chiều cao nhân vật chế độ mini
float_width:  400                 # chiều rộng chế độ mini
card_blur: 8                      # độ mờ nền (0 = trong suốt hoàn toàn)
lang: vi                          # ngôn ngữ giao diện: vi hoặc en (mặc định vi)

temp_sensor:    sensor.nhiet_do
humid_sensor:   sensor.do_am
weather_entity: weather.home
motion_sensor:  binary_sensor.chuyen_dong
door_sensor:    binary_sensor.cua_chinh
smoke_sensor:   binary_sensor.bao_khoi

tts:
  engine: webspeech
  lang: vi-VN
  rate: 1.05
  pitch: 1.2

entities:
  - entity: light.phong_khach
    name: Đèn phòng khách
  - entity: fan.phong_ngu
  - entity: switch.o_cam_tivi
  - entity: climate.dieu_hoa
```

---

### Tham chiếu cấu hình

| Key | Mặc định | Mô tả |
|-----|----------|-------|
| `name` | `bạn` / `you` | Tên chủ nhân — dùng trong lời chào |
| `char_nickname` | *(tên mặc định nhân vật)* | Ghi đè tên tự xưng của nhân vật |
| `lang` | `vi` | Ngôn ngữ giao diện: `vi` hoặc `en` |
| `height` | `440` | Chiều cao card (px) |
| `float_height` | `650` | Chiều cao nhân vật chế độ mini (px) |
| `float_width` | `400` | Chiều rộng chế độ mini (px) |
| `card_blur` | `8` | Độ mờ nền (0–30) |
| `temp_sensor` | — | Entity cảm biến nhiệt độ |
| `humid_sensor` | — | Entity cảm biến độ ẩm |
| `weather_entity` | — | Entity thời tiết HA |
| `motion_sensor` | — | Binary sensor chuyển động |
| `door_sensor` | — | Binary sensor cửa |
| `smoke_sensor` | — | Binary sensor khói / báo cháy |
| `entities` | `[]` | Danh sách thiết bị trong toolbar (tối đa 12) |

---

### Tham chiếu TTS engine

#### Web Speech (mặc định)
```yaml
tts:
  engine: webspeech
  lang: vi-VN      # tuỳ chọn
  rate: 1.05       # 0.5–2.0
  pitch: 1.2       # 0–2
```

#### Google Translate
```yaml
tts:
  engine: google_translate
  lang: vi
```

#### HA Service — tts.speak (HA 2023.8+, khuyên dùng)
```yaml
tts:
  engine: ha_service
  service: tts.speak
  entity_id: tts.google_translate_vi_com
  media_player_entity_id: media_player.loa_phong_khach   # tuỳ chọn
  cache: true
```

#### HA Service — legacy
```yaml
tts:
  engine: ha_service
  service: tts.google_translate_say
  entity_id: media_player.loa_phong_khach
  lang: vi
```

#### Tắt TTS
```yaml
tts:
  engine: none
```

---

## 🖥️ Tương thích

| | |
|---|---|
| Home Assistant | 2023.1+ |
| Lovelace | Default & custom dashboard |
| Thiết bị | Mobile & Desktop |
| Dependencies | **Không cần cài thêm** |
| Trình duyệt | Chrome, Firefox, Safari, Edge |

---

## 📋 Changelog

### v1.1.0
- 🌐 **Hỗ trợ song ngữ đầy đủ** — Tiếng Việt và Tiếng Anh, chuyển đổi trực tiếp từ editor; lời chào, phản ứng sensor, cảnh báo, tooltip thiết bị và toàn bộ giao diện đều chuyển ngay lập tức
- 💜 **27 nhân vật** — thêm 20 nhân vật mới: Neptune Sailor, Neptune Santa, Vert Classic, Tia, HK416 (Normal & Destroy), UMP45, M4A1, SOPMOD-II, WA2000 Destroy, G36, NTW-20, K2, PKP, RFB, Lewis, DSR-50, Gelina, Len Space — mỗi nhân vật có pool câu thoại riêng và lời chào song ngữ
- 🔄 **Điều hướng ◀ Trước / ▶ Sau** — thay thế nút cycle đơn bằng chuyển nhân vật hai chiều
- 🔁 **Nút Reload** — tải lại iframe nhân vật tức thì không cần reload trang, kèm thông báo trạng thái đã dịch
- 🏠 **Tooltip thiết bị song ngữ** — mô tả hover cho tất cả 17 domain entity đã được dịch đầy đủ
- 🌐 **Key cấu hình `lang`** — đặt ngôn ngữ giao diện qua YAML bên cạnh nút chuyển trong editor

### v1.0.0
- 💜 **7 nhân vật anime** — Neptune, Vert, Koharu, Shizuku, Noire, Uni, Blanc — đổi qua nút 🔄, nhớ qua localStorage
- 📌 **Chế độ Mini / Ghim** — nhân vật thu gọn thành widget nổi góc màn hình, hiển thị liên tục trên mọi Lovelace view
- 💬 **Bong bóng thoại thông minh** — nhận biết thời gian, sensor-driven, tự chuyển mỗi 5 giây
- 🌡️ **Phản ứng sensor trực tiếp** — nhiệt độ, độ ẩm, điều kiện thời tiết, mỗi cái đều có câu thoại riêng
- 🚨 **Hệ thống cảnh báo thời gian thực** — chuyển động, cửa, khói với phản ứng tức thì
- 🔊 **4 TTS engine** — Web Speech, Google Translate, HA Service (tts.speak + legacy), hoặc None
- 🔧 **Toolbar thiết bị** — tối đa 12 entity, icon tự nhận theo domain
- 🎛️ **Visual Config Editor** — accordion section, không cần YAML
- 🌐 **Tên chủ nhân + tên tự xưng tuỳ chỉnh** — cá nhân hóa mọi câu thoại

---

## 📄 License

MIT — tự do sử dụng, chỉnh sửa, phân phối.
Nếu LiveDesk khiến dashboard của bạn thêm sống động, hãy ⭐ **star repo** để ủng hộ nhé!

---

## 🙏 Credits

Thiết kế và phát triển bởi **[@doanlong1412](https://github.com/doanlong1412)** từ 🇻🇳 Việt Nam.

Live2D models được host qua [jsdelivr CDN](https://www.jsdelivr.com/) — credit thuộc về các tác giả model gốc.  
Live2D rendering sử dụng [live2d-widget](https://github.com/stevenjoezhang/live2d-widget).
