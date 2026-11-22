// Éléments du panneau : lames, sentier d'un chemin et bascules « Et si ».
import React from 'react';
import { Flag } from 'lucide-react';
import { PROGRAMMES, TRAININGS } from '../domain/data';
import { cfcExamplesFor, cfcListFor } from '../domain/cfc';
import { CFC_QUALIFIERS, type Route, type VariantChoice, type VariantId } from '../domain/routes';
import type { Situation } from '../domain/situation';
import type { UserProfile } from '../mapping/engine/types';
import { TRACK_COLORS } from '../data/ui';
import { colon, formatList, formatYears, useI18n } from '../i18n';
import {
  conditionLabel,
  credentialLabel,
  programmeName,
  qualifierLabel,
  requirementLabel,
  schoolCode,
  trainingLabel,
  variantChip,
} from '../i18n/labels';
import { startLabel, walkTime } from '../ui/helpers';

export const schoolVars = (programmeId: string): React.CSSProperties => {
  const c = TRACK_COLORS[PROGRAMMES[programmeId]?.school ?? 'heia'];
  return { ['--s-main' as string]: c.main, ['--s-soft' as string]: c.soft, ['--s-ink' as string]: c.ink };
};

export const SchoolChip: React.FC<{ programmeId: string }> = ({ programmeId }) => {
  const { lang } = useI18n();
  return (
    <span className="school-chip" style={schoolVars(programmeId)}>
      {schoolCode(PROGRAMMES[programmeId].school, lang)}
    </span>
  );
};

/** Temps de marche avec son unité : « 3 à 4 ans de marche », ou « porte ouverte ». */
export const WalkTime: React.FC<{ route: Route | null }> = ({ route }) => {
  const { lang, t } = useI18n();
  if (!route) return <span className="walk walk-none">{t('panel.walk.none')}</span>;
  return (
    <span className="walk">
      <strong>{walkTime(route, lang, t)}</strong>
      {route.yearsMax > 0 && <> {t('panel.walk')}</>}
    </span>
  );
};

export const Blade: React.FC<{
  programmeId: string;
  route: Route | null;
  selected: boolean;
  aside?: boolean;
  index: number;
  onSelect: () => void;
}> = ({ programmeId, route, selected, aside = false, index, onSelect }) => {
  const { lang, t } = useI18n();
  return (
    <button
      type="button"
      className={`blade${aside ? ' blade-aside' : ''}${selected ? ' selected' : ''}${route ? '' : ' blade-noroute'}`}
      aria-pressed={selected}
      style={{ ...schoolVars(programmeId), ['--i' as string]: index }}
      onClick={onSelect}
    >
      <span className="blade-face">
        <span className="blade-top">
          {aside && <span className="blade-kicker">{t('panel.aside.kicker')}</span>}
          <span className="blade-school">{schoolCode(PROGRAMMES[programmeId].school, lang)}</span>
          {aside && <span className="blade-aside-note">{t('panel.aside.note')}</span>}
        </span>
        <span className="blade-name">{programmeName(programmeId, lang)}</span>
        <span className="blade-time">
          <WalkTime route={route} />
        </span>
      </span>
    </button>
  );
};

/** Bascules « Et si tu passais par… ». Masquées s'il n'y a qu'une voie. */
export const VariantChips: React.FC<{
  variantIds: VariantId[];
  value: VariantChoice;
  onChange: (v: VariantChoice) => void;
  title: string;
}> = ({ variantIds, value, onChange, title }) => {
  const { lang } = useI18n();
  if (variantIds.length < 2) return null;
  const options: VariantChoice[] = ['auto', ...variantIds];
  return (
    <div className="etsi" role="group" aria-label={title}>
      <span className="etsi-title">{title}</span>
      <div className="etsi-chips">
        {options.map((v) => (
          <button key={v} type="button" className={`chip-btn${value === v ? ' selected' : ''}`} aria-pressed={value === v} onClick={() => onChange(v)}>
            {variantChip(v, lang)}
          </button>
        ))}
      </div>
    </div>
  );
};

const APPRENTICESHIPS = new Set(['tr_cfc_mp1', 'tr_cfc', 'tr_afp', 'tr_ecg_cfc']);

