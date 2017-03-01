var PLAYER_OFF = 0, PLAYER_HUMAN = 1, PLAYER_AI = 2;
var AI_NICE = 0, AI_RUDE = 1, AI_MEAN = 2, AI_EVIL = 3;
var UNLIMITED_TURNS = 1000000, TURN_COUNTS = [9, 12, 15, UNLIMITED_TURNS];

var defaultSetup = {
    p: [PLAYER_HUMAN, PLAYER_AI, PLAYER_AI, PLAYER_OFF],
    l: AI_NICE,
    s: true,
    tc: 12,
    tt: {}
};
var gameSetup = getSetupFromStorage();
var appState = 0;

function $(el) {
   return document.getElementById(el);
}

function lerp(alpha, from, to) {
    alpha = (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha);
    return to * alpha + from * (1 - alpha);
}
function adsr(a, d, s, r, sl, fn) {
    var t = 0.0;
    return function(dt) {
        var f = fn(dt);
        t += dt;

        if (t < a)
            return lerp(t / a, 0, 1) * f;
        if (t < a+d)
            return lerp((t-a) / d, 1, sl) * f;
        if (t < a+d+s)
            return sl * f;
        return lerp((t-a-s-d) / r, sl, 0) * f;
    }
}

function wSin(pitch) {
    var t = 0.0;
    return function(dt) {
        t += dt;
        return Math.sin(t * pitch * 6.283);
    }
}

function wSlide(from, to, time, fn) {
    var t = 0.0;
    return function(dt) {
        t += dt;
        var passedDT = dt * lerp(t / time, from, to);
        return fn(passedDT);
    }
}

function wRamp(from, to, after, fn) {
    var t = 0.0;
    return function(dt) {
        t += dt;
        return fn(t > after ? dt * to : dt * from);
    }
}

function wNotes(notes) {
    map(notes, function(note) {
        note.f = adsr(0.01, 0.03, 0.03 * note.d, 0.03 * note.d, 0.7, wSin(note.p));
    });
    var t = 0.0;
    return function(dt) {
        t += dt;
        var v = 0.0;
        map(notes, function(note) {
            if (t >= note.t)
                v += note.f(dt);
        });
        return v;
    }
}

function makeBuffer(fn, len, vol) {
    var vol = vol || 1;

    var sampleRate = audioCtx.sampleRate;
    var samples = sampleRate * len;
    var buffer = audioCtx.createBuffer(1, samples, sampleRate);

    var dt = 1 / sampleRate;
    var bufferData = buffer.getChannelData(0);
    for (var i = 0; i < samples; i++) {
        bufferData[i] = fn(dt) * vol;
    }

    return buffer;
}

var audioCtx = window.AudioContext && (new AudioContext());
audioCtx = (audioCtx) ? audioCtx : window.webkitAudioContext && (new webkitAudioContext())

