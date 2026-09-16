const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { randomUUID, randomFillSync } = require('node:crypto');

function server(initialRows) {
    const rows = initialRows || [['standard', 'timestamp', '# computed', 'price']];
    let locked = false;
    let flushes = 0;
    const sheet = {
        getLastColumn: () => rows[0].length,
        getLastRow: () => rows.length,
        getRange: (r, c, height = 1, width = 1) => ({
            getValues: () => rows.slice(r - 1, r - 1 + height).map(row => row.slice(c - 1, c - 1 + width)),
            setValue: value => { assert.ok(locked); rows[r - 1][c - 1] = value; }
        }),
        appendRow: row => { assert.ok(locked); rows.push(row); }
    };
    let context = vm.createContext({
        PropertiesService: { getScriptProperties: () => ({ getProperty: () => 'test-token' }) },
        ContentService: { MimeType: { TEXT: 'text' }, createTextOutput: body => ({ setMimeType: () => body }) },
        LockService: { getScriptLock: () => ({
            waitLock: () => { assert.equal(locked, false); locked = true; },
            releaseLock: () => { locked = false; }
        }) },
        SpreadsheetApp: {
            getActiveSpreadsheet: () => ({ getSheetByName: () => sheet }),
            flush: () => { assert.ok(locked); flushes++; }
        }
    });
    vm.runInContext(fs.readFileSync('appscript.js', 'utf8'), context);
    return {
        rows,
        restart: () => {
            context = vm.createContext({ ...context });
            vm.runInContext(fs.readFileSync('appscript.js', 'utf8'), context);
        },
        post: body => context.doPost({ postData: { contents: JSON.stringify(body) } }),
        flushes: () => flushes,
        locked: () => locked
    };
}

const admission = () => ({
    authToken: 'test-token', requestId: randomUUID(),
    record: { standard: '2', price: '18.70', timestamp: '2026-09-11T10:00:00.123Z' }
});

test('ID before computed columns leaves formula cells unwritten despite historical blank IDs', () => {
    const app = server([
        ['standard', 'timestamp', 'price', 'submission-id', '# Date', '# Total visitors'],
        ['1', new Date('2026-09-10'), '9.50', '', 'existing computed date', 1],
        ['1', new Date('2026-09-10'), '9.50', '', 'existing computed date', 1]
    ]);
    const body = admission();
    assert.equal(app.post(body), 'Success');
    assert.equal(app.rows[3].length, 4);
    assert.equal(app.rows[3][3], body.requestId);
    assert.equal(app.rows[3][2], '18.70');
    assert.equal(app.post(body), 'Success');
    assert.equal(app.rows.length, 4);
    const legacy = admission();
    delete legacy.requestId;
    assert.equal(app.post(legacy), 'Success');
    assert.equal(app.rows[4].length, 4);
    assert.equal(app.rows[4][3], '');
    assert.equal(app.rows[1][4], 'existing computed date');
});

test('retry after a lost response appends once, including after a script restart', () => {
    const app = server();
    const body = admission();
    assert.equal(app.post(body), 'Success');
    app.restart();
    assert.equal(app.post(body), 'Success');
    assert.equal(app.rows.length, 2);
    assert.equal(app.rows[0].at(-1), 'submission-id');
    assert.equal(app.rows[1].at(-1), body.requestId);
    assert.equal(app.rows[1][2], '');
    assert.equal(app.rows[1][3], '18.70');
    assert.equal(app.flushes(), 1);
    assert.equal(app.locked(), false);
});

test('two legitimate identical admissions with different IDs both save', () => {
    const app = server();
    app.post(admission());
    app.post(admission());
    assert.equal(app.rows.length, 3);
});

test('legacy client still saves; unauthorized and invalid records do not', () => {
    const app = server();
    const old = admission();
    delete old.requestId;
    assert.equal(app.post(old), 'Success');
    assert.equal(app.rows[0].length, 4);
    assert.equal(app.post({ ...admission(), authToken: 'wrong' }), 'Unauthorized');
    assert.equal(app.post({ ...admission(), requestId: 'bad' }), 'Invalid submission ID');
    const bad = admission();
    bad.record.unknown = 'x';
    assert.match(app.post(bad), /not found/);
    assert.equal(app.rows.length, 2);
    assert.equal(app.locked(), false);
});

