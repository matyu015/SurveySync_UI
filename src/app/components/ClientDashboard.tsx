import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, FileText, Calendar as CalendarIcon, 
  Settings, LogOut, Search, Menu, Bell, Sun, Moon, 
  Plus, Upload, Loader2, Map, X // Added X for the modal close button
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';

interface ClientDashboardProps {
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

type Tab = 'dashboard' | 'requests' | 'vault' | 'settings';

export default function ClientDashboard({ onLogout, darkMode, toggleDarkMode }: ClientDashboardProps) {
  const { currentUser, logout } = useAuth();
  
  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [requests, setRequests] = useState<any[]>([]);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- NEW: Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyType, setSurveyType] = useState('Lot Plan / Relocation');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // 1. Fetch Real-time Data from Firebase Firestore
  useEffect(() => {
    if (!currentUser) return;

    // Fetch Survey Requests
    const qRequests = query(
      collection(db, 'requests'), 
      where('clientId', '==', currentUser.uid)
    );
    
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      const reqData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(reqData);
    });

    // Fetch Documents from Vault
    const qDocs = query(
      collection(db, 'documents'),
      where('clientId', '==', currentUser.uid)
    );

    const unsubscribeDocs = onSnapshot(qDocs, (snapshot) => {
      const docData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserDocs(docData);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeDocs();
    };
  }, [currentUser]);

  // 2. Supabase File Upload Logic
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${currentUser.uid}/${Date.now()}_${file.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public download URL from Supabase
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Save document metadata to Firebase Firestore
      await addDoc(collection(db, 'documents'), {
        clientId: currentUser.uid,
        name: file.name,
        fileUrl: publicUrlData.publicUrl,
        status: 'under_review',
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });

      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- NEW: Handle Survey Request Submission ---
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to submit a request.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'requests'), {
        clientId: currentUser.uid,
        clientEmail: currentUser.email,
        surveyType,
        location,
        notes,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      setIsModalOpen(false);
      setLocation('');
      setNotes('');
      setSurveyType('Lot Plan / Relocation');
    } catch (error) {
      console.error("Error submitting request: ", error);
      alert("Failed to submit request. Ensure ad-blockers are disabled for localhost.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Helper Functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const statusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500';
      case 'pending': return 'bg-amber-500/10 text-amber-500';
      case 'under_review': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-card border-r border-border transition-all duration-300 flex flex-col hidden md:flex`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && <span className="font-bold text-lg tracking-tight">SurveySync</span>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
            <Menu className="size-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
            { id: 'requests', icon: Map, label: 'My Surveys' },
            { id: 'vault', icon: FileText, label: 'Document Vault' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="size-5" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors">
            <LogOut className="size-5" />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-card/50 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search surveys or documents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
              {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
              {currentUser?.email?.charAt(0).toUpperCase() || 'C'}
            </div>
          </div>
        </header>

        {/* Tab Content Area */}
        <div className="p-6 overflow-auto relative">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Welcome back!</h2>
                <p className="text-muted-foreground text-sm">Here is an overview of your active projects.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Map className="size-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                    <h3 className="text-2xl font-bold">{requests.length}</h3>
                  </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CalendarIcon className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <h3 className="text-2xl font-bold">
                      {requests.filter(r => r.status?.toLowerCase() === 'completed').length}
                    </h3>
                  </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <FileText className="size-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Documents</p>
                    <h3 className="text-2xl font-bold">{userDocs.length}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">My Surveys</h2>
                {/* --- NEW: Button triggers Modal --- */}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="size-4" /> New Request
                </button>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {requests.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Map className="size-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No survey requests found.</p>
                    <p className="text-sm mt-1">Click "New Request" to get started.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-accent/50 border-b border-border text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Location</th>
                        <th className="px-6 py-3 font-medium">Date Requested</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-4 font-medium">{req.surveyType}</td>
                          <td className="px-6 py-4 text-muted-foreground">{req.location}</td>
                          <td className="px-6 py-4 text-muted-foreground">{formatDate(req.createdAt)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(req.status)}`}>
                              {req.status?.replace(/_/g, ' ') || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* --- NEW: The Popup Modal UI --- */}
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    
                    <div className="flex items-center justify-between p-6 border-b border-border">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Map className="size-5 text-primary" />
                        New Survey Request
                      </h2>
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent"
                      >
                        <X className="size-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Type of Survey</label>
                        <select 
                          value={surveyType}
                          onChange={(e) => setSurveyType(e.target.value)}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        >
                          <option value="Lot Plan / Relocation">Lot Plan / Relocation</option>
                          <option value="Topographic Survey">Topographic Survey</option>
                          <option value="Subdivision Survey">Subdivision Survey</option>
                          <option value="Consolidation Survey">Consolidation Survey</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">Property Location (Bataan)</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g., Brgy. San Ramon, Dinalupihan"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground transition-shadow"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">Additional Details (Optional)</label>
                        <textarea 
                          rows={3}
                          placeholder="Any specific instructions or landmarks?"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground resize-none transition-shadow"
                        />
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 px-4 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-xl font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:opacity-90"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Request'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENT VAULT TAB */}
          {activeTab === 'vault' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Document Vault</h2>
                <p className="text-muted-foreground text-sm">Upload and manage your required survey documents.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* File Upload Button */}
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-full min-h-[200px] bg-card rounded-xl border-2 border-dashed border-border p-6 hover:border-primary transition-colors flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-8 text-primary animate-spin" />
                        <div className="text-sm text-muted-foreground">Uploading to Secure Vault...</div>
                      </>
                    ) : (
                      <>
                        <Upload className="size-8 text-muted-foreground" />
                        <div className="text-sm font-medium">Upload New Document</div>
                        <div className="text-xs text-muted-foreground opacity-70">PDF, JPG, PNG (Max 5MB)</div>
                      </>
                    )}
                  </button>
                </div>

                {/* Render Uploaded Documents */}
                {userDocs.map(doc => (
                  <div key={doc.id} className="bg-card rounded-xl border border-border p-6 flex flex-col shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="size-6 text-primary" />
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(doc.status)}`}>
                        {doc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="mb-1 font-medium truncate" title={doc.name}>{doc.name}</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      {doc.fileSize} • Uploaded {formatDate(doc.uploadedAt)}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-border flex justify-end">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}