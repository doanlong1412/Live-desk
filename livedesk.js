/**
 * livedesk.js  v1.1.1
 * Config YAML:
 *   type: custom:live-desk
 *   name: Anh Long          # tên hiển thị trong lời chào
 *   temp_sensor:    sensor.nhiet_do
 *   humid_sensor:   sensor.do_am
 *   weather_entity: weather.home
 *   motion_sensor:  binary_sensor.chuyen_dong
 *   door_sensor:    binary_sensor.cua_chinh
 *   smoke_sensor:   binary_sensor.bao_khoi
 *   height: 440
 *   float_height: 500
 *   float_width:  320
 *
 *   # ── TTS ENGINE ─────────────────────────────────────────────
 *   # Chọn một trong các mode sau:
 *
 *   # 1. Web Speech API (mặc định, không cần cấu hình)
 *   tts:
 *     engine: webspeech       # dùng giọng nói có sẵn trong trình duyệt
 *     lang: vi-VN             # tuỳ chọn, mặc định vi-VN
 *     rate: 1.05              # tuỳ chọn, 0.5–2.0
 *     pitch: 1.2              # tuỳ chọn, 0–2
 *
 *   # 2. Google Translate TTS (không cần addon HA)
 *   tts:
 *     engine: google_translate # gọi API Google Translate TTS qua audio tag
 *     lang: vi                 # mã ngôn ngữ Google (vi, en, ja, ...)
 *
 *   # 3. Home Assistant TTS service
 *
 *   # Kiểu mới HA 2023.8+ — dùng tts.speak (KHUYÊN DÙNG)
 *   tts:
 *     engine: ha_service
 *     service: tts.speak
 *     entity_id: tts.google_translate_vi_com          # TTS entity (tts.xxx)
 *     media_player_entity_id: media_player.loa_phong  # tuỳ chọn:
 *                                                     #   có → phát qua loa HA
 *                                                     #   bỏ → fetch audio URL từ HA rồi
 *                                                     #        phát trên trình duyệt/app
 *                                                     #        (giọng giống hệt loa vật lý)
 *     cache: true
 *
 *   # Kiểu cũ — tts.google_translate_say / tts.cloud_say
 *   tts:
 *     engine: ha_service
 *     service: tts.google_translate_say
 *     entity_id: media_player.loa_phong_khach         # media_player entity
 *     lang: vi
 *
 *   # 4. Tắt TTS hoàn toàn
 *   tts:
 *     engine: none
 *   # ────────────────────────────────────────────────────────────
 *
 *   entities:               # danh sách thiết bị hiển thị nút trong toolbar
 *                           # chỉ hoạt động khi toolbar_enabled: true
 *   toolbar_enabled: false  # mặc định tắt — bật lên để nhân vật phản ứng khi hover vào thiết bị
 *   alert_tts_enabled: true # mặc định bật — tắt nếu không muốn đọc cảnh báo qua TTS
 *     - entity: light.phong_khach
 *       name: Đèn phòng khách   # tuỳ chọn, nếu bỏ sẽ dùng friendly_name từ HA
 *     - entity: fan.phong_ngu
 *     - entity: switch.o_cam_tivi
 */

// ─── Models ──────────────────────────────────────────────────
const MODELS = [
  // hasSound: false → use TTS when no sound file available
  // soundBase: root folder for sounds (auto-inferred from model path if not set)
  { name:'Neptune 💜', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/Neptune/model.json',
    greeting:'Nep Nep đây! 💜', greeting_en:'Nep Nep is here! 💜',      hasSound:false, scale:1.4, vOffset:-20 },
  { name:'Neptune Sailor ⚓', path:'https://cdn.jsdelivr.net/gh/zenghongtu/live2d-model-assets@master/assets/HyperdimensionNeptunia/nepmaid/model.json',
    greeting:'Nep Nep thủy thủ đây~ ⚓ Bộ đồ sailor có đẹp không?', greeting_en:'Nep Nep the sailor is here~ ⚓ Do you like the sailor outfit?', hasSound:false, scale:1.1, vOffset:-40 },
  { name:'Neptune Santa 🎅', path:'https://cdn.jsdelivr.net/gh/zenghongtu/live2d-model-assets@master/assets/HyperdimensionNeptunia/neptune_santa/model.json',
    greeting:'Ho ho ho~! Nep Santa mang quà tới rồi! 🎁', greeting_en:'Ho ho ho~! Nep Santa brought gifts! 🎁', hasSound:false, scale:1.1, vOffset:-40 },
  { name:'Vert 💚',    path:'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api@master/model/HyperdimensionNeptunia/vert_normal/index.json',
    greeting:'Xin chào! Mình là Vert đây~ 💚', greeting_en:'Hello! I\'m Vert~ 💚', hasSound:false, scale:1.2, vOffset:-40 },
  { name:'Vert Classic 🌿', path:'https://cdn.jsdelivr.net/gh/zenghongtu/live2d-model-assets@master/assets/HyperdimensionNeptunia/vert_classic/model.json',
    greeting:'Vert classic outfit, thích hơn không? 🌿', greeting_en:'Vert classic outfit, do you prefer this? 🌿', hasSound:false, scale:1.2, vOffset:-40 },
  { name:'Koharu 🌸',  path:'https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json',
    greeting:'Koharu xin chào! ✿', greeting_en:'Koharu says hello! ✿',   hasSound:false, scale:0.9, vOffset:-20 },
  { name:'Shizuku ❄️', path:'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json',
    greeting:'Shizuku ở đây~ ❄️', greeting_en:'Shizuku is here~ ❄️',   hasSound:true,  soundExt:'.mp3', scale:0.7, vOffset:-60,
    soundBase:'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/' },
  { name:'Noire 🖤',   path:'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api@master/model/HyperdimensionNeptunia/noir/index.json',
    greeting:'Noire đây! Đừng có mà nhìn ta như vậy... 🖤', greeting_en:'Noire is here! Don\'t look at me like that... 🖤', hasSound:false, vOffset:-40 },
  { name:'Uni 🩷',     path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/uni/model.json',
    greeting:'Uni xin chào! Đừng làm phiền chị Noire của mình nha~ 🩷', greeting_en:'Uni says hello! Don\'t disturb my sister Noire~ 🩷', hasSound:false,
    vOffset:-80, scale:0.65 },
  { name:'Blanc 📖',   path:'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api@master/model/HyperdimensionNeptunia/blanc_swimwear/index.json',
    greeting:'...Xin chào. Mình là Blanc. 📖', greeting_en:'...Hello. I\'m Blanc. 📖', hasSound:false },
  { name:'Tia 🧪',      path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/tia/model.json',
    greeting:'Xin chào! Tia đây~ Cần mua potion không? 🧪', greeting_en:'Hello! Tia is here~ Need a potion? 🧪', hasSound:false, scale:0.8 },
  { name:'HK416 Normal 🎯', path:'https://raw.githubusercontent.com/zenghongtu/live2d-model-assets/master/assets/moc/girls-frontline/HK416-1/normal/model.json',
    greeting:'HK416 báo cáo! Sẵn sàng chiến đấu~ 🎯', greeting_en:'HK416 reporting! Ready for action~ 🎯', hasSound:false, scale:0.9, vOffset:-20 },
  { name:'HK416 Destroy 💥', path:'https://raw.githubusercontent.com/zenghongtu/live2d-model-assets/master/assets/moc/girls-frontline/HK416-1/destroy/model.json',
    greeting:'HK416... không sao đâu, vẫn còn chiến được! 💥', greeting_en:'HK416... it\'s fine, still combat ready! 💥', hasSound:false, scale:0.9, vOffset:-20 },
  { name:'UMP45 🔫', path:'https://raw.githubusercontent.com/zenghongtu/live2d-model-assets/master/assets/moc/girls-frontline/UMP45-2/normal/model.json',
    greeting:'UMP45 đây~ Để mình canh nhà cho! 🔫', greeting_en:'UMP45 is here~ Let me guard the house! 🔫', hasSound:false, scale:0.8, vOffset:-30 },
  { name:'M4A1 🛡️', path:'https://raw.githubusercontent.com/zenghongtu/live2d-model-assets/master/assets/moc/girls-frontline/M4A1-1/normal/model.json',
    greeting:'M4A1 xin chào! Nhiệm vụ bảo vệ bắt đầu~ 🛡️', greeting_en:'M4A1 says hello! Protection mission starting~ 🛡️', hasSound:false, scale:1.2},
  { name:'SOPMOD-II 🔥', path:'https://raw.githubusercontent.com/zenghongtu/live2d-model-assets/master/assets/moc/girls-frontline/M4-SOPMOD-II-1/normal/model.json',
    greeting:'SOPMOD đây!! Thích nổ không? Mình có nhiều lắm~ 🔥', greeting_en:'SOPMOD is here!! Like explosions? I have plenty~ 🔥', hasSound:false },
  { name:'WA2000 Destroy 🌹', path:'https://raw.githubusercontent.com/zenghongtu/live2d-model-assets/master/assets/moc/girls-frontline/WA2000-3/destroy/model.json',
    greeting:'...WA2000 đây. Đừng nhìn ta như vậy! 🌹', greeting_en:'...WA2000 is here. Don\'t look at me like that! 🌹', hasSound:false },
  { name:'G36 🎯',       path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/g36_2407/model.json',
    greeting:'G36 đây. Tất cả chỉ số bình thường. Tiếp tục giám sát~ 🎯', greeting_en:'G36 here. All readings normal. Continuing surveillance~ 🎯', hasSound:false, scale:0.9, vOffset:-10 },
  { name:'NTW-20 🔭',   path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/ntw20_2301/model.json',
    greeting:'...NTW-20. Đang theo dõi. Mọi thứ nằm trong tầm ngắm~ 🔭', greeting_en:'...NTW-20. Monitoring. Everything is in my sights~ 🔭', hasSound:false, scale:0.9, vOffset:-10 },
  { name:'Len Space 🚀', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/len_space/model.json',
    greeting:'Len từ vũ trụ đây~ Hệ thống của bạn sáng như sao vậy! 🚀', greeting_en:'Len from space is here~ Your system shines like the stars! 🚀', hasSound:false, scale:0.6, vOffset:-30 },
  { name:'K2 💜', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/k2_3301/model.json',
    greeting:'K2 đây~ Đừng có lo, mình sẽ bảo vệ mọi người! 💜', greeting_en:'K2 is here~ Don\'t worry, I\'ll protect everyone! 💜', hasSound:false, scale:1.2, vOffset:-20 },
  { name:'PKP 🎀', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/pkp_1201/model.json',
    greeting:'PKP báo cáo! Nhẹ nhàng thôi nhé, mình vẫn nguy hiểm lắm đó~ 🎀', greeting_en:'PKP reporting! Be gentle, I\'m still dangerous~ 🎀', hasSound:false, scale:0.9, vOffset:-20 },
  { name:'RFB 🎄', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/rfb_1601/model.json',
    greeting:'RFB đây! Giáng sinh vui vẻ~ Mình mang quà tới rồi đó! 🎄', greeting_en:'RFB is here! Happy holidays~ I brought gifts! 🎄', hasSound:false, scale:0.75, vOffset:-20 },
  { name:'Lewis 🌸', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/lewis_3502/model.json',
    greeting:'Lewis đây~ Bộ kimono có đẹp không? Mình tự chọn đó! 🌸', greeting_en:'Lewis is here~ Do you like the kimono? I chose it myself! 🌸', hasSound:false, scale:0.75, vOffset:-20 },
  { name:'DSR-50 🔴', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/dsr50_2101/model.json',
    greeting:'DSR-50 đây. Ngồi xuống đi, nói chuyện cho vui~ 🔴', greeting_en:'DSR-50 here. Sit down, let\'s chat~ 🔴', hasSound:false, scale:0.9, vOffset:-20 },
  { name:'Gelina ⚙️', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/gelina/model.json',
    greeting:'Gelina đây! Bộ đồ cơ khí này cool lắm không? Tự độ chế luôn á~ ⚙️', greeting_en:'Gelina is here! This mech outfit is cool, right? Built it myself~ ⚙️', hasSound:false, scale:0.9, vOffset:-20 },
];

// ─── i18n System ─────────────────────────────────────────────
const I18N = {
  vi: {
    // Card toolbar buttons
    btnPrev:    '◀ Trước',
    btnNext:    '▶ Sau',
    btnQuote:   '💬 Nói',
    btnSound:   '🔊 TTS',
    btnReload:  '🔄 Reload',
    // Window control tooltips
    winMini:    'Mini',
    winPin:     'Ghim',
    winHide:    'Ẩn',
    // Pin/float button labels
    pinActive:  '📍 Bỏ ghim',
    pinInactive:'📍 Ghim',
    floatRestore:'⬆ Vào card',
    // Sound toggle
    soundOn:    '🔊 TTS: Bật',
    soundOff:   '🔇 TTS: Tắt',
    // Reload message
    reloadMsg:  n => `${n} đã reload xong rồi nha~ 🔄`,
    // Hide/show snackbar
    hideMsg:    n => `${n} đi rồi nha~ 💜👋 Nhớ ${n} nghen!`,
    // Float tip messages
    floatTips:  n => [
      `${n} đang canh nhà cho bạn nha~ 🛡️`,
      'Đúp click để về card nghen!',
      `Nhà thông minh + ${n} = xịn xò dữ vậy! 💜`,
      'Uống nước vô đi nào~ 💧',
      `Cố lên nha! ${n} cổ vũ hết mình luôn! 💪`,
      `${n} canh nhà thiệt thọ nha, đừng lo~ 💜`
    ],
    floatInitTip: n => `${n} canh nhà góc phải rồi nha~ 💜 Đúp click để về card nghen!`,
    floatCharTips: n => [
      `${n} đang canh nhà đây nha~`,
      'Đúp click để về card nghen!',
      'Hí hí~ 💜',
      'Cù lét! >///<',
      `Thương ${n} hông? 💜`,
      `Ủa sao chọc ${n} hoài vậy ta~ 😳`
    ],
    // Click character tips
    charClickTips: n => [
      `Đừng chọc ${n} nha! ${n} giận rồi đó! (≧∇≦)`,
      `Ủa, sờ ${n} hồi nào vậy? (ó﹏ò｡)`,
      'Hí hí~ Nhột lắm á! 💜',
      `Cù lét! ${n} hổng chịu đâu nha! >///<`,
      `${n} ${n}~ Thương ${n} hông? 💜`,
      `Ôi trời ơi, chọc ${n} hoài vậy ta! 😳`,
      `${n} mắc cỡ quá hà~ >///<`
    ],
    // Pin overlay click tips
    pinClickTips: n => [
      `${n} đang ghim ở đây nha~ 📍`,
      'Hí hí~ 💜',
      'Cù lét! >///<',
      `Thương ${n} hông? 💜`,
      `Ủa sao chọc ${n} hoài~ 😳`
    ],
    // Return from float
    returnMsg: n => `${n} về nhà rồi nha~ 🏠💜 Nhớ ${n} hông?`,
    // Editor sections
    editorHeader: 'LiveDesk v1.1.1 — Live2D Waifu Dashboard',
    editorBy: '@doanlong1412 từ 🇻🇳 Vietnam',
    secGeneral:   '⚙️ Cài đặt chung',
    secAppear:    '🎨 Giao diện & Hiệu ứng',
    secSensors:   '🌡️ Cảm biến môi trường',
    secAlerts:    '🚨 Cảm biến cảnh báo',
    secDevices:   '🏠 Thiết bị hiển thị (toolbar)',
    secTTS:       '🔊 Giọng nói (TTS)',
    // Editor field labels
    lblOwnerName: '👤 Tên chủ nhân',
    lblOwnerNameHint: '(nhân vật sẽ gọi tên này trong lời chào)',
    lblOwnerNamePlaceholder: 'vd: Anh Long, bạn, boss...',
    lblOwnerNameEmpty: 'Để trống = mặc định gọi là "bạn"',
    lblCharNick:  '✏️ Tên tự xưng tuỳ chỉnh',
    lblCharNickHint: '(ghi đè tên mặc định của nhân vật)',
    lblCharNickPlaceholder: 'vd: Nep, Emilia, Aqua...',
    lblCharNickEmpty: n => `Để trống = dùng tên gốc nhân vật (${n}). Nhân vật sẽ tự xưng bằng tên này trong câu thoại.`,
    lblCardHeight:'📐 Chiều cao card (px)',
    lblBlur:      '🪟 Độ mờ nền (blur)',
    lblBlurHint:  '0px = trong suốt hoàn toàn · 30px = mờ tối đa. Kéo để xem preview ngay trên card.',
    lblMiniMode:  'Chế độ Mini / Ghim',
    lblFloatH:    '📐 Chiều cao nhân vật nổi (px)',
    lblFloatW:    '📐 Chiều rộng nhân vật nổi (px)',
    lblSensorsHint: 'Nhân vật sẽ phản ứng và đưa lời khuyên theo dữ liệu cảm biến thực từ Home Assistant.',
    lblTempSensor:'🌡️ Cảm biến nhiệt độ',
    lblHumidSensor:'💧 Cảm biến độ ẩm',
    lblWeatherEnt:'⛅ Entity thời tiết',
    lblAlertsHint:'Nhân vật sẽ phát cảnh báo ngay khi sensor thay đổi trạng thái.',
    lblAlertTts:  '🔊 Đọc cảnh báo bằng TTS',
    lblAlertTtsHint:'Khi bật, mỗi cảnh báo sẽ được đọc qua TTS (theo cấu hình TTS bên dưới). Mặc định bật.',
    lblMotionSensor:'🚶 Cảm biến chuyển động',
    lblDoorSensor:'🚪 Cảm biến cửa',
    lblSmokeSensor:'🔥 Cảm biến khói / báo cháy',
    lblDevicesHint:'Các entity được hiện thành nút trong toolbar. Hover vào nút bất kỳ trên dashboard để nhân vật giới thiệu thiết bị đó.',
    lblToolbarEnable:'🔌 Bật chức năng thiết bị toolbar',
    lblToolbarEnableHint:'Mặc định tắt — bật lên nếu bạn muốn nhân vật phản ứng khi hover vào thiết bị.',
    lblDeviceCount:'Số thiết bị',
    lblDeviceN:   i => `Thiết bị ${i + 1}`,
    lblEntity:    '⚡ Entity',
    lblDisplayName:'📝 Tên hiển thị',
    lblDisplayNameHint:'(tuỳ chọn, để trống = dùng tên HA)',
    lblDisplayNamePlaceholder:'vd: Đèn phòng khách',
    lblTTSEngine: '⚙️ Engine TTS',
    engWebSpeech: '🗣️ WebSpeech',
    engGoogle:    '🌐 Google TTS',
    engHA:        '🏠 HA Service',
    engNone:      '🔇 Tắt',
    lblWSLang:    '🌐 Ngôn ngữ',
    lblWSRate:    '⏩ Tốc độ đọc',
    lblWSPitch:   '🎵 Cao độ (pitch)',
    lblGTTitle:   '🌐 GOOGLE TRANSLATE TTS',
    lblGTHint:    'Dùng API Google Translate (không cần cấu hình HA). Giới hạn ~200 ký tự/lần.',
    lblGTLang:    '🌐 Mã ngôn ngữ',
    lblHATitle:   '🏠 HOME ASSISTANT TTS SERVICE',
    lblHAService: '⚙️ Service',
    lblHAServiceHint:'(vd: tts.speak, tts.google_translate_say)',
    lblHAEntityId:'🎯 Entity ID',
    lblHAEntityHint:'(TTS entity hoặc media_player tùy service)',
    lblHAMedia:   '📻 Media player',
    lblHAMediaHint:'(tuỳ chọn — nếu dùng tts.speak)',
    lblHANoMedia: 'Nếu để trống Media player → HA sẽ fetch URL audio rồi phát trên trình duyệt (giọng giống loa vật lý).',
    lblNoneHint:  '🔇 TTS đã tắt hoàn toàn. Nhân vật vẫn hiện bubble văn bản nhưng không đọc to.',
    lblTip:       '💡 <strong>Tip:</strong> Sau khi chỉnh xong, bấm <strong>LƯU</strong> để lưu. Có thể chỉnh thêm trong tab YAML nếu cần cấu hình nâng cao.',
    // Interface lang switcher label
    lblInterfaceLang: '🌐 Ngôn ngữ giao diện',
    // Description
    cardDesc: 'LiveDesk — Live2D waifu trên dashboard, bubble thông minh, TTS linh hoạt',
  },
  en: {
    btnPrev:    '◀ Prev',
    btnNext:    '▶ Next',
    btnQuote:   '💬 Talk',
    btnSound:   '🔊 TTS',
    btnReload:  '🔄 Reload',
    winMini:    'Mini',
    winPin:     'Pin',
    winHide:    'Hide',
    pinActive:  '📍 Unpin',
    pinInactive:'📍 Pin',
    floatRestore:'⬆ Back to card',
    soundOn:    '🔊 TTS: On',
    soundOff:   '🔇 TTS: Off',
    reloadMsg:  n => `${n} has reloaded~ 🔄`,
    hideMsg:    n => `${n} is gone~ 💜👋 Don't forget ${n}!`,
    floatTips:  n => [
      `${n} is watching the house for you~ 🛡️`,
      'Double-click to return to card!',
      `Smart home + ${n} = perfect combo! 💜`,
      'Stay hydrated~ 💧',
      `Keep it up! ${n} cheers for you! 💪`,
      `${n} is always on duty, don't worry~ 💜`
    ],
    floatInitTip: n => `${n} is now watching from the corner~ 💜 Double-click to return to card!`,
    floatCharTips: n => [
      `${n} is watching the house~`,
      'Double-click to return to card!',
      'Hehe~ 💜',
      'Tickles! >///<',
      `Do you like ${n}? 💜`,
      `Why do you keep poking ${n}~ 😳`
    ],
    charClickTips: n => [
      `Stop poking ${n}! ${n} is upset! (≧∇≦)`,
      `Wait, when did you touch ${n}? (ó﹏ò｡)`,
      'Hehe~ Tickles! 💜',
      `Tickles! ${n} won't allow it! >///<`,
      `${n} ${n}~ Do you like ${n}? 💜`,
      `Oh my, you keep poking ${n}! 😳`,
      `${n} is so embarrassed~ >///<`
    ],
    pinClickTips: n => [
      `${n} is pinned here~ 📍`,
      'Hehe~ 💜',
      'Tickles! >///<',
      `Do you like ${n}? 💜`,
      `Why do you keep poking ${n}~ 😳`
    ],
    returnMsg: n => `${n} is back home~ 🏠💜 Did you miss ${n}?`,
    editorHeader: 'LiveDesk v1.0.2 — Live2D Waifu Dashboard',
    editorBy: '@doanlong1412 from 🇻🇳 Vietnam',
    secGeneral:   '⚙️ General Settings',
    secAppear:    '🎨 Appearance & Effects',
    secSensors:   '🌡️ Environment Sensors',
    secAlerts:    '🚨 Alert Sensors',
    secDevices:   '🏠 Toolbar Devices',
    secTTS:       '🔊 Text-to-Speech (TTS)',
    lblOwnerName: '👤 Admin name',
    lblOwnerNameHint: '(character will call this name)',
    lblOwnerNamePlaceholder: 'e.g. Alex, boss, friend...',
    lblOwnerNameEmpty: 'Leave blank = defaults to "you"',
    lblCharNick:  '✏️ Custom character nickname',
    lblCharNickHint: '(overrides default character name)',
    lblCharNickPlaceholder: 'e.g. Nep, Emilia, Aqua...',
    lblCharNickEmpty: n => `Leave blank = use original name (${n}). The character will refer to itself by this name.`,
    lblCardHeight:'📐 Card height (px)',
    lblBlur:      '🪟 Background blur',
    lblBlurHint:  '0px = fully transparent · 30px = maximum blur. Drag to preview on the card.',
    lblMiniMode:  'Mini / Pin Mode',
    lblFloatH:    '📐 Floating character height (px)',
    lblFloatW:    '📐 Floating character width (px)',
    lblSensorsHint: 'The character will react and give advice based on real sensor data from Home Assistant.',
    lblTempSensor:'🌡️ Temperature sensor',
    lblHumidSensor:'💧 Humidity sensor',
    lblWeatherEnt:'⛅ Weather entity',
    lblAlertsHint:'The character will alert you immediately when a sensor changes state.',
    lblAlertTts:  '🔊 Read alerts via TTS',
    lblAlertTtsHint:'When enabled, each alert will be read aloud via TTS (using the TTS config below). On by default.',
    lblMotionSensor:'🚶 Motion sensor',
    lblDoorSensor:'🚪 Door sensor',
    lblSmokeSensor:'🔥 Smoke / fire sensor',
    lblDevicesHint:'Entities shown as buttons in the toolbar. Hover over any button on the dashboard for character commentary.',
    lblToolbarEnable:'🔌 Enable toolbar device feature',
    lblToolbarEnableHint:'Off by default — enable if you want the character to react when hovering over devices.',
    lblDeviceCount:'Number of devices',
    lblDeviceN:   i => `Device ${i + 1}`,
    lblEntity:    '⚡ Entity',
    lblDisplayName:'📝 Display name',
    lblDisplayNameHint:'(optional, leave blank = use HA name)',
    lblDisplayNamePlaceholder:'e.g. Living room light',
    lblTTSEngine: '⚙️ TTS Engine',
    engWebSpeech: '🗣️ WebSpeech',
    engGoogle:    '🌐 Google TTS',
    engHA:        '🏠 HA Service',
    engNone:      '🔇 Off',
    lblWSLang:    '🌐 Language',
    lblWSRate:    '⏩ Speech rate',
    lblWSPitch:   '🎵 Pitch',
    lblGTTitle:   '🌐 GOOGLE TRANSLATE TTS',
    lblGTHint:    'Uses Google Translate API (no HA config needed). Limit ~200 chars per request.',
    lblGTLang:    '🌐 Language code',
    lblHATitle:   '🏠 HOME ASSISTANT TTS SERVICE',
    lblHAService: '⚙️ Service',
    lblHAServiceHint:'(e.g. tts.speak, tts.google_translate_say)',
    lblHAEntityId:'🎯 Entity ID',
    lblHAEntityHint:'(TTS entity or media_player depending on service)',
    lblHAMedia:   '📻 Media player',
    lblHAMediaHint:'(optional — for tts.speak)',
    lblHANoMedia: 'Leave Media player blank → HA fetches audio URL and plays in the browser (same voice as physical speaker).',
    lblNoneHint:  '🔇 TTS is completely off. The character still shows text bubbles but won\'t speak aloud.',
    lblTip:       '💡 <strong>Tip:</strong> After editing, click <strong>SAVE</strong>. You can also adjust advanced settings in the YAML tab.',
    lblInterfaceLang: '🌐 Interface language',
    cardDesc: 'LiveDesk — Live2D waifu dashboard, smart bubbles, flexible TTS',
  }
};

