import styles from './TuerchenBlock.module.css'

type Props = {
  className?: string
  disableInnerContainer?: boolean
  [key: string]: unknown
}

/**
 * Static, shuffled order of days to mimic a random, but non-changing layout.
 * Includes all days 1..24 exactly once.
 */
const ORDER: readonly number[] = [
  7, 19, 2, 14, 9, 23, 5, 12, 1, 16, 4, 20, 11, 6, 18, 3, 15, 10, 22, 8, 13, 21, 24, 17,
] as const

/**
 * Bigger doors for special days:
 * - 24 (Heiligabend) largest
 * - Advent Sundays (commonly 1, 8, 15, 22) larger
 * - Nikolaus (6) medium
 */
const isAdventSunday = (day: number) => [1, 8, 15, 22].includes(day)
const isNikolaus = (day: number) => day === 6

function getSizeForDay(day: number): 'sm' | 'md' | 'lg' | 'xl' {
  if (day === 24) return 'xl'
  if (isAdventSunday(day)) return 'lg'
  if (isNikolaus(day)) return 'md'
  return 'sm'
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

const dayFormatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long' })

export const TuerchenBlock = ({ className }: Props) => {
  const now = new Date()
  const month = now.getMonth()
  const today = now.getDate()
  const year = now.getFullYear()

  const unlockedThreshold = month < 11 ? 0 : Math.min(today, 24)
  const hasUnlockedDoor = unlockedThreshold > 0
  const latestOpenDoor = hasUnlockedDoor ? unlockedThreshold : null
  const nextUnlockDay = unlockedThreshold >= 24 ? null : unlockedThreshold + 1
  const nextUnlockDate =
    nextUnlockDay != null ? new Date(year, 11, nextUnlockDay) : null

  const openDoors = new Set<number>(ORDER.filter((day) => day <= unlockedThreshold))
  const ctaHref = latestOpenDoor ? `/advent/${pad2(latestOpenDoor)}` : undefined
  const ctaLabel = latestOpenDoor ? `Türchen ${pad2(latestOpenDoor)} öffnen` : 'Bleib gespannt'

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(' ')}
      aria-labelledby="advent-of-fsi-heading"
    >
      <div className={styles.inner}>
        <div className={styles.intro}>
          <span className={styles.badge}>2025 Edition</span>
          <h1 className={styles.title} id="advent-of-fsi-heading">
            Advent of <span className={styles.titleAccent}>FS[i]</span>
          </h1>
          <p className={styles.lead}>
            Jeden Tag eine kleine, feine Überraschung aus unserer Fachschaft – modern, minimalistisch und festlich.
          </p>
          <div className={styles.ctaRow}>
            {ctaHref ? (
              <a className={styles.ctaLink} href={ctaHref}>
                {ctaLabel}
              </a>
            ) : (
              <span className={styles.ctaLinkDisabled} aria-disabled="true">
                {ctaLabel}
              </span>
            )}
            <span className={styles.ctaMeta}>
              {nextUnlockDate
                ? `Nächstes Türchen ab ${dayFormatter.format(nextUnlockDate)}`
                : 'Alle 24 Türchen sind geöffnet'}
            </span>
          </div>
        </div>

        <div className={styles.gridWrap}>
          <div className={styles.adventGrid} role="grid" aria-label="Adventskalender">
            {ORDER.map((day) => {
              const size = getSizeForDay(day)
              const open = openDoors.has(day)

              return (
                <a
                  key={day}
                  href={`/advent/${pad2(day)}`}
                  className={[styles.door, styles[size], open ? styles.open : styles.closed].join(' ')}
                  role="gridcell"
                  aria-label={`Türchen ${pad2(day)} ${open ? 'geöffnet' : 'geschlossen'}`}
                >
                  <span className={styles.number}>{pad2(day)}</span>
                  {!open && nextUnlockDay === day ? (
                    <span className={styles.comingSoon}>bald</span>
                  ) : null}
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
