import { useEffect, useRef } from 'react';

export default function Output({ output }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output.length]);

  return (
    <div className="output-section">
      <div className="output-section-header">[ OUTPUT ]</div>
      <div className="output-console">
        {output.length === 0 ? (
          <span className="output-empty">No output yet</span>
        ) : (
          output.map((val, i) => (
            <div key={i} className="output-line">
              <span className="output-prompt">&gt;</span> {val}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
