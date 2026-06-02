// Returns { memory, ip, output, halted, params, operands, modified, error }
// params  = parameter-pointer cells (ip+1, ip+2, …) — hold addresses, not values
// operands = dereferenced data cells actually read
// modified = cells written
// All operand params use indirect addressing: param value is an address, dereference once.
export function step(memory, ip) {
  const opcode = memory[ip];

  if (opcode === 99) {
    return { memory, ip, output: [], halted: true, params: [], operands: [], modified: [], error: null };
  }

  if (opcode === 0) {
    // PRINT: read mem[mem[ip+1]] and output it
    const paramAddr = memory[ip + 1] ?? 0;
    const value = memory[paramAddr] ?? 0;
    return {
      memory,
      ip: ip + 2,
      output: [value],
      halted: false,
      params: [ip + 1],
      operands: [paramAddr],
      modified: [],
      error: null,
    };
  }

  if (opcode === 4) {
    // JLT: if mem[mem[ip+1]] < mem[mem[ip+2]], jump to mem[ip+3], else jump to mem[ip+4]
    const pAddr1 = ip + 1;
    const pAddr2 = ip + 2;
    const pAddr3 = ip + 3;
    const pAddr4 = ip + 4;
    const addr1 = memory[pAddr1];
    const addr2 = memory[pAddr2];
    const trueAddr = memory[pAddr3];
    const falseAddr = memory[pAddr4];

    if (addr1 === undefined || addr2 === undefined || trueAddr === undefined || falseAddr === undefined) {
      return {
        memory,
        ip,
        output: [],
        halted: true,
        params: [pAddr1, pAddr2, pAddr3, pAddr4],
        operands: [],
        modified: [],
        error: `JLT at address ${ip}: missing parameters`,
      };
    }

    const value1 = memory[addr1] ?? 0;
    const value2 = memory[addr2] ?? 0;
    const targetAddr = value1 < value2 ? trueAddr : falseAddr;

    const maxAddr = Math.max(...Object.keys(memory).map(Number));
    if (targetAddr < 0 || targetAddr > maxAddr) {
      return {
        memory,
        ip,
        output: [],
        halted: true,
        params: [pAddr1, pAddr2, pAddr3, pAddr4],
        operands: [addr1, addr2],
        modified: [],
        error: `JLT at address ${ip}: invalid jump address ${targetAddr}`,
      };
    }

    return {
      memory,
      ip: targetAddr,
      output: [],
      halted: false,
      params: [pAddr1, pAddr2, pAddr3, pAddr4],
      operands: [addr1, addr2],
      modified: [],
      error: null,
    };
  }

  if (opcode === 1 || opcode === 2 || opcode === 3) {
    const pAddr1 = ip + 1;
    const pAddr2 = ip + 2;
    const pAddr3 = ip + 3;
    const addr1 = memory[pAddr1] ?? 0;
    const addr2 = memory[pAddr2] ?? 0;
    const destAddr = memory[pAddr3] ?? 0;
    const a = memory[addr1] ?? 0;
    const b = memory[addr2] ?? 0;
    const result = opcode === 1 ? a + b : opcode === 2 ? a * b : a - b;

    return {
      memory: { ...memory, [destAddr]: result },
      ip: ip + 4,
      output: [],
      halted: false,
      params: [pAddr1, pAddr2, pAddr3],
      operands: [addr1, addr2],
      modified: [destAddr],
      error: null,
    };
  }

  return {
    memory,
    ip,
    output: [],
    halted: true,
    params: [],
    operands: [],
    modified: [],
    error: `Unknown opcode ${opcode} at address ${ip}`,
  };
}
