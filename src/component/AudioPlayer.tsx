import 'shikwasa/dist/style.css';
import { Player } from 'shikwasa';
import { Ref, forwardRef, useEffect, useRef, useState } from 'react';
import type { PlaybackQueueItem } from '../types/audio_player';

export type AudioPlayerProps = {
    data?: AudioPlayerParams;
    nowPlaying?: PlaybackQueueItem | null;
    upcomingItems?: PlaybackQueueItem[];
    queueSourceTitle?: string;
    hasNextItem?: boolean;
    hasPreviousItem?: boolean;
    isQueueOpen?: boolean;
    onToggleQueue?: () => void;
    onEnded?: () => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
    onPlayNext?: () => void;
    onPlayPrevious?: () => void;
};

export type AudioPlayerRef = {
    play: () => void;
    pause: () => void;
    toggle: () => void;
    updateAudioData: ({ params }: { params: AudioPlayerParams }) => void;
    seek: (time: number) => void;
    getCurrentTime: () => number;
};

const QueueListIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 text-primary shrink-0"
    >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

const SkipNextIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v6.62c0 1.44 1.555 2.343 2.805 1.628L12 13.04v2.27c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 5.56C13.555 4.846 12 5.75 12 7.19v2.27L5.055 7.06z" />
        <path d="M20.25 6.75a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0v-9a.75.75 0 01.75-.75z" />
    </svg>
);

const SkipPrevIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.27l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.27c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
        <path d="M3.75 6.75a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0v-9a.75.75 0 01.75-.75z" />
    </svg>
);

