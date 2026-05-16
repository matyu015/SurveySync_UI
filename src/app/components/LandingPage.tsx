import { Map, MapPin, Users, FileCheck, Moon, Sun, Compass, Layout, Layers, PenTool, FileSignature, Maximize, Mountain } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Custom SurveySync Logo
const SurveySyncLogo = ({ className = "size-8" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
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
              <p className="text-xs text-muted-foreground font-medium">C.I. Mamaradlo Surveying Office</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Login
            </button>
            <button
              onClick={onRegisterClick}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
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
              <div className="flex gap-4">
                <button
                  onClick={onRegisterClick}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Request a Survey
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
                >
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
                <div>
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm font-medium text-muted-foreground">Client Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center border border-border/50">
                <SurveySyncLogo className="size-64 text-primary/30" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl border border-border shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <FileCheck className="size-5 text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Quick Processing</div>
                    <div className="text-xs text-muted-foreground">3-5 business days</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl border border-border shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Users className="size-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Licensed Experts</div>
                    <div className="text-xs text-muted-foreground">RGE Certified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- UPDATED SERVICES OFFERED SECTION --- */}
        <section id="services" className="bg-muted/30 py-24 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                Services Offered
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Official surveying and geodetic engineering services provided by C. I. Mamaradlo Surveying Office.
              </p>
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
                <div 
                  key={index} 
                  className="bg-card border border-border p-6 rounded-2xl hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                    <service.icon className="size-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{service.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose SurveySync?</h2>
            <p className="text-muted-foreground">
              Experience the difference of modern surveying technology
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Digital Document Management',
                description: 'Upload and track all your documents in one secure vault with real-time status updates.'
              },
              {
                title: 'Real-Time Tracking',
                description: 'Monitor your survey request from submission to completion with detailed status updates.'
              },
              {
                title: 'Flexible Payment Options',
                description: 'Pay via GCash, bank transfer, over-the-counter, or cash at our office.'
              },
              {
                title: 'Expert Team',
                description: 'Licensed geodetic engineers with 15+ years of experience in surveying services.'
              },
              {
                title: 'Fast Turnaround',
                description: 'Most surveys completed within 3-7 business days with quality assurance.'
              },
              {
                title: 'Secure Cloud Platform',
                description: 'Access your completed surveys anytime through our encrypted, cloud-based system.'
              }
            ].map((feature) => (
              <div key={feature.title} className="p-6 bg-card rounded-2xl border border-border">
                <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="bg-card border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                    <SurveySyncLogo className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">SurveySync</h3>
                    <p className="text-xs text-muted-foreground font-medium">by TerraLog Development</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Professional surveying services for Bataan and surrounding areas.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact Us</h4>
                <p className="text-sm text-muted-foreground mb-2">San Ramon, Dinalupihan</p>
                <p className="text-sm text-muted-foreground mb-2">2110 Bataan, Philippines</p>
                <p className="text-sm text-muted-foreground mb-2">Engr. Cris I. Mamaradlo, RGE</p>
                <p className="text-sm font-medium text-primary">0918 503 1107</p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Office Hours</h4>
                <p className="text-sm text-muted-foreground mb-2">Monday - Friday: 8AM - 5PM</p>
                <p className="text-sm text-muted-foreground mb-2">Saturday: 8AM - 12PM</p>
                <p className="text-sm text-muted-foreground">Sunday: Closed</p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground font-medium">
              © 2026 SurveySync. Developed by Baniega, Matt Edward & Gacayan, Rhic John C. (BSIT-3B, Gordon College)
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}