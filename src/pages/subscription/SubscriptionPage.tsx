import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppProvider } from '../../component/AppContext'
import Footer from '../../component/Footer'
import Header from '../../component/Header'
import { AvatarImage } from '../../component/PorkastImage'
import UnsubscribeKeywordButton from '../../component/UnsubscribeKeywordButton'
import { formatDateTime, smoothScrollToTop } from '../../libs/Common'
import { getUserSubscriptionList, getUserAllSubscriptionItems, SUBSCRIPTION_FEED_PAGE_SIZE } from '../../libs/Subscription'
import { getTempNickname, getUserInfoFromServer } from '../../libs/User'
import type { SubscriptionDataDto } from '../../types/subscription'
import type { FeedItem } from '../../types/feed_item'
import SubscriptionFeedList from './SubscriptionFeedList'
import Loading from '../../component/Loading'

function formatTier(tier: string): string {
    switch (tier) {
        case 'unlimited': return 'Unlimited'
        case 'pro': return 'Pro'
        default: return 'Free'
    }
}

export default function SubscriptionPage() {
    const { userId } = useParams()
    const [searchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') || '1')

    const [loading, setLoading] = useState(true)
    const [nickname, setNickname] = useState('')
    const [subscriptionList, setSubscriptionList] = useState<SubscriptionDataDto[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [totalPage, setTotalPage] = useState(1)
    const [initialFeedItems, setInitialFeedItems] = useState<FeedItem[]>([])
    const [feedTotalCount, setFeedTotalCount] = useState(0)

    useEffect(() => {
        if (!userId) return
        const fetchData = async () => {
            const [userResp, subResp, feedResp] = await Promise.all([
                getUserInfoFromServer(userId),
                getUserSubscriptionList(userId),
                getUserAllSubscriptionItems(userId, 0, SUBSCRIPTION_FEED_PAGE_SIZE),
            ])
            if (userResp.code === 0 && userResp.data) {
                setNickname(getTempNickname(userResp.data))
            }
            if (subResp.code === 0) {
                setSubscriptionList(subResp.data)
                if (subResp.data.length > 0) {
                    setTotalCount(subResp.data[0].Count)
                }
            }
            if (feedResp.code === 0) {
                setInitialFeedItems(feedResp.data)
                setFeedTotalCount(feedResp.data[0]?.Count ?? feedResp.data.length)
            }
            setLoading(false)
        }
        fetchData()
    }, [userId])

    if (loading) return <Loading />

    const totalPageCalc = Math.max(1, Math.ceil(totalCount / 10))
    const prevPage = page > 1 ? page - 1 : 1
    const nextPage = page < totalPageCalc ? page + 1 : page

    return (
        <AppProvider>
            <div>
                <Header title="Subscription">
                    <div className='w-full flex justify-center mb-9 min-h-screen'>
                        <div className='w-full max-w-2xl pl-6 pr-6 mb-9'>
                            <div className="w-full mb-10">
                                <div className="flex justify-center mt-4">
                                    <div className="w-full">
                                        <div className="flex justify-center">
                                            <AvatarImage className="w-28" displayName={nickname} />
                                        </div>
                                        <div className="flex justify-center mt-4">
                                            <div className="md:text-2xl text-xl font-bold">{nickname}{`'s Subscription`}</div>
                                        </div>
                                        <div className="flex justify-center mt-4">
                                            <div className="mt-4 text-sm text-gray-500">{nickname}@Porkast</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='text-neutral-500 text-sm mb-6 ml-2'>{totalCount} results</div>
                            {
                                subscriptionList?.map((item, index) => {
                                    const encodeKeyword = encodeURIComponent(item.Keyword)
                                    return (
                                        <div key={index} className="card w-full bg-base-100 shadow-xl mb-6">
                                            <div className="card-body">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        {
                                                            item.Keyword ? (
                                                                <h2 className="card-title">
                                                                    <a href={`/subscription/${userId}/${encodeKeyword}`} className="hover:text-primary">
                                                                        #{item.Keyword}
                                                                    </a>
                                                                </h2>
                                                            ) : (
                                                                <h2 className="card-title">{item.RefName}</h2>
                                                            )
                                                        }
                                                        <div className="md:flex block md:justify-start mt-2">
                                                            {
                                                                item.UpdateTime != null ? (
                                                                    <div className="mr-4 md:mb-0 mb-4">Update at: {formatDateTime(item.UpdateTime.toLocaleString())}</div>
                                                                ) : (
                                                                    <div>Create at: {formatDateTime(item.CreateTime?.toLocaleString())}</div>
                                                                )
                                                            }
                                                            {
                                                                item.TotalCount == 0 ? (
                                                                    <div></div>
                                                                ) : (
                                                                    <p>Episodes: {item.TotalCount}</p>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="card-actions justify-end">
                                                        {
                                                            item.Keyword && (
                                                                <UnsubscribeKeywordButton userId={userId!} keyword={item.Keyword} />
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            <div className="w-full flex justify-center pt-6 pb-9">
                                <div className="join">
                                    {
                                        page > 1 ? (
                                            <Link className="join-item btn btn-neutral" to={`/subscription/${userId}/?page=${prevPage}`} onClick={() => smoothScrollToTop()}>«</Link>
                                        ) : (
                                            <button className="join-item btn btn-neutral btn-disabled">«</button>
                                        )
                                    }
                                    <button className="join-item btn btn-neutral">Page {page}</button>
                                    {
                                        page < totalPageCalc ? (
                                            <Link className="join-item btn btn-neutral" to={`/subscription/${userId}/?page=${nextPage}`} onClick={() => smoothScrollToTop()}>»</Link>
                                        ) : (
                                            <button className="join-item btn btn-neutral btn-disabled">»</button>
                                        )
                                    }
                                </div>
                            </div>
                            <SubscriptionFeedList
                                userId={userId!}
                                initialItems={initialFeedItems}
                                initialTotalCount={feedTotalCount}
                            />
                        </div>
                    </div>
                </Header>
                <Footer />
            </div>
        </AppProvider>
    )
}
