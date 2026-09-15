import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppProvider } from '../../component/AppContext'
import EpisodeCard from '../../component/EpisodeCard'
import Footer from '../../component/Footer'
import Header from '../../component/Header'
import { AvatarImage } from '../../component/PorkastImage'
import { SharePlaylistBtn } from '../../component/Share'
import { getTempNickname, getUserInfoFromServer, getUserSessionInfo } from '../../libs/User'
import { getPlaylistInfoById, getPlaylistItemListByUserId } from '../../libs/Playlist'
import { smoothScrollToTop } from '../../libs/Common'
import type { FeedItem } from '../../types/feed_item'
import type { UserPlaylistDto } from '../../types/playlist'
import Loading from '../../component/Loading'

export default function PlaylistDetailPage() {
    const { userId, playlistId } = useParams()
    const [searchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') || '1')

    const [loading, setLoading] = useState(true)
    const [isMyPage, setIsMyPage] = useState(false)
    const [nickname, setNickname] = useState('')
    const [playlistInfo, setPlaylistInfo] = useState<UserPlaylistDto | null>(null)
    const [itemList, setItemList] = useState<FeedItem[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [totalPage, setTotalPage] = useState(1)

    useEffect(() => {
        if (!userId || !playlistId) return
        const fetchData = async () => {
            const [plResp, itemResp, sessionUser, userResp] = await Promise.all([
                getPlaylistInfoById(playlistId),
                getPlaylistItemListByUserId(userId, playlistId, page),
                getUserSessionInfo(),
                getUserInfoFromServer(userId),
            ])
            if (userId === sessionUser.userId) {
                setIsMyPage(true)
            }
            if (userResp.code === 0 && userResp.data) {
                setNickname(getTempNickname(userResp.data))
            }
            if (plResp.code === 0 && plResp.data) {
                setPlaylistInfo(plResp.data)
            }
            if (itemResp.code === 0) {
                setItemList(itemResp.data)
                if (itemResp.data.length > 0) {
                    setTotalCount(itemResp.data[0].Count)
                }
            }
            setLoading(false)
        }
        fetchData()
    }, [userId, playlistId, page])

    if (loading) return <Loading />

    const totalPageCalc = Math.max(1, Math.ceil(totalCount / 10))
    const prevPage = page > 1 ? page - 1 : 1
    const nextPage = page < totalPageCalc ? page + 1 : page

    return (
        <>
            <AppProvider>
                <div>
                    <Header title="Playlist">
                        <div className="w-full flex justify-center mb-9 min-h-screen">
                            <div className='w-full max-w-2xl pl-6 pr-6'>
                                <div className="w-full mb-10">
                                    <div className="flex justify-start mt-4">
                                        <AvatarImage className="w-28" displayName={nickname} />
                                        <div className="ml-3">
                                            <div className="md:text-2xl text-xl font-bold">{playlistInfo?.PlaylistName}</div>
                                            <div className="text-sm font-medium text-gray-500 mt-2">By {nickname}</div>
                                            <div className="mt-4 -ml-2 flex justify-start">
                                                <SharePlaylistBtn userId={userId!} playlistId={playlistId!} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-gray-500">{nickname}@Porkast</div>
                                </div>
                                <div className='text-neutral-500 text-sm mb-6 ml-2'>{totalCount} results</div>

                                {
                                    itemList && itemList.length > 0 ? (
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
                                                    authorName: "",
                                                    pubDate: item.PubDate,
                                                    audioLength: item.Duration,
                                                    audioSrc: item.EnclosureUrl,
                                                    hideAddToPlaylistBtn: isMyPage,
                                                    hideListenLaterBtn: isMyPage
                                                }} />
                                            )
                                        })
                                    ) : null
                                }
                                <div className="w-full flex justify-center pt-6 pb-9">
                                    <div className="join">
                                        {
                                            page > 1 ? (
                                                <Link className="join-item btn btn-neutral" to={`/playlist/${userId}/${playlistId}?page=${prevPage}`} onClick={() => smoothScrollToTop()}>«</Link>
                                            ) : (
                                                <button className="join-item btn btn-neutral btn-disabled">«</button>
                                            )
                                        }
                                        <button className="join-item btn btn-neutral">Page {page}</button>
                                        {
                                            page < totalPageCalc ? (
                                                <Link className="join-item btn btn-neutral" to={`/playlist/${userId}/${playlistId}?page=${nextPage}`} onClick={() => smoothScrollToTop()}>»</Link>
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
        </>
    )
}
