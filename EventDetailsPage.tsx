import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowLeft, ExternalLink, Users } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Events, Clubs } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Events | null>(null);
  const [organizingClub, setOrganizingClub] = useState<Clubs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    setIsLoading(true);
    try {
      const eventData = await BaseCrudService.getById<Events>('events', id!);
      setEvent(eventData);

      // Find organizing club
      if (eventData?.organizingClubName) {
        const clubsResult = await BaseCrudService.getAll<Clubs>('clubs');
        const club = clubsResult.items.find(c => c.clubName === eventData.organizingClubName);
        if (club) {
          setOrganizingClub(club);
        }
      }
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-[100rem] mx-auto px-8 py-24 text-center">
          <h2 className="font-heading text-3xl text-foreground mb-4">Event Not Found</h2>
          <p className="font-paragraph text-foreground/70 mb-8">The event you're looking for doesn't exist.</p>
          <Link to="/events">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isPastEvent = event.eventDateTime && new Date(event.eventDateTime) < new Date();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Back Button */}
      <div className="w-full bg-light-background py-4">
        <div className="max-w-[100rem] mx-auto px-8">
          <Link to="/events">
            <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Event Content */}
      <section className="w-full py-16 bg-background">
        <div className="max-w-[100rem] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Poster */}
              {event.posterImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="aspect-[16/9] bg-secondary/10 rounded-lg overflow-hidden mb-8 shadow-md"
                >
                  <Image
                    src={event.posterImage}
                    alt={event.eventName || 'Event poster'}
                    className="w-full h-full object-cover"
                    width={1200}
                  />
                </motion.div>
              )}

              {/* Event Title & Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                {event.category && (
                  <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded mb-4">
                    {event.category}
                  </span>
                )}
                <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
                  {event.eventName}
                </h1>
                {isPastEvent && (
                  <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary text-sm font-medium rounded">
                    Past Event
                  </span>
                )}
              </motion.div>

              {/* Event Description */}
              {event.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-8"
                >
                  <h2 className="font-heading text-2xl text-foreground mb-4">About This Event</h2>
                  <p className="font-paragraph text-lg text-foreground/70 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </motion.div>
              )}

              {/* Organizing Club */}
              {organizingClub && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h2 className="font-heading text-2xl text-foreground mb-4">Organized By</h2>
                  <Link to={`/clubs/${organizingClub._id}`}>
                    <div className="bg-light-background rounded-lg p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                      {organizingClub.clubLogo && (
                        <div className="w-16 h-16 rounded-lg bg-background overflow-hidden flex-shrink-0">
                          <Image
                            src={organizingClub.clubLogo}
                            alt={organizingClub.clubName || 'Club logo'}
                            className="w-full h-full object-cover"
                            width={64}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-heading text-xl text-foreground mb-1">
                          {organizingClub.clubName}
                        </h3>
                        {organizingClub.shortDescription && (
                          <p className="font-paragraph text-sm text-foreground/70 line-clamp-2">
                            {organizingClub.shortDescription}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        View Club
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-light-background rounded-lg p-8 sticky top-24"
              >
                <h2 className="font-heading text-2xl text-foreground mb-6">Event Details</h2>
                
                <div className="space-y-6 mb-8">
                  {/* Date & Time */}
                  {event.eventDateTime && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-paragraph text-sm text-foreground/70 mb-1">Date & Time</p>
                        <p className="font-paragraph text-foreground font-medium">
                          {format(new Date(event.eventDateTime), 'EEEE, MMMM dd, yyyy')}
                        </p>
                        <p className="font-paragraph text-foreground">
                          {format(new Date(event.eventDateTime), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Venue */}
                  {event.venue && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-paragraph text-sm text-foreground/70 mb-1">Venue</p>
                        <p className="font-paragraph text-foreground font-medium">
                          {event.venue}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Organizing Club Name */}
                  {event.organizingClubName && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-paragraph text-sm text-foreground/70 mb-1">Organized By</p>
                        <p className="font-paragraph text-foreground font-medium">
                          {event.organizingClubName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Registration Button */}
                {event.registrationLink && !isPastEvent && (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Register Now
                      <ExternalLink className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                )}

                {isPastEvent && (
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <p className="font-paragraph text-sm text-secondary">
                      This event has already taken place
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
