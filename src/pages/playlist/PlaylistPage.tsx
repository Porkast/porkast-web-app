import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import parse from 'html-react-parser'
import { AppProvider } from '../../component/AppContext'
import Header from '../../component/Header'
import { formatDateTime } from '../../libs/Common'
import { getUserPlaylistByUserId } from '../../libs/Playlist'
import { getTempNickname, getUserInfoFromServer } from '../../libs/User'
import type { UserPlaylistDto } from '../../types/playlist'
import { EditPlaylistInfoBtn } from '../../component/EditPlaylistInfo'
import Footer from '../../component/Footer'
import { AvatarImage } from '../../component/PorkastImage'
import Loading from '../../component/Loading'

export default function PlaylistPage() {
    const { userId } = useParams()
    const [searchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') || '1')

    const [loading, setLoading] = useState(true)
    const [nickname, setNickname] = useState('')
    const [playlists, setPlaylists] = useState<UserPlaylistDto[]>([])
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        if (!userId) return
        const fetchData = async () => {
            const [plResp, userResp] = await Promise.all([
                getUserPlaylistByUserId(userId, page),
                getUserInfoFromServer(userId),
            ])
            if (userResp.code === 0 && userResp.data) {
                setNickname(getTempNickname(userResp.data))
            }
            if (plResp.code === 0) {
                setPlaylists(plResp.data || [])
                if (plResp.data && plResp.data.length > 0) {
                    setTotalCount(plResp.data[0].Count)
                }
            }
            setLoading(false)
        }
        fetchData()
    }, [userId, page])

    if (loading) return <Loading />

    const totalPage = Math.max(1, Math.ceil(totalCount / 10))
    const prevPage = page > 1 ? page - 1 : 1
    const nextPage = page < totalPage ? page + 1 : page

    return (
        <>
            <AppProvider>
                <div>
                    <Header title='Playlist'>
                        <div className="w-full flex justify-center mb-9 min-h-screen">
                            <div className='w-full max-w-2xl pl-6 pr-6'>
                                <div className="flex justify-center mt-4">
                                    <div className="w-full">
                                        <div className="flex justify-center">
                                            <AvatarImage className="w-28" displayName={nickname} />
                                        </div>
                                        <div className="flex justify-center mt-4">
                                            <div className="md:text-2xl text-xl font-bold">{nickname}{`'s Porkast Playlist`}</div>
                                        </div>
                                        <div className="flex justify-center mt-4">
                                            <div className="mt-4 text-sm text-gray-500">{nickname}@Porkast</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='text-neutral-500 text-sm mb-6 ml-2'>{totalCount} playlist</div>
                                {
                                    playlists?.map((item, index) => {
                                        return (
                                            <div key={index} className="card w-full bg-base-100 shadow-xl">
                                                <div className="card-body">
                                                    <h2 className="card-title w-full flex justify-start">
                                                        <div className='w-4/5 flex justify-start'>
                                                            <a href={`/playlist/${userId}/${item.Id}`}>{item.PlaylistName}</a>
                                                        </div>
                                                        <div className='w-1/5 flex justify-end'>
                                                            <EditPlaylistInfoBtn CreatorId={userId!} PlaylistId={item.Id} />
                                                        </div>
                                                    </h2>
                                                    <div className="max-h-24 flex overflow-clip mt-2 text-sm neutral-content">
                                                        <a href={`/playlist/${userId}/${item.Id}`}>
                                                            <p>{parse(item.Description)}</p>
                                                        </a>
                                                    </div>
                                                    <p className='mt-4'>Create at: {formatDateTime(item.RegDate?.toLocaleString())}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                <div className="w-full flex justify-center pt-6 pb-9">
                                    <div className="join">
                                        {
                                            page > 1 ? (
                                                <Link className="join-item btn btn-neutral" to={`/playlist/${userId}/?page=${prevPage}`}>«</Link>
                                            ) : (
                                                <button className="join-item btn btn-neutral btn-disabled">«</button>
                                            )
                                        }
                                        <button className="join-item btn btn-neutral">Page {page}</button>
                                        {
                                            page < totalPage ? (
                                                <Link className="join-item btn btn-neutral" to={`/playlist/${userId}/?page=${nextPage}`}>»</Link>
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
