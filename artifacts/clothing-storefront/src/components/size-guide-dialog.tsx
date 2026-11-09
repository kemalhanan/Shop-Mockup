import { useState } from 'react';
import { X } from 'lucide-react';
import { sizeCharts, type SizeChartId } from '@/data/products';
import { Modal } from '@/components/modal';

type Unit = 'in' | 'cm';

function formatRange([low, high]: [number, number], unit: Unit) {
  const convert = (inches: number) => (unit === 'cm' ? Math.round(inches * 2.54) : inches);
  return `${convert(low)}–${convert(high)}`;
}

export function SizeGuideDialog({ chart, onClose }: { chart: SizeChartId; onClose: () => void }) {
  const [unit, setUnit] = useState<Unit>('in');
  const { columns, rows } = sizeCharts[chart];

  return (
    <Modal className="modal size-guide" labelledBy="size-guide-heading" onClose={onClose} testId="panel-size-guide">
      <div className="size-guide-header">
        <h2 id="size-guide-heading">Size guide</h2>
        <button className="close-button" aria-label="Close size guide" onClick={onClose} data-testid="button-close-size-guide"><X size={21} /></button>
      </div>
      <p className="size-guide-note">These are body measurements. Between sizes? Our cuts are roomy, so go with the smaller one.</p>
      <div className="unit-toggle" role="group" aria-label="Measurement unit">
        {(['in', 'cm'] as const).map((option) => (
          <button key={option} type="button" aria-pressed={unit === option} onClick={() => setUnit(option)} data-testid={`button-unit-${option}`}>{option}</button>
        ))}
      </div>
      <table className="size-table">
        <thead>
          <tr><th scope="col">Size</th>{columns.map((column) => <th key={column} scope="col">{column} ({unit})</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.size}>
              <th scope="row">{row.size}</th>
              {columns.map((column) => <td key={column}>{formatRange(row.measurements[column], unit)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
