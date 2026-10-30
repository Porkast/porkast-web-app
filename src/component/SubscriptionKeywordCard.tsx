import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from './AppContext'
import { MsgAlertType } from './MsgAlert'
import { useUnsubscribeKeyword } from '../hooks/useUnsubscribeKeyword'
import { API_URL } from '../libs/Constants'
import { formatDateTime } from '../libs/Common'
import type { SubscriptionDataDto } from '../types/subscription'

type SubscriptionKeywordCardProps = {
    item: SubscriptionDataDto
    userId: string
}

const HashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </svg>
)

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
)

const GlobeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z" />
    </svg>
)

const LangIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <path d="M4 5h9M8.5 5c0 4.5-2 8-5 10M5.5 9c1.2 3 3.5 5.3 6.5 6.5" />
        <path d="M13 20l4-10 4 10M14.4 17h5.2" />
    </svg>
)

const ExcludeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
    </svg>
)

const MoreIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <circle cx="5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="19" cy="12" r="1.6" />
    </svg>
)

const ShareIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
)

const LinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1L10.9 5" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1L13.1 19" />
    </svg>
)

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    </svg>
)

const MAX_VISIBLE_CHIPS = 3

const Chip = ({ icon, children, title }: { icon: React.ReactNode; children: React.ReactNode; title?: string }) => (
    <span
        title={title}
        className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-base-300/70 bg-base-200/40 text-xs text-base-content/60 whitespace-nowrap"
    >
        {icon}
        {children}
    </span>
)

type KeywordActionsMenuProps = {
    userId: string
    keyword: string
}

const KeywordActionsMenu = ({ userId, keyword }: KeywordActionsMenuProps) => {
    const detailsRef = useRef<HTMLDetailsElement>(null)
    const [openUp, setOpenUp] = useState(false)
    const navigate = useNavigate()
    const appContext = useAppContext()
    const { isUnsubscribing, unsubscribe } = useUnsubscribeKeyword(userId, keyword)

    const closeMenu = () => {
        if (detailsRef.current) {
            detailsRef.current.open = false
        }
    }

    // Flip the menu upwards when there is not enough room below the trigger
    const onToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
        const el = event.currentTarget
        if (!el.open) return
        const summary = el.querySelector('summary')
        const menu = el.querySelector('ul')
        if (!summary || !menu) return
        const summaryRect = summary.getBoundingClientRect()
        const menuHeight = menu.offsetHeight || 160
        const spaceBelow = window.innerHeight - summaryRect.bottom
        const spaceAbove = summaryRect.top
        setOpenUp(spaceBelow < menuHeight + 16 && spaceAbove > spaceBelow)
    }

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const el = detailsRef.current
            if (!el || !el.open) return
            if (!el.contains(event.target as Node)) {
                el.open = false
            }
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu()
            }
        }
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    const onShareClick = () => {
        closeMenu()
        navigate(`/share/subscription/${userId}/${encodeURIComponent(keyword)}`)
    }

    const onCopyRssClick = () => {
        closeMenu()
        const rssLink = `${API_URL}/rss/subscription/${userId}/${encodeURIComponent(keyword)}`
        navigator.clipboard.writeText(rssLink)
        appContext.showMsgAlert('RSS link copied!', MsgAlertType.INFO)
    }

    const onUnsubscribeClick = async () => {
        closeMenu()
        await unsubscribe()
    }

    return (
        <details
            ref={detailsRef}
            onToggle={onToggle}
            className={`dropdown dropdown-end ${openUp ? 'dropdown-top' : ''} absolute top-3 right-3 z-20`}
        >
            <summary
                aria-label="Keyword actions"
                className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-lg text-base-content/40 transition-colors outline-none hover:bg-base-200 hover:text-base-content/70 focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden"
            >
                <MoreIcon />
            </summary>
            <ul className={`dropdown-content menu z-[60] w-44 rounded-box border border-base-200 bg-base-100 p-1.5 text-sm shadow-lg ${openUp ? 'mb-1' : 'mt-1'}`}>
                <li>
                    <button className="gap-2.5" onClick={onShareClick}>
                        <ShareIcon />
                        Share
                    </button>
                </li>
                <li>
                    <button className="gap-2.5" onClick={onCopyRssClick}>
                        <LinkIcon />
                        Copy RSS link
                    </button>
                </li>
                <li className="mt-1 border-t border-base-200 pt-1">
                    <button
                        className="gap-2.5 text-error"
                        onClick={onUnsubscribeClick}
                        disabled={isUnsubscribing}
                    >
                        {isUnsubscribing ? <span className="loading loading-spinner loading-xs"></span> : <TrashIcon />}
                        Unsubscribe
                    </button>
                </li>
            </ul>
        </details>
    )
}

