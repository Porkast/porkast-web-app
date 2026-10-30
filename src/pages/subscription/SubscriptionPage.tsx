import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppProvider } from '../../component/AppContext'
import Footer from '../../component/Footer'
import Header from '../../component/Header'
import { AvatarImage } from '../../component/PorkastImage'
import { smoothScrollToTop } from '../../libs/Common'
import { getUserSubscriptionList, getUserAllSubscriptionItems, SUBSCRIPTION_FEED_PAGE_SIZE, SUBSCRIPTION_LIST_PAGE_SIZE } from '../../libs/Subscription'
import { getTempNickname, getUserInfoFromServer } from '../../libs/User'
import type { SubscriptionDataDto } from '../../types/subscription'
import type { FeedItem } from '../../types/feed_item'
import SubscriptionFeedList from './SubscriptionFeedList'
import SubscriptionKeywordCard from '../../component/SubscriptionKeywordCard'
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
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)

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
                getUserSubscriptionList(userId, SUBSCRIPTION_LIST_PAGE_SIZE, (page - 1) * SUBSCRIPTION_LIST_PAGE_SIZE),
                getUserAllSubscriptionItems(userId, 0, SUBSCRIPTION_FEED_PAGE_SIZE),
            ])
            if (userResp.code === 0 && userResp.data) {
                setNickname(getTempNickname(userResp.data))
            }
            if (subResp.code === 0) {
                setSubscriptionList(subResp.data)
                if (subResp.data.length > 0) {
                    setTotalCount(subResp.data[0].Count)
                } else if (page > 1) {
                    // Requested page is past the end (e.g. after unsubscribing) -> go back to page 1
                    navigate(`/subscription/${userId}/?page=1`, { replace: true })
                } else {
                    setTotalCount(0)
                }
            }
            if (feedResp.code === 0) {
                setInitialFeedItems(feedResp.data)
                setFeedTotalCount(feedResp.data[0]?.Count ?? feedResp.data.length)
            }
            setLoading(false)
        }
        fetchData()
    }, [userId, page, navigate])

    if (loading) return <Loading />

    const totalPageCalc = Math.max(1, Math.ceil(totalCount / SUBSCRIPTION_LIST_PAGE_SIZE))
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
                                    return (
                                        <SubscriptionKeywordCard
                                            key={item.Id || item.Keyword || index}
                                            item={item}
                                            userId={userId!}
                                        />
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
