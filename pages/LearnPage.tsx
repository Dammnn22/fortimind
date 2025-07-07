
import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, PlayCircle, Rewind, FastForward, Play, Volume2, Info, List } from 'lucide-react';
import type { User } from 'firebase/auth'; // Firebase User type
import { EducationalResource, Language, TranslationKey } from '../types';
import { INITIAL_EDUCATIONAL_RESOURCES_KEYS } from '../constants';
import Modal from '../components/Modal';
import { useLocalization } from '../hooks/useLocalization';

interface LearnPageProps {
  isGuest: boolean;
  firebaseUser: User | null | undefined;
}

const LearnPage: React.FC<LearnPageProps> = ({isGuest, firebaseUser}) => { // Props received
  const { t, currentLanguage } = useLocalization();
  
  const [resources, setResources] = useState<EducationalResource[]>(INITIAL_EDUCATIONAL_RESOURCES_KEYS.map(keyResource => ({
    id: keyResource.id, // Ensure id is passed directly
    type: keyResource.type, // Ensure type is passed directly
    url: keyResource.url, // Pass url object/string directly
    videoCredits: keyResource.videoCredits, // Pass videoCredits object directly
    title: t(keyResource.titleKey),
    summary: t(keyResource.summaryKey),
    content: keyResource.contentKey ? t(keyResource.contentKey) : undefined,
    category: t(keyResource.categoryKey),
  })));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedResource, setExpandedResource] = useState<EducationalResource | null>(null);

  const categories = Array.from(new Set(resources.map(r => r.category)));

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? resource.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  
  React.useEffect(() => {
     setResources(INITIAL_EDUCATIONAL_RESOURCES_KEYS.map(keyResource => ({
      id: keyResource.id, 
      type: keyResource.type, 
      url: keyResource.url, 
      videoCredits: keyResource.videoCredits,
      title: t(keyResource.titleKey),
      summary: t(keyResource.summaryKey),
      content: keyResource.contentKey ? t(keyResource.contentKey) : undefined,
      category: t(keyResource.categoryKey),
    })));
  }, [t]);


  const ResourceCard: React.FC<{ resource: EducationalResource }> = ({ resource }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-primary dark:text-primary-light mb-2">{resource.title}</h3>
      <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70 mb-1">{t('resourceType', resource.type)}</p>
      <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70 mb-3">{t('resourceCategory', resource.category)}</p>
      <p className="text-neutral-dark dark:text-neutral-light mb-4">{resource.summary}</p>
      <button
        onClick={() => setExpandedResource(resource)}
        className="w-full text-sm font-medium text-primary dark:text-primary-light hover:underline"
      >
        {resource.type === 'article' ? t('readFullArticle') : (resource.type === 'video' ? t('watchVideo') : t('listenNow'))}
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('learnTitle')}</h1>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder={t('searchResources')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-neutral rounded-lg shadow-sm focus:ring-primary focus:border-primary w-full bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral dark:text-slate-500" size={18} />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                        ${!selectedCategory ? 'bg-primary text-white' : 'bg-neutral/20 dark:bg-slate-700 text-neutral-dark dark:text-neutral-light hover:bg-primary-light dark:hover:bg-primary-dark'}`}
        >
            {t('all')}
        </button>
        {categories.map(category => (
            <button 
                key={category} 
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${selectedCategory === category ? 'bg-primary text-white' : 'bg-neutral/20 dark:bg-slate-700 text-neutral-dark dark:text-neutral-light hover:bg-primary-light dark:hover:bg-primary-dark'}`}
            >
                {category}
            </button>
        ))}
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto text-neutral dark:text-slate-600 mb-4" />
          <p className="text-xl text-neutral-dark dark:text-neutral-light">{t('noResourcesFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      )}

      <Modal 
        isOpen={!!expandedResource} 
        onClose={() => setExpandedResource(null)} 
        title={expandedResource?.title} 
        size={expandedResource?.type === 'video' ? 'xl' : 'lg'}
      >
        {expandedResource && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80">{t('resourceType', expandedResource.type)} | {t('resourceCategory', expandedResource.category)}</p>
            
            {expandedResource.type === 'article' && expandedResource.content && (
              <div className="prose dark:prose-invert max-w-none text-neutral-dark dark:text-neutral-light" dangerouslySetInnerHTML={{ __html: expandedResource.content.replace(/\n/g, '<br />') }} />
            )}

            {expandedResource.type === 'video' && expandedResource.url && typeof expandedResource.url === 'object' && (
              <div>
                <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden shadow-lg">
                  <iframe 
                    className="w-full h-full"
                    src={(expandedResource.url as Partial<Record<Language, string>>)[currentLanguage] || (expandedResource.url as Partial<Record<Language, string>>)['en']}
                    title={expandedResource.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
                {expandedResource.videoCredits && (
                  <div className="mt-3 text-xs text-neutral-dark/70 dark:text-neutral-light/70">
                    {(() => {
                      const creditInfo = expandedResource.videoCredits?.[currentLanguage] || expandedResource.videoCredits?.['en'];
                      if (creditInfo) {
                        return (
                          <span>
                            {t('contentFromChannel', t(creditInfo.nameKey as TranslationKey))}
                            {' - '}
                            <a href={creditInfo.url} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-primary-light hover:underline">
                              {t('visitWebsiteLabel')} <ExternalLink size={12} className="inline-block" />
                            </a>
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            )}

            {expandedResource.type === 'audio' && expandedResource.url && (
              <div>
                {(() => {
                  const urlIsObject = typeof expandedResource.url === 'object' && !Array.isArray(expandedResource.url) && expandedResource.url !== null;
                  const currentUrl = urlIsObject 
                      ? (expandedResource.url as Partial<Record<Language, string>>)[currentLanguage] || (expandedResource.url as Partial<Record<Language, string>>)['en'] || '#'
                      : typeof expandedResource.url === 'string' ? expandedResource.url : '#';
                  
                  const creditInfo = expandedResource.videoCredits?.[currentLanguage] || expandedResource.videoCredits?.['en'];

                  return (
                    <div>
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-slate-800 dark:bg-gray-900 text-white p-3 rounded-lg shadow-lg cursor-pointer hover:bg-slate-700 dark:hover:bg-gray-800 transition-colors"
                        title={t('listenNow')}
                      >
                        <div className="flex items-center justify-between space-x-4">
                          {/* Left Controls */}
                          <div className="flex items-center space-x-3 text-slate-300">
                            <Rewind size={24} />
                            <div className="bg-white text-slate-800 rounded-full p-2">
                              <Play size={24} />
                            </div>
                            <FastForward size={24} />
                          </div>

                          {/* Center Info with Artwork Placeholder */}
                          <div className="flex-grow flex items-center space-x-3 overflow-hidden">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary flex items-center justify-center rounded-md shadow-md">
                              <PlayCircle size={32} className="text-white/80" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-semibold truncate text-sm">
                                {creditInfo ? t(creditInfo.nameKey as TranslationKey) : expandedResource.title}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {t('externalContentPrompt')}
                              </p>
                            </div>
                          </div>
                          
                          {/* Right Controls */}
                          <div className="hidden sm:flex items-center space-x-3 text-slate-300">
                            <Volume2 size={20} />
                            <div className="w-20 h-1 bg-slate-600 rounded-full">
                              <div className="w-3/4 h-full bg-white rounded-full"></div>
                            </div>
                            <Info size={20} />
                            <List size={20} />
                          </div>
                        </div>
                      </a>

                      {currentUrl === "#" && <p className="text-xs text-danger mt-2">{t('placeholderLinkWarning')}</p>}

                      {creditInfo && (
                        <div className="mt-4 text-xs text-center text-neutral-dark/70 dark:text-neutral-light/70">
                          <span>
                            {t('contentFromChannel', t(creditInfo.nameKey as TranslationKey))}
                            {' - '}
                            <a href={creditInfo.url} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-primary-light hover:underline">
                              {t('visitWebsiteLabel')} <ExternalLink size={12} className="inline-block" />
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

             <button
                onClick={() => setExpandedResource(null)}
                className="mt-6 w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md shadow-sm"
              >
                {t('close')}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LearnPage;
