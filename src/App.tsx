import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignInPage from './pages/SignInPage'
import SearchPage from './pages/SearchPage'
import PodcastChannelPage from './pages/PodcastChannelPage'
import PodcastEpisodePage from './pages/PodcastEpisodePage'
import SubscriptionPage from './pages/subscription/SubscriptionPage'
import SubscriptionKeywordPage from './pages/subscription/SubscriptionKeywordPage'
import ListenLaterPage from './pages/ListenLaterPage'
import PlaylistPage from './pages/playlist/PlaylistPage'
import PlaylistDetailPage from './pages/playlist/PlaylistDetailPage'
import ShareSubscriptionPage from './pages/ShareSubscriptionPage'
import SharePlaylistPage from './pages/SharePlaylistPage'
import ShareListenLaterPage from './pages/ShareListenLaterPage'
import ProfilePage from './pages/ProfilePage'
import PricingPage from './pages/PricingPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import ContentPolicyPage from './pages/ContentPolicyPage'
import ApplePodcastGuidePage from './pages/ApplePodcastGuidePage'
import NotFound from './pages/NotFound'
import { AppProvider } from './component/AppContext'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/podcast/:channelId" element={<PodcastChannelPage />} />
          <Route path="/podcast/:channelId/episode/:itemId" element={<PodcastEpisodePage />} />
          <Route path="/subscription/:userId" element={<SubscriptionPage />} />
          <Route path="/subscription/:userId/:keyword" element={<SubscriptionKeywordPage />} />
          <Route path="/listenlater/:userId" element={<ListenLaterPage />} />
          <Route path="/playlist/:userId" element={<PlaylistPage />} />
          <Route path="/playlist/:userId/:playlistId" element={<PlaylistDetailPage />} />
          <Route path="/share/subscription/:userName/:keyword" element={<ShareSubscriptionPage />} />
          <Route path="/share/playlist/:playlistId/:userName" element={<SharePlaylistPage />} />
          <Route path="/share/listenlater/:userName" element={<ShareListenLaterPage />} />
          <Route path="/guide/apple-podcast" element={<ApplePodcastGuidePage />} />
          <Route path="/guide" element={<ApplePodcastGuidePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/content-policy" element={<ContentPolicyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
