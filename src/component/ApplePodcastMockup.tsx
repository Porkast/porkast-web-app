import React from 'react'

export type GuideStep = 1 | 2 | 3
export type GuideLang = 'zh' | 'en'

interface ApplePodcastMockupProps {
  step: GuideStep
  onStepChange?: (step: GuideStep) => void
  rssUrl?: string
  lang?: GuideLang
  interactive?: boolean
  highlightAction?: boolean
}

export default function ApplePodcastMockup({
  step,
  onStepChange,
  rssUrl = 'https://api.porkast.com/api/rss/share/demo-feed',
  lang = 'zh',
  interactive = true,
  highlightAction = true,
}: ApplePodcastMockupProps) {
  const isZh = lang === 'zh'

  const handleNextStep = (targetStep: GuideStep) => {
    if (interactive && onStepChange) {
      onStepChange(targetStep)
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] select-none">
      {/* Phone Hardware Shell */}
      <div className="relative rounded-[48px] p-3 bg-neutral-900 shadow-2xl ring-1 ring-white/20 border-4 border-neutral-800">
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 ring-1 ring-neutral-800"></div>
          <div className="w-2 h-2 rounded-full bg-primary/80"></div>
        </div>

        {/* Screen Container */}
        <div className="relative overflow-hidden rounded-[38px] bg-[#f2f2f7] text-neutral-900 min-h-[670px] flex flex-col font-sans">
          
          {/* iOS Status Bar */}
          <div className="pt-3 px-6 flex justify-between items-center text-xs font-semibold tracking-tight z-40">
            <span>21:28</span>
            <div className="flex items-center space-x-1.5">
              {/* Signal Bars */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <rect x="2" y="16" width="3" height="6" rx="1" />
                <rect x="7" y="12" width="3" height="10" rx="1" />
                <rect x="12" y="8" width="3" height="14" rx="1" />
                <rect x="17" y="4" width="3" height="18" rx="1" />
              </svg>
              {/* WiFi */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.6 0 6.9 1.4 9.4 3.7l-9.4 9.4-9.4-9.4C5.1 8.9 8.4 7.5 12 7.5z" />
              </svg>
              {/* Battery */}
              <div className="flex items-center">
                <span className="text-[10px] mr-1 font-bold">53</span>
                <div className="w-5 h-2.5 border border-current rounded-sm p-0.5 flex items-center">
                  <div className="h-full w-3 bg-current rounded-2xs"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Screen Content - Base Layer (Library Page) */}
          <div className={`flex-1 flex flex-col justify-between pt-3 pb-2 px-4 transition-all duration-200 ${step === 3 ? 'filter blur-[1px] brightness-90' : ''}`}>
            
            {/* Header: Title + Action Buttons */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {isZh ? '资料库' : 'Library'}
                </h1>

                <div className="flex items-center space-x-2.5">
                  {/* More (...) Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => handleNextStep(step === 1 ? 2 : 1)}
                      className={`w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center transition-all ${
                        step === 1 && highlightAction
                          ? 'ring-4 ring-primary ring-offset-2 animate-bounce'
                          : 'hover:bg-neutral-300'
                      }`}
                      aria-label="More Options"
                    >
                      <svg className="w-5 h-5 fill-current text-primary" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>

                    {/* Step 1 Interactive Indicator Callout */}
                    {step === 1 && highlightAction && (
                      <div className="absolute top-11 right-0 w-44 z-30 bg-primary text-primary-content text-xs font-semibold py-1.5 px-2.5 rounded-xl shadow-xl flex items-center gap-1.5 animate-pulse">
                        <span className="bg-white text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                        <span>{isZh ? '点击右上角「···」' : 'Tap the (...) button'}</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm shadow-sm">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* iOS Menu List */}
              <div className="bg-white rounded-2xl divide-y divide-neutral-100 shadow-sm overflow-hidden text-sm">
                
                {/* 节目 / Shows */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-primary">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <rect x="8" y="2" width="8" height="2" rx="1" />
                      </svg>
                    </div>
                    <span className="font-medium">{isZh ? '节目' : 'Shows'}</span>
                  </div>
                  <span className="text-neutral-400">›</span>
                </div>

                {/* 类别 / Channels */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-primary">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                    </div>
                    <span className="font-medium">{isZh ? '类别' : 'Channels'}</span>
                  </div>
                  <span className="text-neutral-400">›</span>
                </div>

                {/* 已保存 / Saved */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-primary">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <span className="font-medium">{isZh ? '已保存' : 'Saved'}</span>
                  </div>
                  <span className="text-neutral-400">›</span>
                </div>

                {/* 已下载 / Downloaded */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-primary">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="8 12 12 16 16 12" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                      </svg>
                    </div>
                    <span className="font-medium">{isZh ? '已下载' : 'Downloaded'}</span>
                  </div>
                  <span className="text-neutral-400">›</span>
                </div>

                {/* 最新单集 / Latest Episodes */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-primary">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <span className="font-medium">{isZh ? '最新单集' : 'Latest Episodes'}</span>
                  </div>
                  <span className="text-neutral-400">›</span>
                </div>

              </div>

              {/* 最近更新 / Recently Updated Section */}
              <div className="mt-4">
                <div className="text-base font-bold mb-2">
                  {isZh ? '最近更新' : 'Recently Updated'}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Podcast Card 1 */}
                  <div className="rounded-xl overflow-hidden bg-neutral-900 text-white p-2.5 flex flex-col justify-between h-28 shadow-sm">
                    <div className="text-[11px] font-bold leading-tight">Lex<br />Fridman<br /><span className="text-neutral-400 font-normal">Podcast</span></div>
                    <div className="text-[9px] text-neutral-400 truncate">更新时间：4天前</div>
                  </div>

                  {/* Podcast Card 2 */}
                  <div className="rounded-xl overflow-hidden bg-slate-900 text-white p-2.5 flex flex-col justify-between h-28 shadow-sm relative">
                    <div className="text-xs font-serif font-black tracking-widest text-slate-100">
                      三鱼粥铺
                      <div className="text-[9px] font-sans font-normal text-slate-300 mt-1">直播间故事</div>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">更新时间：5天前</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Player Bar */}
            <div className="mt-2 bg-white/90 backdrop-blur-md rounded-2xl p-2 flex items-center justify-between border border-neutral-200/60 shadow-sm">
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-xs shrink-0">
                  🎙️
                </div>
                <div className="truncate text-left">
                  <div className="text-[11px] font-bold truncate">Porkast Feed • Episode</div>
                  <div className="text-[9px] text-neutral-500 truncate">7月1日</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0 pr-1">
                <button className="text-neutral-900">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
                <button className="text-neutral-500">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
                    <path d="M3 3v5h5" />
                    <text x="9" y="15" fontSize="7" fill="currentColor" stroke="none">30</text>
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom iOS Tab Bar */}
            <div className="mt-2 pt-2 pb-1 border-t border-neutral-200 grid grid-cols-4 text-center text-[10px]">
              <div className="text-neutral-400 flex flex-col items-center">
                <svg className="w-5 h-5 fill-current mb-0.5" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span>{isZh ? '主页' : 'Home'}</span>
              </div>
              <div className="text-neutral-400 flex flex-col items-center">
                <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>{isZh ? '新发现' : 'Browse'}</span>
              </div>
              <div className="text-primary font-bold flex flex-col items-center">
                <svg className="w-5 h-5 fill-current mb-0.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="2" />
                  <path d="M12 2a10 10 0 0 0-7.07 17.07l1.42-1.42A8 8 0 1 1 12 20v2a10 10 0 0 0 0-20z" />
                </svg>
                <span>{isZh ? '资料库' : 'Library'}</span>
              </div>
              <div className="text-neutral-400 flex flex-col items-center">
                <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>{isZh ? '搜索' : 'Search'}</span>
              </div>
            </div>

          </div>

          {/* OVERLAY: Step 2 Context Menu */}
          {step === 2 && (
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] z-40 flex flex-col justify-start pt-14 px-4 transition-all">
              {/* Anchored Popover Menu */}
              <div className="self-end w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden divide-y divide-neutral-200/70 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Menu Item 1: Follow Show by URL (Target) */}
                <button
                  type="button"
                  onClick={() => handleNextStep(3)}
                  className={`w-full text-left p-3.5 flex items-center justify-between text-sm transition-colors ${
                    highlightAction
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-neutral-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>{isZh ? '通过 URL 关注节目...' : 'Follow a Show by URL...'}</span>
                  </span>
                  {highlightAction && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                  )}
                </button>

                {/* Menu Item 2: New Station */}
                <div className="p-3.5 text-sm text-neutral-700 opacity-70">
                  {isZh ? '新建电台' : 'New Station'}
                </div>

                {/* Menu Item 3: Edit Library */}
                <div className="p-3.5 text-sm text-neutral-700 opacity-70">
                  {isZh ? '编辑资料库' : 'Edit Library'}
                </div>
              </div>

              {/* Step 2 Callout Indicator */}
              {highlightAction && (
                <div className="mt-4 self-end max-w-[240px] bg-primary text-primary-content text-xs font-semibold py-2 px-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-pulse">
                  <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>{isZh ? '选择「通过 URL 关注节目...」' : 'Tap "Follow a Show by URL..."'}</span>
                </div>
              )}
            </div>
          )}

          {/* OVERLAY: Step 3 Add Podcast Modal Dialog */}
          {step === 3 && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center px-4 transition-all">
              <div className="w-full max-w-[290px] bg-white/95 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl border border-white/40 text-center animate-in fade-in zoom-in-95 duration-150">
                
                <h3 className="text-lg font-bold tracking-tight text-neutral-900">
                  {isZh ? '添加播客' : 'Add Podcast'}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 mb-4">
                  {isZh ? '通过 URL 关注节目' : 'Follow a show by URL'}
                </p>

                {/* Input Box */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    readOnly
                    value={rssUrl}
                    placeholder={isZh ? '播客 URL' : 'Podcast URL'}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-neutral-100 border border-primary/60 focus:outline-none text-primary font-mono truncate select-all shadow-inner"
                  />
                  {rssUrl && (
                    <div className="absolute right-2 top-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans font-bold">
                      RSS
                    </div>
                  )}
                </div>

                {/* Buttons: Cancel & Follow */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200/80">
                  <button
                    type="button"
                    onClick={() => handleNextStep(2)}
                    className="w-full py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                  >
                    {isZh ? '取消' : 'Cancel'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNextStep(1)}
                    className="w-full py-2 text-sm font-bold text-primary-content bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    {isZh ? '关注' : 'Follow'}
                  </button>
                </div>

                {/* Step 3 Callout Indicator */}
                {highlightAction && (
                  <div className="mt-3 bg-primary text-primary-content text-xs font-semibold py-1.5 px-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                    <span className="bg-white text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <span>{isZh ? '粘贴链接后点击「关注」' : 'Paste RSS URL & tap Follow'}</span>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* iOS Bottom Home Bar */}
          <div className="py-1 flex justify-center z-40">
            <div className="w-32 h-1 bg-neutral-400/60 rounded-full"></div>
          </div>

        </div>
      </div>
    </div>
  )
}
