import { useEffect, useRef } from 'react';
import { useAppContext } from './AppContext';
import type { PlaybackQueueItem } from '../types/audio_player';

type PlaybackQueueViewProps = {
    isOpen: boolean;
    onClose: () => void;
};

const WaveformIcon = ({ animate }: { animate?: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-4 h-4 shrink-0 ${animate ? 'animate-pulse' : ''}`}
    >
        <path d="M2 10v3" />
        <path d="M6 6v11" />
        <path d="M10 3v18" />
        <path d="M14 8v7" />
        <path d="M18 5v13" />
        <path d="M22 10v3" />
    </svg>
);

const PlayCircleIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
        <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
            clipRule="evenodd"
        />
    </svg>
);

const PauseCircleIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
        <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM9 8.25a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75H9zm5.25 0a.75.75 0 00-.75.75v6c0 .414.336.75.75.75H15a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-.75z"
            clipRule="evenodd"
        />
    </svg>
);

const MinusCircleIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
    </svg>
);

const CloseIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
    >
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

const EmptyQueueIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-9 h-9 text-base-content/35"
    >
        <path d="M21 15V6" />
        <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M12 12H3" />
        <path d="M16 6H3" />
        <path d="M12 18H3" />
    </svg>
);

const QueueArtwork = ({ src, alt, sizeClass }: { src: string; alt: string; sizeClass: string }) => (
    <img
        src={src || '/porkast-logo.png'}
        alt={alt}
        loading="lazy"
        onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/porkast-logo.png')) {
                target.src = '/porkast-logo.png';
            }
        }}
        className={`${sizeClass} rounded-xl object-cover shrink-0 bg-base-300 border border-base-300/60`}
    />
);

export default function PlaybackQueueView({ isOpen, onClose }: PlaybackQueueViewProps) {
    const {
        nowPlaying,
        isPlaying,
        queueSourceTitle,
        upcomingItems,
        hasMoreQueueItems,
        isLoadingMoreQueueItems,
        togglePlayback,
        skipToQueueItem,
        removeFromQueue,
        clearQueue,
        loadMoreQueueItemsIfNeeded,
    } = useAppContext();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || !hasMoreQueueItems) return;
        const sentinel = sentinelRef.current;
        const root = scrollContainerRef.current;
        if (!sentinel || !root) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void loadMoreQueueItemsIfNeeded();
                }
            },
            { root, rootMargin: '120px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [isOpen, hasMoreQueueItems, upcomingItems.length, loadMoreQueueItemsIfNeeded]);

    if (!isOpen) return null;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!hasMoreQueueItems || isLoadingMoreQueueItems) return;
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
            void loadMoreQueueItemsIfNeeded();
        }
    };

    const renderQueueItem = (item: PlaybackQueueItem) => (
        <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => skipToQueueItem(item.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    skipToQueueItem(item.id);
                }
            }}
            className="group flex items-center gap-3 p-3 rounded-2xl bg-base-200/45 hover:bg-base-200/90 border border-base-200 transition-colors cursor-pointer min-w-0"
        >
            <QueueArtwork src={item.cover} alt={item.title} sizeClass="w-12 h-12 sm:w-[50px] sm:h-[50px]" />

            <div className="min-w-0 flex-1 overflow-hidden">
                <div
                    title={item.title}
                    className="text-sm font-medium text-base-content line-clamp-2 break-words leading-snug group-hover:text-primary transition-colors"
                >
                    {item.title}
                </div>

                <div className="mt-1 flex items-center gap-1.5 min-w-0 text-xs">
                    <span
                        title={item.channelTitle || item.artist}
                        className="text-primary font-medium truncate min-w-0"
                    >
                        {item.channelTitle || item.artist}
                    </span>

                    {item.duration && (
                        <>
                            <span className="text-base-content/40 shrink-0">•</span>
                            <span className="text-base-content/60 shrink-0 whitespace-nowrap">
                                {item.duration}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <button
                type="button"
                aria-label="Remove from Queue"
                title="Remove from Queue"
                onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(item.id);
                }}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base-content/45 hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
            >
                <MinusCircleIcon />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-end sm:justify-end sm:p-5 pointer-events-auto">
            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            />

            {/* Sheet / Panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Playing Queue"
                className="relative z-10 w-full sm:w-[440px] md:w-[480px] max-h-[82vh] sm:max-h-[calc(100vh-11rem)] sm:mb-36 flex flex-col rounded-t-3xl sm:rounded-3xl bg-base-100 border-t sm:border border-base-300 shadow-2xl overflow-hidden"
            >
                {/* Mobile Drag Pill */}
                <div className="w-10 h-1.5 rounded-full bg-base-300 mx-auto mt-2.5 sm:hidden shrink-0" />

                {/* Top Navigation Header */}
                <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-base-200 shrink-0 min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-base-content truncate min-w-0">
                        Playing Queue
                    </h2>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {upcomingItems.length > 0 && (
                            <button
                                type="button"
                                onClick={clearQueue}
                                className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium text-error hover:bg-error/10 transition-colors cursor-pointer"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            type="button"
                            aria-label="Close queue"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-base-content/55 hover:text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-5"
                >
                    {/* Now Playing Section */}
                    {nowPlaying && (
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-3 min-w-0">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary shrink-0">
                                    <WaveformIcon animate={isPlaying} />
                                    <span>Now Playing</span>
                                </div>

                                {queueSourceTitle && (
                                    <div
                                        title={`From: ${queueSourceTitle}`}
                                        className="text-xs text-base-content/60 truncate min-w-0 text-right"
                                    >
                                        From: {queueSourceTitle}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-primary/5 border border-primary/30 min-w-0">
                                <QueueArtwork
                                    src={nowPlaying.cover}
                                    alt={nowPlaying.title}
                                    sizeClass="w-14 h-14 sm:w-[58px] sm:h-[58px]"
                                />

                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <div
                                        title={nowPlaying.title}
                                        className="text-sm font-semibold text-base-content line-clamp-2 break-words leading-snug"
                                    >
                                        {nowPlaying.title}
                                    </div>
                                    <div
                                        title={nowPlaying.channelTitle || nowPlaying.artist}
                                        className="mt-1 text-xs font-medium text-primary truncate"
                                    >
                                        {nowPlaying.channelTitle || nowPlaying.artist}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    aria-label={isPlaying ? 'Pause episode' : 'Play episode'}
                                    onClick={togglePlayback}
                                    className="shrink-0 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                                >
                                    {isPlaying ? <PauseCircleIcon /> : <PlayCircleIcon />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Up Next Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-base-content shrink-0">
                                Up Next
                            </h3>
                            {upcomingItems.length > 0 && (
                                <span className="text-xs sm:text-sm text-base-content/60 shrink-0">
                                    ({upcomingItems.length})
                                </span>
                            )}
                        </div>

                        {upcomingItems.length === 0 && !isLoadingMoreQueueItems ? (
                            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl bg-base-200/45 border border-base-200 text-center">
                                <EmptyQueueIcon />
                                <p className="mt-2.5 text-sm text-base-content/60">
                                    No upcoming episodes
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {upcomingItems.map(renderQueueItem)}

                                <div ref={sentinelRef} className="h-1" />

                                {isLoadingMoreQueueItems ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 text-xs text-base-content/60">
                                        <span className="loading loading-spinner loading-xs text-primary" />
                                        <span>Loading more episodes...</span>
                                    </div>
                                ) : !hasMoreQueueItems && upcomingItems.length > 0 ? (
                                    <div className="text-center text-xs text-base-content/50 py-2">
                                        All episodes loaded
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
