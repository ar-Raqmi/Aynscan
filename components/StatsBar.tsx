import React from 'react';
import { ProcessingStats } from '../types';

interface StatsBarProps {
  stats: ProcessingStats;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const isActive = stats.total > 0 && stats.completed + stats.failed < stats.total;
  const totalProcessed = stats.completed + stats.failed;
  const progress = stats.total === 0 ? 0 : Math.round((totalProcessed / stats.total) * 100);
  const show = stats.total > 0;
  const processingTextClass = isActive ? "breathing-text" : "";

  return (
    <div className={`progress-area ${show ? 'active' : ''}`} id="progressArea">
      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)'}}>
        <span className={processingTextClass}>
            {isActive 
             ? `Processing... (${stats.processing + stats.pending} remaining)` 
             : stats.failed > 0 ? "Completed with errors." : "Processing complete! ✨"}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="progress-track">
        <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatsBar;
