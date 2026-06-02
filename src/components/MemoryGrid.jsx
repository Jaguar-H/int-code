import { useEffect, useState } from 'react';
import MemoryBox from './MemoryBox';

export default function MemoryGrid({ memory, ip, params, operands, modified, running, halted, onCellChange, onAddAfter, onDeleteCell, focusTarget }) {
  const addresses = Object.keys(memory).map(Number).sort((a, b) => a - b);
  const executed = running || halted || params.length > 0 || operands.length > 0 || modified.length > 0;
  const [activeAddr, setActiveAddr] = useState(null);

  useEffect(() => {
    const sorted = Object.keys(memory).map(Number).sort((a, b) => a - b);
    const firstAddr = sorted[0];
    const el = document.querySelector(`[data-addr="${firstAddr}"] input`);
    if (el) { el.focus(); el.select(); }
    setActiveAddr(firstAddr);
  }, []);

  useEffect(() => {
    const el = document.querySelector(`[data-addr="${ip}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [ip]);

  useEffect(() => {
    if (focusTarget?.addr == null) return;
    const el = document.querySelector(`[data-addr="${focusTarget.addr}"] input`);
    if (el) { el.focus(); el.select(); }
    setActiveAddr(focusTarget.addr);
  }, [focusTarget?.seq]);

  function focusAddr(addr) {
    const el = document.querySelector(`[data-addr="${addr}"] input`);
    if (el) { el.focus(); el.select(); }
    setActiveAddr(addr);
  }

  function handleEnter(addr) {
    const sorted = Object.keys(memory).map(Number).sort((a, b) => a - b);
    const idx = sorted.indexOf(addr);
    if (idx < sorted.length - 1) focusAddr(sorted[idx + 1]);
    else onAddAfter(addr);
  }

  function handlePrev(addr) {
    const sorted = Object.keys(memory).map(Number).sort((a, b) => a - b);
    const idx = sorted.indexOf(addr);
    if (idx > 0) focusAddr(sorted[idx - 1]);
  }

  function handleNext(addr) {
    const sorted = Object.keys(memory).map(Number).sort((a, b) => a - b);
    const idx = sorted.indexOf(addr);
    if (idx < sorted.length - 1) focusAddr(sorted[idx + 1]);
  }

  function handleDelete(addr) {
    const sorted = Object.keys(memory).map(Number).sort((a, b) => a - b);
    if (sorted.length <= 1) return;
    const idx = sorted.indexOf(addr);
    if (idx < sorted.length - 1) {
      if (idx > 0) focusAddr(sorted[idx - 1]);
    } else {
      onDeleteCell(addr);
    }
  }

  return (
    <div className="memory-grid">
      {addresses.map(addr => (
        <MemoryBox
          key={addr}
          address={addr}
          value={memory[addr]}
          isIp={addr === ip}
          isParam={params.includes(addr)}
          isOperand={operands.includes(addr)}
          isModified={modified.includes(addr)}
          isActive={addr === activeAddr}
          executed={executed}
          disabled={running}
          onChange={val => onCellChange(addr, val)}
          onEnter={() => handleEnter(addr)}
          onDelete={() => handleDelete(addr)}
          onPrev={() => handlePrev(addr)}
          onNext={() => handleNext(addr)}
        />
      ))}
      {!running && (
        <button className="add-box-btn" onClick={() => onAddAfter(addresses[addresses.length - 1])} title="Add memory cell">+</button>
      )}
    </div>
  );
}
