import React, { useState } from 'react';
import { ChevronRight, Globe, Cpu, Users, Zap, Shield, Layout, LucideProps } from 'lucide-react';

interface FeatureCardProps {
    icon: any;
    title:string;
    description:string;
}

interface GameplayCardProps {
    title: string;
    imageUrl: string;
}

interface RoadmapItemProps{
    date:string;
    title:string;
    description: string;
    isLeft:boolean;
}

const ChainvilleLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 to-stone-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-5 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-amber-600 text-white p-2 rounded-lg mr-2">
            <Cpu size={24} />
          </div>
          <span className="text-2xl font-bold">Chainville</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
          <a href="#gameplay" className="hover:text-amber-400 transition-colors">Gameplay</a>
          <a href="#roadmap" className="hover:text-amber-400 transition-colors">Roadmap</a>
          <a href="#community" className="hover:text-amber-400 transition-colors">Community</a>
          <button className="bg-amber-700 hover:bg-amber-700 transition-colors px-5 py-2 rounded-lg font-medium">
            Play Now
          </button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-stone-800 py-4 px-4 md:hidden">
          <a href="#features" className="block py-2 hover:text-amber-400">Features</a>
          <a href="#gameplay" className="block py-2 hover:text-amber-400">Gameplay</a>
          <a href="#roadmap" className="block py-2 hover:text-amber-400">Roadmap</a>
          <a href="#community" className="block py-2 hover:text-amber-400">Community</a>
          <button className="mt-3 w-full bg-amber-500 hover:bg-amber-600 px-5 py-2 rounded-lg font-medium">
            Play Now
          </button>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Build Your Blockchain City Empire
          </h1>
          <p className="text-xl text-amber-100 mb-8">
            Chainville is the first Web3 city-building simulation where your decisions shape the future. Build, trade, and compete in a decentralized metaverse.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-amber-500 hover:bg-amber-600 transition-colors px-8 py-3 rounded-lg font-medium text-lg">
              Start Building
            </button>
            <button className="bg-transparent border border-white hover:bg-white/10 transition-colors px-8 py-3 rounded-lg font-medium text-lg">
              Watch Trailer
            </button>
          </div>
          <div className="mt-8 flex items-center text-slate-300">
            <div className="flex -space-x-2">
              <img src="/api/placeholder/40/40" alt="User" className="w-10 h-10 rounded-full border-2 border-slate-800" />
              <img src="/api/placeholder/40/40" alt="User" className="w-10 h-10 rounded-full border-2 border-slate-800" />
              <img src="/api/placeholder/40/40" alt="User" className="w-10 h-10 rounded-full border-2 border-slate-800" />
            </div>
            <span className="ml-4">Join 50,000+ players building their cities</span>
          </div>
        </div>
        <div className="md:w-1/2 md:pl-10">
          <div className="relative">
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="/api/placeholder/640/360" 
                alt="Chainville Game Screenshot" 
                className="w-full h-auto opacity-75 mix-blend-overlay" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-5 bg-slate-800 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <div className="bg-green-500 p-2 rounded mr-3">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-bold">Live Players</p>
                  <p className="text-green-400 font-medium">12,453 online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="bg-stone-800/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Game Features</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Chainville combines classic city-building mechanics with blockchain technology to create a unique gaming experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe />}
              title="Decentralized City Management"
              description="Own your city as an NFT. All in-game assets are on the blockchain, giving you true ownership."
            />
            <FeatureCard 
              icon={<Cpu />}
              title="Play-to-Earn Economy"
              description="Earn $CHAIN tokens by completing objectives, optimizing your city, and trading resources."
            />
            <FeatureCard 
              icon={<Users />}
              title="Player-Driven Marketplace"
              description="Buy, sell, and trade resources and unique building designs with other players."
            />
            <FeatureCard 
              icon={<Zap />}
              title="Real-time Resource Management"
              description="Balance energy, water, materials, and workforce to sustain your growing city."
            />
            <FeatureCard 
              icon={<Shield />}
              title="City Governance"
              description="Create policies, set taxes, and govern your city using DAO principles."
            />
            <FeatureCard 
              icon={<Layout />}
              title="Customizable Infrastructure"
              description="Design and build unique city layouts with hundreds of building options."
            />
          </div>
        </div>
      </div>
      
      {/* Gameplay Preview */}
      <div id="gameplay" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Gameplay Preview</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Get a sneak peek at what awaits you in the world of Chainville.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GameplayCard title="City Building" imageUrl="/api/placeholder/400/240" />
          <GameplayCard title="Resource Trading" imageUrl="/api/placeholder/400/240" />
          <GameplayCard title="Economy Management" imageUrl="/api/placeholder/400/240" />
          <GameplayCard title="NFT Marketplace" imageUrl="/api/placeholder/400/240" />
        </div>
        
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className="aspect-w-16 aspect-h-9 relative">
            <img src="/api/placeholder/1280/720" alt="Gameplay Video Placeholder" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-amber-700/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-800/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Roadmap Section */}
      <div id="roadmap" className="bg-slate-800/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Development Roadmap</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our journey to build the ultimate blockchain city-builder.
            </p>
          </div>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-amber-500"></div>
            
            <div className="space-y-12">
              <RoadmapItem 
                date="Q2 2025"
                title="Beta Launch"
                description="Public beta with core city-building mechanics and basic blockchain integration."
                isLeft={true}
              />
              
              <RoadmapItem 
                date="Q3 2025"
                title="Marketplace Release"
                description="Launch of the player-to-player marketplace for trading resources and unique buildings."
                isLeft={false}
              />
              
              <RoadmapItem 
                date="Q4 2025"
                title="Governance System"
                description="Introduction of city governance mechanics and voting system powered by DAO."
                isLeft={true}
              />
              
              <RoadmapItem 
                date="Q1 2026"
                title="Multi-City Expansion"
                description="Ability to build multiple cities and create trade networks between them."
                isLeft={false}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Community Section */}
      <div id="community" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Connect with other players, participate in discussions, and get early access to updates.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-600 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Discord</h3>
            <p className="text-slate-300 mb-6">Join our server with 50,000+ members</p>
            <button className="bg-amber-500 hover:bg-amber-600 transition-colors w-full py-3 rounded-lg font-medium">
              Join Discord
            </button>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-500/20 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Twitter</h3>
            <p className="text-slate-300 mb-6">Follow us for the latest updates and news</p>
            <button className="bg-amber-500 hover:bg-amber-600 transition-colors w-full py-3 rounded-lg font-medium">
              Follow @Chainville
            </button>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-500/20 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Newsletter</h3>
            <p className="text-slate-300 mb-6">Get weekly development updates via email</p>
            <button className="bg-amber-500 hover:bg-amber-600 transition-colors w-full py-3 rounded-lg font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-amber-600 to-indigo-600 rounded-2xl p-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your City?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of players already building their blockchain cities in Chainville.
          </p>
          <button className="bg-white text-amber-600 hover:bg-amber-50 transition-colors px-8 py-3 rounded-lg font-medium text-lg">
            Play Now
          </button>
          <p className="mt-4 text-amber-200">No download required. Play directly in your browser.</p>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-amber-950 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-amber-500 text-white p-2 rounded-lg mr-2">
                <Cpu size={24} />
              </div>
              <span className="text-2xl font-bold">Chainville</span>
            </div>
            
            <div className="flex flex-wrap justify-center space-x-6 mb-6 md:mb-0">
              <a href="#features" className="hover:text-amber-400 transition-colors py-1">Features</a>
              <a href="#gameplay" className="hover:text-amber-400 transition-colors py-1">Gameplay</a>
              <a href="#roadmap" className="hover:text-amber-400 transition-colors py-1">Roadmap</a>
              <a href="#community" className="hover:text-amber-400 transition-colors py-1">Community</a>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="hover:text-amber-400 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 10h-2v2h2v6h3v-6h1.82l.18-2h-2v-.833c0-.478.096-.667.558-.667h1.442v-2.5h-2.404c-1.798 0-2.596.792-2.596 2.308v1.692z"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-amber-900 mt-8 pt-8 text-center text-amber-200">
            <p>&copy; 2025 Chainville. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-slate-800 rounded-xl p-6 transition-transform hover:transform hover:scale-105">
      <div className="bg-amber-500/20 p-3 rounded-lg inline-block mb-4">
        <div className="text-amber-500">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-300">{description}</p>
      <div className="mt-4">
        <a href="#" className="text-amber-400 flex items-center hover:text-amber-300 transition-colors">
          Learn more <ChevronRight size={16} className="ml-1" />
        </a>
      </div>
    </div>
  );
};

// Gameplay Card Component
const GameplayCard = ({ title, imageUrl }: GameplayCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-xl cursor-pointer">
      <img src={imageUrl} alt={title} className="w-full h-60 object-cover transition-transform group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4">
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
    </div>
  );
};

// Roadmap Item Component
const RoadmapItem = ({ date, title, description, isLeft }: RoadmapItemProps) => {
  return (
    <div className={`flex items-center ${isLeft ? 'flex-row-reverse' : ''}`}>
      <div className="w-5/12"></div>
      
      {/* Circle in middle */}
      <div className="w-2/12 flex justify-center">
        <div className="relative">
          <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center z-10 relative">
            <div className="h-6 w-6 bg-slate-800 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="w-5/12">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="bg-amber-500/20 py-1 px-3 rounded text-amber-400 text-sm inline-block mb-2">
            {date}
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ChainvilleLanding;