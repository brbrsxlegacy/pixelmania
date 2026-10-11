const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/rewarded-ads.js', 'utf8');
function setup() {
  let now = 100000, nextId = 0, prompt;
  const timers = new Map(), gain = [];
  const game = { adPaused: false };
  const audio = { enabled: true, settings: { mainVolume: .75 }, updateMusicVolume() {},
    outputGain: { gain: { setValueAtTime(value) { gain.push(value); } } },
    ctx: { currentTime: 0, state: 'running', suspend() { this.state = 'suspended'; return Promise.resolve(); }, resume() { this.state = 'running'; return Promise.resolve(); } } };
  const w = { LUMA: { game, Audio: audio }, addEventListener() {},
    Date: { now: () => now }, setTimeout(fn) { timers.set(++nextId, fn); return nextId; }, clearTimeout(id) { timers.delete(id); },
    document: { activeElement: null, getElementById() { return null; }, body: { appendChild(el) { prompt = el; } },
      createElement() { const handlers = {}; return { handlers, querySelector(selector) { return { addEventListener(event, fn) { handlers[selector] = fn; } }; }, addEventListener(event, fn) { handlers[event] = fn; }, remove() {}, showModal() {} }; } } };
  w.window = w;
  vm.runInNewContext(source, w);
  return { w, game, audio, gain, ready() { w.adsbygoogle[0].onReady(); },
    placement() { return w.adsbygoogle.at(-1); }, click(which = '[data-watch]') { prompt.handlers[which](); },
    advance() { now += 11000; }, expire() { for (const [id, fn] of [...timers]) { timers.delete(id); fn(); } } };
}
(async () => {
  let s = setup(), rewards = 0;
  assert.equal((await s.w.showRewardedAd()).reason, 'notReady');
  s.ready();
  let promise = s.w.showRewardedAd(() => rewards++), p = s.placement();
  assert.equal(p.type, 'reward');
  assert.equal((await s.w.showRewardedAd()).reason, 'busy');
  p.beforeReward(() => p.beforeAd()); s.click();
  assert.equal(s.game.adPaused, true); assert.equal(s.audio.enabled, false); assert.equal(s.gain.at(-1), 0);
  p.adViewed(); p.adViewed(); p.afterAd(); p.adBreakDone({ breakStatus: 'viewed' });
  assert.equal((await promise).rewarded, true); assert.equal(rewards, 1);
  assert.equal(s.game.adPaused, false); assert.equal(s.audio.enabled, true); assert.equal(s.audio.settings.mainVolume, .75); assert.equal(s.gain.at(-1), 1);
  assert.equal((await s.w.showRewardedAd()).reason, 'cooldown');
  for (const status of ['noAdPreloaded', 'frequencyCapped', 'other', 'error', 'notReady']) {
    s.advance(); promise = s.w.showRewardedAd(() => rewards++); s.placement().adBreakDone({ breakStatus: status });
    const result = await promise; assert.equal(result.reason, status); assert.equal(result.rewarded, false);
  }
  s.advance(); promise = s.w.showRewardedAd(() => rewards++); p = s.placement(); p.beforeReward(() => p.beforeAd()); s.click(); p.adDismissed(); p.afterAd(); p.adBreakDone({ breakStatus: 'dismissed' });
  assert.equal((await promise).rewarded, false); assert.equal(rewards, 1);
  s.advance(); promise = s.w.showRewardedAd(() => rewards++); p = s.placement(); p.beforeReward(() => p.beforeAd()); s.click('[data-cancel]');
  assert.equal((await promise).reason, 'ignored'); p.adViewed(); assert.equal(rewards, 1);
  s.advance(); promise = s.w.showRewardedAd(() => rewards++); p = s.placement(); s.expire();
  assert.equal((await promise).reason, 'timeout'); p.adViewed(); assert.equal(rewards, 1);
  s.w.LUMA.RewardedAds.loadFailed(); assert.equal((await s.w.showRewardedAd()).reason, 'blocked');
  s = setup(); s.ready(); s.game.adPaused = true; s.audio.enabled = false; s.audio.settings.mainVolume = 0;
  promise = s.w.showRewardedAd(); p = s.placement(); p.beforeReward(() => p.beforeAd()); s.click(); s.expire();
  // No watchdog may resolve a request while a real video is playing.
  assert.equal(s.game.adPaused, true); p.adDismissed(); p.adBreakDone({ breakStatus: 'dismissed' }); await promise;
  assert.equal(s.game.adPaused, true); assert.equal(s.audio.enabled, false); assert.equal(s.audio.settings.mainVolume, 0);
  console.log('PASS: Google reward callbacks, exactly-once grant, no-fill/cap/dismiss/cancel/timeout, concurrency, pause and sound restore.');
})().catch(err => { console.error(err); process.exitCode = 1; });
