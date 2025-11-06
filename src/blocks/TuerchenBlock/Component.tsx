type Props = {
  className?: string;
};

/**
 * Static, shuffled order of days to mimic a random, but non-changing layout.
 * Includes all days 1..24 exactly once.
 */
const ORDER: readonly number[] = [
  7, 19, 2, 14, 9, 23, 5, 12, 1, 16, 4, 20, 11, 6, 18, 3, 15, 10, 22, 8, 13, 21, 24, 17,
] as const;

/**
 * Bigger doors for special days:
 * - 24 (Heiligabend) largest
 * - Advent Sundays (commonly 1, 8, 15, 22) larger
 * - Nikolaus (6) medium
 */
const isAdventSunday = (day: number) => [1, 8, 15, 22].includes(day);
const isNikolaus = (day: number) => day === 6;

function getSizeForDay(day: number): 'sm' | 'md' | 'lg' | 'xl' {
  if (day === 24) return 'xl';
  if (isAdventSunday(day)) return 'lg';
  if (isNikolaus(day)) return 'md';
  return 'sm';
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

import styles from './TuerchenBlock.module.css'

export const TuerchenBlock: React.FC<Props> = ({ className }) => {
  const now = new Date()
  const month = now.getMonth() // 0=Jan, 11=Dec
  const today = now.getDate()

  const isOpenDay = (day: number) => {
    if (month < 11) return false // before December
    if (month > 11) return true // after December
    return day <= Math.min(24, today)
  }

  return (
    <div className={[styles.adventGrid, className].filter(Boolean).join(' ')} role="grid" aria-label="Adventskalender">
      {ORDER.map((day) => {
        const size = getSizeForDay(day)
        const open = isOpenDay(day)
        return (
          <a
            key={day}
            href={`/advent/${pad2(day)}`}
            className={[styles.door, styles[size], open ? styles.open : styles.closed].join(' ')}
            role="gridcell"
            aria-label={`Türchen ${day}`}
          >
            <span className={styles.number}>{pad2(day)}</span>
          </a>
        )
      })}
    </div>
  )
}
