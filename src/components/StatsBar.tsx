import { CheckCircle2, CircleDashed, Trophy } from 'lucide-react';

type StatsBarProps = {
  total: number;
  owned: number;
  missing: number;
};

export function StatsBar({ total, owned, missing }: StatsBarProps) {
  const percent = total === 0 ? 0 : Math.round((owned / total) * 100);

  return (
    <section className="stats" aria-label="Resumo do álbum">
      <article className="stat-card stat-card-total">
        <Trophy aria-hidden="true" />
        <div>
          <span>Total</span>
          <strong>{total}</strong>
        </div>
      </article>
      <article className="stat-card">
        <CheckCircle2 aria-hidden="true" />
        <div>
          <span>Tenho</span>
          <strong>{owned}</strong>
        </div>
      </article>
      <article className="stat-card">
        <CircleDashed aria-hidden="true" />
        <div>
          <span>Faltam</span>
          <strong>{missing}</strong>
        </div>
      </article>
      <article className="progress-card">
        <div className="progress-copy">
          <span>Progresso</span>
          <strong>{percent}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div style={{ width: `${percent}%` }} />
        </div>
      </article>
    </section>
  );
}
