'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Download, ExternalLink, Calendar, MapPin, Building2, User,
  Award, ArrowLeft, Filter, Trash2, Globe, PlusCircle, X, Pencil,
  CheckCircle2, Clock, AlertCircle, Search, ShieldCheck, KeyRound, RotateCcw, Eye, Lock, LogOut, ArrowRight, Timer, FileSpreadsheet, Save
} from 'lucide-react';
import Link from 'next/link';
import { CRITERIA_TREE } from '@/data/criteria';
import { generateDocxReport } from '@/lib/exportDocx';

interface Proposal {
  id: string;
  created_at: string;
  student_name: string;
  student_id: string;
  activity_title: string;
  organizer: string;
  target_audience: string;
  project_url: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string | null;
  completion_condition?: string | null;
  location: string;
  target_standard: string;
  target_sub_criterion: string;
  target_levels: string[];
  proof_method: string;
  note: string;
  status: string;
}

interface Activity {
  id: string | number;
  title: string;
  organizer: string;
  target_audience?: string | null;
  content_description?: string | null;
  project_url?: string | null;
  start_date: string;
  end_date: string;
  registration_deadline?: string | null;
  completion_condition?: string | null;
  location?: string | null;
  proof_method?: string | null;
  supported_standard: string;
  criteria_detail?: string | null;
  target_levels?: string[];
  proposal_id?: string | null;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface StudentProfile {
  student_id: string;
  pin_code: string;
  created_at: string;
}

interface StudentActivityItem {
  id: number;
  student_id: string;
  activity_title: string;
  organizer?: string;
  target_standard: string;
  criteria_detail: string;
  completion_condition?: string | null;
  participation_date: string;
  proof_url?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  academic_year: string; // Thêm trường này để lọc theo năm
}

interface AcademicInfo {
  student_id: string;
  full_name: string;
  gender: string;
  birth_year: string;
  ethnicity: string;
  class_name: string;
  student_year: string;
  position: string;
  union_status: string;
  phone: string;
  email_sis: string;
  faculty_name: string;
  drl_sem1: number | string;
  drl_sem2: number | string;
  gpa_sem1: number | string;
  credits_sem1: number | string;
  gpa_sem2: number | string;
  credits_sem2: number | string;
  physical_education_status: string;
  foreign_language_status: string;
  other_achievements: string;
}

const CRITERIA_MAP: Record<string, string> = {
  DAO_DUC: 'Đạo đức tốt',
  HOC_TAP: 'Học tập tốt',
  THE_LUC: 'Thể lực tốt',
  TINH_NGUYEN: 'Tình nguyện tốt',
  HOI_NHAP: 'Hội nhập tốt',
};

const PROPOSAL_STATUS: Record<string, { label: string; badgeClass: string }> = {
  PENDING: { label: 'Mới tiếp nhận', badgeClass: 'bg-amber-50 text-amber-700 border-amber-300' },
  SUBMITTED: { label: 'Đã gửi đề xuất', badgeClass: 'bg-blue-50 text-blue-700 border-blue-300' },
  APPROVED: { label: 'Đã công nhận', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  REJECTED: { label: 'Từ chối', badgeClass: 'bg-rose-50 text-rose-700 border-rose-300' },
};

const ACTIVITY_STATUS: Record<string, { label: string; badgeClass: string }> = {
  APPROVED: { label: '🟢 Tự động ghi nhận', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  PENDING: { label: '🟡 Chờ xét duyệt', badgeClass: 'bg-amber-50 text-amber-700 border-amber-300' },
  REJECTED: { label: '🔴 Không công nhận (Loại)', badgeClass: 'bg-rose-50 text-rose-700 border-rose-300' },
};

const FACULTIES = [
  'Trường Công nghệ Thông tin và Truyền thông',
  'Trường Điện – Điện tử',
  'Trường Cơ khí',
  'Trường Hóa và Khoa học Sự sống',
  'Trường Vật liệu',
  'Trường Kinh tế',
  'Khoa Khoa học và Công nghệ giáo dục',
  'Khoa Vật lý kỹ thuật',
  'Khoa Toán - Tin',
  'Khoa Ngoại ngữ'
];

const ADMIN_SECRET_KEY = '10012005';

const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const isAfterSep15 = month > 9 || (month === 9 && day >= 15);
  return isAfterSep15 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const formatDatetimeLocal = (isoStr?: string | null) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDateVN = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

const formatDateTimeVN = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ngày ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export default function SummaryPage() {
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminKeyInput, setAdminKeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'ACTIVITIES' | 'PROPOSALS' | 'STUDENTS'>('ACTIVITIES');

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [officialActivities, setOfficialActivities] = useState<Activity[]>([]);
  const [filterStandard, setFilterStandard] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [updating, setUpdating] = useState(false);

  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [allStudentActivities, setAllStudentActivities] = useState<StudentActivityItem[]>([]);
  const [studentSearchMssv, setStudentSearchMssv] = useState('');

  // States cho chức năng quản lý Hồ sơ sinh viên
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<string | null>(null);
  const [detailAcademicYear, setDetailAcademicYear] = useState<string>(getCurrentAcademicYear());
  const [studentAcademicData, setStudentAcademicData] = useState<AcademicInfo | null>(null);
  const [isEditStudentProfileOpen, setIsEditStudentProfileOpen] = useState(false);
  const [savingStudentProfile, setSavingStudentProfile] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  const [officialForm, setOfficialForm] = useState({
    title: '', criteria_detail: '', organizer: '', target_standard: 'DAO_DUC', target_levels: ['DAI_HOC'],
    target_audience: 'Toàn thể sinh viên Đại học Bách khoa Hà Nội', content_description: '', start_date: '',
    end_date: '', registration_deadline: '', completion_condition: '', location: '', proof_method: '',
    project_url: '', status: 'APPROVED' as 'APPROVED' | 'PENDING',
  });

  useEffect(() => {
    try {
      const isAuth = sessionStorage.getItem('sv5t_admin_authenticated');
      if (isAuth === 'true') {
        setIsAuthenticated(true);
      }
      const savedTab = sessionStorage.getItem('sv5t_admin_active_tab') as any;
      if (savedTab && ['ACTIVITIES', 'PROPOSALS', 'STUDENTS'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  const fetchProposals = async () => {
    const { data, error } = await supabase.from('proposals').select('*').order('created_at', { ascending: false });
    if (!error && data) setProposals(data);
  };

  const fetchOfficialActivities = async () => {
    const { data, error } = await supabase.from('activities').select('*').order('start_date', { ascending: false });
    if (!error && data) setOfficialActivities(data as Activity[]);
  };

  const fetchStudentsData = async () => {
    const [{ data: profiles }, { data: acts }] = await Promise.all([
      supabase.from('student_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('student_activities').select('*').order('participation_date', { ascending: false })
    ]);
    if (profiles) setStudentProfiles(profiles);
    if (acts) setAllStudentActivities(acts);
  };

  const fetchStudentAcademicData = async (mssv: string, year: string) => {
    const { data: currentData } = await supabase
      .from('student_academic_info')
      .select('*')
      .eq('student_id', mssv.trim())
      .eq('academic_year', year)
      .maybeSingle();

    const { data: latestData } = await supabase
      .from('student_academic_info')
      .select('*')
      .eq('student_id', mssv.trim())
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const mergedData = {
      student_id: mssv,
      full_name: currentData?.full_name || latestData?.full_name || '',
      gender: currentData?.gender || latestData?.gender || 'Nam',
      birth_year: currentData?.birth_year || latestData?.birth_year || '',
      ethnicity: currentData?.ethnicity || latestData?.ethnicity || 'Kinh',
      class_name: currentData?.class_name || latestData?.class_name || '',
      faculty_name: currentData?.faculty_name || latestData?.faculty_name || 'Trường Công nghệ Thông tin và Truyền thông',
      email_sis: currentData?.email_sis || latestData?.email_sis || '',
      phone: currentData?.phone || latestData?.phone || '',
      student_year: currentData?.student_year || latestData?.student_year || '',
      position: currentData?.position || latestData?.position || 'Không',
      union_status: currentData?.union_status || latestData?.union_status || 'Đoàn viên',
      physical_education_status: currentData?.physical_education_status || latestData?.physical_education_status || 'Hoàn thành đủ 05 học phần GDTC',
      foreign_language_status: currentData?.foreign_language_status || latestData?.foreign_language_status || '',
      other_achievements: currentData?.other_achievements || latestData?.other_achievements || '',
      drl_sem1: currentData?.drl_sem1 || 0,
      drl_sem2: currentData?.drl_sem2 || 0,
      gpa_sem1: currentData?.gpa_sem1 || 0,
      credits_sem1: currentData?.credits_sem1 || 0,
      gpa_sem2: currentData?.gpa_sem2 || 0,
      credits_sem2: currentData?.credits_sem2 || 0,
    };

    setStudentAcademicData(mergedData);
  };

  useEffect(() => {
    if (selectedStudentDetail) {
      fetchStudentAcademicData(selectedStudentDetail, detailAcademicYear);
    }
  }, [selectedStudentDetail, detailAcademicYear]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProposals(), fetchOfficialActivities(), fetchStudentsData()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleTabChange = (tab: 'ACTIVITIES' | 'PROPOSALS' | 'STUDENTS') => {
    setActiveTab(tab);
    sessionStorage.setItem('sv5t_admin_active_tab', tab);
  };

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKeyInput === ADMIN_SECRET_KEY) {
      sessionStorage.setItem('sv5t_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mật khẩu quản trị không chính xác!');
    }
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('sv5t_admin_authenticated');
    sessionStorage.removeItem('sv5t_admin_active_tab');
    setIsAuthenticated(false);
    setAdminKeyInput('');
  };

  const handleResetPin = async (mssv: string) => {
    const confirmReset = confirm(`Xác nhận đặt lại mật khẩu cho MSSV: ${mssv}?`);
    if (!confirmReset) return;

    const { error } = await supabase.from('student_profiles').delete().eq('student_id', mssv);
    if (error) { alert('Lỗi: ' + error.message); }
    else {
      alert(`Đã đặt lại mật khẩu của MSSV ${mssv}!`);
      setStudentProfiles((prev) => prev.filter((p) => p.student_id !== mssv));
    }
  };

  const handleActivityStatusChange = async (act: Activity, newStatus: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    const confirmChange = confirm(`Xác nhận đổi trạng thái hoạt động này?`);
    if (!confirmChange) return;

    const { error: actError } = await supabase.from('activities').update({ status: newStatus }).eq('id', act.id);
    if (actError) { alert('Lỗi: ' + actError.message); return; }

    await supabase.from('student_activities').update({ status: newStatus }).eq('activity_id', String(act.id));

    setOfficialActivities((prev) => prev.map((item) => (String(item.id) === String(act.id) ? { ...item, status: newStatus } : item)));
    setAllStudentActivities((prev) => prev.map((item) => item.activity_title === act.title ? { ...item, status: newStatus } : item));
    alert('Đã cập nhật trạng thái thành công!');
  };

  const handleCreateOfficialActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const newRow = {
      title: officialForm.title.trim(),
      organizer: officialForm.organizer.trim(),
      target_audience: officialForm.target_audience,
      content_description: officialForm.content_description || 'Hoạt động hỗ trợ tiêu chuẩn Sinh viên 5 tốt.',
      project_url: officialForm.project_url?.trim() || null,
      start_date: officialForm.start_date,
      end_date: officialForm.end_date || officialForm.start_date,
      registration_deadline: officialForm.registration_deadline ? new Date(officialForm.registration_deadline).toISOString() : null,
      completion_condition: officialForm.completion_condition?.trim() || null,
      location: officialForm.location?.trim() || null,
      proof_method: officialForm.proof_method.trim(),
      supported_standard: officialForm.target_standard,
      criteria_detail: officialForm.criteria_detail,
      target_levels: officialForm.target_levels,
      status: officialForm.status,
    };

    const { data, error } = await supabase.from('activities').insert([newRow]).select();
    setCreating(false);

    if (error) { alert('Lỗi khi thêm hoạt động: ' + error.message); }
    else {
      if (data && data.length > 0) setOfficialActivities((prev) => [data[0] as Activity, ...prev]);
      setIsAddModalOpen(false);
      alert('Thêm hoạt động thành công!');
    }
  };

  const handleOpenEditActivity = (act: Activity) => {
    setEditingActivity({ ...act });
    setIsEditModalOpen(true);
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    setUpdating(true);

    let deadlineIso: string | null = null;
    if (editingActivity.registration_deadline) {
      const parsed = new Date(editingActivity.registration_deadline);
      if (!isNaN(parsed.getTime())) deadlineIso = parsed.toISOString();
    }

    const updatePayload = {
      title: editingActivity.title.trim(),
      organizer: editingActivity.organizer.trim(),
      target_audience: editingActivity.target_audience || 'Toàn thể sinh viên Đại học Bách khoa Hà Nội',
      start_date: editingActivity.start_date,
      end_date: editingActivity.end_date || editingActivity.start_date,
      registration_deadline: deadlineIso,
      completion_condition: editingActivity.completion_condition?.trim() || null,
      location: editingActivity.location?.trim() || null,
      proof_method: editingActivity.proof_method?.trim() || '',
      supported_standard: editingActivity.supported_standard,
      criteria_detail: editingActivity.criteria_detail,
      target_levels: editingActivity.target_levels,
      project_url: editingActivity.project_url?.trim() || null,
      status: editingActivity.status || 'APPROVED',
    };

    const { data: updatedRows, error } = await supabase.from('activities').update(updatePayload).eq('id', editingActivity.id).select();

    if (error) { setUpdating(false); alert('Lỗi khi cập nhật: ' + error.message); return; }

    const updatedItem: Activity = updatedRows && updatedRows.length > 0 ? (updatedRows[0] as Activity) : { ...editingActivity, ...updatePayload };

    setOfficialActivities((prev) => prev.map((item) => String(item.id) === String(editingActivity.id) ? updatedItem : item));

    await supabase.from('student_activities').update({
      activity_title: updatedItem.title, criteria_detail: updatedItem.criteria_detail || '',
      completion_condition: updatedItem.completion_condition, status: updatedItem.status,
    }).eq('activity_id', String(editingActivity.id));

    setUpdating(false);
    setIsEditModalOpen(false);
    alert('Đã cập nhật hoạt động!');
  };

  const handleDeleteOfficialActivity = async (id: string | number, title: string) => {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa hoạt động:\n"${title}"\nkhỏi hệ thống không?`);
    if (!confirmDelete) return;

    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) { alert('Không thể xóa: ' + error.message); return; }
    setOfficialActivities((prev) => prev.filter((a) => String(a.id) !== String(id)));
  };

  const handleDeleteProposal = async (id: string, title: string) => {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa đề xuất:\n"${title}"?`);
    if (!confirmDelete) return;

    await supabase.from('activities').delete().eq('proposal_id', id);
    const { error } = await supabase.from('proposals').delete().eq('id', id);
    if (error) { alert('Không thể xóa: ' + error.message); return; }
    setProposals((prev) => prev.filter((p) => p.id !== id));
    await fetchOfficialActivities();
  };

  const handlePublishToHome = async (prop: Proposal, isSilent = false) => {
    if (!isSilent) {
      const confirmPublish = confirm(`Đăng hoạt động "${prop.activity_title}" ra ngoài Trang chủ?`);
      if (!confirmPublish) return;
    }

    setPublishingId(prop.id);
    const { data, error } = await supabase.from('activities').insert([{
      proposal_id: prop.id, title: prop.activity_title, organizer: prop.organizer,
      target_audience: prop.target_audience, content_description: `Đối tượng: ${prop.target_audience}. Tiêu chí: ${prop.target_sub_criterion}`,
      project_url: prop.project_url, start_date: prop.start_date, end_date: prop.end_date,
      registration_deadline: prop.registration_deadline ? new Date(prop.registration_deadline).toISOString() : null,
      completion_condition: prop.completion_condition || null, location: prop.location || null, proof_method: prop.proof_method,
      supported_standard: prop.target_standard, criteria_detail: prop.target_sub_criterion, target_levels: prop.target_levels, status: 'APPROVED',
    }]).select();

    setPublishingId(null);
    if (error) { alert('Có lỗi khi đưa lên Trang chủ: ' + error.message); }
    else {
      if (data && data.length > 0) setOfficialActivities((prev) => [data[0] as Activity, ...prev]);
      if (!isSilent) alert('Đã đăng lên Trang chủ thành công!');
    }
  };

  const handleProposalStatusChange = async (proposal: Proposal, newStatus: string) => {
    const { error } = await supabase.from('proposals').update({ status: newStatus }).eq('id', proposal.id);
    if (error) { alert('Không thể cập nhật trạng thái: ' + error.message); return; }

    setProposals((prev) => prev.map((p) => (p.id === proposal.id ? { ...p, status: newStatus } : p)));

    if (newStatus === 'APPROVED') {
      const isAlreadyPublished = officialActivities.some((act) => act.proposal_id === proposal.id || act.title === proposal.activity_title);
      if (!isAlreadyPublished) {
        await handlePublishToHome(proposal, true);
        alert(`Đã tự động đưa đề xuất "${proposal.activity_title}" ra Trang chủ thành công!`);
      }
    }
  };

  const handleSaveStudentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAcademicData) return;
    setSavingStudentProfile(true);

    const payload = {
      ...studentAcademicData,
      academic_year: detailAcademicYear,
      drl_sem1: Number(studentAcademicData.drl_sem1) || 0,
      drl_sem2: Number(studentAcademicData.drl_sem2) || 0,
      gpa_sem1: Number(studentAcademicData.gpa_sem1) || 0,
      credits_sem1: Number(studentAcademicData.credits_sem1) || 0,
      gpa_sem2: Number(studentAcademicData.gpa_sem2) || 0,
      credits_sem2: Number(studentAcademicData.credits_sem2) || 0,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('student_academic_info').upsert(payload);
    setSavingStudentProfile(false);

    if (error) {
      alert('Lỗi lưu thông tin: ' + error.message);
    } else {
      alert('Đã cập nhật hồ sơ sinh viên thành công!');
      setIsEditStudentProfileOpen(false);
      // Refresh detail to show updated info
      if (selectedStudentDetail) {
        fetchStudentAcademicData(selectedStudentDetail, detailAcademicYear);
      }
    }
  };

  const exportToCSV = () => {
    if (filteredProposals.length === 0) { alert('Không có dữ liệu!'); return; }
    const headers = ['STT', 'Người đề xuất', 'MSSV', 'Tên hoạt động', 'Đơn vị tổ chức', 'Thời gian', 'Hạn chót đăng ký', 'Địa điểm', 'Tiêu chuẩn', 'Tiêu chí chi tiết', 'Điều kiện hoàn thành', 'Cấp xét', 'Cách thức minh chứng', 'Link đề án', 'Ghi chú', 'Trạng thái'];
    const rows = filteredProposals.map((p, index) => [
      index + 1, `"${p.student_name}"`, `"${p.student_id}"`, `"${p.activity_title.replace(/"/g, '""')}"`, `"${p.organizer.replace(/"/g, '""')}"`,
      `"${formatDateVN(p.start_date)} -> ${formatDateVN(p.end_date)}"`, `"${p.registration_deadline ? formatDateTimeVN(p.registration_deadline) : ''}"`, `"${(p.location || '').replace(/"/g, '""')}"`,
      `"${CRITERIA_MAP[p.target_standard] || p.target_standard}"`, `"${p.target_sub_criterion.replace(/"/g, '""')}"`, `"${(p.completion_condition || '').replace(/"/g, '""')}"`,
      `"${p.target_levels?.join(', ')}"`, `"${p.proof_method.replace(/"/g, '""')}"`, `"${p.project_url}"`, `"${(p.note || '').replace(/"/g, '""')}"`, `"${PROPOSAL_STATUS[p.status]?.label || p.status}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `De_xuat_SV5T_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const adminCalculatedStats = useMemo(() => {
    if (!studentAcademicData) return { averageGpa: 0, averageDrl: 0, totalCredits: 0 };
    const totalCredits = (Number(studentAcademicData.credits_sem1) || 0) + (Number(studentAcademicData.credits_sem2) || 0);
    let averageGpa = 0;
    if (totalCredits > 0) {
      const weightedSum =
        (Number(studentAcademicData.gpa_sem1) || 0) * (Number(studentAcademicData.credits_sem1) || 0) +
        (Number(studentAcademicData.gpa_sem2) || 0) * (Number(studentAcademicData.credits_sem2) || 0);
      averageGpa = Number((weightedSum / totalCredits).toFixed(2));
    }
    const averageDrl = Number((((Number(studentAcademicData.drl_sem1) || 0) + (Number(studentAcademicData.drl_sem2) || 0)) / 2).toFixed(1));
    return { averageGpa, averageDrl, totalCredits };
  }, [studentAcademicData]);

  const filteredProposals = proposals.filter((p) => {
    const matchStandard = filterStandard === 'ALL' ? true : p.target_standard === filterStandard;
    const matchStatus = filterStatus === 'ALL' ? true : p.status === filterStatus;
    return matchStandard && matchStatus;
  });

  const filteredActivities = officialActivities.filter((act) => {
    return filterStandard === 'ALL' ? true : act.supported_standard === filterStandard;
  });

  const filteredStudents = useMemo(() => {
    if (!studentSearchMssv.trim()) return studentProfiles;
    return studentProfiles.filter((p) => p.student_id.includes(studentSearchMssv.trim()));
  }, [studentProfiles, studentSearchMssv]);

  const studentDetailActivities = useMemo(() => {
    if (!selectedStudentDetail) return [];
    return allStudentActivities.filter((a) => a.student_id === selectedStudentDetail && a.academic_year === detailAcademicYear);
  }, [selectedStudentDetail, allStudentActivities, detailAcademicYear]);

  const handleAdminExportDocx = async () => {
    if (!studentAcademicData?.full_name) {
      alert('Sinh viên chưa điền đủ thông tin hồ sơ cho năm học này. Quản trị viên vui lòng Cập nhật thông tin trước khi xuất!');
      return;
    }
    try {
      setExportingDocx(true);
      await generateDocxReport({
        academicData: studentAcademicData,
        records: studentDetailActivities,
        academicYear: detailAcademicYear,
        calculatedStats: adminCalculatedStats,
      });
    } catch (error: any) {
      alert('Lỗi xuất file Word: ' + error.message);
    } finally {
      setExportingDocx(false);
    }
  };

  if (isAuthChecking) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs text-slate-400">
        <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#0C5776] border-t-transparent rounded-full animate-spin"></div><span>Đang kiểm tra quyền...</span></div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
        <div>
          <header className="bg-[#001C44] text-white border-b border-[#0C5776] shadow-sm">
            <div className="max-w-5xl mx-auto px-4 py-6">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#BCFEFE] hover:underline"><ArrowLeft className="w-3.5 h-3.5" /> Về Trang chủ</Link>
              <h1 className="text-xl sm:text-2xl font-bold mt-2">Trang Quản trị</h1>
            </div>
          </header>
          <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in zoom-in duration-150">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
              <div className="w-16 h-16 bg-[#0C5776]/10 text-[#0C5776] rounded-2xl flex items-center justify-center mx-auto"><Lock className="w-8 h-8" /></div>
              <div>
                <h2 className="text-lg font-bold text-[#001C44]">Xác thực quyền Quản trị</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Nhập mật khẩu quản trị viên để mở khóa.</p>
              </div>
              <form onSubmit={handleLoginAdmin} className="space-y-4">
                <input type="password" required autoFocus placeholder="Nhập mật khẩu quản trị..." value={adminKeyInput} onChange={(e) => setAdminKeyInput(e.target.value)} className="w-full px-4 py-3 text-lg text-center font-bold tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white" />
                {authError && <p className="text-xs text-rose-600 font-medium">{authError}</p>}
                <button type="submit" className="w-full py-3 bg-[#0C5776] hover:bg-[#001C44] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                  <span>Xác thực truy cập</span><ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      <div>
        <header className="bg-[#001C44] text-white border-b border-[#0C5776] shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#BCFEFE] hover:underline mb-2"><ArrowLeft className="w-3.5 h-3.5" /> Về Trang chủ</Link>
                <h1 className="text-xl sm:text-2xl font-bold">Trang Quản trị</h1>
                <p className="text-xs text-[#BCFEFE]/80 mt-1">Phê duyệt hoạt động, điều chỉnh trạng thái và quản lý hồ sơ sinh viên toàn hệ thống.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#001C44] text-xs font-semibold hover:bg-[#BCFEFE] transition-all shadow-sm">
                  <PlusCircle className="w-4 h-4 text-[#0C5776]" /> Thêm hoạt động mới
                </button>
                <button onClick={exportToCSV} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BCFEFE] text-[#001C44] text-xs font-semibold hover:bg-white transition-all shadow-sm">
                  <Download className="w-4 h-4" /> Xuất Excel (CSV)
                </button>
                <button onClick={handleLogoutAdmin} title="Khóa trang quản trị" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-rose-600 text-white text-xs font-semibold transition-all border border-white/20">
                  <LogOut className="w-4 h-4" /> <span>Khóa trang</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="flex border-b border-slate-200 gap-4 mb-4">
            <button onClick={() => handleTabChange('ACTIVITIES')} className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'ACTIVITIES' ? 'border-[#0C5776] text-[#001C44]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <Globe className="w-4 h-4 text-[#0C5776]" /> Hoạt động trên hệ thống <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-[#0C5776] font-bold">{officialActivities.length}</span>
            </button>
            <button onClick={() => handleTabChange('PROPOSALS')} className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'PROPOSALS' ? 'border-[#0C5776] text-[#001C44]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              Đề xuất từ sinh viên <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{proposals.length}</span>
            </button>
            <button onClick={() => handleTabChange('STUDENTS')} className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'STUDENTS' ? 'border-[#0C5776] text-[#001C44]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <User className="w-4 h-4 text-[#0C5776]" /> Hồ sơ sinh viên <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">{studentProfiles.length}</span>
            </button>
          </div>

          {activeTab !== 'STUDENTS' && (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs mb-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#0C5776]" /> <span className="font-medium">Tiêu chuẩn:</span>
                  <select value={filterStandard} onChange={(e) => setFilterStandard(e.target.value)} className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776]">
                    <option value="ALL">Tất cả</option><option value="DAO_DUC">Đạo đức tốt</option><option value="HOC_TAP">Học tập tốt</option><option value="THE_LUC">Thể lực tốt</option><option value="TINH_NGUYEN">Tình nguyện tốt</option><option value="HOI_NHAP">Hội nhập tốt</option>
                  </select>
                </div>
                {activeTab === 'PROPOSALS' && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Trạng thái:</span>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776]">
                      <option value="ALL">Tất cả</option><option value="PENDING">🟡 Mới tiếp nhận</option><option value="SUBMITTED">🔵 Đã gửi đề xuất</option><option value="APPROVED">🟢 Đã công nhận</option><option value="REJECTED">🔴 Từ chối</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500">Hiển thị: <strong className="text-[#001C44]">{activeTab === 'ACTIVITIES' ? filteredActivities.length : filteredProposals.length}</strong> hoạt động</div>
            </div>
          )}

          {activeTab === 'ACTIVITIES' && (
            <div className="space-y-4">
              {loading ? <div className="py-12 text-center text-xs text-slate-500">Đang tải danh sách hoạt động...</div> : filteredActivities.length === 0 ? <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">Chưa có hoạt động nào phù hợp.</div> : (
                filteredActivities.map((act) => {
                  const currentStatus = act.status || 'APPROVED';
                  const statusConfig = ACTIVITY_STATUS[currentStatus] || ACTIVITY_STATUS.APPROVED;
                  return (
                    <div key={act.id} className={`bg-white border rounded-xl p-5 shadow-xs space-y-3 transition-all ${currentStatus === 'REJECTED' ? 'border-rose-200 bg-rose-50/15' : currentStatus === 'PENDING' ? 'border-amber-200 bg-amber-50/15' : 'border-slate-200 hover:border-[#2D99AE]/60'}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#0C5776] text-white">{CRITERIA_MAP[act.supported_standard] || act.supported_standard}</span>
                          <div className="flex gap-1">
                            {act.target_levels?.map((lvl) => (<span key={lvl} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">{lvl === 'DAI_HOC' ? 'Cấp ĐH' : lvl === 'THANH_PHO' ? 'Cấp TP' : 'Cấp TW'}</span>))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
                          <select value={currentStatus} onChange={(e) => handleActivityStatusChange(act, e.target.value as any)} className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${statusConfig.badgeClass}`}>
                            <option value="APPROVED">🟢 Tự động ghi nhận</option><option value="PENDING">🟡 Chờ xét duyệt</option><option value="REJECTED">🔴 Loại (Không công nhận)</option>
                          </select>
                          <button onClick={() => handleOpenEditActivity(act)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"><Pencil className="w-3.5 h-3.5 text-[#0C5776]" /><span>Sửa</span></button>
                          <button onClick={() => handleDeleteOfficialActivity(act.id, act.title)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /><span>Xóa</span></button>
                        </div>
                      </div>
                      <div>
                        <h2 className={`text-base font-bold ${currentStatus === 'REJECTED' ? 'text-rose-900 line-through opacity-80' : 'text-[#001C44]'}`}>{act.title}</h2>
                        {act.criteria_detail && <div className="mt-2 p-2.5 rounded-lg bg-[#BCFEFE]/15 border border-[#2D99AE]/25 text-xs text-[#001C44] flex items-start gap-2"><Award className="w-4 h-4 text-[#0C5776] shrink-0 mt-0.5" /><div><span className="font-semibold text-[#0C5776]">Tiêu chí tương ứng:</span> <span className="text-slate-700">{act.criteria_detail}</span></div></div>}
                        {act.completion_condition && <div className="mt-1.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><div><span className="font-semibold text-amber-800">Điều kiện ghi nhận:</span> <span className="text-slate-700 font-medium">{act.completion_condition}</span></div></div>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" /><span>Đơn vị tổ chức: <strong>{act.organizer}</strong></span></div>
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" /><span>Thời gian: {formatDateVN(act.start_date)} → {formatDateVN(act.end_date)}</span></div>
                        {act.registration_deadline && <div className="flex items-center gap-2"><Timer className="w-3.5 h-3.5 text-rose-500 shrink-0" /><span>Hạn đăng ký: <strong className="text-rose-600">{formatDateTimeVN(act.registration_deadline)}</strong></span></div>}
                        {act.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" /><span>Địa điểm: <strong>{act.location}</strong></span></div>}
                        {act.proof_method && <div className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" /><span>Minh chứng: {act.proof_method}</span></div>}
                      </div>
                      {act.project_url && <div className="pt-1"><a href={act.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#0C5776] hover:text-[#001C44] font-semibold underline">Xem bài viết chi tiết <ExternalLink className="w-3 h-3" /></a></div>}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'PROPOSALS' && (
            <div className="space-y-4">
              {loading ? <div className="py-12 text-center text-xs text-slate-500">Đang tải đề xuất...</div> : filteredProposals.length === 0 ? <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">Không tìm thấy đề xuất nào phù hợp.</div> : (
                filteredProposals.map((prop) => {
                  const currentStatus = PROPOSAL_STATUS[prop.status] || { label: prop.status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
                  const isPublished = officialActivities.some((act) => act.proposal_id === prop.id || act.title === prop.activity_title);
                  return (
                    <div key={prop.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-[#2D99AE]/60 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#0C5776] text-white">{CRITERIA_MAP[prop.target_standard] || prop.target_standard}</span>
                          <div className="flex gap-1">
                            {prop.target_levels?.map((lvl) => (<span key={lvl} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">{lvl === 'DAI_HOC' ? 'Cấp ĐH' : lvl === 'THANH_PHO' ? 'Cấp TP' : 'Cấp TW'}</span>))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Tình trạng:</span>
                          <select value={prop.status} onChange={(e) => handleProposalStatusChange(prop, e.target.value)} className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${currentStatus.badgeClass}`}>
                            <option value="PENDING">🟡 Mới tiếp nhận</option><option value="SUBMITTED">🔵 Đã gửi đề xuất</option><option value="APPROVED">🟢 Đã công nhận</option><option value="REJECTED">🔴 Từ chối</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#001C44]">{prop.activity_title}</h2>
                        <div className="mt-2 p-2.5 rounded-lg bg-[#BCFEFE]/15 border border-[#2D99AE]/25 text-xs text-[#001C44] flex items-start gap-2"><Award className="w-4 h-4 text-[#0C5776] shrink-0 mt-0.5" /><div><span className="font-semibold text-[#0C5776]">Tiêu chí tương ứng:</span> <span className="text-slate-700">{prop.target_sub_criterion}</span></div></div>
                        {prop.completion_condition && <div className="mt-1.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><div><span className="font-semibold text-amber-800">Điều kiện ghi nhận:</span> <span className="text-slate-700 font-medium">{prop.completion_condition}</span></div></div>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" /><span>Đơn vị tổ chức: <strong>{prop.organizer}</strong></span></div>
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" /><span>Thời gian: {formatDateVN(prop.start_date)} → {formatDateVN(prop.end_date)}</span></div>
                        {prop.registration_deadline && <div className="flex items-center gap-1.5"><Timer className="w-3.5 h-3.5 text-rose-500 shrink-0" /><span>Hạn đăng ký: <strong className="text-rose-600">{formatDateTimeVN(prop.registration_deadline)}</strong></span></div>}
                        {prop.location && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" /><span>Địa điểm: <strong>{prop.location}</strong></span></div>}
                        <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" /><span>Người đề xuất: <strong>{prop.student_name}</strong> ({prop.student_id})</span></div>
                      </div>
                      <div className="text-xs space-y-1 text-slate-700">
                        <p><strong>Cách thức minh chứng:</strong> {prop.proof_method}</p>
                        {prop.note && <p className="text-slate-500 italic"><strong>Ghi chú:</strong> {prop.note}</p>}
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <a href={prop.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#0C5776] hover:text-[#001C44] font-semibold underline">Xem bài viết gốc <ExternalLink className="w-3 h-3" /></a>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteProposal(prop.id, prop.activity_title)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /><span>Xóa</span></button>
                          {isPublished ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 select-none"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Đã đưa ra Trang chủ</span></span> : <button onClick={() => handlePublishToHome(prop)} disabled={publishingId === prop.id} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#0C5776] text-white hover:bg-[#001C44] transition-colors disabled:opacity-50 shadow-xs"><Globe className="w-3.5 h-3.5 text-[#BCFEFE]" /><span>{publishingId === prop.id ? 'Đang đăng...' : 'Đưa ra Trang chủ'}</span></button>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: DANH SÁCH TOÀN BỘ HỒ SƠ SINH VIÊN */}
          {activeTab === 'STUDENTS' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Lọc nhanh theo MSSV..." value={studentSearchMssv} onChange={(e) => setStudentSearchMssv(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white" />
                </div>
                <div className="text-xs text-slate-500">Tổng cộng: <strong className="text-[#001C44]">{studentProfiles.length}</strong> sinh viên đã tạo hồ sơ</div>
              </div>

              {loading ? <div className="py-12 text-center text-xs text-slate-500">Đang tải danh sách hồ sơ...</div> : filteredStudents.length === 0 ? <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">{studentSearchMssv ? `Không tìm thấy sinh viên có MSSV khớp với: "${studentSearchMssv}"` : 'Chưa có sinh viên nào tạo hồ sơ.'}</div> : (
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                        <tr>
                          <th className="px-4 py-3">STT</th><th className="px-4 py-3">MSSV</th><th className="px-4 py-3">Mật khẩu</th><th className="px-4 py-3 text-center">Hoạt động đã lưu</th><th className="px-4 py-3 text-center">Tiêu chí công nhận</th><th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((stu, index) => {
                          const stuActs = allStudentActivities.filter((a) => a.student_id === stu.student_id);
                          const approvedCount = stuActs.filter((a) => a.status === 'APPROVED').length;
                          return (
                            <tr key={stu.student_id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                              <td className="px-4 py-3 font-bold text-[#001C44]">{stu.student_id}</td>
                              <td className="px-4 py-3"><span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-mono font-bold text-[#0C5776] tracking-wider text-xs">{stu.pin_code}</span></td>
                              <td className="px-4 py-3 text-center font-medium">{stuActs.length}</td>
                              <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{approvedCount}</span></td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => setSelectedStudentDetail(stu.student_id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold">
                                    <Eye className="w-3.5 h-3.5 text-[#0C5776]" /><span>Xem & Quản lý</span>
                                  </button>
                                  <button onClick={() => handleResetPin(stu.student_id)} title="Đặt lại mật khẩu khi sinh viên quên" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold">
                                    <RotateCcw className="w-3.5 h-3.5" /><span>Đặt lại mật khẩu</span>
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
              )}

              {/* MODAL CHI TIẾT SINH VIÊN (DÀNH CHO ADMIN) */}
              {selectedStudentDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                  <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4 bg-white gap-4">
                      <div>
                        <h3 className="text-base font-bold text-[#001C44]">
                          Hồ sơ MSSV: <span className="text-[#0C5776]">{selectedStudentDetail}</span> {studentAcademicData?.full_name && `- ${studentAcademicData.full_name}`}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <select
                            value={detailAcademicYear}
                            onChange={(e) => setDetailAcademicYear(e.target.value)}
                            className="text-xs font-bold text-[#0C5776] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#0C5776]"
                          >
                            <option value="2024-2025">Năm học 2024 – 2025</option>
                            <option value="2025-2026">Năm học 2025 – 2026</option>
                            <option value="2026-2027">Năm học 2026 – 2027</option>
                            <option value="2027-2028">Năm học 2027 – 2028</option>
                          </select>
                          <span className="text-xs text-slate-500">
                            Mật khẩu: <strong className="text-slate-700">{studentProfiles.find(p => p.student_id === selectedStudentDetail)?.pin_code}</strong> • Có {studentDetailActivities.length} hoạt động
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsEditStudentProfileOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors">
                          <Pencil className="w-3.5 h-3.5" /> Sửa hồ sơ
                        </button>
                        <button onClick={handleAdminExportDocx} disabled={exportingDocx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold disabled:opacity-50 shadow-sm transition-colors">
                          <Download className="w-3.5 h-3.5 text-blue-200" /> {exportingDocx ? 'Đang tạo...' : 'Xem trước Đơn (Word)'}
                        </button>
                        <button type="button" onClick={() => setSelectedStudentDetail(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 ml-2">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-3 max-h-[calc(90vh-100px)] bg-slate-50">
                      {studentDetailActivities.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                          Sinh viên này chưa lưu hoạt động nào vào hồ sơ trong năm học đã chọn.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {studentDetailActivities.map((act) => (
                            <div key={act.id} className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 shadow-xs">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold px-2 py-0.5 rounded bg-[#0C5776] text-white text-[11px]">
                                  {CRITERIA_MAP[act.target_standard] || act.target_standard}
                                </span>
                                <span className="text-slate-400 font-medium">{act.participation_date}</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-[11px] border ${act.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : act.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
                                  {act.status === 'APPROVED' ? '✓ Đã công nhận' : act.status === 'PENDING' ? '⏳ Chờ xét' : '✕ Bị loại'}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#001C44]">{act.activity_title}</h4>
                              <p className="text-slate-600"><strong>Tiêu chí:</strong> {act.criteria_detail}</p>
                              {act.completion_condition && (
                                <p className="text-xs text-amber-800 bg-amber-50/80 border border-amber-200 px-2 py-1 rounded-md inline-block">
                                  <strong>Yêu cầu hoàn thành:</strong> {act.completion_condition}
                                </p>
                              )}
                              {act.organizer && <p className="text-slate-500">Đơn vị: {act.organizer}</p>}
                              {act.proof_url && (
                                <a href={act.proof_url} target="_blank" rel="noreferrer" className="text-[#0C5776] underline inline-flex items-center gap-1 pt-1 font-medium">
                                  Xem minh chứng <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL ADMIN CHỈNH SỬA HỒ SƠ SINH VIÊN */}
              {isEditStudentProfileOpen && studentAcademicData && (
                <div onClick={() => setIsEditStudentProfileOpen(false)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                  <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
                      <div>
                        <h3 className="text-base font-bold text-emerald-700 flex items-center gap-2"><Pencil className="w-4 h-4" /> Cập nhật hồ sơ sinh viên</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Admin đang chỉnh sửa dữ liệu của MSSV {selectedStudentDetail} (Năm học {detailAcademicYear})</p>
                      </div>
                      <button type="button" onClick={() => setIsEditStudentProfileOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSaveStudentProfile} className="flex flex-col overflow-hidden">
                      <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 max-h-[calc(92vh-130px)]">

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                          <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">1. Thông tin cá nhân</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block font-semibold mb-1">Họ và tên</label>
                              <input type="text" required value={studentAcademicData.full_name} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Giới tính</label>
                              <select value={studentAcademicData.gender} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, gender: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]">
                                <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block font-semibold mb-1">Năm sinh</label>
                              <input type="text" required value={studentAcademicData.birth_year} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, birth_year: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Dân tộc</label>
                              <input type="text" required value={studentAcademicData.ethnicity} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, ethnicity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Năm học thứ</label>
                              <select required value={studentAcademicData.student_year} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, student_year: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]">
                                <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                              </select>
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Đoàn/Đảng viên</label>
                              <select required value={studentAcademicData.union_status} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, union_status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]">
                                <option value="Đoàn viên">Đoàn viên</option><option value="Đảng viên">Đảng viên</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-semibold mb-1">Lớp</label>
                              <input type="text" required value={studentAcademicData.class_name} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, class_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Trường/Khoa</label>
                              <select required value={studentAcademicData.faculty_name} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, faculty_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-[#0C5776] focus:outline-none focus:border-[#0C5776]">
                                {FACULTIES.map((fac) => (<option key={fac} value={fac}>{fac}</option>))}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-4">
                              <label className="block font-semibold mb-1">Chức vụ Đoàn - Hội</label>
                              <input type="text" required value={studentAcademicData.position} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, position: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block font-semibold mb-1">Số điện thoại</label>
                              <input type="tel" required value={studentAcademicData.phone} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                            </div>
                            <div className="sm:col-span-5">
                              <label className="block font-semibold mb-1">Email SIS</label>
                              <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white focus-within:border-[#0C5776]">
                                <input type="text" required value={studentAcademicData.email_sis.replace(/@sis\.hust\.edu\.vn$/i, '')} onChange={(e) => { const prefix = e.target.value.trim().replace(/@sis\.hust\.edu\.vn$/i, ''); setStudentAcademicData({ ...studentAcademicData, email_sis: prefix ? `${prefix}@sis.hust.edu.vn` : '' }); }} className="w-full px-3 py-2 text-xs border-0 focus:outline-none bg-transparent" />
                                <span className="bg-slate-100 px-2.5 py-2 text-[11px] text-slate-500 font-mono select-none border-l border-slate-200 shrink-0">@sis.hust.edu.vn</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-emerald-50/30 p-3.5 rounded-xl border border-emerald-200 space-y-3">
                          <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">2. Kết quả Học tập & Rèn luyện</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                              <div className="font-semibold text-emerald-700">Kỳ học 1</div>
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">GPA</label>
                                <input type="number" step="0.01" min="0" max="4" value={studentAcademicData.gpa_sem1 === 0 ? '' : studentAcademicData.gpa_sem1} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, gpa_sem1: e.target.value })} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-bold text-[#0C5776]" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Tín chỉ</label>
                                <input type="number" min="0" value={studentAcademicData.credits_sem1 === 0 ? '' : studentAcademicData.credits_sem1} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, credits_sem1: e.target.value })} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Điểm rèn luyện</label>
                                <input type="number" min="0" max="100" value={studentAcademicData.drl_sem1 === 0 ? '' : studentAcademicData.drl_sem1} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, drl_sem1: e.target.value })} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-700" />
                              </div>
                            </div>
                            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                              <div className="font-semibold text-emerald-700">Kỳ học 2</div>
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">GPA</label>
                                <input type="number" step="0.01" min="0" max="4" value={studentAcademicData.gpa_sem2 === 0 ? '' : studentAcademicData.gpa_sem2} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, gpa_sem2: e.target.value })} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-bold text-[#0C5776]" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Tín chỉ</label>
                                <input type="number" min="0" value={studentAcademicData.credits_sem2 === 0 ? '' : studentAcademicData.credits_sem2} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, credits_sem2: e.target.value })} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Điểm rèn luyện</label>
                                <input type="number" min="0" max="100" value={studentAcademicData.drl_sem2 === 0 ? '' : studentAcademicData.drl_sem2} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, drl_sem2: e.target.value })} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-700" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                          <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">3. Thể lực & Ngoại ngữ</span>
                          <div>
                            <label className="block font-semibold mb-1">Giáo dục thể chất</label>
                            <select value={studentAcademicData.physical_education_status} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, physical_education_status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs">
                              <option value="">-- Chưa hoàn thành / Bổ sung sau --</option>
                              <option value="Hoàn thành chương trình đào tạo Giáo dục thể chất theo quy định tại Đại học Bách khoa Hà Nội (hoàn thành đủ 05 học phần GDTC).">Hoàn thành đủ 05 học phần GDTC</option>
                              <option value="Không có điểm F nào trong tất cả các học phần Giáo dục thể chất đã học trong 02 học kỳ chính trong năm học.">Không có điểm F học phần GDTC</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">Trình độ Ngoại ngữ</label>
                            <input type="text" value={studentAcademicData.foreign_language_status} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, foreign_language_status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">4. Các thành tích / Khen thưởng khác (nếu có)</span>
                          <textarea rows={3} value={studentAcademicData.other_achievements} onChange={(e) => setStudentAcademicData({ ...studentAcademicData, other_achievements: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
                        <button type="button" onClick={() => setIsEditStudentProfileOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 text-xs">Hủy</button>
                        <button type="submit" disabled={savingStudentProfile} className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-xs shadow-sm flex items-center gap-1.5">
                          <Save className="w-3.5 h-3.5" /><span>{savingStudentProfile ? 'Đang lưu...' : 'Lưu thông tin'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </main>
  );
}