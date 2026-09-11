import { Link, useNavigate } from 'react-router-dom'
import { getUserSessionInfo, isUserLoggedIn, userSignout } from '../libs/User'
import { syncToServer } from '../libs/User'
import type { ServerUserInfo } from '../libs/User'
import { useEffect, useState } from 'react'

type HeaderProps = {
    title?: string
    keyword?: string
    hideSearchBtn?: boolean
    children?: React.ReactNode
}

export default function Header(props: HeaderProps) {

    const navigate = useNavigate()
    const [searchInputVal, setSearchInputVal] = useState('');
    const [inputPlaceholderVal, setSearchPlaceholderVal] = useState('');
    const [headerTitle, setHeaderTitle] = useState('Porkast')
    const [isLogin, setIsLogin] = useState(false);
    const [userInfo, setUserInfo] = useState<{ userId: string; email: string; token: string; username?: string; avatar?: string }>();

    useEffect(() => {
        const checkUserLogin = async () => {
            const isUserLogin = await isUserLoggedIn()
            setIsLogin(isUserLogin)
            if (isUserLogin) {
                const info = await getUserSessionInfo()
                setUserInfo(info)
                const serverUserInfo: ServerUserInfo = {
                    id: info?.userId,
                    email: info?.email,
                    nickname: info?.username,
                    avatar: info?.avatar,
                    token: info?.token
                }
                syncToServer(serverUserInfo)
            }
        }

        checkUserLogin()
    }, [])


    const showSearchModal = () => {
        const dialog = document.getElementById('search_modal') as HTMLDialogElement;
        if (dialog) {
            dialog.open = true;
        }
        const searchInput = document.getElementById("search_input") as HTMLInputElement;
        searchInput.focus();
    }

    const onSearchInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInputVal(e.target.value)
    }

    const onSearchButtonClicked = () => {
        const dialog = document.getElementById('search_modal') as HTMLDialogElement;
        if (dialog) {
            dialog.open = false;
        }
        if (searchInputVal.length == 0) {
            return
        }
        if (searchInputVal.length == 0 && inputPlaceholderVal != "Search") {
            navigate('/search?q=' + inputPlaceholderVal)
        } else if (searchInputVal.length > 0) {
            navigate('/search?q=' + searchInputVal)
        }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearchButtonClicked()
        }
    }

    const handleLogout = async () => {
        await userSignout()
        setIsLogin(false)
        navigate('/')
    }

    useEffect(() => {
        if (props.keyword && props.keyword.length > 0) {
            setSearchInputVal(props.keyword)
        } else {
            setSearchPlaceholderVal("Search")
        }
        if (props.title && props.title.length > 0) {
            setHeaderTitle(props.title)
        }
    }, [])

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await getUserSessionInfo()
            setUserInfo(userInfo)
        }
        getUserInfo()
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
    }, [searchInputVal])

    return (
        <>
            <div className="drawer md:p-9 pt-2 block">
                <input id="header-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <div className="fixed top-4 left-4 right-4 z-40">
                        <div className="w-full navbar bg-base-200 rounded-box">
                            <div className="flex-none lg:hidden">
                                <label htmlFor="header-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                </label>
                            </div>
                            <div className="flex-1 md:px-2 md:mx-2 flex items-center gap-2">
                                <Link className="hidden lg:block" to={"/"}><img className="w-16" src="/porkast-logo.png" alt="logo" /></Link>
                                <div className="md:text-2xl font-bold">{headerTitle}</div>
                            </div>
                            <div className="flex-none lg:hidden">
                                <button className="btn btn-xs sm:btn-sm md:btn-md btn-active btn-primary mr-4" onClick={showSearchModal}>Search</button>
                            </div>
                            <div className="flex-none hidden lg:block">
                                <ul className="menu menu-horizontal">
                                    <li><Link to={`/listenlater/${userInfo?.userId || ''}`} className="text-xl btn btn-ghost">Listen Later</Link></li>
                                    <li><Link to={`/playlist/${userInfo?.userId || ''}`} className="text-xl btn btn-ghost">Playlist</Link></li>
                                    <li><Link to={`/subscription/${userInfo?.userId || ''}`} className="text-xl btn btn-ghost">Subscription</Link></li>
                                    {
                                        props.hideSearchBtn ? (
                                            <></>
                                        ) : (
                                            <li><a className="text-base btn btn-primary mr-2 ml-2" onClick={showSearchModal}>Search</a></li>
                                        )
                                    }
                                    {
                                        isLogin ? (
                                            <div className="dropdown dropdown-end">
                                                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                                    <button className="btn btn-square btn-ghost">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                                                    </button>
                                                </label>
                                                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
                                                    <li><Link to="/pricing" className="text-base">Pricing</Link></li>
                                                    <li><Link to="/profile" className="text-base">Profile</Link></li>
                                                    <li><Link to="/guide/apple-podcast" className="text-base">Subscribe Guide</Link></li>
                                                    <li><Link to="/content-policy" className="text-base">Content Policy</Link></li>
                                                    <li><Link to="/privacy" className="text-base">Privacy Policy</Link></li>
                                                    <li><Link to="/terms" className="text-base">Terms of Service</Link></li>
                                                    <li onClick={handleLogout}>
                                                        <a className="text-base font-bold w-48">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                                            <div className="">
                                                                <div>Sign Out</div>
                                                                <div className="text-sm text-gray-500 w-36 truncate">{userInfo?.email}</div>
                                                            </div>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        ) : <>
                                                    <li><Link to="/pricing" className="text-base btn btn-ghost">Pricing</Link></li>
                                                    <li><Link to="/guide/apple-podcast" className="text-base btn btn-ghost">Guide</Link></li>
                                                    <li><Link to="/content-policy" className="text-base btn btn-ghost">Content Policy</Link></li>
                                                    <li><Link to="/privacy" className="text-base btn btn-ghost">Privacy</Link></li>
                                                    <li><Link to="/terms" className="text-base btn btn-ghost">Terms</Link></li>
                                                    <li><Link className="text-base btn btn-primary" to={"/signin"}>Sign In</Link></li>
                                                </>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-20">{props.children}</div>
                    <dialog id="search_modal" className="modal">
                        <div className="modal-box border-t-4 border-b-4 border-indigo-500">
                            <label className="label mb-4">
                                <span className="label-text">Explore Podcast</span>
                            </label>
                            <div className="flex justify-end w-full mb-4">
                                <div className="relative w-full">
                                    <input id="search_input" type="text" placeholder={inputPlaceholderVal} value={searchInputVal} className="w-full px-4 py-2 rounded-lg input input-bordered" onChange={onSearchInputChanged} />
                                    <form id="search_form" method="dialog">
                                        <button id="search_button" type="submit" className="absolute right-0 top-0 mt-2 mr-4" onClick={onSearchButtonClicked}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.873-4.873"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.618 10.382a5.5 5.5 0 11-7.778 0 5.5 5.5 0 017.778 0z"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button>close</button>
                        </form>
                    </dialog>
                </div>
                <div className="drawer-side z-50">
                    <label htmlFor="header-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 relative">
                        <div className="w-full">
                            <Link to={'/'} className="text-base font-bold w-full flex justify-start items-center">
                                <img className="w-16 -ml-1 mb-4 mt-4" src="/porkast-logo.png" alt="logo" />
                                <div className="text-2xl font-bold">Porkast</div>
                            </Link>
                        </div>
                        <li>
                            <Link to={'/listenlater/' + userInfo?.userId} className="text-base font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cassette-tape"><rect width="20" height="16" x="2" y="4" rx="2" /><circle cx="8" cy="10" r="2" /><path d="M8 12h8" /><circle cx="16" cy="10" r="2" /><path d="m6 20 .7-2.9A1.4 1.4 0 0 1 8.1 16h7.8a1.4 1.4 0 0 1 1.4 1l.7 3" /></svg>
                                Listen Later
                            </Link>
                        </li>
                        <li>
                            <Link to={'/playlist/' + userInfo?.userId} className="text-base font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-music"><path d="M21 15V6" /><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path d="M12 12H3" /><path d="M16 6H3" /><path d="M12 18H3" /></svg>
                                Playlist
                            </Link>
                        </li>
                        <li>
                            <Link to={`/subscription/${userInfo?.userId || ''}`} className="text-base font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cast"><path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" /><path d="M2 12a9 9 0 0 1 8 8" /><path d="M2 16a5 5 0 0 1 4 4" /><line x1="2" x2="2.01" y1="20" y2="20" /></svg>
                                Subscription
                            </Link>
                        </li>
                        {
                            isLogin ? (
                                <li>
                                    <Link to="/profile" className="text-base font-bold">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
                                        Profile
                                    </Link>
                                </li>
                            ) : (
                                <li>
                                    <Link className="text-base font-bold" to={"/signin"}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                                        Sign In</Link>
                                </li>
                            )
                        }
                        <div className="absolute bottom-6 w-72">
                            <li>
                                <Link to="/pricing" className="text-base font-bold">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/guide/apple-podcast" className="text-base font-bold">
                                    Subscribe Guide
                                </Link>
                            </li>
                            <li>
                                <Link to="/content-policy" className="text-base font-bold">
                                    Content Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-base font-bold">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-base font-bold">
                                    Terms of Service
                                </Link>
                            </li>
                            {
                                isLogin ? (
                                    <li onClick={handleLogout}>
                                        <a className="text-base font-bold">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                            <div className="">
                                                <div>
                                                    Sign Out
                                                </div>
                                                <div className="text-sm text-gray-500 max-w-xs overflow-hidden">{userInfo?.email}</div>
                                            </div>
                                        </a>
                                    </li>
                                ) : (
                                    <></>
                                )
                            }
                        </div>
                    </ul>
                </div>
            </div>
        </>
    )
}