const ChevronIcon = ({ isOpen }: { isOpen?: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-4 h-4 text-base-content/50 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
    >
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

const MinimizeIcon = ({ isMinimized }: { isMinimized: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
    >
        {isMinimized ? (
            <polyline points="15 18 9 12 15 6" />
        ) : (
            <polyline points="9 18 15 12 9 6" />
        )}
    </svg>
);

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>((props, ref: Ref<AudioPlayerRef>) => {
    const {
        data,
        upcomingItems = [],
        queueSourceTitle = '',
        hasNextItem = false,
        hasPreviousItem = false,
        isQueueOpen = false,
        onToggleQueue,
        onEnded,
        onPlayStateChange,
        onPlayNext,
        onPlayPrevious,
    } = props;

    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const { title, artist, cover, src } = data ?? { title: '', artist: '', cover: '', src: '' };
    const [themeColor] = useState(() => '#582a08');

    const containerRef = useRef<HTMLDivElement>(null);
    const playerInstanceRef = useRef<any>(null);

    const onEndedRef = useRef(onEnded);
    onEndedRef.current = onEnded;

    const onPlayStateChangeRef = useRef(onPlayStateChange);
    onPlayStateChangeRef.current = onPlayStateChange;

    const onPlayNextRef = useRef(onPlayNext);
    onPlayNextRef.current = onPlayNext;

    const onPlayPreviousRef = useRef(onPlayPrevious);
    onPlayPreviousRef.current = onPlayPrevious;

    useEffect(() => {
        const playerElement = containerRef.current;
        if (!playerElement) return;

        const player = new Player({
            container: () => playerElement,
            audio: {
                title,
                artist,
                cover: cover || '/porkast-logo.png',
                src,
            },
            fixed: {
                type: 'static',
            },
            theme: 'light',
            themeColor,
            autoplay: false,
        });

        playerInstanceRef.current = player;

        const bindMediaSessionHandlers = () => {
            if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
                try {
                    navigator.mediaSession.setActionHandler('nexttrack', () => {
                        onPlayNextRef.current?.();
                    });
                    navigator.mediaSession.setActionHandler('previoustrack', () => {
                        onPlayPreviousRef.current?.();
                    });
                } catch {
                    // Ignore unsupported mediaSession actions
                }
            }
        };

        player.on('playing', () => {
            setShowAudioPlayer(true);
            onPlayStateChangeRef.current?.(true);
            bindMediaSessionHandlers();
        });

        player.on('pause', () => {
            onPlayStateChangeRef.current?.(false);
        });

        player.on('ended', () => {
            onPlayStateChangeRef.current?.(false);
            onEndedRef.current?.();
        });

        if (ref) {
            (ref as any).current = {
                play: () => {
                    setShowAudioPlayer(true);
                    player.play();
                },
                pause: () => {
                    player.pause();
                },
                toggle: () => {
                    setShowAudioPlayer(true);
                    player.toggle();
                },
                updateAudioData: ({ params }: { params: AudioPlayerParams }) => {
                    player.update({
                        title: params.title,
                        artist: params.artist,
                        cover: params.cover || '/porkast-logo.png',
                        src: params.src,
                    });
                },
                seek: (time: number) => {
                    player.seek(time);
                },
                getCurrentTime: () => {
                    return typeof player.currentTime === 'number' ? player.currentTime : 0;
                },
            };
        }
    }, [src]);

    const upcomingCount = upcomingItems.length;
    const nextEpisode = upcomingItems[0];

    return (
        <div
            style={{ visibility: showAudioPlayer ? 'visible' : 'hidden' }}
            className={`fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-4 sm:right-4 z-40 transition-transform duration-300 ${
                isMinimized ? 'sm:translate-x-[calc(100%-3.5rem)]' : 'sm:translate-x-0'
            }`}
        >
            <div className="w-full sm:w-[580px] md:w-[660px] lg:w-[700px] sm:max-w-[calc(100vw-2rem)] bg-base-100 sm:rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] sm:shadow-2xl border-t sm:border border-base-300 overflow-hidden">
                {/* Queue Banner (matches iOS NowPlayingView queueBar) */}
                <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-base-200/75 border-b border-base-300/80 min-w-0">
                    {/* Minimize/Expand Handle on Desktop */}
                    <button
                        type="button"
                        aria-label={isMinimized ? 'Expand audio player' : 'Minimize audio player'}
                        title={isMinimized ? 'Expand player' : 'Minimize player'}
                        onClick={() => setIsMinimized((prev) => !prev)}
                        className="hidden sm:inline-flex w-7 h-7 rounded-lg items-center justify-center text-base-content/55 hover:text-base-content hover:bg-base-300/60 transition-colors shrink-0 cursor-pointer"
                    >
                        <MinimizeIcon isMinimized={isMinimized} />
                    </button>

                    {/* Clickable Queue Summary Trigger */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isMinimized) setIsMinimized(false);
                            onToggleQueue?.();
                        }}
                        className="flex items-center gap-2 min-w-0 flex-1 py-0.5 text-left cursor-pointer group"
                    >
                        <QueueListIcon />
                        <span className="text-xs sm:text-sm font-semibold text-base-content group-hover:text-primary transition-colors shrink-0">
                            Up Next
                        </span>

                        {upcomingCount > 0 && (
                            <span className="text-xs font-bold text-primary shrink-0">
                                ({upcomingCount})
                            </span>
                        )}

                        {nextEpisode ? (
                            <>
                                <span className="text-xs text-base-content/40 shrink-0">•</span>
                                <span
                                    title={`Next: ${nextEpisode.title}`}
                                    className="text-xs text-base-content/65 truncate min-w-0 flex-1"
                                >
                                    Next: {nextEpisode.title}
                                </span>
                            </>
                        ) : queueSourceTitle ? (
                            <>
                                <span className="text-xs text-base-content/40 shrink-0">•</span>
                                <span
                                    title={`From: ${queueSourceTitle}`}
                                    className="text-xs text-base-content/60 truncate min-w-0 flex-1"
                                >
                                    From: {queueSourceTitle}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-xs text-base-content/40 shrink-0">•</span>
                                <span className="text-xs text-base-content/50 truncate min-w-0 flex-1">
                                    No upcoming episodes
                                </span>
                            </>
                        )}
                    </button>

                    {/* Quick Skip & Queue Toggle Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            aria-label="Previous episode"
                            title="Previous episode"
                            disabled={!hasPreviousItem}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlayPrevious?.();
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-base-content/70 hover:text-primary hover:bg-base-300/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                            <SkipPrevIcon />
                        </button>

                        <button
                            type="button"
                            aria-label="Next episode"
                            title="Next episode"
                            disabled={!hasNextItem}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlayNext?.();
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-base-content/70 hover:text-primary hover:bg-base-300/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                            <SkipNextIcon />
                        </button>

                        <button
                            type="button"
                            aria-label="Toggle Playing Queue"
                            title="Playing Queue"
                            onClick={() => {
                                if (isMinimized) setIsMinimized(false);
                                onToggleQueue?.();
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-base-300/60 transition-colors cursor-pointer"
                        >
                            <ChevronIcon isOpen={isQueueOpen} />
                        </button>
                    </div>
                </div>

                {/* Shikwasa Audio Player Mount Element */}
                <div ref={containerRef} className="shikwasa-player-element w-full" />
            </div>
        </div>
    );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
