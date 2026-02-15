import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Users, ChevronDown } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Clubs } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Literary', 'Social', 'Academic'];

export default function ClubsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clubs, setClubs] = useState<Clubs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    if (search) setSearchQuery(search);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  const loadClubs = async (loadMore = false) => {
    if (!loadMore) setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<Clubs>('clubs', {}, { 
        limit: 50,
        skip: loadMore ? skip : 0
      });
      
      if (loadMore) {
        setClubs(prev => [...prev, ...result.items]);
      } else {
        setClubs(result.items);
      }
      
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = !searchQuery || 
      club.clubName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    
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
            <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Explore Clubs</h1>
            <p className="font-paragraph text-xl text-foreground/70 max-w-3xl">
              Discover diverse communities and find your passion. Join clubs that match your interests and connect with like-minded students.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="w-full py-8 bg-background border-b border-foreground/10 sticky top-16 z-40">
        <div className="max-w-[100rem] mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <Input
                type="text"
                placeholder="Search clubs..."
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
              {filteredClubs.length} {filteredClubs.length === 1 ? 'club' : 'clubs'} found
            </p>
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="w-full py-16 bg-background">
        <div className="max-w-[100rem] mx-auto px-8">
          <div className="min-h-[600px]">
            {isLoading ? null : filteredClubs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredClubs.map((club, index) => (
                    <motion.div
                      key={club._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
                    >
                      <Link to={`/clubs/${club._id}`}>
                        <div className="bg-light-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                          {/* Club Logo */}
                          <div className="aspect-square bg-secondary/10 overflow-hidden">
                            {club.clubLogo && (
                              <Image
                                src={club.clubLogo}
                                alt={club.clubName || 'Club logo'}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                width={400}
                              />
                            )}
                          </div>
                          
                          {/* Club Info */}
                          <div className="p-6 flex-1 flex flex-col">
                            {club.category && (
                              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-3 self-start">
                                {club.category}
                              </span>
                            )}
                            <h3 className="font-heading text-xl mb-3 text-foreground line-clamp-2">
                              {club.clubName}
                            </h3>
                            <p className="font-paragraph text-foreground/70 text-sm line-clamp-3 mb-4 flex-1">
                              {club.shortDescription}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              View Profile
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
                      onClick={() => loadClubs(true)}
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Load More Clubs
                      <ChevronDown className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <Users className="w-20 h-20 mx-auto mb-6 text-secondary/50" />
                <h3 className="font-heading text-2xl text-foreground mb-3">No clubs found</h3>
                <p className="font-paragraph text-foreground/70 mb-6">
                  {searchQuery || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filters'
                    : 'No clubs have been registered yet'}
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSearchParams(new URLSearchParams());
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
