import { FeedItem } from "../types/feed_item"
import { convertMillsTimeToDuration } from "./Common"
import { FeedChannel } from "../types/feed_channel"
import { API_URL } from "./Constants"
import { CONTENT_POLICY_ERROR, isBlockedContent } from "./contentFilter"

interface RssItem {
    guid: string;
    title: string;
    link: string;
    description: string;
    contentSnippet: string;
    pubDate: string;
    itunes: {
        author: string;
        duration: string;
        image: string;
        episode?: string;
        season?: string;
        explicit?: string;
        episodeType?: string;
    };
    enclosure: {
        url: string;
        type: string;
        length: string;
    };
}

interface RssFeed {
    title: string;
    description: string;
    link: string;
    itunes: {
        author: string;
        image: string;
        owner: {
            name: string;
            email: string;
        };
        categories: string[];
        type: string;
        explicit?: string;
    };
    imageUrl: string;
    copyright: string;
    language: string;
    items: RssItem[];
}

export const searchPodcastEpisodeFromItunes = async (q: string, entity: string, country: string, excludeFeedId: string, offset: number, limit: number, totalCount: number): Promise<FeedItem[]> => {
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=${entity}&media=podcast&country=${country}&limit=${totalCount}`)
    const jsonResp = await res.json()
    var items: FeedItem[] = []
    const excludeFeedIdList = excludeFeedId.split(',')
    for (const resultItem of jsonResp.results) {
        if (excludeFeedIdList.includes(String(resultItem.collectionId))) {
            continue
        }

        const explicitness = String(resultItem.trackExplicitness || resultItem.collectionExplicitness || resultItem.contentAdvisoryRating || '')
        const categories = Array.isArray(resultItem.genres)
            ? resultItem.genres
                .map((genre: any) => (typeof genre === 'string' ? genre : genre?.name))
                .filter((name: any): name is string => typeof name === 'string' && name.length > 0)
            : []
        if (isBlockedContent({
            title: resultItem.trackName,
            channelTitle: resultItem.collectionName,
            description: resultItem.description,
            categories,
            explicit: explicitness
        })) {
            continue
        }

        const formatedPubDate = new Date(resultItem.releaseDate).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

        const duration = convertMillsTimeToDuration(resultItem.trackTimeMillis)
        items.push({
            Id: resultItem.episodeGuid,
            ChannelId: resultItem.collectionId,
            Title: resultItem.trackName,
            HighlightTitle: resultItem.trackName,
            Link: resultItem.trackViewUrl,
            PubDate: formatedPubDate,
            Author: resultItem.artistIds.join(', '),
            InputDate: new Date(formatedPubDate),
            ImageUrl: resultItem.artworkUrl160,
            EnclosureUrl: resultItem.episodeUrl,
            EnclosureType: resultItem.episodeFileExtension,
            EnclosureLength: resultItem.trackTimeMillis,
            Duration: duration,
            Episode: "",
            Explicit: explicitness,
            Season: "",
            EpisodeType: "",
            Description: resultItem.description,
            TextDescription: resultItem.description,
            ChannelImageUrl: resultItem.artworkUrl600,
            ChannelTitle: resultItem.collectionName,
            HighlightChannelTitle: resultItem.collectionName,
            FeedLink: resultItem.feedUrl,
            Count: 0,
            TookTime: 0,
            HasThumbnail: false,
            FeedId: resultItem.collectionId,
            GUID: resultItem.episodeGuid,
            Source: "itunes",
            ExcludeFeedId: "",
            Country: country
        })
    }

    items.map(item => {
        item.Count = items.length
    })

    items.sort((a, b) => {
        return new Date(b.PubDate).getTime() - new Date(a.PubDate).getTime()
    })

    if (limit == 0) {
        return items
    }

    return items.slice(offset, offset + limit)
}

export const getPodcastInfo = async (podcastId: string): Promise<FeedChannel> => {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${podcastId}&entity=podcast`)
    const jsonResp = await res.json()
    const podcastInfo = jsonResp.results[0]
    let channelInfo: FeedChannel = {
        Id: podcastInfo.collectionId,
        Title: podcastInfo.collectionName,
        ChannelDesc: "",
        TextChannelDesc: "",
        ImageUrl: podcastInfo.artworkUrl100,
        Link: podcastInfo.collectionViewUrl,
        FeedLink: podcastInfo.feedUrl,
        FeedType: "",
        Categories: podcastInfo.genres,
        Author: podcastInfo.artistName,
        OwnerName: podcastInfo.artistName,
        OwnerEmail: "",
        Items: [],
        Count: 0,
        Copyright: "",
        Language: "",
        TookTime: 0,
        HasThumbnail: false
    }

    return channelInfo
}

const assertChannelAllowed = (rssFeed: RssFeed) => {
    if (isBlockedContent({
        title: rssFeed.title,
        description: rssFeed.description,
        categories: rssFeed.itunes.categories,
        explicit: rssFeed.itunes.explicit
    })) {
        throw new Error(CONTENT_POLICY_ERROR)
    }
}

