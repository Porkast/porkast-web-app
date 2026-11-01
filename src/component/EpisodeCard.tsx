import parse from 'html-react-parser';
import AudioPlayButton from './AudioPlayButton';
import AddListenLaterButton from './AddListenLaterButton';
import AddToPlaylistButton from './AddToPlaylistButton';
import { AvatarImage } from './PorkastImage';
import { parseHtmlStrinText } from '../libs/Common';

type ExcludeFunction = (channelTitle: string, feedId: string) => void;

type EpisodeCardProps = {
    data: {
        itemId: string;
        channelId: string;
        title: string;
        description: string;
        image: string;
        link: string;
        rssLink: string;
        channelName: string;
        authorName: string;
        pubDate: string;
        audioLength: string;
        audioSrc: string;
        showExcludeBtn?: boolean;
        hideListenLaterBtn?: boolean;
        hideAddToPlaylistBtn?: boolean;
    };
    onExcludeModalBtnClick?: ExcludeFunction;
    onPlay?: () => void;
};

export default function EpisodeCard(props: EpisodeCardProps) {
    const { data, onPlay } = props;
    const urlEncodeItemId = encodeURIComponent(data.itemId);
    const podcastEpisodeLink = '/podcast/' + data.channelId + '/episode/' + urlEncodeItemId;
    const podcastChannelLink = '/podcast/' + data.channelId;

    const displayTitle = (data.title || '').replace(/highlightPlaceholder/g, 'className="text-primary"');
    const displayAuthorName = (data.authorName || '').replace(/highlightPlaceholder/g, 'className="text-primary"');
    const displayChannelName = (data.channelName || '').replace(/highlightPlaceholder/g, 'className="text-primary"');
    const displayDescription = parseHtmlStrinText(data.description || '');

    const artist = !data.authorName || data.authorName === 'null' ? displayChannelName : displayAuthorName;

    const audioPlayerParams: AudioPlayerParams = {
        id: data.itemId || data.audioSrc,
        itemId: data.itemId,
        channelId: data.channelId,
        title: displayTitle,
        artist: artist,
        channelTitle: displayChannelName,
        cover: data.image,
        src: data.audioSrc,
        duration: data.audioLength,
    };

    const onExcludeModalBtnClick = () => {
        if (props.onExcludeModalBtnClick) {
            props.onExcludeModalBtnClick(displayChannelName, data.channelId);
        }
    };

    return (
        <div className="bg-base-100 shadow-xl rounded-box mb-12 pt-9 overflow-hidden">
            <div className="ml-6 mr-6">
                <a href={podcastEpisodeLink} className="md:text-2xl text-xl font-medium mt-9 block break-words">
                    {parse(displayTitle)}
                </a>
                <div className="w-full flex justify-start mt-4 min-w-0">
                    <a href={podcastChannelLink} className="shrink-0">
                        <AvatarImage className="w-24 h-24" imageUrl={data.image} />
                    </a>
                    <div className="ml-3 min-w-0 flex-1">
                        <div className="md:flex md:justify-start items-center gap-2 flex-wrap">
                            <a href={podcastChannelLink} className="text-base font-medium mr-2 break-words">
                                {parse(displayChannelName)}
                            </a>
                            {props.data.showExcludeBtn ? (
                                <button
                                    className="btn btn-xs btn-neutral items-center rounded-lg mt-0 shrink-0"
                                    onClick={onExcludeModalBtnClick}
                                >
                                    Exclude
                                </button>
                            ) : null}
                        </div>
                        {displayAuthorName === '' || displayAuthorName === 'null' ? null : (
                            <div className="text-sm font-medium text-gray-500 mt-2 break-words">
                                By {parse(displayAuthorName)}
                            </div>
                        )}
                        <div className="flex justify-start mt-4">
                            <div className="tooltip" data-tip="RSS Feed">
                                <a href={data.rssLink} target="_blank" rel="noopener noreferrer">
                                    <svg
                                        className="w-4 h-4 fill-base-content"
                                        viewBox="0 0 1024 1024"
                                        version="1.1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        p-id="4715"
                                        width="32"
                                        height="32"
                                    >
                                        <path
                                            d="M128 768a128 128 0 1 0 0 256 128 128 0 0 0 0-256zM0 368v176c265.104 0 480 214.912 480 480h176c0-362.32-293.696-656-656-656zM0 0v176c468.336 0 848 379.664 848 848h176C1024 458.464 565.536 0 0 0z"
                                            p-id="4716"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                            <div className="tooltip ml-4" data-tip="Source Link">
                                <a href={data.link} target="_blank" rel="noopener noreferrer">
                                    <svg
                                        className="w-5 h-5 fill-base-content"
                                        viewBox="0 0 1024 1024"
                                        version="1.1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        p-id="3342"
                                        width="32"
                                        height="32"
                                    >
                                        <path
                                            d="M574 665.4c-3.1-3.1-8.2-3.1-11.3 0L446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3l-39.8-39.8c-3.1-3.1-8.2-3.1-11.3 0L191.4 526.5c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3L574 665.4zM832.6 191.4c-84.6-84.6-221.5-84.6-306 0L410.3 307.6c-3.1 3.1-3.1 8.2 0 11.3l39.7 39.7c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204L665.3 562.6c-3.1 3.1-3.1 8.2 0 11.3l39.8 39.8c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c84.5-84.6 84.5-221.5 0-306.1z"
                                            p-id="3343"
                                        ></path>
                                        <path
                                            d="M610.1 372.3c-3.1-3.1-8.2-3.1-11.3 0L372.3 598.7c-3.1 3.1-3.1 8.2 0 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l226.4-226.4c3.1-3.1 3.1-8.2 0-11.3l-39.5-39.6z"
                                            p-id="3344"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <a href={podcastEpisodeLink} className="block">
                    <div className="max-h-24 text-sm flex overflow-clip mt-6 break-words">
                        <p className="break-words min-w-0">{parse(displayDescription)}</p>
                    </div>
                </a>
                <div className="text-gray-500 mt-4">{data.pubDate}</div>
                <div className="md:flex md:justify-start items-center mt-3 pb-6 flex-wrap gap-y-3">
                    <div className="flex justify-start items-center">
                        <AudioPlayButton data={audioPlayerParams} onPlay={onPlay} />
                        <div className="text-base text-gray-500 w-20 ml-4 whitespace-nowrap">{data.audioLength}</div>
                    </div>
                    <div className="flex justify-start mt-4 md:mt-0 items-center flex-wrap gap-y-2">
                        {data.hideListenLaterBtn ? null : (
                            <AddListenLaterButton itemId={data.itemId} channelId={data.channelId} />
                        )}
                        {data.hideAddToPlaylistBtn ? null : (
                            <AddToPlaylistButton
                                itemId={data.itemId}
                                itemTitle={displayTitle}
                                channelId={data.channelId}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
