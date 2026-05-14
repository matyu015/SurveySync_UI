import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar as CalendarIcon,
  LogOut,
  Search,
  Menu,
  Sun,
  Moon,
  Plus,
  Upload,
  Loader2,
  Map,
  X,
  CreditCard,
  Clock,
  CheckCircle2,
  Receipt,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import MonthCalendar from './MonthCalendar';

interface ClientDashboardProps {
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

type Tab = 'dashboard' | 'requests' | 'calendar' | 'payments' | 'vault';
type PaymentMethod = 'gcash' | 'bank' | 'otc' | 'cash';

const SURVEY_PRICES: Record<string, number> = {
  'Lot Plan / Relocation': 5500,
  'Topographic Survey': 15000,
  'Subdivision Survey': 28000,
  'Consolidation Survey': 18000,
};

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; detail: string }> = [
  { value: 'gcash', label: 'GCash', detail: 'Mobile wallet transfer' },
  { value: 'bank', label: 'Bank Transfer', detail: 'Online or branch deposit' },
  { value: 'otc', label: 'Over the Counter', detail: 'Partner payment center' },
  { value: 'cash', label: 'Cash', detail: 'Pay at the office' },
];

function makeReference(prefix: string) {
  const timestamp = new Date();
  const date = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${suffix}`;
}

function normalizeStatus(status?: string) {
  return (status || 'submitted').toLowerCase().replace(/\s+/g, '_');
}

export default function ClientDashboard({ onLogout, darkMode, toggleDarkMode }: ClientDashboardProps) {
  const { currentUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientCalendarMonth, setClientCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');

  const [requests, setRequests] = useState<any[]>([]);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyType, setSurveyType] = useState('Lot Plan / Relocation');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [purpose, setPurpose] = useState('');

  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<any | null>(null);
  const [selectedScheduleRequestId, setSelectedScheduleRequestId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [isBookingSchedule, setIsBookingSchedule] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // 1. Live Survey Requests
    const qRequests = query(
      collection(db, 'requests'),
      where('clientId', '==', currentUser.uid)
    );
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      const reqData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(reqData);
    }, (error) => {
      console.error("Error loading survey requests:", error);
    });

    // 2. Live Documents
    const qDocs = query(
      collection(db, 'documents'),
      where('clientId', '==', currentUser.uid)
    );
    const unsubscribeDocs = onSnapshot(qDocs, (snapshot) => {
      const docData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserDocs(docData);
    }, (error) => {
      console.error("Error loading documents:", error);
    });

    // 3. Live Payments
    const qPayments = query(
      collection(db, 'payments'),
      where('clientId', '==', currentUser.uid)
    );
    const unsubscribePayments = onSnapshot(qPayments, (snapshot) => {
      const paymentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(paymentData);
    }, (error) => {
      console.error("Error loading payments:", error);
    });

    // 4. Live Schedule Availability
    const unsubscribeAvailability = onSnapshot(collection(db, 'availability'), (snapshot) => {
      const slotData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailabilitySlots(slotData);
    }, (error) => {
      console.error("Error loading availability:", error);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeDocs();
      unsubscribePayments();
      unsubscribeAvailability();
    };
  }, [currentUser]);

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

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      await addDoc(collection(db, 'documents'), {
        clientId: currentUser.uid,
        clientEmail: currentUser.email,
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

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to submit a request.");
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = SURVEY_PRICES[surveyType] || 5500;
      const referenceNo = makeReference('SS');
      const requestPayload = {
        referenceNo,
        clientId: currentUser.uid,
        clientEmail: currentUser.email,
        clientName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Client',
        surveyType,
        location,
        notes,
        status: 'submitted',
        paymentStatus: 'pending',
        amount,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        propertyDetails: {
          address: {
            street: location,
            barangay: '',
            municipality: '',
            province: 'Bataan',
          },
          purpose: purpose || 'For survey processing',
        },
      };

      // Pure live database submission
      await addDoc(collection(db, 'requests'), requestPayload);

      setIsRequestModalOpen(false);
      setLocation('');
      setNotes('');
      setPurpose('');
      setSurveyType('Lot Plan / Relocation');
      setSelectedScheduleRequestId('');
      setActiveTab('requests');
    } catch (error) {
      console.error("Error submitting request: ", error);
      alert("Failed to submit request. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentModal = (request: any) => {
    setSelectedPaymentRequest(request);
    setPaymentAmount(String(request.amount || SURVEY_PRICES[request.surveyType] || 0));
    setPaymentReference('');
    setPaymentMethod('gcash');
  };

  const openSchedulePicker = (request: any) => {
    setSelectedScheduleRequestId(request.id);
    setActiveTab('calendar');
  };

  const handleBookSchedule = async (slot: any) => {
    if (!currentUser || !selectedScheduleRequestId) {
      alert("Select a survey request before booking a schedule.");
      return;
    }

    const selectedRequest = requests.find(request => request.id === selectedScheduleRequestId);
    if (!selectedRequest) {
      alert("Selected request was not found.");
      return;
    }

    setIsBookingSchedule(true);
    try {
      const scheduledTime = slot.endTime ? `${slot.startTime} - ${slot.endTime}` : slot.startTime;
      const requestScheduleUpdate = {
        scheduledDate: slot.date,
        scheduledTime,
        availabilitySlotId: slot.id,
        status: 'scheduled',
      };

      const slotBookingUpdate = {
        status: 'booked',
        bookedBy: currentUser.uid,
        clientEmail: currentUser.email,
        clientName: selectedRequest.clientName || currentUser.email,
        requestId: selectedRequest.id,
        requestRef: selectedRequest.referenceNo || selectedRequest.id,
        bookedAt: new Date().toISOString(),
      };

      // Pure live database update
      await updateDoc(doc(db, 'requests', selectedRequest.id), requestScheduleUpdate);
      await updateDoc(doc(db, 'availability', slot.id), slotBookingUpdate);

      setSelectedScheduleRequestId('');
    } catch (error) {
      console.error("Schedule booking failed:", error);
      alert("Failed to book this schedule. Please try another slot.");
    } finally {
      setIsBookingSchedule(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPaymentRequest) return;

    const numericAmount = Number(paymentAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("Enter a valid payment amount.");
      return;
    }

    setIsPaying(true);
    try {
      const paymentPayload = {
        requestId: selectedPaymentRequest.id,
        requestRef: selectedPaymentRequest.referenceNo || selectedPaymentRequest.id,
        clientId: currentUser.uid,
        clientEmail: currentUser.email,
        clientName: selectedPaymentRequest.clientName || currentUser.email,
        amount: numericAmount,
        method: paymentMethod,
        status: 'pending',
        referenceNo: paymentReference || makeReference(paymentMethod.toUpperCase()),
        createdAt: new Date().toISOString(),
      };

      const requestPaymentUpdate = { paymentStatus: 'partial' };

      // Pure live database submission
      await addDoc(collection(db, 'payments'), paymentPayload);
      await updateDoc(doc(db, 'requests', selectedPaymentRequest.id), requestPaymentUpdate);

      setSelectedPaymentRequest(null);
      setActiveTab('payments');
    } catch (error) {
      console.error("Payment submission failed:", error);
      alert("Failed to submit payment. Please check your internet connection.");
    } finally {
      setIsPaying(false);
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

  const filteredRequests = requests.filter(request => {
    const haystack = [
      request.referenceNo,
      request.surveyType,
      request.location,
      request.status,
      request.paymentStatus,
    ].join(' ').toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    return new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime();
  });

  const scheduledRequests = [...requests]
    .filter(request => request.scheduledDate)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const schedulableRequests = [...requests]
    .filter(request => !request.scheduledDate && normalizeStatus(request.status) !== 'completed')
    .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime());

  const availableSlots = [...availabilitySlots]
    .filter(slot => slot.status === 'available')
    .sort((a, b) => `${a.date || ''}T${a.startTime || '00:00'}`.localeCompare(`${b.date || ''}T${b.startTime || '00:00'}`));

  const selectedDateAvailableSlots = availableSlots.filter(slot => slot.date === selectedCalendarDate);

  const getClientDayState = (dateKey: string) => {
    const scheduledCount = scheduledRequests.filter(request => request.scheduledDate === dateKey).length;
    const slots = availabilitySlots.filter(slot => slot.date === dateKey);
    const availableCount = slots.filter(slot => slot.status === 'available').length;
    const unavailableCount = slots.filter(slot => slot.status === 'unavailable').length;
    const bookedCount = slots.filter(slot => slot.status === 'booked').length;

    if (scheduledCount) {
      return { status: 'scheduled' as const, label: `${scheduledCount} scheduled` };
    }
    if (availableCount) {
      return { status: 'available' as const, label: `${availableCount} open` };
    }
    if (unavailableCount && !bookedCount) {
      return { status: 'unavailable' as const, label: 'Unavailable' };
    }
    if (bookedCount) {
      return { status: 'booked' as const, label: 'Booked' };
    }
    return undefined;
  };

  const pendingPayments = requests.filter(request => request.paymentStatus !== 'paid');
  const verifiedPayments = payments.filter(payment => payment.status === 'paid');
  const pendingPaymentAmount = payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | string | undefined) => {
    const value = Number(amount || 0);
    return `PHP ${value.toLocaleString()}`;
  };

  const formatSlotTime = (slot: any) => {
    if (!slot?.startTime) return 'Time TBA';
    return slot.endTime ? `${slot.startTime} - ${slot.endTime}` : slot.startTime;
  };

  const statusColor = (status: string) => {
    switch(normalizeStatus(status)) {
      case 'completed':
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'scheduled':
      case 'field_survey':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'submitted':
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'under_review':
      case 'partial':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-card border-r border-border transition-all duration-300 flex-col hidden md:flex`}>
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
            { id: 'calendar', icon: CalendarIcon, label: 'Schedule' },
            { id: 'payments', icon: CreditCard, label: 'Payments' },
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

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card/50 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 rounded-lg hover:bg-accent">
              <Menu className="size-5" />
            </button>
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search surveys, payments, or status..."
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

        <div className="p-6 overflow-auto relative">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Client workspace</h2>
                  <p className="text-muted-foreground text-sm">Track survey progress, payment verification, and field schedules.</p>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="size-4" /> New Request
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: 'Survey Requests', value: requests.length, icon: Map, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Scheduled Visits', value: scheduledRequests.length, icon: CalendarIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Pending Payments', value: formatCurrency(pendingPaymentAmount), icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Verified Payments', value: verifiedPayments.length, icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map(stat => (
                  <div key={stat.label} className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
                    <div className={`size-11 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`size-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                      <h3 className="text-xl font-bold">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6">
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">Latest Surveys</h3>
                    <button onClick={() => setActiveTab('requests')} className="text-sm text-primary hover:underline">View all</button>
                  </div>
                  <div className="divide-y divide-border">
                    {sortedRequests.slice(0, 4).map(request => (
                      <div key={request.id} className="p-5 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{request.referenceNo || request.id}</div>
                          <div className="text-sm text-muted-foreground">{request.surveyType} - {request.location || request.propertyDetails?.address?.street || 'Bataan'}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${statusColor(request.status)}`}>
                          {normalizeStatus(request.status).replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                    {sortedRequests.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">No survey requests yet.</div>
                    )}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Next Schedule</h3>
                    <CalendarIcon className="size-5 text-primary" />
                  </div>
                  {scheduledRequests[0] ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="size-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                          <span className="text-xs uppercase text-primary font-bold">
                            {new Date(scheduledRequests[0].scheduledDate).toLocaleString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-bold">{new Date(scheduledRequests[0].scheduledDate).getDate()}</span>
                        </div>
                        <div>
                          <div className="font-medium">{scheduledRequests[0].surveyType}</div>
                          <div className="text-sm text-muted-foreground">{scheduledRequests[0].scheduledTime || 'Time TBA'}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{scheduledRequests[0].location || scheduledRequests[0].propertyDetails?.address?.street || 'Bataan'}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No field survey has been scheduled by admin yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">My Surveys</h2>
                  <p className="text-sm text-muted-foreground">Requests submitted here appear in the admin dashboard.</p>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="size-4" /> New Request
                </button>
              </div>

              <div className="grid gap-4">
                {sortedRequests.map((request) => (
                  <div key={request.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{request.referenceNo || request.id}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs border ${statusColor(request.status)}`}>
                            {normalizeStatus(request.status).replace(/_/g, ' ')}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs border ${statusColor(request.paymentStatus)}`}>
                            Payment {normalizeStatus(request.paymentStatus).replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">{request.surveyType}</div>
                        <div className="text-sm flex items-center gap-2">
                          <Map className="size-4 text-muted-foreground" />
                          {request.location || request.propertyDetails?.address?.street || 'Bataan'}
                        </div>
                        <div className="text-xs text-muted-foreground">Submitted {formatDate(request.submittedAt || request.createdAt)}</div>
                      </div>
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                        <div className="text-lg font-bold">{formatCurrency(request.amount)}</div>
                        <button
                          onClick={() => openSchedulePicker(request)}
                          disabled={Boolean(request.scheduledDate)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CalendarIcon className="size-4" />
                          {request.scheduledDate ? 'Scheduled' : 'Pick Schedule'}
                        </button>
                        <button
                          onClick={() => openPaymentModal(request)}
                          disabled={request.paymentStatus === 'paid'}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CreditCard className="size-4" />
                          {request.paymentStatus === 'paid' ? 'Paid' : 'Pay / Submit Proof'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {sortedRequests.length === 0 && (
                  <div className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-card border border-border rounded-xl">
                    <Map className="size-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No survey requests found.</p>
                    <p className="text-sm mt-1">Click "New Request" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
                <p className="text-sm text-muted-foreground">Pick from schedule slots published by admin.</p>
              </div>

              <div className="grid xl:grid-cols-[0.85fr_1.35fr] gap-6">
                <div className="bg-card border border-border rounded-xl p-5 space-y-6">
                  <h3 className="font-semibold mb-2">Choose Request</h3>
                  <p className="text-sm text-muted-foreground mb-4">Select which survey request you want to schedule.</p>
                  <select
                    value={selectedScheduleRequestId}
                    onChange={(e) => setSelectedScheduleRequestId(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a request</option>
                    {schedulableRequests.map(request => (
                      <option key={request.id} value={request.id}>
                        {request.referenceNo || request.id} - {request.surveyType}
                      </option>
                    ))}
                  </select>

                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-semibold">Already Scheduled</h4>
                    {scheduledRequests.slice(0, 4).map(request => (
                      <div key={request.id} className="border border-border rounded-lg p-3">
                        <div className="font-medium text-sm">{request.referenceNo || request.id}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(request.scheduledDate)} at {request.scheduledTime || 'Time TBA'}</div>
                      </div>
                    ))}
                    {scheduledRequests.length === 0 && (
                      <div className="text-sm text-muted-foreground">No booked schedules yet.</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <MonthCalendar
                    month={clientCalendarMonth}
                    onMonthChange={setClientCalendarMonth}
                    selectedDate={selectedCalendarDate}
                    getDayState={getClientDayState}
                    onSelectDate={setSelectedCalendarDate}
                  />

                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Selected Date</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedCalendarDate ? formatDate(selectedCalendarDate) : 'Pick a day on the month view.'}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">{availableSlots.length} open this month</span>
                    </div>
                    <div className="divide-y divide-border">
                      {selectedDateAvailableSlots.map(slot => (
                        <div key={slot.id} className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h4 className="font-semibold">{formatSlotTime(slot)}</h4>
                            <div className="text-sm text-muted-foreground">{slot.note || 'Available for field survey'}</div>
                          </div>
                          <button
                            onClick={() => handleBookSchedule(slot)}
                            disabled={!selectedScheduleRequestId || isBookingSchedule}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isBookingSchedule ? 'Booking...' : 'Book This Date'}
                          </button>
                        </div>
                      ))}
                      {selectedCalendarDate && selectedDateAvailableSlots.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          No available slot on this date.
                        </div>
                      )}
                      {!selectedCalendarDate && (
                        <div className="p-8 text-center text-muted-foreground">
                          Select an available date to see booking options.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
                  <p className="text-sm text-muted-foreground">Submit transaction references for admin verification.</p>
                </div>
                <button
                  onClick={() => pendingPayments[0] && openPaymentModal(pendingPayments[0])}
                  disabled={pendingPayments.length === 0}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="size-4" /> Submit Payment
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Transactions', value: payments.length, icon: Receipt, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Pending Verification', value: payments.filter(payment => payment.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Verified', value: verifiedPayments.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map(stat => (
                  <div key={stat.label} className="bg-card border border-border p-5 rounded-xl flex items-center gap-4">
                    <div className={`size-11 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`size-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <div className="text-xl font-bold">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent/50 text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Reference</th>
                      <th className="px-5 py-3 font-medium">Survey</th>
                      <th className="px-5 py-3 font-medium">Method</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-accent/30">
                        <td className="px-5 py-4 font-medium">{payment.referenceNo}</td>
                        <td className="px-5 py-4 text-muted-foreground">{payment.requestRef || payment.requestId}</td>
                        <td className="px-5 py-4 uppercase">{payment.method}</td>
                        <td className="px-5 py-4">{formatCurrency(payment.amount)}</td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs border ${statusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No payment transactions yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Document Vault</h2>
                <p className="text-muted-foreground text-sm">Upload and manage your required survey documents.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                {userDocs.map(doc => (
                  <div key={doc.id} className="bg-card rounded-xl border border-border p-6 flex flex-col shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="size-6 text-primary" />
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColor(doc.status)}`}>
                        {doc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="mb-1 font-medium truncate" title={doc.name}>{doc.name}</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      {doc.fileSize} - Uploaded {formatDate(doc.uploadedAt)}
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

      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Map className="size-5 text-primary" />
                New Survey Request
              </h2>
              <button
                onClick={() => setIsRequestModalOpen(false)}
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
                <p className="mt-1 text-xs text-muted-foreground">Estimated fee: {formatCurrency(SURVEY_PRICES[surveyType])}</p>
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
                <label className="block text-sm font-medium mb-1.5">Purpose</label>
                <input
                  type="text"
                  placeholder="e.g., land titling, sale, construction permit"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
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
                  onClick={() => setIsRequestModalOpen(false)}
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

      {selectedPaymentRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" />
                  Submit Payment
                </h2>
                <p className="text-sm text-muted-foreground">{selectedPaymentRequest.referenceNo || selectedPaymentRequest.id}</p>
              </div>
              <button
                onClick={() => setSelectedPaymentRequest(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Mode of Payment</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      type="button"
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-4 rounded-xl border text-left transition-colors ${
                        paymentMethod === method.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <div className="font-medium">{method.label}</div>
                      <div className="text-xs text-muted-foreground">{method.detail}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Transaction Reference</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="GCash, bank, or receipt no."
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 border border-border p-4 text-sm text-muted-foreground">
                This creates a pending transaction for admin verification. Once admin marks it paid, your survey payment status updates.
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentRequest(null)}
                  className="flex-1 px-4 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send for Verification'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}