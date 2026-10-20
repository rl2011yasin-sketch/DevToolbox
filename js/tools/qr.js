(function () {
  'use strict';

  var QR_LIB_URLS = [
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
    'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
  ];

  var libPromise = null;

  function loadLib() {
    if (window.QRCode && window.QRCode.toCanvas) return Promise.resolve(window.QRCode);
    if (libPromise) return libPromise;

    libPromise = new Promise(function (resolve, reject) {
      var i = 0;
      function tryNext() {
        if (i >= QR_LIB_URLS.length) return reject(new Error('All CDNs failed'));
        var url = QR_LIB_URLS[i++];
        var s = document.createElement('script');
        s.src = url;
        s.async = true;
        var timer = setTimeout(function () {
          s.remove();
          tryNext();
        }, 6000);
        s.onload = function () {
          clearTimeout(timer);
          if (window.QRCode && window.QRCode.toCanvas) resolve(window.QRCode);
          else tryNext();
        };
        s.onerror = function () {
          clearTimeout(timer);
          s.remove();
          tryNext();
        };
        document.head.appendChild(s);
      }
      tryNext();
    });
    return libPromise;
  }

  window.DT.register('qr', {
    render: function (c) {
      c.innerHTML =
        '<header class="tool-header"><h2>📱 QR Code Generator</h2>' +
        '<p>Turn any text or URL into a downloadable QR code.</p></header>' +
        '<div class="card">' +
          '<div id="qr-status" style="padding:10px;background:var(--sideBg);border-radius:4px;font-size:12px;color:var(--sideFgDim);margin-bottom:14px">⏳ Loading QR library…</div>' +
          '<div class="field"><label>Text or URL</label>' +
          '<input type="text" id="qr-text" value="https://github.com" /></div>' +
          '<div class="field"><label>Size: <strong id="size-val">300</strong>px</label>' +
          '<input type="range" id="qr-size" min="150" max="600" step="50" value="300" style="accent-color:var(--accent)" /></div>' +
          '<div class="btn-row">' +
            '<button class="btn btn-primary" id="qr-gen" disabled>✨ Generate</button>' +
            '<button class="btn btn-secondary" id="qr-dl">⬇️ Download PNG</button>' +
          '</div>' +
          '<div class="qr-wrap"><canvas id="qr-canvas" class="qr-canvas" width="300" height="300"></canvas></div>' +
        '</div>';

      var $ = function (s) { return c.querySelector(s); };
      var text = $('#qr-text'), size = $('#qr-size'), canvas = $('#qr-canvas');
      var statusEl = $('#qr-status'), genBtn = $('#qr-gen');
      var libReady = false;

      loadLib().then(function () {
        libReady = true;
        statusEl.textContent = '✓ QR library ready';
        statusEl.style.color = 'var(--success)';
        genBtn.disabled = false;
        window.DT.log('QR library loaded', 'success');
        generate();
      }).catch(function () {
        statusEl.innerHTML = '✗ Could not load QR library (CDN blocked).<br>' +
          '<span style="font-size:11px;opacity:.7">Download qrcode.min.js from github.com/soldair/node-qrcode/releases and put it in js/tools/ — then reload.</span>';
        statusEl.style.color = 'var(--danger)';
        window.DT.log('QR library failed to load — network/CDN issue', 'error');
      });

      size.addEventListener('input', function () {
        $('#size-val').textContent = size.value;
        if (libReady) generate();
      });

      function generate() {
        if (!libReady || !window.QRCode || !window.QRCode.toCanvas) return;
        if (!text.value.trim()) return;
        try {
          window.QRCode.toCanvas(canvas, text.value, {
            width: parseInt(size.value, 10),
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
          }, function (err) {
            if (err) { console.error(err); window.DT.log('QR error: ' + err.message, 'error'); }
          });
        } catch (e) {
          console.error(e);
          window.DT.log('QR error: ' + e.message, 'error');
        }
      }

      genBtn.addEventListener('click', function () {
        generate();
        window.DT.log('QR code generated', 'success');
      });
      $('#qr-dl').addEventListener('click', function () {
        try {
          var a = document.createElement('a');
          a.download = 'qrcode.png';
          a.href = canvas.toDataURL('image/png');
          a.click();
          window.DT.log('QR code downloaded', 'success');
        } catch (e) {
          window.DT.log('Download failed: ' + e.message, 'error');
        }
      });
      text.addEventListener('input', function () { if (libReady) generate(); });
    }
  });
})();
