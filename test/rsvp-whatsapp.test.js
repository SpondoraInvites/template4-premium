const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const config = fs.readFileSync(path.join(__dirname, '..', 'config.js'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

test('RSVP config provides a WhatsApp recipient for delivery', () => {
  assert.match(config, /rsvp:\s*\{[\s\S]*?whatsapp:\s*"\d+"/);
});

test('RSVP submission opens a prefilled WhatsApp reply with the guest answers', () => {
  assert.match(script, /function whatsappUrl\(data\)/);
  assert.match(script, /https:\/\/wa\.me\/.*CFG\.rsvp\.whatsapp/);
  assert.match(script, /encodeURIComponent\(lines\.join\("\\n"\)\)/);
  assert.match(script, /window\.open\(whatsappUrl\(data\),"_blank","noopener"\)/);
  assert.match(script, /Attending: Joyfully, yes/);
  assert.match(script, /Attending: Regretfully, no/);
  assert.match(script, /data\.notes/);
});