const isAllowedRssItem = (item: RssItem): boolean => {
    return !isBlockedContent({
        title: item.title,
        description: item.description,
        explicit: item.itunes.explicit
    })
}

export const getPodcastAllInfo = async (podcastId: string): Promise<{ podcast: FeedChannel, episodes: FeedItem[] }> => {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${podcastId}&entity=podcast`)
    const jsonResp = await res.json()
    const podcastInfo = jsonResp.results[0]
    const feedLink = podcastInfo.feedUrl
    const rssFeed = await parsePodcastRSS(feedLink);
    assertChannelAllowed(rssFeed)

    var episodeList: FeedItem[] = []
    rssFeed.items.filter(isAllowedRssItem).forEach(item => {
        episodeList.push(buildFeedItemModel(rssFeed, feedLink, encodeURIComponent(item.guid), podcastId));
    })
    var channelInfo: FeedChannel = buildFeedChannelModel(rssFeed, feedLink, podcastId);
    channelInfo.Items = episodeList
    channelInfo.Count = episodeList.length

    return {
        podcast: channelInfo,
        episodes: episodeList
    }
}

export const getPodcastEpisodeInfo = async (podcastId: string, episodeId: string): Promise<{ podcast: FeedChannel, episode: FeedItem }> => {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${podcastId}&entity=podcast`)
    const jsonResp = await res.json()
    const podcastInfo = jsonResp.results[0]
    const feedLink = podcastInfo.feedUrl
    const rss = await parsePodcastRSS(feedLink);
    assertChannelAllowed(rss)
    const episodeInfo = buildFeedItemModel(rss, feedLink, episodeId, podcastId);
    if (isBlockedContent({
        title: episodeInfo.Title,
        description: episodeInfo.Description,
        channelTitle: episodeInfo.ChannelTitle,
        explicit: episodeInfo.Explicit
    })) {
        throw new Error(CONTENT_POLICY_ERROR)
    }
    var channelInfo: FeedChannel = buildFeedChannelModel(rss, feedLink, podcastId);

    return {
        podcast: channelInfo,
        episode: episodeInfo
    }
}

const buildFeedItemModel = (rssFeed: RssFeed, feedLink: string, episodeId: string, podcastId: string): FeedItem => {
    const rssItemList = rssFeed.items
    const targetItem = rssItemList.find(item => {
        if (encodeURIComponent(item.guid) === episodeId || item.guid === episodeId) {
            return true
        }
    })
    const formatedPubDate = new Date(targetItem?.pubDate || '').toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    var formaedDuration = '';
    const durationStr = String(targetItem?.itunes.duration || '')
    if (durationStr.includes(':')) {
        formaedDuration = durationStr
    } else {
        const durationInt = parseInt(durationStr || '0')
        formaedDuration = convertMillsTimeToDuration(durationInt)
    }
    var episodeInfo: FeedItem = {
        Id: episodeId,
        ChannelId: podcastId,
        Title: targetItem?.title || '',
        HighlightTitle: targetItem?.title || '',
        Link: targetItem?.link || '',
        PubDate: formatedPubDate,
        Author: targetItem?.itunes.author || rssFeed.itunes.author || '',
        InputDate: new Date(targetItem?.pubDate || ''),
        ImageUrl: targetItem?.itunes.image || rssFeed.itunes.image || rssFeed.imageUrl || '',
        EnclosureUrl: targetItem?.enclosure?.url || '',
        EnclosureType: targetItem?.enclosure?.type || '',
        EnclosureLength: String(targetItem?.enclosure?.length || ''),
        Duration: formaedDuration,
        Episode: String(targetItem?.itunes.episode || ''),
        Explicit: String(targetItem?.itunes.explicit || false),
        Season: String(targetItem?.itunes.season || ''),
        EpisodeType: String(targetItem?.itunes.episodeType || ''),
        Description: targetItem?.description || "",
        TextDescription: targetItem?.contentSnippet || targetItem?.description || "",
        ChannelImageUrl: rssFeed.itunes.image || rssFeed.imageUrl || '',
        ChannelTitle: rssFeed.title,
        HighlightChannelTitle: rssFeed.title,
        FeedLink: feedLink,
        Count: 0,
        TookTime: 0,
        HasThumbnail: false,
        FeedId: podcastId,
        GUID: episodeId,
        Source: "itunes",
        ExcludeFeedId: "",
        Country: ""
    }

    return episodeInfo
}

