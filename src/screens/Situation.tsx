import React from 'react';
import { ArrowLeft, Briefcase, GraduationCap, School, UserRound } from 'lucide-react';
import type { AppApi } from '../appApi';
import { useI18n, type Key } from '../i18n';
import type { SchoolYear } from '../domain/situation';
import type { SituationId } from '../types';

const YEARS: SchoolYear[] = [9, 10, 11];
const TILES: { id: SituationId; icon: React.ElementType }[] = [
  { id: 'apprentissage', icon: Briefcase },
  { id: 'college', icon: GraduationCap },
  { id: 'ecg', icon: School },
  { id: 'autre', icon: UserRound },
];

/** « Tu es où ? » : un seul geste. Au CO, le bouton de l'année fixe en même temps la situation. */
export const SituationScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { t } = useI18n();
  const p = app.notebook.profile;
  return (
    <section className="page situation">
      <button type="button" className="back-link" onClick={app.closeSituation}>
        <ArrowLeft size={18} aria-hidden="true" /> {t('app.back')}
      </button>
      <header className="page-head">
        <p className="eyebrow">{t('sit.eyebrow')}</p>
        <h1 className="page-title">{t('sit.title')}</h1>
        <p className="page-lead">{t('sit.lead')}</p>
      </header>

      <div className="sit-co" role="group" aria-labelledby="sit-co-title">
        <div className="sit-co-head">
          <strong id="sit-co-title">{t('sit.co')}</strong>
          <span>{t('sit.co.hint')}</span>
        </div>
        <div className="sit-years">
          {YEARS.map((y) => {
            const on = p.situation === 'co' && p.schoolYear === y;
            return (
              <button key={y} type="button" className={`sit-year${on ? ' selected' : ''}`} aria-pressed={on} onClick={() => app.chooseSituation('co', y)}>
                {t(`sit.${y}` as Key)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sit-tiles">
        {TILES.map(({ id, icon: Icon }) => {
          const on = p.situation === id;
          return (
            <button key={id} type="button" className={`sit-tile${on ? ' selected' : ''}`} aria-pressed={on} onClick={() => app.chooseSituation(id)}>
              <span className="how-icon">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="sit-tile-text">
                <strong>{t(`sit.${id}` as Key)}</strong>
                <span>{t(`sit.${id}.hint` as Key)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" className="sit-skip" onClick={() => app.chooseSituation('non_precise')}>
        <strong>{t('sit.non_precise')}</strong>
        <span>{t('sit.non_precise.hint')}</span>
      </button>
    </section>
  );
};
