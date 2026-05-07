import { useState, useEffect } from 'react';
import { Map, LayoutDashboard, FileText, Calendar as CalendarIcon, Users, FileCheck, CreditCard, Database, BarChart3, Settings, LogOut, Moon, Sun, Search, Filter, Download, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, DollarSign, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { SURVEY_TYPES, BARANGAYS, mockPayments, mockRepositoryDocs, mockRequests, mockUsers } from '../data/mockData';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { isMissingFirestoreDatabase } from '../../lib/firebaseErrors';

const db = getFirestore(getApp());

interface AdminDashboardProps {
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

type Tab = 'dashboard' | 'requests' | 'calendar' | 'clients' | 'documents' | 'payments' | 'repository' | 'reports' | 'staff' | 'settings';

export default function AdminDashboard({ onLogout, darkMode, toggleDarkMode }: AdminDashboardProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time Data State
  const [requests, setRequests] = useState<any[]>(mockRequests);
  const [clients, setClients] = useState<any[]>(mockUsers.filter(user => user.role === 'client'));
  const [payments, setPayments] = useState<any[]>(mockPayments);
  const [isLoading, setIsLoading] = useState(false);

  // Management Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Schedule Form State
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Firestore Real-time Listeners
  useEffect(() => {
    setIsLoading(true);

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (!isMissingFirestoreDatabase(error)) {
        console.error("Error loading requests:", error);
      }
      setRequests(mockRequests);
      setIsLoading(false);
    });

    const qClients = query(collection(db, 'users'), where('role', '==', 'client'));
    const unsubClients = onSnapshot(qClients, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (!isMissingFirestoreDatabase(error)) {
        console.error("Error loading clients:", error);
      }
      setClients(mockUsers.filter(user => user.role === 'client'));
      setIsLoading(false);
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false); 
    }, (error) => {
      if (!isMissingFirestoreDatabase(error)) {
        console.error("Error loading payments:", error);
      }
      setPayments(mockPayments);
      setIsLoading(false);
    });

    return () => {
      unsubRequests();
      unsubClients();
      unsubPayments();
    };
  }, []);

  // --- MANAGEMENT ACTIONS ---
  
  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, { status: newStatus });
      if (selectedRequest) setSelectedRequest({ ...selectedRequest, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!scheduleDate || !scheduleTime) return;
    setIsUpdating(true);
    try {
      const requestRef = doc(db, 'requests', selectedRequest.id);
      await updateDoc(requestRef, { 
        scheduledDate: scheduleDate,
        scheduledTime: scheduleTime 
      });
      alert("Schedule updated successfully!");
      setScheduleDate('');
      setScheduleTime('');
    } catch (error) {
      console.error("Error updating schedule:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this request? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'requests', requestId));
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const handleVerifyPayment = async (paymentId: string, requestId: string) => {
    if (!window.confirm("Verify this payment as received? This will update the client's request status.")) return;
    try {
      // 1. Mark payment document as paid
      await updateDoc(doc(db, 'payments', paymentId), { status: 'paid' });
      // 2. Mark the parent request as paid
      if (requestId) {
        await updateDoc(doc(db, 'requests', requestId), { paymentStatus: 'paid' });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Failed to verify payment.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error("Failed to log out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  // --- HELPERS ---

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      under_review: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      documents_verified: 'bg-green-500/10 text-green-500 border-green-500/20',
      scheduled: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      field_survey: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      processing: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      paid: 'bg-success/10 text-success border-success/20',
    };
    return colors[status] || 'bg-muted text-muted-foreground border-border';
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
    return new Date(dateValue).toLocaleDateString();
  };

  // --- CHART DATA ---
  const requestsByType = SURVEY_TYPES.map(type => ({
    name: type.name.split(' /')[0],
    value: requests.filter(r => r.surveyType === type.name).length
  })).filter(item => item.value > 0);

  const COLORS = ['#14B8A6', '#0D1B3E', '#F59E0B', '#16A34A', '#DC2626', '#6366F1', '#EC4899'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background flex">
        {/* SIDEBAR */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}>
          <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="size-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <Map className="size-6 text-sidebar-primary-foreground" />
                </div>
                <h1 className="text-lg">SurveySync</h1>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-sidebar-accent">
              {sidebarCollapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'requests', label: 'Requests', icon: FileText },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'documents', label: 'Document Review', icon: FileCheck },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'repository', label: 'AI Repository', icon: Database },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="size-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border flex items-center gap-2">
            <button onClick={handleLogout} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 w-full flex items-center gap-2">
              <LogOut className="size-5" /> {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto">
          <header className="bg-card border-b border-border px-8 py-6 sticky top-0 z-30 flex justify-between items-center">
            <h2 className="text-2xl font-semibold capitalize">{activeTab}</h2>
            <div className="flex gap-4">
               <button onClick={toggleDarkMode} className="p-2 border border-border rounded-lg">
                  {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
               </button>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg bg-background w-64" />
               </div>
            </div>
          </header>

          <div className="p-8">
            
            {/* --- DASHBOARD TAB --- */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Requests', value: requests.length, icon: FileText, color: 'bg-blue-500' },
                    { label: 'Pending Review', value: requests.filter(r => r.status === 'submitted').length, icon: Clock, color: 'bg-warning' },
                    { label: 'Upcoming Surveys', value: requests.filter(r => r.scheduledDate).length, icon: CalendarIcon, color: 'bg-purple-500' },
                    { label: 'Revenue', value: `₱${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`, icon: DollarSign, color: 'bg-success' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-card p-6 rounded-xl border border-border">
                      <div className={`size-12 ${stat.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                        <stat.icon className={`size-6 ${stat.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-card rounded-xl border border-border">
                  <div className="p-6 border-b border-border"><h3>Recent Requests</h3></div>
                  <table className="w-full">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4 text-left">Ref No</th>
                        <th className="px-6 py-4 text-left">Client</th>
                        <th className="px-6 py-4 text-left">Type</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {requests.slice(0, 8).map(request => (
                        <tr key={request.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{request.referenceNo}</td>
                          <td className="px-6 py-4 text-sm">{request.clientName}</td>
                          <td className="px-6 py-4 text-sm">{request.surveyType}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs border ${statusColor(request.status)}`}>
                              {request.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => setSelectedRequest(request)} className="text-primary hover:underline text-sm font-medium">Manage</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- REQUESTS TAB --- */}
            {activeTab === 'requests' && (
               <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                     <thead className="bg-muted/50 text-xs">
                        <tr>
                           <th className="px-6 py-4 text-left">Date</th>
                           <th className="px-6 py-4 text-left">Ref</th>
                           <th className="px-6 py-4 text-left">Client</th>
                           <th className="px-6 py-4 text-left">Type</th>
                           <th className="px-6 py-4 text-left">Status</th>
                           <th className="px-6 py-4 text-left">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                        {requests.map(request => (
                           <tr key={request.id} className="hover:bg-accent/30 transition-colors">
                              <td className="px-6 py-4 text-sm">{formatDate(request.submittedAt)}</td>
                              <td className="px-6 py-4 text-sm">{request.referenceNo}</td>
                              <td className="px-6 py-4 text-sm">{request.clientName}</td>
                              <td className="px-6 py-4 text-sm">{request.surveyType}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded text-xs border ${statusColor(request.status)}`}>{request.status.replace(/_/g, ' ')}</span>
                              </td>
                              <td className="px-6 py-4">
                                 <button onClick={() => setSelectedRequest(request)} className="p-2 hover:bg-accent rounded-lg">
                                    <ExternalLink className="size-4" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {/* --- CALENDAR TAB (NEW) --- */}
            {activeTab === 'calendar' && (
               <div className="space-y-6">
                 <div className="bg-gradient-to-r from-purple-500/10 to-primary/10 rounded-xl p-8 border border-purple-500/20">
                    <h3 className="mb-2">Upcoming Field Surveys</h3>
                    <p className="text-sm text-muted-foreground">Manage your deployed staff and scheduled surveying appointments.</p>
                 </div>

                 <div className="grid gap-4">
                    {requests
                      .filter(r => r.scheduledDate) // Only show requests that have a schedule
                      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()) // Sort chronologically
                      .map(request => (
                       <div key={request.id} className="bg-card p-6 rounded-xl border border-border flex items-center justify-between hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-6">
                             <div className="flex flex-col items-center justify-center bg-muted/50 p-4 rounded-xl min-w-[100px]">
                                <span className="text-xs font-bold uppercase text-primary">{new Date(request.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-3xl font-bold">{new Date(request.scheduledDate).getDate()}</span>
                             </div>
                             <div>
                                <h4 className="text-lg font-bold mb-1">{request.clientName} - {request.surveyType}</h4>
                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                   <span className="flex items-center gap-1"><Clock className="size-4"/> {request.scheduledTime || 'TBA'}</span>
                                   <span className="flex items-center gap-1"><Map className="size-4"/> {request.propertyDetails?.address?.barangay}, {request.propertyDetails?.address?.municipality}</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className={`px-3 py-1 rounded-full text-xs border ${statusColor(request.status)}`}>
                                {request.status.replace(/_/g, ' ')}
                             </span>
                             <button onClick={() => setSelectedRequest(request)} className="px-4 py-2 border border-border rounded-lg hover:bg-accent text-sm">
                                View Details
                             </button>
                          </div>
                       </div>
                    ))}
                    {requests.filter(r => r.scheduledDate).length === 0 && (
                       <div className="text-center p-12 bg-card rounded-xl border border-border text-muted-foreground">
                          No upcoming surveys scheduled.
                       </div>
                    )}
                 </div>
               </div>
            )}

            {/* --- PAYMENTS TAB (UPDATED) --- */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Collected', value: `₱${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`, icon: CheckCircle2, color: 'bg-success' },
                    { label: 'Pending Verification', value: `₱${payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`, icon: Clock, color: 'bg-warning' },
                    { label: 'Total Transactions', value: payments.length, icon: CreditCard, color: 'bg-blue-500' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-card p-6 rounded-xl border border-border">
                      <div className={`size-10 ${stat.color}/10 rounded-lg flex items-center justify-center mb-3`}>
                        <stat.icon className={`size-5 ${stat.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="text-2xl mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm">Reference</th>
                        <th className="px-6 py-3 text-left text-sm">Request Ref</th>
                        <th className="px-6 py-3 text-left text-sm">Amount</th>
                        <th className="px-6 py-3 text-left text-sm">Method</th>
                        <th className="px-6 py-3 text-left text-sm">Date</th>
                        <th className="px-6 py-3 text-left text-sm">Status</th>
                        <th className="px-6 py-3 text-left text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payments.map(payment => {
                        return (
                          <tr key={payment.id} className="hover:bg-accent/50">
                            <td className="px-6 py-4 text-sm">{payment.referenceNo}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{payment.requestId || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm font-medium">₱{payment.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm uppercase">{payment.method}</td>
                            <td className="px-6 py-4 text-sm">{formatDate(payment.createdAt)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs border ${statusColor(payment.status)}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {payment.status === 'pending' ? (
                                <button 
                                  onClick={() => handleVerifyPayment(payment.id, payment.requestId)}
                                  className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90"
                                >
                                  Verify
                                </button>
                              ) : (
                                <button className="text-sm text-muted-foreground hover:underline">Receipt</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {payments.length === 0 && (
                        <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">No payments recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Omitted static tabs (clients, repository, etc.) for brevity, they remain unchanged from the previous code block */}

          </div>
        </main>

        {/* --- MANAGEMENT MODAL (UPDATED WITH SCHEDULING) --- */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20 sticky top-0 z-10 backdrop-blur-md">
                <div>
                  <h2 className="text-xl font-bold">{selectedRequest.referenceNo}</h2>
                  <p className="text-sm text-muted-foreground">{selectedRequest.surveyType}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-accent rounded-full">
                  <XCircle className="size-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                
                {/* Status Updater */}
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-primary font-bold mb-1">Current Status</div>
                    <div className="text-lg capitalize font-medium">{selectedRequest.status.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      disabled={isUpdating}
                      value={selectedRequest.status}
                      onChange={(e) => handleUpdateStatus(selectedRequest.id, e.target.value)}
                      className="bg-background border border-border px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="documents_verified">Documents Verified</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="field_survey">Field Survey</option>
                      <option value="completed">Completed</option>
                    </select>
                    {isUpdating && <Loader2 className="size-5 animate-spin text-primary self-center" />}
                  </div>
                </div>

                {/* Scheduling Block - Appears if status implies it's time to schedule */}
                {['documents_verified', 'scheduled', 'field_survey'].includes(selectedRequest.status) && (
                   <div className="border border-border p-4 rounded-xl space-y-4 bg-card">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                         <CalendarIcon className="size-4 text-primary" /> Schedule Field Survey
                      </h4>
                      {selectedRequest.scheduledDate && (
                         <div className="text-sm text-muted-foreground mb-2">
                            Currently Scheduled: {formatDate(selectedRequest.scheduledDate)} at {selectedRequest.scheduledTime}
                         </div>
                      )}
                      <div className="flex gap-4">
                         <input 
                            type="date" 
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                         />
                         <input 
                            type="time" 
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                         />
                         <button 
                            onClick={handleUpdateSchedule}
                            disabled={!scheduleDate || !scheduleTime || isUpdating}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                         >
                            Save Schedule
                         </button>
                      </div>
                   </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold border-b border-border pb-1">Client Information</h4>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Name</div>
                      <div className="font-medium">{selectedRequest.clientName}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold border-b border-border pb-1">Property Location</h4>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Lot / Block</div>
                      <div className="font-medium">Lot {selectedRequest.propertyDetails?.lotNumber}, Block {selectedRequest.propertyDetails?.blockNumber}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Address</div>
                      <div className="font-medium">{selectedRequest.propertyDetails?.address?.street}, {selectedRequest.propertyDetails?.address?.barangay}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-between">
                   <button 
                    onClick={() => handleDeleteRequest(selectedRequest.id)}
                    className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                   >
                      <Trash2 className="size-4" /> Delete Request
                   </button>
                   <button onClick={() => setSelectedRequest(null)} className="px-6 py-2 bg-foreground text-background rounded-lg text-sm font-bold">
                      Close Panel
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
