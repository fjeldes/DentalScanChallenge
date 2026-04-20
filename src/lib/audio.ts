/**
 * Plays a synthetic beep sound using the Web Audio API.
 * Useful for providing feedback without external audio files.
 */
export const playSynthBeep = (freq: number, duration: number, vol: number = 0.1) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Browsers block audio if no user interaction has occurred
    console.warn("Audio playback prevented", err);
  }
};
