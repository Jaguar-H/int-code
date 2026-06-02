import { useState } from 'react';

export default function Controls({ onRun, onPause, onStep, onReset, onLoad, onSpeedChange, running, halted }) {
  const [speed, setSpeed] = useState(400);
  const [programText, setProgramText] = useState('');
  const [parseError, setParseError] = useState('');

  function handleSpeedChange(e) {
    const val = Number(e.target.value);
    setSpeed(val);
    onSpeedChange(val);
  }

  function handleLoad() {
    const raw = programText.trim();
    if (!raw) { setParseError('ENTER A PROGRAM FIRST'); return; }

    const values = raw.split(',').map(s => s.trim()).filter(s => s !== '');
    const nums = values.map(s => parseInt(s, 10));
    const bad = nums.findIndex(n => isNaN(n));

    if (bad !== -1) {
      setParseError(`INVALID TOKEN AT POSITION ${bad + 1}: "${values[bad]}"`);
      return;
    }

    setParseError('');
    onLoad(nums);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !running) handleLoad();
  }

  return (
    <div className="controls">
      <div className="controls-program-row">
        <div className="program-input-group">
          <label className="program-label">PROGRAM  <span className="program-hint">comma-separated integers</span></label>
          <div className="program-input-wrap">
            <input
              type="text"
              className="program-input"
              placeholder="e.g.  1, 5, 6, 7, 99, 10, 20, 0"
              value={programText}
              onChange={e => { setProgramText(e.target.value); setParseError(''); }}
              onKeyDown={handleKeyDown}
              disabled={running}
              spellCheck={false}
            />
            <button className="btn btn--load" onClick={handleLoad} disabled={running}>
              LOAD
            </button>
          </div>
          {parseError && <span className="parse-error">{parseError}</span>}
        </div>
      </div>

      <div className="controls-action-row">
        <div className="speed-group">
          <label>SPEED: {speed}ms / step</label>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={speed}
            onChange={handleSpeedChange}
            className="speed-slider"
          />
        </div>

        <div className="action-buttons">
          {running ? (
            <button onClick={onPause} className="btn btn--pause">PAUSE</button>
          ) : (
            <button onClick={() => onRun(speed)} className="btn btn--run" disabled={halted}>
              RUN
            </button>
          )}
          <button onClick={onStep} className="btn btn--step" disabled={halted || running}>
            STEP
          </button>
          <button onClick={onReset} className="btn btn--reset">
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}
