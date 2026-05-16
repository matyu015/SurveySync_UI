import { useState, useEffect, useRef } from 'react';
import { Map, LayoutDashboard, FileText, Calendar as CalendarIcon, Users, FileCheck, CreditCard, BarChart3, Settings, LogOut, Moon, Sun, Search, Filter, Download, ChevronLeft, ChevronRight, CheckCircle2, XCircle, X, Clock, AlertCircle, TrendingUp, Loader2, Trash2, ExternalLink, Bell, Edit, Menu, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { SURVEY_TYPES, BARANGAYS, mockPayments, mockRequests, mockUsers } from '../data/mockData';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc, addDoc, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { isMissingFirestoreDatabase } from '../../lib/firebaseErrors';
import { addLocalDoc, deleteLocalDoc, getLocalCollection, mergeLocalDocuments, subscribeLocalCollection, updateLocalDoc } from '../../lib/localStore';
import { supabase } from '../../lib/supabase';
import MonthCalendar, { formatDateKey } from './MonthCalendar';

const db = getFirestore(getApp());

// Custom bulletproof Peso Icon
const PesoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 11H4" />
    <path d="M20 15H4" />
    <path d="M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v17" />
    <path d="M7 11h6a4 4 0 0 0 0-8H7" />
  </svg>
);

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

