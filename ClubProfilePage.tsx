import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, Instagram, Linkedin, Calendar, MapPin, ArrowLeft, ExternalLink } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Clubs, Events, TeamMembers } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function ClubProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<Clubs | null>(null);
  const [events, setEvents] = useState<Events[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadClubData();
    }
  }, [id]);

  const loadClubData = async () => {
    setIsLoading(true);
    try {
      const [clubData, eventsResult, teamResult] = await Promise.all([
        BaseCrudService.getById<Clubs>('clubs', id!),
        BaseCrudService.getAll<Events>('events'),
        BaseCrudService.getAll<TeamMembers>('teammembers')
      ]);

      setClub(clubData);
      
      // Filter events for this club
      const clubEvents = eventsResult.items.filter(
        event => event.organizingClubName === clubData?.clubName
      );
      setEvents(clubEvents);

      setTeamMembers(teamResult.items);
    } catch (error) {
      console.error('Error loading club data:', error);
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

  if (!club) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-[100rem] mx-auto px-8 py-24 text-center">
          <h2 className="font-heading text-3xl text-foreground mb-4">Club Not Found</h2>
          <p className="font-paragraph text-foreground/70 mb-8">The club you're looking for doesn't exist.</p>
          <Link to="/clubs">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const upcomingEvents = events.filter(event => 
    event.eventDateTime && new Date(event.eventDateTime) >= new Date()
  ).sort((a, b) => 
    new Date(a.eventDateTime!).getTime() - new Date(b.eventDateTime!).getTime()
  );

  const pastEvents = events.filter(event => 
    event.eventDateTime && new Date(event.eventDateTime) < new Date()
  ).sort((a, b) => 
    new Date(b.eventDateTime!).getTime() - new Date(a.eventDateTime!).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Back Button */}
      <div className="w-full bg-light-background py-4">
        <div className="max-w-[100rem] mx-auto px-8">
          <Link to="/clubs">
            <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Button>
          </Link>
        </div>
      </div>

      {/* Banner Image */}
      {club.bannerImage && (
        <div className="w-full h-[300px] md:h-[400px] bg-secondary/10 overflow-hidden">
          <Image
            src={club.bannerImage}
            alt={`${club.clubName} banner`}
            className="w-full h-full object-cover"
            width={1920}
          />
        </div>
      )}

      {/* Club Header */}
      <section className="w-full bg-light-background py-8 border-b border-foreground/10">
        <div className="max-w-[100rem] mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Club Logo */}
            <div className="w-32 h-32 rounded-lg bg-background shadow-md overflow-hidden flex-shrink-0">
              {club.clubLogo && (
                <Image
                  src={club.clubLogo}
                  alt={club.clubName || 'Club logo'}
                  className="w-full h-full object-cover"
                  width={128}
                />
              )}
            </div>

            {/* Club Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-3">
                    {club.clubName}
                  </h1>
                  {club.category && (
                    <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded">
                      {club.category}
                    </span>
                  )}
                </div>
              </div>
              {club.shortDescription && (
                <p className="font-paragraph text-lg text-foreground/70">
                  {club.shortDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {club.aboutSection && (
        <section className="w-full py-16 bg-background">
          <div className="max-w-[100rem] mx-auto px-8">
            <h2 className="font-heading text-3xl text-foreground mb-6">About</h2>
            <p className="font-paragraph text-lg text-foreground/70 leading-relaxed whitespace-pre-line">
              {club.aboutSection}
            </p>
          </div>
        </section>
      )}

      {/* Contact & Social */}
      <section className="w-full py-16 bg-light-background">
        <div className="max-w-[100rem] mx-auto px-8">
          <h2 className="font-heading text-3xl text-foreground mb-8">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {club.contactEmail && (
              <a 
                href={`mailto:${club.contactEmail}`}
                className="flex items-center gap-4 p-6 bg-background rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-paragraph text-sm text-foreground/70 mb-1">Email</p>
                  <p className="font-paragraph text-foreground">{club.contactEmail}</p>
                </div>
              </a>
            )}

            {club.contactPhone && (
              <a 
                href={`tel:${club.contactPhone}`}
                className="flex items-center gap-4 p-6 bg-background rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-paragraph text-sm text-foreground/70 mb-1">Phone</p>
                  <p className="font-paragraph text-foreground">{club.contactPhone}</p>
                </div>
              </a>
            )}

            {club.instagramLink && (
              <a 
                href={club.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-background rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-paragraph text-sm text-foreground/70 mb-1">Instagram</p>
                  <p className="font-paragraph text-foreground">Follow us on Instagram</p>
                </div>
                <ExternalLink className="w-5 h-5 text-foreground/50" />
              </a>
            )}

            {club.linkedInLink && (
              <a 
                href={club.linkedInLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-background rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Linkedin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-paragraph text-sm text-foreground/70 mb-1">LinkedIn</p>
                  <p className="font-paragraph text-foreground">Connect on LinkedIn</p>
                </div>
                <ExternalLink className="w-5 h-5 text-foreground/50" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Team Members */}
      {teamMembers.length > 0 && (
        <section className="w-full py-16 bg-background">
          <div className="max-w-[100rem] mx-auto px-8">
            <h2 className="font-heading text-3xl text-foreground mb-8">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-light-background rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="aspect-square bg-secondary/10 overflow-hidden">
                    {member.photo && (
                      <Image
                        src={member.photo}
                        alt={member.fullName || 'Team member'}
                        className="w-full h-full object-cover"
                        width={300}
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg text-foreground mb-1">
                      {member.fullName}
                    </h3>
                    {member.role && (
                      <p className="font-paragraph text-sm text-primary mb-2">{member.role}</p>
                    )}
                    {member.teamSection && (
                      <p className="font-paragraph text-xs text-foreground/70 mb-3">{member.teamSection}</p>
                    )}
                    {member.linkedInProfile && (
                      <a
                        href={member.linkedInProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="w-full py-16 bg-light-background">
          <div className="max-w-[100rem] mx-auto px-8">
            <h2 className="font-heading text-3xl text-foreground mb-8">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/events/${event._id}`}>
                    <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
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
                      <div className="p-6">
                        <h3 className="font-heading text-xl mb-3 text-foreground line-clamp-2">
                          {event.eventName}
                        </h3>
                        <div className="space-y-2 text-sm text-foreground/70 font-paragraph">
                          {event.eventDateTime && (
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(event.eventDateTime), 'MMM dd, yyyy • h:mm a')}
                            </p>
                          )}
                          {event.venue && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {event.venue}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Events Gallery */}
      {pastEvents.length > 0 && (
        <section className="w-full py-16 bg-background">
          <div className="max-w-[100rem] mx-auto px-8">
            <h2 className="font-heading text-3xl text-foreground mb-8">Past Events</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link to={`/events/${event._id}`}>
                    <div className="aspect-square bg-secondary/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {event.posterImage && (
                        <Image
                          src={event.posterImage}
                          alt={event.eventName || 'Past event'}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          width={400}
                        />
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
