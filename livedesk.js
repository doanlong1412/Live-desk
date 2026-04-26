/**
 * livedesk.js  v1.0.2
 * ─ Nền trong suốt, blur nhẹ, bo tròn
 * ─ Xóa sensor bar header
 * ─ Toolbar glass 3D nổi
 * ─ Nhân vật to hơn
 * ─ Bubble ô vuông góc phải, tự đổi mỗi 3s
 * ─ Câu chào theo buổi + nhiệt độ / thời tiết thực
 * ─ Giá trị số luôn là số nguyên (Math.round)
 * ─ TTS linh hoạt: cấu hình qua YAML, hỗ trợ nhiều engine
 *
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
 *     - entity: light.phong_khach
 *       name: Đèn phòng khách   # tuỳ chọn, nếu bỏ sẽ dùng friendly_name từ HA
 *     - entity: fan.phong_ngu
 *     - entity: switch.o_cam_tivi
 */

// ─── Models ──────────────────────────────────────────────────
const MODELS = [
  // hasSound: false → dùng TTS khi không có sound file
  // soundBase: thư mục gốc chứa sound (tự động lấy từ path model nếu không set)
  { name:'Neptune 💜', path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/Neptune/model.json',
    greeting:'Nep Nep đây! 💜',      hasSound:false },
  { name:'Neptune Sailor ⚓', path:'https://cdn.jsdelivr.net/gh/zenghongtu/live2d-model-assets@master/assets/HyperdimensionNeptunia/nepmaid/model.json',
    greeting:'Nep Nep thủy thủ đây~ ⚓ Bộ đồ sailor có đẹp không?', hasSound:false },
  { name:'Neptune Santa 🎅', path:'https://cdn.jsdelivr.net/gh/zenghongtu/live2d-model-assets@master/assets/HyperdimensionNeptunia/neptune_santa/model.json',
    greeting:'Ho ho ho~! Nep Santa mang quà tới rồi! 🎁', hasSound:false },
  { name:'Vert 💚',    path:'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api@master/model/HyperdimensionNeptunia/vert_normal/index.json',
    greeting:'Xin chào! Mình là Vert đây~ 💚', hasSound:false },
  { name:'Vert Classic 🌿', path:'https://cdn.jsdelivr.net/gh/zenghongtu/live2d-model-assets@master/assets/HyperdimensionNeptunia/vert_classic/model.json',
    greeting:'Vert classic outfit, thích hơn không? 🌿', hasSound:false },
  { name:'Koharu 🌸',  path:'https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json',
    greeting:'Koharu xin chào! ✿',   hasSound:false },
  { name:'Shizuku ❄️', path:'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json',
    greeting:'Shizuku ở đây~ ❄️',   hasSound:true,  soundExt:'.mp3',
    soundBase:'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/' },
  { name:'Noire 🖤',   path:'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api@master/model/HyperdimensionNeptunia/noir/index.json',
    greeting:'Noire đây! Đừng có mà nhìn ta như vậy... 🖤', hasSound:false },
  { name:'Uni 🩷',     path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/uni/model.json',
    greeting:'Uni xin chào! Đừng làm phiền chị Noire của mình nha~ 🩷', hasSound:false,
    vOffset:-80, scale:0.65 },
  { name:'Blanc 📖',   path:'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api@master/model/HyperdimensionNeptunia/blanc_swimwear/index.json',
    greeting:'...Xin chào. Mình là Blanc. 📖', hasSound:false },
  { name:'Tia 🧪',      path:'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/tia/model.json',
    greeting:'Xin chào! Tia đây~ Cần mua potion không? 🧪', hasSound:false },
];

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
  }
};

// ─── Device type detection từ entity_id ─────────────────────
const DEVICE_TYPES = [
  { prefix:'light.',          icon:'💡', label:'Đèn',          nep: (n,s) => `Đây là ${s||'đèn'} đó ${n}~ 💡 Bật lên cho sáng nhà nào!` },
  { prefix:'fan.',            icon:'🌀', label:'Quạt',         nep: (n,s) => `Quạt ${s||''} nè ${n}~ 🌀 Nóng thì bật lên cho mát!` },
  { prefix:'switch.',         icon:'🔌', label:'Công tắc',     nep: (n,s) => `Công tắc ${s||''} đây ${n}~ 🔌 Bật/tắt thoải mái nha!` },
  { prefix:'climate.',        icon:'❄️', label:'Điều hòa',     nep: (n,s) => `Điều hòa ${s||''} đó ${n}~ ❄️ {c} thích mát lắm!` },
  { prefix:'cover.',          icon:'🪟', label:'Rèm/Cửa cuốn', nep: (n,s) => `Rèm ${s||''} nè ${n}~ 🪟 Kéo lên ngắm nắng đi!` },
  { prefix:'media_player.',   icon:'📺', label:'TV/Loa',        nep: (n,s) => `TV hay loa ${s||''} kìa ${n}~ 📺 Mở anime lên xem nào!` },
  { prefix:'camera.',         icon:'📷', label:'Camera',        nep: (n,s) => `Camera ${s||''} đó ${n}~ 📷 {c} canh cùng nhé!` },
  { prefix:'sensor.',         icon:'🌡️', label:'Cảm biến',     nep: (n,s) => `Cảm biến ${s||''} này ${n}~ 🌡️ {c} đang đọc số liệu!` },
  { prefix:'binary_sensor.',  icon:'👁️', label:'Cảm biến',     nep: (n,s) => `Cảm biến ${s||''} đây ${n}~ 👁️ {c} đang theo dõi!` },
  { prefix:'input_boolean.',  icon:'🔘', label:'Nút bật/tắt',  nep: (n,s) => `Nút ${s||''} nè ${n}~ 🔘 Bấm thử xem!` },
  { prefix:'automation.',     icon:'⚙️', label:'Tự động hóa',  nep: (n,s) => `Tự động hóa ${s||''} đó ${n}~ ⚙️ Thông minh ghê!` },
  { prefix:'script.',         icon:'📜', label:'Script',        nep: (n,s) => `Script ${s||''} nè ${n}~ 📜 Bấm để chạy lệnh!` },
  { prefix:'scene.',          icon:'🎨', label:'Cảnh',          nep: (n,s) => `Cảnh ${s||''} đó ${n}~ 🎨 Đẹp như trong anime luôn!` },
  { prefix:'lock.',           icon:'🔒', label:'Khóa',          nep: (n,s) => `Khóa ${s||''} nè ${n}~ 🔒 An toàn là số 1!` },
  { prefix:'alarm_control.',  icon:'🚨', label:'Báo động',      nep: (n,s) => `Báo động ${s||''} kìa ${n}~ 🚨 {c} canh giữ nhà!` },
  { prefix:'vacuum.',         icon:'🤖', label:'Robot hút bụi', nep: (n,s) => `Robot hút bụi ${s||''} đó ${n}~ 🤖 Cute lắm vậy!` },
  { prefix:'water_heater.',   icon:'🚿', label:'Máy nước nóng', nep: (n,s) => `Máy nước nóng ${s||''} nè ${n}~ 🚿 Tắm nước ấm dễ chịu lắm!` },
];

