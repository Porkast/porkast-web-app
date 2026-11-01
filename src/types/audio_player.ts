import { convertMillsTimeToDuration, parseHtmlStrinText } from '../libs/Common';
import type { FeedItem } from './feed_item';
import type { UserListenLaterDto } from './listen_later';

export type PlaybackQueueItem = {
    id: string;
    itemId?: string;
    channelId?: string;
    title: string;
    artist: string;
    channelTitle: string;
    cover: string;
    src: string;
    duration?: string;
};

export type PlayQueueOptions = {
    items?: PlaybackQueueItem[];
    sourceTitle?: string;
    sourceKey?: string;
    hasMore?: boolean;
    loadMore?: () => Promise<PlaybackQueueItem[]>;
};

const DEFAULT_COVER = '/porkast-logo.png';

export function cleanText(value?: string | null): string {
    if (!value || value === 'null') return '';
    const cleaned = value.replace(/highlightPlaceholder/g, '');
    return parseHtmlStrinText(cleaned).trim();
}

export function normalizeDuration(raw?: string | number | null): string {
    if (raw === undefined || raw === null || raw === '' || raw === 'null') return '';
    const str = String(raw).trim();
    if (!str) return '';
    if (!isNaN(Number(str))) {
        const num = parseInt(str, 10);
        if (num > 0) {
            return convertMillsTimeToDuration(num);
        }
        return '';
    }
    return str;
}

export function normalizeCover(primary?: string | null, fallback?: string | null): string {
    const p = primary && primary !== 'null' ? primary.trim() : '';
    if (p) return p;
    const f = fallback && fallback !== 'null' ? fallback.trim() : '';
    if (f) return f;
    return DEFAULT_COVER;
}

export function audioParamsToQueueItem(params: AudioPlayerParams): PlaybackQueueItem {
    const title = cleanText(params.title) || 'Untitled Episode';
    const channelTitle = cleanText(params.channelTitle) || cleanText(params.artist);
    const artist = cleanText(params.artist) || channelTitle || 'Porkast';
    const id = params.id || params.itemId || params.src || title;

    return {
        id,
        itemId: params.itemId || params.id,
        channelId: params.channelId,
        title,
        artist,
        channelTitle: channelTitle || artist,
        cover: normalizeCover(params.cover),
        src: params.src,
        duration: normalizeDuration(params.duration),
    };
}

export function feedItemToQueueItem(item: FeedItem, fallbackImage?: string): PlaybackQueueItem {
    const title = cleanText(item.Title || item.HighlightTitle) || 'Untitled Episode';
    const channelTitle = cleanText(item.ChannelTitle || item.HighlightChannelTitle);
    const author = cleanText(item.Author);
    const artist = author || channelTitle || 'Porkast';
    const itemId = item.GUID || item.Id || item.EnclosureUrl;
    const channelId = item.ChannelId || item.FeedId;

    return {
        id: itemId || item.EnclosureUrl || title,
        itemId,
        channelId,
        title,
        artist,
        channelTitle: channelTitle || artist,
        cover: normalizeCover(item.ImageUrl, item.ChannelImageUrl || fallbackImage),
        src: item.EnclosureUrl || '',
        duration: normalizeDuration(item.Duration),
    };
}

export function listenLaterItemToQueueItem(item: UserListenLaterDto): PlaybackQueueItem {
    const title = cleanText(item.title) || 'Untitled Episode';
    const channelTitle = cleanText(item.channel_title);
    const author = cleanText(item.author);
    const artist = author || channelTitle || 'Porkast';
    const itemId = item.guid || item.id || item.enclosure_url;

    return {
        id: itemId || item.enclosure_url || title,
        itemId: item.guid,
        channelId: item.feed_id,
        title,
        artist,
        channelTitle: channelTitle || artist,
        cover: normalizeCover(item.image_url),
        src: item.enclosure_url || '',
        duration: normalizeDuration(item.duration),
    };
}
