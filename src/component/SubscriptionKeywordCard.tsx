import { Link } from 'react-router-dom'
import UnsubscribeKeywordButton from './UnsubscribeKeywordButton'
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

const Chip = ({ icon, children, title }: { icon: React.ReactNode; children: React.ReactNode; title?: string }) => (
    <span
        title={title}
        className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-base-300/70 bg-base-200/40 text-xs text-base-content/60 whitespace-nowrap"
    >
        {icon}
        {children}
    </span>
)

export default function SubscriptionKeywordCard({ item, userId }: SubscriptionKeywordCardProps) {
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
        'flex items-start gap-4 px-5 pt-5 pb-4 rounded-t-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset'

    return (
        <div className="group w-full bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden mb-4 transition-all hover:border-base-300 hover:shadow-md">
            {hasKeyword ? (
                <Link to={href} className={topClassName}>
                    {topContent}
                </Link>
            ) : (
                <div className={topClassName}>{topContent}</div>
            )}

            <div className="border-t border-base-200" />

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-2.5">
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    {updateText && (
                        <Chip icon={<CalendarIcon />} title={updateText}>
                            {updateText.replace(/^(Updated|Created) /, '')}
                        </Chip>
                    )}
                    {item.Country && (
                        <Chip icon={<GlobeIcon />} title={`Country: ${item.Country}`}>
                            {item.Country.toUpperCase()}
                        </Chip>
                    )}
                    {item.Lang && (
                        <Chip icon={<LangIcon />} title={`Language: ${item.Lang}`}>
                            {item.Lang.toUpperCase()}
                        </Chip>
                    )}
                    {excludeCount > 0 && (
                        <Chip icon={<ExcludeIcon />} title={`${excludeCount} feed(s) excluded`}>
                            {excludeCount} excluded
                        </Chip>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {hasKeyword && (
                        <UnsubscribeKeywordButton userId={userId} keyword={item.Keyword} />
                    )}
                </div>
            </div>
        </div>
    )
}
