import { useState } from 'react';

const INSTRUCTIONS = [
  {
    opcode: 99,
    mnemonic: 'HALT',
    params: '—',
    description: 'Stop execution.',
    ipAdvance: null,
  },
  {
    opcode: 0,
    mnemonic: 'PRINT',
    params: 'addr',
    description: 'Output mem[mem[ip+1]].',
    ipAdvance: 2,
  },
  {
    opcode: 1,
    mnemonic: 'ADD',
    params: 'a  b  dest',
    description: 'mem[mem[ip+3]] = mem[mem[ip+1]] + mem[mem[ip+2]]',
    ipAdvance: 4,
  },
  {
    opcode: 2,
    mnemonic: 'MUL',
    params: 'a  b  dest',
    description: 'mem[mem[ip+3]] = mem[mem[ip+1]] × mem[mem[ip+2]]',
    ipAdvance: 4,
  },
  {
    opcode: 3,
    mnemonic: 'SUB',
    params: 'a  b  dest',
    description: 'mem[mem[ip+3]] = mem[mem[ip+1]] − mem[mem[ip+2]]',
    ipAdvance: 4,
  },
  {
    opcode: 4,
    mnemonic: 'JLT',
    params: 'a  b  tAddr  fAddr',
    description: 'If mem[mem[ip+1]] < mem[mem[ip+2]], jump to mem[ip+3], else jump to mem[ip+4]',
    ipAdvance: null,
  },
];

export default function Help() {
  const [open, setOpen] = useState(false);

  return (
    <div className="help-section">
      <button className="help-toggle" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span>[ INSTRUCTION SET ]</span>
        <span className="help-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="help-body">
          <p className="help-note">
            All operand params use <strong>indirect addressing</strong>: the param value is itself
            an address, so the actual operand is <code>mem[mem[ip+n]]</code>.
          </p>
          <table className="help-table">
            <thead>
              <tr>
                <th>Opcode</th>
                <th>Mnemonic</th>
                <th>Params</th>
                <th>ip +=</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {INSTRUCTIONS.map(ins => (
                <tr key={ins.opcode}>
                  <td className="help-opcode">{ins.opcode}</td>
                  <td className="help-mnemonic">{ins.mnemonic}</td>
                  <td className="help-params">{ins.params}</td>
                  <td className="help-advance">{ins.ipAdvance ?? '—'}</td>
                  <td className="help-desc">{ins.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
