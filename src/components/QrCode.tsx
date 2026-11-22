import React, { useEffect, useState } from 'react';

interface Matrix {
  n: number;
  d: string;
}

/**
 * Code QR dessiné en SVG. La bibliothèque est chargée à la demande : elle n'alourdit pas le premier écran.
 * Zone de silence de quatre modules et fond blanc, pour rester lisible à l'écran comme à l'impression.
 */
export const QrCode: React.FC<{ value: string; label: string; loading: string; error: string; className?: string }> = ({
  value,
  label,
  loading,
  error,
  className,
}) => {
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    import('qrcode-generator')
      .then((mod) => {
        const qrcode = mod.default;
        const qr = qrcode(0, 'M');
        qr.addData(value);
        qr.make();
        const n = qr.getModuleCount();
        let d = '';
        for (let r = 0; r < n; r++) {
          let run = 0;
          for (let c = 0; c <= n; c++) {
            const dark = c < n && qr.isDark(r, c);
            if (dark) run++;
            else if (run) {
              d += `M${c - run} ${r}h${run}v1h-${run}z`;
              run = 0;
            }
          }
        }
        if (alive) setMatrix({ n, d });
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [value]);

  if (failed) return <p className="qr-msg">{error}</p>;
  if (!matrix) return <p className="qr-msg">{loading}</p>;
  const size = matrix.n + 8;
  return (
    <svg className={className ?? 'qr-svg'} viewBox={`-4 -4 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect x={-4} y={-4} width={size} height={size} fill="#fff" />
      <path d={matrix.d} fill="#000" />
    </svg>
  );
};
