import { getPodcastInfo } from "../libs/Itunes"
import { getUserSessionInfo } from "../libs/User"
import { subscribeSearchKeyword } from "../libs/Subscription"
import { Ref, forwardRef, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PAYMENTS_ENABLED } from "../libs/Constants"
import { useAppContext } from "./AppContext"
import { MsgAlertType } from "./MsgAlert"
import { isBlockedSearchQuery } from "../libs/contentFilter"
import type { FeedChannel } from "../types/feed_channel"

export type SubscribeKeywrodDialogRef = {
    showDialog: (keyword: string, excludeFeedIds: string, country: string, source: string) => void
}

const SubscribeKeywrodDialog = forwardRef<SubscribeKeywrodDialogRef>((_props, ref: Ref<SubscribeKeywrodDialogRef>) => {

    const [excludeTitleList, setExcludeTitleList] = useState<string[]>([])
    const [excludeFeedIdList, setExcludeFeedIdList] = useState<string[]>([])
    const [excludeFeedIdStr, setExcludeFeedIdStr] = useState<string>("")
    const [searchKeywrod, setSearchKeywrod] = useState<string>("")
    const [country, setCountry] = useState<string>("US")
    const [source, setSource] = useState<string>("itunes")
    const [isLoadingExcludeChannelInfo, setIsLoadingExcludeChannelInfo] = useState(false)
    const [isSubscribeLoading, setIsSubscribeLoading] = useState(false)
    const [showUpgradeHint, setShowUpgradeHint] = useState(false)
    const appContext = useAppContext()

    useEffect(() => {
        const dialog = document.getElementById('search_keyword_modal') as HTMLDialogElement;
        if (ref) {
            (ref as any).current = {
                showDialog: (keyword: string, excludeFeedIds: string, country: string, source: string) => {
                    if (dialog) {
                        dialog.showModal();
                        setShowUpgradeHint(false)
                        setSearchKeywrod(keyword)
                        setExcludeFeedIdStr(excludeFeedIds)
                        setCountry(country)
                        setSource(source)
                        if (excludeFeedIds) {
                            const excludeFeedIdListTemp = excludeFeedIds.split(",")
                            setExcludeFeedIdList(excludeFeedIdListTemp)
                            getExcludeChannelInfo(excludeFeedIdListTemp)
                        }
                    }
                }
            }
        }

    }, [])

    const getExcludeChannelInfo = async (feedIdList: string[]) => {
        const channelNameListTemp: string[] = []
        if (feedIdList.length > 0) {
            setIsLoadingExcludeChannelInfo(true)
        }

        const promiseList = feedIdList.map(feedId => getPodcastInfo(feedId))

        let channelInfoList: FeedChannel[] = []
        try {
            channelInfoList = await Promise.all(promiseList)
        } catch (error) {
            console.log('getPodcastInfo error : ', error)
        }

        for (const channelInfo of channelInfoList) {
            channelNameListTemp.push(channelInfo.Title)
        }
        setExcludeTitleList(channelNameListTemp)
        setIsLoadingExcludeChannelInfo(false)
    }

    const doSubscribeSearchKeyword = async () => {
        if (isSubscribeLoading) {
            return
        }
        if (isBlockedSearchQuery(searchKeywrod)) {
            appContext.showMsgAlert('Subscription keyword violates content policy', MsgAlertType.FAILED)
            return
        }
        setIsSubscribeLoading(true)
        const userInfo = await getUserSessionInfo()
        const respJson = await subscribeSearchKeyword(userInfo.userId, searchKeywrod, country, source, excludeFeedIdStr, userInfo?.token).finally(() => {
            setIsSubscribeLoading(false)
        })
        if (respJson.code === 0) {
            appContext.showMsgAlert('Done', MsgAlertType.SUCCESS)
        } else {
            appContext.showMsgAlert(respJson.message, MsgAlertType.FAILED)
            if (/limit/i.test(respJson.message || '')) {
                setShowUpgradeHint(true)
                setIsSubscribeLoading(false)
                return
            }
        }
        setIsSubscribeLoading(false)
        const dialog = document.getElementById('search_keyword_modal') as HTMLDialogElement;
        dialog.close()
    }


    return (
        <>
            <dialog id="search_keyword_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Subscribe search list of `{searchKeywrod}`</h3>
                    {
                        excludeFeedIdList && excludeFeedIdList.length > 0 ? (
                            <div className="mt-4">
                                <p className="text-gray-500">Excluded podcast from search list</p>
                                {
                                    isLoadingExcludeChannelInfo ? (
                                        <div className="flex justify-center w-full mt-2">
                                            <span className="loading loading-dots loading-md"></span>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            {
                                                excludeTitleList.map((title, index) => {
                                                    return <div className="btn mr-2 mb-2" key={index}>{title}</div>
                                                })
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        ) : (
                            <div className="mt-4"><p>No excluded podcast</p></div>
                        )
                    }
                    <p className="mt-4 text-gray-500">You will be notified of any updates to the search results. Stay tuned for the latest content!</p>
                    {showUpgradeHint && (
                        <div className="alert alert-warning mt-4 flex-wrap">
                            <span>You reached your keyword limit. Upgrade to add more keywords.</span>
                            {PAYMENTS_ENABLED ? (
                                <Link to="/pricing" className="btn btn-sm btn-primary" onClick={() => {
                                    const dialog = document.getElementById('search_keyword_modal') as HTMLDialogElement;
                                    dialog?.close()
                                }}>Upgrade</Link>
                            ) : (
                                <span className="badge badge-outline">Upgrade coming soon</span>
                            )}
                        </div>
                    )}
                    <div className="modal-action">
                        {
                            isSubscribeLoading ? (
                                <button className="btn"><span className="loading loading-spinner loading-md"></span></button>
                            ) : (
                                <button className="btn" onClick={doSubscribeSearchKeyword}>Yay</button>
                            )
                        }
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    )
})

SubscribeKeywrodDialog.displayName = 'SubscribeKeywrodDialog'

export default SubscribeKeywrodDialog;