function detectDevice(entityId, hass) {
  if (!entityId) return null;
  const dt = DEVICE_TYPES.find(d => entityId.startsWith(d.prefix));
  if (!dt) return { icon:'🏠', label:'Thiết bị', nep:(n)=>`Thiết bị ${entityId} đó ${n}~ 🏠` };
  // Lấy friendly_name từ HA nếu có
  const friendlyName = hass && hass.states[entityId]
    ? (hass.states[entityId].attributes.friendly_name || '')
    : '';
  return { ...dt, friendlyName };
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
        // L2Dwidget dùng internal model manager
        var core = L2Dwidget && L2Dwidget.emit && L2Dwidget;
        // Truy cập thẳng vào live2d model qua canvas __model__
        var cv = document.getElementById('live2d');
        if(!cv || !cv.__model__) return;
        var m = cv.__model__;
        var px = e.data.px; // 0..1 (0=left,1=right)
        var py = e.data.py; // 0..1 (0=top,1=bottom)
        // Map sang tọa độ model: eye X [-1,1], eye Y [-1,1]
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

// ─── FLOAT CSS (inject vào document) ────────────────────────
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
/* Pinned overlay — nhỏ gọn, luôn đè lên dashboard */
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
/* Bubble chat kiểu card — hiện phía trên nhân vật bên phải */
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

  /* Card: trong suốt, bo tròn, blur=1 */
  .nep-card{
    background:transparent;
    backdrop-filter:none;-webkit-backdrop-filter:none;
    border-radius:22px;
    border:1px solid rgba(255,255,255,0.18);
    overflow:hidden;position:relative;
    font-family:'Segoe UI',sans-serif;
    box-shadow:0 8px 32px rgba(31,38,135,0.18);
    padding:0;
  }

  /* Waifu area */
  .waifu-area{
    display:flex;align-items:flex-start;justify-content:center;
    position:relative;overflow:hidden;
    padding:0;margin:0;
    background:transparent;
  }

  /* Bubble wrapper — phía phải, ngang tầm miệng nhân vật */
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

  /* Bong bóng vuông */
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

  /* Đuôi trỏ sang trái — từ miệng Nep ra bong bóng */
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
    background:rgba(255,255,255,0.12);
    backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
    border:1px solid rgba(255,255,255,0.3);
    border-radius:20px;padding:4px 9px;
    font-size:10.5px;color:#fff;cursor:pointer;
    font-weight:600;white-space:nowrap;
    display:flex;align-items:center;gap:3px;
    transition:all 0.18s;flex-shrink:0;
    box-shadow:0 2px 8px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.35),inset 0 -1px 0 rgba(0,0,0,0.12);
    text-shadow:0 1px 3px rgba(0,0,0,0.35);
  }
  .nep-btn:hover{background:rgba(255,255,255,0.24);transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.45);}
  .nep-btn:active{transform:translateY(0);}
  .nep-btn.green{border-color:rgba(120,230,120,0.45);color:#c8ffc8;}
  .nep-btn.red{border-color:rgba(255,120,120,0.4);color:#ffc8c8;}
</style>

<div class="nep-card" id="nepCard">
  <div class="waifu-area" id="waifuArea">
    <div id="nep-bubble-wrap"><div id="nep-bubble"></div></div>
    <iframe id="nep-l2d-frame" scrolling="no" allowtransparency="true"></iframe>
    <span class="model-label" id="modelLabel"></span>
  </div>
  <div class="nep-toolbar">
    <button class="nep-btn" id="btnSwitch">🔄 Đổi</button>
    <button class="nep-btn" id="btnQuote">💬 Nói</button>
    <button class="nep-btn" id="btnSound">🔊 TTS</button>
    <button class="nep-btn" id="btnSensors">🔄 Reload</button>
    <button class="nep-btn green" id="btnMinimize">📌 Mini</button>
    <button class="nep-btn" id="btnPin">📍 Ghim</button>
    <button class="nep-btn red" id="btnHide">❌ Ẩn</button>
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
    // fix: restore nhân vật đã lưu sau reload
    this._modelIdx     = (() => { try { const s=localStorage.getItem('nep_modelIdx'); return s!==null?parseInt(s,10):0; } catch(e){return 0;} })();
    this._tipTimer     = null;
    this._lastStates   = {};
    this._floating     = false;
    this._floatEl      = null;
    this._floatTipTmr  = null;
    this._pinned       = false;   // trạng thái ghim — hiện nhỏ đè lên mọi dashboard
    this._pinEl        = null;
    this._pinChatInterval = null;
    this._pinMouseMove = null;
    this._statusMsgs   = [];   // danh sách trạng thái hiện tại
    this._statusIdx    = 0;
    this._statusInterval = null;
    this._idleInterval   = null;  // fix: dọn được khi re-render
    // cache sensor values
    this._curTemp      = null;
    this._curHumid     = null;
    this._curWeather   = null;
    // ── Audio system ──────────────────────────────────────────
    this._audio        = null;   // HTMLAudioElement hiện tại
    this._modelSounds  = [];     // danh sách sound URL đã lấy từ model.json
    this._ttsUtter     = null;   // SpeechSynthesisUtterance hiện tại
    this._audioEnabled = true;   // toggle bật/tắt âm thanh
  }

  setConfig(config) { this._config = config; this._render(); }

  set hass(hass) { this._hass = hass; this._updateSensors(); }

  getCardSize() { return 5; }

  // ── _render ──────────────────────────────────────────────────
  _render() {
    this._shadow.innerHTML = CARD_TEMPLATE;
    const h = this._config.height || 440;
    const w = this._config.width  || 400; // fix: dùng config thay vì hardcode
    this._shadow.querySelector('.waifu-area').style.height = h + 'px';

    // Apply card_blur — LUÔN chạy, inline style thắng CSS class
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

    this._shadow.getElementById('btnSwitch').onclick   = () => this._switchModel();
    this._shadow.getElementById('btnQuote').onclick    = () => { this._nepQuote(); };
    this._shadow.getElementById('btnSensors').onclick  = () => {
      // Reload iframe nhân vật (fix blob URL bị mất sau navigate)
      const frame = this._shadow.getElementById('nep-l2d-frame');
      const h = this._config.height || 440;
      const w = this._config.width  || 400;
      if (frame) this._loadIntoFrame(frame, this._modelIdx, w, h, false);
      // Reload thêm float iframe nếu đang nổi
      if (this._floating) {
        const ff = document.getElementById('nep-float-iframe');
        const fh = this._config.float_height || 650;
        const fw = this._config.float_width  || 400;
        if (ff) this._loadIntoFrame(ff, this._modelIdx, fw, fh, true);
      }
      // Reload thêm pin iframe nếu đang ghim
      if (this._pinned) {
        const fp = document.getElementById('nep-pin-iframe');
        const fh = this._config.float_height || 650;
        const fw = this._config.float_width  || 400;
        if (fp) this._loadIntoFrame(fp, this._modelIdx, fw, fh, true);
      }
      this._pushStatus(`${this._cn()} reload xong rồi nha~ 🔄`, true);
    };
    this._shadow.getElementById('btnMinimize').onclick = () => this._enterFloating();
    const btnPin = this._shadow.getElementById('btnPin');
    btnPin.onclick = () => this._togglePin();
    // Restore trạng thái ghim khi render (visual feedback)
    try { if (localStorage.getItem('nep_pinned') === '1') {
      btnPin.textContent = '📍 Bỏ ghim'; btnPin.classList.add('green');
    }} catch(e){}
    // Nút 🔊 toggle âm thanh bật/tắt
    const btnSound = this._shadow.getElementById('btnSound');
    btnSound.onclick = () => {
      this._audioEnabled = !this._audioEnabled;
      if (!this._audioEnabled) { this._stopAudio(); btnSound.textContent = '🔇 TTS'; btnSound.classList.add('red'); btnSound.classList.remove('green'); }
      else                     { btnSound.textContent = '🔊 TTS'; btnSound.classList.remove('red'); btnSound.classList.add('green'); }
    };
    this._shadow.getElementById('btnHide').onclick     = () => {
      this._pushStatus(`${this._cn()} đi rồi nha~ 💜👋 Nhớ ${this._cn()} nghen!`, true);
      setTimeout(() => { this._shadow.querySelector('.nep-card').style.display='none'; }, 1500);
    };

    this._initGlobalHover();
    // fix: clear trước khi tạo mới, tránh chồng timer khi setConfig gọi lại _render
    if (this._idleInterval) clearInterval(this._idleInterval);
    this._idleInterval = setInterval(() => this._idleQuote(), 45000);
    this._startStatusRotation();
    setTimeout(() => this._greet(), 3000);
    // fix: restore trạng thái mini sau reload — chạy sớm hơn greet để overlay có sẵn
    try { if (localStorage.getItem('nep_floating') === '1') setTimeout(() => this._enterFloating(), 500); } catch(e){}
    // fix: restore trạng thái ghim sau reload
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

  // ── Load model vào iframe ────────────────────────────────────
  _loadIntoFrame(frame, idx, w, h, isFloat) {
    const m = MODELS[idx];
    const lbl = this._shadow.getElementById('modelLabel');
    if (lbl) lbl.textContent = m.name;

    const html = makeL2dHtml(m.path, w, h, m.vOffset, m.scale);
    const blob = new Blob([html], {type:'text/html'});
    const url  = URL.createObjectURL(blob);

    frame.onload = () => {
      URL.revokeObjectURL(url);
      // Tải danh sách sound ngay khi model load xong
      this._loadModelSounds(idx);
      try {
        const doc = frame.contentDocument;
        doc.addEventListener('click', () => {
          const tips = [`Đừng chọc ${this._cn()} nha! ${this._cn()} giận rồi đó! (≧∇≦)`,
            `Ủa, sờ ${this._cn()} hồi nào vậy? (ó﹏ò｡)`,
            'Hí hí~ Nhột lắm á! 💜',`Cù lét! ${this._cn()} hổng chịu đâu nha! >///<`,
            `${this._cn()} ${this._cn()}~ Thương ${this._cn()} hông? 💜`,
            `Ôi trời ơi, chọc ${this._cn()} hoài vậy ta! 😳`,
            `${this._cn()} mắc cỡ quá hà~ >///<`];
          const msg = this._rand(tips);
          if (isFloat) this._floatTip(msg, 3000);
          else         this._pushStatus(msg, true);
          // Phát âm thanh khi click nhân vật
          this._playAudio(msg.replace(/[^\p{L}\p{N}\s]/gu, ''));
        });
        doc.addEventListener('dblclick', () => { if (this._floating) this._exitFloating(); });
      } catch(e){}
    };
    frame.onerror = () => URL.revokeObjectURL(url); // fix: tránh leak nếu onload không fire
    frame.src = url;
    setTimeout(() => {
      // fix: nếu vừa đổi nhân vật (_skipGreetingPush), bỏ qua _pushStatus
      // vì greeting đã được hiện trực tiếp trong _switchModel để không làm lệch pool
      if (this._skipGreetingPush) { this._skipGreetingPush = false; return; }
      this._pushStatus(m.greeting, true);
    }, 2400);
  }

  // ── Global hover: theo dõi TẤT CẢ card trên dashboard ───────
  _initGlobalHover() {
    if (window._nepGlobalHoverInit) return; // chỉ inject 1 lần
    window._nepGlobalHoverInit = true;

    // Tạo tooltip element cố định trong document
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

    // Dùng composedPath() để lấy TOÀN BỘ chain xuyên shadow DOM
    const extractEntity = (e) => {
      const path = e.composedPath ? e.composedPath() : [];

      for (const el of path) {
        if (!el || el === document || el === window) continue;

        // 1. Property _config.entity (HA card element chuẩn)
        try {
          if (el._config?.entity)        return el._config.entity;
          if (el._config?.entities?.[0]) return el._config.entities[0];
          if (el.config?.entity)         return el.config.entity;
          if (el.__config?.entity)       return el.__config.entity;
        } catch(e){}

        // 2. Attribute trực tiếp
        try {
          const a = el.getAttribute?.('data-entity-id')
                 || el.getAttribute?.('entity-id')
                 || el.getAttribute?.('entity');
          if (a) return a;
        } catch(e){}

        // 3. Tag name chứa entity (vd: hui-entity-row có stateObj)
        try {
          if (el.stateObj?.entity_id)    return el.stateObj.entity_id;
          if (el._stateObj?.entity_id)   return el._stateObj.entity_id;
          if (el.entity?.entity_id)      return el.entity.entity_id;
        } catch(e){}

        // 4. Tìm trong innerHTML của element (vd: data-entity trong text)
        try {
          if (el.tagName && el.tagName.includes('-')) {
            // Custom element — thử các property phổ biến của HA
            const props = ['entityId','entity_id','_entityId'];
            for (const p of props) {
              if (el[p] && typeof el[p] === 'string' && el[p].includes('.')) return el[p];
            }
          }
        } catch(e){}
      }
      return null;
    };

    // Hàm hiển thị tooltip + Nep bubble
    const showFor = (entityId, clientX, clientY) => {
      if (!this._hass) return;
      const dev    = detectDevice(entityId, this._hass);
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
        const name = this._config.name || 'bạn';
        this._pushStatus(dev.nep(name, fname).replace('{c}', this._cn()), true);
      }
    };

    document.addEventListener('mousemove', (e) => {
      clearTimeout(hideTimer);

      // Bỏ qua nếu chuột đang trong card của Nep
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

    // Debug helper: gõ nepDebug() trong console để xem path khi di chuột
    window.nepDebug = () => {
      console.log('[NepDebug] Đang bật debug — di chuột qua card khác...');
      const dbg = (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        const found = path.map((el,i) => {
          if (!el || el===document||el===window) return null;
          const cfg = el._config || el.config || el.__config;
          return cfg?.entity ? `[${i}] ${el.tagName||'?'} → ${cfg.entity}` : null;
        }).filter(Boolean);
        if (found.length) console.log('[NepDebug] Entity tìm thấy:', found);
        else console.log('[NepDebug] Không tìm thấy entity trong path:', path.map(el=>el?.tagName||el).slice(0,8));
      };
      document.addEventListener('mousemove', dbg);
      setTimeout(()=>{document.removeEventListener('mousemove',dbg);console.log('[NepDebug] Tắt debug.');},15000);
    };
  }
  _switchModel() {
    this._modelIdx = (this._modelIdx + 1) % MODELS.length;
    this._stopAudio();
    this._modelSounds = [];
    // fix: lưu nhân vật vào localStorage để reload vẫn giữ
    try { localStorage.setItem('nep_modelIdx', this._modelIdx); } catch(e){}
    // fix: tách riêng việc hiện greeting khỏi _pushStatus để không làm lệch pool;
    // dùng cờ _skipGreetingPush để _loadIntoFrame không gọi _pushStatus lần này
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

    // Hiện greeting ngay, sau đó build pool đầy đủ và bắt đầu rotate từ câu kế
    const greeting = MODELS[this._modelIdx].greeting;
    this._showBubble(greeting);
    setTimeout(() => {
      this._statusMsgs = this._buildStatusMessages();
      // Đảm bảo greeting ở đầu pool để vòng đầu bắt đầu sau greeting
      const gi = this._statusMsgs.indexOf(greeting);
      if (gi > 0) { this._statusMsgs.splice(gi, 1); this._statusMsgs.unshift(greeting); }
      else if (gi === -1) this._statusMsgs.unshift(greeting);
      this._statusIdx = 0; // idx=0 là greeting đang hiện; interval sẽ increment lên 1
    }, 100);
  }

  // ── Status rotation (bubble đổi mỗi 5s) ─────────────────────
  _startStatusRotation() {
    clearInterval(this._statusInterval);
    this._statusInterval = setInterval(() => {
      if (this._floating) return;
      // Pool rỗng → chờ _greet init, không làm gì
      if (!this._statusMsgs.length) return;
      // Tăng idx; hết vòng → rebuild pool mới (cập nhật sensor/câu mới)
      this._statusIdx++;
      if (this._statusIdx >= this._statusMsgs.length) {
        this._statusMsgs = this._buildStatusMessages();
        this._statusIdx  = 0;
      }
      this._showBubble(this._statusMsgs[this._statusIdx]);
    }, 5000);
  }

  // Thêm message vào queue và hiện ngay
  _pushStatus(msg, immediate = false) {
    if (!this._statusMsgs.includes(msg)) {
      this._statusMsgs.push(msg);
      if (this._statusMsgs.length > 20) this._statusMsgs.shift(); // fix: giới hạn 20 msg
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
      // Phát âm thanh khi bubble hiện (chỉ nếu có sound file; TTS không tự đọc idle để tránh spam)
      const m = MODELS[this._modelIdx];
      if (m?.hasSound && this._modelSounds.length > 0) {
        this._playModelSound();
      }
    }, 160);
  }

  // Bubble cũ - vẫn dùng cho float và urgent
  showTip(html, ms = 4000) {
    this._pushStatus(html, true);
    clearTimeout(this._tipTimer);
    this._tipTimer = setTimeout(() => {
      const msgs = this._buildStatusMessages();
      this._statusMsgs = msgs;
      this._statusIdx  = 0;
    }, ms);
  }

  // ── Float bubble (urgent/click tip — hiện ở thanh controls) ─
  _floatTip(html, ms = 4000) {
    clearTimeout(this._floatTipTmr);
    const b = document.getElementById('_nep_float_bubble');
    if (!b) return;
    b.innerHTML = html;
    b.classList.add('show');
    this._floatTipTmr = setTimeout(() => b.classList.remove('show'), ms);
    // Đồng thời hiện lên bubble chat của nhân vật
    if (this._floatChatShow) this._floatChatShow(html);
  }

  // ── Quotes riêng theo nhân vật — dùng chung cho idle và nút 💬 ──
  _getCharQuotes(name, model, charName) {
    charName = charName || this._config.char_nickname?.trim() || model?.name?.replace(/\s*[^\w\s].*/u, '').trim() || 'Nep';
    const mn = model?.name || '';
    const byModel = {
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
    };
    byModel['Tia 🧪'] = [
        `${name} ơi, Tia có loại potion đặc biệt nè~ uống vào thông minh hơn liền! 🧪`,
        `Tia đang nghiên cứu công thức mới á~ ${name} thử không? ✨`,
        `Nhà thông minh thật sự, Tia cũng muốn có một căn như vậy~ 💜`,
        `${name} ơi, Tia thấy cảm biến nhà mình xịn lắm đó! 🏠`,
        `Tia sẽ pha cho ${name} ly potion hôm nay nha~ 🌸`,
        `Pio bảo Tia phải chào hỏi lịch sự hơn... Xin chào ${name}! 😊`,
        `Potion của Tia là số một! ${name} hãy tin tưởng Tia nhé~ 🧪`,
        `Tia đang canh nhà cho ${name} đây, đừng lo lắng gì hết nha~ 🛡️`,
      ];
    // Trả về quotes của nhân vật hiện tại, fallback về Neptune nếu không có
    return byModel[mn] || byModel['Neptune 💜'] || [];
  }

  // ── Xây danh sách status messages từ sensor hiện tại ─────────
  _buildStatusMessages() {
    const name  = this._config.name || 'bạn';
    const model = MODELS[this._modelIdx];
    const msgs  = [];
    const h     = new Date().getHours();

    // ── Lời chào theo buổi — tự nhận diện theo nhân vật ──────────
    const charName = this._config.char_nickname?.trim() || model?.name?.replace(/\s*[^\w\s].*/u, '').trim() || 'Nep'; // lấy tên trước emoji (ưu tiên char_nickname từ config)
    const greetingPool =
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
    const greeting = this._rand(greetingPool);
    msgs.push(greeting);

    // Nhiệt độ
    if (this._curTemp !== null) {
      const r = SENSOR_REACTIONS.temp.find(x => this._curTemp <= x.max);
      if (r) msgs.push(r.msg.replace('{v}', this._curTemp).replace('{n}', name).replace('{c}', this._cn()));
    }

    // Độ ẩm
    if (this._curHumid !== null) {
      const r = SENSOR_REACTIONS.humid.find(x => this._curHumid <= x.max);
      if (r) msgs.push(r.msg.replace('{v}', this._curHumid).replace('{n}', name).replace('{c}', this._cn()));
    }

    // Thời tiết
    if (this._curWeather) {
      const info = SENSOR_REACTIONS.weather[this._curWeather];
      if (info) msgs.push(info.msg.replace('{c}', this._cn()));
    }

    // Câu nhắc theo buổi + nhiệt độ kết hợp (câu đặc biệt)
    if (this._curTemp !== null) {
      const t = this._curTemp;
      if (h>=11&&h<13 && t>30) msgs.push(`${name} ơi, trưa nóng ${t}°C rồi! Nhớ uống nước nhiều vô nha~ 💧`);
      if (h>=7&&h<11  && t>30) msgs.push(`Buổi sáng mà đã ${t}°C rồi ${name} ơi, hôm nay nóng dữ ghê~`);
      if (h>=17&&h<20 && t>30) msgs.push(`Chiều tối ${t}°C vẫn còn nóng ${name} ơi, bật quạt lên đi nha~`);
    }

    // ── Xen 2-3 câu giới thiệu nhân vật vào pool (không trùng nhau) ──
    const charQuotes = this._getCharQuotes(name, model);
    if (charQuotes.length) {
      const picked = [];
      const shuffled = [...charQuotes].sort(() => Math.random() - 0.5);
      for (const q of shuffled) {
        if (!msgs.includes(q)) { picked.push(q); if (picked.length >= 3) break; }
      }
      // Xen vào các vị trí cách đều trong pool để không dồn cục
      picked.forEach((q, i) => {
        const pos = Math.min(msgs.length, 1 + i * 2); // sau greeting, cách nhau ~2 slot
        msgs.splice(pos, 0, q);
      });
    }

    return msgs.length ? msgs : [greeting];
  }

  // ── Greet khi khởi động ──────────────────────────────────────
  _greet() {
    const msgs = this._buildStatusMessages();
    this._statusMsgs = msgs;
    this._statusIdx  = 0;
    this._showBubble(msgs[0]);
    // Log để debug nếu cần
    // console.log('[Nep] statusMsgs:', msgs);
  }

  // ── Vào floating ─────────────────────────────────────────────
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
        <button class="nep-fbtn" id="_nep_fbtn_switch">🔄</button>
        <button class="nep-fbtn" id="_nep_fbtn_quote">💬</button>
        <button class="nep-fbtn restore" id="_nep_fbtn_restore">⬆ Vào card</button>
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
    document.getElementById('_nep_fbtn_switch').onclick  = () => this._switchModel();
    document.getElementById('_nep_fbtn_quote').onclick   = () => {
      this._floatTip(this._rand([`${this._cn()} đang canh nhà cho bạn nha~ 🛡️`,'Đúp click để về card nghen!',
        `Nhà thông minh + ${this._cn()} = xịn xò dữ vậy! 💜`,'Uống nước vô đi nào~ 💧',
        `Cố lên nha! ${this._cn()} cổ vũ hết mình luôn! 💪`,
        `${this._cn()} canh nhà thiệt thọ nha, đừng lo~ 💜`]), 4000);
    };
    const charDiv = document.getElementById('nep-float-char');
    charDiv.addEventListener('click', () => {
      this._floatTip(this._rand([`${this._cn()} đang canh nhà đây nha~`,'Đúp click để về card nghen!',
        'Hí hí~ 💜','Cù lét! >///<',`Thương ${this._cn()} hông? 💜`,
        `Ủa sao chọc ${this._cn()} hoài vậy ta~ 😳`]), 3000);
    });
    charDiv.addEventListener('dblclick', () => this._exitFloating());
    this._floatTip(`${this._cn()} canh nhà góc phải rồi nha~ 💜 Đúp click để về card nghen!`, 4000);

    // ── Eye tracking: truyền tọa độ chuột vào iframe ──────────
    this._floatMouseMove = (e) => {
      const ff = document.getElementById('_nep_float_frame');
      if (!ff) return;
      const rect = ff.getBoundingClientRect();
      // Tọa độ chuẩn hóa 0..1 tương đối với iframe (kể cả ngoài)
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      try {
        ff.contentWindow.postMessage({ type: 'nepEye', px, py }, '*');
      } catch(err) {}
    };
    document.addEventListener('mousemove', this._floatMouseMove);

    // ── Float chat bubble: xoay vòng status giống card ─────────
    this._floatChatShow = (msg) => {
      const wrap  = document.getElementById('_nep_float_chat');
      const inner = document.getElementById('_nep_float_chat_inner');
      if (!wrap || !inner) return;
      wrap.classList.remove('show');
      setTimeout(() => { inner.innerHTML = msg; wrap.classList.add('show'); }, 160);
    };
    // Hiện ngay status đầu tiên sau 1s
    setTimeout(() => {
      const msgs = this._buildStatusMessages();
      this._floatChatMsgs = msgs;
      this._floatChatIdx  = 0;
      this._floatChatShow(msgs[0]);
    }, 1000);
    // Xoay vòng mỗi 5s (giống card)
    this._floatChatInterval = setInterval(() => {
      if (!this._floating) return;
      const msgs = this._floatChatMsgs || this._buildStatusMessages();
      this._floatChatIdx = ((this._floatChatIdx || 0) + 1) % msgs.length;
      this._floatChatShow(msgs[this._floatChatIdx]);
    }, 5000);
  }

  // ── Thoát floating ───────────────────────────────────────────
  _exitFloating() {
    if (!this._floating) return;
    this._floating = false;
    try { localStorage.removeItem('nep_floating'); } catch(e){}
    if (this._floatEl) { this._floatEl.remove(); this._floatEl = null; }
    // Dọn eye tracking listener
    if (this._floatMouseMove) {
      document.removeEventListener('mousemove', this._floatMouseMove);
      this._floatMouseMove = null;
    }
    // Dọn float chat rotation
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
    this._pushStatus(`${this._cn()} về nhà rồi nha~ 🏠💜 Nhớ ${this._cn()} hông?`, true);
  }

  // ── Update sensors ───────────────────────────────────────────
  _updateSensors(force = false) {
    if (!this._hass) return;
    const cfg = this._config;
    let changed = false;

    // Nhiệt độ
    if (cfg.temp_sensor) {
      const s = this._hass.states[cfg.temp_sensor];
      const v = s ? Math.round(parseFloat(s.state)) : null;
      if (v !== null && !isNaN(v)) {
        if (this._curTemp !== v) { this._curTemp = v; changed = true; }
      }
    }
    // Độ ẩm
    if (cfg.humid_sensor) {
      const s = this._hass.states[cfg.humid_sensor];
      const v = s ? Math.round(parseFloat(s.state)) : null;
      if (v !== null && !isNaN(v)) {
        if (this._curHumid !== v) { this._curHumid = v; changed = true; }
      }
    }
    // Thời tiết
    if (cfg.weather_entity) {
      const s = this._hass.states[cfg.weather_entity];
      if (s) {
        if (this._curWeather !== s.state) { this._curWeather = s.state; changed = true; }
        // fix: bỏ biến info thừa, không dùng ở đây — _buildStatusMessages xử lý
      }
    }

    // Alert sensors
    let alertMsg = null, alertMs = 4000;
    if (cfg.motion_sensor) {
      const s = this._hass.states[cfg.motion_sensor];
      const on = s?.state === 'on';
      if (this._changed(cfg.motion_sensor, s?.state)) {
        alertMsg = this._rand(on ? ALERT_MSGS.motion.on : ALERT_MSGS.motion.off).replace('{c}', this._cn());
        if (on) alertMs = 5000;
      }
    }
    if (cfg.door_sensor) {
      const s = this._hass.states[cfg.door_sensor];
      const on = s?.state === 'on';
      if (on && this._changed(cfg.door_sensor, s?.state))
        alertMsg = this._rand(ALERT_MSGS.door.on).replace('{c}', this._cn());
    }
    if (cfg.smoke_sensor) {
      const s = this._hass.states[cfg.smoke_sensor];
      const on = s?.state === 'on';
      // fix: thêm _changed() như motion/door để tránh spam alert mỗi lần hass update
      if (this._changed(cfg.smoke_sensor, s?.state)) {
        if (on) { alertMsg = this._rand(ALERT_MSGS.smoke.on).replace('{c}', this._cn()); alertMs = 8000; }
        else    { alertMsg = this._rand(ALERT_MSGS.smoke.off).replace('{c}', this._cn()); }
      }
    }

    if (alertMsg) {
      if (this._floating) this._floatTip(alertMsg, alertMs);
      else this._pushStatus(alertMsg, true);
    }

    // Refresh status messages nếu có thay đổi hoặc force
    if (changed || force) {
      const msgs = this._buildStatusMessages();
      this._statusMsgs = msgs;
      // Không reset idx để không giật bubble
    }

    this._saveStates();
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

  _nepQuote() {
    const name  = this._config.name || 'bạn';
    const model = MODELS[this._modelIdx];
    const pool  = this._getCharQuotes(name, model);
    const msg   = this._rand(pool);
    if (this._floating) this._floatTip(msg, 5000);
    else this._pushStatus(msg, true);
    // Phát âm thanh: sound file nếu có, TTS nếu không
    setTimeout(() => this._playAudio(msg.replace(/[\u{1F000}-\u{1FFFF}~✿★☆♪♫]/gu, '').trim()), 200);
  }

  _idleQuote() {
    const msgs = this._buildStatusMessages();
    this._statusMsgs = msgs;
    this._statusIdx  = 0;
    if (!this._floating) this._showBubble(msgs[0]);
  }

  _rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Trả về tên tự xưng của nhân vật hiện tại (ưu tiên char_nickname từ config)
  _cn() {
    if (this._config.char_nickname?.trim()) return this._config.char_nickname.trim();
    const model = MODELS[this._modelIdx];
    return model?.name?.replace(/\s*[^\w\s].*/u, '').trim() || 'Nep';
  }

  // ══════════════════════════════════════════════════════════════
  // ── AUDIO ENGINE ─────────────────────────────────────────────
  // Logic: model có sound file → phát file gốc
  //        model không có sound  → dùng Web Speech TTS đọc bubble
  // ══════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════
  // ── AUDIO ENGINE ─────────────────────────────────────────────
  // Logic: model có sound file → phát file gốc
  //        model không có sound  → dùng TTS engine được cấu hình trong YAML
  //
  // TTS engines hỗ trợ (config: tts.engine):
  //   webspeech        – Web Speech API (mặc định, built-in trình duyệt)
  //   google_translate – Audio tag + Google Translate TTS URL
  //   ha_service       – Gọi HA TTS service (tts.google_translate_say, tts.cloud_say, ...)
  //   none             – Tắt TTS hoàn toàn
  // ══════════════════════════════════════════════════════════════

  // Trả về config TTS đã parse từ YAML
  _getTtsCfg() {
    const raw = this._config.tts;
    if (!raw) return { engine: 'webspeech', lang: 'vi-VN', rate: 1.05, pitch: 1.2 };
    if (typeof raw === 'string') return { engine: raw };  // tts: none
    return {
      engine:                 raw.engine    || 'webspeech',
      lang:                   raw.lang      || 'vi-VN',
      rate:                   raw.rate      || 1.05,
      pitch:                  raw.pitch     || 1.2,
      service:                raw.service   || null,
      entity_id:              raw.entity_id || null,
      media_player_entity_id: raw.media_player_entity_id || raw.media_player || null,
      cache:                  raw.cache !== undefined ? raw.cache : true,
      options:                raw.options   || {},
    };
  }

  // Làm sạch text để TTS đọc tự nhiên
  _cleanTtsText(text) {
    return (text || '')
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/[~✿★☆♪♫·•]/g, '')
      .replace(/\([^)]*[^\w\s\u00C0-\u024F][^)]*\)/g, '')
      .replace(/[>/<]{2,}/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  // Gọi khi chuyển model: fetch model.json → build danh sách sounds
  async _loadModelSounds(modelIdx) {
    this._modelSounds = [];
    const m = MODELS[modelIdx];
    if (!m.hasSound) return; // model không có sound → dùng TTS
    try {
      const res  = await fetch(m.path);
      const json = await res.json();
      const base = m.soundBase || m.path.replace(/[^/]+$/, '');
      const ext  = m.soundExt  || '.mp3';
      // Duyệt tất cả motion groups, lấy các entry có "sound"
      const motions = json.motions || {};
      for (const group of Object.values(motions)) {
        for (const entry of group) {
          if (entry.sound) {
            // Đảm bảo URL đầy đủ + extension
            let snd = entry.sound;
            if (!snd.startsWith('http')) snd = base + snd;
            if (!snd.match(/\.\w+$/))   snd = snd + ext;
            this._modelSounds.push(snd);
          }
        }
      }
    } catch(e) { this._modelSounds = []; }
  }

  // Phát một sound file (HTML Audio, không block TTS)
  _playSound(url) {
    try {
      if (this._audio) { this._audio.pause(); this._audio = null; }
      const a = new Audio(url);
      a.volume = 0.75;
      this._audio = a;
      const p = a.play();
      if (p) p.catch(() => {}); // im lặng nếu bị block
    } catch(e) {}
  }

  // Phát random sound từ model (nếu có)
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

    const lang  = cfg.lang  || 'vi-VN';
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
      const viVoices = voices.filter(v => v.lang === lang || v.lang === lang.split('-')[0]);
      const femaleNames = ['linh', 'an', 'nguyen', 'female', 'woman',
                           'google tiếng việt', 'microsoft linh',
                           'google vi-vn', 'vi-vn-wavenet'];
      const female = viVoices.find(v =>
        femaleNames.some(n => v.name.toLowerCase().includes(n))
      );
      if (female) return female;
      if (viVoices.length) return viVoices[0];
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
      const lang = cfg.lang || 'vi';
      // Google Translate TTS endpoint (không cần key, giới hạn ~200 ký tự/lần)
      const chunk = text.slice(0, 200);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;
      const a = new Audio(url);
      a.volume = 0.9;
      this._audio = a;
      const p = a.play();
      if (p) p.catch(() => {});
    } catch(e) {}
  }

  // ── TTS Engine: fetch URL từ HA TTS rồi phát bằng <audio> ──
  // Dùng khi engine=ha_service + service=tts.speak nhưng không có media_player_entity_id
  // Giọng giống hệt khi phát qua loa vật lý (cùng engine Google Translate)
  async _speakHaTtsUrl(text, cfg) {
    if (!this._hass) return;
    try {
      // Gọi HA REST API: /api/tts_get_url để lấy URL audio
      // entity_id ở đây là tts entity (vd: tts.google_translate_vi_com)
      const ttsEntityId = cfg.entity_id;
      // Lấy platform từ tts entity state nếu có, hoặc dùng entity_id để đoán
      // API nhận: engine_id (tts entity) hoặc platform (legacy)
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
      if (!audioUrl) throw new Error('tts_get_url không trả về url');

      // Phát audio — giọng giống hệt loa vật lý
      this._playSound(audioUrl);
    } catch(e) {
      console.warn('[NepTTS] _speakHaTtsUrl lỗi, fallback Web Speech:', e);
      // Fallback cuối cùng nếu API lỗi
      this._speakWebSpeech(text, cfg);
    }
  }

  // ── TTS Engine: Home Assistant service ────────────────────
  // Hỗ trợ 2 kiểu:
  //   Kiểu mới (HA 2023.8+): tts.speak — target là tts entity, truyền media_player_entity_id trong data
  //   Kiểu cũ:               tts.google_translate_say / tts.cloud_say — target là media_player
  _speakHaService(text, cfg) {
    if (!this._hass) return;
    const service   = cfg.service;    // vd: tts.speak hoặc tts.google_translate_say
    const entity_id = cfg.entity_id;  // vd: tts.google_translate_vi_com hoặc media_player.loa
    if (!service || !entity_id) {
      console.warn('[NepTTS] ha_service cần service và entity_id trong YAML tts config');
      return;
    }
    const [domain, svc] = service.split('.');
    if (!domain || !svc) return;
    try {
      // Kiểu mới: tts.speak — entity_id là TTS entity (tts.xxx), cần thêm media_player_entity_id
      if (domain === 'tts' && svc === 'speak') {
        const mp = cfg.media_player_entity_id || cfg.media_player;
        if (!mp) {
          // Không có media_player → fetch audio URL từ HA TTS rồi phát bằng <audio>
          // Giọng giống hệt khi phát qua loa vật lý
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
        // Kiểu cũ: tts.google_translate_say, tts.cloud_say, ...
        // entity_id là media_player
        this._hass.callService(domain, svc, {
          entity_id,
          message: text,
          ...(cfg.lang    ? { language: cfg.lang } : {}),
          ...(cfg.options ? cfg.options            : {}),
        });
      }
    } catch(e) {
      console.warn('[NepTTS] callService lỗi:', e);
    }
  }

  // ── Dispatcher: đọc text theo engine đã cấu hình ──────────
  _speakBubble(overrideText) {
    const cfg = this._getTtsCfg();
    if (cfg.engine === 'none') return;

    // Lấy text từ bubble hiện tại hoặc override
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
        // fallback: thử Web Speech
        this._speakWebSpeech(text, cfg);
    }
  }

  // Entry point: gọi khi muốn phát âm thanh (click nhân vật, nút 💬, bubble xuất hiện)
  // Tự chọn: sound file nếu model có, TTS nếu không
  _playAudio(overrideText) {
    if (!this._audioEnabled) return;
    const m = MODELS[this._modelIdx];
    if (m.hasSound && this._modelSounds.length > 0) {
      this._playModelSound();
    } else {
      this._speakBubble(overrideText);
    }
  }

  // Dừng mọi âm thanh
  _stopAudio() {
    if (this._audio) { this._audio.pause(); this._audio = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // ── Ghim: hiện nhỏ đè lên mọi dashboard, card gốc vẫn hiển thị ────
  _togglePin() {
    if (this._pinned) this._exitPin();
    else              this._enterPin();
  }

  _enterPin() {
    if (this._pinned) return;
    this._pinned = true;
    try { localStorage.setItem('nep_pinned', '1'); } catch(e){}
    // Cập nhật nút trong card
    const btn = this._shadow.getElementById('btnPin');
    if (btn) { btn.textContent = '📍 Bỏ ghim'; btn.classList.add('green'); }
    this._buildPinOverlay();
    // MutationObserver: tự re-inject nếu overlay bị xóa khi navigate
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
    if (btn) { btn.textContent = '📍 Ghim'; btn.classList.remove('green'); }
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
    // Inject CSS nếu chưa có
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
        <button class="nep-pin-btn" id="_nep_pbtn_switch">🔄</button>
        <button class="nep-pin-btn unpin" id="_nep_pbtn_unpin">📍 Bỏ ghim</button>
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
    document.getElementById('_nep_pbtn_switch').onclick = () => this._switchModel();

    const charDiv = document.getElementById('nep-pin-char');
    charDiv.addEventListener('click', () => {
      const inner = document.getElementById('_nep_pin_chat_inner');
      const wrap  = document.getElementById('_nep_pin_chat');
      if (!inner || !wrap) return;
      const msg = this._rand([`${this._cn()} đang ghim ở đây nha~ 📍`,'Hí hí~ 💜',
        'Cù lét! >///<',`Thương ${this._cn()} hông? 💜`,`Ủa sao chọc ${this._cn()} hoài~ 😳`]);
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

    // Chat bubble xoay vòng
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

  // fix: khi card được gắn lại vào DOM (navigate về dashboard) → re-inject overlay
  connectedCallback() {
    if (this._floating) {
      setTimeout(() => this._rebuildFloat(), 300);
    }
    // Pinned overlay tự duy trì qua MutationObserver, nhưng nếu mất thì rebuild
    if (this._pinned && !document.getElementById('nep-pin-overlay')) {
      setTimeout(() => this._rebuildPin(), 300);
    }
  }

  // Re-inject float overlay mà không reset trạng thái
  _rebuildFloat() {
    if (!this._floating) return;
    // Dọn overlay cũ nếu còn sót
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
    // Ẩn card (có thể bị reset khi HA re-render)
    const card = this._shadow.querySelector('.nep-card');
    if (card) card.style.display = 'none';
    // Inject CSS nếu mất
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
        <button class="nep-fbtn" id="_nep_fbtn_switch">🔄</button>
        <button class="nep-fbtn" id="_nep_fbtn_quote">💬</button>
        <button class="nep-fbtn restore" id="_nep_fbtn_restore">⬆ Vào card</button>
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
    document.getElementById('_nep_fbtn_switch').onclick  = () => this._switchModel();
    document.getElementById('_nep_fbtn_quote').onclick   = () => {
      this._floatTip(this._rand([`${this._cn()} đang canh nhà cho bạn nha~ 🛡️`,'Đúp click để về card nghen!',
        `Nhà thông minh + ${this._cn()} = xịn xò dữ vậy! 💜`,'Uống nước vô đi nào~ 💧',
        `Cố lên nha! ${this._cn()} cổ vũ hết mình luôn! 💪`,
        `${this._cn()} canh nhà thiệt thọ nha, đừng lo~ 💜`]), 4000);
    };
    const charDiv = document.getElementById('nep-float-char');
    charDiv.addEventListener('click', () => {
      this._floatTip(this._rand([`${this._cn()} đang canh nhà đây nha~`,'Đúp click để về card nghen!',
        'Hí hí~ 💜','Cù lét! >///<',`Thương ${this._cn()} hông? 💜`,
        `Ủa sao chọc ${this._cn()} hoài vậy ta~ 😳`]), 3000);
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

  // fix: dọn sạch khi card bị xóa khỏi DOM (navigate đi dashboard khác)
  // GIỮ NGUYÊN this._floating để connectedCallback biết cần rebuild
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
    // Xóa overlay khỏi DOM nhưng GIỮ this._floating = true
    // để connectedCallback rebuild lại khi quay về
    if (this._floatEl) { this._floatEl.remove(); this._floatEl = null; }
    // Pin: teardown nhưng giữ _pinned=true; MutationObserver tự rebuild khi body sẵn sàng
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
    };
    return map[modelName] || 'Nep';
  }

  _render() {
    const cfg    = this._config;
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

    <!-- ══ GENERAL ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-general">
        <span>⚙️ Cài đặt chung</span>
        <span class="acc-arrow" id="arrow-general">${this._open.general ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-general" style="display:${this._open.general ? 'block' : 'none'}">

        <!-- Owner name -->
        <div class="row">
          <label>👤 Tên chủ nhân <span style="color:var(--secondary-text-color);font-weight:400">(nhân vật sẽ gọi tên này trong lời chào)</span></label>
          <input type="text" id="ownerName" placeholder="vd: Anh Long, bạn, boss..." value="${cfg.name || ''}"/>
          <div class="hint">Để trống = mặc định gọi là "bạn"</div>
        </div>


        <!-- Custom nickname override -->
        <div class="row">
          <label>✏️ Tên tự xưng tuỳ chỉnh <span style="color:var(--secondary-text-color);font-weight:400">(ghi đè tên mặc định của nhân vật)</span></label>
          <input type="text" id="charNickname" placeholder="vd: Nep, Emilia, Aqua..." value="${cfg.char_nickname || ''}"/>
          <div class="hint">Để trống = dùng tên gốc nhân vật (${curNick}). Nhân vật sẽ tự xưng bằng tên này trong câu thoại.</div>
        </div>

        <!-- Card size -->
        <div class="sl-row">
          <label>📐 Chiều cao card (px)</label>
          <input type="range" id="heightSl" min="300" max="700" step="20" value="${cfg.height || 440}"/>
          <span class="slv" id="heightV">${cfg.height || 440}px</span>
        </div>

      </div>
    </div>

    <!-- ══ APPEARANCE ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-appearance">
        <span>🎨 Giao diện & Hiệu ứng</span>
        <span class="acc-arrow" id="arrow-appearance">${this._open.appearance ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-appearance" style="display:${this._open.appearance ? 'block' : 'none'}">

        <!-- Blur slider -->
        <div class="sl-row">
          <label>🪟 Độ mờ nền (blur)</label>
          <input type="range" id="blurSl" min="0" max="30" step="1" value="${blur}"/>
          <span class="slv" id="blurV">${blur}px</span>
        </div>
        <div class="hint" style="margin-top:-8px;margin-bottom:12px">0px = trong suốt hoàn toàn · 30px = mờ tối đa. Kéo để xem preview ngay trên card.</div>

        <!-- Float size -->
        <div class="divider"></div>
        <div class="tag">Chế độ Mini / Ghim</div>
        <div class="sl-row">
          <label>📐 Chiều cao nhân vật nổi (px)</label>
          <input type="range" id="floatHSl" min="300" max="900" step="20" value="${cfg.float_height || 650}"/>
          <span class="slv" id="floatHV">${cfg.float_height || 650}px</span>
        </div>
        <div class="sl-row">
          <label>📐 Chiều rộng nhân vật nổi (px)</label>
          <input type="range" id="floatWSl" min="200" max="600" step="20" value="${cfg.float_width || 400}"/>
          <span class="slv" id="floatWV">${cfg.float_width || 400}px</span>
        </div>

      </div>
    </div>

    <!-- ══ SENSORS ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-sensors">
        <span>🌡️ Cảm biến môi trường
          ${[cfg.temp_sensor, cfg.humid_sensor, cfg.weather_entity].filter(Boolean).length > 0
            ? `<span class="badge">${[cfg.temp_sensor, cfg.humid_sensor, cfg.weather_entity].filter(Boolean).length}/3</span>`
            : ''}
        </span>
        <span class="acc-arrow" id="arrow-sensors">${this._open.sensors ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-sensors" style="display:${this._open.sensors ? 'block' : 'none'}">
        <div class="hint" style="margin-bottom:12px">Nhân vật sẽ phản ứng và đưa lời khuyên theo dữ liệu cảm biến thực từ Home Assistant.</div>

        <div class="row">
          <label>🌡️ Cảm biến nhiệt độ</label>
          <ha-entity-picker data-key="temp_sensor" data-domain="sensor" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="row">
          <label>💧 Cảm biến độ ẩm</label>
          <ha-entity-picker data-key="humid_sensor" data-domain="sensor" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="row">
          <label>⛅ Entity thời tiết</label>
          <ha-entity-picker data-key="weather_entity" data-domain="weather" allow-custom-entity></ha-entity-picker>
        </div>

      </div>
    </div>

    <!-- ══ ALERTS ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-alerts">
        <span>🚨 Cảm biến cảnh báo
          ${[cfg.motion_sensor, cfg.door_sensor, cfg.smoke_sensor].filter(Boolean).length > 0
            ? `<span class="badge">${[cfg.motion_sensor, cfg.door_sensor, cfg.smoke_sensor].filter(Boolean).length}/3</span>`
            : ''}
        </span>
        <span class="acc-arrow" id="arrow-alerts">${this._open.alerts ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-alerts" style="display:${this._open.alerts ? 'block' : 'none'}">
        <div class="hint" style="margin-bottom:12px">Nhân vật sẽ phát cảnh báo ngay khi sensor thay đổi trạng thái.</div>

        <div class="row">
          <label>🚶 Cảm biến chuyển động</label>
          <ha-entity-picker data-key="motion_sensor" data-domain="binary_sensor" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="row">
          <label>🚪 Cảm biến cửa</label>
          <ha-entity-picker data-key="door_sensor" data-domain="binary_sensor" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="row">
          <label>🔥 Cảm biến khói / báo cháy</label>
          <ha-entity-picker data-key="smoke_sensor" data-domain="binary_sensor" allow-custom-entity></ha-entity-picker>
        </div>

      </div>
    </div>

    <!-- ══ DEVICES / ENTITIES ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-devices">
        <span>🏠 Thiết bị hiển thị (toolbar)
          ${entities.length > 0 ? `<span class="badge">${entities.length}</span>` : ''}
        </span>
        <span class="acc-arrow" id="arrow-devices">${this._open.devices ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-devices" style="display:${this._open.devices ? 'block' : 'none'}">
        <div class="hint" style="margin-bottom:12px">Các entity được hiện thành nút trong toolbar. Hover vào nút bất kỳ trên dashboard để nhân vật giới thiệu thiết bị đó.</div>

        <div class="sl-row" style="margin-bottom:14px">
          <label style="font-size:12px;font-weight:600;color:var(--secondary-text-color);min-width:130px">Số thiết bị</label>
          <input type="range" id="entCountSl" min="1" max="12" step="1" value="${entCount}"/>
          <span class="slv" id="entCountV">${entCount}</span>
        </div>

        <div id="entList">
          ${Array.from({ length: entCount }, (_, i) => {
            const item = entities[i] || {};
            return `<div class="ent-card">
              <div class="ent-card-title">Thiết bị ${i + 1}</div>
              <div class="row">
                <label>⚡ Entity</label>
                <ha-entity-picker data-ei="${i}" allow-custom-entity></ha-entity-picker>
              </div>
              <div class="row" style="margin-bottom:0">
                <label>📝 Tên hiển thị <span style="font-weight:400;opacity:.7">(tuỳ chọn, để trống = dùng tên HA)</span></label>
                <input type="text" class="ent-name" data-ei="${i}" placeholder="vd: Đèn phòng khách" value="${item.name || ''}"/>
              </div>
            </div>`;
          }).join('')}
        </div>

      </div>
    </div>

    <!-- ══ TTS ══ -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-tts">
        <span>🔊 Giọng nói (TTS)</span>
        <span class="acc-arrow" id="arrow-tts">${this._open.tts ? '▾' : '▸'}</span>
      </div>
      <div class="acc-body" id="body-tts" style="display:${this._open.tts ? 'block' : 'none'}">

        <div class="row" style="margin-bottom:14px">
          <label>⚙️ Engine TTS</label>
          <div class="bg" id="ttsEngGrid">
            <div class="ob ${ttsEng === 'webspeech' ? 'on' : ''}"       data-eng="webspeech">🗣️ WebSpeech</div>
            <div class="ob ${ttsEng === 'google_translate' ? 'on' : ''}" data-eng="google_translate">🌐 Google TTS</div>
            <div class="ob ${ttsEng === 'ha_service' ? 'on' : ''}"       data-eng="ha_service">🏠 HA Service</div>
            <div class="ob ${ttsEng === 'none' ? 'on' : ''}"             data-eng="none">🔇 Tắt</div>
          </div>
        </div>

        <!-- WebSpeech options -->
        <div class="tts-section ${ttsEng === 'webspeech' ? 'show' : ''}" id="tts-webspeech">
          <div class="sec-opts">
            <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">🗣️ WEB SPEECH API</div>
            <div class="sl-row">
              <label>🌐 Ngôn ngữ</label>
              <div class="bg" style="flex:1">
                ${[['vi-VN','🇻🇳 VI'],['en-US','🇺🇸 EN'],['ja-JP','🇯🇵 JP'],['zh-CN','🇨🇳 ZH']].map(
                  ([v,l]) => `<div class="ob ${ttsLang === v ? 'on' : ''}" data-tts-lang="${v}">${l}</div>`
                ).join('')}
              </div>
            </div>
            <div class="sl-row">
              <label>⏩ Tốc độ đọc</label>
              <input type="range" id="ttsRateSl" min="0.5" max="2.0" step="0.05" value="${ttsRate}"/>
              <span class="slv" id="ttsRateV">${parseFloat(ttsRate).toFixed(2)}</span>
            </div>
            <div class="sl-row" style="margin-bottom:0">
              <label>🎵 Cao độ (pitch)</label>
              <input type="range" id="ttsPitchSl" min="0" max="2" step="0.1" value="${ttsPitch}"/>
              <span class="slv" id="ttsPitchV">${parseFloat(ttsPitch).toFixed(1)}</span>
            </div>
          </div>
        </div>

        <!-- Google Translate options -->
        <div class="tts-section ${ttsEng === 'google_translate' ? 'show' : ''}" id="tts-google_translate">
          <div class="sec-opts">
            <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">🌐 GOOGLE TRANSLATE TTS</div>
            <div class="hint" style="margin-bottom:8px">Dùng API Google Translate (không cần cấu hình HA). Giới hạn ~200 ký tự/lần.</div>
            <div class="row" style="margin-bottom:0">
              <label>🌐 Mã ngôn ngữ</label>
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
            <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">🏠 HOME ASSISTANT TTS SERVICE</div>
            <div class="row">
              <label>⚙️ Service <span style="font-weight:400;opacity:.7">(vd: tts.speak, tts.google_translate_say)</span></label>
              <input type="text" id="ttsSvcInput" placeholder="tts.speak" value="${ttsSvc}"/>
            </div>
            <div class="row">
              <label>🎯 Entity ID <span style="font-weight:400;opacity:.7">(TTS entity hoặc media_player tùy service)</span></label>
              <ha-entity-picker id="ttsEntityPicker" allow-custom-entity></ha-entity-picker>
            </div>
            <div class="row" style="margin-bottom:0">
              <label>📻 Media player <span style="font-weight:400;opacity:.7">(tuỳ chọn — nếu dùng tts.speak)</span></label>
              <ha-entity-picker id="ttsMpPicker" data-domain="media_player" allow-custom-entity></ha-entity-picker>
            </div>
            <div class="hint" style="margin-top:8px">Nếu để trống Media player → HA sẽ fetch URL audio rồi phát trên trình duyệt (giọng giống loa vật lý).</div>
          </div>
        </div>

        <!-- None state -->
        <div class="tts-section ${ttsEng === 'none' ? 'show' : ''}" id="tts-none">
          <div class="hint" style="padding:8px 0">🔇 TTS đã tắt hoàn toàn. Nhân vật vẫn hiện bubble văn bản nhưng không đọc to.</div>
        </div>

      </div>
    </div>

    <!-- YAML preview hint -->
    <div style="margin:8px 14px 4px;padding:10px 12px;background:var(--secondary-background-color);border-radius:8px;border:1px solid var(--divider-color);font-size:11px;color:var(--secondary-text-color);line-height:1.6">
      💡 <strong>Tip:</strong> Sau khi chỉnh xong, bấm <strong>LƯU</strong> để lưu. Có thể chỉnh thêm trong tab YAML nếu cần cấu hình nâng cao.
    </div>`;

    // ── Accordion toggles ────────────────────────────────────────
    ['general', 'appearance', 'sensors', 'alerts', 'devices', 'tts'].forEach(id => {
      const h = this.shadowRoot.getElementById('head-' + id);
      if (h) h.addEventListener('click', () => this._toggle(id));
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

// ── Hook editor vào card ─────────────────────────────────────
// Cần patch LiveDesk để HA biết có editor
LiveDesk.getConfigElement = function() {
  return document.createElement('live-desk-editor');
};
LiveDesk.getStubConfig = function() {
  return {
    type: 'custom:live-desk',
    name: 'Anh Long',
    temp_sensor:    'sensor.nhiet_do',
    humid_sensor:   'sensor.do_am',
    weather_entity: 'weather.home',
  };
};

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'live-desk',
  name: 'LiveDesk',
  description: 'LiveDesk — Live2D waifu trên dashboard, bubble thông minh, TTS linh hoạt',
  preview: true,
});
