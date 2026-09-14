'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Download, ExternalLink, Calendar, MapPin, Building2, User, Award, ArrowLeft, Filter, Trash2, Globe, Lock, KeyRound, PlusCircle, X } from 'lucide-react';
import Link from 'next/link';

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
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [filterStandard, setFilterStandard] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const [publishingId, setPublishingId] = useState<string | null>(null);

    // State quản lý mở/đóng popup thêm hoạt động chính thức
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form dữ liệu hoạt động chính thức
    const [officialForm, setOfficialForm] = useState({
        title: '',
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

    // Hàm xử lý lưu hoạt động chính thức thẳng vào bảng activities
    const handleCreateOfficialActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!officialForm.title || !officialForm.organizer || !officialForm.start_date) {
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
                target_levels: officialForm.target_levels,
                // Không có proposal_id vì đây là hoạt động đăng trực tiếp
            },
        ]);

        setCreating(false);

        if (error) {
            alert('Lỗi khi thêm hoạt động: ' + error.message);
        } else {
            alert('Đã đăng hoạt động chính thức lên Trang chủ thành công!');
            setIsAddModalOpen(false);
            // Reset form
            setOfficialForm({
                title: '',
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
        }
    };

    // Hàm xóa hoạt động test / điền bừa
    const handleDelete = async (id: string, title: string) => {
        const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa hoạt động:\n"${title}"?\n\nHoạt động này cũng sẽ tự động bị gỡ khỏi Trang chủ (nếu đã đăng).`);
        if (!confirmDelete) return;

        // Xóa trực tiếp ở cả hai nơi để đảm bảo sạch dữ liệu
        await supabase.from('activities').delete().eq('proposal_id', id);
        const { error } = await supabase.from('proposals').delete().eq('id', id);

        if (error) {
            alert('Không thể xóa: ' + error.message);
            return;
        }

        setProposals((prev) => prev.filter((p) => p.id !== id));
    };

    // Hàm chủ động đưa hoạt động ra Trang chủ cho sinh viên cày
    const handlePublishToHome = async (prop: Proposal) => {
        const confirmPublish = confirm(
            `Đăng hoạt động "${prop.activity_title}" ra ngoài Trang chủ ngay bây giờ để các bạn sinh viên theo dõi và tham gia?`
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
                target_levels: prop.target_levels,
            },
        ]);

        setPublishingId(null);

        if (error) {
            alert('Có lỗi khi đăng lên trang chủ: ' + error.message);
        } else {
            alert('Đã đăng lên Trang chủ thành công! Hoạt động đã hiển thị ngoài trang chủ.');
        }
    };

    // Thêm hàm chuyển từ YYYY-MM-DD sang DD/MM/YYYY
    const formatDateVN = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    const fetchProposals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setProposals(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    // Đổi trạng thái xử lý
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

        // Nếu BTK đã công nhận -> Hỏi có muốn đăng thẳng hoạt động ra Trang chủ không
        if (newStatus === 'APPROVED') {
            const confirmPublish = confirm(
                `BTK đã công nhận hoạt động "${proposal.activity_title}"!\nBạn có muốn đưa hoạt động này hiển thị ngoài Trang chủ ngay không?`
            );

            if (confirmPublish) {
                const { error: insertError } = await supabase.from('activities').insert([
                    {
                        title: proposal.activity_title,
                        organizer: proposal.organizer,
                        content_description: `Đối tượng: ${proposal.target_audience}. Tiêu chí: ${proposal.target_sub_criterion}`,
                        project_url: proposal.project_url,
                        start_date: proposal.start_date,
                        end_date: proposal.end_date,
                        location: proposal.location,
                        proof_method: proposal.proof_method,
                        supported_standard: proposal.target_standard,
                        target_levels: proposal.target_levels,
                    },
                ]);

                if (!insertError) {
                    alert('Đã đồng bộ lên danh sách hoạt động ngoài Trang chủ thành công!');
                }
            }
        }
    };

    // Xuất file Excel / CSV
    const exportToCSV = () => {
        if (filteredProposals.length === 0) {
            alert('Không có dữ liệu trong danh sách đang lọc để xuất!');
            return;
        }

        const headers = [
            'STT',
            'Người đề xuất',
            'MSSV',
            'Tên hoạt động',
            'Đơn vị tổ chức',
            'Thời gian',
            'Địa điểm',
            'Tiêu chuẩn',
            'Tiêu chí chi tiết',
            'Cấp xét',
            'Cách thức minh chứng',
            'Link đề án/bài viết',
            'Ghi chú',
            'Trạng thái rà soát'
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
                                    Tổng hợp hoạt động được đề xuất
                                </h1>
                                <p className="text-xs text-[#BCFEFE]/80 mt-1">
                                    Theo dõi tiến độ đề xuất và phản hồi từ Ban Thư ký HSV Đại học.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Nút mới thêm vào */}
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#001C44] text-xs font-semibold hover:bg-[#BCFEFE] transition-all shadow-sm"
                                >
                                    <PlusCircle className="w-4 h-4 text-[#0C5776]" />
                                    Thêm hoạt động chính thức
                                </button>

                                {/* Nút Xuất file Excel cũ giữ nguyên */}
                                <button
                                    onClick={exportToCSV}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BCFEFE] text-[#001C44] text-xs font-semibold hover:bg-white transition-all shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Xuất file Excel (CSV) gửi BTK
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Bộ lọc 2 tiêu chí: Tiêu chuẩn & Trạng thái */}
                <div className="max-w-5xl mx-auto px-4 mt-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
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
                        </div>

                        <div className="text-xs text-slate-500">
                            Hiển thị: <strong className="text-[#001C44]">{filteredProposals.length}</strong> / {proposals.length} hoạt động
                        </div>
                    </div>

                    {/* Danh sách thẻ hoạt động */}
                    <div className="mt-4 space-y-4">
                        {loading ? (
                            <div className="py-12 text-center text-xs text-slate-500">
                                Đang tải dữ liệu tổng hợp...
                            </div>
                        ) : filteredProposals.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
                                Không tìm thấy đề xuất nào phù hợp với bộ lọc.
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
                                        {/* Hàng 1: Tiêu chuẩn, Cấp xét & Menu đổi trạng thái */}
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

                                            {/* Dropdown chỉnh trạng thái thực tế */}
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

                                        {/* Hàng 2: Tên hoạt động & Tiêu chí chi tiết */}
                                        <div>
                                            <h2 className="text-base font-bold text-[#001C44]">
                                                {prop.activity_title}
                                            </h2>
                                            <div className="mt-2 p-2.5 rounded-lg bg-[#BCFEFE]/15 border border-[#2D99AE]/25 text-xs text-[#001C44] flex items-start gap-2">
                                                <Award className="w-4 h-4 text-[#0C5776] shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold text-[#0C5776]">Tiêu chí tương ứng:</span>{' '}
                                                    <span className="text-slate-700">{prop.target_sub_criterion}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hàng 3: Chi tiết thông tin */}
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

                                        {/* Hàng 4: Minh chứng & Ghi chú */}
                                        <div className="text-xs space-y-1 text-slate-700">
                                            <p><strong>Cách thức minh chứng:</strong> {prop.proof_method}</p>
                                            {prop.note && <p className="text-slate-500 italic"><strong>Ghi chú:</strong> {prop.note}</p>}
                                        </div>

                                        {/* Hàng 5: Link đề án gốc */}
                                        {/* Hàng 5: Link đề án gốc, Nút Xóa & Nút Đưa ra Trang chủ */}
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
                                                {/* Nút XÓA bài test */}
                                                <button
                                                    onClick={() => handleDelete(prop.id, prop.activity_title)}
                                                    title="Xóa đề xuất này khỏi danh sách"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Xóa</span>
                                                </button>

                                                {/* Nút ĐƯA RA TRANG CHỦ */}
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
            {/* POPUP MODAL THÊM HOẠT ĐỘNG CHÍNH THỨC */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">

                        {/* Header cố định ở trên cùng */}
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

                        {/* Form nội dung có thanh cuộn riêng */}
                        <form onSubmit={handleCreateOfficialActivity} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 max-h-[calc(90vh-130px)]">
                                {/* Tên hoạt động */}
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

                                {/* Đơn vị tổ chức & Đối tượng */}
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

                                {/* Tiêu chuẩn & Cấp xét */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Tiêu chuẩn SV5T *</label>
                                        <select
                                            value={officialForm.target_standard}
                                            onChange={(e) => setOfficialForm({ ...officialForm, target_standard: e.target.value })}
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

                                {/* Thời gian tổ chức */}
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

                                {/* Hạn chót đăng ký & Địa điểm */}
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

                                {/* Cách thức minh chứng */}
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

                                {/* Link bài viết / Đề án */}
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

                            {/* Nút hành động cố định ở chân modal */}
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
        </main>
    );
}