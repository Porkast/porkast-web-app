import { useEffect, useState } from "react";
import { getUserSessionInfo } from "../libs/User";
import { useAppContext } from "./AppContext";

type AddToPlaylistButtonProps = {
    itemTitle: string;
    itemId: string;
    channelId: string;
}


export default function AddToPlaylistButton(props: AddToPlaylistButtonProps) {

    const { itemTitle: feedTitle, itemId, channelId } = props
    const [currentUserId, setCurrentUserId] = useState('')
    const appContext = useAppContext()

    const onAddToPlaylistBtnClick = async () => {
        appContext.addToPlayListFunction(currentUserId, feedTitle, channelId, itemId, "itunes")
    }

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await getUserSessionInfo()
            if (userInfo && userInfo.userId) {
                setCurrentUserId(userInfo.userId)
            }
        }
        getUserInfo()
    }, [itemId, channelId])

    return (
        <>
            <button className="btn btn-neutral mr-2 btn-sm flex items-center rounded-lg" onClick={onAddToPlaylistBtnClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /><path fill="none" d="M0 0h24v24H0z" /></svg>
                <span className="font-bold text-xs md:display">Add to</span>
            </button>
        </>
    )
}
