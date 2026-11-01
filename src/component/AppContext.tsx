import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import AudioPlayer, { AudioPlayerRef } from './AudioPlayer';
import { MsgAlert, MsgAlertRef, MsgAlertType } from './MsgAlert';
import AddToPlayListDialog, { AddToPlayListDialogRef } from './AddToPlayListDialog';
import CreatePlaylistDialog, { CreatePlaylistDialogRef } from './CreatePlaylistDialog';
import PlaybackQueueView from './PlaybackQueueView';
import {
    audioParamsToQueueItem,
    type PlaybackQueueItem,
    type PlayQueueOptions,
} from '../types/audio_player';

type AppContextType = {
    isProvided?: boolean;
    nowPlaying: PlaybackQueueItem | null;
    isPlaying: boolean;
    queueSourceTitle: string;
    queueSourceKey: string;
    upcomingItems: PlaybackQueueItem[];
    hasMoreQueueItems: boolean;
    isLoadingMoreQueueItems: boolean;
    hasNextItem: boolean;
    hasPreviousItem: boolean;
    updateAudio: (params: AudioPlayerParams) => void;
    play: () => void;
    pause: () => void;
    togglePlayback: () => void;
    seek: (time: number) => void;
    playEpisode: (episode: PlaybackQueueItem, options?: PlayQueueOptions) => void;
    playNext: () => void;
    playPrevious: () => void;
    skipToQueueItem: (id: string) => void;
    removeFromQueue: (id: string) => void;
    clearQueue: () => void;
    loadMoreQueueItemsIfNeeded: () => Promise<void>;
    syncSourceQueue: (
        sourceKey: string,
        items: PlaybackQueueItem[],
        hasMore: boolean,
        loadMore?: () => Promise<PlaybackQueueItem[]>
    ) => void;
    showMsgAlert: (msg: string, msgType: MsgAlertType) => void;
    addToPlayListFunction: (userId: string, title: string, feedId: string, guid: string, source: string) => void;
    createPlaylistFunction: (isMockData: boolean) => void;
};

const AppContext = createContext<AppContextType>({
    isProvided: false,
    nowPlaying: null,
    isPlaying: false,
    queueSourceTitle: '',
    queueSourceKey: '',
    upcomingItems: [],
    hasMoreQueueItems: false,
    isLoadingMoreQueueItems: false,
    hasNextItem: false,
    hasPreviousItem: false,
    play: () => {},
    pause: () => {},
    togglePlayback: () => {},
    seek: () => {},
    updateAudio: () => {},
    playEpisode: () => {},
    playNext: () => {},
    playPrevious: () => {},
    skipToQueueItem: () => {},
    removeFromQueue: () => {},
    clearQueue: () => {},
    loadMoreQueueItemsIfNeeded: async () => {},
    syncSourceQueue: () => {},
    showMsgAlert: () => {},
    addToPlayListFunction: () => {},
    createPlaylistFunction: () => {},
});

export const useAppContext = () => useContext(AppContext);

type AppProviderProps = {
    children: React.ReactNode;
};

function computeActiveItems(items: PlaybackQueueItem[], removedIds: Set<string>): PlaybackQueueItem[] {
    if (removedIds.size === 0) return items;
    return items.filter((item) => !removedIds.has(item.id));
}

