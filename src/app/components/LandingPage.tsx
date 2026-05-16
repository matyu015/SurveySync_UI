import { useState } from 'react';
import { Map, MapPin, Users, FileCheck, Moon, Sun, Compass, Layout, Layers, PenTool, FileSignature, Maximize, Mountain, Menu, X } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Custom SurveySync Logo
const SurveySyncLogo = ({ className = "size-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 3 22 8.5 22 15.5 12 21 2 15.5 2 8.5 12 3" className="text-primary fill-primary/10" />
    <polyline points="2 8.5 12 14.5 22 8.5" className="text-primary" />
    <line x1="12" y1="21" x2="12" y2="14.5" className="text-primary" />
    <circle cx="12" cy="14.5" r="1.5" className="fill-primary text-primary" />
    <circle cx="12" cy="3" r="1.5" className="fill-primary text-primary" />
    <circle cx="2" cy="8.5" r="1.5" className="fill-primary text-primary" />
    <circle cx="22" cy="8.5" r="1.5" className="fill-primary text-primary" />
  </svg>
);

export default function LandingPage({ onLoginClick, onRegisterClick, darkMode, toggleDarkMode }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-sm">
              <SurveySyncLogo className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">SurveySync</h1>
              <p className="text-xs text-muted-foreground font-medium hidden sm:block">C.I. Mamaradlo Surveying Office</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-accent transition-colors">
              {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button onClick={onLoginClick} className="px-4 py-2 rounded-lg hover:bg-accent transition-colors font-medium">
              Login
            </button>
            <button onClick={onRegisterClick} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-accent transition-colors">
              {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-accent transition-colors text-foreground">
              {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-6 py-4 space-y-3 shadow-lg absolute w-full left-0">
            <button onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }} className="w-full text-center px-4 py-3 rounded-lg hover:bg-accent transition-colors font-medium border border-border">
              Login to Account
            </button>
            <button onClick={() => { setIsMobileMenuOpen(false); onRegisterClick(); }} className="w-full text-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
              Get Started
            </button>
          </div>
        )}
      </header>

      <main className="pt-20">
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
                Dinalupihan, Bataan, Philippines
              </div>
              <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
                Mapping the Future, Syncing Your Success.
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Professional geodetic surveying services powered by cutting-edge technology.
                From lot surveys to land titling assistance, we provide comprehensive solutions for all your surveying needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onRegisterClick} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-center">
                  Request a Survey
                </button>
                <button onClick={onLoginClick} className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium text-center">
                  Track My Request
                </button>
              </div>
              <div className="mt-8 flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm font-medium text-muted-foreground">Completed Surveys</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">15+</div>
                  <div className="text-sm font-medium text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center border border-border/50">
                <SurveySyncLogo className="size-64 text-primary/30" />
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-muted/30 py-24 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Services Offered</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Official surveying and geodetic engineering services provided by C. I. Mamaradlo Surveying Office.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Resurvey', icon: MapPin, desc: 'Verification and re-establishment of boundary lines and markers.' },
                { name: 'Relocation Survey', icon: Compass, desc: 'Precise restoration of lost or destroyed property boundary monuments.' },
                { name: 'Subdivision', icon: Layout, desc: 'Dividing a single property tract into multiple smaller lots.' },
                { name: 'Consolidation Subdivision', icon: Layers, desc: 'Combining adjoining lots and re-dividing them into new layouts.' },
                { name: 'Original Survey', icon: Map, desc: 'First official survey of a parcel of land for titling purposes.' },
                { name: 'Sketch Plan', icon: PenTool, desc: 'Preliminary visual representation and drafting of the property.' },
                { name: 'Location Plan w/ Vicinity Map', icon: FileSignature, desc: 'Detailed mapping of property location relative to its surroundings.' },
                { name: 'Subdivision Scheme', icon: Maximize, desc: 'Proposed layout and planning for dividing a larger tract of land.' },
                { name: 'Topographic Survey', icon: Mountain, desc: 'Accurate mapping of the contours, elevation, and features of the land.' }
              ].map((service, index) => (
                <div key={index} className="bg-card border border-border p-6 rounded-2xl hover:border-primary hover:shadow-md transition-all group">
                  <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                    <service.icon className="size-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{service.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}