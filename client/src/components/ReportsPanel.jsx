import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  MessageSquare, 
  Filter, 
  Search, 
  Plus, 
  Shield, 
  User, 
  MapPin, 
  Zap, 
  Car,
  ChevronRight,
  RefreshCw,
  Edit3
} from 'lucide-react';

export default function ReportsPanel({ currentUser, isAdmin = false }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'all' : 'my_reports'); // 'all' | 'my_reports' | 'submit'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Pending' | 'In Progress' | 'Resolved'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  // Admin Status Update State
  const [updateStatus, setUpdateStatus] = useState('In Progress');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Customer Submit Form State
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('EV Charger Fault');
  const [reportSpotId, setReportSpotId] = useState('EV02');
  const [reportPriority, setReportPriority] = useState('High');
  const [reportDescription, setReportDescription] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const url = isAdmin 
        ? '/api/reports?role=admin'
        : `/api/reports?role=customer&userId=${currentUser?.id || currentUser?.email}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, [currentUser, isAdmin]);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          category: reportCategory,
          spotId: reportSpotId,
          priority: reportPriority,
          customerId: currentUser?.id || 'CUST-DEMO',
          customerName: currentUser?.name || 'Customer Driver',
          customerEmail: currentUser?.email || 'driver@smartparking.org',
          vehiclePlate: currentUser?.vehiclePlate || 'EV-DEMO',
          description: reportDescription
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(`Report ${data.report.id} submitted successfully to system operations!`);
        setReportTitle('');
        setReportDescription('');
        fetchReports();
        setTimeout(() => setActiveTab('my_reports'), 1500);
      } else {
        setSubmitError(data.message || 'Error submitting report.');
      }
    } catch (err) {
      setSubmitError('Failed to connect to reports service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          adminNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchReports();
        setSelectedReport(data.report);
        setIsUpdating(false);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setIsUpdating(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.customerName && r.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.spotId && r.spotId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{isAdmin ? 'System Incident & Customer Reports Center' : 'Customer Incident Reports & Help Desk'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAdmin 
                ? 'Review and resolve customer incident tickets, hardware faults, and parking obstruction reports.'
                : 'Submit reports for faulty EV chargers, blocked bays, billing discrepancies, or feedback directly to operations.'}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-lg font-mono font-bold">
                {pendingCount} Pending
              </span>
              <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg font-mono font-bold">
                {inProgressCount} In Progress
              </span>
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg font-mono font-bold">
                {resolvedCount} Resolved
              </span>
            </div>
          ) : (
            <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('my_reports')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'my_reports' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                My Reports ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'submit' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Incident</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={fetchReports}
            disabled={isLoading}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CUSTOMER SUBMIT INCIDENT REPORT FORM */}
      {/* ------------------------------------------------------------- */}
      {!isAdmin && activeTab === 'submit' && (
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Submit Issue or Incident Report</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Your report will be immediately dispatched to central system operations and assigned an incident ticket.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-rose-950/80 border border-rose-500 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Incident Subject / Summary</label>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. 50kW Charger Display Glitch at EV02"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Issue Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="EV Charger Fault">EV Charger Fault (⚡)</option>
                  <option value="Wrong Parking / Misuse">Wrong Parking / Bay Misuse</option>
                  <option value="Billing & Payment">Billing & Payment</option>
                  <option value="Sensor Malfunction">Sensor / Gate Barrier Fault</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Spot ID (If Applicable)</label>
                <select
                  value={reportSpotId}
                  onChange={(e) => setReportSpotId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="N/A">N/A (General Lot)</option>
                  <optgroup label="EV Fast Charger Bays">
                    <option value="EV01">EV01 (Row 1)</option>
                    <option value="EV02">EV02 (Row 1)</option>
                    <option value="EV03">EV03 (Row 1)</option>
                    <option value="EV04">EV04 (Row 1)</option>
                    <option value="EV05">EV05 (Row 1)</option>
                    <option value="EV06">EV06 (Row 1)</option>
                  </optgroup>
                  <optgroup label="Regular Parking Spots">
                    <option value="R01">R01 (Row 1)</option>
                    <option value="R05">R05 (Row 2)</option>
                    <option value="R10">R10 (Row 2)</option>
                    <option value="R15">R15 (Row 3)</option>
                    <option value="R24">R24 (Row 3)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Severity / Priority</label>
                <select
                  value={reportPriority}
                  onChange={(e) => setReportPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Low">Low (General Query)</option>
                  <option value="Medium">Medium (Minor Issue)</option>
                  <option value="High">High (Hardware Fault)</option>
                  <option value="Critical">Critical (Stranded EV / Blocked Bay)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide specific details about the issue (e.g. connector was jammed, error code on charger screen, ICE car license plate blocking stall)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500">
                Logged in as: <strong className="text-cyan-400">{currentUser?.name}</strong> ({currentUser?.vehiclePlate})
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('my_reports')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* REPORTS LIST (CUSTOMER OR ADMIN) */}
      {/* ------------------------------------------------------------- */}
      {(isAdmin || activeTab === 'my_reports') && (
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Filter and Search Bar */}
          <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Subject, Customer, Spot..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {['all', 'Pending', 'In Progress', 'Resolved'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Tickets' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto bg-[#070B14]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono uppercase">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-4">Category / Spot</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-500">
                      No reports found in this view.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep) => {
                    const isCritical = rep.priority === 'Critical' || rep.priority === 'High';
                    return (
                      <tr key={rep.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Ticket ID & Time */}
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-cyan-400">{rep.id}</div>
                          <div className="text-[10px] text-slate-500">{new Date(rep.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>

                        {/* Title & Description */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-white truncate">{rep.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{rep.description}</div>
                          {rep.adminNotes && (
                            <div className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60 mt-1 truncate">
                              <strong>Admin:</strong> {rep.adminNotes}
                            </div>
                          )}
                        </td>

                        {/* Category & Spot */}
                        <td className="py-3 px-4">
                          <div className="text-slate-300 font-medium">{rep.category}</div>
                          {rep.spotId && rep.spotId !== 'N/A' && (
                            <span className="inline-block mt-0.5 font-mono text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                              Bay: {rep.spotId}
                            </span>
                          )}
                        </td>

                        {/* Submitter */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{rep.customerName || 'Driver'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{rep.vehiclePlate}</div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            rep.priority === 'Critical' ? 'bg-red-950 text-red-300 border-red-700 animate-pulse' :
                            rep.priority === 'High' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                            'bg-slate-900 text-slate-400 border-slate-700'
                          }`}>
                            {rep.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            rep.status === 'Resolved' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                            rep.status === 'In Progress' ? 'bg-cyan-950 text-cyan-300 border-cyan-700' :
                            'bg-amber-950 text-amber-300 border-amber-700'
                          }`}>
                            {rep.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReport(rep);
                              setUpdateStatus(rep.status);
                              setAdminNotes(rep.adminNotes || '');
                            }}
                            className="px-3 py-1 bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-cyan-400 text-xs font-semibold rounded-lg transition-all"
                          >
                            {isAdmin ? 'Manage' : 'View'}
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Report Inspection & Admin Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B1120] border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold">{selectedReport.id}</span>
                <h4 className="text-base font-bold text-white mt-0.5">{selectedReport.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Category</div>
                <div className="font-semibold text-white mt-0.5">{selectedReport.category}</div>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Target Bay</div>
                <div className="font-mono font-bold text-cyan-300 mt-0.5">{selectedReport.spotId}</div>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Customer</div>
                <div className="font-semibold text-white mt-0.5">{selectedReport.customerName} ({selectedReport.vehiclePlate})</div>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Submitted At</div>
                <div className="font-mono text-slate-300 mt-0.5">{new Date(selectedReport.submittedAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Description */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-slate-400 uppercase text-[10px]">Customer Incident Statement:</div>
              <p className="text-slate-200 leading-relaxed">{selectedReport.description}</p>
            </div>

            {/* Admin Resolution Form (If Admin) */}
            {isAdmin ? (
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Incident Resolution & Dispatch</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['Pending', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUpdateStatus(st)}
                      className={`py-2 rounded-lg font-semibold border text-center transition-all ${
                        updateStatus === st
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Resolution / Response Notes</label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter technician action taken or note to customer..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    Save & Update Ticket
                  </button>
                </div>
              </form>
            ) : (
              selectedReport.adminNotes && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-600/60 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-emerald-400">Operations Team Response:</div>
                  <p className="text-emerald-200">{selectedReport.adminNotes}</p>
                </div>
              )
            )}

          </div>
        </div>
      )}

    </div>
  );
}
