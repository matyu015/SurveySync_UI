import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Ensure this path is correct for your project
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct for your project
import { X, Loader2, Map, Plus } from 'lucide-react';

export default function MySurveys() {
  const { currentUser } = useAuth();
  
  // -- STATE MANAGEMENT --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [surveyType, setSurveyType] = useState('Lot Plan / Relocation');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // -- SUBMISSION LOGIC --
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);

    try {
      // 1. Send the data to Firestore's "requests" collection
      await addDoc(collection(db, 'requests'), {
        clientId: currentUser.uid,
        clientEmail: currentUser.email,
        surveyType,
        location,
        notes,
        status: 'Pending', // Default status for admins to see
        createdAt: new Date().toISOString()
      });

      // 2. Success! Close the popup and clear the form
      setIsModalOpen(false);
      setLocation('');
      setNotes('');
      setSurveyType('Lot Plan / Relocation');
      
    } catch (error) {
      console.error("Error submitting request: ", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-8">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">My Surveys</h1>
        
        {/* THE TRIGGER BUTTON */}
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-teal-500/20"
        >
          <Plus className="size-5" />
          New Request
        </button>
      </div>

      {/* Main Content Area (Placeholder for where your list of surveys will go later) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500">
        <Map className="size-12 mb-4 opacity-50" />
        <p>No survey requests found.</p>
      </div>


      {/* -- THE POPUP MODAL -- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Modal Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Map className="size-5 text-teal-500" />
                New Survey Request
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
              
              {/* Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Type of Survey</label>
                <select 
                  value={surveyType}
                  onChange={(e) => setSurveyType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white transition-shadow"
                >
                  <option value="Lot Plan / Relocation">Lot Plan / Relocation</option>
                  <option value="Topographic Survey">Topographic Survey</option>
                  <option value="Subdivision Survey">Subdivision Survey</option>
                  <option value="Consolidation Survey">Consolidation Survey</option>
                </select>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Property Location (Bataan)</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Brgy. San Ramon, Dinalupihan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder:text-slate-600 transition-shadow"
                />
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Additional Details (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Any specific instructions or landmarks?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder:text-slate-600 resize-none transition-shadow"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,184,166,0.2)]"
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
  );
}