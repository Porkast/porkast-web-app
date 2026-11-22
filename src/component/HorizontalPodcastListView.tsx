import { useEffect, useState } from "react";
import parse from 'html-react-parser'
import { AvatarImage } from "./PorkastImage";

type ScrollPodcastListViewProps = {
    podcastChannelInfoList: PodcastChannelInfo[];
}

type PodcastChannelInfo = {
    Id: string;
    Title: string;
    ImageUrl: string;
}

export default function HorizontalPodcastListView(props: ScrollPodcastListViewProps) {

    const { podcastChannelInfoList } = props
    const [channelInfoList, setChannelInfoList] = useState<PodcastChannelInfo[]>([])

    useEffect(() => {
        if (!podcastChannelInfoList || podcastChannelInfoList.length == 0) {
            return
        }
        const updatedList = podcastChannelInfoList.map((podcastChannelInfo) => {
            return {
                ...podcastChannelInfo,
                Title: podcastChannelInfo.Title.replace('highlightPlaceholder', 'className="text-primary"')
            };
        });
        setChannelInfoList(updatedList);
    }, [podcastChannelInfoList])

    return (
        <div className="carousel rounded-box w-full max-w-2xl">
            {
                channelInfoList.map((podcastChannelInfo) => (
                    <a href={`/podcast/${podcastChannelInfo.Id}`} key={podcastChannelInfo.Id} className="carousel-item mr-4 w-24">
                        <div className="mb-2">
                            <AvatarImage
                                className="w-24 h-24"
                                imageUrl={podcastChannelInfo.ImageUrl}
                                alt={podcastChannelInfo.Title}
                            />
                            <div className="w-20 ml-2 mr-2 text-sm truncate">{parse(podcastChannelInfo.Title)}</div>
                        </div>
                    </a>
                ))
            }
        </div>
    )
}
