import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppProvider } from '../../component/AppContext'
import EpisodeCard from '../../component/EpisodeCard'
import Footer from '../../component/Footer'
import Header from '../../component/Header'
import { AvatarImage } from '../../component/PorkastImage'
import { ShareSearchSubscriptionBtn } from '../../component/Share'
import SubscribeListenLaterBtn from '../../component/SubscribeListenLaterButton'
import UnsubscribeKeywordButton from '../../component/UnsubscribeKeywordButton'
import { getTempNickname, getUserInfoFromServer, getUserSessionInfo } from '../../libs/User'
import { getUserKeywordSubscriptionItemList } from '../../libs/Subscription'
import type { FeedItem } from '../../types/feed_item'
import Loading from '../../component/Loading'

export default function SubscriptionKeywordPage() {
    const { userId, keyword } = useParams()
    const [searchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') || '1')

    const [loading, setLoading] = useState(true)
    const [isMyPage, setIsMyPage] = useState(false)
    const [nickname, setNickname] = useState('')
    const [itemList, setItemList] = useState<FeedItem[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [totalPage, setTotalPage] = useState(1)

    const decodedKeyword = decodeURIComponent(keyword || '')

    useEffect(() => {
        if (!userId || !keyword) return
        const fetchData = async () => {
            const [subResp, sessionUser, userResp] = await Promise.all([
                getUserKeywordSubscriptionItemList(userId, decodedKeyword, String(page)),
                getUserSessionInfo(),
                getUserInfoFromServer(userId),
            ])
            if (userId === sessionUser.userId) {
                setIsMyPage(true)
            }
            if (userResp.code === 0 && userResp.data) {
                setNickname(getTempNickname(userResp.data))
            }
            if (subResp.code === 0) {
                setItemList(subResp.data)
                if (subResp.data.length > 0) {
                    setTotalCount(subResp.data[0].Count)
                }
            }
            setLoading(false)
        }
        fetchData()
    }, [userId, keyword, page])

    if (loading) return <Loading />

    const totalPageCalc = Math.max(1, Math.ceil(totalCount / 10))
    const prevPage = page > 1 ? page - 1 : 1
    const nextPage = page < totalPageCalc ? page + 1 : page

    return (
        <AppProvider>
            <div>
                <Header title="Subscription">
                    <div className="w-full flex justify-center mb-9 min-h-screen">
                        <div className='w-full max-w-2xl pl-6 pr-6'>
                            <div className="w-full mb-10">
                                <div className="flex justify-start mt-4">
                                    <AvatarImage className="w-28" displayName={nickname} />
                                    <div className="ml-3">
                                        <div className="md:text-2xl text-xl font-bold">#{decodedKeyword}</div>
                                        <div className="text-sm font-medium text-gray-500 mt-2">Search keyword #{decodedKeyword} subscription</div>
                                        {
                                            isMyPage ? (
                                                <div className="mt-4 -ml-2 flex justify-start">
                                                    <ShareSearchSubscriptionBtn userId={userId!} keyword={keyword!} />
                                                    <UnsubscribeKeywordButton userId={userId!} keyword={keyword!} />
                                                </div>
                                            ) : (
                                                <div className="mt-4 -ml-2 flex justify-start">
                                                    <SubscribeListenLaterBtn creatorId={userId!} />
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-500">{nickname}@Porkast</div>
                            </div>
                            <div className='text-neutral-500 text-sm mb-6 ml-2'>{totalCount} results</div>
                            {
                                itemList.map((item, index) => {
                                    return (
                                        <EpisodeCard key={index} data={{
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
                            <div className="w-full flex justify-center pt-6 pb-9">
                                <div className="join">
                                    {
                                        page > 1 ? (
                                            <Link className="join-item btn btn-neutral" to={`/subscription/${userId}/${keyword}?page=${prevPage}`}>«</Link>
                                        ) : (
                                            <button className="join-item btn btn-neutral btn-disabled">«</button>
                                        )
                                    }
                                    <button className="join-item btn btn-neutral">Page {page}</button>
                                    {
                                        page < totalPageCalc ? (
                                            <Link className="join-item btn btn-neutral" to={`/subscription/${userId}/${keyword}?page=${nextPage}`}>»</Link>
                                        ) : (
                                            <button className="join-item btn btn-neutral btn-disabled">»</button>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </Header>
                <Footer />
            </div>
        </AppProvider>
    )
}
