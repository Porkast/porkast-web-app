import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EpisodeCard from '../component/EpisodeCard'
import Header from '../component/Header'
import Footer from '../component/Footer'
import { AppProvider } from '../component/AppContext'
import type { FeedItem } from '../types/feed_item'
import AddExcludeFeedIdDialog, { AddExcludeFeedIdDialogRef } from '../component/AddExcludeFeedIdDialog'
import SubscribeKeywrodDialog, { SubscribeKeywrodDialogRef } from '../component/SubscribeKeywrodDialog'
import { searchPodcastEpisodeFromItunes } from '../libs/Itunes'
import { useRef } from 'react'
import { SkeletonSearchEpisodeView } from '../component/SkeletonView'
import { isBlockedSearchQuery } from '../libs/contentFilter'
import { smoothScrollToTop } from '../libs/Common'

enum Page {
    NextPage,
    PrePage
}

export default function SearchPage() {
    const [searchParams] = useSearchParams()
    const addExcludeFeedIdDialogRef = useRef<AddExcludeFeedIdDialogRef>(null)
    const subscribeSearchKeywordDialogRef = useRef<SubscribeKeywrodDialogRef>(null)

    const q = searchParams.get('q') || ''
    const pageStr = searchParams.get('page') || '1'
    const country = searchParams.get('country') || 'US'
    const source = searchParams.get('source') || 'itunes'
    const excludeFeedId = searchParams.get('excludeFeedId') || ''
    const entity = searchParams.get('entity') || 'item'
    const page = parseInt(pageStr)

    const [searchResults, setSearchResults] = useState<FeedItem[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [totalPage, setTotalPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const blockedQuery = isBlockedSearchQuery(q)

    useEffect(() => {
        if (!q) return
        if (blockedQuery) {
            setSearchResults([])
            setTotalCount(0)
            setTotalPage(1)
            return
        }
        setLoading(true)
        const limit = 10
        const offset = (page - 1) * limit
        searchPodcastEpisodeFromItunes(q, 'podcastEpisode', country, excludeFeedId, offset, limit, 200).then(data => {
            setSearchResults(data)
            if (data.length > 0) {
                setTotalCount(data[0].Count)
                setTotalPage(Math.ceil(data[0].Count / limit))
            }
        }).finally(() => setLoading(false))
    }, [q, page, country, excludeFeedId, blockedQuery])

    const prevPageUrl = getTargetPageUrl(q, page, totalPage, Page.PrePage, entity, country, excludeFeedId)
    const nextPageUrl = getTargetPageUrl(q, page, totalPage, Page.NextPage, entity, country, excludeFeedId)

    const isPreBtnClickable = page > 1
    const isNextBtnClickable = page < totalPage

    const showExcludeDialog = (channelTitle: string, feedId: string) => {
        addExcludeFeedIdDialogRef.current?.showModal(channelTitle, feedId)
    }

    const showSubscribeSearchKeywordDialog = () => {
        subscribeSearchKeywordDialogRef.current?.showDialog(q || '', excludeFeedId || '', country, source)
    }

    return (
        <AppProvider>
            <div className="w-full">
                <Header keyword={q || ""} title='Search'>
                    <div className="w-full flex justify-center pl-6 pr-6">
                        <div className="w-full max-w-2xl">
                            {blockedQuery ? (
                                <div className="alert alert-warning flex justify-between items-center gap-4">
                                    <span>This search term is not allowed by our Content Policy. Adult and prohibited content is filtered from Porkast.</span>
                                    <Link to="/content-policy" className="btn btn-sm btn-primary whitespace-nowrap shrink-0">Content Policy</Link>
                                </div>
                            ) : (
                                <>
                                    <div className='text-neutral-500 text-sm mb-6 ml-2'>{totalCount} results</div>
                                    {loading ? (
                                        <>
                                            <SkeletonSearchEpisodeView />
                                            <SkeletonSearchEpisodeView />
                                            <SkeletonSearchEpisodeView />
                                        </>
                                    ) : (
                                        searchResults?.map((item: FeedItem) => {
                                            return (
                                                <EpisodeCard key={item.Id} data={{
                                                    itemId: item.GUID,
                                                    channelId: item.ChannelId,
                                                    title: item.HighlightTitle,
                                                    description: item.TextDescription,
                                                    image: item.ImageUrl,
                                                    link: item.Link,
                                                    rssLink: item.FeedLink,
                                                    channelName: item.HighlightChannelTitle,
                                                    authorName: item.Author,
                                                    pubDate: item.PubDate,
                                                    audioLength: item.Duration,
                                                    audioSrc: item.EnclosureUrl,
                                                    showExcludeBtn: true
                                                }}
                                                    onExcludeModalBtnClick={showExcludeDialog}
                                                />
                                            )
                                        })
                                    )}
                                    <div className='flex justify-start w-full'>
                                        <button className="btn btn-primary rounded-lg ml-4" onClick={showSubscribeSearchKeywordDialog}>
                                            <span className="font-bold text-base">Subscribe {q}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="w-full flex justify-center pt-6 pb-9">
                        <div className="join">
                            {
                                isPreBtnClickable ? (
                                    <Link className="join-item btn btn-neutral" to={prevPageUrl} onClick={() => smoothScrollToTop()}>«</Link>
                                ) : (
                                    <button className="join-item btn btn-neutral btn-disabled">«</button>
                                )
                            }
                            <button className="join-item btn btn-neutral">Page {page}</button>
                            {
                                isNextBtnClickable ? (
                                    <Link className="join-item btn btn-neutral" to={nextPageUrl} onClick={() => smoothScrollToTop()}>»</Link>
                                ) : (
                                    <button className="join-item btn btn-neutral btn-disabled">»</button>
                                )
                            }
                        </div>
                    </div>
                    <AddExcludeFeedIdDialog ref={addExcludeFeedIdDialogRef} />
                    <SubscribeKeywrodDialog ref={subscribeSearchKeywordDialogRef} />
                </Header>
                <Footer />
            </div>
        </AppProvider>
    )
}

const getTargetPageUrl = (keyword: string, currentPage: number, searchResultTotalPage: number, target: Page, entity: string, country: string, excludeFeedId: string): string => {
    var targetPageNum = 0;

    if (target == Page.NextPage) {
        targetPageNum = currentPage >= searchResultTotalPage ? currentPage : currentPage + 1
    } else {
        targetPageNum = currentPage > 1 ? currentPage - 1 : currentPage
    }
    return "/search?q=" + keyword + "&page=" + targetPageNum + "&entity=" + entity + "&country=" + country + "&excludeFeedId=" + excludeFeedId
}