/** Les CFC nommés d'un sentier : quelques exemples proches des envies, puis la liste de l'école. */
const CfcNames: React.FC<{ programmeId: string; user: UserProfile }> = ({ programmeId, user }) => {
  const { lang, t } = useI18n();
  const list = cfcListFor(programmeId);
  if (!list.labels.length) return null;
  const examples = cfcExamplesFor(programmeId, user, 3);
  return (
    <div className="trail-cfc">
      <p>
        <span className="trail-kicker">{t('access.cfc.examples')}</span>{' '}
        <span lang="fr">{formatList('fr', examples, 'app.or')}</span>
      </p>
      {list.labels.length > examples.length && (
        <details>
          <summary>{t('access.cfc.list', { n: list.labels.length })}</summary>
          <ul className="cfc-list" lang="fr">
            {list.labels.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </details>
      )}
      {!list.complete && <p className="trail-note">{t('access.cfc.list.incomplete')}</p>}
      {lang !== 'fr' && <p className="trail-note">{t('note.frenchOnly.cfc')}</p>}
    </div>
  );
};

/**
 * Le sentier d'un chemin : départ, formations avec leur durée et le titre obtenu, porte d'entrée, arrivée.
 * `detailed` ajoute la remarque de la règle d'admission (fiche filière).
 */
export const RouteTrail: React.FC<{
  route: Route;
  situation: Situation;
  user: UserProfile;
  detailed?: boolean;
}> = ({ route, situation, user, detailed = false }) => {
  const { lang, t } = useI18n();
  const p = PROGRAMMES[route.programmeId];
  const adm = route.admission;
  const namesCfc = !!adm.assumption && CFC_QUALIFIERS.has(adm.assumption);
  const cfcStep = route.steps.findIndex((st) => st.kind === 'training' && APPRENTICESHIPS.has(st.trainingId));
  const name = programmeName(route.programmeId, lang);
  return (
    <ol className="trail" aria-label={t('panel.path.aria', { name })} style={schoolVars(route.programmeId)}>
      <li className="trail-node trail-start">
        <span className="trail-dot" aria-hidden="true" />
        <div className="trail-body">
          <span className="trail-kicker">{t('sheet.paths.start')}</span>
          <strong>{startLabel(situation, route.startId, lang, t)}</strong>
        </div>
      </li>
      {route.steps.map((st, i) => {
        if (st.kind !== 'training') return null;
        return (
          <li key={`${st.trainingId}-${i}`} className="trail-node">
            <span className="trail-dot" aria-hidden="true" />
            <div className="trail-body">
              <div className="trail-head">
                <strong>{trainingLabel(st.trainingId, lang, st.anyMs)}</strong>
                <span className="trail-dur">{formatYears(lang, st.durMin, st.durMax)}</span>
              </div>
              <p className="trail-earned">
                <span className="trail-kicker">{t('panel.title.earned')}</span> {credentialLabel(st.credentialId, lang, st.anyMs)}
              </p>
              {st.condition && (
                <p className="trail-note">
                  {t('access.entryCondition')}{colon(lang)}{conditionLabel(st.condition, lang)}
                </p>
              )}
              {namesCfc && i === cfcStep && <CfcNames programmeId={route.programmeId} user={user} />}
              {TRAININGS[st.trainingId]?.fixedCfc && <p className="trail-note">{t('access.cfc.fixed')}</p>}
              {st.status === 'to_review' && <p className="trail-note trail-review">{t('note.toReview')}</p>}
            </div>
          </li>
        );
      })}
      <li className={`trail-node trail-gate access-${adm.access}`}>
        <span className="trail-dot" aria-hidden="true" />
        <div className="trail-body">
          <strong className="access-label">{t(`access.${adm.access === 'non_admis' ? 'sur_dossier' : adm.access}` as const)}</strong>
          {adm.assumption && <p className="trail-assumption">{qualifierLabel(adm.assumption, lang)}</p>}
          {namesCfc && cfcStep < 0 && <CfcNames programmeId={route.programmeId} user={user} />}
          {adm.requirementIds.length > 0 && (
            <div className="trail-req">
              <span className="trail-kicker">{t('access.with')}</span>
              <ul>
                {adm.requirementIds.map((id) => (
                  <li key={id}>{requirementLabel(id, lang)}</li>
                ))}
              </ul>
            </div>
          )}
          {adm.extraStudyYears > 0 && <p className="trail-note">{t('access.studyExtra', { n: formatYears(lang, adm.extraStudyYears) })}</p>}
          {detailed && adm.note && (
            <p className="trail-note" lang="fr">
              {adm.note}
            </p>
          )}
          {adm.status === 'to_review' && <p className="trail-note trail-review">{t('note.toReview')}</p>}
        </div>
      </li>
      <li className="trail-node trail-arrival">
        <span className="trail-dot" aria-hidden="true">
          <Flag size={14} strokeWidth={2.5} />
        </span>
        <div className="trail-body">
          <span className="trail-kicker">{schoolCode(p.school, lang)}</span>
          <strong>{name}</strong>
          <span className="trail-sub">{t('sheet.bachelorIn', { years: formatYears(lang, p.durationYears + adm.extraStudyYears) })}</span>
        </div>
      </li>
    </ol>
  );
};