function client(storage = new Map(), secure = true) {
    const elements = new Map();
    let fields = { standard: '2' };
    const requests = [];
    const alerts = [];
    let resetCount = 0;
    let throwOnSuccess = false;
    let valid = true;
    function element(name) {
        if (!elements.has(name)) elements.set(name, {
            handlers: {}, disabled: false,
            on(event, handler) { this.handlers[event] = handler; return this; },
            submit(handler) { return this.on('submit', handler); },
            click(handler) { return this.on('click', handler); },
            change(handler) { return this.on('change', handler); },
            prop(key, value) { this[key] = value; return this; },
            text() { return this; },
            addClass() { return this; }, removeClass() { return this; }, focus() { return this; },
            is() { return false; },
            find(selector) { return element(selector); }, filter() { return this; }
        });
        return elements.get(name);
    }
    const form = element('form');
    form[0] = { checkValidity: () => valid, reset() {
        const event = { prevented: false, preventDefault() { this.prevented = true; } };
        form.handlers.reset(event);
        if (!event.prevented) { fields = { standard: '0' }; resetCount++; }
    } };
    const context = vm.createContext({
        $: element,
        bootstrap: { Modal: class {
            constructor(el) { this.success = el === 'success'; }
            hide() {}
            show() { if (this.success && throwOnSuccess) throw new Error('UI failure'); }
        } },
        sessionStorage: { getItem: key => storage.get(key) || null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) },
        localStorage: { getItem: () => 'test-token' },
        crypto: secure ? { randomUUID } : { getRandomValues: randomFillSync },
        FormData: class { constructor() { this.data = { ...fields }; } append(k, v) { this.data[k] = v; } entries() { return Object.entries(this.data); } },
        calculateTotalPrice: () => 18.7, calculateTotalDonations: () => 0,
        updateFormSummaryAndVisibility: () => {},
        appsScriptUrl: 'test', fetchTodayTotals: () => {},
        console: { warn() {}, error() {} }, alert: message => alerts.push(message),
        fetch: (url, options) => new Promise((resolve, reject) => requests.push({ body: JSON.parse(options.body), resolve, reject }))
    });
    element('#successModal')[0] = 'success';
    const html = fs.readFileSync('index.html', 'utf8');
    const source = html.slice(html.indexOf('    function initializeFormSubmission()'), html.indexOf('    function initializeLegacyPostcodeModal()'));
    vm.runInContext(source + '\ninitializeFormSubmission();', context);
    return {
        requests, alerts, storage,
        confirm: () => element('#confirmSubmit').handlers.click(),
        reset: () => form[0].reset(),
        resets: () => resetCount,
        disabled: () => element('#confirmSubmit').disabled,
        setFields: value => { fields = value; },
        failSuccessUI: () => { throwOnSuccess = true; },
        setValid: value => { valid = value; }
    };
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('HTTP LAN preview generates valid distinct UUIDs without randomUUID', async () => {
    const app = client(new Map(), false);
    app.confirm();
    const id = app.requests[0].body.requestId;
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    app.requests[0].resolve({ ok: true, text: async () => 'Success' });
    await settle();
    app.setFields({ standard: '2' });
    app.confirm();
    assert.notEqual(app.requests[1].body.requestId, id);
});

test('final confirmation refuses an admission that is no longer valid', () => {
    const app = client();
    app.setValid(false);
    app.confirm();
    assert.equal(app.requests.length, 0);
    assert.match(app.alerts[0], /required admission fields/);
    assert.equal(app.disabled(), false);
});

test('surveys stay visible and required when members are added or removed', () => {
    const elements = new Map();
    const element = selector => {
        if (!elements.has(selector)) elements.set(selector, {
            value: '0', visible: true, required: true,
            val() { return this.value; },
            text() {},
            toggle(value) { this.visible = value; },
            prop(key, value) { this[key] = value; }
        });
        return elements.get(selector);
    };
    const context = vm.createContext({
        $: element,
        visitorTypes: [
            { id: 'member', isAdult: true },
            { id: 'standard', isAdult: true },
            { id: 'child', isAdult: false }
        ],
        formState: { childTypeId: 'child', hotelDiscountTypeId: 'hotel-discount' },
        calculateTotalPrice: () => 0, updateReasonForVisitMode: () => {}
    });
    const html = fs.readFileSync('index.html', 'utf8');
    const source = html.slice(html.indexOf('    function updateFormSummaryAndVisibility()'), html.indexOf('    async function verifyToken('));
    vm.runInContext(source, context);
    function state(member, standard, child) {
        element('#member').value = String(member);
        element('#standard').value = String(standard);
        element('#child').value = String(child);
        context.updateFormSummaryAndVisibility();
        assert.equal(element('#postcode, #reason-for-visit, #first-visit, #hear-about-us').required, true);
        assert.equal(element('.grid-container.other').visible, true);
    }
    state(0, 0, 0);
    state(1, 0, 0);
    state(2, 0, 0);
    state(1, 0, 0);
    state(0, 0, 0);
    state(0, 1, 0);
    state(1, 1, 0);
    state(0, 1, 0);
    state(1, 0, 1);
    state(0, 0, 1);
    state(0, 2, 0);
});

test('rapid confirmation taps send one request and block reset while saving', async () => {
    const app = client();
    app.confirm(); app.confirm(); app.reset();
    assert.equal(app.requests.length, 1);
    assert.equal(app.resets(), 0);
    assert.equal(app.disabled(), true);
    app.requests[0].resolve({ ok: true, text: async () => 'Success' });
    await settle();
    assert.equal(app.resets(), 1);
    assert.equal(app.disabled(), false);
    assert.equal(app.storage.size, 0);
});

test('uncertain failure retains ID and timestamp across retry and page reload', async () => {
    const app = client();
    app.confirm();
    const original = app.requests[0].body;
    app.requests[0].reject(new Error('Network failed after save'));
    await settle();
    assert.match(app.alerts[0], /safely retry/);
    assert.equal(app.resets(), 0);
    app.confirm();
    assert.deepEqual(app.requests[1].body, original);
    const reloaded = client(app.storage);
    reloaded.confirm();
    assert.deepEqual(reloaded.requests[0].body, original);
});

test('reset starts a new admission; success UI errors cannot leave saved values', async () => {
    const app = client();
    app.confirm();
    app.requests[0].reject(new Error('lost response'));
    await settle();
    app.reset();
    app.setFields({ standard: '2' });
    app.confirm();
    assert.notEqual(app.requests[1].body.requestId, app.requests[0].body.requestId);
    app.failSuccessUI();
    app.requests[1].resolve({ ok: true, text: async () => 'Success' });
    await settle();
    assert.equal(app.resets(), 2);
    assert.equal(app.storage.size, 0);
    assert.match(app.alerts.at(-1), /admission was saved/);
});
