'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Download, ExternalLink, Calendar, MapPin, Building2, User,
    Award, ArrowLeft, Filter, Trash2, Globe, PlusCircle, X, Pencil
} from 'lucide-react';
import Link from 'next/link';
import { CRITERIA_TREE } from "@/data/criteria";

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
    target_audience?: string;
    content_description?: string;
    project_url?: string;
    start_date: string;
    end_date: string;
    registration_deadline?: string;
    location?: string;
    proof_method?: string;
    supported_standard: string;
    criteria_detail?: string;
    target_levels?: string[];
    proposal_id?: string;
}

const CRITERIA_MAP: Record<string, string> = {
    DAO_DUC: 'Đạo đức tốt',
    HOC_TAP: 'Học tập tốt',
    THE_LUC: 'Thể lực tốt',
    TINH_NGUYEN: 'Tình nguyện tốt',
    HOI_NHAP: 'Hội nhập tốt',
};

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
    PENDING: {
        label: 'Mới tiếp nhận',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
    },
    SUBMITTED: {
        label: 'Đã gửi đề xuất',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-300',
    },
    APPROVED: {
        label: 'BTK công nhận',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    },
    REJECTED: {
        label: 'BTK từ chối',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
    },
};

export default function SummaryPage() {
    // Quản lý Tab hiển thị: 'ACTIVITIES' (Hoạt động Trang chủ) | 'PROPOSALS' (Đề xuất sinh viên)
    const [activeTab, setActiveTab] = useState<'ACTIVITIES' | 'PROPOSALS'>('ACTIVITIES');

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [officialActivities, setOfficialActivities] = useState<Activity[]>([]);
    const [filterStandard, setFilterStandard] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const [publishingId, setPublishingId] = useState<string | null>(null);

    // State thêm mới hoạt động chính thức
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // State sửa hoạt động chính thức ngoài Trang chủ
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [updating, setUpdating] = useState(false);

    // Form dữ liệu thêm mới
    const [officialForm, setOfficialForm] = useState({
        title: '',
        criteria_detail: '',
        organizer: '',
        target_standard: 'DAO_DUC',
        target_levels: ['DAI_HOC'],
        target_audience: 'Toàn thể sinh viên Đại học Bách khoa Hà Nội',
        content_description: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        location: '',
        proof_method: '',
        project_url: '',
    });

    // 1. Tải danh sách đề xuất
    const fetchProposals = async () => {
        const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setProposals(data);
        }
    };

    // 2. Tải toàn bộ hoạt động đang có trên Trang chủ
    const fetchOfficialActivities = async () => {
        const { data, error } = await supabase
            .from('activities')
            .select('*');

        if (!error && data) {
            setOfficialActivities(data);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchProposals(), fetchOfficialActivities()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Hàm thêm mới hoạt động chính thức
    const handleCreateOfficialActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!officialForm.title || !officialForm.organizer || !officialForm.start_date || !officialForm.criteria_detail) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
            return;
        }

        setCreating(true);

        const { error } = await supabase.from('activities').insert([
            {
                title: officialForm.title,
                organizer: officialForm.organizer,
                target_audience: officialForm.target_audience,
                content_description: officialForm.content_description || `Hoạt động chính thức hỗ trợ tiêu chuẩn Sinh viên 5 tốt.`,
                project_url: officialForm.project_url,
                start_date: officialForm.start_date,
                end_date: officialForm.end_date || officialForm.start_date,
                registration_deadline: officialForm.registration_deadline ? new Date(officialForm.registration_deadline).toISOString() : null,
                location: officialForm.location,
                proof_method: officialForm.proof_method,
                supported_standard: officialForm.target_standard,
                criteria_detail: officialForm.criteria_detail,
                target_levels: officialForm.target_levels,
            },
        ]);

        setCreating(false);

        if (error) {
            alert('Lỗi khi thêm hoạt động: ' + error.message);
        } else {
            alert('Đã đăng hoạt động chính thức lên Trang chủ thành công!');
            setIsAddModalOpen(false);
            setOfficialForm({
                title: '',
                criteria_detail: '',
                organizer: '',
                target_standard: 'DAO_DUC',
                target_levels: ['DAI_HOC'],
                target_audience: 'Toàn thể sinh viên Đại học Bách khoa Hà Nội',
                content_description: '',
                start_date: '',
                end_date: '',
                registration_deadline: '',
                location: '',
                proof_method: '',
                project_url: '',
            });
            fetchOfficialActivities();
        }
    };

    // Mở popup Sửa hoạt động chính thức
    const handleOpenEditActivity = (act: Activity) => {
        setEditingActivity({ ...act });
        setIsEditModalOpen(true);
    };

    // Lưu chỉnh sửa hoạt động chính thức
    const handleUpdateActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingActivity) return;

        setUpdating(true);

        const { error } = await supabase
            .from('activities')
            .update({
                title: editingActivity.title,
                organizer: editingActivity.organizer,
                target_audience: editingActivity.target_audience,
                start_date: editingActivity.start_date,
                end_date: editingActivity.end_date || editingActivity.start_date,
                registration_deadline: editingActivity.registration_deadline ? new Date(editingActivity.registration_deadline).toISOString() : null,
                location: editingActivity.location,
                proof_method: editingActivity.proof_method,
                supported_standard: editingActivity.supported_standard,
                criteria_detail: editingActivity.criteria_detail,
                target_levels: editingActivity.target_levels,
                project_url: editingActivity.project_url,
            })
            .eq('id', editingActivity.id);

        setUpdating(false);

        if (error) {
            alert('Lỗi khi cập nhật hoạt động: ' + error.message);
            return;
        }

        setOfficialActivities((prev) =>
            prev.map((item) => (item.id === editingActivity.id ? editingActivity : item))
        );
        setIsEditModalOpen(false);
        alert('Đã lưu thay đổi hoạt động thành công!');
    };

    // Xóa hoạt động chính thức ngoài Trang chủ
    const handleDeleteOfficialActivity = async (id: string | number, title: string) => {
        const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa hoạt động:\n"${title}"\nkhỏi Trang chủ không?`);
        if (!confirmDelete) return;

        const { error } = await supabase.from('activities').delete().eq('id', id);

        if (error) {
            alert('Không thể xóa: ' + error.message);
            return;
        }

        setOfficialActivities((prev) => prev.filter((a) => a.id !== id));
        alert('Đã xóa hoạt động khỏi Trang chủ thành công!');
    };

    // Xóa đề xuất sinh viên
    const handleDeleteProposal = async (id: string, title: string) => {
        const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa đề xuất:\n"${title}"?\n\nHoạt động này cũng sẽ bị gỡ khỏi Trang chủ (nếu đã đăng).`);
        if (!confirmDelete) return;

        await supabase.from('activities').delete().eq('proposal_id', id);
        const { error } = await supabase.from('proposals').delete().eq('id', id);

        if (error) {
            alert('Không thể xóa: ' + error.message);
            return;
        }

        setProposals((prev) => prev.filter((p) => p.id !== id));
        fetchOfficialActivities();
    };

    // Đưa hoạt động từ đề xuất ra Trang chủ
    const handlePublishToHome = async (prop: Proposal) => {
        const confirmPublish = confirm(
            `Đăng hoạt động "${prop.activity_title}" ra ngoài Trang chủ ngay bây giờ để các bạn sinh viên theo dõi?`
        );
        if (!confirmPublish) return;

        setPublishingId(prop.id);

        const { error } = await supabase.from('activities').insert([
            {
                proposal_id: prop.id,
                title: prop.activity_title,
                organizer: prop.organizer,
                target_audience: prop.target_audience,
                content_description: `Đối tượng: ${prop.target_audience}. Tiêu chí: ${prop.target_sub_criterion}`,
                project_url: prop.project_url,
                start_date: prop.start_date,
                end_date: prop.end_date,
                location: prop.location,
                proof_method: prop.proof_method,
                supported_standard: prop.target_standard,
                criteria_detail: prop.target_sub_criterion,
                target_levels: prop.target_levels,
            },
        ]);

        setPublishingId(null);

        if (error) {
            alert('Có lỗi khi đăng lên trang chủ: ' + error.message);
        } else {
            alert('Đã đăng lên Trang chủ thành công!');
            fetchOfficialActivities();
        }
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

    const handleStatusChange = async (proposal: Proposal, newStatus: string) => {
        const { error } = await supabase
            .from('proposals')
            .update({ status: newStatus })
            .eq('id', proposal.id);

        if (error) {
            alert('Không thể cập nhật trạng thái: ' + error.message);
            return;
        }

        setProposals((prev) =>
            prev.map((p) => (p.id === proposal.id ? { ...p, status: newStatus } : p))
        );

        if (newStatus === 'APPROVED') {
            const confirmPublish = confirm(
                `BTK đã công nhận hoạt động "${proposal.activity_title}"!\nBạn có muốn đưa hoạt động này hiển thị ngoài Trang chủ ngay không?`
            );

            if (confirmPublish) {
                const { error: insertError } = await supabase.from('activities').insert([
                    {
                        proposal_id: proposal.id,
                        title: proposal.activity_title,
                        organizer: proposal.organizer,
                        content_description: `Đối tượng: ${proposal.target_audience}. Tiêu chí: ${proposal.target_sub_criterion}`,
                        project_url: proposal.project_url,
                        start_date: proposal.start_date,
                        end_date: proposal.end_date,
                        location: proposal.location,
                        proof_method: proposal.proof_method,
                        supported_standard: proposal.target_standard,
                        criteria_detail: proposal.target_sub_criterion,
                        target_levels: proposal.target_levels,
                    },
                ]);

                if (!insertError) {
                    alert('Đã đồng bộ lên danh sách hoạt động ngoài Trang chủ thành công!');
                    fetchOfficialActivities();
                }
            }
        }
    };

    // Xuất file CSV
    const exportToCSV = () => {
        if (filteredProposals.length === 0) {
            alert('Không có dữ liệu trong danh sách đang lọc để xuất!');
            return;
        }

        const headers = [
            'STT', 'Người đề xuất', 'MSSV', 'Tên hoạt động', 'Đơn vị tổ chức',
            'Thời gian', 'Địa điểm', 'Tiêu chuẩn', 'Tiêu chí chi tiết',
            'Cấp xét', 'Cách thức minh chứng', 'Link đề án/bài viết', 'Ghi chú', 'Trạng thái rà soát'
        ];

        const rows = filteredProposals.map((p, index) => [
            index + 1,
            `"${p.student_name}"`,
            `"${p.student_id}"`,
            `"${p.activity_title.replace(/"/g, '""')}"`,
            `"${p.organizer.replace(/"/g, '""')}"`,
            `"${formatDateVN(p.start_date)} -> ${formatDateVN(p.end_date)}"`,
            `"${p.location.replace(/"/g, '""')}"`,
            `"${CRITERIA_MAP[p.target_standard] || p.target_standard}"`,
            `"${p.target_sub_criterion.replace(/"/g, '""')}"`,
            `"${p.target_levels?.join(', ')}"`,
            `"${p.proof_method.replace(/"/g, '""')}"`,
            `"${p.project_url}"`,
            `"${(p.note || '').replace(/"/g, '""')}"`,
            `"${STATUS_CONFIG[p.status]?.label || p.status}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `De_xuat_SV5T_gui_BTK_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredProposals = proposals.filter((p) => {
        const matchStandard = filterStandard === 'ALL' ? true : p.target_standard === filterStandard;
        const matchStatus = filterStatus === 'ALL' ? true : p.status === filterStatus;
        return matchStandard && matchStatus;
    });

    const filteredActivities = officialActivities.filter((act) => {
        return filterStandard === 'ALL' ? true : act.supported_standard === filterStandard;
    });

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
            <div>
                {/* Header */}
                <header className="bg-[#001C44] text-white border-b border-[#0C5776] shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 py-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-1.5 text-xs text-[#BCFEFE] hover:underline mb-2"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Về Trang chủ
                                </Link>
                                <h1 className="text-xl sm:text-2xl font-bold">
                                    Tổng hợp hoạt động xét chọn SV5T
                                </h1>
                                <p className="text-xs text-[#BCFEFE]/80 mt-1">
                                    Quản trị viên: Quản lý, chỉnh sửa hoặc xóa trực tiếp các hoạt động trên Trang chủ và duyệt đề xuất.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#001C44] text-xs font-semibold hover:bg-[#BCFEFE] transition-all shadow-sm"
                                >
                                    <PlusCircle className="w-4 h-4 text-[#0C5776]" />
                                    Thêm hoạt động chính thức
                                </button>

                                <button
                                    onClick={exportToCSV}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BCFEFE] text-[#001C44] text-xs font-semibold hover:bg-white transition-all shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Xuất Excel (CSV)
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2 TAB QUẢN LÝ CHÍNH */}
                <div className="max-w-5xl mx-auto px-4 mt-6">
                    <div className="flex border-b border-slate-200 gap-4 mb-4">
                        <button
                            onClick={() => setActiveTab('ACTIVITIES')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'ACTIVITIES'
                                    ? 'border-[#0C5776] text-[#001C44]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <Globe className="w-4 h-4 text-[#0C5776]" />
                            Hoạt động chính thức (Trang chủ)
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-[#0C5776] font-bold">
                                {officialActivities.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('PROPOSALS')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'PROPOSALS'
                                    ? 'border-[#0C5776] text-[#001C44]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Đề xuất từ sinh viên
                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                                {proposals.length}
                            </span>
                        </button>
                    </div>

                    {/* BỘ LỌC DÙNG CHUNG */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs mb-4">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-[#0C5776]" />
                                <span className="font-medium">Tiêu chuẩn:</span>
                                <select
                                    value={filterStandard}
                                    onChange={(e) => setFilterStandard(e.target.value)}
                                    className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776]"
                                >
                                    <option value="ALL">Tất cả</option>
                                    <option value="DAO_DUC">Đạo đức tốt</option>
                                    <option value="HOC_TAP">Học tập tốt</option>
                                    <option value="THE_LUC">Thể lực tốt</option>
                                    <option value="TINH_NGUYEN">Tình nguyện tốt</option>
                                    <option value="HOI_NHAP">Hội nhập tốt</option>
                                </select>
                            </div>

                            {activeTab === 'PROPOSALS' && (
                                <div className="flex items-center gap-1.5">
                                    <span className="font-medium">Trạng thái:</span>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776]"
                                    >
                                        <option value="ALL">Tất cả trạng thái</option>
                                        <option value="PENDING">🟡 Mới tiếp nhận</option>
                                        <option value="SUBMITTED">🔵 Đã gửi đề xuất</option>
                                        <option value="APPROVED">🟢 BTK công nhận</option>
                                        <option value="REJECTED">🔴 BTK từ chối</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-slate-500">
                            Hiển thị: <strong className="text-[#001C44]">
                                {activeTab === 'ACTIVITIES' ? filteredActivities.length : filteredProposals.length}
                            </strong> hoạt động
                        </div>
                    </div>

                    {/* ======================= TAB 1: HOẠT ĐỘNG TRANG CHỦ ======================= */}
                    {activeTab === 'ACTIVITIES' && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-12 text-center text-xs text-slate-500">Đang tải danh sách hoạt động...</div>
                            ) : filteredActivities.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
                                    Chưa có hoạt động nào phù hợp.
                                </div>
                            ) : (
                                filteredActivities.map((act) => (
                                    <div
                                        key={act.id}
                                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 hover:border-[#2D99AE]/60 transition-all"
                                    >
                                        {/* Hàng 1: Tiêu chuẩn, Cấp xét & Nút Thao tác */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#0C5776] text-white">
                                                    {CRITERIA_MAP[act.supported_standard] || act.supported_standard}
                                                </span>
                                                <div className="flex gap-1">
                                                    {act.target_levels?.map((lvl) => (
                                                        <span
                                                            key={lvl}
                                                            className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                                                        >
                                                            {lvl === 'DAI_HOC' ? 'Cấp ĐH' : lvl === 'THANH_PHO' ? 'Cấp TP' : 'Cấp TW'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Nút Sửa & Xóa trực tiếp */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenEditActivity(act)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-[#0C5776]" />
                                                    <span>Sửa</span>
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteOfficialActivity(act.id, act.title)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Xóa khỏi Trang chủ</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hàng 2: Tiêu đề & Tiêu chí chi tiết */}
                                        <div>
                                            <h2 className="text-base font-bold text-[#001C44]">{act.title}</h2>
                                            {act.criteria_detail && (
                                                <div className="mt-2 p-2.5 rounded-lg bg-[#BCFEFE]/15 border border-[#2D99AE]/25 text-xs text-[#001C44] flex items-start gap-2">
                                                    <Award className="w-4 h-4 text-[#0C5776] shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-semibold text-[#0C5776]">Tiêu chí tương ứng:</span>{' '}
                                                        <span className="text-slate-700">{act.criteria_detail}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hàng 3: Chi tiết thông tin */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                                                <span>Đơn vị tổ chức: <strong>{act.organizer}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                                                <span>Thời gian: {formatDateVN(act.start_date)} → {formatDateVN(act.end_date)}</span>
                                            </div>
                                            {act.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                                                    <span>Địa điểm: {act.location}</span>
                                                </div>
                                            )}
                                            {act.proof_method && (
                                                <div className="flex items-center gap-2">
                                                    <Award className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                                                    <span>Minh chứng: {act.proof_method}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hàng 4: Link bài viết */}
                                        {act.project_url && (
                                            <div className="pt-2">
                                                <a
                                                    href={act.project_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-[#0C5776] hover:text-[#001C44] font-semibold underline"
                                                >
                                                    Xem bài viết/ đề án chi tiết
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ======================= TAB 2: ĐỀ XUẤT TỪ SINH VIÊN ======================= */}
                    {activeTab === 'PROPOSALS' && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-12 text-center text-xs text-slate-500">Đang tải đề xuất...</div>
                            ) : filteredProposals.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
                                    Không tìm thấy đề xuất nào phù hợp.
                                </div>
                            ) : (
                                filteredProposals.map((prop) => {
                                    const currentStatus = STATUS_CONFIG[prop.status] || {
                                        label: prop.status,
                                        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                                    };

                                    return (
                                        <div
                                            key={prop.id}
                                            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-[#2D99AE]/60 transition-all"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#0C5776] text-white">
                                                        {CRITERIA_MAP[prop.target_standard] || prop.target_standard}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        {prop.target_levels?.map((lvl) => (
                                                            <span
                                                                key={lvl}
                                                                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                                                            >
                                                                {lvl === 'DAI_HOC' ? 'Cấp ĐH' : lvl === 'THANH_PHO' ? 'Cấp TP' : 'Cấp TW'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500">Tình trạng:</span>
                                                    <select
                                                        value={prop.status}
                                                        onChange={(e) => handleStatusChange(prop, e.target.value)}
                                                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${currentStatus.badgeClass}`}
                                                    >
                                                        <option value="PENDING">🟡 Mới tiếp nhận</option>
                                                        <option value="SUBMITTED">🔵 Đã gửi đề xuất</option>
                                                        <option value="APPROVED">🟢 BTK công nhận</option>
                                                        <option value="REJECTED">🔴 BTK từ chối</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <h2 className="text-base font-bold text-[#001C44]">{prop.activity_title}</h2>
                                                <div className="mt-2 p-2.5 rounded-lg bg-[#BCFEFE]/15 border border-[#2D99AE]/25 text-xs text-[#001C44] flex items-start gap-2">
                                                    <Award className="w-4 h-4 text-[#0C5776] shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-semibold text-[#0C5776]">Tiêu chí tương ứng:</span>{' '}
                                                        <span className="text-slate-700">{prop.target_sub_criterion}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                                                    <span>Đơn vị tổ chức: <strong>{prop.organizer}</strong></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                                                    <span>Thời gian: {formatDateVN(prop.start_date)} → {formatDateVN(prop.end_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                                                    <span>Địa điểm: {prop.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                                                    <span>Người đề xuất: <strong>{prop.student_name}</strong> ({prop.student_id})</span>
                                                </div>
                                            </div>

                                            <div className="text-xs space-y-1 text-slate-700">
                                                <p><strong>Cách thức minh chứng:</strong> {prop.proof_method}</p>
                                                {prop.note && <p className="text-slate-500 italic"><strong>Ghi chú:</strong> {prop.note}</p>}
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                                <a
                                                    href={prop.project_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-[#0C5776] hover:text-[#001C44] font-semibold underline"
                                                >
                                                    Xem bài viết/ đề án gốc
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDeleteProposal(prop.id, prop.activity_title)}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Xóa đề xuất</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handlePublishToHome(prop)}
                                                        disabled={publishingId === prop.id}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#0C5776] text-white hover:bg-[#001C44] transition-colors disabled:opacity-50 shadow-xs"
                                                    >
                                                        <Globe className="w-3.5 h-3.5 text-[#BCFEFE]" />
                                                        <span>{publishingId === prop.id ? 'Đang đưa lên...' : 'Đưa ra Trang chủ'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 border-t border-slate-200 py-8 text-center text-xs text-slate-500 space-y-1 bg-white">
                <p className="text-slate-400">
                    Đại học Bách khoa Hà Nội • Bản quyền © 2026
                </p>
                <p className="text-[#0C5776] pt-1">
                    Xây dựng và phát triển bởi <span className="font-semibold text-[#001C44]">Phạm Thị Vân Anh</span>
                </p>
            </footer>

            {/* MODAL 1: THÊM HOẠT ĐỘNG CHÍNH THỨC */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-white">
                            <div>
                                <h2 className="text-base font-bold text-[#001C44]">Thêm hoạt động chính thức trong ĐHBKHN</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Hoạt động đã được BTK phê duyệt và hiển thị trực tiếp ra Trang chủ.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOfficialActivity} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 max-h-[calc(90vh-130px)]">
                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Tên hoạt động *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="VD: Hội nghị Nghiên cứu Khoa học Sinh viên lần thứ 42..."
                                        value={officialForm.title}
                                        onChange={(e) => setOfficialForm({ ...officialForm, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Đơn vị tổ chức *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="VD: Hội Sinh viên ĐHBK Hà Nội/ CLB..."
                                            value={officialForm.organizer}
                                            onChange={(e) => setOfficialForm({ ...officialForm, organizer: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Đối tượng tham gia *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="VD: Toàn thể sinh viên Bách khoa"
                                            value={officialForm.target_audience}
                                            onChange={(e) => setOfficialForm({ ...officialForm, target_audience: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Tiêu chuẩn SV5T *</label>
                                        <select
                                            value={officialForm.target_standard}
                                            onChange={(e) => setOfficialForm({
                                                ...officialForm,
                                                target_standard: e.target.value,
                                                criteria_detail: ''
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                        >
                                            <option value="DAO_DUC">Đạo đức tốt</option>
                                            <option value="HOC_TAP">Học tập tốt</option>
                                            <option value="THE_LUC">Thể lực tốt</option>
                                            <option value="TINH_NGUYEN">Tình nguyện tốt</option>
                                            <option value="HOI_NHAP">Hội nhập tốt</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Cấp xét công nhận *</label>
                                        <div className="flex items-center gap-3 pt-2">
                                            {[
                                                { key: 'DAI_HOC', label: 'Cấp ĐH' },
                                                { key: 'THANH_PHO', label: 'Cấp TP' },
                                                { key: 'TRUNG_UONG', label: 'Cấp TW' },
                                            ].map((lvl) => (
                                                <label key={lvl.key} className="inline-flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={officialForm.target_levels.includes(lvl.key)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setOfficialForm({ ...officialForm, target_levels: [...officialForm.target_levels, lvl.key] });
                                                            } else {
                                                                setOfficialForm({
                                                                    ...officialForm,
                                                                    target_levels: officialForm.target_levels.filter((l) => l !== lvl.key),
                                                                });
                                                            }
                                                        }}
                                                        className="rounded border-slate-300 text-[#0C5776] focus:ring-0"
                                                    />
                                                    <span>{lvl.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Tiêu chí cụ thể *</label>
                                    <select
                                        value={officialForm.criteria_detail || ""}
                                        onChange={(e) =>
                                            setOfficialForm({ ...officialForm, criteria_detail: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776]"
                                        required
                                    >
                                        <option value="">-- Chọn tiêu chí cụ thể tương ứng --</option>
                                        {CRITERIA_TREE[officialForm.target_standard as keyof typeof CRITERIA_TREE]?.items.map(
                                            (item, idx) => (
                                                <option key={idx} value={item.full} title={item.full}>
                                                    {item.display}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Ngày bắt đầu *</label>
                                        <input
                                            type="date"
                                            required
                                            value={officialForm.start_date}
                                            onChange={(e) => setOfficialForm({ ...officialForm, start_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            value={officialForm.end_date}
                                            onChange={(e) => setOfficialForm({ ...officialForm, end_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Hạn chót đăng ký (nếu có)</label>
                                        <input
                                            type="datetime-local"
                                            value={officialForm.registration_deadline}
                                            onChange={(e) => setOfficialForm({ ...officialForm, registration_deadline: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Địa điểm tổ chức</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Hội trường C2/ Sân C1..."
                                            value={officialForm.location}
                                            onChange={(e) => setOfficialForm({ ...officialForm, location: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Cách thức minh chứng *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="VD: Giấy chứng nhận tham gia / Ảnh check-in mã QR..."
                                        value={officialForm.proof_method}
                                        onChange={(e) => setOfficialForm({ ...officialForm, proof_method: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Link bài viết/ đề án chi tiết</label>
                                    <input
                                        type="url"
                                        placeholder="https://facebook.com/..."
                                        value={officialForm.project_url}
                                        onChange={(e) => setOfficialForm({ ...officialForm, project_url: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2 bg-[#0C5776] text-white font-semibold rounded-lg hover:bg-[#001C44] transition-colors disabled:opacity-50 text-xs shadow-sm"
                                >
                                    {creating ? 'Đang đăng...' : 'Đăng lên Trang chủ ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: CHỈNH SỬA HOẠT ĐỘNG CHÍNH THỨC */}
            {isEditModalOpen && editingActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-white">
                            <div>
                                <h2 className="text-base font-bold text-[#001C44]">Chỉnh sửa hoạt động Trang chủ</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Thay đổi thông tin sẽ cập nhật trực tiếp ngoài Trang chủ.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateActivity} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 max-h-[calc(90vh-130px)]">
                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Tên hoạt động *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingActivity.title}
                                        onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Đơn vị tổ chức *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editingActivity.organizer}
                                            onChange={(e) => setEditingActivity({ ...editingActivity, organizer: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Đối tượng tham gia</label>
                                        <input
                                            type="text"
                                            value={editingActivity.target_audience || ''}
                                            onChange={(e) => setEditingActivity({ ...editingActivity, target_audience: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Tiêu chuẩn SV5T *</label>
                                        <select
                                            value={editingActivity.supported_standard}
                                            onChange={(e) => setEditingActivity({
                                                ...editingActivity,
                                                supported_standard: e.target.value,
                                                criteria_detail: ''
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                        >
                                            <option value="DAO_DUC">Đạo đức tốt</option>
                                            <option value="HOC_TAP">Học tập tốt</option>
                                            <option value="THE_LUC">Thể lực tốt</option>
                                            <option value="TINH_NGUYEN">Tình nguyện tốt</option>
                                            <option value="HOI_NHAP">Hội nhập tốt</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Cấp xét công nhận</label>
                                        <div className="flex items-center gap-3 pt-2">
                                            {[
                                                { key: 'DAI_HOC', label: 'Cấp ĐH' },
                                                { key: 'THANH_PHO', label: 'Cấp TP' },
                                                { key: 'TRUNG_UONG', label: 'Cấp TW' },
                                            ].map((lvl) => (
                                                <label key={lvl.key} className="inline-flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingActivity.target_levels?.includes(lvl.key)}
                                                        onChange={(e) => {
                                                            const cur = editingActivity.target_levels || [];
                                                            if (e.target.checked) {
                                                                setEditingActivity({ ...editingActivity, target_levels: [...cur, lvl.key] });
                                                            } else {
                                                                setEditingActivity({
                                                                    ...editingActivity,
                                                                    target_levels: cur.filter((l) => l !== lvl.key),
                                                                });
                                                            }
                                                        }}
                                                        className="rounded border-slate-300 text-[#0C5776] focus:ring-0"
                                                    />
                                                    <span>{lvl.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Tiêu chí cụ thể *</label>
                                    <select
                                        value={editingActivity.criteria_detail || ""}
                                        onChange={(e) =>
                                            setEditingActivity({ ...editingActivity, criteria_detail: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776]"
                                        required
                                    >
                                        <option value="">-- Chọn tiêu chí cụ thể tương ứng --</option>
                                        {CRITERIA_TREE[editingActivity.supported_standard as keyof typeof CRITERIA_TREE]?.items.map(
                                            (item, idx) => (
                                                <option key={idx} value={item.full} title={item.full}>
                                                    {item.display}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Ngày bắt đầu *</label>
                                        <input
                                            type="date"
                                            required
                                            value={editingActivity.start_date?.split('T')[0] || ''}
                                            onChange={(e) => setEditingActivity({ ...editingActivity, start_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            value={editingActivity.end_date?.split('T')[0] || ''}
                                            onChange={(e) => setEditingActivity({ ...editingActivity, end_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Địa điểm tổ chức</label>
                                    <input
                                        type="text"
                                        value={editingActivity.location || ''}
                                        onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Cách thức minh chứng</label>
                                    <input
                                        type="text"
                                        value={editingActivity.proof_method || ''}
                                        onChange={(e) => setEditingActivity({ ...editingActivity, proof_method: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Link bài viết/ đề án</label>
                                    <input
                                        type="url"
                                        value={editingActivity.project_url || ''}
                                        onChange={(e) => setEditingActivity({ ...editingActivity, project_url: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-5 py-2 bg-[#0C5776] text-white font-semibold rounded-lg hover:bg-[#001C44] transition-colors disabled:opacity-50 text-xs shadow-sm"
                                >
                                    {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}