(function () {
  'use strict';

  function hslToHex(h, s, l) {
    l /= 100;
    var a = (s * Math.min(l, 1 - l)) / 100;
    function f(n) {
      var k = (n + h / 30) % 12;
      var color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    }
    return '#' + f(0) + f(8) + f(4);
  }
  function palette() {
    var base = Math.floor(Math.random() * 360);
    return Array.from({ length: 5 }, function (_, i) {
      var h = (base + i * 40 + Math.random() * 20) % 360;
      var s = 55 + Math.floor(Math.random() * 30);
      var l = 40 + Math.floor(Math.random() * 30);
      return hslToHex(h, s, l);
    });
  }

  window.DT.register('color', {
    render: function (c) {
      c.innerHTML =
        '<header class="tool-header"><h2>🎨 Color Palette Generator</h2>' +
        '<p>Click any swatch to copy its HEX value.</p></header>' +
        '<div class="card">' +
          '<div class="btn-row" style="margin-top:0">' +
            '<button class="btn btn-primary" id="pal-gen">🎲 New Palette</button>' +
            '<span style="align-self:center;color:var(--sideFgDim);font-size:12px">Press Space to regenerate</span>' +
          '</div>' +
          '<div class="palette" id="palette"></div>' +
        '</div>';

      var el = c.querySelector('#palette');
      function draw() {
        el.innerHTML = '';
        palette().forEach(function (color) {
          var sw = document.createElement('div');
          sw.className = 'swatch';
          sw.style.background = color;
          var label = document.createElement('span');
          label.textContent = color.toUpperCase();
          sw.appendChild(label);
          sw.addEventListener('click', function () { window.DT.copy(color); });
          el.appendChild(sw);
        });
      }
      c.querySelector('#pal-gen').addEventListener('click', function () {
        draw();
        window.DT.log('New palette generated', 'success');
      });
      document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' && ['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) === -1) {
          e.preventDefault();
          draw();
        }
      });
      draw();
    }
  });
})();
