import React, { useState, useEffect } from 'react';
import { User, Lead, Customer, Project, Quotation, Payment, Expense, PortfolioProject, ServiceItem, CompanySettings, NewsArticle } from './types';
import { 
  mockUsers, mockCompanySettings, mockServices, mockPortfolio, 
  mockLeads, mockCustomers, mockProjects, mockQuotations, mockPayments, mockExpenses, mockNews 
} from './data/mockData';
import { Language } from './utils/translations';
import { api, setAuthToken, getAuthToken } from './services/api';

import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { Home } from './components/public/Home';
import { PortfolioPage } from './components/public/PortfolioPage';
import { ServicesPage } from './components/public/ServicesPage';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { QuoteRequestModal } from './components/public/QuoteRequestModal';
import { PrivacyModal } from './components/public/PrivacyModal';
import { AuthModal } from './components/common/AuthModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>('ar');

  const [settings, setSettings] = useState<CompanySettings>(mockCompanySettings);
  const [services, setServices] = useState<ServiceItem[]>(mockServices);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>(mockPortfolio);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  // Initial load from server API
  useEffect(() => {
    async function initData() {
      try {
        // Try to login default user if no token exists
        if (!getAuthToken()) {
          try {
            const loginRes = await api.login(mockUsers[0].email, 'Password@123');
            setAuthToken(loginRes.token);
            setCurrentUser(loginRes.user);
          } catch {}
        }

        // Fetch live settings, public content and news
        const [liveSettings, livePortfolio, liveServices, liveNews] = await Promise.all([
          api.getSettings().catch(() => mockCompanySettings),
          api.getPortfolio().catch(() => mockPortfolio),
          api.getServices().catch(() => mockServices),
          api.getNews().catch(() => mockNews)
        ]);

        if (liveSettings) setSettings(liveSettings);
        if (livePortfolio?.length) setPortfolio(livePortfolio);
        if (liveServices?.length) setServices(liveServices);
        if (liveNews?.length) setNews(liveNews);

        // If authenticated, fetch leads, projects, quotations, finances, users
        if (getAuthToken()) {
          const [liveLeads, liveProjects, liveQuotations, livePayments, liveExpenses, liveUsers] = await Promise.all([
            api.getLeads().catch(() => mockLeads),
            api.getProjects().catch(() => mockProjects),
            api.getQuotations().catch(() => mockQuotations),
            api.getPayments().catch(() => mockPayments),
            api.getExpenses().catch(() => mockExpenses),
            api.getUsers().catch(() => mockUsers)
          ]);
          if (liveLeads?.length) setLeads(liveLeads);
          if (liveProjects?.length) setProjects(liveProjects);
          if (liveQuotations?.length) setQuotations(liveQuotations);
          if (livePayments?.length) setPayments(livePayments);
          if (liveExpenses?.length) setExpenses(liveExpenses);
          if (liveUsers?.length) setUsers(liveUsers);
        }
      } catch (err) {
        console.warn('API sync fallback to local fixtures:', err);
      }
    }
    initData();
  }, []);

  const handleLeadSubmit = async (newLead: Omit<Lead, 'id' | 'createdAt' | 'status'>) => {
    try {
      const res = await api.submitLead(newLead);
      if (res?.lead) {
        setLeads(prev => [res.lead, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Falling back to client lead recording:', err);
    }

    const created: Lead = {
      id: `l-${Date.now()}`,
      ...newLead,
      status: 'new',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [created, ...prev]);
  };

  // If user is in admin tab
  if (currentUser.role !== 'client' && currentTab === 'admin') {
    return (
      <AdminLayout
        currentUser={currentUser}
        onSwitchBackToPublic={() => setCurrentTab('home')}
        leads={leads}
        setLeads={setLeads}
        customers={customers}
        setCustomers={setCustomers}
        projects={projects}
        setProjects={setProjects}
        quotations={quotations}
        setQuotations={setQuotations}
        payments={payments}
        setPayments={setPayments}
        expenses={expenses}
        setExpenses={setExpenses}
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        services={services}
        setServices={setServices}
        settings={settings}
        setSettings={setSettings}
        news={news}
        setNews={setNews}
        users={users}
        setUsers={setUsers}
        onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />
    );
  }

  const isAr = language === 'ar';

  return (
    <div className={`min-h-screen bg-[#F1E9DE] text-[#28332F] flex flex-col ${isAr ? "font-['Cairo',sans-serif]" : "font-['Plus_Jakarta_Sans',sans-serif]"}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Announcement Bar */}
      {settings.pageControls?.announcementBarEnabled && settings.pageControls?.announcementText && (
        <div className="bg-[#28332F] text-[#F1E9DE] py-2 px-4 text-center text-xs font-bold border-b border-[#C6A780]/30 flex items-center justify-center gap-2">
          <span>{isAr ? settings.pageControls.announcementText.ar : (settings.pageControls.announcementText.en || settings.pageControls.announcementText.ar)}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'admin') {
            setCurrentTab('admin');
          } else {
            setCurrentTab(tab);
          }
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenQuoteModal={() => setQuoteModalOpen(true)}
        settings={settings}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Public Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <Home
            settings={settings}
            services={services}
            portfolio={portfolio}
            news={news}
            setCurrentTab={setCurrentTab}
            onOpenQuoteModal={() => setQuoteModalOpen(true)}
            onSelectProject={(p) => setSelectedProject(p)}
            language={language}
          />
        )}

        {currentTab === 'services' && (
          <ServicesPage
            services={services}
            onOpenQuoteModal={() => setQuoteModalOpen(true)}
            language={language}
          />
        )}

        {currentTab === 'portfolio' && (
          <PortfolioPage
            portfolio={portfolio}
            onOpenQuoteModal={() => setQuoteModalOpen(true)}
            language={language}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage settings={settings} language={language} />
        )}

        {currentTab === 'contact' && (
          <ContactPage settings={settings} language={language} />
        )}
      </main>

      {/* Floating WhatsApp Action */}
      <a
        href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Contact"
        className="fixed bottom-6 start-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs sm:text-sm hover:scale-105 transition-all"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline">{isAr ? 'تواصل عبر الواتساب' : 'Chat via WhatsApp'}</span>
      </a>

      {/* Footer */}
      <Footer
        settings={settings}
        setCurrentTab={setCurrentTab}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        language={language}
      />

      {/* Modals */}
      <QuoteRequestModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        onAddLead={handleLeadSubmit}
        language={language}
      />

      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          if (u.role !== 'client') {
            setCurrentTab('admin');
          } else {
            setCurrentTab('home');
          }
        }}
      />

    </div>
  );
};