interface AdminDashboardProps {
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

type Tab = 'dashboard' | 'requests' | 'calendar' | 'clients' | 'documents' | 'payments' | 'reports' | 'staff' | 'settings';

export default function AdminDashboard({ onLogout, darkMode, toggleDarkMode }: AdminDashboardProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time Data State
  const [requests, setRequests] = useState<any[]>(mockRequests);
  const [clients, setClients] = useState<any[]>(mockUsers.filter(user => user.role === 'client'));
  const [payments, setPayments] = useState<any[]>(mockPayments);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adminCalendarMonth, setAdminCalendarMonth] = useState(new Date());

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);

  // Management Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  
  // Schedule Form State
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [availabilityStartTime, setAvailabilityStartTime] = useState('09:00');
  const [availabilityEndTime, setAvailabilityEndTime] = useState('10:00');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'unavailable'>('available');
  const [availabilityNote, setAvailabilityNote] = useState('');
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  // Document Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadDocRequestId, setUploadDocRequestId] = useState('');

  // Firestore Listeners
  useEffect(() => {
    setIsLoading(true);

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      setRequests(mergeLocalDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), getLocalCollection('requests')));
    }, (error) => {
      if (!isMissingFirestoreDatabase(error)) console.error("Error loading requests:", error);
      setRequests(mergeLocalDocuments(mockRequests, getLocalCollection('requests')));
      setIsLoading(false);
    });

    const qClients = query(collection(db, 'users'), where('role', '==', 'client'));
    const unsubClients = onSnapshot(qClients, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (!isMissingFirestoreDatabase(error)) console.error("Error loading clients:", error);
      setClients(mockUsers.filter(user => user.role === 'client'));
      setIsLoading(false);
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      setPayments(mergeLocalDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), getLocalCollection('payments')));
      setIsLoading(false); 
    }, (error) => {
      if (!isMissingFirestoreDatabase(error)) console.error("Error loading payments:", error);
      setPayments(mergeLocalDocuments(mockPayments, getLocalCollection('payments')));
      setIsLoading(false);
    });

    const unsubAvailability = onSnapshot(collection(db, 'availability'), (snapshot) => {
      setAvailabilitySlots(mergeLocalDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), getLocalCollection('availability')));
    }, (error) => {
      if (!isMissingFirestoreDatabase(error)) console.error("Error loading availability:", error);
      setAvailabilitySlots(getLocalCollection('availability'));
    });

    // NEW: Listen for all documents
    const unsubDocs = onSnapshot(collection(db, 'documents'), (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error loading documents:", error);
    });

    return () => {
      unsubRequests();
      unsubClients();
      unsubPayments();
      unsubAvailability();
      unsubDocs();
    };
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      setIsEditingSchedule(false);
      setScheduleDate(selectedRequest.scheduledDate || '');
      setScheduleTime(selectedRequest.scheduledTime || '');
    }
  }, [selectedRequest]);

  // --- HELPER: GET REAL CLIENT NAME ---
  const getClientName = (clientId: string, fallbackName: string) => {
    if (!clientId) return fallbackName;
    const clientUser = clients.find(c => c.id === clientId || c.uid === clientId);
    if (clientUser) {
      return clientUser.fullName || clientUser.name || (clientUser.firstName && clientUser.lastName ? `${clientUser.firstName} ${clientUser.lastName}` : null) || clientUser.displayName || fallbackName;
    }
    return fallbackName;
  };

  // --- NOTIFICATION LOGIC ---
  const pendingRequests = requests.filter(r => r.status === 'submitted' || r.status === 'under_review');
  const pendingPaymentList = payments.filter(p => p.status === 'pending');
  const totalNotifications = pendingRequests.length + pendingPaymentList.length;

  const notificationItems = [
    ...pendingRequests.map(r => ({
      id: r.id,
      type: 'request',
      title: 'New Survey Request',
      desc: `${getClientName(r.clientId, r.clientName)} submitted a ${r.surveyType}`,
      date: r.submittedAt || r.createdAt || new Date().toISOString(),
      ref: r.referenceNo
    })),
    ...pendingPaymentList.map(p => ({
      id: p.id,
      type: 'payment',
      title: 'Payment Verification',
      desc: `${getClientName(p.clientId, p.clientName)} submitted a payment of ₱${p.amount.toLocaleString()}`,
      date: p.createdAt || new Date().toISOString(),
      ref: p.referenceNo
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleNotificationClick = (item: any) => {
    setShowNotifications(false);
    if (item.type === 'request') {
      setActiveTab('requests');
      const req = requests.find(r => r.id === item.id);
      if (req) setSelectedRequest(req);
    } else if (item.type === 'payment') {
      setActiveTab('payments');
    }
  };

  // --- ADMIN FILE UPLOAD LOGIC ---
  const handleAdminFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!uploadDocRequestId) {
      alert("Please select a specific survey request from the dropdown first.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingDoc(true);
    try {
      const selectedReq = requests.find(r => r.id === uploadDocRequestId);
      if (!selectedReq) throw new Error("Request not found");

      const fileName = `admin_uploads/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      await addDoc(collection(db, 'documents'), {
        requestId: selectedReq.id,
        requestRef: selectedReq.referenceNo,
        clientId: selectedReq.clientId,
        clientName: selectedReq.clientName,
        uploadedBy: 'admin',
        name: file.name,
        fileUrl: publicUrlData.publicUrl,
        status: 'verified', // Admin uploads are automatically verified
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });

      alert("Official document uploaded successfully! The client can now see it in their Vault.");
      setUploadDocRequestId('');
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document.");
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateDocStatus = async (docId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'documents', docId), { status: newStatus });
    } catch (error) {
      console.error("Error updating document status:", error);
      alert("Failed to update status.");
    }
  };


  // --- ACTIONS ---
  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      if (requestId.startsWith('local-')) {
        updateLocalDoc('requests', requestId, { status: newStatus });
      } else {
        await updateDoc(doc(db, 'requests', requestId), { status: newStatus });
      }
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
      const scheduleUpdate = { 
        scheduledDate: scheduleDate,
        scheduledTime: scheduleTime,
        status: 'scheduled',
      };
      if (selectedRequest._localOnly) {
        updateLocalDoc('requests', selectedRequest.id, scheduleUpdate);
      } else {
        await updateDoc(doc(db, 'requests', selectedRequest.id), scheduleUpdate);
      }
      if (selectedRequest) {
        setSelectedRequest({
          ...selectedRequest,
          ...scheduleUpdate
        });
      }
      setIsEditingSchedule(false);
    } catch (error) {
      console.error("Error updating schedule:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this request? This cannot be undone.")) return;
    try {
      if (requestId.startsWith('local-')) {
        deleteLocalDoc('requests', requestId);
      } else {
        await deleteDoc(doc(db, 'requests', requestId));
      }
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to cancel this request? This will mark it as Cancelled.")) return;
    setIsUpdating(true);
    try {
      if (requestId.startsWith('local-')) {
        updateLocalDoc('requests', requestId, { status: 'cancelled' });
      } else {
        await updateDoc(doc(db, 'requests', requestId), { status: 'cancelled' });
      }
      if (selectedRequest) setSelectedRequest({ ...selectedRequest, status: 'cancelled' });
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("Failed to cancel request.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, requestId: string) => {
    if (!window.confirm("Verify this payment as received? This will update the client's request status.")) return;
    try {
      if (paymentId.startsWith('local-')) {
        updateLocalDoc('payments', paymentId, { status: 'paid', paidAt: new Date().toISOString() });
      } else {
        await updateDoc(doc(db, 'payments', paymentId), { status: 'paid', paidAt: new Date().toISOString() });
      }
      if (requestId) {
        if (requestId.startsWith('local-')) {
          updateLocalDoc('requests', requestId, { paymentStatus: 'paid' });
        } else {
          await updateDoc(doc(db, 'requests', requestId), { paymentStatus: 'paid' });
        }
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Failed to verify payment.");
    }
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availabilityDate || !availabilityStartTime || !availabilityEndTime) return;

    setIsSavingAvailability(true);
    try {
      const payload = {
        date: availabilityDate,
        startTime: availabilityStartTime,
        endTime: availabilityEndTime,
        status: availabilityStatus,
        note: availabilityNote,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'availability'), payload);
      setAvailabilityNote('');
    } catch (error) {
      console.error("Error saving availability:", error);
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleSetDateAvailability = async (dateKey: string, status: 'available' | 'unavailable') => {
    setAvailabilityDate(dateKey);
    setIsSavingAvailability(true);
    try {
      await addDoc(collection(db, 'availability'), {
        date: dateKey,
        startTime: availabilityStartTime,
        endTime: availabilityEndTime,
        status,
        note: availabilityNote || (status === 'available' ? 'Open for booking' : 'Unavailable'),
        createdAt: new Date().toISOString(),
      });
      setAvailabilityStatus(status);
      setAvailabilityNote('');
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleDeleteAvailability = async (slotId: string) => {
    if (!window.confirm("Remove this calendar slot?")) return;
    try {
      if (slotId.startsWith('local-')) {
        deleteLocalDoc('availability', slotId);
      } else {
        await deleteDoc(doc(db, 'availability', slotId));
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      under_review: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      documents_verified: 'bg-green-500/10 text-green-500 border-green-500/20',
      scheduled: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      field_survey: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      paid: 'bg-success/10 text-success border-success/20',
      available: 'bg-success/10 text-success border-success/20',
      unavailable: 'bg-destructive/10 text-destructive border-destructive/20',
      booked: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
      verified: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || 'bg-muted text-muted-foreground border-border';
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
    return new Date(dateValue).toLocaleDateString();
  };

  const formatSlotTime = (slot: any) => {
    if (!slot?.startTime) return 'Time TBA';
    return slot.endTime ? `${slot.startTime} - ${slot.endTime}` : slot.startTime;
  };

  const sortedAvailability = [...availabilitySlots].sort((a, b) => {
    const aTime = `${a.date || ''}T${a.startTime || '00:00'}`;
    const bTime = `${b.date || ''}T${b.startTime || '00:00'}`;
    return aTime.localeCompare(bTime);
  });

  const getAdminDayState = (dateKey: string) => {
    const slots = availabilitySlots.filter(slot => slot.date === dateKey);
    const scheduledCount = requests.filter(request => request.scheduledDate === dateKey).length;
    const availableCount = slots.filter(slot => slot.status === 'available').length;
    const unavailableCount = slots.filter(slot => slot.status === 'unavailable').length;
    const bookedCount = slots.filter(slot => slot.status === 'booked').length;

    if (bookedCount || scheduledCount) return { status: 'booked' as const, label: `${bookedCount + scheduledCount} booked` };
    if (availableCount && unavailableCount) return { status: 'mixed' as const, label: `${availableCount} open, ${unavailableCount} blocked` };
    if (availableCount) return { status: 'available' as const, label: `${availableCount} available` };
    if (unavailableCount) return { status: 'unavailable' as const, label: 'Unavailable' };
    return undefined;
  };

  const selectedAvailabilitySlots = sortedAvailability.filter(slot => slot.date === availabilityDate);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background flex text-foreground">
        
        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* RESPONSIVE SIDEBAR: Fully visible on desktop, slides off-canvas on mobile */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 w-64
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}>
          <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-sidebar-primary/10 border border-sidebar-primary/20 rounded-xl flex items-center justify-center shadow-sm">
                <SurveySyncLogo className="size-6 text-sidebar-primary" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                SurveySync
              </h1>
            </div>
            {/* Close button only visible on mobile inside the sidebar */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-2 rounded-lg hover:bg-sidebar-accent md:hidden text-sidebar-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'requests', label: 'Requests', icon: FileText },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'documents', label: 'Document Review', icon: FileCheck },
              { id: 'payments', label: 'Payments', icon: CreditCard },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="size-5 flex-shrink-0" />
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border flex items-center gap-2">
            <button onClick={handleLogout} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 w-full flex items-center gap-3">
              <LogOut className="size-5 flex-shrink-0" /> 
              <span className="whitespace-nowrap">Logout</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto relative min-w-0">
          <header className="bg-card border-b border-border px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-30 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Hamburger Menu - Only visible on mobile/minimized screens */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-accent text-foreground">
                <Menu className="size-6" />
              </button>
              <h2 className="text-xl sm:text-2xl font-semibold capitalize">{activeTab.replace('_', ' ')}</h2>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
               {/* --- NOTIFICATION BELL --- */}
               <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 border border-border rounded-lg relative hover:bg-accent transition-colors"
                  >
                    <Bell className="size-5" />
                    {totalNotifications > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-card">
                        {totalNotifications > 99 ? '99+' : totalNotifications}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-border bg-muted/30 font-semibold flex justify-between items-center">
                        Notifications
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{totalNotifications} new</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-border">
                        {notificationItems.length > 0 ? (
                          notificationItems.map(item => (
                            <div 
                              key={`${item.type}-${item.id}`} 
                              onClick={() => handleNotificationClick(item)}
                              className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                            >
                              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{item.title} • {item.ref}</div>
                              <div className="text-sm font-medium leading-snug">{item.desc}</div>
                              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="size-3" />
                                {new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                            <CheckCircle2 className="size-8 opacity-20" />
                            You're all caught up!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
               </div>

               <button onClick={toggleDarkMode} className="p-2 border border-border rounded-lg hidden sm:block">
                  {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
               </button>
               <div className="relative hidden lg:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg bg-background w-64" />
               </div>
            </div>
          </header>

          <div className="p-4 sm:p-8">
            
            {/* --- DASHBOARD TAB --- */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Requests', value: requests.length, icon: FileText, color: 'bg-blue-500' },
                    { label: 'Pending Review', value: pendingRequests.length, icon: Clock, color: 'bg-warning' },
                    { label: 'Upcoming Surveys', value: requests.filter(r => r.scheduledDate).length, icon: CalendarIcon, color: 'bg-purple-500' },
                    { label: 'Revenue', value: `₱${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`, icon: PesoIcon, color: 'bg-success' }
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

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-6 border-b border-border"><h3 className="font-bold">Recent Requests</h3></div>
                  <div className="overflow-x-auto">
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
                            <td className="px-6 py-4 text-sm">{getClientName(request.clientId, request.clientName)}</td>
                            <td className="px-6 py-4 text-sm">{request.surveyType}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs border ${statusColor(request.status)}`}>
                                {request.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => setSelectedRequest(request)} 
                                className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --- REQUESTS TAB --- */}
            {activeTab === 'requests' && (
               <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[600px]">
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
                              <td className="px-6 py-4 text-sm">{getClientName(request.clientId, request.clientName)}</td>
                              <td className="px-6 py-4 text-sm">{request.surveyType}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded text-xs border ${statusColor(request.status)}`}>{request.status.replace(/_/g, ' ')}</span>
                              </td>
                              <td className="px-6 py-4">
                                 <button onClick={() => setSelectedRequest(request)} className="p-2 hover:bg-accent rounded-lg border border-border">
                                    <ExternalLink className="size-4" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {/* --- DOCUMENTS TAB (NEW) --- */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Document Review</h2>
                    <p className="text-sm text-muted-foreground">Manage client requirements and upload official survey results.</p>
                  </div>
                </div>

                <div className="grid xl:grid-cols-[1fr_2fr] gap-6">
                  {/* Admin Upload Section */}
                  <div className="bg-card rounded-xl border border-border p-6 space-y-5 h-fit">
                    <div>
                      <h3 className="font-semibold">Upload Survey Result</h3>
                      <p className="text-sm text-muted-foreground mt-1">Upload approved plans or final documents for a client's request.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Select Request</label>
                        <select
                          value={uploadDocRequestId}
                          onChange={(e) => setUploadDocRequestId(e.target.value)}
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">-- Select Scheduled/Completed Request --</option>
                          {requests.filter(r => r.status === 'scheduled' || r.status === 'field_survey' || r.status === 'completed').map(r => (
                            <option key={r.id} value={r.id}>
                              {r.referenceNo} - {getClientName(r.clientId, r.clientName)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAdminFileUpload}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingDoc || !uploadDocRequestId}
                          className="w-full h-32 bg-background rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploadingDoc ? (
                            <>
                              <Loader2 className="size-6 text-primary animate-spin" />
                              <span className="text-sm">Uploading securely...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="size-6 text-muted-foreground" />
                              <span className="text-sm font-medium">Click to Upload File</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Documents Table */}
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-5 border-b border-border flex justify-between items-center">
                       <h3 className="font-semibold">All Documents</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                          <tr>
                            <th className="px-5 py-3 text-left">File Name</th>
                            <th className="px-5 py-3 text-left">Uploaded By</th>
                            <th className="px-5 py-3 text-left">Related Request</th>
                            <th className="px-5 py-3 text-left">Date</th>
                            <th className="px-5 py-3 text-left">Status</th>
                            <th className="px-5 py-3 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).map(docItem => (
                            <tr key={docItem.id} className="hover:bg-accent/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <FileText className="size-5 text-primary" />
                                  <div className="font-medium text-sm truncate max-w-[150px] lg:max-w-[200px]" title={docItem.name}>{docItem.name}</div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm">
                                {docItem.uploadedBy === 'admin' ? (
                                  <span className="text-primary font-bold">Admin</span>
                                ) : (
                                  getClientName(docItem.clientId, docItem.clientName)
                                )}
                              </td>
                              <td className="px-5 py-4 text-sm text-muted-foreground">
                                 {docItem.requestRef || 'General Vault'}
                              </td>
                              <td className="px-5 py-4 text-sm">{formatDate(docItem.uploadedAt)}</td>
                              <td className="px-5 py-4">
                                <select
                                  value={docItem.status}
                                  onChange={(e) => handleUpdateDocStatus(docItem.id, e.target.value)}
                                  disabled={docItem.uploadedBy === 'admin'}
                                  className={`text-xs px-2 py-1 rounded-full border outline-none font-medium ${statusColor(docItem.status)} ${docItem.uploadedBy === 'admin' ? 'appearance-none bg-transparent cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                                >
                                  <option value="under_review">Under Review</option>
                                  <option value="verified">Verified</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </td>
                              <td className="px-5 py-4">
                                <a 
                                  href={docItem.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors inline-block whitespace-nowrap"
                                >
                                  View File
                                </a>
                              </td>
                            </tr>
                          ))}
                          {documents.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No documents uploaded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- CALENDAR TAB --- */}
            {activeTab === 'calendar' && (
               <div className="space-y-6">
                 <div className="grid xl:grid-cols-[1.4fr_0.8fr] gap-6">
                    <MonthCalendar
                      month={adminCalendarMonth}
                      onMonthChange={setAdminCalendarMonth}
                      selectedDate={availabilityDate}
                      getDayState={getAdminDayState}
                      onSelectDate={setAvailabilityDate}
                    />

                    <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                      <div>
                        <h3 className="font-semibold">Set Availability</h3>
                        <p className="text-sm text-muted-foreground mt-1">Pick a date on the month view, then mark it available or unavailable.</p>
                      </div>

                      <form onSubmit={handleAddAvailability} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Selected Date</label>
                          <input
                            type="date"
                            value={availabilityDate}
                            onChange={(e) => setAvailabilityDate(e.target.value)}
                            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1.5">Start</label>
                            <input
                              type="time"
                              value={availabilityStartTime}
                              onChange={(e) => setAvailabilityStartTime(e.target.value)}
                              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">End</label>
                            <input
                              type="time"
                              value={availabilityEndTime}
                              onChange={(e) => setAvailabilityEndTime(e.target.value)}
                              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Note</label>
                          <input
                            type="text"
                            value={availabilityNote}
                            onChange={(e) => setAvailabilityNote(e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            disabled={!availabilityDate || isSavingAvailability}
                            onClick={() => handleSetDateAvailability(availabilityDate, 'available')}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            Available
                          </button>
                          <button
                            type="button"
                            disabled={!availabilityDate || isSavingAvailability}
                            onClick={() => handleSetDateAvailability(availabilityDate, 'unavailable')}
                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50"
                          >
                            Unavailable
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={!availabilityDate || isSavingAvailability}
                          className="w-full px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {isSavingAvailability ? 'Saving...' : `Add ${availabilityStatus} slot`}
                        </button>
                      </form>

                      <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-semibold mb-3">Selected Date Slots</h4>
                        <div className="space-y-2">
                          {selectedAvailabilitySlots.map(slot => (
                            <div key={slot.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                              <div>
                                <div className="text-sm font-medium">{formatSlotTime(slot)}</div>
                                <div className="text-xs text-muted-foreground">{slot.note || slot.status}</div>
                              </div>
                              <button onClick={() => handleDeleteAvailability(slot.id)} className="text-xs text-destructive hover:underline">
                                Remove
                              </button>
                            </div>
                          ))}
                          {selectedAvailabilitySlots.length === 0 && (
                            <div className="text-sm text-muted-foreground">No slots on this date.</div>
                          )}
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="grid xl:grid-cols-[1fr_1fr] gap-6">
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="p-5 border-b border-border">
                        <h3 className="font-semibold">Availability Calendar</h3>
                      </div>
                      <div className="divide-y divide-border">
                        {sortedAvailability.map(slot => (
                          <div key={slot.id} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center justify-center bg-muted/50 p-3 rounded-xl min-w-[82px]">
                                <span className="text-xs font-bold uppercase text-primary">{slot.date ? new Date(slot.date).toLocaleString('default', { month: 'short' }) : 'TBA'}</span>
                                <span className="text-2xl font-bold">{slot.date ? new Date(slot.date).getDate() : '--'}</span>
                              </div>
                              <div>
                                <div className="font-medium">{formatSlotTime(slot)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {slot.status === 'booked' ? `Booked by ${getClientName(slot.bookedBy, slot.clientName) || 'client'}` : slot.note || 'No note'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs border ${statusColor(slot.status)}`}>
                                {slot.status}
                              </span>
                              <button
                                onClick={() => handleDeleteAvailability(slot.id)}
                                className="px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        {sortedAvailability.length === 0 && (
                          <div className="text-center p-10 text-muted-foreground">No availability slots yet.</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="p-5 border-b border-border">
                        <h3 className="font-semibold">Booked Field Surveys</h3>
                      </div>
                      <div className="divide-y divide-border">
                        {requests
                          .filter(r => r.scheduledDate)
                          .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                          .map(request => (
                           <div key={request.id} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="flex flex-col items-center justify-center bg-muted/50 p-3 rounded-xl min-w-[82px]">
                                    <span className="text-xs font-bold uppercase text-primary">{new Date(request.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-2xl font-bold">{new Date(request.scheduledDate).getDate()}</span>
                                 </div>
                                 <div>
                                    <h4 className="font-bold mb-1">{getClientName(request.clientId, request.clientName)} - {request.surveyType}</h4>
                                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                                       <span className="flex items-center gap-1"><Clock className="size-4"/> {request.scheduledTime || 'TBA'}</span>
                                       <span className="flex items-center gap-1"><Map className="size-4"/> {request.location || request.propertyDetails?.address?.street || 'Bataan'}</span>
                                    </div>
                                 </div>
                              </div>
                              <button onClick={() => setSelectedRequest(request)} className="px-4 py-2 border border-border rounded-lg hover:bg-accent text-sm">
                                 View Details
                              </button>
                           </div>
                        ))}
                        {requests.filter(r => r.scheduledDate).length === 0 && (
                           <div className="text-center p-10 text-muted-foreground">No booked surveys yet.</div>
                        )}
                      </div>
                    </div>
                 </div>
               </div>
            )}

            {/* --- PAYMENTS TAB --- */}
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

                <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[700px]">
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
                            <td className="px-6 py-4 text-sm text-muted-foreground">{payment.requestRef || payment.requestId || 'N/A'}</td>
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
            
          </div>
        </main>

        {/* --- MANAGEMENT MODAL --- */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-muted/20 sticky top-0 z-10 backdrop-blur-md">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">{selectedRequest.referenceNo}</h2>
                  <p className="text-sm text-muted-foreground">{selectedRequest.surveyType}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-accent rounded-full">
                  <XCircle className="size-6" />
                </button>
              </div>

              <div className="p-4 sm:p-8 space-y-6">
                
                {/* Status Updater & Quick Actions */}
                <div className="space-y-3">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase text-primary font-bold mb-1">Current Status</div>
                      <div className="text-lg capitalize font-medium">{selectedRequest.status.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        disabled={isUpdating}
                        value={selectedRequest.status}
                        onChange={(e) => handleUpdateStatus(selectedRequest.id, e.target.value)}
                        className="bg-background border border-border px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="documents_verified">Documents Verified</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="field_survey">Field Survey</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {isUpdating && <Loader2 className="size-5 animate-spin text-primary self-center" />}
                    </div>
                  </div>

                  {/* ONE-CLICK COMPLETE BUTTON */}
                  {['scheduled', 'field_survey'].includes(selectedRequest.status) && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'completed')}
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl font-bold transition-all shadow-sm"
                    >
                      <CheckCircle2 className="size-5" /> Mark Task as Completed
                    </button>
                  )}
                </div>

                {/* VISUAL SCHEDULING BLOCK */}
                {(selectedRequest.paymentStatus === 'paid' || ['documents_verified', 'scheduled', 'field_survey'].includes(selectedRequest.status)) && (
                  <div className="border border-border p-4 rounded-xl bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                         <CalendarIcon className="size-4 text-primary" /> Field Survey Schedule
                      </h4>
                      {selectedRequest.scheduledDate && !isEditingSchedule && (
                         <button 
                            onClick={() => setIsEditingSchedule(true)}
                            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                         >
                           <Edit className="size-3" /> Edit Schedule
                         </button>
                      )}
                    </div>

                    {selectedRequest.scheduledDate && !isEditingSchedule ? (
                       <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                          {/* Calendar Tear-off Icon */}
                          <div className="flex flex-col items-center justify-center bg-background border border-border shadow-sm rounded-lg min-w-[70px] overflow-hidden">
                             <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase w-full text-center py-1">
                                {new Date(selectedRequest.scheduledDate).toLocaleString('en-US', { month: 'short' })}
                             </div>
                             <div className="text-2xl font-bold py-1">
                                {new Date(selectedRequest.scheduledDate).getDate()}
                             </div>
                          </div>
                          {/* Details */}
                          <div>
                             <div className="font-bold text-foreground text-sm">
                                {new Date(selectedRequest.scheduledDate).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                             </div>
                             <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="size-3.5" /> {selectedRequest.scheduledTime || 'Time TBA'}
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4">
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
                          </div>
                          <div className="flex gap-2">
                             {selectedRequest.scheduledDate && isEditingSchedule && (
                               <button 
                                  onClick={() => setIsEditingSchedule(false)}
                                  className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-lg text-sm font-medium transition-colors"
                               >
                                  Cancel
                               </button>
                             )}
                             <button 
                                onClick={handleUpdateSchedule}
                                disabled={!scheduleDate || !scheduleTime || isUpdating}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 transition-all hover:opacity-90"
                             >
                                Save Schedule
                             </button>
                          </div>
                       </div>
                    )}
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold border-b border-border pb-1">Client Information</h4>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Name</div>
                      {/* Using the real database name here! */}
                      <div className="font-medium">{getClientName(selectedRequest.clientId, selectedRequest.clientName)}</div>
                    </div>
                    {/* Upgraded Payment Badge */}
                    <div className="text-sm pt-2">
                      <div className="text-muted-foreground mb-2">Payment Status</div>
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${
                        selectedRequest.paymentStatus === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : selectedRequest.paymentStatus === 'partial'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {selectedRequest.paymentStatus === 'paid' 
                          ? 'Paid' 
                          : selectedRequest.paymentStatus === 'partial' 
                          ? 'Pending Verification' 
                          : 'Unpaid'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold border-b border-border pb-1">Property Location</h4>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Lot / Block</div>
                      <div className="font-medium">Lot {selectedRequest.propertyDetails?.lotNumber || 'TBA'}, Block {selectedRequest.propertyDetails?.blockNumber || 'TBA'}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Address</div>
                      <div className="font-medium">{selectedRequest.propertyDetails?.address?.street}, {selectedRequest.propertyDetails?.address?.province || 'Bataan'}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
                   <div className="flex gap-2 w-full sm:w-auto">
                     <button 
                      onClick={() => handleDeleteRequest(selectedRequest.id)}
                      className="flex-1 sm:flex-none justify-center flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                     >
                        <Trash2 className="size-4" /> Delete
                     </button>
                     <button 
                      onClick={() => handleCancelRequest(selectedRequest.id)}
                      className="flex-1 sm:flex-none justify-center flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                     >
                        <XCircle className="size-4" /> Cancel
                     </button>
                   </div>
                   <button onClick={() => setSelectedRequest(null)} className="w-full sm:w-auto px-6 py-2 bg-foreground text-background rounded-lg text-sm font-bold">
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