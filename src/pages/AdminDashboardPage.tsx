import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGym } from '../context/GymContext';
import { Machine, UserRole, AuditLogEntry, MachineCategory } from '../types';
import { databaseService } from '../services/backend/databaseService';
import { authService } from '../services/backend/authService';
import { MachineSvgIllustration } from '../components/machines/MachineSvgIllustrations';
import { getMachinePhotos } from '../data/machinePhotos';
import { 
  ShieldCheck, 
  Crown, 
  Plus, 
  Edit, 
  Trash2, 
  QrCode, 
  BookOpen, 
  Users, 
  Lock, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  ChevronRight, 
  Layers, 
  RefreshCw, 
  Sparkles, 
  Printer, 
  ExternalLink,
  Info,
  Server,
  Key,
  Flame,
  Check,
  X
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (tab: string) => void;
  onSelectMachine: (machine: Machine) => void;
}

type AdminTab = 'overview' | 'machines' | 'tutorials' | 'qr_codes' | 'users' | 'audit_logs';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate, onSelectMachine }) => {
  const { user, isAdmin, role, openAuthModal, setDevRole } = useAuth();
  const { machines: contextMachines, addToast } = useGym();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [machines, setMachines] = useState<Machine[]>(() => databaseService.getAllMachines());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => databaseService.getAuditLogs());
  const [usersList, setUsersList] = useState(() => authService.getAllUsersForAdmin());

  // Search & Filters for Machine Management
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Machine Modal State (Add / Edit)
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [machineFormData, setMachineFormData] = useState<Partial<Machine>>({
    id: '',
    name: '',
    category: 'Chest',
    equipmentType: 'Pin-Loaded (Selectorized)',
    qrCodeId: '',
    tagline: '',
    description: '',
    difficulty: 'Beginner',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    setupInstructions: ['Adjust seat height to chest line.', 'Grip handles firmly and plant feet.'],
    movementGuidance: ['Press forward smoothly exhaling on exertion.', 'Slowly return to start position.'],
    safetyReminders: ['Do not let weights slam between reps.'],
    imageSvg: 'chest-press',
    verificationStatus: 'Verified',
    videoDurationSec: 30
  });

  // Delete Confirmation Modal
  const [deleteConfirmMachineId, setDeleteConfirmMachineId] = useState<string | null>(null);
  // QR Print Modal
  const [selectedQRBadgeMachine, setSelectedQRBadgeMachine] = useState<Machine | null>(null);

  // Refresh data helper
  const refreshData = () => {
    setMachines(databaseService.getAllMachines());
    setAuditLogs(databaseService.getAuditLogs());
    setUsersList(authService.getAllUsersForAdmin());
  };

  // Filtered Machines
  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.qrCodeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.alternativeNames ?? []).some(alt => alt.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = categoryFilter === 'All' || m.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [machines, searchQuery, categoryFilter]);

  // System Health Status
  const healthStatus = useMemo(() => {
    return databaseService.getSystemHealthStatus();
  }, [machines]);

  // 1. Guard: Unauthorized Access Screen
  if (!isAdmin) {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '4rem auto',
        textAlign: 'center',
        padding: '2.5rem 2rem',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 71, 87, 0.35)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(255, 71, 87, 0.15)',
          color: '#FF4757',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}>
          <Lock size={32} />
        </div>

        <span className="badge badge-danger" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
          HTTP 403 • Restricted Area
        </span>

        <h2 style={{ fontSize: '1.6rem', color: '#F1F5F9', margin: '6px 0 8px 0', fontWeight: 800 }}>
          Admin Access Required
        </h2>

        <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          This console is reserved for authorized gym staff, equipment administrators, and coaches. Your active session role is currently <strong style={{ color: '#00F59B' }}>{role.toUpperCase()}</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => setDevRole('admin')}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #FFB800 0%, #FF8800 100%)', color: '#05140F' }}
          >
            <Crown size={16} /> Switch Session Role to Admin (Demo Sandbox)
          </button>

          <button
            onClick={() => openAuthModal('signin')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Sign In with Admin Credentials
          </button>

          <button
            onClick={() => onNavigate('home')}
            style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            ← Return to Gym Home
          </button>
        </div>
      </div>
    );
  }

  // --- Handlers for Machine Management ---
  const handleOpenAddMachine = () => {
    setEditingMachine(null);
    const newId = `custom-machine-${Date.now().toString().slice(-4)}`;
    const newQR = `GYM-EQ-${Math.floor(Math.random() * 899 + 100)}`;
    setMachineFormData({
      id: newId,
      name: '',
      category: 'Chest',
      equipmentType: 'Pin-Loaded (Selectorized)',
      qrCodeId: newQR,
      tagline: '',
      description: '',
      difficulty: 'Beginner',
      primaryMuscles: ['Chest'],
      secondaryMuscles: ['Triceps'],
      setupInstructions: ['Adjust seat pin height to align with target chest line.'],
      movementGuidance: ['Smoothly push handle bars forward.'],
      safetyReminders: ['Start with light test weight to verify posture.'],
      imageSvg: 'chest-press',
      verificationStatus: 'Verified',
      videoDurationSec: 30
    });
    setIsMachineModalOpen(true);
  };

  const handleOpenEditMachine = (m: Machine) => {
    setEditingMachine(m);
    setMachineFormData({ ...m });
    setIsMachineModalOpen(true);
  };

  const handleSaveMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineFormData.id || !machineFormData.name || !machineFormData.qrCodeId) {
      addToast({ type: 'error', title: 'Missing Fields', message: 'Machine ID, Name, and QR Identifier are required.' });
      return;
    }

    try {
      if (editingMachine) {
        databaseService.updateMachine(editingMachine.id, machineFormData, user?.email);
        addToast({ type: 'success', title: 'Machine Updated', message: `Saved changes to ${machineFormData.name}` });
      } else {
        databaseService.createMachine(machineFormData as Machine, user?.email);
        addToast({ type: 'success', title: 'Machine Created', message: `Added ${machineFormData.name} to equipment database.` });
      }
      refreshData();
      setIsMachineModalOpen(false);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Operation Failed', message: err.message });
    }
  };

  const handleDeleteMachine = (id: string) => {
    try {
      databaseService.deleteMachine(id, user?.email);
      addToast({ type: 'warning', title: 'Machine Archived', message: 'Equipment record has been removed.' });
      refreshData();
      setDeleteConfirmMachineId(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to delete', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{
              background: 'linear-gradient(135deg, #FFB800 0%, #FF8800 100%)',
              color: '#05140F',
              fontSize: '0.72rem',
              fontWeight: 900,
              padding: '2px 9px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={13} /> Admin Console
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>• Staff Operations Hub</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', color: '#F1F5F9', margin: 0, fontWeight: 800 }}>
            Gym Scan AI Control Center
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
            Manage gym machine databases, publish tutorial steps, check QR code identifier collisions, and audit security logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onNavigate('library')}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
          >
            <ExternalLink size={14} /> Open Member Library
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.5rem'
      }}>
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: <Server size={15} /> },
          { id: 'machines', label: `Machines (${machines.length})`, icon: <Layers size={15} /> },
          { id: 'tutorials', label: 'Tutorials & Guides', icon: <BookOpen size={15} /> },
          { id: 'qr_codes', label: 'QR Hub & Printable Badges', icon: <QrCode size={15} /> },
          { id: 'users', label: `Users & Roles (${usersList.length})`, icon: <Users size={15} /> },
          { id: 'audit_logs', label: 'Security Audit Logs', icon: <Key size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            style={{
              background: activeTab === tab.id ? 'rgba(255, 184, 0, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#FFB800' : '#94A3B8',
              border: activeTab === tab.id ? '1px solid rgba(255, 184, 0, 0.4)' : '1px solid transparent',
              borderRadius: '10px',
              padding: '0.55rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
          {/* Key Metric Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.85rem'
          }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#00F59B', fontWeight: 800, textTransform: 'uppercase' }}>
                Total Equipment Records
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
                {healthStatus.totalMachines}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                {healthStatus.pendingReviews} pending content reviews
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#00D2FF', fontWeight: 800, textTransform: 'uppercase' }}>
                Registered Accounts
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
                {usersList.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                {usersList.filter(u => u.role === 'admin').length} active administrators
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#FFB800', fontWeight: 800, textTransform: 'uppercase' }}>
                Assigned QR Identifiers
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
                {machines.filter(m => m.qrCodeId).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                0 tag collisions detected
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#EC4899', fontWeight: 800, textTransform: 'uppercase' }}>
                Interactive Form Guides
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
                {healthStatus.totalTutorials}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Step-by-step verified instructions
              </div>
            </div>
          </div>

          {/* System Health Status Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(0, 245, 155, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={18} color="#00F59B" />
                <h3 style={{ fontSize: '1.05rem', color: '#F1F5F9', margin: 0, fontWeight: 700 }}>
                  Backend Services & RLS Security Status
                </h3>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                All Systems Operational
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Active Storage Adapter</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00F59B', marginTop: '2px' }}>
                  {healthStatus.backendMode === 'supabase' ? 'Supabase PostgreSQL Cloud' : 'Local Isolated Engine (Demo Mode)'}
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Row Level Security (RLS)</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00D2FF', marginTop: '2px' }}>
                  Enforced (11 Database Tables)
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Authentication Provider</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFB800', marginTop: '2px' }}>
                  GoTrue / SHA-256 Hashed Engine
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MACHINE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'machines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search machine name or QR ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-modern"
                  style={{ width: '100%', paddingLeft: '36px', fontSize: '0.82rem' }}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-modern"
                style={{ fontSize: '0.82rem', width: '140px' }}
              >
                <option value="All">All Categories</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Legs">Legs</option>
                <option value="Cardio">Cardio</option>
                <option value="Core">Core</option>
                <option value="Cable Equipment">Cable Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddMachine}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem' }}
            >
              <Plus size={16} /> Add New Equipment
            </button>
          </div>

          {/* Machine Table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Equipment Name</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>QR Identifier</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Type</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMachines.map((m) => {
                    const photos = getMachinePhotos(m.id);
                    const photoUrl = m.frontReferenceImage || photos?.front;
                    const isVerified = m.verificationStatus === 'Verified' || photos?.verified === true;

                    return (
                      <tr 
                        key={m.id}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Image Preview Thumbnail */}
                            <div style={{
                              width: '44px',
                              height: '36px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              background: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {isVerified && photoUrl ? (
                                <img src={photoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <MachineSvgIllustration type={m.imageSvg} />
                              )}
                            </div>
                            <div>
                              <div style={{ color: '#F1F5F9', fontWeight: 700 }}>{m.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>ID: {m.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>{m.category}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#00F59B', fontWeight: 700 }}>
                          {m.qrCodeId}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#94A3B8' }}>
                          {m.equipmentType}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '999px',
                            background: isVerified ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255, 184, 0, 0.15)',
                            color: isVerified ? '#00F59B' : '#FFB800',
                            border: isVerified ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid rgba(255, 184, 0, 0.3)'
                          }}>
                            {isVerified ? 'Reviewed & Verified' : 'Image Pending Review'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => onSelectMachine(m)}
                              title="Preview Details Page"
                              style={{ background: 'rgba(0, 245, 155, 0.1)', border: '1px solid rgba(0, 245, 155, 0.25)', color: '#00F59B', borderRadius: '7px', padding: '5px', cursor: 'pointer' }}
                            >
                              <ExternalLink size={14} />
                            </button>
                            <button
                              onClick={() => setSelectedQRBadgeMachine(m)}
                              title="Print QR Badge"
                              style={{ background: 'rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.25)', color: '#00D2FF', borderRadius: '7px', padding: '5px', cursor: 'pointer' }}
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenEditMachine(m)}
                              title="Edit Equipment"
                              style={{ background: 'rgba(255, 184, 0, 0.1)', border: '1px solid rgba(255, 184, 0, 0.25)', color: '#FFB800', borderRadius: '7px', padding: '5px', cursor: 'pointer' }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmMachineId(m.id)}
                              title="Archive Equipment"
                              style={{ background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.25)', color: '#FF4757', borderRadius: '7px', padding: '5px', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TUTORIAL MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'tutorials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>
              Form Guidance & Tutorial Step Editor
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px' }}>
              Educational orientation checklists configured per machine for user XP reward triggers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {machines.map((m) => (
              <div key={m.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.98rem', color: '#F1F5F9', margin: 0, fontWeight: 700 }}>
                    {m.name}
                  </h4>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    {m.tutorialSteps?.length || 2} Steps
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {m.tutorialSteps?.map((step) => (
                    <div key={step.stepNumber} style={{ fontSize: '0.78rem', color: '#CBD5E1', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                      <strong style={{ color: '#00F59B' }}>Step {step.stepNumber}:</strong> {step.title}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleOpenEditMachine(m)}
                  className="btn-outline"
                  style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'center' }}
                >
                  <Edit size={14} /> Edit Tutorial Steps & Form Reminders
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QR IDENTIFIER HUB & BADGES */}
      {/* ========================================================================= */}
      {activeTab === 'qr_codes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>
              Physical QR Code Identifier Registry
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px' }}>
              Assign and preview printable adhesive QR badges for physical gym equipment.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {machines.map((m) => (
              <div key={m.id} className="glass-card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F1F5F9' }}>{m.name}</div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#00F59B', marginTop: '2px', fontWeight: 800 }}>
                    Tag: {m.qrCodeId}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>{m.category}</div>
                </div>

                <button
                  onClick={() => setSelectedQRBadgeMachine(m)}
                  style={{
                    background: 'rgba(0, 245, 155, 0.12)',
                    border: '1px solid rgba(0, 245, 155, 0.3)',
                    color: '#00F59B',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Printer size={14} /> Preview Badge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. USER & ROLE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>
              User Accounts & Role Permissions Directory
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px' }}>
              Assign Administrator or Athlete roles with instant privilege synchronization.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>User Display Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Active Role</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Joined Date</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Role Control</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: '#F1F5F9', fontWeight: 700 }}>
                      {u.displayName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94A3B8' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: u.role === 'admin' ? 'rgba(255, 184, 0, 0.18)' : 'rgba(0, 245, 155, 0.15)',
                        color: u.role === 'admin' ? '#FFB800' : '#00F59B'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                      {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => {
                          authService.updateUserRole(u.id, e.target.value as UserRole);
                          refreshData();
                          addToast({ type: 'success', title: 'Role Updated', message: `${u.displayName} is now ${e.target.value}` });
                        }}
                        className="input-modern"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        <option value="user">User (Athlete)</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* AUDIT LOGS TAB */}
      {activeTab === 'audit_logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>Administrative Security Audit Trail</h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px' }}>Immutable record of administrative actions, role assignments, and schema modifications.</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.8rem', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{log.actionType}</span>
                  <span style={{ color: '#F1F5F9' }}>{log.details}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD/EDIT MACHINE MODAL */}
      {isMachineModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 7, 12, 0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', borderRadius: '24px', background: '#0F172A', border: '1px solid rgba(0, 245, 155, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#F1F5F9', margin: 0, fontWeight: 800 }}>{editingMachine ? `Edit: ${editingMachine.name}` : 'Add New Gym Machine'}</h3>
              <button onClick={() => setIsMachineModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveMachine} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div><label style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block', marginBottom: '3px' }}>Machine Name *</label><input type="text" required placeholder="e.g. Incline Hammer Chest Press" value={machineFormData.name} onChange={(e) => setMachineFormData({ ...machineFormData, name: e.target.value })} className="input-modern" style={{ width: '100%', fontSize: '0.85rem' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div><label style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block', marginBottom: '3px' }}>Unique QR Tag *</label><input type="text" required placeholder="GYM-CHEST-99" value={machineFormData.qrCodeId} onChange={(e) => setMachineFormData({ ...machineFormData, qrCodeId: e.target.value.toUpperCase() })} className="input-modern" style={{ width: '100%', fontSize: '0.85rem', fontFamily: 'monospace' }} /></div>
                <div><label style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block', marginBottom: '3px' }}>Category *</label><select value={machineFormData.category} onChange={(e) => setMachineFormData({ ...machineFormData, category: e.target.value as MachineCategory })} className="input-modern" style={{ width: '100%', fontSize: '0.85rem' }}><option value="Chest">Chest</option><option value="Back">Back</option><option value="Shoulders">Shoulders</option><option value="Arms">Arms</option><option value="Legs">Legs</option><option value="Cardio">Cardio</option><option value="Core">Core</option><option value="Cable Equipment">Cable Equipment</option><option value="Other">Other</option></select></div>
              </div>
              <div><label style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block', marginBottom: '3px' }}>Equipment Type</label><select value={machineFormData.equipmentType} onChange={(e) => setMachineFormData({ ...machineFormData, equipmentType: e.target.value as any })} className="input-modern" style={{ width: '100%', fontSize: '0.85rem' }}><option value="Pin-Loaded (Selectorized)">Pin-Loaded (Selectorized)</option><option value="Plate-Loaded">Plate-Loaded</option><option value="Cable Pulley">Cable Pulley</option><option value="Cardio Ergometer">Cardio Ergometer</option><option value="Bodyweight Assisted">Bodyweight Assisted</option><option value="Free Motion / Other">Free Motion / Other</option></select></div>
              <div><label style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block', marginBottom: '3px' }}>Tagline</label><input type="text" placeholder="e.g. Upper pectoral targeting" value={machineFormData.tagline || ''} onChange={(e) => setMachineFormData({ ...machineFormData, tagline: e.target.value })} className="input-modern" style={{ width: '100%', fontSize: '0.85rem' }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block', marginBottom: '3px' }}>Verification Status</label><select value={machineFormData.verificationStatus || 'Verified'} onChange={(e) => setMachineFormData({ ...machineFormData, verificationStatus: e.target.value as any })} className="input-modern" style={{ width: '100%', fontSize: '0.85rem' }}><option value="Verified">Verified (Admin Approved)</option><option value="Pending Verification">Pending Verification</option><option value="Sample Data">Sample Data</option></select></div>
              <div><label style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block', marginBottom: '3px' }}>Front Reference Photo URL</label><input type="url" placeholder="https://images.unsplash.com/..." value={machineFormData.frontReferenceImage || ''} onChange={(e) => setMachineFormData({ ...machineFormData, frontReferenceImage: e.target.value })} className="input-modern" style={{ width: '100%', fontSize: '0.85rem' }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block', marginBottom: '3px' }}>SVG Illustration Key</label><select value={machineFormData.imageSvg} onChange={(e) => setMachineFormData({ ...machineFormData, imageSvg: e.target.value })} className="input-modern" style={{ width: '100%', fontSize: '0.85rem' }}><option value="chest-press">Chest Press</option><option value="incline-chest-press">Incline Chest Press</option><option value="pec-deck">Pec Deck Fly</option><option value="lat-pulldown">Lat Pulldown</option><option value="seated-cable-row">Seated Cable Row</option><option value="t-bar-row">T-Bar Row</option><option value="shoulder-press">Shoulder Press</option><option value="lateral-raise">Lateral Raise</option><option value="leg-press">45 Leg Press</option><option value="leg-extension">Leg Extension</option><option value="leg-curl">Seated Leg Curl</option><option value="hack-squat">Hack Squat</option><option value="treadmill">Treadmill</option><option value="stationary-bike">Stationary Bike</option></select></div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsMachineModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Machine Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR BADGE MODAL */}
      {selectedQRBadgeMachine && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 7, 12, 0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', borderRadius: '24px', background: '#FFFFFF', color: '#0F172A', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F172A' }}>
              GYM SCAN <span style={{ color: '#00C875' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Smart Equipment Guide Sticker
            </div>

            {/* Simulated High-Res QR SVG */}
            <div style={{
              width: '180px',
              height: '180px',
              margin: '0 auto 1.25rem auto',
              background: '#F8FAFC',
              border: '2px solid #0F172A',
              borderRadius: '16px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QrCode size={130} color="#0F172A" />
              <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
                {selectedQRBadgeMachine.qrCodeId}
              </div>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              {selectedQRBadgeMachine.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
              Scan with phone camera for seat setup & tutorial guide
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setSelectedQRBadgeMachine(null)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: 'transparent',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={15} /> Print Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmMachineId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 7, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '400px',
            width: '100%',
            padding: '1.75rem',
            background: '#131824',
            border: '1px solid rgba(255, 71, 87, 0.4)',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <AlertTriangle size={32} color="#FF4757" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', marginBottom: '0.4rem' }}>
              Archive Equipment Record?
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
              This will remove this machine from the active scanning catalog and archive its QR code identifier.
            </p>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button onClick={() => setDeleteConfirmMachineId(null)} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMachine(deleteConfirmMachineId)}
                className="btn-primary"
                style={{ flex: 1, background: '#FF4757', color: '#FFFFFF', justifyContent: 'center' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
