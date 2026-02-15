// HPI 1.7-G
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Search, Calendar, Users, ChevronRight, Bell, ArrowRight, MapPin, Clock } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Events, Clubs, Announcements } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

// --- Custom CSS for specific non-Tailwind effects ---
const customStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .text-stroke {
    -webkit-text-stroke: 1px rgba(0,0,0,0.1);
    color: transparent;
  }
  .clip-diagonal {
    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  }
  .grain-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }
`;

export default function HomePage() {
  // --- 1. Data Fidelity Protocol: Canonical Data Sources ---
  const [upcomingEvents, setUpcomingEvents] = useState<Events[]>([]);
  const [featuredClubs, setFeaturedClubs] = useState<Clubs[]>([]);
  const [announcements, setAnnouncements] = useState<Announcements[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- 2. Preserve Original Logic ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsResult, clubsResult, announcementsResult] = await Promise.all([
        BaseCrudService.getAll<Events>('events', {}, { limit: 6 }),
        BaseCrudService.getAll<Clubs>('clubs', {}, { limit: 6 }),
        BaseCrudService.getAll<Announcements>('announcements', {}, { limit: 3 })
      ]);

      const now = new Date();
      const upcoming = eventsResult.items
        .filter(event => event.eventDateTime && new Date(event.eventDateTime) >= now)
        .sort((a, b) => new Date(a.eventDateTime!).getTime() - new Date(b.eventDateTime!).getTime())
        .slice(0, 6);

      setUpcomingEvents(upcoming);
      setFeaturedClubs(clubsResult.items);
      setAnnouncements(announcementsResult.items.sort((a, b) => 
        new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime()
      ));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/clubs?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // --- Scroll Progress for Global Motion ---
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-paragraph selection:bg-primary/20 selection:text-primary overflow-clip">
      <style>{customStyles}</style>
      
      {/* Global Grain Overlay for Texture */}
      <div className="grain-overlay" />

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
        style={{ scaleX }}
      />

      <Header />

      {/* --- HERO SECTION: The Zen Opening --- */}
      <section className="relative w-full min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px]"
            animate={{ 
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[120px]"
            animate={{ 
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[120rem] mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-col items-start space-y-2 md:space-y-6">
            {/* Staggered Typography */}
            <div className="overflow-hidden">
              <motion.h1 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-[0.9]"
              >
                DISCOVER.
              </motion.h1>
            </div>
            <div className="overflow-hidden self-center md:pl-24">
              <motion.h1 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground/80 leading-[0.9]"
              >
                CONNECT.
              </motion.h1>
            </div>
            <div className="overflow-hidden self-end md:pr-24">
              <motion.h1 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-primary leading-[0.9]"
              >
                PARTICIPATE.
              </motion.h1>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 md:mt-24 max-w-2xl mx-auto"
          >
            <p className="text-xl md:text-2xl text-foreground/60 text-center mb-12 font-light leading-relaxed">
              The central hub for student life. Join clubs, attend events, and shape your campus experience.
            </p>

            {/* Search Interface */}
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-background border border-border rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 p-2">
                <Search className="w-6 h-6 text-foreground/40 ml-4" />
                <Input
                  type="text"
                  placeholder="Find your community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-lg h-12 focus-visible:ring-0 placeholder:text-foreground/30"
                />
                <Button type="submit" size="lg" className="rounded-full px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300">
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <Link to="/clubs">
                <Button variant="outline" className="group border-foreground/10 hover:border-primary/50 hover:bg-primary/5">
                  Explore Clubs
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="ghost" className="group text-foreground/60 hover:text-foreground">
                  View Calendar
                  <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <span className="text-xs uppercase tracking-widest text-foreground/30">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-foreground/30 to-transparent" />
        </motion.div>
      </section>

      {/* --- SECTION 2: UPCOMING EVENTS (Sticky Layout) --- */}
      <section className="relative w-full py-32 bg-light-background">
        <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Sticky Header Column */}
            <div className="lg:w-1/3">
              <div className="sticky top-32">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-6xl font-heading font-bold text-foreground/5">01</span>
                  <div className="h-[1px] flex-1 bg-foreground/10" />
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
                  Upcoming <br />
                  <span className="text-primary">Experiences</span>
                </h2>
                <p className="text-lg text-foreground/60 mb-8 max-w-md">
                  Don't miss out on the vibrant campus life. From workshops to festivals, discover what's happening next.
                </p>
                <Link to="/events">
                  <Button className="rounded-full px-8" variant="default">
                    View Full Calendar
                  </Button>
                </Link>
              </div>
            </div>

            {/* Scrollable Content Column */}
            <div className="lg:w-2/3">
              {isLoading ? (
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-foreground/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-12">
                  {upcomingEvents.map((event, index) => (
                    <EventCard key={event._id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-foreground/20 rounded-2xl">
                  <Calendar className="w-12 h-12 text-foreground/20 mb-4" />
                  <p className="text-foreground/50">No upcoming events scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: VISUAL BREATHER (Parallax) --- */}
      <section className="relative w-full h-[80vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://static.wixstatic.com/media/a80f18_7f00a98ad0da44b68e40016916403772~mv2.png?originWidth=1280&originHeight=704" 
            alt="Campus Life Atmosphere"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              "Community is the <br/> heartbeat of campus."
            </h2>
            <p className="text-white/80 text-xl md:text-2xl font-light max-w-2xl mx-auto">
              Join a club. Start a movement. Find your people.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 4: FEATURED CLUBS (Grid System) --- */}
      <section className="w-full py-32 bg-background">
        <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl font-heading font-bold text-foreground/5">02</span>
                <span className="text-sm font-bold tracking-widest uppercase text-primary">Communities</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-bold">Featured Clubs</h2>
            </div>
            <Link to="/clubs" className="hidden md:block">
              <Button variant="ghost" className="text-lg hover:bg-transparent hover:text-primary p-0">
                Explore All Communities <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] bg-foreground/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : featuredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {featuredClubs.map((club, index) => (
                <ClubCard key={club._id} club={club} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-foreground/10 rounded-3xl">
              <Users className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
              <p className="text-foreground/50">No clubs featured yet.</p>
            </div>
          )}
          
          <div className="mt-12 md:hidden text-center">
            <Link to="/clubs">
              <Button variant="outline" className="w-full">View All Clubs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: ANNOUNCEMENTS (Ticker/List) --- */}
      <section className="w-full py-24 bg-secondary/5 border-t border-border">
        <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Notice Board</h2>
              <p className="text-foreground/60 mb-8">
                Stay updated with the latest news, urgent alerts, and administrative updates from the student council.
              </p>
              <div className="p-6 bg-background rounded-2xl border border-border shadow-sm">
                <h3 className="font-bold mb-2">Have an announcement?</h3>
                <p className="text-sm text-foreground/60 mb-4">Club leads can post updates directly through the dashboard.</p>
                <Button variant="outline" size="sm" className="w-full">Go to Dashboard</Button>
              </div>
            </div>

            <div className="lg:col-span-8">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-background rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : announcements.length > 0 ? (
                <div className="space-y-6">
                  {announcements.map((announcement, index) => (
                    <AnnouncementCard key={announcement._id} announcement={announcement} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-background rounded-2xl border border-border">
                  <p className="text-foreground/50">No active announcements.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS FOR CLEANER ARCHITECTURE ---

function EventCard({ event, index }: { event: Events; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-background rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-colors duration-500"
    >
      <Link to={`/events/${event._id}`} className="flex flex-col md:flex-row h-full">
        {/* Image Section */}
        <div className="md:w-2/5 h-64 md:h-auto relative overflow-hidden">
          {event.posterImage ? (
            <Image
              src={event.posterImage}
              alt={event.eventName || 'Event'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-secondary/30" />
            </div>
          )}
          {/* Date Badge Overlay */}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-primary">
              {event.eventDateTime ? format(new Date(event.eventDateTime), 'MMM') : 'TBA'}
            </span>
            <span className="block text-xl font-heading font-bold leading-none">
              {event.eventDateTime ? format(new Date(event.eventDateTime), 'dd') : '--'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="md:w-3/5 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {event.category && (
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {event.category}
                </span>
              )}
              {event.organizingClubName && (
                <span className="text-xs text-foreground/50 font-medium">
                  by {event.organizingClubName}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-heading font-bold mb-3 group-hover:text-primary transition-colors">
              {event.eventName}
            </h3>
            <p className="text-foreground/60 line-clamp-2 mb-6">
              {event.description || "Join us for this exciting event. Click to view more details."}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-foreground/50 border-t border-border pt-6 mt-auto">
            {event.eventDateTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {format(new Date(event.eventDateTime), 'h:mm a')}
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ClubCard({ club, index }: { club: Clubs; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/clubs/${club._id}`} className="block h-full">
        <div className="relative h-full bg-light-background rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-primary/10">
          <div className="flex items-start justify-between mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-sm p-1 overflow-hidden border border-border group-hover:border-primary/30 transition-colors">
              {club.clubLogo ? (
                <Image
                  src={club.clubLogo}
                  alt={club.clubName || 'Club'}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/5">
                  <Users className="w-8 h-8 text-secondary/30" />
                </div>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">
            {club.clubName}
          </h3>
          
          {club.category && (
            <span className="inline-block text-xs font-bold tracking-wider uppercase text-foreground/40 mb-4">
              {club.category}
            </span>
          )}
          
          <p className="text-foreground/60 text-sm line-clamp-3 leading-relaxed">
            {club.shortDescription || "A community dedicated to excellence and growth."}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function AnnouncementCard({ announcement, index }: { announcement: Announcements; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`relative pl-6 py-4 border-l-2 ${announcement.isUrgent ? 'border-destructive' : 'border-primary/30'} bg-background hover:bg-light-background transition-colors rounded-r-xl`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {announcement.isUrgent && (
              <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                Urgent
              </span>
            )}
            <span className="text-xs text-foreground/40 font-medium">
              {announcement.publishDate ? format(new Date(announcement.publishDate), 'MMM dd, yyyy') : 'Recent'}
            </span>
          </div>
          <h4 className="text-lg font-bold text-foreground mb-2">{announcement.title}</h4>
          <p className="text-foreground/70 text-sm leading-relaxed line-clamp-2">
            {announcement.content}
          </p>
        </div>
        <Link to="/announcements">
          <Button variant="ghost" size="icon" className="shrink-0 text-foreground/30 hover:text-primary">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );

}
// Minor UI update before presentation