const buildFeedChannelModel = (rssFeed: RssFeed, feedLink: string, podcastId: string): FeedChannel => {
    var channelInfo: FeedChannel = {
        Id: podcastId,
        Title: rssFeed.title,
        ChannelDesc: rssFeed.description || '',
        TextChannelDesc: rssFeed.description || '',
        ImageUrl: rssFeed.itunes.image || rssFeed.imageUrl || '',
        Link: rssFeed.link || '',
        FeedLink: feedLink,
        FeedType: rssFeed.itunes.type || '',
        Categories: rssFeed.itunes.categories || [],
        Author: rssFeed.itunes.author || '',
        OwnerName: rssFeed.itunes.owner.name || '',
        OwnerEmail: rssFeed.itunes.owner.email || '',
        Items: [],
        Count: rssFeed.items.length,
        Copyright: rssFeed.copyright || '',
        Language: rssFeed.language || '',
        TookTime: 0,
        HasThumbnail: false
    };

    return channelInfo
}

const CORS_PROXY = `${API_URL}/rss/proxy?url=`;

const parsePodcastRSS = async (feedUrl: string): Promise<RssFeed> => {
    let response: Response;

    try {
        response = await fetch(feedUrl);
    } catch {
        console.warn('Direct RSS fetch failed, trying proxy:', feedUrl);
        response = await fetch(CORS_PROXY + encodeURIComponent(feedUrl));
    }

    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const channel = xmlDoc.querySelector('channel');
    if (!channel) {
        throw new Error('Invalid RSS feed');
    }

    const title = channel.querySelector('title')?.textContent || '';
    const description = channel.querySelector('description')?.textContent || '';
    const link = channel.querySelector('link')?.textContent || '';
    const copyright = channel.querySelector('copyright')?.textContent || '';
    const language = channel.querySelector('language')?.textContent || '';

    const itunesAuthor = channel.getElementsByTagName('itunes:author')[0]?.textContent || '';
    const itunesType = channel.getElementsByTagName('itunes:type')[0]?.textContent || '';
    const itunesExplicit = channel.getElementsByTagName('itunes:explicit')[0]?.textContent || '';
    const itunesOwnerName = channel.getElementsByTagName('itunes:name')[0]?.textContent || '';
    const itunesOwnerEmail = channel.getElementsByTagName('itunes:email')[0]?.textContent || '';

    const itunesImageEl = channel.getElementsByTagName('itunes:image')[0];
    const itunesImage = itunesImageEl?.getAttribute('href') || '';

    const categories: string[] = [];
    const categoryEls = channel.getElementsByTagName('itunes:category');
    for (let i = 0; i < categoryEls.length; i++) {
        const catText = categoryEls[i].getAttribute('text');
        if (catText) {
            categories.push(catText);
        }
    }

    const imageEl = channel.querySelector('image');
    const imageUrl = imageEl?.querySelector('url')?.textContent || '';

    const items: RssItem[] = [];
    const itemEls = channel.querySelectorAll('item');

    for (const itemEl of itemEls) {
        const guid = itemEl.querySelector('guid')?.textContent || itemEl.querySelector('link')?.textContent || '';
        const itemTitle = itemEl.querySelector('title')?.textContent || '';
        const itemLink = itemEl.querySelector('link')?.textContent || '';
        const itemDescription = itemEl.querySelector('description')?.textContent || '';
        const contentSnippet = itemEl.querySelector('content\\:snippet')?.textContent || '';
        const pubDate = itemEl.querySelector('pubDate')?.textContent || '';

        const itAuthor = itemEl.getElementsByTagName('itunes:author')[0]?.textContent || '';
        const itDuration = itemEl.getElementsByTagName('itunes:duration')[0]?.textContent || '';
        const itEpisode = itemEl.getElementsByTagName('itunes:episode')[0]?.textContent || '';
        const itSeason = itemEl.getElementsByTagName('itunes:season')[0]?.textContent || '';
        const itExplicit = itemEl.getElementsByTagName('itunes:explicit')[0]?.textContent || '';
        const itEpisodeType = itemEl.getElementsByTagName('itunes:episodeType')[0]?.textContent || '';
        const itImageEl = itemEl.getElementsByTagName('itunes:image')[0];
        const itImage = itImageEl?.getAttribute('href') || '';

        const enclosureEl = itemEl.querySelector('enclosure');
        const enclosureUrl = enclosureEl?.getAttribute('url') || '';
        const enclosureType = enclosureEl?.getAttribute('type') || '';
        const enclosureLength = enclosureEl?.getAttribute('length') || '';

        items.push({
            guid,
            title: itemTitle,
            link: itemLink,
            description: itemDescription,
            contentSnippet,
            pubDate,
            itunes: {
                author: itAuthor,
                duration: itDuration,
                image: itImage,
                episode: itEpisode,
                season: itSeason,
                explicit: itExplicit,
                episodeType: itEpisodeType
            },
            enclosure: {
                url: enclosureUrl,
                type: enclosureType,
                length: enclosureLength
            }
        });
    }

    return {
        title,
        description,
        link,
        itunes: {
            author: itunesAuthor,
            image: itunesImage,
            owner: {
                name: itunesOwnerName,
                email: itunesOwnerEmail
            },
            categories,
            type: itunesType,
            explicit: itunesExplicit
        },
        imageUrl,
        copyright,
        language,
        items
    };
}
