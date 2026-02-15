import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronDown } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Announcements } from '@/entities';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcements[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async (loadMore = false) => {
    if (!loadMore) setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<Announcements>('announcements', {}, { 
        limit: 20,
        skip: loadMore ? skip : 0
      });
      
      const sortedItems = result.items.sort((a, b) => 
        new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime()
      );
      
      if (loadMore) {
        setAnnouncements(prev => [...prev, ...sortedItems]);
      } else {
        setAnnouncements(sortedItems);
      }
      
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const urgentAnnouncements = announcements.filter(a => a.isUrgent);
  const regularAnnouncements = announcements.filter(a => !a.isUrgent);

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
            <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Announcements</h1>
            <p className="font-paragraph text-xl text-foreground/70 max-w-3xl">
              Stay updated with the latest news, updates, and important information from campus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Announcements Content */}
      <section className="w-full py-16 bg-background">
        <div className="max-w-[100rem] mx-auto px-8">
          <div className="min-h-[600px]">
            {isLoading ? null : announcements.length > 0 ? (
              <div className="space-y-8">
                {/* Urgent Announcements */}
                {urgentAnnouncements.length > 0 && (
                  <div>
                    <h2 className="font-heading text-2xl text-destructive mb-6 flex items-center gap-2">
                      <Bell className="w-6 h-6" />
                      Urgent Announcements
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                      {urgentAnnouncements.map((announcement, index) => (
                        <motion.div
                          key={announcement._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-destructive/5 border-l-4 border-destructive rounded-lg p-8"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <Bell className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h3 className="font-heading text-2xl text-foreground mb-2">
                                {announcement.title}
                              </h3>
                              {announcement.publishDate && (
                                <p className="text-sm text-foreground/50 mb-4">
                                  {format(new Date(announcement.publishDate), 'MMMM dd, yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="font-paragraph text-foreground/80 leading-relaxed whitespace-pre-line mb-4">
                            {announcement.content}
                          </p>
                          {announcement.author && (
                            <p className="text-sm text-foreground/70 font-medium">
                              — {announcement.author}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Announcements */}
                {regularAnnouncements.length > 0 && (
                  <div>
                    {urgentAnnouncements.length > 0 && (
                      <h2 className="font-heading text-2xl text-foreground mb-6">
                        Recent Announcements
                      </h2>
                    )}
                    <div className="space-y-6">
                      {regularAnnouncements.map((announcement, index) => (
                        <motion.div
                          key={announcement._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="bg-light-background rounded-lg p-8"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Bell className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                                <h3 className="font-heading text-2xl text-foreground">
                                  {announcement.title}
                                </h3>
                                {announcement.publishDate && (
                                  <span className="text-sm text-foreground/50 md:text-right flex-shrink-0">
                                    {format(new Date(announcement.publishDate), 'MMM dd, yyyy')}
                                  </span>
                                )}
                              </div>
                              <p className="font-paragraph text-foreground/80 leading-relaxed whitespace-pre-line mb-4">
                                {announcement.content}
                              </p>
                              {announcement.author && (
                                <p className="text-sm text-foreground/70 font-medium">
                                  — {announcement.author}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Load More */}
                {hasNext && (
                  <div className="mt-12 text-center">
                    <Button
                      onClick={() => loadAnnouncements(true)}
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Load More Announcements
                      <ChevronDown className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24">
                <Bell className="w-20 h-20 mx-auto mb-6 text-secondary/50" />
                <h3 className="font-heading text-2xl text-foreground mb-3">No announcements yet</h3>
                <p className="font-paragraph text-foreground/70">
                  Check back later for updates and important information
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}