import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookmarkCheck, BookmarkPlus, Search } from 'lucide-react';
import type { AppApi } from '../appApi';
import { SchoolChip, schoolVars } from '../components/Signpost';
import { CFC_INDEX, cfcByKey, doorsForCfc, searchCfc, type CfcDoor, type CfcEntry } from '../domain/cfc';
import { colon, formatYears, semi, useI18n, type Key } from '../i18n';
import { programmeName, requirementLabel, trainingLabel } from '../i18n/labels';

const EXAMPLES = ['polymecanicien', 'informaticien', 'employe de commerce', 'dessinateur', 'laborantin', 'assistant socio educatif', 'assistant en soins'];

const Door: React.FC<{ door: CfcDoor; onOpen: () => void }> = ({ door, onOpen }) => {
  const { lang, t } = useI18n();
  const extras = [...door.trainingIds.map((id) => trainingLabel(id, lang)), ...door.requirementIds.map((id) => requirementLabel(id, lang))];
  return (
    <li>
      <button type="button" className="door-card cfc-door" style={schoolVars(door.programmeId)} onClick={onOpen}>
        <span className="door-meta">
          <SchoolChip programmeId={door.programmeId} />
          <span className={`access-pill access-${door.access}`}>{t(`access.${door.access === 'non_admis' ? 'sur_dossier' : door.access}` as Key)}</span>
          {door.extraYearsMin > 0 && <span className="door-plus">{t('cfc.plusYears', { years: formatYears(lang, door.extraYearsMin) })}</span>}
        </span>
        <span className="door-name">{programmeName(door.programmeId, lang)}</span>
        {extras.length > 0 && (
          <span className="door-via">
            {t('access.with')}{colon(lang)}{extras.join(semi(lang))}
          </span>
        )}
        <ArrowRight className="entry-go" size={18} aria-hidden="true" />
      </button>
    </li>
  );
};

/** Entrée par le métier : un CFC, puis les filières qu'il ouvre avec une maturité professionnelle. */
export const CfcScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState('');
  const entry: CfcEntry | null = app.cfcKey ? cfcByKey(app.cfcKey) ?? null : null;
  const results = useMemo(() => searchCfc(query, 12), [query]);
  const examples = useMemo(() => EXAMPLES.map((q) => searchCfc(q, 1)[0]).filter((e): e is CfcEntry => !!e), []);
  const doors = useMemo(() => (entry ? doorsForCfc(entry) : []), [entry]);
  const direct = doors.filter((d) => d.kind === 'direct');
  const complement = doors.filter((d) => d.kind === 'complement');
  const saved = entry ? app.notebook.savedCfc.includes(entry.key) : false;

  return (
    <section className="page cfc-page">
      <button type="button" className="back-link" onClick={() => (entry ? app.setCfcKey(null) : app.go('doors'))}>
        <ArrowLeft size={18} aria-hidden="true" /> {entry ? t('cfc.other') : t('sheet.backDoors')}
      </button>
      <header className="page-head">
        <p className="eyebrow">{t('cfc.eyebrow')}</p>
        <h1 className="page-title">{t('cfc.title')}</h1>
        {!entry && <p className="page-lead">{t('cfc.lead')}</p>}
      </header>

      {!entry ? (
        <>
          <div className="search-box">
            <label htmlFor="cfc-search">{t('cfc.search')}</label>
            <div className="search-input">
              <Search size={20} aria-hidden="true" />
              <input
                id="cfc-search"
                type="search"
                value={query}
                autoComplete="off"
                spellCheck={false}
                placeholder={t('cfc.placeholder')}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <p className="small muted" role="status">
              {query.trim() ? (results.length ? t('cfc.results', { n: results.length }) : t('cfc.noResult')) : t('cfc.count', { n: CFC_INDEX.length })}
            </p>
          </div>

          {!query.trim() && <h2 className="h-mini">{t('cfc.suggestions')}</h2>}
          <ul className="cfc-results" lang="fr">
            {(query.trim() ? results : examples).map((e) => (
              <li key={e.key}>
                <button type="button" className="cfc-result" onClick={() => app.setCfcKey(e.key)}>
                  <span>{e.label}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {lang !== 'fr' && <p className="small muted">{t('note.frenchOnly.cfc')}</p>}
        </>
      ) : (
        <div className="cfc-detail">
          <div className="cfc-head">
            <div>
              <span className="h-mini">CFC</span>
              <h2 className="cfc-name" lang="fr">
                {entry.label}
              </h2>
            </div>
            {!app.isStand && (
              <button type="button" className="btn btn-secondary" aria-pressed={saved} onClick={() => app.toggleSaveCfc(entry.key)}>
                {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <BookmarkPlus size={18} aria-hidden="true" />}
                {saved ? t('cfc.saved') : t('cfc.save')}
              </button>
            )}
          </div>
          <p className="callout callout-soft">{t('cfc.mp.note')}</p>

          <section className="door-group" aria-labelledby="cfc-direct">
            <h2 id="cfc-direct" className="section-title">
              {t('cfc.direct.title')}
            </h2>
            {direct.length ? (
              <ul className="door-grid">
                {direct.map((d) => (
                  <Door key={d.programmeId} door={d} onOpen={() => app.openSheet(d.programmeId, 'cfc')} />
                ))}
              </ul>
            ) : (
              <p className="muted">{t('cfc.direct.none')}</p>
            )}
            {entry.fromIncompleteList && <p className="trail-note">{t('access.cfc.list.incomplete')}</p>}
          </section>

          {complement.length > 0 && (
            <section className="door-group" aria-labelledby="cfc-complement">
              <h2 id="cfc-complement" className="section-title">
                {t('cfc.complement.title')}
              </h2>
              <ul className="door-grid">
                {complement.map((d) => (
                  <Door key={d.programmeId} door={d} onOpen={() => app.openSheet(d.programmeId, 'cfc')} />
                ))}
              </ul>
            </section>
          )}

          <ul className="panel-notes">
            <li>{t('note.toReview')}</li>
            <li>{t('note.notAdmission')}</li>
          </ul>
        </div>
      )}
    </section>
  );
};