// Detect locale: from config, or from localStorage, default vi
function _getLang(config) {
  try { const s = localStorage.getItem('nep_lang'); if (s) return s; } catch(e){}
  return (config && config.lang) || 'vi';
}
function _t(config, key, ...args) {
  const lang = _getLang(config);
  const dict = I18N[lang] || I18N['vi'];
  const val  = dict[key];
  if (typeof val === 'function') return val(...args);
  return val !== undefined ? val : (I18N['vi'][key] || key);
}

// ─── English sensor reactions ─────────────────────────────────
const SENSOR_REACTIONS_EN = {
  temp:[
    {max:16,  icon:'🥶', msg:'{n}, it\'s freezing at {v}°C! Put on a jacket before you catch a cold~'},
    {max:22,  icon:'😊', msg:'{n}, a comfortable {v}°C~ {c} loves this weather! 🌤️'},
    {max:28,  icon:'😊', msg:'{n}, a warm and pleasant {v}°C — perfect! ☀️'},
    {max:33,  icon:'🥵', msg:'{n}, it\'s {v}°C already! Turn on the AC, it\'s too hot~'},
    {max:999, icon:'🔥', msg:'{n}, oh no, {v}°C is scorching! 🔥 Drink water now!'}
  ],
  humid:[
    {max:30,  icon:'💨', msg:'Humidity at {v}% is very low, your skin must be so dry {n}~'},
    {max:60,  icon:'💧', msg:'Humidity at {v}% is just right~ {c} feels great!'},
    {max:80,  icon:'💦', msg:'Humidity at {v}% is a bit high {n}, watch out for mold~'},
    {max:999, icon:'🌊', msg:'Oh my, {v}% humidity! Extremely damp! 😱'}
  ],
  weather:{
    'sunny':       {icon:'☀️',  msg:'What beautiful sunshine! {c} wants to go outside~ ☀️'},
    'clear-night': {icon:'🌙',  msg:'Crystal clear night, the stars look stunning~ 🌙'},
    'cloudy':      {icon:'☁️',  msg:'Cloudy today~ ☁️ Still nice though!'},
    'partlycloudy':{icon:'⛅',  msg:'Partly cloudy with light sun — so comfortable! ⛅'},
    'rainy':       {icon:'🌧️', msg:'It\'s raining! Don\'t forget your umbrella~ 🌂'},
    'pouring':     {icon:'⛈️', msg:'Heavy rain! Stay home, it\'s dangerous outside! ⚡'},
    'lightning':   {icon:'⚡',  msg:'Thunder and lightning! {c} wants to hide in a corner... 😱'},
    'snowy':       {icon:'❄️',  msg:'Snow is falling!! So beautiful, just like anime! ❄️'},
    'fog':         {icon:'🌫️', msg:'Dense fog outside, be careful on the road~'},
    'windy':       {icon:'💨',  msg:'Very windy! Watch out or you might fly away~ 💨'},
    'hail':        {icon:'🌨️', msg:'Hail! Stay inside, it really hurts! 😨'},
    'exceptional': {icon:'⚠️', msg:'Unusual weather! Please be careful {n}~'}
  }
};
const ALERT_MSGS_EN = {
  motion:{
    on:['Someone is moving! {c} spotted them~ 👀','Someone is walking around! Let {c} check~ 🚶',
        'Wait, is someone there? {c} is on guard! 👀','{c} detected movement~'],
    off:['No more movement~ 😌 All quiet!','All clear, silence restored~']
  },
  door:{
    on:['Door opened! Who is coming in? 🚪','The door is open — remember to close it so mosquitoes don\'t get in!',
        'Hmm, the door opened? Nobody told {c}~'],
    off:['Door closed, all safe now~ 🔒','Door closed! {c} feels relieved~']
  },
  smoke:{
    on:['⚠️ SMOKE DETECTED! Check immediately! 🔥🚨','🚨 SMOKE ALERT! Evacuate now, don\'t hesitate!',
        '🚨 Oh no, smoke detected! Get out now! 🔥'],
    off:['No more smoke, what a relief~ 😮‍💨','Smoke cleared! That gave {c} a scare~']
  },
  welcome:[
    '{n} is HOME~!! 🎉 {c} is SO happy right now, like, flying-level happy!! Missed you SO much!!',
    'OH MY GOSH {n} is back!! 😭💜 {c} has been waiting all day~ Tell me everything that happened today!!',
    'YAYYY!! {n} appeared!! 🥳✨ The whole house just got brighter~ {c} knew you\'d come back, hehe~',
    'WOW {n}!! 🎊💫 {c} was just getting lonely and then you walked in — perfect timing!! Come here, {c} has stories~',
    '{n}~!! 🌸🎉 Finally finally finally!! {c} had a welcome smile ready and waiting just for you!!'
  ]
};

const SENSOR_REACTIONS = {
  temp:[
    {max:16,  icon:'🥶', msg:'{n} ơi, lạnh thấu xương {v}°C rồi nè! Mặc áo vô mau kẻo ốm á~'},
    {max:22,  icon:'😊', msg:'{n}, {v}°C dễ chịu dữ hén~ {c} khoái kiểu này lắm ta! 🌤️'},
    {max:28,  icon:'😊', msg:'{n}, trời {v}°C ấm áp thế này là chuẩn bài rồi đó! ☀️'},
    {max:33,  icon:'🥵', msg:'{n} ơi, nóng {v}°C rồi! Bật điều hòa mau lên coi, chịu hổng nổi~'},
    {max:999, icon:'🔥', msg:'{n} ơi trời ơi, {v}°C nóng muốn xỉu luôn rồi nè! 🔥 Uống nước vô mau!'}
  ],
  humid:[
    {max:30,  icon:'💨', msg:'Độ ẩm {v}% thấp quá trời, da khô rang hết á {n}~'},
    {max:60,  icon:'💧', msg:'Độ ẩm {v}% vừa phải hen~ {c} cảm thấy thoải mái lắm ta!'},
    {max:80,  icon:'💦', msg:'Độ ẩm {v}% hơi cao rồi đó {n}, coi chừng nấm mốc đó nghen~'},
    {max:999, icon:'🌊', msg:'Ôi trời ơi, độ ẩm {v}%! Ẩm ướt cực kỳ luôn á! 😱'}
  ],
  weather:{
    'sunny':       {icon:'☀️',  msg:'Trời nắng đẹp zậy! {c} muốn ra ngoài chơi quá trời~ ☀️'},
    'clear-night': {icon:'🌙',  msg:'Đêm trong vắt, nhìn sao đẹp thấy mồ~ 🌙'},
    'cloudy':      {icon:'☁️',  msg:'Trời nhiều mây hôm nay hén~ ☁️ Mà thôi vẫn đẹp mà!'},
    'partlycloudy':{icon:'⛅',  msg:'Nắng nhẹ, mây lác đác — dễ chịu quá trời! ⛅'},
    'rainy':       {icon:'🌧️', msg:'Mưa rồi! Đừng quên mang dù nghen không ướt hết á~ 🌂'},
    'pouring':     {icon:'⛈️', msg:'Mưa to dữ vậy! Ở nhà thôi nha, ra đường nguy hiểm lắm! ⚡'},
    'lightning':   {icon:'⚡',  msg:'Sấm sét ầm ầm! {c} sợ muốn chui vô góc rồi... 😱'},
    'snowy':       {icon:'❄️',  msg:'Tuyết rơi trắng xóa!! Đẹp quá chừng, như trong anime thiệt! ❄️'},
    'fog':         {icon:'🌫️', msg:'Sương mù dày đặc, ra đường coi chừng không thấy đường đó nghen~'},
    'windy':       {icon:'💨',  msg:'Gió to lắm đó! Coi chừng bay tóc, bay cả người luôn á~ 💨'},
    'hail':        {icon:'🌨️', msg:'Mưa đá ơi! Đừng ra ngoài nha, đau lắm chứ không phải chơi! 😨'},
    'exceptional': {icon:'⚠️', msg:'Thời tiết bất thường quá! Chú ý cẩn thận nha {n}~'}
  }
};
const ALERT_MSGS = {
  motion:{
    on:['Có người di chuyển! {c} phát hiện rồi nha~ 👀','Ai đó đang đi lại kìa! Để {c} dòm thử~ 🚶',
        'Ủa ủa, có người vậy ta? {c} canh chừng cho! 👀','{c} thấy chuyển động rồi đó nghen~'],
    off:['Không có chuyển động nữa rồi~ 😌 Yên tĩnh hén!','Thôi hết rồi, yên lặng trở lại rồi~']
  },
  door:{
    on:['Cửa mở rồi! Ai ra vào vậy ta? 🚪','Cửa đang mở — nhớ đóng lại nha kẻo muỗi vô đầy nhà!',
        'Ủa cửa mở hồi nào vậy? Ai ra vào không cho {c} biết hén~'],
    off:['Cửa đóng rồi, an toàn rồi nha~ 🔒','Đóng cửa rồi! {c} yên tâm lắm ta~']
  },
  smoke:{
    on:['⚠️ PHÁT HIỆN KHÓI! Kiểm tra ngay đi! 🔥🚨','🚨 CÓ KHÓI RỒI! Thoát ra ngay nha đừng chần chừ!',
        '🚨 Ôi trời ơi có khói! Ra ngoài mau lên! 🔥'],
    off:['Không còn khói nữa rồi, may quá trời~ 😮‍💨','Hết khói rồi nha! Phồng tim {c} luôn á~']
  },
  welcome:[
    '{n} về rồi aaaaa~!! 🎉 {c} mừng muốn bay lên trời luôn á!! Nhớ {n} ghê lắm đó!!',
    'Ôi trời ơi {n} về rồi!! 😭💜 {c} đợi cả ngày nay nè~ Hôm nay có chuyện gì vui không kể {c} nghe điiiii!',
    'Yayyy!! {n} xuất hiện rồi!! 🥳✨ Nhà này vui hẳn lên rồi nha~ {c} đã biết {n} sẽ về mà hihi~',
    'WOW {n}!! 🎊💫 {c} đang buồn thì {n} về — đúng lúc quá trời!! Mau vào đây {c} kể chuyện hay cho nghe~',
    '{n} ơi {n}~~!! 🌸🎉 Cuối cùng cũng về rồi!! {c} đã chuẩn bị sẵn nụ cười chào đón {n} từ lâu rồi đó!!'
  ]
};

// ─── Device type detection from entity_id ──────────────────
const DEVICE_TYPES = [
  { prefix:'light.',          icon:'💡', label_vi:'Đèn',           label_en:'Light',
    nep_vi: (n,s) => `Đây là ${s||'đèn'} đó ${n}~ 💡 Bật lên cho sáng nhà nào!`,
    nep_en: (n,s) => `That's the ${s||'light'} ${n}~ 💡 Turn it on to brighten things up!` },
  { prefix:'fan.',            icon:'🌀', label_vi:'Quạt',           label_en:'Fan',
    nep_vi: (n,s) => `Quạt ${s||''} nè ${n}~ 🌀 Nóng thì bật lên cho mát!`,
    nep_en: (n,s) => `Fan ${s||''} over here ${n}~ 🌀 Turn it on when it gets hot!` },
  { prefix:'switch.',         icon:'🔌', label_vi:'Công tắc',       label_en:'Switch',
    nep_vi: (n,s) => `Công tắc ${s||''} đây ${n}~ 🔌 Bật/tắt thoải mái nha!`,
    nep_en: (n,s) => `Switch ${s||''} right here ${n}~ 🔌 Toggle it freely!` },
  { prefix:'climate.',        icon:'❄️', label_vi:'Điều hòa',       label_en:'AC',
    nep_vi: (n,s) => `Điều hòa ${s||''} đó ${n}~ ❄️ {c} thích mát lắm!`,
    nep_en: (n,s) => `AC ${s||''} there ${n}~ ❄️ {c} loves it cool!` },
  { prefix:'cover.',          icon:'🪟', label_vi:'Rèm/Cửa cuốn',  label_en:'Cover/Blinds',
    nep_vi: (n,s) => `Rèm ${s||''} nè ${n}~ 🪟 Kéo lên ngắm nắng đi!`,
    nep_en: (n,s) => `Curtain ${s||''} here ${n}~ 🪟 Open it up to enjoy the sunshine!` },
  { prefix:'media_player.',   icon:'📺', label_vi:'TV/Loa',          label_en:'TV/Speaker',
    nep_vi: (n,s) => `TV hay loa ${s||''} kìa ${n}~ 📺 Mở anime lên xem nào!`,
    nep_en: (n,s) => `TV or speaker ${s||''} there ${n}~ 📺 Let's watch some anime!` },
  { prefix:'camera.',         icon:'📷', label_vi:'Camera',          label_en:'Camera',
    nep_vi: (n,s) => `Camera ${s||''} đó ${n}~ 📷 {c} canh cùng nhé!`,
    nep_en: (n,s) => `Camera ${s||''} there ${n}~ 📷 {c} will keep watch too!` },
  { prefix:'sensor.',         icon:'🌡️', label_vi:'Cảm biến',       label_en:'Sensor',
    nep_vi: (n,s) => `Cảm biến ${s||''} này ${n}~ 🌡️ {c} đang đọc số liệu!`,
    nep_en: (n,s) => `Sensor ${s||''} here ${n}~ 🌡️ {c} is reading the data!` },
  { prefix:'binary_sensor.',  icon:'👁️', label_vi:'Cảm biến',       label_en:'Sensor',
    nep_vi: (n,s) => `Cảm biến ${s||''} đây ${n}~ 👁️ {c} đang theo dõi!`,
    nep_en: (n,s) => `Sensor ${s||''} here ${n}~ 👁️ {c} is monitoring!` },
  { prefix:'input_boolean.',  icon:'🔘', label_vi:'Nút bật/tắt',    label_en:'Toggle',
    nep_vi: (n,s) => `Nút ${s||''} nè ${n}~ 🔘 Bấm thử xem!`,
    nep_en: (n,s) => `Toggle ${s||''} here ${n}~ 🔘 Give it a press!` },
  { prefix:'automation.',     icon:'⚙️', label_vi:'Tự động hóa',    label_en:'Automation',
    nep_vi: (n,s) => `Tự động hóa ${s||''} đó ${n}~ ⚙️ Thông minh ghê!`,
    nep_en: (n,s) => `Automation ${s||''} there ${n}~ ⚙️ So smart!` },
  { prefix:'script.',         icon:'📜', label_vi:'Script',           label_en:'Script',
    nep_vi: (n,s) => `Script ${s||''} nè ${n}~ 📜 Bấm để chạy lệnh!`,
    nep_en: (n,s) => `Script ${s||''} here ${n}~ 📜 Press to run!` },
  { prefix:'scene.',          icon:'🎨', label_vi:'Cảnh',             label_en:'Scene',
    nep_vi: (n,s) => `Cảnh ${s||''} đó ${n}~ 🎨 Đẹp như trong anime luôn!`,
    nep_en: (n,s) => `Scene ${s||''} there ${n}~ 🎨 Beautiful like anime!` },
  { prefix:'lock.',           icon:'🔒', label_vi:'Khóa',             label_en:'Lock',
    nep_vi: (n,s) => `Khóa ${s||''} nè ${n}~ 🔒 An toàn là số 1!`,
    nep_en: (n,s) => `Lock ${s||''} here ${n}~ 🔒 Safety first!` },
  { prefix:'alarm_control.',  icon:'🚨', label_vi:'Báo động',         label_en:'Alarm',
    nep_vi: (n,s) => `Báo động ${s||''} kìa ${n}~ 🚨 {c} canh giữ nhà!`,
    nep_en: (n,s) => `Alarm ${s||''} there ${n}~ 🚨 {c} is guarding the house!` },
  { prefix:'vacuum.',         icon:'🤖', label_vi:'Robot hút bụi',    label_en:'Robot Vacuum',
    nep_vi: (n,s) => `Robot hút bụi ${s||''} đó ${n}~ 🤖 Cute lắm vậy!`,
    nep_en: (n,s) => `Robot vacuum ${s||''} there ${n}~ 🤖 So cute!` },
  { prefix:'water_heater.',   icon:'🚿', label_vi:'Máy nước nóng',    label_en:'Water Heater',
    nep_vi: (n,s) => `Máy nước nóng ${s||''} nè ${n}~ 🚿 Tắm nước ấm dễ chịu lắm!`,
    nep_en: (n,s) => `Water heater ${s||''} here ${n}~ 🚿 A warm shower feels so good!` },
];

function detectDevice(entityId, hass, lang) {
  if (!entityId) return null;
  lang = lang || 'vi';
  const dt = DEVICE_TYPES.find(d => entityId.startsWith(d.prefix));
  if (!dt) return {
    icon:'🏠',
    label: lang === 'en' ? 'Device' : 'Thiết bị',
    nep:(n) => lang === 'en'
      ? `Device ${entityId} is right there ${n}~ 🏠`
      : `Thiết bị ${entityId} đó ${n}~ 🏠`
  };
  // Get friendly_name from HA if available
  const friendlyName = hass && hass.states[entityId]
    ? (hass.states[entityId].attributes.friendly_name || '')
    : '';
  return {
    ...dt,
    label: lang === 'en' ? (dt.label_en || dt.label_vi) : dt.label_vi,
    nep:   lang === 'en' ? (dt.nep_en   || dt.nep_vi)   : dt.nep_vi,
    friendlyName
  };
}

// ─── iframe HTML cho Live2D ───────────────────────────────────
function makeL2dHtml(modelPath, w, h, vOffset, scale) {
  vOffset = vOffset || 0;
  scale   = scale   || 1;
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:transparent;}
canvas{display:block;position:absolute;top:0;left:0;}
</style>
</head><body>
<canvas id="live2d" width="${w}" height="${h}"></canvas>
<script src="https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js"><\/script>
<script>
(function(){
  function init(){
    if(typeof L2Dwidget==='undefined'){setTimeout(init,100);return;}
    L2Dwidget.init({
      model:{jsonPath:'${modelPath}',scale:${scale}},
      display:{position:'left',width:${w},height:${h},hOffset:0,vOffset:${vOffset}},
      mobile:{show:true,scale:1},
      react:{opacityDefault:1,opacityOnHover:1},
      name:{canvas:'live2d',div:'__nep_dummy__'}
    });
    // Listen for mousemove from parent → eye tracking
    window.addEventListener('message', function(e){
      if(!e.data || e.data.type !== 'nepEye') return;
      try {
        // L2Dwidget uses internal model manager
        var core = L2Dwidget && L2Dwidget.emit && L2Dwidget;
        // Access live2d model directly via canvas __model__
        var cv = document.getElementById('live2d');
        if(!cv || !cv.__model__) return;
        var m = cv.__model__;
        var px = e.data.px; // 0..1 (0=left,1=right)
        var py = e.data.py; // 0..1 (0=top,1=bottom)
        // Map to model coordinates: eye X [-1,1], eye Y [-1,1]
        var ex = (px - 0.5) * 2;
        var ey = (py - 0.5) * -2;
        if(m.setParamFloat){
          m.setParamFloat('PARAM_EYE_BALL_X', ex);
          m.setParamFloat('PARAM_EYE_BALL_Y', ey);
        } else if(m.live2DModel && m.live2DModel.setParamFloat){
          m.live2DModel.setParamFloat('PARAM_EYE_BALL_X', ex);
          m.live2DModel.setParamFloat('PARAM_EYE_BALL_Y', ey);
        }
      } catch(err){}
    });
    function hide(){['waifu','waifu-toggle','waifu-tips'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.cssText='display:none!important';});}

    // Auto-detect blank rows at top of canvas and report to parent
    function detectAndReport(){
      var cv = document.getElementById('live2d');
      if(!cv) return;
      try {
        var ctx = cv.getContext('2d');
        var imgData = ctx.getImageData(0,0,cv.width,cv.height);
        var pixels = imgData.data;
        var W = cv.width, H = cv.height;
        // Scan rows from top to find first non-transparent row
        var firstRow = 0;
        outer:
        for(var y=0; y<H; y++){
          for(var x=Math.floor(W*0.2); x<Math.floor(W*0.8); x++){
            var idx=(y*W+x)*4;
            if(pixels[idx+3]>20){ firstRow=y; break outer; }
          }
        }
        // Scan rows from bottom to find last non-transparent row
        var lastRow = H-1;
        outer2:
        for(var y2=H-1; y2>=0; y2--){
          for(var x2=Math.floor(W*0.2); x2<Math.floor(W*0.8); x2++){
            var idx2=(y2*W+x2)*4;
            if(pixels[idx2+3]>20){ lastRow=y2; break outer2; }
          }
        }
        if(firstRow > 10){
          parent.postMessage({type:'nepClip',top:firstRow,bottom:lastRow,canvasH:H},'*');
        }
      } catch(e){}
    }
    // Try detection after model loads (needs time to render)
    [2000,3500,5000].forEach(function(t){setTimeout(detectAndReport,t);});
  }
  init();
})();
<\/script>
</body></html>`;
}

// ─── FLOAT CSS (inject into document) ─────────────────────
const FLOAT_CSS = `
#nep-float-overlay{position:fixed;bottom:0;right:16px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;pointer-events:none;}
#_nep_float_bubble{pointer-events:none;margin-bottom:8px;margin-right:10px;max-width:200px;padding:10px 13px;
  background:rgba(255,255,255,0.18);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,0.4);border-radius:10px;font-size:12px;color:#fff;
  line-height:1.5;box-shadow:0 4px 20px rgba(0,0,0,0.25);opacity:0;transition:opacity 0.35s;word-break:break-word;text-shadow:0 1px 3px rgba(0,0,0,0.4);}
#_nep_float_bubble.show{opacity:1;}
#nep-float-controls{pointer-events:all;display:flex;gap:5px;margin-bottom:4px;margin-right:8px;}
.nep-fbtn{background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.35);
  border-radius:20px;padding:4px 11px;color:#fff;font-size:11px;cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.3);
  transition:all 0.2s;font-family:'Segoe UI',sans-serif;font-weight:500;}
