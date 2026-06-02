import { useState, useRef } from 'react';
import { step } from './interpreter';
import MemoryGrid from './components/MemoryGrid';
import Controls from './components/Controls';
import Output from './components/Output';
import Help from './components/Help';

const DEFAULT_START = 0;
const DEFAULT_SIZE = 8;

function makeDefaultMemory(start) {
  const m = {};
  for (let i = 0; i < DEFAULT_SIZE; i++) m[start + i] = 0;
  return m;
}

export default function App() {
  const [memory, setMemory] = useState(() => makeDefaultMemory(DEFAULT_START));
  const [startAddr, setStartAddr] = useState(DEFAULT_START);
  const [ip, setIp] = useState(DEFAULT_START);
  const [output, setOutput] = useState([]);
  const [halted, setHalted] = useState(false);
  const [running, setRunning] = useState(false);
  const [params, setParams] = useState([]);
  const [operands, setOperands] = useState([]);
  const [modified, setModified] = useState([]);
  const [error, setError] = useState(null);
  const [focusTarget, setFocusTarget] = useState({ addr: null, seq: 0 });

  const memRef = useRef(makeDefaultMemory(DEFAULT_START));
  const ipRef = useRef(DEFAULT_START);
  const outputRef = useRef([]);
  const haltedRef = useRef(false);
  const runningRef = useRef(false);
  const speedRef = useRef(400);
  const initialMemRef = useRef({});
  const initialIpRef = useRef(DEFAULT_START);

  function syncToState(mem, newIp, newOut, newHalted, prms, ops, mod, err) {
    memRef.current = mem;
    ipRef.current = newIp;
    outputRef.current = newOut;
    haltedRef.current = newHalted;
    setMemory(mem);
    setIp(newIp);
    setOutput(newOut);
    setHalted(newHalted);
    setParams(prms);
    setOperands(ops);
    setModified(mod);
    setError(err ?? null);
  }

  function doStep() {
    if (haltedRef.current) {
      runningRef.current = false;
      setRunning(false);
      return;
    }

    const result = step(memRef.current, ipRef.current);
    const newOut = [...outputRef.current, ...result.output];

    syncToState(
      result.memory,
      result.ip,
      newOut,
      result.halted,
      result.params ?? [],
      result.operands ?? [],
      result.modified ?? [],
      result.error,
    );

    if (runningRef.current && !result.halted) {
      setTimeout(doStep, speedRef.current);
    } else if (result.halted) {
      runningRef.current = false;
      setRunning(false);
    }
  }

  function handleCellChange(addr, val) {
    const newMem = { ...memRef.current, [addr]: val };
    memRef.current = newMem;
    setMemory(newMem);
  }

  function handleAddAfter(addr) {
    const newAddr = addr + 1;
    const newMem = memRef.current[newAddr] === undefined
      ? { ...memRef.current, [newAddr]: 0 }
      : { ...memRef.current };
    memRef.current = newMem;
    setMemory(newMem);
    setFocusTarget(prev => ({ addr: newAddr, seq: prev.seq + 1 }));
  }

  function handleDeleteCell(addr) {
    const addresses = Object.keys(memRef.current).map(Number).sort((a, b) => a - b);
    if (addresses.length <= 1) return;
    const idx = addresses.indexOf(addr);
    const prevAddr = idx > 0 ? addresses[idx - 1] : addresses[1];
    const newMem = { ...memRef.current };
    delete newMem[addr];
    memRef.current = newMem;
    setMemory(newMem);
    setFocusTarget(prev => ({ addr: prevAddr, seq: prev.seq + 1 }));
  }

  function handleStartAddrChange(newStart) {
    ipRef.current = newStart;
    initialIpRef.current = newStart;
    setStartAddr(newStart);
    setIp(newStart);
    setHalted(false);
    setParams([]);
    setOperands([]);
    setModified([]);
    setError(null);
  }

  function handleRun(speed) {
    if (haltedRef.current || runningRef.current) return;
    // Snapshot at the moment Run is pressed
    initialMemRef.current = { ...memRef.current };
    initialIpRef.current = ipRef.current;
    speedRef.current = speed;
    runningRef.current = true;
    setRunning(true);
    doStep();
  }

  function handlePause() {
    runningRef.current = false;
    setRunning(false);
  }

  function handleStep() {
    if (haltedRef.current || runningRef.current) return;
    // Snapshot on first step if no snapshot yet
    if (Object.keys(initialMemRef.current).length === 0) {
      initialMemRef.current = { ...memRef.current };
      initialIpRef.current = ipRef.current;
    }
    doStep();
  }

  function handleReset() {
    runningRef.current = false;
    setRunning(false);
    const mem = Object.keys(initialMemRef.current).length > 0
      ? { ...initialMemRef.current }
      : { ...memRef.current };
    syncToState(mem, initialIpRef.current, [], false, [], [], [], null);
  }

  function handleLoad(values) {
    runningRef.current = false;
    const newMem = {};
    values.forEach((val, i) => { newMem[startAddr + i] = val; });
    initialMemRef.current = { ...newMem };
    initialIpRef.current = startAddr;
    syncToState(newMem, startAddr, [], false, [], [], [], null);
  }

  function handleSpeedChange(speed) {
    speedRef.current = speed;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>INTCODE</h1>
        <p className="app-subtitle">Visual Intcode Interpreter</p>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <Controls
            onRun={handleRun}
            onPause={handlePause}
            onStep={handleStep}
            onReset={handleReset}
            onLoad={handleLoad}
            onSpeedChange={handleSpeedChange}
            running={running}
            halted={halted}
          />
          <Output output={output} />
        </aside>

        <main className="app-main">
          <div className="legend">
            <span className="legend-item"><span className="legend-swatch legend-swatch--ip" /><span className="legend-label">INSTRUCTION</span></span>
            <span className="legend-item"><span className="legend-swatch legend-swatch--param" /><span className="legend-label">POINTER</span></span>
            <span className="legend-item"><span className="legend-swatch legend-swatch--operand" /><span className="legend-label">OPERAND</span></span>
            <span className="legend-item"><span className="legend-swatch legend-swatch--modified" /><span className="legend-label">WRITE</span></span>
          </div>

          <div className="memory-section">
            <div className="memory-section-header">
              <h2 className="section-title">[ MEMORY ]</h2>
              <div className="start-addr-control">
                <label>Start address</label>
                <input
                  type="number"
                  value={startAddr}
                  onChange={e => handleStartAddrChange(Number(e.target.value))}
                  className="addr-input"
                  disabled={running}
                />
              </div>
            </div>
            {error && <div className="error-banner">{error}</div>}
            {halted && !error && <div className="halted-banner">HALTED</div>}
            <MemoryGrid
              memory={memory}
              ip={ip}
              params={params}
              operands={operands}
              modified={modified}
              running={running}
              halted={halted}
              onCellChange={handleCellChange}
              onAddAfter={handleAddAfter}
              onDeleteCell={handleDeleteCell}
              focusTarget={focusTarget}
            />
          </div>
        </main>
      </div>

      <Help />
    </div>
  );
}
