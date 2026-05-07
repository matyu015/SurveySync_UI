import { Map, MapPin, Users, FileCheck, Moon, Sun } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function LandingPage({ onLoginClick, onRegisterClick, darkMode, toggleDarkMode }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
              <Map className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">SurveySync</h1>
              <p className="text-xs text-muted-foreground">C.I. Mamaradlo Surveying Office</p>
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
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
              <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm mb-4">
                Dinalupihan, Bataan, Philippines
              </div>
              <h1 className="text-5xl mb-4">
                Mapping the Future, Syncing Your Success.
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Professional geodetic surveying services powered by cutting-edge technology.
                From lot surveys to land titling assistance, we provide comprehensive solutions for all your surveying needs.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={onRegisterClick}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Request a Survey
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Track My Request
                </button>
              </div>
              <div className="mt-8 flex gap-8">
                <div>
                  <div className="text-3xl text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Completed Surveys</div>
                </div>
                <div>
                  <div className="text-3xl text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div>
                  <div className="text-3xl text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center">
                <MapPin className="size-64 text-primary/30" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl border border-border shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <FileCheck className="size-5 text-success" />
                  </div>
                  <div>
                    <div className="text-sm">Quick Processing</div>
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
                    <div className="text-sm">Licensed Experts</div>
                    <div className="text-xs text-muted-foreground">RGE Certified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl mb-3">Our Services</h2>
              <p className="text-muted-foreground">
                Comprehensive surveying solutions for every property need
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'Lot Survey', price: '₱3,500+', icon: MapPin },
                { name: 'Subdivision', price: '₱15,000+', icon: Map },
                { name: 'Topographic', price: '₱8,000+', icon: FileCheck },
                { name: 'Land Titling', price: '₱10,000+', icon: Users }
              ].map((service) => (
                <div key={service.name} className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-colors">
                  <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="mb-2">{service.name}</h3>
                  <div className="text-sm text-muted-foreground mb-3">Starting from</div>
                  <div className="text-2xl text-primary">{service.price}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3">Why Choose SurveySync?</h2>
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
                title: 'AI-Powered Repository',
                description: 'Access your completed surveys anytime through our intelligent document search system.'
              }
            ].map((feature) => (
              <div key={feature.title} className="p-6">
                <h3 className="mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="bg-card border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
                    <Map className="size-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm">SurveySync</h3>
                    <p className="text-xs text-muted-foreground">by TerraLog Development</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Professional surveying services for Bataan and surrounding areas.
                </p>
              </div>
              <div>
                <h4 className="mb-3">Contact Us</h4>
                <p className="text-sm text-muted-foreground mb-1">4 San Ramon, Dinalupihan</p>
                <p className="text-sm text-muted-foreground mb-1">2110 Bataan, Philippines</p>
                <p className="text-sm text-muted-foreground">Engr. Cris I. Mamaradlo, RGE</p>
              </div>
              <div>
                <h4 className="mb-3">Office Hours</h4>
                <p className="text-sm text-muted-foreground mb-1">Monday - Friday: 8AM - 5PM</p>
                <p className="text-sm text-muted-foreground mb-1">Saturday: 8AM - 12PM</p>
                <p className="text-sm text-muted-foreground">Sunday: Closed</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
              © 2026 SurveySync. Developed by Baniega, Matt Edward & Gacayan, Rhic John C. (BSIT-3B, Gordon College)
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