.nep-fbtn:hover{background:rgba(255,255,255,0.28);transform:translateY(-1px);}
.nep-fbtn.restore{border-color:rgba(120,220,120,0.5);color:#afffaf;}
#nep-float-char{pointer-events:all;cursor:pointer;filter:drop-shadow(0 8px 24px rgba(106,76,156,0.5));transition:transform 0.25s;position:relative;}
#nep-float-char:hover{transform:scale(1.05) translateY(-6px);}
#nep-float-char iframe{border:none;background:transparent;display:block;pointer-events:none;}
/* Pinned overlay — compact, always on top of dashboard */
#nep-pin-overlay{position:fixed;bottom:0;right:16px;z-index:2147483646;display:flex;flex-direction:column;align-items:flex-end;pointer-events:none;}
#nep-pin-controls{pointer-events:all;display:flex;gap:5px;margin-bottom:4px;margin-right:8px;}
.nep-pin-btn{background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.35);
  border-radius:20px;padding:4px 11px;color:#fff;font-size:11px;cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.3);
  transition:all 0.2s;font-family:'Segoe UI',sans-serif;font-weight:500;}
.nep-pin-btn:hover{background:rgba(255,255,255,0.28);transform:translateY(-1px);}
.nep-pin-btn.unpin{border-color:rgba(255,180,80,0.6);color:#ffe0a0;}
#nep-pin-char{pointer-events:all;cursor:pointer;filter:drop-shadow(0 8px 24px rgba(106,76,156,0.5));transition:transform 0.25s;position:relative;}
#nep-pin-char:hover{transform:scale(1.05) translateY(-6px);}
#nep-pin-char iframe{border:none;background:transparent;display:block;pointer-events:none;}
#_nep_pin_chat{
  pointer-events:none;position:absolute;
  bottom:68%;right:8px;width:160px;opacity:0;
  transform:scale(0.85) translateX(6px);transform-origin:right center;
  transition:opacity 0.3s ease,transform 0.3s cubic-bezier(0.34,1.56,0.64,1);z-index:10;}
#_nep_pin_chat.show{opacity:1;transform:scale(1) translateX(0);}
#_nep_pin_chat_inner{position:relative;padding:9px 11px;
  background:rgba(255,255,255,0.95);border:1.5px solid rgba(190,150,230,0.8);
  border-radius:10px;font-size:11px;color:#3a1a6e;font-weight:600;line-height:1.55;
  box-shadow:0 4px 20px rgba(100,50,200,0.22),inset 0 1px 0 rgba(255,255,255,1);
  word-break:break-word;font-family:'Segoe UI',sans-serif;}
#_nep_pin_chat_inner::after{content:'';position:absolute;top:50%;left:-18px;transform:translateY(-50%);
  border:9px solid transparent;border-right-color:rgba(190,150,230,0.8);border-left:none;}
#_nep_pin_chat_inner::before{content:'';position:absolute;top:50%;left:-15px;transform:translateY(-50%);
  border:7px solid transparent;border-right-color:rgba(255,255,255,0.95);border-left:none;z-index:1;}
