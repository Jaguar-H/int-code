export default function MemoryBox({ address, value, isIp, isParam, isOperand, isModified, isActive, executed, disabled, onChange, onEnter, onDelete, onPrev, onNext }) {
  let cls = 'box-value';
  if (executed) {
    if (isIp) cls += ' is-ip';
    else if (isModified) cls += ' is-modified';
    else if (isOperand) cls += ' is-operand';
    else if (isParam) cls += ' is-param';
  } else {
    if (isActive) cls += ' is-active';
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.key === 'Enter' ? onEnter?.() : onNext?.();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onPrev?.();
    } else if (e.key === 'Backspace' && (e.target.value === '' || e.target.value === '0')) {
      e.preventDefault();
      onDelete?.();
    }
  }

  return (
    <div className="memory-box" data-addr={address}>
      <div className={cls}>
        <input
          type="number"
          className="box-input"
          value={value ?? 0}
          disabled={disabled}
          onChange={e => {
            const n = parseInt(e.target.value, 10);
            onChange(isNaN(n) ? 0 : n);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="box-address">{address}</div>
    </div>
  );
}
