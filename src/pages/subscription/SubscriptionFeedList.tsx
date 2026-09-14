import { useRef, useState } from "react"
import EpisodeCard from "../../component/EpisodeCard"
import type { FeedItem } from "../../types/feed_item"
import { getUserAllSubscriptionItems, SUBSCRIPTION_FEED_PAGE_SIZE } from "../../libs/Subscription"

type Props = {
    userId: string
    initialItems: FeedItem[]
    initialTotalCount: number
}

export default function SubscriptionFeedList({ userId, initialItems, initialTotalCount }: Props) {

    const [items, setItems] = useState<FeedItem[]>(initialItems)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialTotalCount > SUBSCRIPTION_FEED_PAGE_SIZE)

    const offsetRef = useRef(SUBSCRIPTION_FEED_PAGE_SIZE)

    const loadMore = async () => {
        if (loading) return
        setLoading(true)
        const resp = await getUserAllSubscriptionItems(userId, offsetRef.current, SUBSCRIPTION_FEED_PAGE_SIZE)
        if (resp.code === 0) {
            if (resp.data.length > 0) {
                setItems(prev => [...prev, ...resp.data])
            }
            offsetRef.current += SUBSCRIPTION_FEED_PAGE_SIZE
            setHasMore(offsetRef.current < initialTotalCount)
        }
        setLoading(false)
    }

    if (initialTotalCount === 0) {
        return null
    }

    return (
        <div className="mt-12">
            <div className="text-neutral-500 text-sm mb-6 ml-2">{initialTotalCount} episodes</div>
            {
                items.map((item, index) => {
                    return (
                        <EpisodeCard key={item.GUID + '-' + index} data={{
                            itemId: item.GUID,
                            channelId: item.FeedId,
                            title: item.Title,
                            description: item.Description,
                            image: item.ImageUrl,
                            link: item.Link,
                            rssLink: item.FeedLink,
                            channelName: item.ChannelTitle,
                            authorName: item.Author,
                            pubDate: item.PubDate,
                            audioLength: item.Duration,
                            audioSrc: item.EnclosureUrl
                        }} />
                    )
                })
            }
            {
                hasMore && (
                    <div className="flex justify-center pt-6">
                        <button className="btn btn-neutral" onClick={loadMore} disabled={loading}>
                            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Load more'}
                        </button>
                    </div>
                )
            }
            {
                !hasMore && items.length > 0 && (
                    <div className="text-center text-neutral-500 text-sm py-6">No more episodes</div>
                )
            }
        </div>
    )
}