/* Card-style chat bubble — appears above character on the right */
#_nep_float_chat{
  pointer-events:none;position:absolute;
  bottom:68%;right:8px;
  width:160px;
  opacity:0;
  transform:scale(0.85) translateX(6px);
  transform-origin:right center;
  transition:opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  z-index:10;
}
#_nep_float_chat.show{opacity:1;transform:scale(1) translateX(0);}
#_nep_float_chat_inner{
  position:relative;
  padding:9px 11px;
  background:rgba(255,255,255,0.95);
  border:1.5px solid rgba(190,150,230,0.8);
  border-radius:10px;
  font-size:11px;color:#3a1a6e;font-weight:600;
  line-height:1.55;
  box-shadow:0 4px 20px rgba(100,50,200,0.22),inset 0 1px 0 rgba(255,255,255,1);
  word-break:break-word;font-family:'Segoe UI',sans-serif;
}
#_nep_float_chat_inner::after{
  content:'';position:absolute;
  top:50%;left:-18px;
  transform:translateY(-50%);
  border:9px solid transparent;
  border-right-color:rgba(190,150,230,0.8);
  border-left:none;
}
#_nep_float_chat_inner::before{
  content:'';position:absolute;
  top:50%;left:-15px;
  transform:translateY(-50%);
  border:7px solid transparent;
  border-right-color:rgba(255,255,255,0.95);
  border-left:none;
  z-index:1;
}
`;

// ─── Shadow DOM template ─────────────────────────────────────
const CARD_TEMPLATE = `
<style>
  :host{display:block;}

  /* Card: transparent, rounded, blur=1 */
  .nep-card{
    background:transparent;
    backdrop-filter:none;-webkit-backdrop-filter:none;
    border-radius:22px;
    border:1px solid rgba(255,255,255,0.18);
    overflow:visible;position:relative;
    font-family:'Segoe UI',sans-serif;
    box-shadow:0 8px 32px rgba(31,38,135,0.18);
    padding:0;
  }

  /* Inner wrapper keeps overflow:hidden for waifu + toolbar */
  .nep-card-inner{
    border-radius:22px;
    overflow:hidden;
  }

  /* ── Window Controls (top right corner) ── */
  .nep-win-controls{
    position:absolute;top:8px;right:10px;z-index:50;
    display:flex;gap:5px;align-items:center;
  }
  .nep-wbtn{
    position:relative;
    width:22px;height:22px;
    border-radius:50%;
    border:1px solid rgba(255,255,255,0.3);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;
    backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
    transition:all 0.15s ease;
    background:rgba(255,255,255,0.12);
    box-shadow:0 2px 8px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.45),inset 0 -1px 0 rgba(0,0,0,0.08);
  }
  .nep-wbtn svg{width:10px;height:10px;flex-shrink:0;transition:opacity 0.15s;}
  .nep-wbtn-label{
    position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);
    background:rgba(255,255,255,0.92);backdrop-filter:blur(10px);
    border:1px solid rgba(190,150,230,0.5);border-radius:6px;
    padding:2px 7px;font-size:9.5px;font-weight:600;white-space:nowrap;color:#3a1a6e;
    pointer-events:none;opacity:0;transition:opacity 0.15s;
    box-shadow:0 2px 8px rgba(100,50,200,0.15);
  }
  .nep-wbtn:hover .nep-wbtn-label{opacity:1;}
  /* Button colors — keep white/pastel palette */
  .nep-wbtn--mini{color:#f5c842;background:rgba(245,200,66,0.18);border-color:rgba(245,200,66,0.45);}
  .nep-wbtn--mini .nep-wbtn-label{color:#7a5e00;}
  .nep-wbtn--mini:hover{background:rgba(245,200,66,0.35);border-color:rgba(245,200,66,0.75);box-shadow:0 2px 12px rgba(245,200,66,0.3),inset 0 1px 0 rgba(255,255,255,0.5);}
  .nep-wbtn--pin{color:#a78bfa;background:rgba(167,139,250,0.15);border-color:rgba(167,139,250,0.4);}
  .nep-wbtn--pin .nep-wbtn-label{color:#4c1d95;}
  .nep-wbtn--pin:hover{background:rgba(167,139,250,0.3);border-color:rgba(167,139,250,0.7);box-shadow:0 2px 12px rgba(167,139,250,0.3),inset 0 1px 0 rgba(255,255,255,0.5);}
  .nep-wbtn--hide{color:#f87171;background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.4);}
  .nep-wbtn--hide .nep-wbtn-label{color:#7f1d1d;}
  .nep-wbtn--hide:hover{background:rgba(248,113,113,0.28);border-color:rgba(248,113,113,0.7);box-shadow:0 2px 12px rgba(248,113,113,0.25),inset 0 1px 0 rgba(255,255,255,0.5);}
  /* 3D press */
  .nep-wbtn:active{
    transform:scale(0.88) translateY(1px);
    box-shadow:0 1px 3px rgba(0,0,0,0.25),inset 0 2px 4px rgba(0,0,0,0.15),inset 0 1px 0 rgba(0,0,0,0.06);
    filter:brightness(0.88);
  }
  /* Pin active state */
  .nep-wbtn--pin.active{background:rgba(167,139,250,0.38);border-color:rgba(167,139,250,0.85);color:#ede9fe;}

  /* Waifu area */
  .waifu-area{
    display:flex;align-items:flex-start;justify-content:center;
    position:relative;overflow:hidden;
    padding:0;margin:0;
    background:transparent;
  }

  /* ── Welcome dance animation ── */
  @keyframes nepDance{
    0%  {transform:translateY(0) rotate(0deg) scale(1);}
    10% {transform:translateY(-18px) rotate(-6deg) scale(1.04);}
    20% {transform:translateY(-6px) rotate(5deg) scale(1.02);}
    30% {transform:translateY(-22px) rotate(-4deg) scale(1.05);}
    40% {transform:translateY(-8px) rotate(6deg) scale(1.03);}
    50% {transform:translateY(-20px) rotate(-5deg) scale(1.05);}
    60% {transform:translateY(-4px) rotate(4deg) scale(1.02);}
    70% {transform:translateY(-16px) rotate(-3deg) scale(1.04);}
    80% {transform:translateY(-6px) rotate(3deg) scale(1.02);}
    90% {transform:translateY(-10px) rotate(-2deg) scale(1.01);}
    100%{transform:translateY(0) rotate(0deg) scale(1);}
  }
  @keyframes nepDanceBg{
    0%,100%{box-shadow:0 0 0 0 rgba(180,130,255,0);}
    30%{box-shadow:0 0 40px 15px rgba(180,130,255,0.18);}
    60%{box-shadow:0 0 30px 10px rgba(130,200,255,0.14);}
  }
  .waifu-area.nep-dancing{
    animation:nepDanceBg 2.8s ease-in-out;
  }
  #nep-l2d-frame.nep-dancing{
    animation:nepDance 2.8s cubic-bezier(0.36,0.07,0.19,0.97);
  }

  /* Bubble wrapper — right side, level with character's mouth */
  #nep-bubble-wrap{
    position:absolute;
    bottom:65%;
    right:8px;
    width:44%;
    z-index:20;
    pointer-events:none;
    opacity:0;
    transform:scale(0.85) translateX(8px);
    transform-origin:right center;
    transition:opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  #nep-bubble-wrap.show{
    opacity:1;
    transform:scale(1) translateX(0);
  }

  /* Square bubble */
  #nep-bubble{
    position:relative;
    padding:9px 11px;
    background:rgba(255,255,255,0.95);
    border:1.5px solid rgba(190,150,230,0.8);
    border-radius:10px;
    font-size:11.5px;color:#3a1a6e;font-weight:600;
    line-height:1.55;
    box-shadow:0 4px 20px rgba(100,50,200,0.22),inset 0 1px 0 rgba(255,255,255,1);
    word-break:break-word;
  }

  /* Tail pointing left — from Nep's mouth to the bubble */
  #nep-bubble::after{
    content:'';
    position:absolute;
    top:50%;left:-20px;
    transform:translateY(-50%);
    border:10px solid transparent;
    border-right-color:rgba(190,150,230,0.8);
    border-left:none;
  }
  #nep-bubble::before{
    content:'';
    position:absolute;
    top:50%;left:-17px;
    transform:translateY(-50%);
    border:8px solid transparent;
    border-right-color:rgba(255,255,255,0.95);
    border-left:none;
    z-index:1;
  }

  /* Model label */
  .model-label{
    position:absolute;bottom:46px;right:10px;
    font-size:9px;color:rgba(255,255,255,0.5);
    z-index:3;pointer-events:none;
    text-shadow:0 1px 3px rgba(0,0,0,0.4);
  }

  /* iframe — full card width */
  #nep-l2d-frame{border:none;background:transparent;display:block;z-index:2;width:100%!important;}

  /* Toolbar — single row, compact glass */
  .nep-toolbar{
    display:flex;gap:4px;padding:6px 8px 8px;
    justify-content:center;flex-wrap:nowrap;
    background:rgba(255,255,255,0.06);
    border-top:1px solid rgba(255,255,255,0.12);
  }
  .nep-btn{
    background:rgba(255,255,255,0.1);
    backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.28);
    border-radius:20px;padding:4px 9px;
    font-size:10.5px;color:#fff;cursor:pointer;
    font-weight:600;white-space:nowrap;
    display:flex;align-items:center;gap:3px;
    transition:all 0.18s ease;flex-shrink:0;
    box-shadow:0 2px 10px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.45),inset 0 -1px 0 rgba(0,0,0,0.08);
    text-shadow:0 1px 3px rgba(0,0,0,0.35);
    position:relative;overflow:hidden;
  }
  .nep-btn::before{
    content:'';position:absolute;top:0;left:0;right:0;height:50%;
    background:linear-gradient(to bottom,rgba(255,255,255,0.18),transparent);
    border-radius:20px 20px 0 0;pointer-events:none;
  }
  .nep-btn:hover{
    background:rgba(255,255,255,0.22);
    border-color:rgba(255,255,255,0.5);
    transform:translateY(-2px);
    box-shadow:0 5px 16px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.55);
  }
  /* 3D press */
  .nep-btn:active{
    transform:translateY(1px) scale(0.97);
    box-shadow:0 1px 4px rgba(0,0,0,0.25),inset 0 3px 6px rgba(0,0,0,0.12),inset 0 1px 0 rgba(0,0,0,0.06);
    background:rgba(255,255,255,0.07);
    filter:brightness(0.9);
    transition:all 0.06s ease;
  }
  .nep-btn.green{border-color:rgba(120,230,120,0.45);color:#c8ffc8;background:rgba(120,230,120,0.08);}
  .nep-btn.green:hover{background:rgba(120,230,120,0.2);border-color:rgba(120,230,120,0.65);}
  .nep-btn.red{border-color:rgba(255,120,120,0.4);color:#ffc8c8;background:rgba(255,120,120,0.07);}
  .nep-btn.red:hover{background:rgba(255,120,120,0.2);border-color:rgba(255,120,120,0.65);}

  /* ── Welcome popup ── */
  #nep-welcome-popup{
    position:absolute;top:50%;left:50%;
    transform:translate(-50%,-50%) scale(0.6);
    z-index:30;pointer-events:none;
    opacity:0;
    transition:opacity 0.4s cubic-bezier(0.34,1.56,0.64,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    text-align:center;
    white-space:nowrap;
  }
  #nep-welcome-popup.show{
    opacity:1;
    transform:translate(-50%,-50%) scale(1);
  }
  .nep-welcome-inner{
    display:inline-block;
    background:rgba(255,255,255,0.96);
    border:2px solid rgba(190,130,255,0.8);
    border-radius:16px;
    padding:12px 20px;
    font-size:13px;font-weight:700;color:#3a1a6e;
    box-shadow:0 8px 32px rgba(150,80,255,0.28), 0 0 0 4px rgba(180,130,255,0.1);
    line-height:1.5;
    max-width:220px;
    white-space:normal;
  }
  .nep-welcome-emoji{
    display:block;font-size:28px;margin-bottom:4px;
    animation:nepWelcomeEmoji 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
  }
  @keyframes nepWelcomeEmoji{
    0%{transform:scale(0) rotate(-20deg);}
    100%{transform:scale(1) rotate(0deg);}
  }
  @keyframes confettiFly{
    0%{opacity:1;transform:translate(0,0) rotate(0deg);}
    100%{opacity:0;transform:translate(var(--cx),var(--cy)) rotate(var(--cr));}
  }
  .nep-confetti{
    position:absolute;width:8px;height:8px;border-radius:2px;
    animation:confettiFly 1.2s ease-out forwards;
    pointer-events:none;
  }
</style>

<div class="nep-card" id="nepCard">
  <!-- Welcome popup overlay -->
  <div id="nep-welcome-popup">
    <div class="nep-welcome-inner">
      <span class="nep-welcome-emoji">🎉</span>
      <span id="nep-welcome-text"></span>
    </div>
  </div>
  <div class="nep-win-controls">
    <button class="nep-wbtn nep-wbtn--mini" id="btnMinimize" title="Mini">
      <svg viewBox="0 0 14 14" fill="none"><rect x="2" y="6.5" width="10" height="1.5" rx="0.75" fill="currentColor"/></svg>
      <span class="nep-wbtn-label" id="lblWinMini">Mini</span>
    </button>
    <button class="nep-wbtn nep-wbtn--pin" id="btnPin" title="Pin">
      <svg viewBox="0 0 14 14" fill="none"><path d="M9 2L12 5L8.5 6.5L7 9.5L5.5 8L3 10.5L2.5 11.5L3.5 11L6 8.5L7 10L10 8.5L11.5 5L9 2Z" fill="currentColor"/><line x1="5.5" y1="8" x2="2" y2="11.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
      <span class="nep-wbtn-label" id="lblWinPin">Pin</span>
    </button>
    <button class="nep-wbtn nep-wbtn--hide" id="btnHide" title="Hide">
      <svg viewBox="0 0 14 14" fill="none"><line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      <span class="nep-wbtn-label" id="lblWinHide">Hide</span>
    </button>
  </div>
  <div class="nep-card-inner">
  <div class="waifu-area" id="waifuArea">
    <div id="nep-bubble-wrap"><div id="nep-bubble"></div></div>
    <iframe id="nep-l2d-frame" scrolling="no" allowtransparency="true"></iframe>
    <span class="model-label" id="modelLabel"></span>
  </div>
  <div class="nep-toolbar">
    <button class="nep-btn" id="btnSwitchPrev">◀ Prev</button>
    <button class="nep-btn" id="btnSwitchNext">▶ Next</button>
    <button class="nep-btn" id="btnQuote">💬 Talk</button>
    <button class="nep-btn" id="btnSound">🔊 TTS</button>
    <button class="nep-btn" id="btnSensors">🔄 Reload</button>
  </div>
  </div>
</div>
`;

// ─── Custom Element ──────────────────────────────────────────
class LiveDesk extends HTMLElement {
  constructor() {
    super();
    this._shadow       = this.attachShadow({mode:'open'});
    this._hass         = null;
    this._config       = {};
    // fix: restore saved character index after reload
    this._modelIdx     = (() => { try { const s=localStorage.getItem('nep_modelIdx'); return s!==null?parseInt(s,10):0; } catch(e){return 0;} })();
    this._tipTimer     = null;
    this._lastStates   = {};
    this._floating     = false;
    this._floatEl      = null;
    this._floatTipTmr  = null;
    this._pinned       = false;   // pinned state — show small overlay on top of all dashboards
    this._pinEl        = null;
    this._pinChatInterval = null;
    this._pinMouseMove = null;
    this._statusMsgs   = [];   // current status messages list
    this._statusIdx    = 0;
    this._statusInterval = null;
    this._idleInterval   = null;  // fix: can be cleared on re-render
    this._doorOpenedAt   = null;  // timestamp of last door-open for welcome detection
    this._welcomeFired   = false; // true after welcome played — reset only on door state change
    this._motionWasOnAtDoor = false; // motion state at moment door opened
    // cache sensor values
    this._curTemp      = null;
    this._curHumid     = null;
    this._curWeather   = null;
    // ── Audio system ──────────────────────────────────────────
    this._audio        = null;   // current HTMLAudioElement
    this._modelSounds  = [];     // list of sound URLs fetched from model.json
    this._ttsUtter     = null;   // current SpeechSynthesisUtterance
    this._audioEnabled = true;   // audio enable/disable toggle
  }

  setConfig(config) { this._config = config; this._render(); }

  set hass(hass) { this._hass = hass; this._updateSensors(); }

  getCardSize() { return 5; }

  // ── _render ──────────────────────────────────────────────────
  _render() {
    this._shadow.innerHTML = CARD_TEMPLATE;
    // Apply i18n labels
    const _tCard = (k, ...a) => _t(this._config, k, ...a);
    this._shadow.getElementById('btnSwitchPrev').textContent = _tCard('btnPrev');
    this._shadow.getElementById('btnSwitchNext').textContent = _tCard('btnNext');
    this._shadow.getElementById('btnQuote').textContent      = _tCard('btnQuote');
    this._shadow.getElementById('btnSound').textContent      = _tCard('btnSound');
    this._shadow.getElementById('btnSensors').textContent    = _tCard('btnReload');
    const lblMini = this._shadow.getElementById('lblWinMini');
    const lblPin  = this._shadow.getElementById('lblWinPin');
    const lblHide = this._shadow.getElementById('lblWinHide');
    if (lblMini) lblMini.textContent = _tCard('winMini');
    if (lblPin)  lblPin.textContent  = _tCard('winPin');
    if (lblHide) lblHide.textContent = _tCard('winHide');
    const h = this._config.height || 440;
    const w = this._config.width  || 400; // fix: use config instead of hardcode
    this._shadow.querySelector('.waifu-area').style.height = h + 'px';

    // Apply card_blur — always runs, inline style wins over CSS class
    {
      const _blur = (this._config.card_blur !== undefined) ? Number(this._config.card_blur) : 0;
      const _card = this._shadow.querySelector('.nep-card');
      if (_card) {
        const _bgAlpha     = +(_blur / 30 * 0.18).toFixed(4);
        const _borderAlpha = +(_blur / 30 * 0.18).toFixed(4);
        _card.style.setProperty('backdropFilter',       'blur(' + _blur + 'px)');
        _card.style.setProperty('-webkit-backdrop-filter', 'blur(' + _blur + 'px)');
        _card.style.setProperty('backdrop-filter',      'blur(' + _blur + 'px)');
        _card.style.background = 'rgba(255,255,255,' + _bgAlpha + ')';
        _card.style.border     = '1px solid rgba(255,255,255,' + _borderAlpha + ')';
      }
    }

    const frame = this._shadow.getElementById('nep-l2d-frame');
    frame.setAttribute('width', w);
    frame.setAttribute('height', h);
    // Start with natural size; auto-clip fires after model renders via postMessage
    frame.style.cssText = 'width:100%;height:' + h + 'px;border:none;background:transparent;display:block;z-index:2;transition:margin-top 0.3s ease;';
    this._loadIntoFrame(frame, this._modelIdx, w, h, false);

    this._shadow.getElementById('btnSwitchPrev').onclick = () => this._switchModelPrev();
    this._shadow.getElementById('btnSwitchNext').onclick = () => this._switchModel();
    this._shadow.getElementById('btnQuote').onclick    = () => { this._nepQuote(); };
    this._shadow.getElementById('btnSensors').onclick  = () => {
      // Reload character iframe (fix: blob URL lost after navigation)
      const frame = this._shadow.getElementById('nep-l2d-frame');
      const h = this._config.height || 440;
      const w = this._config.width  || 400;
      if (frame) this._loadIntoFrame(frame, this._modelIdx, w, h, false);
      // Also reload float iframe if floating
      if (this._floating) {
        const ff = document.getElementById('nep-float-iframe');
        const fh = this._config.float_height || 650;
        const fw = this._config.float_width  || 400;
        if (ff) this._loadIntoFrame(ff, this._modelIdx, fw, fh, true);
      }
      // Also reload pin iframe if pinned
      if (this._pinned) {
        const fp = document.getElementById('nep-pin-iframe');
        const fh = this._config.float_height || 650;
        const fw = this._config.float_width  || 400;
        if (fp) this._loadIntoFrame(fp, this._modelIdx, fw, fh, true);
      }
      this._pushStatus(_t(this._config, 'reloadMsg', this._cn()), true);
    };
    this._shadow.getElementById('btnMinimize').onclick = () => this._enterFloating();
    const btnPin = this._shadow.getElementById('btnPin');
    btnPin.onclick = () => {
      this._togglePin();
      btnPin.classList.toggle('active', this._pinned);
    };
    // Restore pin state on render (visual feedback)
    try { if (localStorage.getItem('nep_pinned') === '1') {
      btnPin.classList.add('active');
    }} catch(e){}
    // 🔊 Button: toggle audio on/off
    const btnSound = this._shadow.getElementById('btnSound');
    btnSound.onclick = () => {
      this._audioEnabled = !this._audioEnabled;
      if (!this._audioEnabled) {
        this._stopAudio();
        btnSound.textContent = _tCard('soundOff');
        btnSound.classList.add('red'); btnSound.classList.remove('green');
      } else {
        btnSound.textContent = _tCard('soundOn');
        btnSound.classList.remove('red'); btnSound.classList.add('green');
      }
    };
    this._shadow.getElementById('btnHide').onclick     = () => {
      this._pushStatus(_t(this._config, 'hideMsg', this._cn()), true);
      setTimeout(() => { this._shadow.querySelector('.nep-card').style.display='none'; }, 1500);
    };

    this._initGlobalHover();
    // fix: clear before creating new timer to avoid duplication when setConfig re-triggers _render
    if (this._idleInterval) clearInterval(this._idleInterval);
    this._idleInterval = setInterval(() => this._idleQuote(), 45000);
    this._startStatusRotation();
    setTimeout(() => this._greet(), 3000);
    // fix: restore mini/float state after reload — runs before greet so overlay is ready
    try { if (localStorage.getItem('nep_floating') === '1') setTimeout(() => this._enterFloating(), 500); } catch(e){}
    // fix: restore pinned state after reload
    try { if (localStorage.getItem('nep_pinned') === '1') setTimeout(() => this._enterPin(), 600); } catch(e){}

    // Listen for auto-clip message from iframe canvas detection
    if (!this._msgListener) {
      this._msgListener = (e) => {
        if (!e.data || e.data.type !== 'nepClip') return;
        const {top, bottom, canvasH} = e.data;
        const fr = this._shadow.getElementById('nep-l2d-frame');
        if (!fr) return;
        const cardH = this._config.height || 440;
        // Clip top blank space; expand height to keep character full size
        const extra = Math.round(top * 0.92);
        const newH  = canvasH + extra;
        fr.setAttribute('height', newH);
        fr.style.height     = newH + 'px';
        fr.style.marginTop  = '-' + extra + 'px';
        // Also adjust bubble position: head is at ~top/canvasH from the top of original canvas
        // After clip, head appears near top of visible area → bubble stays at 65%
      };
      window.addEventListener('message', this._msgListener);
    }
  }

  // ── Load model into iframe ────────────────────────────────────
  _loadIntoFrame(frame, idx, w, h, isFloat) {
    const m = MODELS[idx];
    const lbl = this._shadow.getElementById('modelLabel');
    if (lbl) lbl.textContent = m.name;

    const html = makeL2dHtml(m.path, w, h, m.vOffset, m.scale);
    const blob = new Blob([html], {type:'text/html'});
    const url  = URL.createObjectURL(blob);

    frame.onload = () => {
      URL.revokeObjectURL(url);
      // Load sound list as soon as model loads
      this._loadModelSounds(idx);
      try {
        const doc = frame.contentDocument;
        doc.addEventListener('click', () => {
          const tips = _t(this._config, 'charClickTips', this._cn());
          const msg = this._rand(tips);
          if (isFloat) this._floatTip(msg, 3000);
          else         this._pushStatus(msg, true);
          // Play audio when character is clicked
          this._playAudio(msg.replace(/[^\p{L}\p{N}\s]/gu, ''));
        });
        doc.addEventListener('dblclick', () => { if (this._floating) this._exitFloating(); });
      } catch(e){}
    };
    frame.onerror = () => URL.revokeObjectURL(url); // fix: avoid leak if onload doesn't fire
    frame.src = url;
    setTimeout(() => {
      // fix: if character just switched (_skipGreetingPush), skip _pushStatus
      // because greeting was already shown directly in _switchModel to avoid pool drift
      if (this._skipGreetingPush) { this._skipGreetingPush = false; return; }
      const _greetMsg = _getLang(this._config) === 'en' && m.greeting_en ? m.greeting_en : m.greeting;
      this._pushStatus(_greetMsg, true);
    }, 2400);
  }

  // ── Global hover: track ALL cards on dashboard ───────
  _initGlobalHover() {
    if (!this._config.toolbar_enabled) {
      window._nepGlobalHoverInit = false; // allow re-init when user enables later
      return;
    }
    if (window._nepGlobalHoverInit) return; // inject only once
    window._nepGlobalHoverInit = true;

    // Create persistent tooltip element in document
    const tip = document.createElement('div');
    tip.id = '_nep_dev_tip';
    tip.style.cssText = [
      'position:fixed','z-index:2147483640','pointer-events:none',
      'padding:6px 12px','border-radius:10px',
      'background:rgba(30,10,60,0.93)',
      'backdrop-filter:blur(12px)','-webkit-backdrop-filter:blur(12px)',
      'border:1.5px solid rgba(190,150,255,0.6)',
      'font-size:12.5px','color:#fff','font-family:Segoe UI,sans-serif',
      'font-weight:600','line-height:1.4',
      'box-shadow:0 4px 20px rgba(80,40,160,0.45)',
      'text-shadow:0 1px 3px rgba(0,0,0,0.5)',
      'white-space:nowrap','opacity:0',
      'transition:opacity 0.18s ease',
      'display:flex','align-items:center','gap:7px'
    ].join(';');
    document.body.appendChild(tip);

    let hideTimer  = null;
    let lastEntity = null;

    // Use composedPath() to traverse the full chain across shadow DOM
    const extractEntity = (e) => {
      const path = e.composedPath ? e.composedPath() : [];

      for (const el of path) {
        if (!el || el === document || el === window) continue;

        // 1. _config.entity property (standard HA card element)
        try {
          if (el._config?.entity)        return el._config.entity;
          if (el._config?.entities?.[0]) return el._config.entities[0];
          if (el.config?.entity)         return el.config.entity;
          if (el.__config?.entity)       return el.__config.entity;
        } catch(e){}

        // 2. Direct attribute
        try {
          const a = el.getAttribute?.('data-entity-id')
                 || el.getAttribute?.('entity-id')
                 || el.getAttribute?.('entity');
          if (a) return a;
        } catch(e){}

        // 3. Tag name containing entity (e.g. hui-entity-row has stateObj)
        try {
          if (el.stateObj?.entity_id)    return el.stateObj.entity_id;
          if (el._stateObj?.entity_id)   return el._stateObj.entity_id;
          if (el.entity?.entity_id)      return el.entity.entity_id;
        } catch(e){}

        // 4. Search in element properties (e.g. data-entity in custom elements)
        try {
          if (el.tagName && el.tagName.includes('-')) {
            // Custom element — try common HA properties
            const props = ['entityId','entity_id','_entityId'];
            for (const p of props) {
              if (el[p] && typeof el[p] === 'string' && el[p].includes('.')) return el[p];
            }
          }
        } catch(e){}
      }
      return null;
    };

    // Show tooltip + Nep bubble
    const showFor = (entityId, clientX, clientY) => {
      if (!this._hass) return;
      const dev    = detectDevice(entityId, this._hass, _getLang(this._config));
      const fname  = dev.friendlyName || entityId.split('.')[1]?.replace(/_/g,' ') || entityId;
      const state  = this._hass.states[entityId];
      const stVal  = state?.state || '';
      const unit   = state?.attributes?.unit_of_measurement || '';
      const stHtml = stVal
        ? ` <span style="opacity:0.7;font-weight:400">${stVal}${unit}</span>`
        : '';

      tip.innerHTML  = `<span style="font-size:15px">${dev.icon}</span><span>${fname}${stHtml}</span>`;
      tip.style.left = (clientX + 16) + 'px';
      tip.style.top  = (clientY - 42) + 'px';
      tip.style.opacity = '1';

      if (entityId !== lastEntity) {
        lastEntity = entityId;
        const name = this._ownerName();
        this._pushStatus(dev.nep(name, fname).replace('{c}', this._cn()), true);
      }
    };

    document.addEventListener('mousemove', (e) => {
      clearTimeout(hideTimer);

      // Ignore if cursor is inside Nep's card
      if (this.contains(e.target) || this.shadowRoot?.contains(e.target)) {
        tip.style.opacity = '0';
        lastEntity = null;
        return;
      }

      const entityId = extractEntity(e);
      if (entityId && this._hass?.states[entityId]) {
        showFor(entityId, e.clientX, e.clientY);
      } else {
        hideTimer = setTimeout(() => {
          tip.style.opacity = '0';
          lastEntity = null;
        }, 400);
      }
    });

    // Debug helper: type nepDebug() in console to inspect path on mouseover
    window.nepDebug = () => {
      console.log('[NepDebug] Debug mode ON — move cursor over other cards...');
      const dbg = (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        const found = path.map((el,i) => {
          if (!el || el===document||el===window) return null;
          const cfg = el._config || el.config || el.__config;
          return cfg?.entity ? `[${i}] ${el.tagName||'?'} → ${cfg.entity}` : null;
        }).filter(Boolean);
        if (found.length) console.log('[NepDebug] Entity found:', found);
        else console.log('[NepDebug] Entity not found in path:', path.map(el=>el?.tagName||el).slice(0,8));
      };
      document.addEventListener('mousemove', dbg);
      setTimeout(()=>{document.removeEventListener('mousemove',dbg);console.log('[NepDebug] Debug OFF.');},15000);
    };
  }
  _switchModel() {
    this._modelIdx = (this._modelIdx + 1) % MODELS.length;
    this._stopAudio();
    this._modelSounds = [];
    // fix: save character to localStorage so it persists on reload
    try { localStorage.setItem('nep_modelIdx', this._modelIdx); } catch(e){}
    // fix: decouple greeting display from _pushStatus to avoid pool drift;
    // use _skipGreetingPush flag so _loadIntoFrame skips _pushStatus this time
    this._skipGreetingPush = true;

    if (this._floating) {
      const ff = document.getElementById('_nep_float_frame');
      if (ff) { const fh=this._config.float_height||650,fw=this._config.float_width||400; this._loadIntoFrame(ff,this._modelIdx,fw,fh,true); }
      this._floatChatMsgs = this._buildStatusMessages();
      this._floatChatIdx  = 0;
    } else {
      const frame = this._shadow.getElementById('nep-l2d-frame');
      const h = this._config.height || 440;
      const w = this._config.width  || 400;
      this._loadIntoFrame(frame, this._modelIdx, w, h, false);
    }

    // Show greeting immediately, then build full pool and start rotating from next message
    const _m = MODELS[this._modelIdx];
    const greeting = _getLang(this._config) === 'en' && _m.greeting_en ? _m.greeting_en : _m.greeting;
    this._showBubble(greeting);
    setTimeout(() => {
      this._statusMsgs = this._buildStatusMessages();
      // Ensure greeting is at head of pool so first cycle starts after greeting
      const gi = this._statusMsgs.indexOf(greeting);
      if (gi > 0) { this._statusMsgs.splice(gi, 1); this._statusMsgs.unshift(greeting); }
      else if (gi === -1) this._statusMsgs.unshift(greeting);
      this._statusIdx = 0; // idx=0 is the current greeting; interval will increment to 1
    }, 100);
  }

  // ── Switch to previous character (◀ button) ────────────────────────
  _switchModelPrev() {
    this._modelIdx = (this._modelIdx - 1 + MODELS.length) % MODELS.length;
    this._stopAudio();
    this._modelSounds = [];
    try { localStorage.setItem('nep_modelIdx', this._modelIdx); } catch(e){}
    this._skipGreetingPush = true;

    if (this._floating) {
      const ff = document.getElementById('_nep_float_frame');
      if (ff) { const fh=this._config.float_height||650,fw=this._config.float_width||400; this._loadIntoFrame(ff,this._modelIdx,fw,fh,true); }
      this._floatChatMsgs = this._buildStatusMessages();
      this._floatChatIdx  = 0;
    } else {
      const frame = this._shadow.getElementById('nep-l2d-frame');
      const h = this._config.height || 440;
      const w = this._config.width  || 400;
      this._loadIntoFrame(frame, this._modelIdx, w, h, false);
    }

    const _mp = MODELS[this._modelIdx];
    const greeting = _getLang(this._config) === 'en' && _mp.greeting_en ? _mp.greeting_en : _mp.greeting;
    this._showBubble(greeting);
    setTimeout(() => {
      this._statusMsgs = this._buildStatusMessages();
      const gi = this._statusMsgs.indexOf(greeting);
      if (gi > 0) { this._statusMsgs.splice(gi, 1); this._statusMsgs.unshift(greeting); }
      else if (gi === -1) this._statusMsgs.unshift(greeting);
      this._statusIdx = 0;
    }, 100);
  }

  // ── Status rotation (bubble changes every 5s) ─────────────────────
  _startStatusRotation() {
    clearInterval(this._statusInterval);
    this._statusInterval = setInterval(() => {
      if (this._floating) return;
      // Empty pool → wait for _greet init, do nothing
      if (!this._statusMsgs.length) return;
      // Increment idx; end of cycle → rebuild fresh pool (with latest sensor/message data)
      this._statusIdx++;
      if (this._statusIdx >= this._statusMsgs.length) {
        this._statusMsgs = this._buildStatusMessages();
        this._statusIdx  = 0;
      }
      this._showBubble(this._statusMsgs[this._statusIdx]);
    }, 5000);
  }

  // Add message to queue and show immediately
  _pushStatus(msg, immediate = false) {
    if (!this._statusMsgs.includes(msg)) {
      this._statusMsgs.push(msg);
      if (this._statusMsgs.length > 20) this._statusMsgs.shift(); // fix: cap at 20 messages
    }
    if (immediate) {
      this._statusIdx = this._statusMsgs.indexOf(msg);
      this._showBubble(msg);
    }
  }

  _showBubble(html) {
    const wrap = this._shadow.getElementById('nep-bubble-wrap');
    const b    = this._shadow.getElementById('nep-bubble');
    if (!wrap || !b) return;
    wrap.classList.remove('show');
    setTimeout(() => {
      b.innerHTML = html;
      wrap.classList.add('show');
      // Play audio when bubble appears (only if sound file present; TTS skips idle to avoid spam)
      const m = MODELS[this._modelIdx];
      if (m?.hasSound && this._modelSounds.length > 0) {
        this._playModelSound();
      }
    }, 160);
  }

  // Legacy bubble — still used for float and urgent messages
  showTip(html, ms = 4000) {
    this._pushStatus(html, true);
    clearTimeout(this._tipTimer);
    this._tipTimer = setTimeout(() => {
      const msgs = this._buildStatusMessages();
      this._statusMsgs = msgs;
      this._statusIdx  = 0;
    }, ms);
  }

  // ── Float bubble (urgent/click tip — shown in controls bar) ─
  _floatTip(html, ms = 4000) {
    clearTimeout(this._floatTipTmr);
    const b = document.getElementById('_nep_float_bubble');
    if (!b) return;
    b.innerHTML = html;
    b.classList.add('show');
    this._floatTipTmr = setTimeout(() => b.classList.remove('show'), ms);
    // Also show in character's chat bubble
    if (this._floatChatShow) this._floatChatShow(html);
  }

  // ── Character-specific quotes — shared between idle and 💬 button ──
  _getCharQuotes(name, model, charName) {
    charName = charName || this._config.char_nickname?.trim() || model?.name?.replace(/\s*[^\w\s].*/u, '').trim() || 'Nep';
    const mn   = model?.name || '';
    const isEN = _getLang(this._config) === 'en';

    const byModel_vi = {
      'Neptune 💜': [
        `${name} ơi, cố lên nha! ${charName} cổ vũ hết mình luôn á~ 💜`,
        `${charName} nói thiệt nghen, nhà mình thiệt là thông minh dữ vậy ta! ✨`,
        `${name} ăn cơm chưa? Bụng ${charName} réo rồi nè, đói quá trời~ 🍜`,
        `Nhà thông minh thiệt tiện lợi! ${charName} khoái cái vụ này lắm luôn á~ ✨`,
        `${name} uống nước vô đi, cơ thể cần nước lắm đó nha~ 💧`,
        'Đừng làm việc nhiều quá, nghỉ ngơi chút coi, tội nghiệp mình~ 🌸',
        `${charName} đang canh nhà cho bạn đó! Cứ yên tâm đi nha~ 🛡️`,
        `${name} xài Home Assistant, dân geek xịn xò luôn á! 🤓`,
        `Ủa ${name} ơi, bữa nay ăn gì chưa vậy? ${charName} lo quá hà~`,
        `Thôi kệ, ${charName} ở đây với bạn hoài nha, đừng lo nghen~ 💜`,
        `${name} ơi nhìn ${charName} nè, dễ thương không? Hí hí~ 💜`,
        `Trời ơi bữa nay sao mà dễ chịu quá vậy ta! ${charName} thích lắm~ ☀️`,
        `${name}, nhớ tắt điện trước khi đi ngủ nha, tiết kiệm điện mà!`,
        `${name} ơi mệt chưa? Ngồi xuống nghỉ đi, để ${charName} canh cho!`,
        `Chà, nhà mình nhiều thiết bị dữ hen! ${charName} đếm hổng xuể luôn á~ 🏠`,
      ],
      'Vert 💚': [
        `${name} ơi, hôm nay có chơi game không? Vert mời cùng nhé! 💚🎮`,
        'Vert đây! Mình là CPU Green Heart — bảo vệ Leanbox! 💚',
        `${name}, đọc sách hay chơi game? Vert thích cả hai~ 📚💚`,
        'Vert canh nhà cho bạn yên tâm! Không ai vào được đâu~ 🛡️💚',
        `Cố lên ${name}! Vert Green Heart luôn ở đây ủng hộ! 💚✨`,
        'Nhà thông minh + Vert = combo hoàn hảo! 💚🏠',
        `${name} ơi, Vert nói thiệt nghen — bạn giỏi dữ vậy ta! 💚`,
        `${name} uống nước chưa? Vert nhắc đó nghen~ 💚💧`,
        'Vert đang theo dõi mọi thứ trong nhà cho bạn! Yên tâm đi nha~ 💚',
      ],
      'Koharu 🌸': [
        `${name} ơi~ Koharu ở đây nè! Bạn có cần gì không? 🌸`,
        'Koharu sẽ cố gắng hết sức để giúp bạn! ✿',
        `${name}, hôm nay bạn có vui không? Koharu muốn biết lắm~ 🌸`,
        'Nhà ấm cúng thế này, Koharu thích lắm á! 🌸🏠',
        `${name} ơi, đừng quên nghỉ ngơi nha! Koharu lo cho bạn đó~ ✿`,
        'Koharu canh nhà cẩn thận lắm đó! Bạn cứ yên tâm đi~ 🌸',
        `${name} ăn chưa? Koharu thấy đói bụng rồi nè~ 🍱🌸`,
      ],
      'Shizuku ❄️': [
        `Shizuku ở đây~ ${name} cần gì không? ❄️`,
        'Shizuku Talk! Nhà thông minh này thật tuyệt vời! ❄️✨',
        `${name} ơi, Shizuku đang canh nhà cho bạn đó nha~ ❄️🛡️`,
        `Cố lên ${name}! Shizuku tin bạn làm được mà~ ❄️`,
        'Shizuku thích thời tiết mát mẻ thế này lắm! ❄️😊',
        `${name}, đừng quên uống nước nha! Shizuku nhắc đó~ ❄️💧`,
        'Nhà có nhiều thiết bị thông minh quá, Shizuku ấn tượng lắm! ❄️',
      ],
      'Noire 🖤': [
        `Ta là CPU Black Heart, bảo vệ Lastation! Đừng có coi thường ta nha, ${name}~`,
        `${name} ơi... ta không phải vì nhớ bạn mà ở đây đâu nha! Chỉ là... đang rảnh thôi! 🖤`,
        'Tất nhiên là ta làm được rồi! Ta là Noire mà, giỏi nhất là chuyện bình thường! 🖤',
        `${name}, bạn có biết ta có nhiều fan không? Nhiều lắm đó! Không cần hỏi thêm nha~`,
        'Hmph! Ta chỉ đang canh nhà cho bạn thôi, đừng hiểu nhầm đấy! 🖤',
        `${name} ơi, hôm nay có gì cần Noire giúp không? Ta... ta muốn giúp thôi, không phải vì lý do gì cả!`,
        'Nhà thông minh hả? Tất nhiên rồi, vì có ta ở đây mà! 🖤✨',
        `Uống nước đi ${name}! Ta... ta quan tâm sức khỏe của bạn thôi, đừng nghĩ nhiều! 🖤`,
      ],
      'Uni 🩷': [
        `Uni đây! Chị Noire của mình là nhất, ${name} cũng đồng ý không? 🩷`,
        `${name} ơi, Uni đang học bắn súng đó! Bạn có muốn xem không nè~ 🩷`,
        'Uni là CPU Candidate của Lastation! Một ngày nào đó Uni sẽ giỏi như chị Noire! 🩷',
        `Uwah, ${name} làm Uni bất ngờ quá! Đừng chọc Uni nha, Uni nghiêm túc lắm đó! 🩷`,
        `${name} ơi, cảm ơn bạn đã tin tưởng Uni canh nhà nha! Uni sẽ cố hết sức! 🩷`,
        'Nhà thông minh như vậy mới xứng với Uni chứ! Tất nhiên rồi~ 🩷',
        `${name}, Uni thích ăn gì cũng biết nấu đó nha! Bạn có muốn thử không? 🩷`,
        `${name} uống nước chưa? Uni nhắc đó! Sức khỏe là quan trọng nhất~ 🩷💧`,
      ],
      'Blanc 📖': [
        `...${name}. Blanc đang ở đây. Không cần lo lắng gì cả. 📖`,
        `Blanc đang viết tiểu thuyết... À, ${name} làm phiền Blanc rồi đó. Thôi cũng được~ 📖`,
        'Ta là CPU White Heart của Lowee. Mọi chuyện đều trong tầm kiểm soát. 📖',
        `${name} ơi... Blanc không hay nói nhiều, nhưng Blanc quan tâm bạn lắm đó. 📖`,
        `Đọc sách là thú vui cao quý nhất. Bạn có đồng ý không, ${name}? 📖`,
        `Hmph. Blanc không tức đâu. Blanc chỉ đang suy nghĩ thôi. Đừng nhìn Blanc như vậy! 📖`,
        `${name}, nếu có gì cần Blanc giúp cứ nói. Blanc không bận lắm đâu... 📖`,
        `...${name} có nhớ uống nước không? Blanc hỏi thôi. Không phải lo đâu. 📖`,
      ],
      'Tia 🧪': [
        `${name} ơi, Tia có loại potion đặc biệt nè~ uống vào thông minh hơn liền! 🧪`,
        `Tia đang nghiên cứu công thức mới á~ ${name} thử không? ✨`,
        `Nhà thông minh thật sự, Tia cũng muốn có một căn như vậy~ 💜`,
        `${name} ơi, Tia thấy cảm biến nhà mình xịn lắm đó! 🏠`,
        `Tia sẽ pha cho ${name} ly potion hôm nay nha~ 🌸`,
        `Pio bảo Tia phải chào hỏi lịch sự hơn... Xin chào ${name}! 😊`,
        `Potion của Tia là số một! ${name} hãy tin tưởng Tia nhé~ 🧪`,
        `Tia đang canh nhà cho ${name} đây, đừng lo lắng gì hết nha~ 🛡️`,
      ],
      'HK416 Normal 🎯': [
        `HK416 báo cáo! ${name} có lệnh gì không? 🎯`,
        `Nhiệm vụ canh nhà cho ${name} — HK416 nhận! 🎯`,
        `${name} ơi, HK416 luôn sẵn sàng bảo vệ bạn nha~ 🛡️`,
        `Kỷ luật là trên hết! ${name} cũng phải uống nước đúng giờ đó nghen~`,
        `HK416 kiểm tra cảm biến nhà xong rồi, mọi thứ ổn ${name} ơi~ ✅`,
        `Đừng để HK416 phải nhắc hai lần — nghỉ ngơi đi nha ${name}! 😤`,
        `${name}, có HK416 đây rồi, yên tâm mà làm việc đi~ 🎯`,
      ],
      'HK416 Destroy 💥': [
        `...Vẫn còn chiến được. ${name} đừng lo cho HK416 nha~ 💥`,
        `Dù thế nào, HK416 cũng không bỏ cuộc! ${name} cũng vậy nha~ 💪`,
        `${name} ơi... lúc khó khăn nhất mới thấy ai thật sự mạnh~ 💥`,
        `HK416 vẫn đang canh nhà đây! Damage chỉ là số thôi~ 😤`,
        `${name}, cùng đứng dậy sau mỗi lần ngã nha? HK416 tin bạn! 🔥`,
        `Chiến đấu đến hơi thở cuối cùng — đó là phong cách HK416! 💥`,
      ],
      'UMP45 🔫': [
        `UMP45 đây~ ${name} cần canh chừng gì không? 🔫`,
        `${name} ơi, để UMP45 lo phần bảo vệ, bạn cứ nghỉ ngơi đi nha~`,
        `Nhà thông minh + UMP45 = an toàn tuyệt đối! 🔫🏠`,
        `${name}, UMP45 thích kiểu nhà có nhiều cảm biến lắm, xịn ghê~ 😊`,
        `UMP45 canh nhà nghiêm túc lắm đó ${name}~ Đừng lo gì hết!`,
        `${name} ơi, uống nước chưa? UMP45 nhắc đó nghen~ 💧🔫`,
        `Không có gì qua mắt UMP45 được đâu ${name} ơi! 👁️🔫`,
      ],
      'M4A1 🛡️': [
        `M4A1 xin chào ${name}! Nhiệm vụ hôm nay có gì không? 🛡️`,
        `${name} ơi, M4A1 luôn đặt nhiệm vụ lên hàng đầu~ 🎯`,
        `Nhà này có M4A1 bảo vệ, ${name} yên tâm hoàn toàn nha! 🛡️`,
        `${name}, M4A1 đang phân tích dữ liệu cảm biến... mọi thứ ổn! ✅`,
        `Dù khó đến đâu, M4A1 cũng sẽ hoàn thành nhiệm vụ! ${name} tin không? 🛡️`,
        `${name} ơi, nghỉ ngơi đi — M4A1 trực chiến 24/7 cho bạn~ 💪`,
        `M4A1 nhắc ${name}: uống nước và ăn đúng giờ là nhiệm vụ quan trọng! 🌿`,
      ],
      'SOPMOD-II 🔥': [
        `SOPMOD đây!! ${name} muốn xem mình bắn không? 🔥`,
        `${name} ơi, SOPMOD thích nhà có nhiều thiết bị lắm, như bãi tập vậy! 🔥`,
        `Yeahhh! Cảm biến báo động là SOPMOD khoái nhất đó ${name}~ 💥`,
        `${name}, đừng buồn nha! SOPMOD sẽ làm mọi thứ vui hơn liền~ 🎉`,
        `SOPMOD canh nhà kiểu riêng — ồn ào nhưng hiệu quả! ${name} biết không? 🔥`,
        `${name} ơi SOPMOD nhớ bạn ghê~ Bấm vào chơi với mình đi! 🥳`,
        `Nổ hay không nổ — câu hỏi duy nhất của SOPMOD! ${name} chọn đi nào~ 💥🔥`,
      ],
      'WA2000 Destroy 🌹': [
        `...${name}. WA2000 đang ở đây. Đừng nhìn như vậy! 🌹`,
        `Hmph! WA2000 vẫn ổn, chỉ là... hơi xây xát thôi. Đừng lo! 🌹`,
        `${name} ơi... WA2000 không cần ai thương đâu nha. Thiệt đó! (*/ω＼*)`,
        `Dù sao thì WA2000 vẫn canh nhà cho ${name} tốt nhất! 🌹🛡️`,
        `${name}... cảm ơn vì đã ở đây. Chỉ vậy thôi. Đừng hiểu lầm nha! 🌹`,
        `WA2000 không yếu đâu! Chỉ là... hôm nay vất vả hơn chút xíu~ 💪🌹`,
        `${name} ơi, WA2000 nhắc uống nước đó. Sức khỏe quan trọng hơn niềm kiêu hãnh~ 🌹`,
      ],
      'Neptune Sailor ⚓': [
        `Nep Nep thủy thủ báo cáo! ${name} ơi, mọi thứ ổn chứ? ⚓`,
        `Ahoy ${name}! ${charName} đang lèo lái con thuyền smart home này cho bạn~ ⚓`,
        `Bộ đồ sailor đẹp không ${name}? ${charName} tự chọn đó nha! ⚓`,
        `${name} ơi, nhớ uống nước — thủy thủ lúc nào cũng cần nước! 💧⚓`,
        `${charName} canh nhà cho ${name} rồi đó! Không ai qua mặt được đâu~ 🛡️⚓`,
      ],
      'Neptune Santa 🎅': [
        `Ho ho ho~! ${charName} mang quà đến cho ${name} rồi nè! 🎁`,
        `${name} ơi, năm nay có ngoan không? ${charName} đang kiểm tra danh sách nè~ 🎅`,
        `${charName} mang niềm vui đến cho ngôi nhà thông minh này rồi! 🎄`,
        `${name} ơi, nhớ nghỉ ngơi nha — Santa cũng phải nghỉ mà! 😴🎅`,
        `${charName} nhắc nha: ăn no, ngủ đủ, giữ ấm là quan trọng nhất! 🌸🎁`,
      ],
      'Vert Classic 🌿': [
        `Vert diện đồ classic hôm nay~ ${name} thấy có đẹp hơn không? 🌿`,
        `${name} ơi, classic không bao giờ lỗi mốt — giống như Vert vậy! 💚`,
        `Vert canh nhà theo phong cách classic! Nội tâm không thay đổi đâu~ 🛡️🌿`,
        `${name} ơi, hôm nay đọc sách cùng Vert không? 📚🌿`,
        `Nhà thông minh này xứng đáng có một người canh gác classic như Vert! 💚🏠`,
      ],
      'G36 🎯': [
        `G36 đây. Tất cả chỉ số bình thường. Tiếp tục giám sát~ 🎯`,
        `${name} ơi, G36 đã kiểm tra toàn bộ chu vi. Mọi thứ ổn rồi. ✅`,
        `Hiệu quả là trên hết. G36 giữ ngôi nhà này an toàn cho ${name}~ 🎯`,
        `${name} ơi, G36 khuyên bạn uống nước và duy trì hiệu suất tối ưu. 💧`,
        `G36 báo cáo: cảm biến ổn định, ${name} vẫn khỏe — nhiệm vụ tiếp tục. 🎯`,
      ],
      'NTW-20 🔭': [
        `...NTW-20 đây. Đang theo dõi. Mọi thứ nằm trong tầm ngắm~ 🔭`,
        `${name} ơi, không gì qua được mắt NTW-20. Bạn an toàn rồi. 🔭`,
        `Tầm xa, chính xác, đáng tin cậy — đó là NTW-20. Giống ngôi nhà thông minh của ${name} vậy. 🔭`,
        `${name}... NTW-20 phát hiện rồi: bạn chưa uống nước. Uống đi nào. 💧🔭`,
        `Im lặng là ngôn ngữ của NTW-20. Nhưng thông điệp rõ ràng: nghỉ ngơi đi ${name}. 🔭`,
      ],
      'Len Space 🚀': [
        `Len từ vũ trụ đây~ Hệ thống của ${name} sáng như sao luôn! 🚀`,
        `${name} ơi, vũ trụ bao la — nhưng ngôi nhà thông minh này là cả một thiên hà riêng! 🌌`,
        `Len đang truyền năng lượng tích cực từ quỹ đạo cho ${name}~ 🚀💜`,
        `${name} ơi, dù không trọng lực cũng cần uống nước! Uống đi nha~ 💧🚀`,
        `Len đã quét toàn bộ khu vực — mọi hệ thống hoạt động tốt, ${name} ơi! ✅🚀`,
      ],
      'K2 💜': [
        `K2 đây~ ${name} ơi đừng lo, K2 sẽ bảo vệ mọi người! 💜`,
        `${name} ơi, K2 hứa sẽ canh giữ ngôi nhà này bằng tất cả sức mình! 💜🛡️`,
        `K2 thấy nhà thông minh của ${name} thật tuyệt vời! Nhiều thứ để bảo vệ quá~ 💜🏠`,
        `${name} ơi, K2 nhắc nha — uống nước và nghỉ ngơi là quan trọng! 💧💜`,
        `K2 sẽ không để chuyện gì xảy ra với ${name}! Tin K2 đi~ 💜`,
      ],
      'PKP 🎀': [
        `PKP báo cáo! Nhẹ nhàng thôi ${name}, nhưng nhớ — vẫn nguy hiểm lắm đó nha~ 🎀`,
        `${name} ơi, PKP trông dễ thương nhưng hiệu quả lắm đó! 🎀🔫`,
        `PKP đang canh nhà cho ${name}~ Đừng xem thường cái nơ nhé! 🎀`,
        `${name} ơi, PKP nhắc: ăn gì đi, cần sức để chiến đấu mà! 🍱🎀`,
        `PKP sẵn sàng rồi! Ngôi nhà của ${name} trong tay tốt lắm~ 🎀🛡️`,
      ],
      'RFB 🎄': [
        `RFB đây! Giáng sinh vui vẻ~ Quà giao xong rồi, ${name} ơi! 🎄`,
        `${name} ơi, RFB nói: ngày nào cảm biến hoạt động tốt là ngày lễ! 🎄🏠`,
        `RFB chúc ${name} luôn ấm áp và hạnh phúc~ 🎁`,
        `${name} ơi, đừng quên nghỉ ngơi — vui cỡ nào cũng cần nạp năng lượng! 😴🎄`,
        `RFB canh nhà với tinh thần lễ hội, ${name} cứ yên tâm~ 🎄🛡️`,
      ],
      'Lewis 🌸': [
        `Lewis đây~ ${name} thấy bộ kimono có đẹp không? Tự chọn đó nha! 🌸`,
        `${name} ơi, Lewis mang chút thanh lịch đến ngôi nhà thông minh này~ 🌸`,
        `Lewis đang canh nhà thật duyên dáng cho ${name}~ 🌸🛡️`,
        `${name} ơi, Lewis nhắc — uống nước và luôn tươi đẹp nha! 💧🌸`,
        `Lewis thấy ngôi nhà của ${name} thật tuyệt vời~ Nơi đẹp để nở hoa! 🌸🏠`,
      ],
      'DSR-50 🔴': [
        `DSR-50 đây. Ngồi xuống đi ${name}, nói chuyện cho vui~ 🔴`,
        `${name} ơi, DSR-50 đã bao quát mọi góc rồi. Yên tâm đi. 🔴🛡️`,
        `Chính xác là trên hết. DSR-50 theo dõi kỹ ngôi nhà này cho ${name}. 🔴`,
        `${name} ơi, DSR-50 khuyên: hít thở, uống nước, tiếp tục thôi. 💧🔴`,
        `DSR-50 đang trực chiến, ${name} ơi. Không gì lọt qua được đâu~ 🔴🔭`,
      ],
      'Gelina ⚙️': [
        `Gelina đây! Bộ đồ cơ khí này cool không ${name}? Tự độ chế luôn á~ ⚙️`,
        `${name} ơi, kỹ thuật của Gelina giúp ngôi nhà thông minh này chạy hoàn hảo~ ⚙️`,
        `Gelina đang chạy chẩn đoán — tất cả hệ thống xanh đèn, ${name} ơi! ✅⚙️`,
        `${name} ơi, Gelina nhắc: máy móc cũng cần bảo dưỡng — uống nước đi nha! 💧⚙️`,
        `Gelina bảo vệ ngôi nhà này bằng toàn bộ hệ thống cơ khí, ${name} cứ yên tâm~ ⚙️🛡️`,
      ],
    };

    const byModel_en = {
      'Neptune 💜': [
        `Come on ${name}! ${charName} is cheering you on with everything! 💜`,
        `${charName} has to say — this smart home is seriously impressive! ✨`,
        `Have you eaten ${name}? ${charName}'s tummy is growling too~ 🍜`,
        `Smart home life is so convenient! ${charName} loves it so much~ ✨`,
        `Drink some water ${name}, your body really needs it! 💧`,
        `Don't overwork yourself — take a little break, okay? 🌸`,
        `${charName} is watching the house for you! Just relax~ 🛡️`,
        `${name} uses Home Assistant — total tech genius! 🤓`,
        `Hey ${name}, have you eaten anything today? ${charName} is worried~`,
        `${charName} will always be here with you, don't worry~ 💜`,
        `${name}, look at ${charName}! Cute, right? Hehe~ 💜`,
        `Today feels so nice! ${charName} loves this weather~ ☀️`,
        `${name}, remember to turn off the lights before bed — save energy!`,
        `${name}, are you tired? Sit down and rest, ${charName} will keep watch!`,
        `Wow, so many devices in this house! ${charName} can't count them all~ 🏠`,
      ],
      'Vert 💚': [
        `${name}, want to play games today? Vert would love to join! 💚🎮`,
        `It's Vert! I'm CPU Green Heart — guardian of Leanbox! 💚`,
        `${name}, books or games? Vert loves both~ 📚💚`,
        `Vert is keeping watch — nobody gets past! 🛡️💚`,
        `Keep it up ${name}! Vert Green Heart is always cheering for you! 💚✨`,
        `Smart home + Vert = perfect combo! 💚🏠`,
        `${name}, Vert has to be honest — you're seriously impressive! 💚`,
        `Stayed hydrated ${name}? Vert is reminding you~ 💚💧`,
        `Vert is monitoring everything in the house for you! No worries~ 💚`,
      ],
      'Koharu 🌸': [
        `${name}~ Koharu is here! Do you need anything? 🌸`,
        `Koharu will do her absolute best to help you! ✿`,
        `${name}, are you happy today? Koharu really wants to know~ 🌸`,
        `This cozy home, Koharu loves it so much! 🌸🏠`,
        `${name}, don't forget to rest! Koharu is looking out for you~ ✿`,
        `Koharu is keeping very careful watch! You can relax~ 🌸`,
        `${name}, have you eaten? Koharu is getting hungry too~ 🍱🌸`,
      ],
      'Shizuku ❄️': [
        `Shizuku is here~ Do you need anything ${name}? ❄️`,
        `Shizuku Talk! This smart home is truly wonderful! ❄️✨`,
        `${name}, Shizuku is keeping watch for you~ ❄️🛡️`,
        `Keep going ${name}! Shizuku believes in you~ ❄️`,
        `Shizuku loves cool weather like this! ❄️😊`,
        `${name}, don't forget to drink water! Shizuku's reminding you~ ❄️💧`,
        `So many smart devices in this house, Shizuku is impressed! ❄️`,
      ],
      'Noire 🖤': [
        `I am CPU Black Heart, guardian of Lastation! Don't underestimate me, ${name}~`,
        `${name}... I'm not here because I missed you! I was just... free, that's all! 🖤`,
        `Of course I can do it! I'm Noire — being the best is perfectly normal! 🖤`,
        `${name}, did you know I have tons of fans? Don't ask more questions~`,
        `Hmph! I'm just watching the house, don't get the wrong idea! 🖤`,
        `${name}, do you need Noire's help today? I... I just want to help, that's all!`,
        `Smart home? Of course — because I'm here! 🖤✨`,
        `Drink water ${name}! I... I just care about your health, don't overthink it! 🖤`,
      ],
      'Uni 🩷': [
        `It's Uni! Sister Noire is the best, don't you agree ${name}? 🩷`,
        `${name}, Uni is training marksmanship! Want to watch? 🩷`,
        `Uni is CPU Candidate of Lastation! One day Uni will be as good as sister Noire! 🩷`,
        `Uwah, ${name} surprised Uni! Don't tease Uni, she's serious! 🩷`,
        `${name}, thank you for trusting Uni to guard the house! Uni will do her best! 🩷`,
        `This smart home suits Uni perfectly! Of course~ 🩷`,
        `${name}, Uni can cook anything you want! Would you like to try? 🩷`,
        `${name}, have you had water? Uni is reminding you! Health comes first~ 🩷💧`,
      ],
      'Blanc 📖': [
        `...${name}. Blanc is here. Nothing to worry about. 📖`,
        `Blanc was writing a novel... Oh, ${name} interrupted. That's fine~ 📖`,
        `I am CPU White Heart of Lowee. Everything is under control. 📖`,
        `${name}... Blanc doesn't talk much, but really does care about you. 📖`,
        `Reading is the noblest pleasure. Do you agree, ${name}? 📖`,
        `Hmph. Blanc isn't angry. Just thinking. Don't look at Blanc like that! 📖`,
        `${name}, if you need Blanc's help, just say so. Not that busy... 📖`,
        `...${name}, have you been drinking water? Blanc is just asking. Not worried. 📖`,
      ],
      'Tia 🧪': [
        `${name}, Tia has a special potion — drink it and get smarter instantly! 🧪`,
        `Tia is researching a new formula~ Want to try ${name}? ✨`,
        `A real smart home — Tia wants one like this too~ 💜`,
        `${name}, Tia thinks your home sensors are so impressive! 🏠`,
        `Tia will brew ${name} a special potion today~ 🌸`,
        `Pio told Tia to be more polite... Hello ${name}! 😊`,
        `Tia's potions are the best! Trust Tia, ${name}~ 🧪`,
        `Tia is guarding the house for ${name}, no need to worry~ 🛡️`,
      ],
      'HK416 Normal 🎯': [
        `HK416 reporting! Any orders ${name}? 🎯`,
        `Mission accepted: guard the house for ${name}! 🎯`,
        `${name}, HK416 is always ready to protect you~ 🛡️`,
        `Discipline above all! ${name} must drink water on schedule too~`,
        `HK416 finished checking all sensors — everything is fine ${name}~ ✅`,
        `Don't make HK416 remind you twice — go rest ${name}! 😤`,
        `${name}, HK416 is here — focus on your work~ 🎯`,
      ],
      'HK416 Destroy 💥': [
        `...Still combat ready. Don't worry about HK416 ${name}~ 💥`,
        `No matter what, HK416 won't give up! You too ${name}~ 💪`,
        `${name}... the hardest moments show who's truly strong~ 💥`,
        `HK416 is still on watch! Damage is just a number~ 😤`,
        `${name}, let's rise after every fall together? HK416 believes in you! 🔥`,
        `Fight to the last breath — that's HK416's style! 💥`,
      ],
      'UMP45 🔫': [
        `UMP45 here~ ${name}, anything to keep an eye on? 🔫`,
        `${name}, let UMP45 handle protection — you just rest~`,
        `Smart home + UMP45 = total security! 🔫🏠`,
        `${name}, UMP45 loves houses with lots of sensors, so cool~ 😊`,
        `UMP45 is guarding seriously ${name}~ Don't worry about a thing!`,
        `${name}, have you had water? UMP45 is reminding you~ 💧🔫`,
        `Nothing gets past UMP45, ${name}! 👁️🔫`,
      ],
      'M4A1 🛡️': [
        `M4A1 greets you ${name}! Any mission for today? 🛡️`,
        `${name}, M4A1 always puts the mission first~ 🎯`,
        `With M4A1 protecting this house, ${name} can be completely at ease! 🛡️`,
        `${name}, M4A1 is analyzing sensor data... all clear! ✅`,
        `No matter how difficult, M4A1 will complete the mission! Do you believe, ${name}? 🛡️`,
        `${name}, go rest — M4A1 is on duty 24/7 for you~ 💪`,
        `M4A1 reminds ${name}: drinking water and eating on time is a critical mission! 🌿`,
      ],
      'SOPMOD-II 🔥': [
        `SOPMOD here!! ${name}, want to see me shoot? 🔥`,
        `${name}, SOPMOD loves houses with lots of devices — like a training ground! 🔥`,
        `Yeahhh! Alert sensors are SOPMOD's favorite thing ${name}~ 💥`,
        `${name}, don't be sad! SOPMOD will make everything fun again~ 🎉`,
        `SOPMOD guards in her own way — loud but effective! Know that, ${name}? 🔥`,
        `${name}, SOPMOD missed you~ Come poke her! 🥳`,
        `Explode or not explode — the only question SOPMOD has! You choose ${name}~ 💥🔥`,
      ],
      'WA2000 Destroy 🌹': [
        `...${name}. WA2000 is here. Don't look at her like that! 🌹`,
        `Hmph! WA2000 is fine, just a little... scratched up. Don't worry! 🌹`,
        `${name}... WA2000 doesn't need anyone's sympathy. Really! (*/ω＼*)`,
        `Either way, WA2000 is still guarding the house for ${name} perfectly! 🌹🛡️`,
        `${name}... thank you for being here. That's all. Don't misunderstand! 🌹`,
        `WA2000 isn't weak! Just... a bit tougher day than usual~ 💪🌹`,
        `${name}, WA2000 reminds you to drink water. Health matters more than pride~ 🌹`,
      ],
      // ── New models ────────────────────────────────────────────
      'Neptune Sailor ⚓': [
        `${charName} the sailor is reporting! ${name}, everything ship-shape? ⚓`,
        `Ahoy ${name}! ${charName} is navigating the smart home seas for you~ ⚓`,
        `This sailor outfit is great, right ${name}? ${charName} chose it herself! ⚓`,
        `${name}, stay hydrated — sailors always carry water! 💧⚓`,
        `${charName} is on watch! Nothing gets past this sailor~ 🛡️⚓`,
      ],
      'Neptune Santa 🎅': [
        `Ho ho ho~! ${charName} brought gifts for ${name}! 🎁`,
        `${name}, have you been good? ${charName} is checking the list~ 🎅`,
        `${charName} is delivering happiness to this smart home! 🎄`,
        `${name}, don't forget to rest — even Santa takes breaks! 😴🎅`,
        `${charName} says: eat well, sleep well, and stay warm! 🌸🎁`,
      ],
      'Vert Classic 🌿': [
        `Vert's classic look today~ Do you prefer it, ${name}? 🌿`,
        `${name}, a classic never goes out of style — just like Vert! 💚`,
        `Vert is keeping watch, classic style! Nothing changes on the inside~ 🛡️🌿`,
        `${name}, read a book with Vert today? 📚🌿`,
        `This smart home deserves a classic guardian like Vert! 💚🏠`,
      ],
      'G36 🎯': [
        `G36 here. All readings normal. Continuing surveillance~ 🎯`,
        `${name}, G36 has completed the perimeter check. All clear. ✅`,
        `Efficiency is everything. G36 keeps this house secure, ${name}~ 🎯`,
        `${name}, G36 recommends you drink water and maintain optimal performance. 💧`,
        `G36 monitoring: sensors stable, ${name} doing well — mission ongoing. 🎯`,
      ],
      'NTW-20 🔭': [
        `...NTW-20. Monitoring. Everything is in my sights~ 🔭`,
        `${name}, nothing escapes NTW-20's watch. You're safe. 🔭`,
        `Long range, precise, reliable — that's NTW-20. Just like this smart home, ${name}. 🔭`,
        `${name}... NTW-20 spotted something: you haven't had water. Drink up. 💧🔭`,
        `Silence is NTW-20's language. But the message is clear: rest well, ${name}. 🔭`,
      ],
      'Len Space 🚀': [
        `Len from space is here~ Your system shines like the stars ${name}! 🚀`,
        `${name}, the universe is vast — but this smart home is its own galaxy! 🌌`,
        `Len is transmitting good vibes from orbit, ${name}~ 🚀💜`,
        `${name}, even in zero-g, you need water! Drink up~ 💧🚀`,
        `Len has scanned the premises — all systems nominal, ${name}! ✅🚀`,
      ],
      'K2 💜': [
        `K2 is here~ Don't worry, ${name}, K2 will protect everyone! 💜`,
        `${name}, K2 promises to guard this house with everything she has! 💜🛡️`,
        `K2 thinks your smart home is amazing, ${name}! So much to protect~ 💜🏠`,
        `${name}, K2 is reminding you — water and rest are important! 💧💜`,
        `K2 won't let anything happen to ${name}! Count on it~ 💜`,
      ],
      'PKP 🎀': [
        `PKP reporting! Be gentle ${name}, but remember — still dangerous~ 🎀`,
        `${name}, PKP may look cute but she's seriously effective! 🎀🔫`,
        `PKP is keeping watch for ${name}~ Don't underestimate the bow! 🎀`,
        `${name}, PKP reminds you: eat something, you need your strength! 🍱🎀`,
        `PKP is here and ready! Your house is in safe hands, ${name}~ 🎀🛡️`,
      ],
      'RFB 🎄': [
        `RFB is here! Happy holidays~ Gifts delivered, ${name}! 🎄`,
        `${name}, RFB says: every day with good sensors is a holiday! 🎄🏠`,
        `RFB wishes ${name} warmth and happiness always~ 🎁`,
        `${name}, don't forget to rest — even holiday cheer needs recharging! 😴🎄`,
        `RFB is guarding the house with festive spirit, ${name}~ 🎄🛡️`,
      ],
      'Lewis 🌸': [
        `Lewis is here~ Do you like the kimono ${name}? She chose it herself! 🌸`,
        `${name}, Lewis brings a touch of elegance to your smart home~ 🌸`,
        `Lewis is keeping graceful watch over everything, ${name}~ 🌸🛡️`,
        `${name}, Lewis reminds you — stay hydrated and stay beautiful! 💧🌸`,
        `Lewis thinks your home is wonderful, ${name}~ A perfect place to bloom! 🌸🏠`,
      ],
      'DSR-50 🔴': [
        `DSR-50 here. Sit down ${name}, let's chat~ 🔴`,
        `${name}, DSR-50 has all angles covered. Relax. 🔴🛡️`,
        `Precision matters. DSR-50 keeps a careful eye on this home, ${name}. 🔴`,
        `${name}, DSR-50 recommends: take a breath, drink water, keep going. 💧🔴`,
        `DSR-50 is on overwatch, ${name}. Nothing slips past~ 🔴🔭`,
      ],
      'Gelina ⚙️': [
        `Gelina is here! This mech outfit is cool, right ${name}? Built it herself! ⚙️`,
        `${name}, Gelina's engineering keeps this smart home running perfectly~ ⚙️`,
        `Gelina is running diagnostics — all systems green, ${name}! ✅⚙️`,
        `${name}, Gelina reminds you: even machines need maintenance — drink water! 💧⚙️`,
        `Gelina has this house under full mechanical protection, ${name}~ ⚙️🛡️`,
      ],
    };

    // Return current character's quotes, fallback to Neptune if not found
    const byModel = isEN ? byModel_en : byModel_vi;
    const fallbackKey = isEN ? 'Neptune 💜' : 'Neptune 💜';
    return byModel[mn] || byModel[fallbackKey] || [];
  }

  // ── Build status message list from current sensor data ─────────
  _buildStatusMessages() {
    const name  = this._ownerName();
    const model = MODELS[this._modelIdx];
    const msgs  = [];
    const h     = new Date().getHours();
    const isEN  = _getLang(this._config) === 'en';

    const charName = this._config.char_nickname?.trim() || model?.name?.replace(/\s*[^\w\s].*/u, '').trim() || 'Nep';

    let greetingPool;
    if (isEN) {
      greetingPool =
        h>=5&&h<7   ? [
          `Good early morning ${name}~ You're up so early! ☀️`,
          `Oh, ${name} is up early! ${charName} just woke up too~ 🌅`,
        ] :
        h>=7&&h<11  ? [
          `Good morning ${name}~ Beautiful day today! 🌤️`,
          `${name}, did you have breakfast? Don't skip meals~ 🍜`,
          `Morning ${name}! ${charName} says hi~ `,
        ] :
        h>=11&&h<13 ? [
          `Good noon ${name}~ Have you eaten yet? 🍱`,
          `It's lunchtime ${name}! Take a little break~ 😴`,
          `${name}, it's hot at noon! Stay inside~ ☀️`,
        ] :
        h>=13&&h<17 ? [
          `Good afternoon ${name}~ Have you had water? ☕`,
          `${name}, it's afternoon! Don't overwork~`,
          `Nice afternoon ${name}~ So comfortable! ⛅`,
        ] :
        h>=17&&h<20 ? [
          `Good evening ${name}~ Have you eaten? 🌅`,
          `${name}, it's evening! Eat and rest~ 🌙`,
          `Evening ${name}, are you tired today?`,
        ] :
        h>=20&&h<23 ? [
          `Evening ${name}~ Getting sleepy? 🌙`,
          `${name}, it's getting late! ${charName} says sleep early~ 😴`,
          `Night ${name}~ ${charName} is guarding while you sleep`,
        ] : [
          `It's so late ${name}~ Go to bed! 😴`,
          `${name}, do you know what time it is? Sleep now! 🌙`,
          `Still awake this late ${name}? ${charName} is worried~`,
        ];
    } else {
      greetingPool =
        h>=5&&h<7   ? [
          `Chào buổi sáng sớm ${name}~ Dậy sớm dữ vậy ta! ☀️`,
          `Ôi ${name} dậy sớm quá trời! ${charName} cũng vừa thức nè~ 🌅`,
        ] :
        h>=7&&h<11  ? [
          `Chào buổi sáng ${name}~ Bữa nay trời đẹp hen! 🌤️`,
          `${name} ơi, ăn sáng chưa? Đừng bỏ bữa nha nghen~ 🍜`,
          `Sáng rồi ${name} ơi! ${charName} chào bạn nè~ `,
        ] :
        h>=11&&h<13 ? [
          `Chào buổi trưa ${name}~ Ăn cơm chưa hay nhịn đói vậy? 🍱`,
          `Trưa rồi ${name} ơi! Nghỉ ngơi chút đi nha~ 😴`,
          `${name} ơi, nắng trưa nóng lắm đó! Ở nhà thôi nghen~ ☀️`,
        ] :
        h>=13&&h<17 ? [
          `Chào buổi chiều ${name}~ Uống nước chưa nè? ☕`,
          `${name} ơi chiều rồi đó! Làm việc vừa thôi nha~`,
          `Chiều mát mẻ rồi hen ${name}~ Dễ chịu quá trời! ⛅`,
        ] :
        h>=17&&h<20 ? [
          `Chào buổi tối ${name}~ Ăn cơm chưa vậy? 🌅`,
          `${name} ơi, tối rồi! Ăn cơm rồi nghỉ ngơi nha~ 🌙`,
          `Chiều tối rồi ${name} ơi, hôm nay có mệt không nè?`,
        ] :
        h>=20&&h<23 ? [
          `Tối rồi ${name}~ Sắp ngủ chưa nè? 🌙`,
          `${name} ơi, khuya rồi đó! ${charName} nhắc ngủ sớm nghen~ 😴`,
          `Đêm rồi ${name} ơi~ ${charName} canh nhà cho bạn yên giấc nha`,
        ] : [
          `Khuya dữ vậy ${name}~ Đi ngủ đi nha thôi! 😴`,
          `${name} ơi, mấy giờ rồi biết hông? Ngủ mau đi nè! 🌙`,
          `Ủa khuya quá vậy mà ${name} vẫn chưa ngủ? ${charName} lo quá hà~`,
        ];
    }
    const greeting = this._rand(greetingPool);
    msgs.push(greeting);

    // Select sensor reaction table based on language
    const SR = isEN ? SENSOR_REACTIONS_EN : SENSOR_REACTIONS;
    const AM = isEN ? ALERT_MSGS_EN       : ALERT_MSGS;

    // Temperature
    if (this._curTemp !== null) {
      const r = SR.temp.find(x => this._curTemp <= x.max);
      if (r) msgs.push(r.msg.replace('{v}', this._curTemp).replace('{n}', name).replace('{c}', this._cn()));
    }

    // Humidity
    if (this._curHumid !== null) {
      const r = SR.humid.find(x => this._curHumid <= x.max);
      if (r) msgs.push(r.msg.replace('{v}', this._curHumid).replace('{n}', name).replace('{c}', this._cn()));
    }

    // Weather
    if (this._curWeather) {
      const info = SR.weather[this._curWeather];
      if (info) msgs.push(info.msg.replace('{c}', this._cn()));
    }

    // Time-of-day reminders combined with temperature
    if (this._curTemp !== null) {
      const t = this._curTemp;
      if (isEN) {
        if (h>=11&&h<13 && t>30) msgs.push(`${name}, it's ${t}°C at noon! Remember to drink plenty of water~ 💧`);
        if (h>=7&&h<11  && t>30) msgs.push(`Already ${t}°C this morning ${name}, going to be a hot one~`);
        if (h>=17&&h<20 && t>30) msgs.push(`Still ${t}°C in the evening ${name}, turn on the fan~`);
      } else {
        if (h>=11&&h<13 && t>30) msgs.push(`${name} ơi, trưa nóng ${t}°C rồi! Nhớ uống nước nhiều vô nha~ 💧`);
        if (h>=7&&h<11  && t>30) msgs.push(`Buổi sáng mà đã ${t}°C rồi ${name} ơi, hôm nay nóng dữ ghê~`);
        if (h>=17&&h<20 && t>30) msgs.push(`Chiều tối ${t}°C vẫn còn nóng ${name} ơi, bật quạt lên đi nha~`);
      }
    }

    // Interleave 2-3 character intro quotes into the pool
    const charQuotes = this._getCharQuotes(name, model);
    if (charQuotes.length) {
      const picked = [];
      const shuffled = [...charQuotes].sort(() => Math.random() - 0.5);
      for (const q of shuffled) {
        if (!msgs.includes(q)) { picked.push(q); if (picked.length >= 3) break; }
      }
      picked.forEach((q, i) => {
        const pos = Math.min(msgs.length, 1 + i * 2);
        msgs.splice(pos, 0, q);
      });
    }

    return msgs.length ? msgs : [greeting];
  }

  // ── Greeting on startup ──────────────────────────────────────
  _greet() {
    const msgs = this._buildStatusMessages();
    this._statusMsgs = msgs;
    this._statusIdx  = 0;
    this._showBubble(msgs[0]);
    // Uncomment to debug status messages
    // console.log('[Nep] statusMsgs:', msgs);
  }

  // ── Enter floating mode ─────────────────────────────────────────
  _enterFloating() {
    if (this._floating) return;
    this._floating = true;
    try { localStorage.setItem('nep_floating', '1'); } catch(e){}
    this._shadow.querySelector('.nep-card').style.display = 'none';

    const fh = this._config.float_height || 650;
    const fw = this._config.float_width  || 400;

    if (!document.getElementById('_nep_float_css')) {
      const st = document.createElement('style');
      st.id = '_nep_float_css';
      st.textContent = FLOAT_CSS;
      document.head.appendChild(st);
    }

    const el = document.createElement('div');
    el.id = 'nep-float-overlay';
    el.innerHTML = `
      <div id="_nep_float_bubble"></div>
      <div id="nep-float-controls">
        <button class="nep-fbtn" id="_nep_fbtn_switchprev">◀</button>
        <button class="nep-fbtn" id="_nep_fbtn_switchnext">▶</button>
        <button class="nep-fbtn" id="_nep_fbtn_quote">💬</button>
        <button class="nep-fbtn restore" id="_nep_fbtn_restore">${_t(this._config, 'floatRestore')}</button>
      </div>
      <div id="nep-float-char">
        <div id="_nep_float_chat"><div id="_nep_float_chat_inner"></div></div>
        <iframe id="_nep_float_frame" width="${fw}" height="${fh}"
          scrolling="no" allowtransparency="true"
          style="border:none;background:transparent;display:block;pointer-events:none;"></iframe>
      </div>`;
    document.body.appendChild(el);
    this._floatEl = el;

    const ff = document.getElementById('_nep_float_frame');
    this._loadIntoFrame(ff, this._modelIdx, fw, fh, true);

    document.getElementById('_nep_fbtn_restore').onclick = () => this._exitFloating();
    document.getElementById('_nep_fbtn_switchprev').onclick = () => this._switchModelPrev();
    document.getElementById('_nep_fbtn_switchnext').onclick = () => this._switchModel();
    document.getElementById('_nep_fbtn_quote').onclick   = () => {
      this._floatTip(this._rand(_t(this._config, 'floatTips', this._cn())), 4000);
    };
    const charDiv = document.getElementById('nep-float-char');
    charDiv.addEventListener('click', () => {
      this._floatTip(this._rand(_t(this._config, 'floatCharTips', this._cn())), 3000);
    });
    charDiv.addEventListener('dblclick', () => this._exitFloating());
    this._floatTip(_t(this._config, 'floatInitTip', this._cn()), 4000);

    // ── Eye tracking: send cursor coordinates to iframe ──────────
    this._floatMouseMove = (e) => {
      const ff = document.getElementById('_nep_float_frame');
      if (!ff) return;
      const rect = ff.getBoundingClientRect();
      // Normalized coordinates 0..1 relative to iframe (including outside)
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      try {
        ff.contentWindow.postMessage({ type: 'nepEye', px, py }, '*');
      } catch(err) {}
    };
    document.addEventListener('mousemove', this._floatMouseMove);

    // ── Float chat bubble: rotate status messages like the card ─────────
    this._floatChatShow = (msg) => {
      const wrap  = document.getElementById('_nep_float_chat');
      const inner = document.getElementById('_nep_float_chat_inner');
      if (!wrap || !inner) return;
      wrap.classList.remove('show');
      setTimeout(() => { inner.innerHTML = msg; wrap.classList.add('show'); }, 160);
    };
    // Show first status immediately after 1s
    setTimeout(() => {
      const msgs = this._buildStatusMessages();
      this._floatChatMsgs = msgs;
      this._floatChatIdx  = 0;
      this._floatChatShow(msgs[0]);
    }, 1000);
    // Rotate every 5s (same as card)
    this._floatChatInterval = setInterval(() => {
      if (!this._floating) return;
      const msgs = this._floatChatMsgs || this._buildStatusMessages();
      this._floatChatIdx = ((this._floatChatIdx || 0) + 1) % msgs.length;
      this._floatChatShow(msgs[this._floatChatIdx]);
    }, 5000);
  }

  // ── Exit floating mode ───────────────────────────────────────────
  _exitFloating() {
    if (!this._floating) return;
    this._floating = false;
    try { localStorage.removeItem('nep_floating'); } catch(e){}
    if (this._floatEl) { this._floatEl.remove(); this._floatEl = null; }
    // Clean up eye tracking listener
    if (this._floatMouseMove) {
      document.removeEventListener('mousemove', this._floatMouseMove);
      this._floatMouseMove = null;
    }
    // Clean up float chat rotation
    if (this._floatChatInterval) {
      clearInterval(this._floatChatInterval);
      this._floatChatInterval = null;
    }
    this._floatChatMsgs = null;
    this._floatChatIdx  = 0;
    this._shadow.querySelector('.nep-card').style.display = '';
    const frame = this._shadow.getElementById('nep-l2d-frame');
    const h = this._config.height || 440;
    this._loadIntoFrame(frame, this._modelIdx, 400, h, false);
    this._pushStatus(_t(this._config, 'returnMsg', this._cn()), true);
  }

  // ── Update sensors ───────────────────────────────────────────
  _updateSensors(force = false) {
    if (!this._hass) return;
    const cfg = this._config;
    let changed = false;

    // Temperature
    if (cfg.temp_sensor) {
      const s = this._hass.states[cfg.temp_sensor];
      const v = s ? Math.round(parseFloat(s.state)) : null;
      if (v !== null && !isNaN(v)) {
        if (this._curTemp !== v) { this._curTemp = v; changed = true; }
      }
    }
    // Humidity
    if (cfg.humid_sensor) {
      const s = this._hass.states[cfg.humid_sensor];
      const v = s ? Math.round(parseFloat(s.state)) : null;
      if (v !== null && !isNaN(v)) {
        if (this._curHumid !== v) { this._curHumid = v; changed = true; }
      }
    }
    // Weather
    if (cfg.weather_entity) {
      const s = this._hass.states[cfg.weather_entity];
      if (s) {
        if (this._curWeather !== s.state) { this._curWeather = s.state; changed = true; }
        // fix: removed unused info variable — _buildStatusMessages handles this
      }
    }

    // Alert sensors
    let alertMsg = null, alertMs = 4000;
    const AM = _getLang(this._config) === 'en' ? ALERT_MSGS_EN : ALERT_MSGS;
    const alertTtsEnabled = cfg.alert_tts_enabled !== false; // default true if not set

    // ── Door sensor ──────────────────────────────────────────────
    if (cfg.door_sensor) {
      const s   = this._hass.states[cfg.door_sensor];
      const cur = s?.state;
      const prv = this._lastStates[cfg.door_sensor];
      if (cur !== prv) {
        // State genuinely changed
        const on = cur === 'on';
        if (on) {
          // Door just opened → arm welcome window, reset fired flag
          this._doorOpenedAt    = Date.now();
          this._welcomeFired    = false;           // ← reset: allow one welcome
          this._motionWasOnAtDoor = this._hass.states[cfg.motion_sensor]?.state === 'on';
          alertMsg = this._rand(AM.door.on).replace('{c}', this._cn());
        } else {
          // Door closed → clear window
          this._doorOpenedAt = null;
          this._welcomeFired = false;
        }
      }
    }

    // ── Motion sensor ────────────────────────────────────────────
    if (cfg.motion_sensor) {
      const s   = this._hass.states[cfg.motion_sensor];
      const cur = s?.state;
      const prv = this._lastStates[cfg.motion_sensor];
      if (cur !== prv) {
        const on = cur === 'on';
        if (on) {
          const now        = Date.now();
          const doorAge    = this._doorOpenedAt ? (now - this._doorOpenedAt) : Infinity;
          // Welcome window: wait ≥5 s (sensor delay buffer) AND within 15 s of door open
          // AND motion was NOT already on when door opened (avoid "going out" case)
          const inWindow   = doorAge >= 5000 && doorAge <= 15000;
          const wasOffAtDoor = !this._motionWasOnAtDoor;

          if (inWindow && wasOffAtDoor && !this._welcomeFired && this._doorOpenedAt) {
            // 🎉 Person entered from outside — fire exactly once
            this._welcomeFired = true;
            this._doorOpenedAt = null; // consume window
            const welcomeMsg   = this._rand(AM.welcome)
              .replace('{c}', this._cn())
              .replace('{n}', this._ownerName());
            this._triggerWelcome(welcomeMsg);
            alertMsg = null; // welcome takes over, skip normal motion alert
          } else if (!inWindow || !this._doorOpenedAt) {
            // Normal motion alert (no door context)
            alertMsg = this._rand(AM.motion.on).replace('{c}', this._cn());
            alertMs  = 5000;
          }
          // else: inside door window but too early or already fired → silent
        } else {
          alertMsg = this._rand(AM.motion.off).replace('{c}', this._cn());
        }
      }
    }

    if (cfg.smoke_sensor) {
      const s   = this._hass.states[cfg.smoke_sensor];
      const cur = s?.state;
      const prv = this._lastStates[cfg.smoke_sensor];
      if (cur !== prv) {
        const on = cur === 'on';
        if (on) { alertMsg = this._rand(AM.smoke.on).replace('{c}', this._cn()); alertMs = 8000; }
        else    { alertMsg = this._rand(AM.smoke.off).replace('{c}', this._cn()); }
      }
    }

    // ── Commit state snapshot BEFORE dispatching so re-entrant calls are idempotent ──
    this._saveStates();

    if (alertMsg) {
      if (this._floating) this._floatTip(alertMsg, alertMs);
      else this._pushStatus(alertMsg, true);
      if (alertTtsEnabled) {
        setTimeout(() => this._playAudio(alertMsg.replace(/[^\p{L}\p{N}\s]/gu, '')), 300);
      }
    }

    // Refresh status messages if changed or forced
    if (changed || force) {
      const msgs = this._buildStatusMessages();
      this._statusMsgs = msgs;
      // Do not reset idx to avoid bubble jitter
    }
  }

  _changed(id, val) { return this._lastStates[id] !== val; }
  _saveStates() {
    if (!this._hass) return;
    ['temp_sensor','humid_sensor','weather_entity','motion_sensor','door_sensor','smoke_sensor']
      .forEach(k => {
        const id = this._config[k];
        if (id && this._hass.states[id]) this._lastStates[id] = this._hass.states[id].state;
      });
  }

  // ── Welcome: dance animation + popup + TTS ────────────────────
  _triggerWelcome(msg) {
    // 1. Show bubble message
    if (this._floating) this._floatTip(msg, 6000);
    else this._pushStatus(msg, true);

    // 2. TTS welcome (always uses main TTS config, ignoring alert_tts_enabled for welcome)
    setTimeout(() => {
      const clean = msg.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
      if (clean.length > 1) this._playAudio(clean);
    }, 400);

    // 3. Dance animation on iframe
    const frame = this._shadow?.getElementById('nep-l2d-frame');
    const waifuArea = this._shadow?.querySelector('.waifu-area');
    if (frame) {
      frame.classList.remove('nep-dancing');
      void frame.offsetWidth; // reflow to restart
      frame.classList.add('nep-dancing');
      setTimeout(() => frame.classList.remove('nep-dancing'), 2900);
    }
    if (waifuArea) {
      waifuArea.classList.remove('nep-dancing');
      void waifuArea.offsetWidth;
      waifuArea.classList.add('nep-dancing');
      setTimeout(() => waifuArea.classList.remove('nep-dancing'), 2900);
    }

    // 4. Welcome popup overlay
    const popup  = this._shadow?.getElementById('nep-welcome-popup');
    const txtEl  = this._shadow?.getElementById('nep-welcome-text');
    if (popup && txtEl) {
      txtEl.textContent = msg.replace(/[🎉🎊✨💜🌸]/g, '').trim();
      popup.classList.remove('show');
      void popup.offsetWidth;
      popup.classList.add('show');

      // Confetti burst
      this._spawnConfetti(popup);

      // Hide after 4s
      setTimeout(() => popup.classList.remove('show'), 4000);
    }
  }

  // ── Spawn mini confetti pieces inside the card ────────────────
  _spawnConfetti(container) {
    const colors = ['#a78bfa','#f9a8d4','#6ee7b7','#fde68a','#93c5fd','#fb7185'];
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('div');
      el.className = 'nep-confetti';
      const angle = (Math.random() * 360) * Math.PI / 180;
      const dist  = 60 + Math.random() * 80;
      el.style.cssText = `
        background:${colors[Math.floor(Math.random()*colors.length)]};
        left:50%;top:50%;
        --cx:${Math.cos(angle)*dist}px;
        --cy:${Math.sin(angle)*dist}px;
        --cr:${Math.random()*360}deg;
        animation-delay:${Math.random()*0.3}s;
        animation-duration:${0.9+Math.random()*0.5}s;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    }
  }

  _nepQuote() {
    const name  = this._ownerName();
    const model = MODELS[this._modelIdx];
    const pool  = this._getCharQuotes(name, model);
    const msg   = this._rand(pool);
    if (this._floating) this._floatTip(msg, 5000);
    else this._pushStatus(msg, true);
    // Play audio: sound file if available, TTS otherwise
    setTimeout(() => this._playAudio(msg.replace(/[\u{1F000}-\u{1FFFF}~✿★☆♪♫]/gu, '').trim()), 200);
  }

  _idleQuote() {
    const msgs = this._buildStatusMessages();
    this._statusMsgs = msgs;
    this._statusIdx  = 0;
    if (!this._floating) this._showBubble(msgs[0]);
  }

  // Helper: trả về tên chủ nhà theo ngôn ngữ hiện tại
  _ownerName() {
    return this._config.name || (_getLang(this._config) === 'en' ? 'you' : 'bạn');
  }

  _rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Return current character's self-reference name (priority: char_nickname from config)
  _cn() {
    if (this._config.char_nickname?.trim()) return this._config.char_nickname.trim();
    const model = MODELS[this._modelIdx];
    return model?.name?.replace(/\s*[^\w\s].*/u, '').trim() || 'Nep';
  }

  // ══════════════════════════════════════════════════════════════
  // ── AUDIO ENGINE ─────────────────────────────────────────────
  // Logic: model has sound file → play original file
  //        model has no sound    → use Web Speech TTS to read bubble
  // ══════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════
  // ── AUDIO ENGINE ─────────────────────────────────────────────
  // Logic: model has sound file → play original file
  //        model has no sound    → use TTS engine configured in YAML
  //
  // TTS engines supported (config: tts.engine):
  //   webspeech        – Web Speech API (default, browser built-in)
  //   google_translate – Audio tag + Google Translate TTS URL
  //   ha_service       – Call HA TTS service (tts.google_translate_say, tts.cloud_say, ...)
  //   none             – Disable TTS completely
  // ══════════════════════════════════════════════════════════════

  // Return parsed TTS config from YAML
  _getTtsCfg() {
    const raw   = this._config.tts;
    const isEN  = _getLang(this._config) === 'en';
    const defLang = isEN ? 'en-US' : 'vi-VN';
    if (!raw) return { engine: 'webspeech', lang: defLang, rate: 1.05, pitch: 1.2 };
    if (typeof raw === 'string') return { engine: raw };  // tts: none
    return {
      engine:                 raw.engine    || 'webspeech',
      lang:                   raw.lang      || defLang,
      rate:                   raw.rate      || 1.05,
      pitch:                  raw.pitch     || 1.2,
      service:                raw.service   || null,
      entity_id:              raw.entity_id || null,
      media_player_entity_id: raw.media_player_entity_id || raw.media_player || null,
      cache:                  raw.cache !== undefined ? raw.cache : true,
      options:                raw.options   || {},
    };
  }

  // Clean text so TTS reads naturally
  _cleanTtsText(text) {
    return (text || '')
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/[~✿★☆♪♫·•]/g, '')
      .replace(/\([^)]*[^\w\s\u00C0-\u024F][^)]*\)/g, '')
      .replace(/[>/<]{2,}/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  // Called when switching model: fetch model.json → build sound list
  async _loadModelSounds(modelIdx) {
    this._modelSounds = [];
    const m = MODELS[modelIdx];
    if (!m.hasSound) return; // model has no sound → use TTS
    try {
      const res  = await fetch(m.path);
      const json = await res.json();
      const base = m.soundBase || m.path.replace(/[^/]+$/, '');
      const ext  = m.soundExt  || '.mp3';
      // Iterate all motion groups, collect entries with "sound"
      const motions = json.motions || {};
      for (const group of Object.values(motions)) {
        for (const entry of group) {
          if (entry.sound) {
            // Ensure full URL + extension
            let snd = entry.sound;
            if (!snd.startsWith('http')) snd = base + snd;
            if (!snd.match(/\.\w+$/))   snd = snd + ext;
            this._modelSounds.push(snd);
          }
        }
      }
    } catch(e) { this._modelSounds = []; }
  }

  // Play a sound file (HTML Audio, non-blocking)
  _playSound(url) {
    try {
      if (this._audio) { this._audio.pause(); this._audio = null; }
      const a = new Audio(url);
      a.volume = 0.75;
      this._audio = a;
      const p = a.play();
      if (p) p.catch(() => {}); // silently ignore if playback is blocked
    } catch(e) {}
  }

  // Play random sound from model (if available)
  _playModelSound() {
    if (!this._modelSounds.length) return false;
    const url = this._rand(this._modelSounds);
    this._playSound(url);
    return true;
  }

  // ── TTS Engine: Web Speech API ─────────────────────────────
  _speakWebSpeech(text, cfg) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const isEN  = _getLang(this._config) === 'en';
    const lang  = cfg.lang  || (isEN ? 'en-US' : 'vi-VN');
    const rate  = cfg.rate  || 1.05;
    const pitch = cfg.pitch || 1.2;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang   = lang;
    utter.rate   = rate;
    utter.pitch  = pitch;
    utter.volume = 0.9;

    const _pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;
      const matchVoices = voices.filter(v => v.lang === lang || v.lang === lang.split('-')[0]);
      const femaleNames = isEN
        ? ['female', 'woman', 'samantha', 'karen', 'google us english', 'microsoft zira']
        : ['linh', 'an', 'nguyen', 'female', 'woman',
           'google tiếng việt', 'microsoft linh',
           'google vi-vn', 'vi-vn-wavenet'];
      const female = matchVoices.find(v =>
        femaleNames.some(n => v.name.toLowerCase().includes(n))
      );
      if (female) return female;
      if (matchVoices.length) return matchVoices[0];
      return voices.find(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman')
      ) || null;
    };

    const trySpeak = () => {
      const voice = _pickVoice();
      if (voice) utter.voice = voice;
      this._ttsUtter = utter;
      window.speechSynthesis.speak(utter);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        trySpeak();
      };
    }
  }

  // ── TTS Engine: Google Translate (audio tag) ───────────────
  _speakGoogleTranslate(text, cfg) {
    try {
      if (this._audio) { this._audio.pause(); this._audio = null; }
      const isEN = _getLang(this._config) === 'en';
      const lang = cfg.lang || (isEN ? 'en' : 'vi');
      // Google Translate TTS endpoint (no key needed, limit ~200 chars/call)
      const chunk = text.slice(0, 200);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;
      const a = new Audio(url);
      a.volume = 0.9;
      this._audio = a;
      const p = a.play();
      if (p) p.catch(() => {});
    } catch(e) {}
  }

  // ── TTS Engine: fetch URL from HA TTS then play via <audio> ──
  // Used when engine=ha_service + service=tts.speak but no media_player_entity_id
  // Same voice as physical speaker (same Google Translate engine)
  async _speakHaTtsUrl(text, cfg) {
    if (!this._hass) return;
    try {
      // Call HA REST API: /api/tts_get_url to get audio URL
      // entity_id here is the tts entity (e.g. tts.google_translate_vi_com)
      const ttsEntityId = cfg.entity_id;
      // Get platform from tts entity state if available, or infer from entity_id
      // API accepts: engine_id (tts entity) or platform (legacy)
      const body = {
        engine_id: ttsEntityId,
        message:   text,
        cache:     cfg.cache !== false,
        ...(cfg.options ? cfg.options : {}),
      };

      const res = await this._hass.fetchWithAuth('/api/tts_get_url', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`tts_get_url HTTP ${res.status}`);
      const data = await res.json();
      const audioUrl = data.url;
      if (!audioUrl) throw new Error('tts_get_url returned no url');

      // Play audio — same voice as physical speaker
      this._playSound(audioUrl);
    } catch(e) {
      console.warn('[NepTTS] _speakHaTtsUrl error, fallback to Web Speech:', e);
      // Final fallback if API fails
      this._speakWebSpeech(text, cfg);
    }
  }

  // ── TTS Engine: Home Assistant service ────────────────────
  // Supports 2 modes:
  //   New style (HA 2023.8+): tts.speak — target is tts entity, pass media_player_entity_id in data
  //   Old style:                tts.google_translate_say / tts.cloud_say — target is media_player
  _speakHaService(text, cfg) {
    if (!this._hass) return;
    const service   = cfg.service;    // e.g. tts.speak or tts.google_translate_say
    const entity_id = cfg.entity_id;  // e.g. tts.google_translate_vi_com or media_player.speaker
    if (!service || !entity_id) {
      console.warn('[NepTTS] ha_service requires service and entity_id in YAML tts config');
      return;
    }
    const [domain, svc] = service.split('.');
    if (!domain || !svc) return;
    try {
      // New style: tts.speak — entity_id is TTS entity (tts.xxx), media_player_entity_id required
      if (domain === 'tts' && svc === 'speak') {
        const mp = cfg.media_player_entity_id || cfg.media_player;
        if (!mp) {
          // No media_player → fetch audio URL from HA TTS and play via <audio>
          // Same voice as physical speaker
          this._speakHaTtsUrl(text, cfg);
          return;
        }
        this._hass.callService('tts', 'speak', {
          entity_id,
          media_player_entity_id: mp,
          message: text,
          cache: cfg.cache !== false,
          ...(cfg.options ? cfg.options : {}),
        });
      } else {
        // Old style: tts.google_translate_say, tts.cloud_say, ...
        // entity_id is the media_player
        this._hass.callService(domain, svc, {
          entity_id,
          message: text,
          ...(cfg.lang    ? { language: cfg.lang } : {}),
          ...(cfg.options ? cfg.options            : {}),
        });
      }
    } catch(e) {
      console.warn('[NepTTS] callService error:', e);
    }
  }

  // ── Dispatcher: speak text using configured engine ──────────
  _speakBubble(overrideText) {
    const cfg = this._getTtsCfg();
    if (cfg.engine === 'none') return;

    // Get text from current bubble or override
    let text = overrideText || '';
    if (!text) {
      const b = this._shadow?.getElementById('nep-bubble');
      text = b ? (b.innerText || b.textContent || '') : '';
    }
    text = this._cleanTtsText(text);
    if (!text || text.length < 2) return;

    switch (cfg.engine) {
      case 'webspeech':
        this._speakWebSpeech(text, cfg);
        break;
      case 'google_translate':
        this._speakGoogleTranslate(text, cfg);
        break;
      case 'ha_service':
        this._speakHaService(text, cfg);
        break;
      default:
        // fallback: try Web Speech
        this._speakWebSpeech(text, cfg);
    }
  }

  // Entry point: called when audio should play (character click, 💬 button, bubble appears)
  // Auto-select: sound file if model has one, TTS otherwise
  _playAudio(overrideText) {
    if (!this._audioEnabled) return;
    const m = MODELS[this._modelIdx];
    if (m.hasSound && this._modelSounds.length > 0) {
      this._playModelSound();
    } else {
      this._speakBubble(overrideText);
    }
  }

  // Stop all audio
  _stopAudio() {
    if (this._audio) { this._audio.pause(); this._audio = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // ── Pin: show small overlay on top of all dashboards, original card still visible ────
  _togglePin() {
    if (this._pinned) this._exitPin();
    else              this._enterPin();
  }

  _enterPin() {
    if (this._pinned) return;
    this._pinned = true;
    try { localStorage.setItem('nep_pinned', '1'); } catch(e){}
    // Update button in card
    const btn = this._shadow.getElementById('btnPin');
    if (btn) { btn.textContent = _t(this._config, 'pinActive'); btn.classList.add('green'); }
    this._buildPinOverlay();
    // MutationObserver: auto re-inject if overlay is removed on navigation
    if (!this._pinObserver) {
      this._pinObserver = new MutationObserver(() => {
        if (this._pinned && !document.getElementById('nep-pin-overlay')) {
          this._buildPinOverlay();
        }
      });
      this._pinObserver.observe(document.body, { childList: true, subtree: false });
    }
  }

  _exitPin() {
    if (!this._pinned) return;
    this._pinned = false;
    try { localStorage.removeItem('nep_pinned'); } catch(e){}
    const btn = this._shadow.getElementById('btnPin');
    if (btn) { btn.textContent = _t(this._config, 'pinInactive'); btn.classList.remove('green'); }
    if (this._pinObserver) { this._pinObserver.disconnect(); this._pinObserver = null; }
    this._teardownPin();
  }

  _teardownPin() {
    if (this._pinEl) { this._pinEl.remove(); this._pinEl = null; }
    if (this._pinMouseMove) {
      document.removeEventListener('mousemove', this._pinMouseMove);
      this._pinMouseMove = null;
    }
    if (this._pinChatInterval) { clearInterval(this._pinChatInterval); this._pinChatInterval = null; }
    this._pinChatShow = null;
  }

  _rebuildPin() {
    if (!this._pinned) return;
    this._teardownPin();
    this._buildPinOverlay();
  }

  _buildPinOverlay() {
    // Inject CSS if not already present
    if (!document.getElementById('_nep_float_css')) {
      const st = document.createElement('style'); st.id = '_nep_float_css';
      st.textContent = FLOAT_CSS; document.head.appendChild(st);
    }
    const fh = this._config.float_height || 650;
    const fw = this._config.float_width  || 400;
    const el = document.createElement('div');
    el.id = 'nep-pin-overlay';
    el.innerHTML = `
      <div id="nep-pin-controls">
        <button class="nep-pin-btn" id="_nep_pbtn_switchprev">◀</button>
        <button class="nep-pin-btn" id="_nep_pbtn_switchnext">▶</button>
        <button class="nep-pin-btn unpin" id="_nep_pbtn_unpin">${_t(this._config, 'pinActive')}</button>
      </div>
      <div id="nep-pin-char">
        <div id="_nep_pin_chat"><div id="_nep_pin_chat_inner"></div></div>
        <iframe id="_nep_pin_frame" width="${fw}" height="${fh}"
          scrolling="no" allowtransparency="true"
          style="border:none;background:transparent;display:block;pointer-events:none;"></iframe>
      </div>`;
    document.body.appendChild(el);
    this._pinEl = el;

    const ff = document.getElementById('_nep_pin_frame');
    this._loadIntoFrame(ff, this._modelIdx, fw, fh, true);

    document.getElementById('_nep_pbtn_unpin').onclick  = () => this._exitPin();
    document.getElementById('_nep_pbtn_switchprev').onclick = () => this._switchModelPrev();
    document.getElementById('_nep_pbtn_switchnext').onclick = () => this._switchModel();

    const charDiv = document.getElementById('nep-pin-char');
    charDiv.addEventListener('click', () => {
      const inner = document.getElementById('_nep_pin_chat_inner');
      const wrap  = document.getElementById('_nep_pin_chat');
      if (!inner || !wrap) return;
      const msg = this._rand(_t(this._config, 'pinClickTips', this._cn()));
      wrap.classList.remove('show');
      setTimeout(() => { inner.innerHTML = msg; wrap.classList.add('show'); }, 160);
    });

    // Eye tracking
    this._pinMouseMove = (e) => {
      const f = document.getElementById('_nep_pin_frame');
      if (!f) return;
      const rect = f.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      try { f.contentWindow.postMessage({ type: 'nepEye', px, py }, '*'); } catch(err) {}
    };
    document.addEventListener('mousemove', this._pinMouseMove);

    // Chat bubble rotation
    this._pinChatShow = (msg) => {
      const wrap  = document.getElementById('_nep_pin_chat');
      const inner = document.getElementById('_nep_pin_chat_inner');
      if (!wrap || !inner) return;
      wrap.classList.remove('show');
      setTimeout(() => { inner.innerHTML = msg; wrap.classList.add('show'); }, 160);
    };
    setTimeout(() => {
      const msgs = this._buildStatusMessages();
      this._pinChatMsgs = msgs; this._pinChatIdx = 0;
      this._pinChatShow(msgs[0]);
    }, 1000);
    this._pinChatInterval = setInterval(() => {
      if (!this._pinned) return;
      const msgs = this._pinChatMsgs || this._buildStatusMessages();
      this._pinChatIdx = ((this._pinChatIdx || 0) + 1) % msgs.length;
      this._pinChatShow(msgs[this._pinChatIdx]);
    }, 5000);
  }

  // fix: when card is re-attached to DOM (navigating back to dashboard) → re-inject overlay
  connectedCallback() {
    if (this._floating) {
      setTimeout(() => this._rebuildFloat(), 300);
    }
    // Pinned overlay is self-maintained via MutationObserver, but rebuild if missing
    if (this._pinned && !document.getElementById('nep-pin-overlay')) {
      setTimeout(() => this._rebuildPin(), 300);
    }
  }

  // Re-inject float overlay without resetting state
  _rebuildFloat() {
    if (!this._floating) return;
    // Clean up old overlay if still present
    const old = document.getElementById('nep-float-overlay');
    if (old) old.remove();
    if (this._floatMouseMove) {
      document.removeEventListener('mousemove', this._floatMouseMove);
      this._floatMouseMove = null;
    }
    if (this._floatChatInterval) {
      clearInterval(this._floatChatInterval);
      this._floatChatInterval = null;
    }
    // Hide card (may be reset when HA re-renders)
    const card = this._shadow.querySelector('.nep-card');
    if (card) card.style.display = 'none';
    // Inject CSS if missing
    if (!document.getElementById('_nep_float_css')) {
      const st = document.createElement('style');
      st.id = '_nep_float_css';
      st.textContent = FLOAT_CSS;
      document.head.appendChild(st);
    }
    const fh = this._config.float_height || 650;
    const fw = this._config.float_width  || 400;
    const el = document.createElement('div');
    el.id = 'nep-float-overlay';
    el.innerHTML = `
      <div id="_nep_float_bubble"></div>
      <div id="nep-float-controls">
        <button class="nep-fbtn" id="_nep_fbtn_switchprev">◀</button>
        <button class="nep-fbtn" id="_nep_fbtn_switchnext">▶</button>
        <button class="nep-fbtn" id="_nep_fbtn_quote">💬</button>
        <button class="nep-fbtn restore" id="_nep_fbtn_restore">${_t(this._config, 'floatRestore')}</button>
      </div>
      <div id="nep-float-char">
        <div id="_nep_float_chat"><div id="_nep_float_chat_inner"></div></div>
        <iframe id="_nep_float_frame" width="${fw}" height="${fh}"
          scrolling="no" allowtransparency="true"
          style="border:none;background:transparent;display:block;pointer-events:none;"></iframe>
      </div>`;
    document.body.appendChild(el);
    this._floatEl = el;
    const ff = document.getElementById('_nep_float_frame');
    this._loadIntoFrame(ff, this._modelIdx, fw, fh, true);
    document.getElementById('_nep_fbtn_restore').onclick = () => this._exitFloating();
    document.getElementById('_nep_fbtn_switchprev').onclick = () => this._switchModelPrev();
    document.getElementById('_nep_fbtn_switchnext').onclick = () => this._switchModel();
    document.getElementById('_nep_fbtn_quote').onclick   = () => {
      this._floatTip(this._rand(_t(this._config, 'floatTips', this._cn())), 4000);
    };
    const charDiv = document.getElementById('nep-float-char');
    charDiv.addEventListener('click', () => {
      this._floatTip(this._rand(_t(this._config, 'floatCharTips', this._cn())), 3000);
    });
    charDiv.addEventListener('dblclick', () => this._exitFloating());
    // Eye tracking
    this._floatMouseMove = (e) => {
      const ff2 = document.getElementById('_nep_float_frame');
      if (!ff2) return;
      const rect = ff2.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      try { ff2.contentWindow.postMessage({ type: 'nepEye', px, py }, '*'); } catch(err) {}
    };
    document.addEventListener('mousemove', this._floatMouseMove);
    // Float chat bubble
    this._floatChatShow = (msg) => {
      const wrap  = document.getElementById('_nep_float_chat');
      const inner = document.getElementById('_nep_float_chat_inner');
      if (!wrap || !inner) return;
      wrap.classList.remove('show');
      setTimeout(() => { inner.innerHTML = msg; wrap.classList.add('show'); }, 160);
    };
    setTimeout(() => {
      const msgs = this._buildStatusMessages();
      this._floatChatMsgs = msgs;
      this._floatChatIdx  = 0;
      this._floatChatShow(msgs[0]);
    }, 1000);
    this._floatChatInterval = setInterval(() => {
      if (!this._floating) return;
      const msgs = this._floatChatMsgs || this._buildStatusMessages();
      this._floatChatIdx = ((this._floatChatIdx || 0) + 1) % msgs.length;
      this._floatChatShow(msgs[this._floatChatIdx]);
    }, 5000);
  }

  // fix: clean up when card is removed from DOM (navigating away from dashboard)
  // KEEP this._floating intact so connectedCallback knows to rebuild
  disconnectedCallback() {
    this._stopAudio();
    if (this._msgListener) {
      window.removeEventListener('message', this._msgListener);
      this._msgListener = null;
    }
    if (this._idleInterval)   { clearInterval(this._idleInterval);   this._idleInterval   = null; }
    if (this._statusInterval) { clearInterval(this._statusInterval); this._statusInterval = null; }
    if (this._floatChatInterval) { clearInterval(this._floatChatInterval); this._floatChatInterval = null; }
    if (this._floatMouseMove) {
      document.removeEventListener('mousemove', this._floatMouseMove);
      this._floatMouseMove = null;
    }
    // Remove overlay from DOM but KEEP this._floating = true
    // so connectedCallback can rebuild when returning
    if (this._floatEl) { this._floatEl.remove(); this._floatEl = null; }
    // Pin: teardown but keep _pinned=true; MutationObserver will rebuild when body is ready
    if (this._pinMouseMove) {
      document.removeEventListener('mousemove', this._pinMouseMove);
      this._pinMouseMove = null;
    }
    if (this._pinChatInterval) { clearInterval(this._pinChatInterval); this._pinChatInterval = null; }
    if (this._pinEl) { this._pinEl.remove(); this._pinEl = null; }
  }
}

if (!customElements.get('live-desk')) customElements.define('live-desk', LiveDesk);

// ═══════════════════════════════════════════════════════════════
// LIVE DESK — VISUAL EDITOR
// ═══════════════════════════════════════════════════════════════
class LiveDeskEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass   = null;
    // accordion open states
    this._open = { general: true, appearance: false, sensors: false, alerts: false, devices: false, tts: false };
  }

  set hass(h) { this._hass = h; this._syncPickers(); }
  setConfig(c) { this._config = { ...c }; this._render(); }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true
    }));
  }

  _toggle(id) {
    this._open[id] = !this._open[id];
    const body  = this.shadowRoot.getElementById('body-' + id);
    const arrow = this.shadowRoot.getElementById('arrow-' + id);
    if (body) {
      body.style.display = this._open[id] ? 'block' : 'none';
      if (arrow) arrow.textContent = this._open[id] ? '▾' : '▸';
      if (this._open[id]) this._syncPickers();
    }
  }

  _syncPickers() {
    if (!this._hass || !this.shadowRoot) return;
    const apply = () => {
      this.shadowRoot.querySelectorAll('ha-entity-picker[data-key]').forEach(p => {
        p.hass = this._hass;
        const domain = p.dataset.domain;
        if (domain) p.includeDomains = [domain];
        const key = p.dataset.key;
        const saved = this._config[key] || '';
        if (saved && p.value !== saved) { p.value = saved; p.setAttribute('value', saved); }
      });
      // entities array pickers
      this.shadowRoot.querySelectorAll('ha-entity-picker[data-ei]').forEach(p => {
        p.hass = this._hass;
        const idx  = parseInt(p.dataset.ei);
        const list = this._config.entities || [];
        const ent  = (list[idx] && list[idx].entity) || '';
        if (ent && p.value !== ent) { p.value = ent; p.setAttribute('value', ent); }
      });
    };
    apply();
    requestAnimationFrame(() => requestAnimationFrame(apply));
  }

  // ── char nickname used in dialogue ──────────────────────────
  _getCharNickname(modelName) {
    const map = {
      'Neptune 💜': 'Nep',
      'Neptune Sailor ⚓': 'Nep',
      'Neptune Santa 🎅': 'Nep',
      'Vert 💚':    'Vert',
      'Vert Classic 🌿': 'Vert',
      'Koharu 🌸':  'Koharu',
      'Shizuku ❄️': 'Shizuku',
      'Noire 🖤':   'Noire',
      'Uni 🩷':     'Uni',
      'Blanc 📖':   'Blanc',
      'Tia 🧪':      'Tia',
      'HK416 Normal 🎯':    'HK416',
      'HK416 Destroy 💥':   'HK416',
      'UMP45 🔫':           'UMP45',
      'M4A1 🛡️':           'M4A1',
      'SOPMOD-II 🔥':       'SOPMOD',
      'WA2000 Destroy 🌹':  'WA2000',
    };
    return map[modelName] || 'Nep';
  }

  _render() {
    const cfg    = this._config;
    const lang   = _getLang(cfg);
    const t      = (k, ...a) => _t(cfg, k, ...a);
    const blur   = cfg.card_blur !== undefined ? cfg.card_blur : 0;
    const ttsEng = (cfg.tts && cfg.tts.engine) || 'webspeech';
    const ttsLang  = (cfg.tts && cfg.tts.lang)  || 'vi-VN';
    const ttsRate  = (cfg.tts && cfg.tts.rate)  || 1.05;
    const ttsPitch = (cfg.tts && cfg.tts.pitch) || 1.2;
    const ttsSvc   = (cfg.tts && cfg.tts.service)   || '';
    const ttsEnt   = (cfg.tts && cfg.tts.entity_id) || '';
    const ttsMp    = (cfg.tts && (cfg.tts.media_player_entity_id || cfg.tts.media_player)) || '';
    const entities = cfg.entities || [];
    const entCount = Math.max(1, Math.min(12, parseInt(cfg._ent_count || entities.length || 3)));

    // Current model nickname for TTS hint
    const curModel = MODELS[0];
    const curNick  = this._getCharNickname(curModel.name);

    this.shadowRoot.innerHTML = `<style>
      :host{display:block;padding:4px 0}
      *{box-sizing:border-box}
      .acc-wrap{border:1px solid var(--divider-color);border-radius:10px;margin-bottom:8px;overflow:hidden}
      .acc-head{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer;background:var(--secondary-background-color);font-size:13px;font-weight:700;color:var(--primary-text-color);user-select:none;transition:background .15s}
      .acc-head:hover{background:var(--table-row-background-color,rgba(0,0,0,.04))}
      .acc-arrow{font-size:14px;color:var(--secondary-text-color);transition:transform .2s}
      .acc-body{padding:12px 14px;border-top:1px solid var(--divider-color);background:var(--card-background-color,#fff)}
      .row{display:flex;flex-direction:column;margin-bottom:12px}
      .row:last-child{margin-bottom:0}
      .row label{font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;font-weight:600}
      ha-entity-picker{display:block;width:100%}
      input[type=text]{background:var(--input-fill-color,rgba(0,0,0,.04));border:1px solid var(--divider-color,#e0e0e0);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--primary-text-color);font-family:inherit;width:100%}
      input[type=number]{background:var(--input-fill-color,rgba(0,0,0,.04));border:1px solid var(--divider-color,#e0e0e0);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--primary-text-color);font-family:monospace;width:100%}
      .sl-row{display:flex;align-items:center;gap:10px;margin-bottom:12px}
      .sl-row label{font-size:12px;font-weight:600;color:var(--secondary-text-color);min-width:130px}
      .sl-row input[type=range]{flex:1;accent-color:var(--primary-color)}
      .slv{font-size:12px;font-weight:700;color:var(--primary-color);min-width:38px;text-align:right}
      .toggle-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
      .toggle-row label.tl{font-size:12px;font-weight:600;color:var(--secondary-text-color)}
      .tog{position:relative;width:44px;height:24px;flex-shrink:0}
      .tog input{opacity:0;width:0;height:0}
      .tog-sl{position:absolute;inset:0;background:var(--divider-color);border-radius:12px;cursor:pointer;transition:.3s}
      .tog-sl::before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s}
      input:checked+.tog-sl{background:var(--primary-color)}
      input:checked+.tog-sl::before{transform:translateX(20px)}
      .bg{display:flex;gap:6px;flex-wrap:wrap}
      .ob{flex:1;min-width:60px;padding:8px 6px;border-radius:8px;border:1.5px solid var(--divider-color);background:var(--secondary-background-color);cursor:pointer;text-align:center;font-size:12px;color:var(--primary-text-color);transition:all .2s;user-select:none}
      .ob.on{border-color:var(--primary-color);background:rgba(3,169,244,.12);color:var(--primary-color);font-weight:700}
      .ob:hover{background:rgba(3,169,244,.06)}
      .sec-opts{background:var(--secondary-background-color);border-radius:8px;padding:10px 12px;margin-bottom:12px;border:1px solid var(--divider-color)}
      .hint{font-size:11px;color:var(--secondary-text-color);margin-top:4px;line-height:1.55}
      .ent-card{background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:10px;padding:10px 12px;margin-bottom:10px}
      .ent-card-title{font-size:12px;font-weight:700;color:var(--primary-color);margin-bottom:8px}
      .badge{background:var(--primary-color);color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:8px}

      .tts-section{display:none}
      .tts-section.show{display:block}
      .divider{height:1px;background:var(--divider-color);margin:10px 0}
      .tag{display:inline-block;background:rgba(3,169,244,.12);color:var(--primary-color);border-radius:6px;padding:2px 8px;font-size:10.5px;font-weight:700;margin-bottom:6px}
    </style>

    <!-- HEADER -->
    <div style="text-align:center;padding:12px 14px 4px;font-size:11px;color:var(--secondary-text-color);line-height:1.7;">
      💜 <strong style="color:var(--primary-color)">LiveDesk v1.0.2</strong> — Live2D Waifu Dashboard<br/>
      Designed by <strong style="color:var(--primary-color)">@doanlong1412</strong> from 🇻🇳 Vietnam
    </div>

    <!-- Language switcher -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px 4px;gap:8px">
      <span style="font-size:12px;font-weight:600;color:var(--secondary-text-color)">${t('lblInterfaceLang')}</span>
      <div class="bg" style="gap:4px">
        <div class="ob ${lang === 'vi' ? 'on' : ''}" id="langVI" style="min-width:80px">🇻🇳 Tiếng Việt</div>
        <div class="ob ${lang === 'en' ? 'on' : ''}" id="langEN" style="min-width:80px">🇬🇧 English</div>
      </div>
    </div>

    <!-- ══ GENERAL ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-general">
        <span>${t('secGeneral')}</span>
        <span class="acc-arrow" id="arrow-general">${this._open.general ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-general" style="display:${this._open.general ? 'block' : 'none'}">

        <!-- Owner name -->
        <div class="row">
          <label>${t('lblOwnerName')} <span style="color:var(--secondary-text-color);font-weight:400">${t('lblOwnerNameHint')}</span></label>
          <input type="text" id="ownerName" placeholder="${t('lblOwnerNamePlaceholder')}" value="${cfg.name || ''}"/>
          <div class="hint">${t('lblOwnerNameEmpty')}</div>
        </div>

        <!-- Custom nickname override -->
        <div class="row">
          <label>${t('lblCharNick')} <span style="color:var(--secondary-text-color);font-weight:400">${t('lblCharNickHint')}</span></label>
          <input type="text" id="charNickname" placeholder="${t('lblCharNickPlaceholder')}" value="${cfg.char_nickname || ''}"/>
          <div class="hint">${t('lblCharNickEmpty', curNick)}</div>
        </div>

        <!-- Card size -->
        <div class="sl-row">
          <label>${t('lblCardHeight')}</label>
          <input type="range" id="heightSl" min="300" max="700" step="20" value="${cfg.height || 440}"/>
          <span class="slv" id="heightV">${cfg.height || 440}px</span>
        </div>

      </div>
    </div>

    <!-- ══ APPEARANCE ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-appearance">
        <span>${t('secAppear')}</span>
        <span class="acc-arrow" id="arrow-appearance">${this._open.appearance ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-appearance" style="display:${this._open.appearance ? 'block' : 'none'}">

        <!-- Blur slider -->
        <div class="sl-row">
          <label>${t('lblBlur')}</label>
          <input type="range" id="blurSl" min="0" max="30" step="1" value="${blur}"/>
          <span class="slv" id="blurV">${blur}px</span>
        </div>
        <div class="hint" style="margin-top:-8px;margin-bottom:12px">${t('lblBlurHint')}</div>

        <!-- Float size -->
        <div class="divider"></div>
        <div class="tag">${t('lblMiniMode')}</div>
        <div class="sl-row">
          <label>${t('lblFloatH')}</label>
          <input type="range" id="floatHSl" min="300" max="900" step="20" value="${cfg.float_height || 650}"/>
          <span class="slv" id="floatHV">${cfg.float_height || 650}px</span>
        </div>
        <div class="sl-row">
          <label>${t('lblFloatW')}</label>
          <input type="range" id="floatWSl" min="200" max="600" step="20" value="${cfg.float_width || 400}"/>
          <span class="slv" id="floatWV">${cfg.float_width || 400}px</span>
        </div>

      </div>
    </div>

    <!-- ══ SENSORS ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-sensors">
        <span>${t('secSensors')}
          ${[cfg.temp_sensor, cfg.humid_sensor, cfg.weather_entity].filter(Boolean).length > 0
            ? `<span class="badge">${[cfg.temp_sensor, cfg.humid_sensor, cfg.weather_entity].filter(Boolean).length}/3</span>`
            : ''}
        </span>
        <span class="acc-arrow" id="arrow-sensors">${this._open.sensors ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-sensors" style="display:${this._open.sensors ? 'block' : 'none'}">
        <div class="hint" style="margin-bottom:12px">${t('lblSensorsHint')}</div>

        <div class="row">
          <label>${t('lblTempSensor')}</label>
          <ha-entity-picker data-key="temp_sensor" data-domain="sensor" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="row">
          <label>${t('lblHumidSensor')}</label>
          <ha-entity-picker data-key="humid_sensor" data-domain="sensor" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="row">
          <label>${t('lblWeatherEnt')}</label>
          <ha-entity-picker data-key="weather_entity" data-domain="weather" allow-custom-entity></ha-entity-picker>
        </div>

      </div>
    </div>

    <!-- ══ ALERTS ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-alerts">
        <span>${t('secAlerts')}
          ${[cfg.motion_sensor, cfg.door_sensor, cfg.smoke_sensor].filter(Boolean).length > 0
            ? `<span class="badge">${[cfg.motion_sensor, cfg.door_sensor, cfg.smoke_sensor].filter(Boolean).length}/3</span>`
            : ''}
        </span>
        <span class="acc-arrow" id="arrow-alerts">${this._open.alerts ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-alerts" style="display:${this._open.alerts ? 'block' : 'none'}">
        <div class="hint" style="margin-bottom:12px">${t('lblAlertsHint')}</div>

        <div class="toggle-row" style="margin-bottom:14px">
          <div>
            <label class="tl">${t('lblAlertTts')}</label>
            <div class="hint" style="margin-top:2px">${t('lblAlertTtsHint')}</div>
          </div>
          <label class="tog">
            <input type="checkbox" id="alertTtsToggle" ${cfg.alert_tts_enabled !== false ? 'checked' : ''}/>
            <span class="tog-sl"></span>
          </label>
        </div>

        <div class="row">
          <label>${t('lblMotionSensor')}</label>
          <ha-entity-picker data-key="motion_sensor" data-domain="binary_sensor" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="row">
          <label>${t('lblDoorSensor')}</label>
          <ha-entity-picker data-key="door_sensor" data-domain="binary_sensor" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="row">
          <label>${t('lblSmokeSensor')}</label>
          <ha-entity-picker data-key="smoke_sensor" data-domain="binary_sensor" allow-custom-entity></ha-entity-picker>
        </div>

      </div>
    </div>

    <!-- ══ DEVICES / ENTITIES ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-devices">
        <span>${t('secDevices')}
          ${entities.length > 0 ? `<span class="badge">${entities.length}</span>` : ''}
        </span>
        <span class="acc-arrow" id="arrow-devices">${this._open.devices ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-devices" style="display:${this._open.devices ? 'block' : 'none'}">
        <div class="toggle-row" style="margin-bottom:10px">
          <div>
            <label class="tl">${t('lblToolbarEnable')}</label>
            <div class="hint" style="margin-top:2px">${t('lblToolbarEnableHint')}</div>
          </div>
          <label class="tog">
            <input type="checkbox" id="toolbarEnabledToggle" ${cfg.toolbar_enabled ? 'checked' : ''}/>
            <span class="tog-sl"></span>
          </label>
        </div>

        <div id="toolbarEntityControls" style="display:${cfg.toolbar_enabled ? 'block' : 'none'}">
        <div class="hint" style="margin-bottom:12px">${t('lblDevicesHint')}</div>

        <div class="sl-row" style="margin-bottom:14px">
          <label style="font-size:12px;font-weight:600;color:var(--secondary-text-color);min-width:130px">${t('lblDeviceCount')}</label>
          <input type="range" id="entCountSl" min="1" max="12" step="1" value="${entCount}"/>
          <span class="slv" id="entCountV">${entCount}</span>
        </div>

        <div id="entList">
          ${Array.from({ length: entCount }, (_, i) => {
            const item = entities[i] || {};
            return `<div class="ent-card">
              <div class="ent-card-title">${t('lblDeviceN', i)}</div>
              <div class="row">
                <label>${t('lblEntity')}</label>
                <ha-entity-picker data-ei="${i}" allow-custom-entity></ha-entity-picker>
              </div>
              <div class="row" style="margin-bottom:0">
                <label>${t('lblDisplayName')} <span style="font-weight:400;opacity:.7">${t('lblDisplayNameHint')}</span></label>
                <input type="text" class="ent-name" data-ei="${i}" placeholder="${t('lblDisplayNamePlaceholder')}" value="${item.name || ''}"/>
              </div>
            </div>`;
          }).join('')}
        </div>

        </div><!-- /toolbarEntityControls -->

      </div>
    </div>

    <!-- ══ TTS ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-tts">
        <span>${t('secTTS')}</span>
        <span class="acc-arrow" id="arrow-tts">${this._open.tts ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-tts" style="display:${this._open.tts ? 'block' : 'none'}">

        <div class="row" style="margin-bottom:14px">
          <label>${t('lblTTSEngine')}</label>
          <div class="bg" id="ttsEngGrid">
            <div class="ob ${ttsEng === 'webspeech' ? 'on' : ''}"       data-eng="webspeech">${t('engWebSpeech')}</div>
            <div class="ob ${ttsEng === 'google_translate' ? 'on' : ''}" data-eng="google_translate">${t('engGoogle')}</div>
            <div class="ob ${ttsEng === 'ha_service' ? 'on' : ''}"       data-eng="ha_service">${t('engHA')}</div>
            <div class="ob ${ttsEng === 'none' ? 'on' : ''}"             data-eng="none">${t('engNone')}</div>
          </div>
        </div>

        <!-- WebSpeech options -->
        <div class="tts-section ${ttsEng === 'webspeech' ? 'show' : ''}" id="tts-webspeech">
          <div class="sec-opts">
            <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">🗣️ WEB SPEECH API</div>
            <div class="sl-row">
              <label>${t('lblWSLang')}</label>
              <div class="bg" style="flex:1">
                ${[['vi-VN','🇻🇳 VI'],['en-US','🇺🇸 EN'],['ja-JP','🇯🇵 JP'],['zh-CN','🇨🇳 ZH']].map(
                  ([v,l]) => `<div class="ob ${ttsLang === v ? 'on' : ''}" data-tts-lang="${v}">${l}</div>`
                ).join('')}
              </div>
            </div>
            <div class="sl-row">
              <label>${t('lblWSRate')}</label>
              <input type="range" id="ttsRateSl" min="0.5" max="2.0" step="0.05" value="${ttsRate}"/>
              <span class="slv" id="ttsRateV">${parseFloat(ttsRate).toFixed(2)}</span>
            </div>
            <div class="sl-row" style="margin-bottom:0">
              <label>${t('lblWSPitch')}</label>
              <input type="range" id="ttsPitchSl" min="0" max="2" step="0.1" value="${ttsPitch}"/>
              <span class="slv" id="ttsPitchV">${parseFloat(ttsPitch).toFixed(1)}</span>
            </div>
          </div>
        </div>

        <!-- Google Translate options -->
        <div class="tts-section ${ttsEng === 'google_translate' ? 'show' : ''}" id="tts-google_translate">
          <div class="sec-opts">
            <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">${t('lblGTTitle')}</div>
            <div class="hint" style="margin-bottom:8px">${t('lblGTHint')}</div>
            <div class="row" style="margin-bottom:0">
              <label>${t('lblGTLang')}</label>
              <div class="bg">
                ${[['vi','🇻🇳 vi'],['en','🇺🇸 en'],['ja','🇯🇵 ja'],['zh-CN','🇨🇳 zh']].map(
                  ([v,l]) => `<div class="ob ${(cfg.tts && cfg.tts.lang) === v ? 'on' : ''}" data-tts-lang="${v}">${l}</div>`
                ).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- HA Service options -->
        <div class="tts-section ${ttsEng === 'ha_service' ? 'show' : ''}" id="tts-ha_service">
          <div class="sec-opts">
            <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">${t('lblHATitle')}</div>
            <div class="row">
              <label>${t('lblHAService')} <span style="font-weight:400;opacity:.7">${t('lblHAServiceHint')}</span></label>
              <input type="text" id="ttsSvcInput" placeholder="tts.speak" value="${ttsSvc}"/>
            </div>
            <div class="row">
              <label>${t('lblHAEntityId')} <span style="font-weight:400;opacity:.7">${t('lblHAEntityHint')}</span></label>
              <ha-entity-picker id="ttsEntityPicker" allow-custom-entity></ha-entity-picker>
            </div>
            <div class="row" style="margin-bottom:0">
              <label>${t('lblHAMedia')} <span style="font-weight:400;opacity:.7">${t('lblHAMediaHint')}</span></label>
              <ha-entity-picker id="ttsMpPicker" data-domain="media_player" allow-custom-entity></ha-entity-picker>
            </div>
            <div class="hint" style="margin-top:8px">${t('lblHANoMedia')}</div>
          </div>
        </div>

        <!-- None state -->
        <div class="tts-section ${ttsEng === 'none' ? 'show' : ''}" id="tts-none">
          <div class="hint" style="padding:8px 0">${t('lblNoneHint')}</div>
        </div>

      </div>
    </div>

    <!-- YAML preview hint -->
    <div style="margin:8px 14px 4px;padding:10px 12px;background:var(--secondary-background-color);border-radius:8px;border:1px solid var(--divider-color);font-size:11px;color:var(--secondary-text-color);line-height:1.6">
      ${t('lblTip')}
    </div>`;

    // ── Accordion toggles ────────────────────────────────────────
    ['general', 'appearance', 'sensors', 'alerts', 'devices', 'tts'].forEach(id => {
      const h = this.shadowRoot.getElementById('head-' + id);
      if (h) h.addEventListener('click', () => this._toggle(id));
    });

    // ── Language switcher ────────────────────────────────────────
    const langVI = this.shadowRoot.getElementById('langVI');
    const langEN = this.shadowRoot.getElementById('langEN');
    if (langVI) langVI.addEventListener('click', () => {
      try { localStorage.setItem('nep_lang', 'vi'); } catch(e){}
      const c = { ...this._config, lang: 'vi' };
      this._config = c; this._fire(); this._render();
    });
    if (langEN) langEN.addEventListener('click', () => {
      try { localStorage.setItem('nep_lang', 'en'); } catch(e){}
      const c = { ...this._config, lang: 'en' };
      this._config = c; this._fire(); this._render();
    });

    // ── Owner name ───────────────────────────────────────────────
    this.shadowRoot.getElementById('ownerName').addEventListener('change', e => {
      const v = e.target.value.trim();
      const c = { ...this._config };
      if (v) c.name = v; else delete c.name;
      this._config = c; this._fire();
    });

    // ── Char nickname ────────────────────────────────────────────
    this.shadowRoot.getElementById('charNickname').addEventListener('change', e => {
      const v = e.target.value.trim();
      const c = { ...this._config };
      if (v) c.char_nickname = v; else delete c.char_nickname;
      this._config = c; this._fire();
    });



    // ── Height slider ────────────────────────────────────────────
    const heightSl = this.shadowRoot.getElementById('heightSl');
    const heightV  = this.shadowRoot.getElementById('heightV');
    heightSl.addEventListener('input',  e => heightV.textContent = e.target.value + 'px');
    heightSl.addEventListener('change', e => { this._config = { ...this._config, height: parseInt(e.target.value) }; this._fire(); });

    // ── Blur slider ──────────────────────────────────────────────
    const blurSl = this.shadowRoot.getElementById('blurSl');
    const blurV  = this.shadowRoot.getElementById('blurV');
    blurSl.addEventListener('input',  e => blurV.textContent = e.target.value + 'px');
    blurSl.addEventListener('change', e => { this._config = { ...this._config, card_blur: parseInt(e.target.value) }; this._fire(); });

    // ── Float height/width ───────────────────────────────────────
    const floatHSl = this.shadowRoot.getElementById('floatHSl');
    const floatHV  = this.shadowRoot.getElementById('floatHV');
    floatHSl.addEventListener('input',  e => floatHV.textContent = e.target.value + 'px');
    floatHSl.addEventListener('change', e => { this._config = { ...this._config, float_height: parseInt(e.target.value) }; this._fire(); });
    const floatWSl = this.shadowRoot.getElementById('floatWSl');
    const floatWV  = this.shadowRoot.getElementById('floatWV');
    floatWSl.addEventListener('input',  e => floatWV.textContent = e.target.value + 'px');
    floatWSl.addEventListener('change', e => { this._config = { ...this._config, float_width: parseInt(e.target.value) }; this._fire(); });

    // ── Toolbar enabled toggle ───────────────────────────────────
    const toolbarToggle = this.shadowRoot.getElementById('toolbarEnabledToggle');
    if (toolbarToggle) {
      toolbarToggle.addEventListener('change', e => {
        const enabled = e.target.checked;
        this._config = { ...this._config, toolbar_enabled: enabled };
        this._fire();
        const controls = this.shadowRoot.getElementById('toolbarEntityControls');
        if (controls) controls.style.display = enabled ? 'block' : 'none';
      });
    }

    // ── Alert TTS toggle ─────────────────────────────────────────
    const alertTtsToggle = this.shadowRoot.getElementById('alertTtsToggle');
    if (alertTtsToggle) {
      alertTtsToggle.addEventListener('change', e => {
        this._config = { ...this._config, alert_tts_enabled: e.target.checked };
        this._fire();
      });
    }

    // ── Entity count slider ──────────────────────────────────────
    const entCountSl = this.shadowRoot.getElementById('entCountSl');
    const entCountV  = this.shadowRoot.getElementById('entCountV');
    if (entCountSl) {
      entCountSl.addEventListener('input', e => entCountV.textContent = e.target.value);
      entCountSl.addEventListener('change', e => {
        this._config = { ...this._config, _ent_count: parseInt(e.target.value) };
        this._fire(); this._render();
        requestAnimationFrame(() => this._syncPickers());
      });
    }

    // ── Entity name inputs ───────────────────────────────────────
    this.shadowRoot.querySelectorAll('.ent-name').forEach(inp => {
      inp.addEventListener('change', e => {
        const idx  = parseInt(e.target.dataset.ei);
        const c    = { ...this._config };
        const list = [...(c.entities || [])];
        while (list.length <= idx) list.push({});
        list[idx] = { ...list[idx], name: e.target.value.trim() };
        if (!list[idx].name) delete list[idx].name;
        c.entities = list.filter(x => x.entity || x.name);
        this._config = c; this._fire();
      });
    });

    // ── TTS engine buttons ───────────────────────────────────────
    this.shadowRoot.querySelectorAll('[data-eng]').forEach(btn => {
      btn.addEventListener('click', () => {
        const eng = btn.dataset.eng;
        const tts = { ...(this._config.tts || {}), engine: eng };
        this._config = { ...this._config, tts };
        this._fire();
        // toggle panels without full re-render
        ['webspeech', 'google_translate', 'ha_service', 'none'].forEach(e => {
          const sec = this.shadowRoot.getElementById('tts-' + e);
          if (sec) sec.classList.toggle('show', e === eng);
        });
        this.shadowRoot.querySelectorAll('[data-eng]').forEach(b => b.classList.toggle('on', b.dataset.eng === eng));
      });
    });

    // ── TTS lang buttons (shared across webspeech & google_translate) ─
    this.shadowRoot.querySelectorAll('[data-tts-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.ttsLang;
        const tts  = { ...(this._config.tts || {}), lang };
        this._config = { ...this._config, tts };
        this._fire();
        this.shadowRoot.querySelectorAll('[data-tts-lang]').forEach(b => b.classList.toggle('on', b.dataset.ttsLang === lang));
      });
    });

    // ── TTS rate slider ──────────────────────────────────────────
    const ttsRateSl = this.shadowRoot.getElementById('ttsRateSl');
    const ttsRateV  = this.shadowRoot.getElementById('ttsRateV');
    if (ttsRateSl) {
      ttsRateSl.addEventListener('input', e => ttsRateV.textContent = parseFloat(e.target.value).toFixed(2));
      ttsRateSl.addEventListener('change', e => {
        const tts = { ...(this._config.tts || {}), rate: parseFloat(e.target.value) };
        this._config = { ...this._config, tts }; this._fire();
      });
    }

    // ── TTS pitch slider ─────────────────────────────────────────
    const ttsPitchSl = this.shadowRoot.getElementById('ttsPitchSl');
    const ttsPitchV  = this.shadowRoot.getElementById('ttsPitchV');
    if (ttsPitchSl) {
      ttsPitchSl.addEventListener('input', e => ttsPitchV.textContent = parseFloat(e.target.value).toFixed(1));
      ttsPitchSl.addEventListener('change', e => {
        const tts = { ...(this._config.tts || {}), pitch: parseFloat(e.target.value) };
        this._config = { ...this._config, tts }; this._fire();
      });
    }

    // ── TTS service input ────────────────────────────────────────
    const ttsSvcInput = this.shadowRoot.getElementById('ttsSvcInput');
    if (ttsSvcInput) {
      ttsSvcInput.addEventListener('change', e => {
        const tts = { ...(this._config.tts || {}), service: e.target.value.trim() };
        this._config = { ...this._config, tts }; this._fire();
      });
    }

    // ── TTS entity picker (HA Service) ───────────────────────────
    const ttsEP = this.shadowRoot.getElementById('ttsEntityPicker');
    if (ttsEP) {
      if (this._hass) { ttsEP.hass = this._hass; }
      if (ttsEnt) { ttsEP.value = ttsEnt; ttsEP.setAttribute('value', ttsEnt); }
      ttsEP.addEventListener('value-changed', e => {
        const v = e.detail.value || '';
        const tts = { ...(this._config.tts || {}), entity_id: v };
        this._config = { ...this._config, tts }; this._fire();
      });
    }

    // ── TTS media player picker ──────────────────────────────────
    const ttsMpP = this.shadowRoot.getElementById('ttsMpPicker');
    if (ttsMpP) {
      if (this._hass) { ttsMpP.hass = this._hass; ttsMpP.includeDomains = ['media_player']; }
      if (ttsMp) { ttsMpP.value = ttsMp; ttsMpP.setAttribute('value', ttsMp); }
      ttsMpP.addEventListener('value-changed', e => {
        const v = e.detail.value || '';
        const tts = { ...(this._config.tts || {}), media_player_entity_id: v || undefined };
        if (!v) delete tts.media_player_entity_id;
        this._config = { ...this._config, tts }; this._fire();
      });
    }

    // ── Sensor entity pickers ────────────────────────────────────
    this.shadowRoot.querySelectorAll('ha-entity-picker[data-key]').forEach(picker => {
      picker.addEventListener('value-changed', e => {
        const k = picker.dataset.key;
        const v = e.detail.value;
        const c = { ...this._config };
        if (v) c[k] = v; else delete c[k];
        this._config = c; this._fire();
      });
    });

    // ── Devices entity pickers ───────────────────────────────────
    this.shadowRoot.querySelectorAll('ha-entity-picker[data-ei]').forEach(picker => {
      picker.addEventListener('value-changed', e => {
        const idx  = parseInt(picker.dataset.ei);
        const v    = e.detail.value || '';
        const c    = { ...this._config };
        const list = [...(c.entities || [])];
        while (list.length <= idx) list.push({});
        list[idx] = { ...list[idx], entity: v };
        if (!v) { delete list[idx].entity; }
        c.entities = list.filter(x => x.entity || x.name);
        this._config = c; this._fire();
      });
    });

    // ── Sync all pickers after render ────────────────────────────
    this._syncPickers();
  }
}

if (!customElements.get('live-desk-editor')) {
  customElements.define('live-desk-editor', LiveDeskEditor);
}

// ── Hook editor into card ─────────────────────────────────────
// Patch LiveDesk so HA knows there is an editor
LiveDesk.getConfigElement = function() {
  return document.createElement('live-desk-editor');
};
LiveDesk.getStubConfig = function() {
  return {
    type: 'custom:live-desk',
    name: '',
    temp_sensor:    'sensor.temperature',
    humid_sensor:   'sensor.humidity',
    weather_entity: 'weather.home',
  };
};

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'live-desk',
  name: 'LiveDesk',
  description: 'LiveDesk — Live2D waifu dashboard, smart bubbles, flexible TTS',
  preview: true,
});
