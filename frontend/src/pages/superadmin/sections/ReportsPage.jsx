import { useState, useEffect } from 'react';
import { FiDownload, FiFileText, FiUsers, FiUserCheck, FiClipboard, FiCheck, FiAlertCircle } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axiosInstance from '../../../api/axiosInstance';

const reports = [
  {
    id: 'supervisors',
    title: 'Supervisors Report',
    description: 'All supervisors with their email, status, intern count, and creation date.',
    icon: FiUserCheck,
    csvEndpoint: '/super-admin/reports/supervisors',
    jsonEndpoint: '/super-admin/reports-json/supervisors',
    color: '#f59e0b',
  },
  {
    id: 'interns',
    title: 'Interns Report',
    description: 'All interns with supervisor assignment, university, hometown, and internship dates.',
    icon: FiUsers,
    csvEndpoint: '/super-admin/reports/interns',
    jsonEndpoint: '/super-admin/reports-json/interns',
    color: '#3b82f6',
  },
  {
    id: 'tasks',
    title: 'Tasks Report',
    description: 'All tasks with status, priority, assignees, due dates, and creation info.',
    icon: FiClipboard,
    csvEndpoint: '/super-admin/reports/tasks',
    jsonEndpoint: '/super-admin/reports-json/tasks',
    color: '#22c55e',
  },
];

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function addPDFHeader(doc, title) {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('InternPulse', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('internpulse.com', 14, 24);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text(title, 14, 36);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 45, 196, 45);
  return 50;
}

function generateSupervisorsPDF(data) {
  const doc = new jsPDF();
  addPDFHeader(doc, 'Supervisors Report');
  autoTable(doc, {
    startY: 52,
    head: [['Name', 'Email', 'Active', 'Interns', 'Created']],
    body: data.map(s => [s.name, s.email, s.isActive ? 'Yes' : 'No', s.internCount, fmt(s.createdAt)]),
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14 },
  });
  doc.save('supervisors_report.pdf');
}

function generateInternsPDF(data) {
  const doc = new jsPDF({ orientation: 'landscape' });
  addPDFHeader(doc, 'Interns Report');
  autoTable(doc, {
    startY: 52,
    head: [['Name', 'Email', 'Active', 'Supervisor', 'University', 'Start', 'End', 'Joined']],
    body: data.map(i => [i.name, i.email, i.isActive ? 'Yes' : 'No', i.supervisor, i.university, fmt(i.internshipStart), fmt(i.internshipEnd), fmt(i.createdAt)]),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14 },
  });
  doc.save('interns_report.pdf');
}

function generateTasksPDF(data) {
  const doc = new jsPDF({ orientation: 'landscape' });
  addPDFHeader(doc, 'Tasks Report');
  autoTable(doc, {
    startY: 52,
    head: [['Title', 'Status', 'Priority', 'Created By', 'Assigned To', 'Due Date', 'Created']],
    body: data.map(t => [t.title, t.status, t.priority, t.createdBy, t.assignedTo.join(', '), fmt(t.dueDate), fmt(t.createdAt)]),
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14 },
    columnStyles: { 0: { cellWidth: 45 }, 4: { cellWidth: 40 } },
  });
  doc.save('tasks_report.pdf');
}

const PDF_GENERATORS = {
  supervisors: generateSupervisorsPDF,
  interns:     generateInternsPDF,
  tasks:       generateTasksPDF,
};

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(null);
  const [pdfLoading, setPdfLoading]   = useState(null);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    axiosInstance.get('/super-admin/analytics')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  const handleDownloadCSV = async (report) => {
    setDownloading(report.id);
    try {
      const response = await axiosInstance.get(report.csvEndpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.id}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async (report) => {
    setPdfLoading(report.id);
    try {
      const res = await axiosInstance.get(report.jsonEndpoint);
      const generator = PDF_GENERATORS[report.id];
      if (generator) generator(res.data);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setToast({ type: 'error', msg: 'Failed to generate PDF' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setPdfLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg backdrop-blur-sm transition-all"
             style={{
               background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
               borderColor: toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
               color: toast.type === 'success' ? '#22c55e' : '#ef4444',
             }}>
          {toast.type === 'success' ? <FiCheck className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Reports & Downloads
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Export platform data as CSV or PDF files
        </p>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Supervisors', value: stats.users.totalSupervisors, color: '#f59e0b' },
            { label: 'Interns', value: stats.users.totalInterns, color: '#3b82f6' },
            { label: 'Tasks', value: stats.tasks.totalTasks, color: '#22c55e' },
            { label: 'Announcements', value: stats.announcements.totalAnnouncements, color: '#8b5cf6' },
          ].map(card => (
            <div key={card.label} className="p-4 rounded-2xl border relative overflow-hidden"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-2xl opacity-20"
                   style={{ background: card.color }} />
              <div className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {card.value}
              </div>
              <div className="text-xs font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloading === report.id;
          const isLoadingPdf  = pdfLoading === report.id;
          return (
            <div key={report.id}
                 className="group rounded-2xl border p-6 transition-all hover:scale-[1.01]"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl shrink-0" style={{ background: `${report.color}18` }}>
                  <Icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                    {report.title}
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {report.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleDownloadCSV(report)}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: `linear-gradient(135deg, ${report.color}, ${report.color}cc)` }}>
                      {isDownloading ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload className="w-3.5 h-3.5" />
                          CSV
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(report)}
                      disabled={isLoadingPdf}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                      {isLoadingPdf ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiFileText className="w-3.5 h-3.5" />
                          PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="rounded-2xl border p-5 flex items-start gap-3"
           style={{ background: 'rgba(220,38,38,0.05)', borderColor: 'rgba(220,38,38,0.2)' }}>
        <FiFileText className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
        <div>
          <p className="text-xs font-semibold text-white">About Reports</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            All reports are generated in real-time from the current database state. CSV files can be opened
            in Excel or Google Sheets. PDF files are formatted documents suitable for printing or sharing.
          </p>
        </div>
      </div>
    </div>
  );
}