function findItemIndex(items: PlaybackQueueItem[], target: PlaybackQueueItem | null): number {
    if (!target || items.length === 0) return -1;
    const byId = items.findIndex((item) => item.id === target.id);
    if (byId !== -1) return byId;
    if (target.src) {
        const bySrc = items.findIndex((item) => item.src === target.src);
        if (bySrc !== -1) return bySrc;
    }
    return 0;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const parentContext = useContext(AppContext);

    const audioRef = useRef<AudioPlayerRef>(null);
    const msgAlertRef = useRef<MsgAlertRef>(null);
    const addToPlaylistModalRef = useRef<AddToPlayListDialogRef>(null);
    const createPlaylistModalRef = useRef<CreatePlaylistDialogRef>(null);

    const [nowPlaying, setNowPlaying] = useState<PlaybackQueueItem | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queueItems, setQueueItems] = useState<PlaybackQueueItem[]>([]);
    const [removedIds, setRemovedIds] = useState<string[]>([]);
    const [queueSourceTitle, setQueueSourceTitle] = useState('');
    const [queueSourceKey, setQueueSourceKey] = useState('');
    const [hasMoreQueueItems, setHasMoreQueueItems] = useState(false);
    const [isLoadingMoreQueueItems, setIsLoadingMoreQueueItems] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);

    const loadMoreHandlerRef = useRef<(() => Promise<PlaybackQueueItem[]>) | undefined>(undefined);
    const isLoadingMoreRef = useRef(false);

    const stateRef = useRef({
        nowPlaying,
        queueItems,
        removedIds,
        queueSourceKey,
        hasMoreQueueItems,
    });
    stateRef.current = {
        nowPlaying,
        queueItems,
        removedIds,
        queueSourceKey,
        hasMoreQueueItems,
    };

    const startPlayback = useCallback((item: PlaybackQueueItem) => {
        setNowPlaying(item);
        stateRef.current.nowPlaying = item;
        if (audioRef.current) {
            audioRef.current.updateAudioData({
                params: {
                    id: item.id,
                    itemId: item.itemId,
                    channelId: item.channelId,
                    title: item.title,
                    artist: item.artist,
                    channelTitle: item.channelTitle,
                    cover: item.cover,
                    src: item.src,
                    duration: item.duration,
                },
            });
            audioRef.current.play();
        }
    }, []);

    const playEpisode = useCallback(
        (episode: PlaybackQueueItem, options?: PlayQueueOptions) => {
            const rawList = options?.items && options.items.length > 0 ? options.items : [episode];
            const hasEpisodeInList = rawList.some(
                (i) => i.id === episode.id || (episode.src && i.src === episode.src)
            );
            const normalizedItems = hasEpisodeInList ? rawList : [episode, ...rawList];

            const nextSourceTitle = options?.sourceTitle ?? '';
            const nextSourceKey = options?.sourceKey ?? '';
            const nextHasMore = Boolean(options?.hasMore);

            loadMoreHandlerRef.current = options?.loadMore;
            isLoadingMoreRef.current = false;

            setQueueItems(normalizedItems);
            setRemovedIds([]);
            setQueueSourceTitle(nextSourceTitle);
            setQueueSourceKey(nextSourceKey);
            setHasMoreQueueItems(nextHasMore);
            setIsLoadingMoreQueueItems(false);

            stateRef.current = {
                nowPlaying: episode,
                queueItems: normalizedItems,
                removedIds: [],
                queueSourceKey: nextSourceKey,
                hasMoreQueueItems: nextHasMore,
            };

            startPlayback(episode);
        },
        [startPlayback]
    );

    const loadMoreQueueItemsIfNeeded = useCallback(async () => {
        if (
            isLoadingMoreRef.current ||
            !stateRef.current.hasMoreQueueItems ||
            !loadMoreHandlerRef.current
        ) {
            return;
        }

        isLoadingMoreRef.current = true;
        setIsLoadingMoreQueueItems(true);

        try {
            const fetched = await loadMoreHandlerRef.current();
            if (!fetched || fetched.length === 0) {
                setHasMoreQueueItems(false);
                stateRef.current.hasMoreQueueItems = false;
            } else {
                const currentList = stateRef.current.queueItems;
                const existingIds = new Set(currentList.map((item) => item.id));
                const uniqueNew = fetched.filter((item) => !existingIds.has(item.id));
                if (uniqueNew.length === 0) {
                    setHasMoreQueueItems(false);
                    stateRef.current.hasMoreQueueItems = false;
                } else {
                    const merged = [...currentList, ...uniqueNew];
                    setQueueItems(merged);
                    stateRef.current.queueItems = merged;
                }
            }
        } catch {
            // Keep existing queue items if network call fails
        } finally {
            isLoadingMoreRef.current = false;
            setIsLoadingMoreQueueItems(false);
        }
    }, []);

    const playNext = useCallback(() => {
        const { nowPlaying: current, queueItems: items, removedIds: removed } = stateRef.current;
        const active = computeActiveItems(items, new Set(removed));
        const idx = findItemIndex(active, current);

        if (idx !== -1 && idx + 1 < active.length) {
            startPlayback(active[idx + 1]);
            return;
        }

        if (stateRef.current.hasMoreQueueItems && loadMoreHandlerRef.current) {
            void (async () => {
                await loadMoreQueueItemsIfNeeded();
                const updated = stateRef.current;
                const updatedActive = computeActiveItems(updated.queueItems, new Set(updated.removedIds));
                const updatedIdx = findItemIndex(updatedActive, updated.nowPlaying);
                if (updatedIdx !== -1 && updatedIdx + 1 < updatedActive.length) {
                    startPlayback(updatedActive[updatedIdx + 1]);
                } else {
                    audioRef.current?.pause();
                    setIsPlaying(false);
                }
            })();
            return;
        }

        audioRef.current?.pause();
        setIsPlaying(false);
    }, [loadMoreQueueItemsIfNeeded, startPlayback]);

    const playPrevious = useCallback(() => {
        const currentTime = audioRef.current?.getCurrentTime() ?? 0;
        if (currentTime > 3) {
            audioRef.current?.seek(0);
            return;
        }

        const { nowPlaying: current, queueItems: items, removedIds: removed } = stateRef.current;
        const active = computeActiveItems(items, new Set(removed));
        const idx = findItemIndex(active, current);

        if (idx > 0) {
            startPlayback(active[idx - 1]);
        } else {
            audioRef.current?.seek(0);
        }
    }, [startPlayback]);

    const skipToQueueItem = useCallback(
        (id: string) => {
            const { queueItems: items, removedIds: removed } = stateRef.current;
            const active = computeActiveItems(items, new Set(removed));
            const target = active.find((item) => item.id === id);
            if (target) {
                startPlayback(target);
            }
        },
        [startPlayback]
    );

    const removeFromQueue = useCallback((id: string) => {
        setRemovedIds((prev) => {
            if (prev.includes(id)) return prev;
            const next = [...prev, id];
            stateRef.current.removedIds = next;
            return next;
        });
    }, []);

    const clearQueue = useCallback(() => {
        const { nowPlaying: current, queueItems: items, removedIds: removed } = stateRef.current;
        const active = computeActiveItems(items, new Set(removed));
        const idx = findItemIndex(active, current);
        const upcoming = idx !== -1 && idx + 1 < active.length ? active.slice(idx + 1) : [];

        const nextRemoved = Array.from(new Set([...removed, ...upcoming.map((item) => item.id)]));
        setRemovedIds(nextRemoved);
        setHasMoreQueueItems(false);
        loadMoreHandlerRef.current = undefined;
        stateRef.current.removedIds = nextRemoved;
        stateRef.current.hasMoreQueueItems = false;
    }, []);

    const syncSourceQueue = useCallback(
        (
            sourceKey: string,
            items: PlaybackQueueItem[],
            hasMore: boolean,
            loadMore?: () => Promise<PlaybackQueueItem[]>
        ) => {
            if (!sourceKey || stateRef.current.queueSourceKey !== sourceKey) {
                return;
            }
            if (loadMore) {
                loadMoreHandlerRef.current = loadMore;
            }
            setHasMoreQueueItems(hasMore);
            stateRef.current.hasMoreQueueItems = hasMore;

            if (items.length > 0) {
                const current = stateRef.current.nowPlaying;
                const existing = stateRef.current.queueItems;
                const mergedMap = new Map<string, PlaybackQueueItem>();

                if (current && !items.some((i) => i.id === current.id)) {
                    mergedMap.set(current.id, current);
                }
                for (const item of items) {
                    mergedMap.set(item.id, item);
                }
                for (const item of existing) {
                    if (!mergedMap.has(item.id)) {
                        mergedMap.set(item.id, item);
                    }
                }
                const merged = Array.from(mergedMap.values());
                setQueueItems(merged);
                stateRef.current.queueItems = merged;
            }
        },
        []
    );

    const activeItems = useMemo(
        () => computeActiveItems(queueItems, new Set(removedIds)),
        [queueItems, removedIds]
    );

    const currentIndex = useMemo(
        () => findItemIndex(activeItems, nowPlaying),
        [activeItems, nowPlaying]
    );

    const upcomingItems = useMemo(() => {
        if (currentIndex === -1 || currentIndex + 1 >= activeItems.length) {
            return [];
        }
        return activeItems.slice(currentIndex + 1);
    }, [activeItems, currentIndex]);

    const hasNextItem =
        (currentIndex !== -1 && currentIndex + 1 < activeItems.length) || hasMoreQueueItems;
    const hasPreviousItem = currentIndex > 0;

    // Avoid duplicate nested providers when both App.tsx and page components wrap <AppProvider>
    if (parentContext.isProvided) {
        return <>{children}</>;
    }

    const appContextValue: AppContextType = {
        isProvided: true,
        nowPlaying,
        isPlaying,
        queueSourceTitle,
        queueSourceKey,
        upcomingItems,
        hasMoreQueueItems,
        isLoadingMoreQueueItems,
        hasNextItem,
        hasPreviousItem,
        play: () => {
            audioRef.current?.play();
        },
        pause: () => {
            audioRef.current?.pause();
        },
        togglePlayback: () => {
            audioRef.current?.toggle();
        },
        updateAudio: (params: AudioPlayerParams) => {
            const queueItem = audioParamsToQueueItem(params);
            setNowPlaying(queueItem);
            stateRef.current.nowPlaying = queueItem;

            const currentList = stateRef.current.queueItems;
            const inQueue = currentList.some(
                (item) => item.id === queueItem.id || (queueItem.src && item.src === queueItem.src)
            );
            if (!inQueue) {
                setQueueItems([queueItem]);
                setRemovedIds([]);
                setQueueSourceTitle('');
                setQueueSourceKey('');
                setHasMoreQueueItems(false);
                loadMoreHandlerRef.current = undefined;
                stateRef.current.queueItems = [queueItem];
                stateRef.current.removedIds = [];
                stateRef.current.queueSourceKey = '';
                stateRef.current.hasMoreQueueItems = false;
            }
            audioRef.current?.updateAudioData({ params });
        },
        seek: (time: number) => {
            audioRef.current?.seek(time);
        },
        playEpisode,
        playNext,
        playPrevious,
        skipToQueueItem,
        removeFromQueue,
        clearQueue,
        loadMoreQueueItemsIfNeeded,
        syncSourceQueue,
        showMsgAlert: (msg: string, msgType: MsgAlertType) => {
            msgAlertRef.current?.showAlert(msg, msgType);
        },
        addToPlayListFunction: (
            _userId: string,
            title: string,
            feedId: string,
            guid: string,
            source: string
        ) => {
            addToPlaylistModalRef.current?.showDialog(title, feedId, guid, source);
        },
        createPlaylistFunction: (isMockData: boolean) => {
            createPlaylistModalRef.current?.showDialog(isMockData);
        },
    };

    return (
        <AppContext.Provider value={appContextValue}>
            <div className={nowPlaying ? 'pb-36 sm:pb-40' : ''}>{children}</div>
            <PlaybackQueueView isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
            <AudioPlayer
                ref={audioRef}
                data={{
                    title: 'porkast',
                    artist: 'porkast',
                    cover: '/porkast-logo.png',
                    src: 'https://shikwasa.js.org/assets/STS-133_FD11_Mission_Status_Briefing.mp3',
                }}
                nowPlaying={nowPlaying}
                upcomingItems={upcomingItems}
                queueSourceTitle={queueSourceTitle}
                hasNextItem={hasNextItem}
                hasPreviousItem={hasPreviousItem}
                isQueueOpen={isQueueOpen}
                onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
                onEnded={playNext}
                onPlayStateChange={setIsPlaying}
                onPlayNext={playNext}
                onPlayPrevious={playPrevious}
            />
            <MsgAlert ref={msgAlertRef} />
            <AddToPlayListDialog ref={addToPlaylistModalRef} />
            <CreatePlaylistDialog ref={createPlaylistModalRef} />
        </AppContext.Provider>
    );
};