var audioFloop, audioFloops, audioChirp, audioBlip, audioBlips, audioPop, audioPops, audioClicks, audioClick, audioEnemyDead, audioOursDead, audioVictory, audioDefeat, audioTakeOver, audioScale;
function setupAudio() {
    // do we have WebAudio?
    if (!audioCtx)
        return;

    // generate sounds
    audioClick = makeBuffer(adsr(0.001, 0.001, 0.001, 0.001, 0.01, wSlide(1.0, 1.1, 0.005, wSin(3800))), 0.03);
    audioChirp = makeBuffer(adsr(0.01, 0.01, 0.01, 0.01, 0.02,
        wSlide(1.0, 1.3, 0.05, wSin(4000))
    ), 0.3);
    audioPop = makeBuffer(adsr(0.01, 0.05, 0.05, 0.05, 0.5,
        wSlide(1.0, 3.0, 0.05, wSin(440))
    ), 0.05, 0.6);
    audioFloop = makeBuffer(adsr(0.01, 0.05, 0.05, 0.05, 0.5,
        wSlide(3.0, 0.0, 0.05, wSin(440))
    ), 0.05, 0.6);
    audioBlip = makeBuffer(adsr(0.01, 0.03, 0.01, 0.01, 0.5,
        wSlide(1.0, 3.0, 0.05, wSin(440))
    ), 0.01, 0.6);
     audioEnemyDead = makeBuffer(adsr(0.01, 0.05, 0.05, 0.05, 0.5,
        wSlide(1.0, 1.3, 0.1, wSin(440))
    ), 0.2, 0.6);
    audioOursDead = makeBuffer(adsr(0.01, 0.05, 0.05, 0.05, 0.5,
        wSlide(1.0, 0.3, 0.1, wSin(200))
    ), 0.2, 0.6);
    audioTakeOver = makeBuffer(wNotes([
        {t:0, p:261,d:1},{t:0.1, p:329, d:2}     // C-E
    ]), 0.6, 0.2);
    audioVictory = makeBuffer(wNotes([
        {t:0, p:261,d:1},{t:0.0, p:329, d:2},{t:0.0, p:392, d:3},     // C-E-G
        {t:0.2, p:261,d:1},{t:0.2, p:349, d:2},{t:0.2, p:440, d:3}    // C-F-A
    ]), 0.6, 0.2);
    audioDefeat = makeBuffer(wNotes([
        {t:0, p:392,d:3},{t:0.15, p:329, d: 2}, {t:0.3, p:261, d:1}
    ]), 0.6, 0.2);
  
    var scale = [440, 494, 523, 587, 659, 698, 784, 880];

    // audioScale
    scaleArray = [];
    audioPops = [];
    audioBlips = [];
    audioClicks = [];
    audioFloops = [];

    for (var i=0; i<scale.length; i++) {
      scaleArray[i] = { t:0.2*(i+1), p: scale[i], d:1};
      audioPops[i] = makeBuffer(adsr(0.01, 0.05, 0.05, 0.05, 0.5, wSlide(1.0, 3.0, 0.05, wSin(scale[i]))), 0.05, 0.6);
      audioBlips[i] = makeBuffer(adsr(0.01, 0.03, 0.01, 0.01, 0.5, wSlide(1.0, 3.0, 0.05, wSin(scale[i]))), 0.01, 0.6);
      audioClicks[i] = makeBuffer(adsr(0.001, 0.001, 0.001, 0.001, 0.01, wSlide(1.0, -1, 0.005, wSin(scale[i]*2))), 0.03, 0.1);
		audioFloops[i] = makeBuffer(adsr(0.01, 0.05, 0.05, 0.05, 0.5, wSlide(3.0, 0.0, 0.05, wSin(scale[scale.length - 1 - i]))), 0.05, 0.6);
    }
    audioScale = makeBuffer(wNotes(scaleArray), 0.2*scale.length, 0.2);

    // update the mute button
    updateSoundControls();
    cdr.state.click = 0;
    cdr.state.clickInc = 1;
}

function playClicks(cnt, delay=60) {
   if (window.audioClicks && (cnt > audioClicks.length - 1)) cnt = audioClicks.length - 1;
   for (var i=0; i<cnt; i++) {
      playClick(i * delay);
   }
}

function playClick(delay=10) {
   cdr.state.click += cdr.state.clickInc;
   if ((cdr.state.click > 7) || (cdr.state.click < 0)) {
      cdr.state.clickInc *= -1;
      cdr.state.click += cdr.state.clickInc;
   } 

   setTimeout(function() { playSound(audioClicks[cdr.state.click]); }, delay);
}

function playBlips(cnt, delay=60) {
   for (var i=0; i<cnt; i++) {
      playBlip(i % 8, i * delay);
   }
}

function playBlip(idx, delay) {
   setTimeout(function() { playSound(audioBlips[idx]); }, delay);
}

function playPops(cnt, delay=60) {
   for (var i=0; i<cnt; i++) {
      playPop(i % 8, i * delay);
   }
}

function playPop(idx, delay) {
   setTimeout(function() { playSound(audioPops[idx]); }, delay);
}
function playSound(sound) {
    if (!(sound && gameSetup.s))
        return;

    var source = audioCtx.createBufferSource();
    source.buffer = sound;
    source.connect(audioCtx.destination);
    source.start();
}

function updateSoundControls() {
    // $('snd').innerHTML = gameSetup.s ? '♪' : ' ';
    storeSetupInLocalStorage(gameSetup);
}

function toggleSound() {
    gameSetup.s = !gameSetup.s;
    updateSoundControls();
}

function map(seq,fn) {
	return [].slice.call(seq).map(fn);
}

function getSetupFromStorage() {
    if (localStorage) {
        var stored = localStorage.getItem("s");
        if (stored) {
            stored = JSON.parse(stored);
            forEachProperty(defaultSetup, function (value, name) {
                if (stored[name] === undefined)
                    stored[name] = value;
            });
            return stored;
        }
    }

    return defaultSetup;
}

function forEachProperty(obj,fn) {
	for (var property in obj)
		fn(obj[property], property);
}

function storeSetupInLocalStorage() {
    if (localStorage) {
        localStorage.setItem("s", JSON.stringify(gameSetup));
    }
}


