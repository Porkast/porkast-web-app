import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppProvider, useAppContext } from '../component/AppContext'
import EpisodeCard from '../component/EpisodeCard'
import Footer from '../component/Footer'
import Header from '../component/Header'
import { AvatarImage } from '../component/PorkastImage'
import { SharedListenLaterBtn } from '../component/Share'
import { convertMillsTimeToDuration, smoothScrollToTop } from '../libs/Common'
import { getTempNickname, getUserInfoFromServer, getUserSessionInfo } from '../libs/User'
import { getListenLaterListByUserId } from '../libs/ListenLater'
import type { UserListenLaterDto } from '../types/listen_later'
import Loading from '../component/Loading'
import { listenLaterItemToQueueItem } from '../types/audio_player'

export default function ListenLaterPage() {
    const { userId } = useParams()
    const [searchParams] = useSearchParams()
    const { playEpisode, syncSourceQueue } = useAppContext()
    const page = parseInt(searchParams.get('page') || '1')

    const [loading, setLoading] = useState(true)
    const [isMyPage, setIsMyPage] = useState(false)
    const [nickname, setNickname] = useState('')
    const [itemList, setItemList] = useState<UserListenLaterDto[]>([])
    const [totalCount, setTotalCount] = useState(0)

    const nextQueuePageRef = useRef(page + 1)

    useEffect(() => {
        nextQueuePageRef.current = page + 1
    }, [userId, page])

    useEffect(() => {
        if (!userId) return
        const fetchData = async () => {
            const [llResp, sessionUser, userResp] = await Promise.all([
                getListenLaterListByUserId(userId, page),
                getUserSessionInfo(),
                getUserInfoFromServer(userId),
            ])
            if (userId === sessionUser.userId) {
                setIsMyPage(true)
            }
            if (userResp.code === 0 && userResp.data) {
                setNickname(getTempNickname(userResp.data))
            }
            if (llResp.code === 0) {
                setItemList(llResp.data)
                if (llResp.data.length > 0) {
                    setTotalCount(llResp.data[0].count)
                }
            }
            setLoading(false)
        }
        fetchData()
    }, [userId, page])

    const totalPageCalc = Math.max(1, Math.ceil(totalCount / 10))
    const prevPage = page > 1 ? page - 1 : 1
    const nextPage = page < totalPageCalc ? page + 1 : page

    const sourceTitle = 'Listen Later'
    const sourceKey = `listen-later:${userId}:${page}`
    const queueItems = useMemo(
        () => (itemList || []).map((item) => listenLaterItemToQueueItem(item)),
        [itemList]
    )

    const loadMoreForQueue = useCallback(async () => {
        const targetPage = nextQueuePageRef.current
        if (!userId || targetPage > totalPageCalc) return []
        nextQueuePageRef.current = targetPage + 1
        const resp = await getListenLaterListByUserId(userId, targetPage)
        if (resp.code === 0 && resp.data) {
            return resp.data.map((item) => listenLaterItemToQueueItem(item))
        }
        return []
    }, [userId, totalPageCalc])

    useEffect(() => {
        if (queueItems.length > 0) {
            syncSourceQueue(sourceKey, queueItems, nextQueuePageRef.current <= totalPageCalc, loadMoreForQueue)
        }
    }, [sourceKey, queueItems, totalPageCalc, loadMoreForQueue, syncSourceQueue])

    if (loading) return <Loading />

    return (
        <AppProvider>
            <div>
                <Header title="Listen Later">
                    <div className="w-full flex justify-center mb-9 min-h-screen">
                        <div className='w-full max-w-2xl pl-6 pr-6'>
                            <div className="w-full flex justify-center mb-10">
                                <div className="mt-4">
                                    <div className="flex justify-center">
                                        <AvatarImage className="w-28" displayName={nickname} />
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <div className="md:text-2xl text-xl font-bold text-center break-words">{nickname}{`'s Porkast Listen Later`}</div>
                                    </div>
                                    <div className="mt-4 -ml-2 flex justify-center">
                                        <SharedListenLaterBtn creatorId={userId || ''} />
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="mt-4 text-sm text-gray-500 break-words">{nickname}@Porkast</div>
                                    </div>
                                </div>
                            </div>
                            <div className='text-neutral-500 text-sm mb-6 ml-2'>{totalCount} episode</div>
                            {
                                itemList && itemList.length > 0 ? (
                                    itemList.map((item, index) => {
                                        let duration: string
                                        if (!isNaN(Number(item.duration))) {
                                            duration = convertMillsTimeToDuration(parseInt(item.duration))
                                        } else {
                                            duration = item.duration
                                        }
                                        return (
                                            <EpisodeCard key={index} data={{
                                                itemId: item.guid,
                                                channelId: item.feed_id,
                                                title: item.title,
                                                description: item.description,
                                                image: item.image_url,
                                                link: item.link,
                                                rssLink: item.feed_link,
                                                channelName: item.channel_title,
                                                authorName: item.author,
                                                pubDate: item.pub_date,
                                                audioLength: duration,
                                                audioSrc: item.enclosure_url,
                                                hideListenLaterBtn: isMyPage,
                                                hideAddToPlaylistBtn: false
                                            }}
                                                onPlay={() => {
                                                    nextQueuePageRef.current = page + 1
                                                    playEpisode(listenLaterItemToQueueItem(item), {
                                                        items: queueItems,
                                                        sourceTitle,
                                                        sourceKey,
                                                        hasMore: page < totalPageCalc,
                                                        loadMore: loadMoreForQueue,
                                                    })
                                                }}
                                            />
                                        )
                                    })
                                ) : null
                            }
                            <div className="w-full flex justify-center pt-6 pb-9">
                                <div className="join">
                                    {
                                        page > 1 ? (
                                            <Link className="join-item btn btn-neutral" to={`/listenlater/${userId}/?page=${prevPage}`} onClick={() => smoothScrollToTop()}>«</Link>
                                        ) : (
                                            <button className="join-item btn btn-neutral btn-disabled">«</button>
                                        )
                                    }
                                    <button className="join-item btn btn-neutral">Page {page}</button>
                                    {
                                        page < totalPageCalc ? (
                                            <Link className="join-item btn btn-neutral" to={`/listenlater/${userId}/?page=${nextPage}`} onClick={() => smoothScrollToTop()}>»</Link>
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
