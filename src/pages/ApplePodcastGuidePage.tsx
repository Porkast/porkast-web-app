import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { AppProvider, useAppContext } from '../component/AppContext'
import Header from '../component/Header'
import Footer from '../component/Footer'
import ApplePodcastMockup, { type GuideStep, type GuideLang } from '../component/ApplePodcastMockup'
import { MsgAlertType } from '../component/MsgAlert'

function GuideContent() {
  const [searchParams] = useSearchParams()
  const appContext = useAppContext()

  const urlParam = searchParams.get('url') || 'https://api.porkast.com/api/rss/listenlater/demo-user'
  const titleParam = searchParams.get('title') || ''
  const feedTypeParam = searchParams.get('type') || ''
  const initialLang: GuideLang = searchParams.get('lang') === 'en' ? 'en' : 'zh'

  const [currentStep, setCurrentStep] = useState<GuideStep>(1)
  const [viewMode, setViewMode] = useState<'stepper' | 'grid'>('stepper')
  const [lang, setLang] = useState<GuideLang>(initialLang)
  const [rssUrl, setRssUrl] = useState<string>(urlParam)

  useEffect(() => {
    if (searchParams.get('url')) {
      setRssUrl(searchParams.get('url')!)
    }
  }, [searchParams])

  const isZh = lang === 'zh'

  const handleCopyLink = () => {
    navigator.clipboard.writeText(rssUrl)
    if (appContext) {
      appContext.showMsgAlert(
        isZh ? 'RSS 订阅链接已复制到剪贴板！' : 'RSS feed URL copied to clipboard!',
        MsgAlertType.INFO
      )
    }
  }

  const stepsData = [
    {
      step: 1 as GuideStep,
      title: isZh ? '步骤 1：进入「资料库」并点击「···」' : 'Step 1: Go to "Library" & Tap "···"',
      desc: isZh
        ? '在 iPhone 或 iPad 上打开「播客 (Apple Podcasts)」应用，点击底部导航栏的「资料库」标签页，然后点击右上角的「···」更多选项按钮。'
        : 'Open the Apple Podcasts app on your iPhone or iPad, switch to the "Library" tab at the bottom, and tap the "(...)" menu button in the top right corner.',
      actionTip: isZh ? '点击模拟界面右上角的「···」可进入下一步' : 'Tap the (...) button in the mockup to advance',
    },
    {
      step: 2 as GuideStep,
      title: isZh ? '步骤 2：选择「通过 URL 关注节目...」' : 'Step 2: Tap "Follow a Show by URL..."',
      desc: isZh
        ? '在弹出的菜单中，点击第一项「通过 URL 关注节目...」（Follow a Show by URL...）。'
        : 'In the popup menu that appears, tap the first item: "Follow a Show by URL...".',
      actionTip: isZh ? '点击菜单中的「通过 URL 关注节目...」进入下一步' : 'Tap "Follow a Show by URL..." in the mockup',
    },
    {
      step: 3 as GuideStep,
      title: isZh ? '步骤 3：粘贴 RSS 链接并点击「关注」' : 'Step 3: Paste RSS URL & Tap "Follow"',
      desc: isZh
        ? '在弹出的「添加播客」输入框中粘贴您复制的 Porkast RSS 链接，然后点击右上角或右侧的「关注」按钮，Apple 播客将自动解析并订阅该节目流。'
        : 'Paste your copied Porkast RSS link into the "Add Podcast" dialog input box, then tap "Follow". Apple Podcasts will parse and subscribe to your feed automatically.',
      actionTip: isZh ? '点击「关注」完成订阅演示' : 'Tap "Follow" to finish the demo',
    },
  ]

  return (
    <div className="w-full flex justify-center min-h-screen">
      <div className="w-full max-w-6xl px-4 py-8 md:py-12">
        
        {/* Top Header Card */}
        <div className="bg-base-200/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-lg border border-base-300 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-300 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-4h2v4zm0-6h-2V7h2v4z" />
                </svg>
                {isZh ? '订阅教程与指引' : 'Subscription Guide & Tutorial'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isZh ? '如何将 Porkast RSS 订阅到 Apple 播客' : 'How to Subscribe Porkast RSS in Apple Podcasts'}
              </h1>
              {titleParam && (
                <p className="text-sm font-medium text-base-content/70 mt-1">
                  {isZh ? `当前订阅流：` : `Current Feed: `} <span className="text-primary font-bold">{titleParam}</span> {feedTypeParam ? `(${feedTypeParam})` : ''}
                </p>
              )}
            </div>

            {/* Language Switcher */}
            <div className="join self-end sm:self-auto shrink-0 shadow-sm">
              <button
                type="button"
                className={`join-item btn btn-sm ${lang === 'zh' ? 'btn-primary' : 'btn-neutral'}`}
                onClick={() => setLang('zh')}
              >
                中文
              </button>
              <button
                type="button"
                className={`join-item btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-neutral'}`}
                onClick={() => setLang('en')}
              >
                English
              </button>
            </div>
          </div>

          {/* Quick RSS Copy Box */}
          <div className="bg-base-100 rounded-2xl p-4 sm:p-5 border border-base-300 shadow-inner">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <span className="text-lg">🔗</span>
                <span>{isZh ? '您的 Porkast RSS 订阅链接' : 'Your Porkast RSS Feed URL'}</span>
              </label>
              <span className="text-xs text-base-content/60">
                {isZh ? '支持稍后收听 / 播放列表 / 关键词订阅' : 'Supports Listen Later / Playlists / Subscriptions'}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                type="text"
                value={rssUrl}
                onChange={(e) => setRssUrl(e.target.value)}
                placeholder="https://api.porkast.com/api/rss/..."
                className="input input-bordered w-full font-mono text-xs sm:text-sm bg-base-200/50"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-primary sm:px-6 rounded-xl flex items-center gap-2 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{isZh ? '复制 RSS 链接' : 'Copy RSS Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode & Stepper Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          {/* Step Pill Tabs */}
          <div className="flex items-center gap-2 bg-base-200 p-1.5 rounded-2xl shadow-sm">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setCurrentStep(s as GuideStep)
                  setViewMode('stepper')
                }}
                className={`btn btn-sm rounded-xl px-4 transition-all ${
                  viewMode === 'stepper' && currentStep === s
                    ? 'btn-primary shadow-md'
                    : 'btn-ghost text-base-content/80'
                }`}
              >
                <span className="font-bold">
                  {isZh ? `步骤 ${s}` : `Step ${s}`}
                </span>
              </button>
            ))}
          </div>

          {/* Mode Switcher (Stepper vs 3-Grid) */}
          <div className="join shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('stepper')}
              className={`join-item btn btn-sm ${viewMode === 'stepper' ? 'btn-active btn-neutral' : 'btn-ghost'}`}
            >
              {isZh ? '分步交互演示' : 'Interactive Stepper'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-active btn-neutral' : 'btn-ghost'}`}
            >
              {isZh ? '三步全览视图' : '3-Screen Overview'}
            </button>
          </div>
        </div>

        {/* MAIN VISUAL SIMULATOR SECTION */}
        {viewMode === 'stepper' ? (
          /* Single Interactive Stepper View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-base-200/50 rounded-3xl p-6 sm:p-10 border border-base-300 shadow-xl mb-12">
            
            {/* Left Column: Interactive Phone Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <ApplePodcastMockup
                step={currentStep}
                onStepChange={(newStep) => setCurrentStep(newStep)}
                rssUrl={rssUrl}
                lang={lang}
                interactive={true}
                highlightAction={true}
              />
            </div>

            {/* Right Column: Step Explanation & Controls */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-primary text-primary-content font-black text-lg flex items-center justify-center shadow-md">
                    {currentStep}
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-primary font-bold">
                      {isZh ? `第 ${currentStep} 步 (共 3 步)` : `Step ${currentStep} of 3`}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {stepsData[currentStep - 1].title}
                    </h2>
                  </div>
                </div>

                <div className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-sm mb-6">
                  <p className="text-base text-base-content/90 leading-relaxed">
                    {stepsData[currentStep - 1].desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm flex items-start gap-2.5">
                  <span className="text-base">💡</span>
                  <span>{stepsData[currentStep - 1].actionTip}</span>
                </div>
              </div>

              {/* Navigation Prev / Next Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-base-300">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as GuideStep) : prev))}
                  className="btn btn-neutral rounded-xl px-5"
                >
                  {isZh ? '← 上一步' : '← Previous'}
                </button>

                <div className="flex gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      onClick={() => setCurrentStep(s as GuideStep)}
                      className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                        currentStep === s ? 'bg-primary scale-125' : 'bg-base-content/20'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentStep === 3}
                  onClick={() => setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as GuideStep) : prev))}
                  className="btn btn-primary rounded-xl px-5"
                >
                  {isZh ? '下一步 →' : 'Next →'}
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* 3-Column Grid View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((s) => {
              const stepInfo = stepsData[s - 1]
              return (
                <div key={s} className="bg-base-200/60 rounded-3xl p-5 border border-base-300 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-xl bg-primary text-primary-content font-bold text-sm flex items-center justify-center shrink-0">
                        {s}
                      </span>
                      <h3 className="font-bold text-sm line-clamp-1">{stepInfo.title}</h3>
                    </div>
                    <p className="text-xs text-base-content/80 mb-4 min-h-[3rem]">
                      {stepInfo.desc}
                    </p>
                  </div>
                  
                  <div className="scale-[0.92] origin-top">
                    <ApplePodcastMockup
                      step={s as GuideStep}
                      rssUrl={rssUrl}
                      lang={lang}
                      interactive={false}
                      highlightAction={true}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ADDITIONAL SECTIONS: macOS Apple Podcasts & Other Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* macOS Guide */}
          <div className="bg-base-200/80 rounded-3xl p-6 sm:p-8 border border-base-300 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💻</span>
              <h2 className="text-lg sm:text-xl font-bold">
                {isZh ? '在 Mac 上使用 Apple 播客订阅' : 'Subscribe on Mac Apple Podcasts'}
              </h2>
            </div>
            <p className="text-sm text-base-content/80 mb-4">
              {isZh
                ? '在 macOS 电脑端，您也可以同样轻松订阅 Porkast 生成的任何 RSS 链接：'
                : 'On macOS, you can subscribe to any Porkast RSS feed link with the same ease:'}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-base-content/90 font-medium">
              <li>{isZh ? '打开 Mac 自带的「播客 (Podcasts)」应用' : 'Open the "Podcasts" app on your Mac'}</li>
              <li>
                {isZh ? (
                  <>
                    在顶部菜单栏点击 <kbd className="kbd kbd-sm">文件</kbd> → <kbd className="kbd kbd-sm">通过 URL 关注节目...</kbd>
                  </>
                ) : (
                  <>
                    Click <kbd className="kbd kbd-sm">File</kbd> → <kbd className="kbd kbd-sm">Follow a Show by URL...</kbd> in the top menu bar
                  </>
                )}
              </li>
              <li>
                {isZh ? (
                  <>
                    或直接使用全局快捷键：<kbd className="kbd kbd-sm">⌥ Option</kbd> + <kbd className="kbd kbd-sm">⌘ Cmd</kbd> + <kbd className="kbd kbd-sm">U</kbd>
                  </>
                ) : (
                  <>
                    Or press the shortcut: <kbd className="kbd kbd-sm">⌥ Option</kbd> + <kbd className="kbd kbd-sm">⌘ Cmd</kbd> + <kbd className="kbd kbd-sm">U</kbd>
                  </>
                )}
              </li>
              <li>{isZh ? '粘贴您的 Porkast RSS 链接并回车完成关注' : 'Paste your Porkast RSS link and click Follow'}</li>
            </ol>
          </div>

          {/* Supported Feeds & Other Players */}
          <div className="bg-base-200/80 rounded-3xl p-6 sm:p-8 border border-base-300 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📻</span>
                <h2 className="text-lg sm:text-xl font-bold">
                  {isZh ? '兼容所有主流播客客户端' : 'Compatible with All Podcast Players'}
                </h2>
              </div>
              <p className="text-sm text-base-content/80 mb-3">
                {isZh
                  ? 'Porkast 输出的 RSS 链接完全符合标准 Podcast 2.0 / RSS 规范，不仅支持 Apple 播客，还可在以下客户端直接粘贴订阅：'
                  : 'Porkast feeds adhere strictly to standard RSS 2.0 / Podcast specifications. In addition to Apple Podcasts, you can paste it into:'}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Pocket Casts', 'Overcast', 'Castro', 'Snipd', 'AntennaPod', 'Moon FM', '小宇宙 (私人RSS)', 'YouTube Music'].map((client) => (
                  <span key={client} className="badge badge-neutral text-xs py-2 px-3 font-medium">
                    {client}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-base-100 rounded-xl text-xs text-base-content/70 border border-base-300">
              {isZh
                ? '⚡ 后台自动同步：当您在 Porkast 中添加稍后听单集、更新播放列表或关键词发现新单集时，Apple 播客会在后台自动为您拉取最新内容。'
                : '⚡ Background Sync: When you add episodes to Listen Later, update playlists, or new keyword matches appear, Apple Podcasts automatically refreshes in the background.'}
            </div>
          </div>

        </div>

        {/* Back Link / CTA */}
        <div className="flex justify-center items-center gap-4">
          <Link to="/" className="btn btn-ghost">
            {isZh ? '← 返回首页' : '← Back to Home'}
          </Link>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-primary rounded-2xl px-6"
          >
            {isZh ? '复制 RSS 链接并在 Apple 播客中打开' : 'Copy RSS & Open Apple Podcasts'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function ApplePodcastGuidePage() {
  return (
    <AppProvider>
      <Header title="Porkast Guide">
        <GuideContent />
      </Header>
      <Footer />
    </AppProvider>
  )
}
