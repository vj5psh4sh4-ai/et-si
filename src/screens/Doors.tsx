import React, { useMemo } from 'react';
import { ArrowRight, MapPin, Wrench } from 'lucide-react';
import type { AppApi } from '../appApi';
import { VariantChips, WalkTime, schoolVars } from '../components/Signpost';
import { BACHELORS, SCHOOL_ORDER } from '../domain/data';
import { pickRoute, routesFor } from '../domain/routes';
import { isSchoolStart, type ClassType } from '../domain/situation';
import { colon, useI18n, type Key } from '../i18n';
import { classLabel, programmeName, schoolCode, schoolName, variantVia } from '../i18n/labels';
import { situationLabel } from '../ui/helpers';

const CLASS_TYPES: (ClassType | null)[] = [null, 'eb', 'g', 'pg'];

/** Les dix Bachelors depuis la situation choisie. Aucune voie ne ferme l'accès : seul le temps de marche change. */
export const DoorsScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, t } = useI18n();
  const { situation, variant } = app;
  const school = isSchoolStart(situation);

  const doors = useMemo(
    () =>
      BACHELORS.map((p) => {
        const routes = routesFor(p.id, situation, lang);
        return { p, route: pickRoute(routes, variant) };
      }),
    [situation, lang, variant],
  );
  const open = doors.filter((d) => d.route).length;

  return (
    <section className="page doors-page">
      <header className="page-head">
        <p className="eyebrow">{t('doors.eyebrow')}</p>
        <h1 className="page-title">{t('doors.title')}</h1>
        <p className="page-lead">{t('doors.lead')}</p>
        <p className="start-line">
          <MapPin size={16} aria-hidden="true" />
          <span>
            {t('doors.from')}{colon(lang)}<strong>{situationLabel(situation, lang, t)}</strong>
          </span>
          <button type="button" className="btn-link" onClick={() => app.openSituation('doors')}>
            {t('sit.change')}
          </button>
        </p>
      </header>

      <div className="doors-controls">
        <VariantChips
          variantIds={app.variantIds}
          value={variant}
          onChange={app.setVariant}
          title={t(school ? 'panel.etsi.title' : 'panel.etsi.title.other')}
        />
        {school && (
          <div className="etsi class-chips" role="group" aria-label={t('sit.class.title')}>
            <span className="etsi-title">{t('sit.class.title')}</span>
            <div className="etsi-chips">
              {CLASS_TYPES.map((c) => {
                const on = (situation.classType ?? null) === c;
                return (
                  <button key={c ?? 'any'} type="button" className={`chip-btn${on ? ' selected' : ''}`} aria-pressed={on} onClick={() => app.updateProfile({ classType: c })}>
                    {c ? classLabel(c, lang) : t('sit.class.any')}
                  </button>
                );
              })}
            </div>
            <p className="small muted">{t('sit.class.hint')}</p>
          </div>
        )}
      </div>

      <p className="doors-count" role="status">
        {variant !== 'auto' ? t('doors.count', { n: open }) : ''}
      </p>

      {SCHOOL_ORDER.map((s) => {
        const list = doors.filter((d) => d.p.school === s);
        if (!list.length) return null;
        return (
          <section key={s} className="door-group" style={schoolVars(list[0].p.id)} aria-labelledby={`school-${s}`}>
            <h2 id={`school-${s}`} className="door-group-title">
              <span className="school-chip">{schoolCode(s, lang)}</span>
              <span>{schoolName(s, lang)}</span>
            </h2>
            <ul className="door-grid">
              {list.map(({ p, route }) => (
                <li key={p.id}>
                  <button type="button" className={`door-card${route ? '' : ' door-closed'}`} onClick={() => app.openSheet(p.id, 'doors')}>
                    <span className="door-name">{programmeName(p.id, lang)}</span>
                    <span className="door-time">
                      <WalkTime route={route} />
                    </span>
                    {route ? (
                      <span className="door-meta">
                        <span className={`access-pill access-${route.access}`}>{t(`access.${route.access === 'non_admis' ? 'sur_dossier' : route.access}` as Key)}</span>
                        <span className="door-via">{t('panel.path.via', { variant: variantVia(route.variant, lang) })}</span>
                      </span>
                    ) : (
                      <span className="door-meta">
                        <span className="door-via">{t('doors.none')}</span>
                      </span>
                    )}
                    <ArrowRight className="entry-go" size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <button type="button" className="entry-card entry-wide" onClick={() => app.go('cfc')}>
        <span className="how-icon">
          <Wrench size={22} aria-hidden="true" />
        </span>
        <strong>{t('home.cfc.title')}</strong>
        <span>{t('home.cfc.text')}</span>
        <ArrowRight className="entry-go" size={18} aria-hidden="true" />
      </button>

      <ul className="panel-notes">
        <li>{t('note.toReview')}</li>
        <li>{t('note.notAdmission')}</li>
      </ul>
    </section>
  );
};