export default function SubscriptionKeywordCard({ item, userId }: SubscriptionKeywordCardProps) {
    const [chipsExpanded, setChipsExpanded] = useState(false)
    const hasKeyword = Boolean(item.Keyword)
    const title = hasKeyword ? item.Keyword : item.RefName
    const href = `/subscription/${userId}/${encodeURIComponent(item.Keyword || '')}`

    const episodeText = item.TotalCount ? `${item.TotalCount} episodes` : 'No episodes yet'
    const updateText = item.UpdateTime
        ? `Updated ${formatDateTime(String(item.UpdateTime))}`
        : item.CreateTime
            ? `Created ${formatDateTime(String(item.CreateTime))}`
            : ''

    const excludeCount = item.ExcludeFeedId
        ? item.ExcludeFeedId.split(',').map(seg => seg.trim()).filter(Boolean).length
        : 0

    const chips: { key: string; icon: React.ReactNode; label: React.ReactNode; title?: string }[] = []
    if (updateText) {
        chips.push({
            key: 'date',
            icon: <CalendarIcon />,
            label: updateText.replace(/^(Updated|Created) /, ''),
            title: updateText,
        })
    }
    if (item.Country) {
        chips.push({ key: 'country', icon: <GlobeIcon />, label: item.Country.toUpperCase(), title: `Country: ${item.Country}` })
    }
    if (item.Lang) {
        chips.push({ key: 'lang', icon: <LangIcon />, label: item.Lang.toUpperCase(), title: `Language: ${item.Lang}` })
    }
    if (excludeCount > 0) {
        chips.push({ key: 'exclude', icon: <ExcludeIcon />, label: `${excludeCount} excluded`, title: `${excludeCount} feed(s) excluded` })
    }

    const hiddenChipCount = Math.max(0, chips.length - MAX_VISIBLE_CHIPS)
    const visibleChips = chipsExpanded ? chips : chips.slice(0, MAX_VISIBLE_CHIPS)

    const topContent = (
        <>
            <div className="w-12 h-12 shrink-0 rounded-xl bg-base-200 text-base-content/60 flex items-center justify-center">
                <HashIcon />
            </div>
            <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-semibold leading-snug text-base-content truncate transition-colors group-hover:text-primary">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-base-content/60 truncate">
                    {episodeText}
                </p>
            </div>
        </>
    )

    const topClassName =
        'flex items-start gap-4 py-5 pl-5 pr-14 rounded-t-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset'

    return (
        <div className="group relative w-full bg-base-100 rounded-2xl border border-base-200 shadow-sm mb-4 transition-all hover:border-base-300 hover:shadow-md has-[details[open]]:z-30">
            {hasKeyword ? (
                <Link to={href} className={topClassName}>
                    {topContent}
                </Link>
            ) : (
                <div className={topClassName}>{topContent}</div>
            )}

            {hasKeyword && <KeywordActionsMenu userId={userId} keyword={item.Keyword} />}

            <div className="border-t border-base-200" />

            <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5">
                {visibleChips.map(chip => (
                    <Chip key={chip.key} icon={chip.icon} title={chip.title}>
                        {chip.label}
                    </Chip>
                ))}
                {hiddenChipCount > 0 && (
                    <button
                        type="button"
                        aria-expanded={chipsExpanded}
                        onClick={() => setChipsExpanded(prev => !prev)}
                        className="inline-flex h-7 items-center rounded-lg border border-base-300/70 bg-base-200/40 px-2 text-xs text-base-content/60 transition-colors hover:border-base-300 hover:text-base-content"
                    >
                        {chipsExpanded ? 'Less' : `+${hiddenChipCount}`}
                    </button>
                )}
            </div>
        </div>
    )
}
