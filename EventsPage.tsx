import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, ChevronDown } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Events } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Literary', 'Social', 'Academic', 'Workshop'];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Events[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [eventType, setEventType] = useState<'upcoming' | 'past'>(
    (searchParams.get('type') as 'upcoming' | 'past') || 'upcoming'
  );
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (loadMore = false) => {
    if (!loadMore) setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<Events>('events', {}, { 
        limit: 50,
        skip: loadMore ? skip : 0
      });
      
      if (loadMore) {
        setEvents(prev => [...prev, ...result.items]);
      } else {
        setEvents(result.items);
      }
      
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();
  const upcomingEvents = events
    .filter(event => event.eventDateTime && new Date(event.eventDateTime) >= now)
    .sort((a, b) => new Date(a.eventDateTime!).getTime() - new Date(b.eventDateTime!).getTime());

  const pastEvents = events
    .filter(event => event.eventDateTime && new Date(event.eventDateTime) < now)
    .sort((a, b) => new Date(b.eventDateTime!).getTime() - new Date(a.eventDateTime!).getTime());

  const displayEvents = eventType === 'upcoming' ? upcomingEvents : pastEvents;

  const filteredEvents = displayEvents.filter(event => {
    const matchesSearch = !searchQuery || 
      event.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizingClubName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const params = new URLSearchParams(searchParams);
    if (value !== 'All') {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleEventTypeChange = (value: string) => {
    setEventType(value as 'upcoming' | 'past');
    const params = new URLSearchParams(searchParams);
    params.set('type', value);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="w-full bg-light-background py-16">
        <div className="max-w-[100rem] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Campus Events</h1>
            <p className="font-paragraph text-xl text-foreground/70 max-w-3xl">
              Discover exciting events happening on campus. From workshops to cultural festivals, there's always something happening.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="w-full py-8 bg-background border-b border-foreground/10 sticky top-16 z-40">
        <div className="max-w-[100rem] mx-auto px-8">
          {/* Event Type Toggle */}
          <div className="mb-6">
            <Tabs value={eventType} onValueChange={handleEventTypeChange}>
              <TabsList className="bg-light-background">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Upcoming ({upcomingEvents.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Past ({pastEvents.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 h-12 bg-light-background border-0"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-[200px] h-12 bg-light-background border-0">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="font-paragraph text-sm text-foreground/70">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="w-full py-16 bg-background">
        <div className="max-w-[100rem] mx-auto px-8">
          <div className="min-h-[600px]">
            {isLoading ? null : filteredEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
                    >
                      <Link to={`/events/${event._id}`}>
                        <div className="bg-light-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                          {/* Event Poster */}
                          <div className="aspect-[16/9] bg-secondary/10 overflow-hidden">
                            {event.posterImage && (
                              <Image
                                src={event.posterImage}
                                alt={event.eventName || 'Event poster'}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                width={600}
                              />
                            )}
                          </div>
                          
                          {/* Event Info */}
                          <div className="p-6 flex-1 flex flex-col">
                            {event.category && (
                              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-3 self-start">
                                {event.category}
                              </span>
                            )}
                            <h3 className="font-heading text-xl mb-3 text-foreground line-clamp-2">
                              {event.eventName}
                            </h3>
                            
                            <div className="space-y-2 mb-4 flex-1">
                              {event.eventDateTime && (
                                <p className="flex items-center gap-2 text-sm text-foreground/70 font-paragraph">
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                  <span>{format(new Date(event.eventDateTime), 'MMM dd, yyyy • h:mm a')}</span>
                                </p>
                              )}
                              {event.venue && (
                                <p className="flex items-center gap-2 text-sm text-foreground/70 font-paragraph">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span className="line-clamp-1">{event.venue}</span>
                                </p>
                              )}
                              {event.organizingClubName && (
                                <p className="text-sm text-primary font-medium font-paragraph">
                                  By {event.organizingClubName}
                                </p>
                              )}
                            </div>

                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                {hasNext && !searchQuery && selectedCategory === 'All' && (
                  <div className="mt-12 text-center">
                    <Button
                      onClick={() => loadEvents(true)}
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Load More Events
                      <ChevronDown className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <Calendar className="w-20 h-20 mx-auto mb-6 text-secondary/50" />
                <h3 className="font-heading text-2xl text-foreground mb-3">No events found</h3>
                <p className="font-paragraph text-foreground/70 mb-6">
                  {searchQuery || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filters'
                    : eventType === 'upcoming' 
                      ? 'No upcoming events at the moment'
                      : 'No past events to display'}
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSearchParams(new URLSearchParams({ type: eventType }));
                    }}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
