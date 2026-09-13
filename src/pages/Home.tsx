import Header from '../component/Header';
import SearchInput from '../component/SearchInput';

export default function Home() {
    return (
        <div>
            <Header hideSearchBtn={true} >
                <div className="mt-28">
                    <div className="w-full flex justify-center">
                        <img src="/porkast-text-logo-black.jpg" className="w-96 block" />
                    </div>
                    <div className="md:text-5xl text-2xl font-semibold flex justify-center w-full italic text-center text-black">
                        Discover, Subscribe, Share
                    </div>
                    <div className="md:text-4xl text-xl text-primary font-bold flex justify-center w-full italic text-center mt-9">
                        Your Personalized Podcast
                    </div>
                </div>

                <div className="mt-16">
                    <div className="w-full flex justify-center mt-9 pl-6 pr-6">
                        <SearchInput placeholder="Start from search" />
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <div className="rounded-lg p-6 max-w-md text-center">
                        <div className="text-3xl mb-3">📱</div>
                        <h3 className="font-semibold text-lg mb-2 text-black">Porkast for iOS</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Discover podcasts, manage subscriptions, and listen on the go with our native iOS app.
                        </p>
                        <a
                            href="https://apps.apple.com/us/app/porkast/id6768356920"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.58.67-1.09 1.74-.95 2.77 1 .08 2.05-.52 2.67-1.27z" />
                            </svg>
                            <span>Download on App Store</span>
                        </a>
                    </div>
                </div>

                <div className="mt-4 mb-8 flex justify-center">
                    <div className="rounded-lg p-6 max-w-md text-center">
                        <div className="text-3xl mb-3">🚀</div>
                        <h3 className="font-semibold text-lg mb-2 text-black">Also Available on Telegram!</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Discover podcasts, manage subscriptions, and share episodes - all from Telegram.
                        </p>
                        <a
                            href="https://t.me/PorkcastBot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            <span>Try Telegram Bot</span>
                        </a>
                    </div>
                </div>

            </Header>
        </div>
    )
}
