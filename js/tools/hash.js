(function () {
  'use strict';

  var ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

  function digest(algo, text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest(algo, data).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  window.DT.register('hash', {
    render: function (c) {
      c.innerHTML =
        '<header class="tool-header"><h2>#️⃣ Hash Generator</h2>' +
        '<p>Generate SHA hashes using Web Crypto API.</p></header>' +
        '<div class="card">' +
          '<div class="field"><label>Input text</label>' +
          '<textarea id="h-in" placeholder="Enter text to hash…"></textarea></div>' +
          '<div id="h-res" style="margin-top:14px"></div>' +
        '</div>';

      var input = c.querySelector('#h-in');
      var results = c.querySelector('#h-res');

      function update() {
        results.innerHTML = '';
        var text = input.value;
        if (!text) return;
        ALGOS.forEach(function (algo) {
          digest(algo, text).then(function (hash) {
            var row = document.createElement('div');
            row.className = 'hash-row';
            row.innerHTML =
              '<div class="hash-label">' + algo + '</div>' +
              '<div class="hash-value">' + hash + '</div>' +
              '<button class="icon-btn" title="Copy">📋</button>';
            row.querySelector('button').addEventListener('click', function () { window.DT.copy(hash); });
            results.appendChild(row);
          }).catch(function (e) {
            window.DT.log('Hash error: ' + e.message, 'error');
          });
        });
      }

      var timer;
      input.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { update(); window.DT.log('Hashes recalculated', 'dim'); }, 250);
      });
    }
  });
})();
