import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import OurWork from './pages/OurWork.jsx'
import AuthorDetail from './pages/AuthorDetail.jsx'
import OurEvents from './pages/OurEvents.jsx'
import EventDetail from './pages/EventDetail.jsx'
import WorkWithUs from './pages/WorkWithUs.jsx'
import Career from './pages/Career.jsx'
import Job from './pages/Job.jsx'
import Training from './pages/Training.jsx'
import Contact from './pages/Contact.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Services from './pages/Services.jsx'
import ServiceCategory from './pages/ServiceCategory.jsx'
import ListeningFeed from './pages/ListeningFeed.jsx'
import ListeningPost from './pages/ListeningPost.jsx'
import SupportInbox from './pages/moderation/SupportInbox.jsx'
import SupportDetail from './pages/moderation/SupportDetail.jsx'
import AdminContent from './pages/moderation/AdminContent.jsx'
import VerificationInbox from './pages/moderation/VerificationInbox.jsx'
import NotFound from './pages/NotFound.jsx'
import CommunityJobs from './pages/CommunityJobs.jsx'
import CommunityBusinesses from './pages/CommunityBusinesses.jsx'
import CommunityBusinessesCity from './pages/CommunityBusinessesCity.jsx'
import MemberProfile from './pages/MemberProfile.jsx'
import CommunityEventDetail from './pages/CommunityEventDetail.jsx'
import CommunityResources from './pages/CommunityResources.jsx'
import CommunityResourceDetail from './pages/CommunityResourceDetail.jsx'
import LegalPage from './pages/LegalPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/our-work" element={<OurWork />} />
        <Route path="/our-work/:slug" element={<AuthorDetail />} />
        <Route path="/our-events" element={<OurEvents />} />
        <Route path="/our-events/:slug" element={<EventDetail />} />
        <Route path="/work-with-us" element={<WorkWithUs />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceCategory />} />
        <Route path="/listening" element={<ListeningFeed />} />
        <Route path="/listening/:postId" element={<ListeningPost />} />
        <Route path="/community/businesses" element={<CommunityBusinesses />} />
        <Route path="/community/businesses/:city" element={<CommunityBusinessesCity />} />
        <Route path="/community/members/:userId" element={<MemberProfile />} />
        <Route path="/community/events" element={<Navigate to="/our-events" replace />} />
        <Route path="/community/events/:id" element={<CommunityEventDetail />} />
        <Route path="/community/resources" element={<CommunityResources />} />
        <Route path="/community/resources/:id" element={<CommunityResourceDetail />} />
        <Route path="/career" element={<Career />} />
        <Route path="/community/jobs" element={<CommunityJobs />} />
        <Route path="/job" element={<Navigate to="/community/jobs" replace />} />
        <Route path="/training" element={<Training />} />
        <Route path="/moderation/support" element={<SupportInbox />} />
        <Route path="/moderation/support/:id" element={<SupportDetail />} />
        <Route path="/moderation/verifications" element={<VerificationInbox />} />
        <Route path="/moderation/content" element={<AdminContent />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
        <Route path="/terms" element={<LegalPage slug="terms" />} />
        <Route path="/privacy" element={<LegalPage slug="privacy" />} />
        <Route path="/community-guidelines" element={<LegalPage slug="guidelines" />} />
        <Route path="/volunteer-agreement" element={<LegalPage slug="volunteer" />} />
        <Route path="/content-policy" element={<LegalPage slug="content" />} />
        <Route path="/register/*" element={<Register />} />
        <Route path="/elementor-38582" element={<Navigate to="/register" replace />} />
        <Route path="/log-in/*" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
