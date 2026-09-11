import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from '../component/Header'
import EpisodeCard from '../component/EpisodeCard'
import Footer from '../component/Footer'
import { AppProvider } from '../component/AppContext'
import parse from 'html-react-parser'
import { addLinkTagToUrl, removeTextColorStyles, replaceWithBr } from '../libs/Common'
import { getPodcastAllInfo } from '../libs/Itunes'
import { AvatarImage } from '../component/PorkastImage'
import Loading from '../component/Loading'
import ContentUnavailable from '../component/ContentUnavailable'
import { CONTENT_REPORT_EMAIL } from '../libs/contentFilter'

export default function PodcastChannelPage() {
    const { channelId } = useParams()
    const [searchParams] = useSearchParams()
    const page = searchParams.get('page') || '1'
    const [podcastData, setPodcastData] = useState<{ podcast: any; episodes: any[] } | null>(null)
    const [loadFailed, setLoadFailed] = useState(false)

    useEffect(() => {
        if (!channelId) return
        getPodcastAllInfo(channelId).then(data => {
            const limit = 10
            const offset = (parseInt(page) - 1) * limit
            data.episodes = data.episodes.slice(offset, offset + limit)
            data.podcast.Items = data.podcast.Items.slice(offset, offset + limit)
            setPodcastData(data)
        }).catch(() => {
            setLoadFailed(true)
        })
    }, [channelId, page])

    if (loadFailed) {
        return (
            <AppProvider>
                <Header keyword={""}>
                    <ContentUnavailable />
                </Header>
                <Footer />
            </AppProvider>
        )
    }

    if (!podcastData) return <Loading />

    const channelInfoData = podcastData.podcast
    const episodeTotalCount = channelInfoData.Count
    var channelDescription = channelInfoData.TextChannelDesc
    channelDescription = addLinkTagToUrl(channelDescription)
    channelDescription = replaceWithBr(channelDescription)
    channelDescription = removeTextColorStyles(channelDescription)

    const limit = 10
    const totalPage = Math.ceil(episodeTotalCount / limit)

    let nextPage = parseInt(page)
    if (parseInt(page) < totalPage) nextPage = parseInt(page) + 1
    const nextPageUrl = "/podcast/" + channelId + "?page=" + nextPage

    let prePage = parseInt(page)
    if (parseInt(page) > 1) prePage = parseInt(page) - 1
    const prevPageUrl = "/podcast/" + channelId + "?page=" + prePage

    return (
        <AppProvider>
            <div>
                <Header keyword={""} >
                    <div className='w-full flex justify-center'>
                        <div className='w-full max-w-2xl pl-6 pr-6'>
                            {
                                page == "1" ?
                                    <div className='w-full'>
                                        <div className='text-3xl font-bold'>{channelInfoData.Title}</div>
                                        <div className="w-full flex justify-start mt-4">
                                            <div className="w-24">
                                                <AvatarImage imageUrl={channelInfoData.ImageUrl} />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-500 mt-2">By {channelInfoData.Author}</div>
                                                <div className="flex justify-start mt-4">
                                                    <a className="btn btn-neutral btn-sm flex items-center rounded-lg" href={channelInfoData.FeedLink} target="_blank" rel="noopener noreferrer">
                                                        <svg className="w-4 h-4 icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4715" width="32" height="32">
                                                            <path d="M128 768a128 128 0 1 0 0 256 128 128 0 0 0 0-256zM0 368v176c265.104 0 480 214.912 480 480h176c0-362.32-293.696-656-656-656zM0 0v176c468.336 0 848 379.664 848 848h176C1024 458.464 565.536 0 0 0z" fill="#bfbfbf" p-id="4716"></path>
                                                        </svg>
                                                        RSS
                                                    </a>
                                                    <a className="btn btn-neutral btn-sm flex items-center rounded-lg ml-4" href={channelInfoData.Link} target="_blank" rel="noopener noreferrer">
                                                        <svg className="w-5 h-5 icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3342" width="32" height="32"><path d="M574 665.4c-3.1-3.1-8.2-3.1-11.3 0L446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3l-39.8-39.8c-3.1-3.1-8.2-3.1-11.3 0L191.4 526.5c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3L574 665.4zM832.6 191.4c-84.6-84.6-221.5-84.6-306 0L410.3 307.6c-3.1 3.1-3.1 8.2 0 11.3l39.7 39.7c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204L665.3 562.6c-3.1 3.1-3.1 8.2 0 11.3l39.8 39.8c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c84.5-84.6 84.5-221.5 0-306.1z" p-id="3343" fill="#bfbfbf"></path><path d="M610.1 372.3c-3.1-3.1-8.2-3.1-11.3 0L372.3 598.7c-3.1 3.1-3.1 8.2 0 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l226.4-226.4c3.1-3.1 3.1-8.2 0-11.3l-39.5-39.6z" p-id="3344" fill="#bfbfbf"></path></svg>
                                                        Link
                                                    </a>
                                                </div>
                                                <p className="mt-4 text-xs">{channelInfoData.Copyright}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <p className='text-base-content'>{parse(channelDescription)}</p>
                                        </div>
                                        {
                                            channelInfoData.Categories == undefined || channelInfoData.Categories.length == 0 ? (
                                                <></>
                                            ) : (
                                                <div className="w-full carousel carousel-center p-2 mt-4 space-x-2 bg-base-200 rounded-lg">
                                                    {
                                                        channelInfoData.Categories?.map((item: any) => {
                                                            return (
                                                                <div key={item} className="carousel-item">
                                                                    <button className="btn btn-xs flex justify-start items-center">
                                                                        <svg className="w-5 h-5 fill-base-content" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2296" width="32" height="32"><path d="M483.2 790.3L861.4 412c1.7-1.7 2.5-4 2.3-6.3l-25.5-301.4c-0.7-7.8-6.8-13.9-14.6-14.6L522.2 64.3c-2.3-0.2-4.7 0.6-6.3 2.3L137.7 444.8c-3.1 3.1-3.1 8.2 0 11.3l334.2 334.2c3.1 3.2 8.2 3.2 11.3 0z m62.6-651.7l224.6 19 19 224.6L477.5 694 233.9 450.5l311.9-311.9z" p-id="2297"></path><path d="M605.958852 324.826232a48 48 0 1 0 67.881066-67.883435 48 48 0 1 0-67.881066 67.883435Z" p-id="2298"></path><path d="M889.7 539.8l-39.6-39.5c-3.1-3.1-8.2-3.1-11.3 0l-362 361.3-237.6-237c-3.1-3.1-8.2-3.1-11.3 0l-39.6 39.5c-3.1 3.1-3.1 8.2 0 11.3l243.2 242.8 39.6 39.5c3.1 3.1 8.2 3.1 11.3 0l407.3-406.6c3.1-3.1 3.1-8.2 0-11.3z" p-id="2299"></path></svg>
                                                                        {item}
                                                                    </button>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            )
                                        }
                                    </div> :
                                    <></>
                            }

                            <div className="flex justify-start mt-6">
                                <div className="text-sm">Total {episodeTotalCount} Episodes</div>
                            </div>
                            <div className="w-full flex justify-center pt-9">
                                <div className="w-full">
                                    {
                                        channelInfoData.Items.map((item: any) => {
                                            return (
                                                <EpisodeCard key={item.Id} data={{
                                                    itemId: item.GUID,
                                                    channelId: item.ChannelId,
                                                    title: item.HighlightTitle,
                                                    description: item.TextDescription,
                                                    image: item.ImageUrl == "" ? podcastData.podcast.ImageUrl : item.ImageUrl,
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
                                </div>
                            </div>
                            <div className="w-full flex justify-center pt-6 pb-9">
                                <div className="join">
                                    <Link className="join-item btn btn-neutral" to={prevPageUrl}>«</Link>
                                    <button className="join-item btn btn-neutral">Page {page}</button>
                                    <Link className="join-item btn btn-neutral" to={nextPageUrl}>»</Link>
                                </div>
                            </div>
                            <div className="w-full flex justify-center pb-9">
                                <a
                                    className="link link-hover text-xs text-gray-400"
                                    href={`mailto:${CONTENT_REPORT_EMAIL}?subject=${encodeURIComponent('Content report')}`}
                                >
                                    Report content
                                </a>
                            </div>
                        </div>
                    </div>
                </Header>
                <Footer />
            </div>
        </AppProvider>
    );
}
