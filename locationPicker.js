(() => {
  const STYLE_ID = 'lp-styles';
  const MODE_UK = 'UK';
  const MODE_COUNTRY = 'COUNTRY';

  const TEMPLATE_HTML = `
  <div id="lp_backdrop" class="lp-root lpBackdrop" aria-hidden="true">
    <div id="lp_modal" class="lpModal" role="dialog" aria-modal="true" aria-labelledby="lp_title">
      <h1 id="lp_title">Enter postcode</h1>

      <div id="lp_ukInput" class="valueBox">
        <input id="lp_outward" class="lpValue" type="text" inputmode="none" autocomplete="off" spellcheck="false" aria-label="Outward code" readonly />
      </div>

      <div id="lp_countryInput" class="valueBox hidden">
        <input id="lp_countrySearch" class="lpValue" type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Country" />
      </div>

      <div class="subRow">
        <span id="lp_modeLink" class="subLink" role="button" tabindex="0">Outside the UK?</span>
      </div>

      <div class="kbd" id="lp_ukKbd">
        <div class="kbdWrap">
          <div>
            <div class="grid" id="lp_gridDigits" aria-label="Numbers keypad"></div>
          </div>

          <div id="lp_lettersSection">
            <div class="grid" id="lp_gridLetters" aria-label="Letters keypad"></div>
          </div>

          <div class="kbdRow">
            <button id="lp_btnCancel" class="ghost" type="button">Cancel</button>
            <button id="lp_btnDone" class="primary" type="button" disabled>Use this location</button>
          </div>
        </div>
      </div>

      <div id="lp_countryPanel" class="countryPanel hidden">
        <div class="countryList" id="lp_countryList" role="listbox" aria-label="Countries"></div>

        <div class="kbdRow">
          <button id="lp_btnCountryCancel" class="ghost" type="button">Cancel</button>
          <button id="lp_btnCountryDone" class="primary" type="button" disabled>Use this location</button>
        </div>
      </div>

    </div>
  </div>
  `;

  const STYLE_CONTENT = `
  .lp-root button{font-size:16px;border:1px solid #cfd6dd;background:#fff;border-radius:12px;padding:10px 12px;cursor:pointer;user-select:none;}
  .lp-root button:active{transform:translateY(1px)}
  .lp-root button.primary{background:#0078d4;border-color:#0078d4;color:#fff;}
  .lp-root button.ghost{background:transparent;}
  .lp-root button[disabled]{opacity:.35;cursor:not-allowed;}
  .lp-root .muted{opacity:.35;}
  .lp-root .hidden{display:none !important;}
  .lp-root.lpBackdrop{position:fixed;inset:0;background:rgba(17,24,39,.35);display:none;align-items:center;justify-content:center;padding:16px;z-index:9999;}
  .lp-root.lpBackdrop.open{display:flex;}
  .lp-root .lpModal{width:min(720px, 100%);max-height:92vh;overflow:auto;background:#fff;border-radius:14px;box-shadow:0 18px 70px rgba(0,0,0,.25);padding:16px;}
  .lp-root h1{font-size:20px;margin:0 0 10px;text-align:center;}
  .lp-root .valueBox{display:flex;align-items:center;justify-content:center;margin:10px 0 10px;}
  .lp-root .lpValue{font-size:42px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;text-align:center;padding:14px 16px;border-radius:16px;border:2px solid #e3e8ee;background:#fbfcfd;width:min(520px, 100%);}
  .lp-root .lpValue:focus{outline:4px solid rgba(0,120,212,.18);border-color:#0078d4;background:#fff;}
  .lp-root .subRow{display:flex;justify-content:center;margin:2px 0 12px;}
  .lp-root .subLink{display:inline-flex;align-items:center;justify-content:center;padding:8px 12px;font-size:17px;font-weight:600;color:#111827;text-decoration:underline;text-decoration-thickness:0.12em;text-underline-offset:3px;cursor:pointer;user-select:none;border-radius:10px;}
  .lp-root .subLink:focus-visible{outline:3px solid rgba(0,120,212,.25);outline-offset:3px;}
  .lp-root .subLink:active{transform:translateY(1px)}
  .lp-root .kbd{margin-top:6px;display:flex;flex-direction:column;gap:10px;}
  .lp-root .grid{display:grid;grid-template-columns:repeat(10,1fr);gap:8px;}
  .lp-root .grid button{padding:10px 0;min-height:42px;}
  .lp-root .grid button.bsKey{grid-column:-3 / -1;font-weight:700;}
  .lp-root .kbdWrap{display:flex;flex-direction:column;gap:12px;}
  .lp-root .kbdRow{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:center;}
  .lp-root .countryPanel{display:flex;flex-direction:column;gap:10px;}
  .lp-root .countryList{max-height:320px;overflow:auto;border:1px solid #e3e8ee;border-radius:14px;background:#fff;padding:6px;}
  .lp-root .countryItem{width:100%;text-align:left;border:1px solid transparent;background:transparent;border-radius:12px;padding:10px 12px;font-size:16px;cursor:pointer;}
  .lp-root .countryItem:hover{background:#f6f7f8;}
  .lp-root .countryItem[aria-selected="true"]{background:#eaf3ff;border-color:#bcd9ff;}
  .lp-root .countryEmpty{padding:14px 12px;color:#6b7280;font-size:14px;}
  @media (max-width:520px){
    .lp-root .grid{grid-template-columns:repeat(7,1fr)}
    .lp-root .lpValue{font-size:34px;}
    .lp-root .countryList{max-height:280px;}
  }
  `;

  const readyPromise = new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else {
      resolve();
    }
  });

  const AREA_CODES = [
    'AB','AL','B','BA','BB','BD','BH','BL','BN','BR','BS','BT','CA','CB','CF','CH','CM','CO','CR','CT','CV',
    'CW','DA','DD','DE','DG','DH','DL','DN','DT','DY','E','EC','EH','EN','EX','FK','FY','G','GL','GU','GY',
    'HA','HD','HG','HP','HR','HS','HU','HX','IG','IL','IM','IP','IV','JE','KA','KT','KW','KY','L','LA','LD',
    'LE','LL','LN','LS','LU','M','ME','MK','ML','N','NE','NG','NN','NP','NR','NW','OL','OX','PA','PE','PH',
    'PL','PO','PR','RG','RH','RM','S','SA','SE','SG','SK','SL','SM','SN','SO','SP','SR','SS','ST','SW',
    'SY','TA','TD','TF','TN','TQ','TR','TS','TW','UB','W','WA','WC','WD','WF','WN','WR','WS','WV','YO','ZE'
  ];

  const OUTWARD_RE = /^[A-Z]{1,2}[0-9]{1,2}$/;
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const DIGITS = '1234567890'.split('');

  const COUNTRIES = [
    'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan',
    'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
    'Cambodia','Cameroon','Canada','Cape Verde','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo (DRC)','Congo (Republic)','Costa Rica','Cote d\'Ivoire','Croatia','Cuba','Cyprus','Czechia',
    'Denmark','Djibouti','Dominica','Dominican Republic',
    'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
    'Fiji','Finland','France',
    'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana',
    'Haiti','Honduras','Hungary',
    'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
    'Jamaica','Japan','Jordan',
    'Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan',
    'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
    'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
    'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway',
    'Oman',
    'Pakistan','Palau','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
    'Qatar',
    'Romania','Russia','Rwanda',
    'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
    'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
    'Uganda','Ukraine','United Arab Emirates','United States','Uruguay','Uzbekistan',
    'Vanuatu','Vatican City','Venezuela','Vietnam',
    'Yemen',
    'Zambia','Zimbabwe'
  ];

  let $backdrop;
  let $modal;
  let $title;
  let $modeLink;
  let $ukInputWrap;
  let $countryInputWrap;
  let $ukKbd;
  let $countryPanel;
  let $outward;
  let $countrySearch;
  let $countryList;
  let $letters;
  let $digits;
  let $btnDone;
  let $btnCancel;
  let $btnCountryDone;
  let $btnCountryCancel;

  let mode = MODE_UK;
  let _resolve = null;
  let _isOpen = false;
  let _rememberModeKey = null;
  let listenersBound = false;
  let isSetup = false;

  let area = '';
  let d1 = '';
  let d2 = '';
  let selectedCountry = '';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.textContent = STYLE_CONTENT;
    document.head.appendChild(style);
  }

  function injectMarkup() {
    if (document.getElementById('lp_backdrop')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = TEMPLATE_HTML.trim();
    const child = wrapper.firstElementChild;
    if (child) document.body.appendChild(child);
  }

  function cacheElements() {
    const el = (id) => document.getElementById(id);
    $backdrop = el('lp_backdrop');
    $modal = el('lp_modal');
    $title = el('lp_title');
    $modeLink = el('lp_modeLink');
    $ukInputWrap = el('lp_ukInput');
    $countryInputWrap = el('lp_countryInput');
    $ukKbd = el('lp_ukKbd');
    $countryPanel = el('lp_countryPanel');
    $outward = el('lp_outward');
    $countrySearch = el('lp_countrySearch');
    $countryList = el('lp_countryList');
    $letters = el('lp_gridLetters');
    $digits = el('lp_gridDigits');
    $btnDone = el('lp_btnDone');
    $btnCancel = el('lp_btnCancel');
    $btnCountryDone = el('lp_btnCountryDone');
    $btnCountryCancel = el('lp_btnCountryCancel');
  }

  function openModal() {
    $backdrop.classList.add('open');
    $backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    _isOpen = true;
  }

  function closeModal() {
    $backdrop.classList.remove('open');
    $backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    _isOpen = false;
  }

  function safeResolve(val) {
    if (typeof _resolve === 'function') {
      const fn = _resolve;
      _resolve = null;
      fn(val);
    }
  }

  function cancel() {
    closeModal();
    safeResolve(null);
  }

  function confirmUk(v) {
    if (_rememberModeKey) {
      try { localStorage.setItem(_rememberModeKey, MODE_UK); } catch {}
    }
    closeModal();
    safeResolve({ type: 'uk', value: v });
  }

  function confirmCountry(v) {
    if (_rememberModeKey) {
      try { localStorage.setItem(_rememberModeKey, MODE_COUNTRY); } catch {}
    }
    closeModal();
    safeResolve({ type: 'country', value: v });
  }

  function setMode(next) {
    mode = next;

    const isUk = mode === MODE_UK;
    $ukInputWrap.classList.toggle('hidden', !isUk);
    $ukKbd.classList.toggle('hidden', !isUk);

    $countryInputWrap.classList.toggle('hidden', isUk);
    $countryPanel.classList.toggle('hidden', isUk);

    if ($title) $title.textContent = isUk ? 'Enter postcode' : 'Select country';
    $modeLink.textContent = isUk ? 'Outside the UK?' : 'Use a UK postcode';

    if (isUk) {
      setTimeout(() => $outward.focus(), 0);
    } else {
      setTimeout(() => $countrySearch.focus(), 0);
      renderCountryList();
      validateCountryAndToggleDone();
    }
  }

  function currentUkValue() {
    return (area + d1 + d2).toUpperCase();
  }

  function resetUk() {
    area = '';
    d1 = '';
    d2 = '';
    setUkValueFromState();
  }

  function setUkValueFromState() {
    $outward.value = currentUkValue();
    validateUkAndToggleDone();
    renderUkKeyEnables();
  }

  function areaIsValidAreaOnly(a) {
    return AREA_CODES.includes(a);
  }

  function areaIsValidForInput(v) {
    const letters = (v.match(/^[A-Z]{1,2}/) || [''])[0];
    return AREA_CODES.includes(letters);
  }

  function validateUkAndToggleDone() {
    const v = $outward.value.trim().toUpperCase().replace(/\s+/g, '');
    $outward.value = v;
    const ok = OUTWARD_RE.test(v) && areaIsValidForInput(v);
    $btnDone.disabled = !ok;
    return ok;
  }

  function computeUkEnabledKeys() {
    const enabledLetters = new Set();
    const enabledDigits = new Set();

    const enableDigitsIfAreaReady = () => {
      if (areaIsValidAreaOnly(area)) {
        if (!d1) { DIGITS.forEach(d => enabledDigits.add(d)); return; }
        if (d1 && !d2) { DIGITS.forEach(d => enabledDigits.add(d)); return; }
      }
    };

    if (!area) {
      const allowedFirstLetters = new Set(AREA_CODES.map(a => a[0]));
      LETTERS.forEach(L => { if (allowedFirstLetters.has(L)) enabledLetters.add(L); });
      return { enabledLetters, enabledDigits };
    }

    if (!d1) {
      if (area.length === 1) {
        const seconds = new Set(
          AREA_CODES.filter(a => a.length === 2 && a.startsWith(area)).map(a => a[1])
        );
        seconds.forEach(L2 => enabledLetters.add(L2));
        enableDigitsIfAreaReady();
        return { enabledLetters, enabledDigits };
      }
      enableDigitsIfAreaReady();
      return { enabledLetters, enabledDigits };
    }

    enableDigitsIfAreaReady();
    return { enabledLetters, enabledDigits };
  }

  function renderUkKeyboard() {
    $letters.innerHTML = '';
    $digits.innerHTML = '';

    LETTERS.forEach(L => {
      const starts = AREA_CODES.filter(a => a.startsWith(L));
      const oneLetterValid = AREA_CODES.includes(L);
      const twoLetterSeconds = starts.filter(a => a.length === 2).map(a => a[1]);
      const uniqueSeconds = [...new Set(twoLetterSeconds)];

      let label = L;
      let composite = '';
      if (!oneLetterValid && uniqueSeconds.length === 1) {
        label = L + uniqueSeconds[0];
        composite = uniqueSeconds[0];
      }

      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.dataset.key = L;
      b.dataset.composite = composite;
      b.dataset.firstLabel = label;
      b.dataset.secondLabel = L;
      b.addEventListener('click', () => onUkKeyPress(L));
      $letters.appendChild(b);
    });

    const bs = document.createElement('button');
    bs.type = 'button';
    bs.textContent = '⌫';
    bs.dataset.key = 'BACKSPACE';
    bs.classList.add('bsKey');
    bs.addEventListener('click', ukBack);
    $letters.appendChild(bs);

    DIGITS.forEach(D => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = D;
      b.dataset.key = D;
      b.addEventListener('click', () => onUkKeyPress(D));
      $digits.appendChild(b);
    });
  }

  function renderUkKeyEnables() {
    const { enabledLetters, enabledDigits } = computeUkEnabledKeys();

    const showFirstLetterLabels = (area === '');
    $letters.querySelectorAll('button').forEach(b => {
      const k = b.dataset.key;
      if (k === 'BACKSPACE') {
        b.disabled = !(area || d1 || d2);
        b.classList.toggle('muted', b.disabled);
        return;
      }
      const enabled = enabledLetters.has(k);
      b.disabled = !enabled;
      b.classList.toggle('muted', !enabled);
      b.textContent = showFirstLetterLabels ? (b.dataset.firstLabel || k) : (b.dataset.secondLabel || k);
    });

    $digits.querySelectorAll('button').forEach(b => {
      const enabled = enabledDigits.has(b.dataset.key);
      b.disabled = !enabled;
      b.classList.toggle('muted', !enabled);
    });
  }

  function onUkKeyPress(key) {
    if (mode !== MODE_UK) return;

    const isLetter = /^[A-Z]$/.test(key);
    const isDigit = /^[0-9]$/.test(key);

    if (isLetter) {
      if (d1) return;

      const btn = [...$letters.querySelectorAll('button')].find(b => b.dataset.key === key);
      if (!btn) return;

      if (!area && btn.dataset.composite) {
        area = key + btn.dataset.composite;
        setUkValueFromState();
        return;
      }

      if (!area) {
        area = key;
        setUkValueFromState();
        return;
      }

      if (area.length === 1) {
        const candidate = area + key;
        if (AREA_CODES.includes(candidate)) {
          area = candidate;
          setUkValueFromState();
        }
      }
      return;
    }

    if (isDigit) {
      if (!areaIsValidAreaOnly(area)) return;
      if (!d1) { d1 = key; setUkValueFromState(); return; }
      if (!d2) { d2 = key; setUkValueFromState(); return; }
    }
  }

  function ukBack() {
    if (d2) { d2 = ''; setUkValueFromState(); return; }
    if (d1) { d1 = ''; setUkValueFromState(); return; }
    if (area.length === 2) { area = area[0]; setUkValueFromState(); return; }
    if (area.length === 1) { area = ''; setUkValueFromState(); return; }
  }

  function trySetUkInitial(val) {
    const v = String(val || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!v) { resetUk(); return false; }
    if (!(OUTWARD_RE.test(v) && areaIsValidForInput(v))) { resetUk(); return false; }

    const m = v.match(/^([A-Z]{1,2})([0-9]{1,2})$/);
    if (!m) { resetUk(); return false; }
    area = m[1];
    d1 = m[2][0] || '';
    d2 = m[2][1] || '';
    setUkValueFromState();
    return true;
  }

  function normalise(s) {
    return String(s || '').trim().toLowerCase();
  }

  function resetCountry() {
    selectedCountry = '';
    $countrySearch.value = '';
    $btnCountryDone.disabled = true;
    renderCountryList();
  }

  function filterCountries(query) {
    const q = normalise(query);
    if (!q) return COUNTRIES.slice();
    return COUNTRIES.filter(c => normalise(c).includes(q));
  }

  function renderCountryList() {
    if (mode !== MODE_COUNTRY) return;

    const query = $countrySearch.value;
    const matches = filterCountries(query);

    $countryList.innerHTML = '';

    if (matches.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'countryEmpty';
      empty.textContent = 'No matches';
      $countryList.appendChild(empty);
      return;
    }

    matches.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'countryItem';
      btn.textContent = c;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', String(normalise(c) === normalise(selectedCountry)));
      btn.addEventListener('click', () => {
        selectedCountry = c;
        $countrySearch.value = c;
        renderCountryList();
        validateCountryAndToggleDone();
      });
      $countryList.appendChild(btn);
    });
  }

  function validateCountryAndToggleDone() {
    const ok = normalise($countrySearch.value) === normalise(selectedCountry) && !!selectedCountry;
    $btnCountryDone.disabled = !ok;
    return ok;
  }

  function trySetCountryInitial(val) {
    const v = String(val || '').trim();
    if (!v) { resetCountry(); return false; }
    const match = COUNTRIES.find(c => normalise(c) === normalise(v));
    if (!match) { resetCountry(); return false; }
    selectedCountry = match;
    $countrySearch.value = match;
    renderCountryList();
    validateCountryAndToggleDone();
    return true;
  }

  function bindEventHandlers() {
    if (listenersBound) return;

    $backdrop.addEventListener('click', (e) => {
      if (e.target === $backdrop) cancel();
    });

    document.addEventListener('keydown', (e) => {
      if (!_isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    });

    $modeLink.addEventListener('click', () => {
      if (mode === MODE_UK) resetUk();
      else resetCountry();
      setMode(mode === MODE_UK ? MODE_COUNTRY : MODE_UK);
    });

    $modeLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (mode === MODE_UK) resetUk();
        else resetCountry();
        setMode(mode === MODE_UK ? MODE_COUNTRY : MODE_UK);
      }
    });

    $btnCancel.addEventListener('click', cancel);
    $btnCountryCancel.addEventListener('click', cancel);

    $btnDone.addEventListener('click', () => {
      const v = $outward.value.trim().toUpperCase().replace(/\s+/g, '');
      if (!(OUTWARD_RE.test(v) && areaIsValidForInput(v))) return;
      confirmUk(v);
    });

    $btnCountryDone.addEventListener('click', () => {
      if (!validateCountryAndToggleDone()) return;
      confirmCountry(selectedCountry);
    });

    $countrySearch.addEventListener('input', () => {
      if (normalise($countrySearch.value) !== normalise(selectedCountry)) selectedCountry = '';
      renderCountryList();
      validateCountryAndToggleDone();
    });

    listenersBound = true;
  }

  function setupOnce() {
    if (isSetup) return;
    injectStyles();
    injectMarkup();
    cacheElements();
    bindEventHandlers();
    renderUkKeyboard();
    resetUk();
    resetCountry();
    isSetup = true;
  }

  async function ensureSetup() {
    await readyPromise;
    setupOnce();
  }

  function deriveInitialFromValue(val) {
    const v = String(val || '').trim();
    if (!v) return null;
    const ukCandidate = v.toUpperCase().replace(/\s+/g, '');
    if (OUTWARD_RE.test(ukCandidate) && areaIsValidForInput(ukCandidate)) {
      return { type: 'uk', value: ukCandidate };
    }
    return { type: 'country', value: v };
  }

  async function open(options = {}) {
    await ensureSetup();
    const { initial = null, rememberModeKey = null } = options || {};

    if (_isOpen) cancel();

    _rememberModeKey = rememberModeKey || null;

    let desiredMode = MODE_UK;
    if (initial && (initial.type === 'uk' || initial.type === 'country')) {
      desiredMode = initial.type === 'uk' ? MODE_UK : MODE_COUNTRY;
    } else if (_rememberModeKey) {
      try {
        const remembered = localStorage.getItem(_rememberModeKey);
        if (remembered === MODE_COUNTRY || remembered === MODE_UK) desiredMode = remembered;
      } catch {}
    }

    resetUk();
    resetCountry();

    if (initial && initial.type === 'uk') trySetUkInitial(initial.value);
    if (initial && initial.type === 'country') trySetCountryInitial(initial.value);

    setMode(desiredMode);
    openModal();

    return new Promise((resolve) => { _resolve = resolve; });
  }

  function attachToInput(target, options = {}) {
    let cleanup = () => {};
    ensureSetup().then(() => {
      const input = typeof target === 'string' ? document.querySelector(target) : target;
      if (!input) {
        console.warn('[LocationPicker] attachToInput: target not found', target);
        return;
      }

      const rememberModeKey = options.rememberModeKey || 'locationPicker:lastMode';
      const onConfirm = typeof options.onConfirm === 'function' ? options.onConfirm : null;
      const getInitial = typeof options.getInitial === 'function' ? options.getInitial : deriveInitialFromValue;

      const handleOpen = async () => {
        const initial = getInitial(input.value);
        const res = await open({ initial, rememberModeKey });
        if (!res) return;
        input.value = res.value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        if (onConfirm) onConfirm(res);
      };

      input.setAttribute('readonly', 'readonly');
      input.setAttribute('inputmode', 'none');
      input.setAttribute('aria-haspopup', 'dialog');

      input.addEventListener('focus', handleOpen);
      input.addEventListener('click', handleOpen);

      cleanup = () => {
        input.removeEventListener('focus', handleOpen);
        input.removeEventListener('click', handleOpen);
        input.removeAttribute('readonly');
        input.removeAttribute('inputmode');
        input.removeAttribute('aria-haspopup');
      };
    });

    return cleanup;
  }

  window.LocationPicker = { open, attachToInput };
})();
