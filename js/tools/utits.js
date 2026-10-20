const CONFIG = {
  Length: { units: { mm: ['Millimeter', 0.001], cm: ['Centimeter', 0.01], m: ['Meter', 1], km: ['Kilometer', 1000], in: ['Inch', 0.0254], ft: ['Foot', 0.3048], yd: ['Yard', 0.9144], mi: ['Mile', 1609.344] } },
  Mass:   { units: { mg: ['Milligram', 0.001], g: ['Gram', 1], kg: ['Kilogram', 1000], oz: ['Ounce', 28.3495], lb: ['Pound', 453.592] } },
  Temperature: { special: true, units: { C: ['Celsius'], F: ['Fahrenheit'], K: ['Kelvin'] } },
  Data:   { units: { bit: ['Bit', 0.125], B: ['Byte', 1], KB: ['Kilobyte', 1024], MB: ['Megabyte', 1024 ** 2], GB: ['Gigabyte', 1024 ** 3], TB: ['Terabyte', 1024 ** 4] } },
};

function temp(v, from, to) {
  let c;
  if (from === 'C') c = v;
  else if (from === 'F') c = (v - 32) * 5 / 9;
  else c = v - 273.15;
  if (to === 'C') return c;
  if (to === 'F') return c * 9 / 5 + 32;
  return c + 273.15;
}

function convert(v, from, to, cat) {
  const cfg = CONFIG[cat];
  if (cfg.special) return temp(v, from, to);
  return (v * cfg.units[from][1]) / cfg.units[to][1];
}

function fmt(n) {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(4);
  return parseFloat(n.toFixed(6)).toString();
}

export function render(c) {
  c.innerHTML = `
    <header class="tool-header">
      <h2>📏 Unit Converter</h2>
      <p>Convert length, mass, temperature & data sizes.</p>
    </header>
    <div class="card">
      <div class="field">
        <label>Category</label>
        <select id="cat"></select>
      </div>
      <div class="field">
        <label>From</label>
        <input type="number" id="val" value="1" />
        <select id="from"></select>
      </div>
      <div class="conv-row">
        <div></div>
        <button class="conv-swap" id="swap">⇅</button>
        <div></div>
      </div>
      <div class="field">
        <label>To</label>
        <input type="text" id="result" readonly />
        <select id="to"></select>
      </div>
    </div>
  `;

  const $ = (s) => c.querySelector(s);
  const cat = $('#cat'), from = $('#from'), to = $('#to'), val = $('#val'), result = $('#result');

  cat.innerHTML = Object.keys(CONFIG).map((k) => `<option>${k}</option>`).join('');

  function populate() {
    const units = CONFIG[cat.value].units;
    const opts = Object.entries(units).map(([k, v]) => `<option value="${k}">${v[0]} (${k})</option>`).join('');
    from.innerHTML = opts;
    to.innerHTML = opts;
    const keys = Object.keys(units);
    from.value = keys[0];
    to.value = keys[1] || keys[0];
    update();
  }

  function update() {
    const v = parseFloat(val.value);
    result.value = isNaN(v) ? '' : fmt(convert(v, from.value, to.value, cat.value));
  }

  cat.addEventListener('change', populate);
  from.addEventListener('change', update);
  to.addEventListener('change', update);
  val.addEventListener('input', update);
  $('#swap').addEventListener('click', () => {
    const tmp = from.value;
    from.value = to.value;
    to.value = tmp;
    update();
  });

  populate();
}