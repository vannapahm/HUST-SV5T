'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
    ArrowLeft, PlusCircle, Trash2, Calendar, Award,
    ExternalLink, User, Sparkles, X, LogOut, ArrowRight,
    CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { CRITERIA_TREE } from '@/data/criteria';

interface StudentRecord {
    id: number;
    created_at: string;
    student_id: string;
    student_name?: string;
    activity_id?: string;
    activity_title: string;
    organizer?: string;
    target_standard: string;
    criteria_detail: string;
    participation_date: string;
    proof_url?: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface OfficialActivity {
    id: string | number;
    title: string;
    organizer: string;
    supported_standard: string;
    criteria_detail?: string;
    start_date: string;
    status?: 'APPROVED' | 'PENDING' | 'REJECTED';
}

const CRITERIA_MAP: Record<string, string> = {
    DAO_DUC: 'Đạo đức tốt',
    HOC_TAP: 'Học tập tốt',
    THE_LUC: 'Thể lực tốt',
    TINH_NGUYEN: 'Tình nguyện tốt',
    HOI_NHAP: 'Hội nhập tốt',
};

export default function StudentPortfolioPage() {
    const [mssvInput, setMssvInput] = useState('');
    const [currentMssv, setCurrentMssv] = useState<string | null>(null);
    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Danh sách hoạt động trên hệ thống để chọn nhanh
    const [systemActivities, setSystemActivities] = useState<OfficialActivity[]>([]);

    // Modal thêm hoạt động
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addMode, setAddMode] = useState<'SYSTEM' | 'CUSTOM'>('SYSTEM');
    const [selectedSystemActId, setSelectedSystemActId] = useState<string>('');

    // Form tự nhập hoạt động ngoài
    const [customForm, setCustomForm] = useState({
        activity_title: '',
        organizer: '',
        target_standard: 'DAO_DUC',
        criteria_detail: '',
        participation_date: new Date().toISOString().split('T')[0],
        proof_url: '',
    });

    // Tự nhớ MSSV đã tra cứu trên máy
    useEffect(() => {
        const savedMssv = localStorage.getItem('sv5t_student_id');
        if (savedMssv) {
            setCurrentMssv(savedMssv);
            fetchRecords(savedMssv);
        }
        fetchSystemActivities();
    }, []);

    // Tải danh sách hoạt động trên hệ thống
    const fetchSystemActivities = async () => {
        const { data } = await supabase
            .from('activities')
            .select('*')
            .order('start_date', { ascending: false });
        if (data) setSystemActivities(data);
    };

    // Tải toàn bộ hồ sơ tích lũy của sinh viên theo MSSV
    const fetchRecords = async (mssv: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('student_activities')
            .select('*')
            .eq('student_id', mssv.trim())
            .order('participation_date', { ascending: false });

        if (!error && data) {
            setRecords(data as StudentRecord[]);
        }
        setLoading(false);
    };

    // Vào hồ sơ cá nhân
    const handleEnterPortfolio = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanMssv = mssvInput.trim();
        if (!cleanMssv) {
            alert('Vui lòng nhập Mã số sinh viên (MSSV)!');
            return;
        }

        setCurrentMssv(cleanMssv);
        localStorage.setItem('sv5t_student_id', cleanMssv);
        fetchRecords(cleanMssv);
    };

    // Đổi sang MSSV khác
    const handleSwitchMssv = () => {
        setCurrentMssv(null);
        setMssvInput('');
        setRecords([]);
        localStorage.removeItem('sv5t_student_id');
    };

    // Ghi nhận hoạt động vào hồ sơ cá nhân
    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMssv) return;

        let newRecordPayload: any = null;

        if (addMode === 'SYSTEM') {
            const act = systemActivities.find((a) => String(a.id) === selectedSystemActId);
            if (!act) {
                alert('Vui lòng chọn một hoạt động trong danh sách!');
                return;
            }
            newRecordPayload = {
                student_id: currentMssv,
                activity_id: String(act.id),
                activity_title: act.title,
                organizer: act.organizer,
                target_standard: act.supported_standard,
                criteria_detail: act.criteria_detail || 'Tham gia hoạt động được BTK công nhận',
                participation_date: act.start_date ? act.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
                proof_url: '',
                status: act.status || 'APPROVED', // Kế thừa trạng thái từ hệ thống
            };
        } else {
            if (!customForm.activity_title || !customForm.criteria_detail) {
                alert('Vui lòng nhập tên hoạt động và tiêu chí cụ thể!');
                return;
            }
            newRecordPayload = {
                student_id: currentMssv,
                activity_id: null,
                activity_title: customForm.activity_title,
                organizer: customForm.organizer || 'Ban tổ chức',
                target_standard: customForm.target_standard,
                criteria_detail: customForm.criteria_detail,
                participation_date: customForm.participation_date,
                proof_url: customForm.proof_url,
                status: 'PENDING', // Hoạt động tự nhập mặc định ở trạng thái chờ xét duyệt cuối năm
            };
        }

        const { data, error } = await supabase.from('student_activities').insert([newRecordPayload]).select();

        if (error) {
            alert('Không thể lưu hoạt động: ' + error.message);
        } else if (data) {
            setRecords([data[0] as StudentRecord, ...records]);
            setIsModalOpen(false);
            setSelectedSystemActId('');
            setCustomForm({
                activity_title: '',
                organizer: '',
                target_standard: 'DAO_DUC',
                criteria_detail: '',
                participation_date: new Date().toISOString().split('T')[0],
                proof_url: '',
            });
            alert('Đã ghi nhận hoạt động thành công vào hồ sơ MSSV: ' + currentMssv);
        }
    };

    // Sinh viên tự bấm xóa thủ công một hoạt động khỏi hồ sơ cá nhân
    const handleDeleteRecord = async (id: number, title: string) => {
        if (!confirm(`Bạn có chắc muốn xóa hoạt động:\n"${title}"\nkhỏi hồ sơ tích lũy của mình?`)) return;

        const { error } = await supabase.from('student_activities').delete().eq('id', id);
        if (!error) {
            setRecords(records.filter((r) => r.id !== id));
        } else {
            alert('Lỗi khi xóa: ' + error.message);
        }
    };

    // CHỈ TÍNH VÀO TỔNG TIÊU CHUẨN NHỮNG HOẠT ĐỘNG ĐÃ CÔNG NHẬN (APPROVED)
    // Các hoạt động REJECTED hoặc PENDING được tự động loại khỏi bộ đếm
    const statsByStandard = {
        DAO_DUC: records.filter((r) => r.target_standard === 'DAO_DUC' && r.status === 'APPROVED').length,
        HOC_TAP: records.filter((r) => r.target_standard === 'HOC_TAP' && r.status === 'APPROVED').length,
        THE_LUC: records.filter((r) => r.target_standard === 'THE_LUC' && r.status === 'APPROVED').length,
        TINH_NGUYEN: records.filter((r) => r.target_standard === 'TINH_NGUYEN' && r.status === 'APPROVED').length,
        HOI_NHAP: records.filter((r) => r.target_standard === 'HOI_NHAP' && r.status === 'APPROVED').length,
    };

    const totalApproved = records.filter((r) => r.status === 'APPROVED').length;

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
                                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-[#BCFEFE]" />
                                    Hồ sơ tích lũy Sinh viên 5 tốt
                                </h1>
                                <p className="text-xs text-[#BCFEFE]/80 mt-1">
                                    Theo dõi và lưu trữ các hoạt động rèn luyện theo từng Mã số sinh viên (MSSV).
                                </p>
                            </div>

                            {/* Nút hành động khi đã đăng nhập MSSV */}
                            {currentMssv && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BCFEFE] text-[#001C44] text-xs font-semibold hover:bg-white transition-all shadow-sm"
                                    >
                                        <PlusCircle className="w-4 h-4 text-[#0C5776]" />
                                        Ghi nhận hoạt động
                                    </button>
                                    <button
                                        onClick={handleSwitchMssv}
                                        title="Đổi sang MSSV khác"
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Đổi MSSV</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ==================== MÀN HÌNH 1: CHƯA NHẬP MSSV ==================== */}
                {!currentMssv ? (
                    <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in zoom-in duration-200">
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                            <div className="w-16 h-16 bg-[#BCFEFE]/20 text-[#0C5776] rounded-2xl flex items-center justify-center mx-auto">
                                <User className="w-8 h-8" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#001C44]">Cổng tra cứu hồ sơ cá nhân</h2>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Nhập Mã số sinh viên (MSSV) của bạn để xem danh mục tiêu chí đã đạt và tích lũy thêm các hoạt động mới.
                                </p>
                            </div>

                            <form onSubmit={handleEnterPortfolio} className="space-y-3">
                                <div>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        placeholder="Nhập MSSV (VD: 20211234)..."
                                        value={mssvInput}
                                        onChange={(e) => setMssvInput(e.target.value)}
                                        className="w-full px-4 py-3 text-sm text-center font-bold tracking-wider border border-slate-300 rounded-xl focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white transition-all placeholder:font-normal placeholder:tracking-normal"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-[#0C5776] hover:bg-[#001C44] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span>Vào xem hồ sơ của tôi</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            <p className="text-[11px] text-slate-400 italic">
                                * Hoạt động được lưu trữ trực tuyến theo MSSV và tự động cập nhật khi có kết luận xét duyệt từ BTK.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* ==================== MÀN HÌNH 2: ĐÃ VÀO HỒ SƠ ==================== */
                    <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6 animate-in fade-in duration-200">
                        {/* Thanh thông tin sinh viên */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <span className="text-xs text-slate-500">Đang xem hồ sơ sinh viên:</span>
                                <div className="text-xl font-bold text-[#001C44] flex items-center gap-2">
                                    <span>MSSV: {currentMssv}</span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Đang hoạt động
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-right">
                                <div>
                                    <span className="text-xs text-slate-500">Hợp lệ tính điểm:</span>
                                    <div className="text-lg font-bold text-[#0C5776]">{totalApproved} tiêu chí</div>
                                </div>
                                <button
                                    onClick={handleSwitchMssv}
                                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                                >
                                    Đổi MSSV
                                </button>
                            </div>
                        </div>

                        {/* Thống kê 5 tiêu chuẩn (Chỉ đếm APPROVED) */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {Object.entries(CRITERIA_MAP).map(([key, label]) => {
                                const count = (statsByStandard as any)[key] || 0;
                                return (
                                    <div key={key} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                                        <div className="text-xs text-slate-600 font-medium truncate">{label}</div>
                                        <div className={`text-2xl font-bold mt-1 ${count > 0 ? 'text-[#0C5776]' : 'text-slate-300'}`}>
                                            {count}
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">mục đạt chuẩn</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Danh sách hoạt động */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-sm font-bold text-[#001C44]">Lịch sử hoạt động đã ghi nhận</h3>
                                <span className="text-xs text-slate-500">{records.length} hoạt động trong hồ sơ</span>
                            </div>

                            {loading ? (
                                <div className="py-12 text-center text-xs text-slate-500">Đang tải hồ sơ tích lũy...</div>
                            ) : records.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs space-y-3">
                                    <p>MSSV <strong>{currentMssv}</strong> chưa có hoạt động nào được lưu trữ.</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0C5776] text-white text-xs font-semibold hover:bg-[#001C44] transition-colors"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Ghi nhận hoạt động đầu tiên
                                    </button>
                                </div>
                            ) : (
                                records.map((r) => {
                                    const isRejected = r.status === 'REJECTED';
                                    const isPending = r.status === 'PENDING';

                                    return (
                                        <div
                                            key={r.id}
                                            className={`border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${isRejected
                                                    ? 'bg-rose-50/50 border-rose-200'
                                                    : isPending
                                                        ? 'bg-amber-50/30 border-amber-200'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Badge Tiêu chuẩn */}
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#0C5776] text-white">
                                                        {CRITERIA_MAP[r.target_standard] || r.target_standard}
                                                    </span>

                                                    {/* Badge Trạng thái */}
                                                    {isRejected ? (
                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            BTK không công nhận (Không tính điểm)
                                                        </span>
                                                    ) : isPending ? (
                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Chờ xét duyệt cuối năm
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Đã công nhận
                                                        </span>
                                                    )}

                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {r.participation_date}
                                                    </span>
                                                </div>

                                                <h4 className={`text-sm font-bold ${isRejected ? 'text-rose-900 line-through opacity-75' : 'text-[#001C44]'}`}>
                                                    {r.activity_title}
                                                </h4>

                                                <p className="text-xs text-slate-600">
                                                    <strong>Tiêu chí:</strong> {r.criteria_detail}
                                                </p>

                                                {r.organizer && (
                                                    <p className="text-xs text-slate-500">Đơn vị tổ chức: {r.organizer}</p>
                                                )}

                                                {isRejected && (
                                                    <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                                                        * Hoạt động này không được hội đồng thông qua tiêu chí SV5T. Bạn có thể tự gỡ khỏi hồ sơ bằng nút xóa bên cạnh.
                                                    </p>
                                                )}

                                                {r.proof_url && (
                                                    <a
                                                        href={r.proof_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-[#0C5776] hover:underline inline-flex items-center gap-1 font-medium pt-1"
                                                    >
                                                        Xem minh chứng <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>

                                            {/* Nút sinh viên tự xóa thủ công */}
                                            <button
                                                onClick={() => handleDeleteRecord(r.id, r.activity_title)}
                                                title="Xóa hoạt động này khỏi hồ sơ của bạn"
                                                className="shrink-0 p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Ghi nhận hoạt động */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
                            <div>
                                <h3 className="text-base font-bold text-[#001C44]">Ghi nhận hoạt động đã tham gia</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Lưu vào hồ sơ MSSV: <strong>{currentMssv}</strong></p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chọn chế độ */}
                        <div className="flex border-b border-slate-100 px-6 pt-3 gap-4">
                            <button
                                type="button"
                                onClick={() => setAddMode('SYSTEM')}
                                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${addMode === 'SYSTEM'
                                        ? 'border-[#0C5776] text-[#001C44]'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Chọn từ hoạt động trên hệ thống
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddMode('CUSTOM')}
                                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${addMode === 'CUSTOM'
                                        ? 'border-[#0C5776] text-[#001C44]'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Tự nhập hoạt động bên ngoài
                            </button>
                        </div>

                        <form onSubmit={handleAddActivity} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
                            {addMode === 'SYSTEM' ? (
                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Chọn hoạt động bạn đã tham gia *</label>
                                    <select
                                        value={selectedSystemActId}
                                        onChange={(e) => setSelectedSystemActId(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                        required
                                    >
                                        <option value="">-- Bấm để chọn hoạt động --</option>
                                        {systemActivities.map((act) => (
                                            <option key={act.id} value={act.id}>
                                                [{CRITERIA_MAP[act.supported_standard] || act.supported_standard}] {act.title}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                        * Khi hoạt động trên hệ thống có cập nhật duyệt/loại từ BTK, hồ sơ của bạn sẽ tự động đồng bộ theo.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Tên hoạt động *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="VD: Giải chạy bán marathon học sinh - sinh viên..."
                                            value={customForm.activity_title}
                                            onChange={(e) => setCustomForm({ ...customForm, activity_title: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold mb-1 text-[#001C44]">Đơn vị tổ chức</label>
                                            <input
                                                type="text"
                                                placeholder="VD: Đoàn trường/khoa..."
                                                value={customForm.organizer}
                                                onChange={(e) => setCustomForm({ ...customForm, organizer: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1 text-[#001C44]">Ngày tham gia *</label>
                                            <input
                                                type="date"
                                                required
                                                value={customForm.participation_date}
                                                onChange={(e) => setCustomForm({ ...customForm, participation_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Tiêu chuẩn SV5T hướng tới *</label>
                                        <select
                                            value={customForm.target_standard}
                                            onChange={(e) => setCustomForm({
                                                ...customForm,
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
                                        <label className="block font-semibold mb-1 text-[#001C44]">Tiêu chí cụ thể *</label>
                                        <select
                                            value={customForm.criteria_detail}
                                            onChange={(e) => setCustomForm({ ...customForm, criteria_detail: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776]"
                                            required
                                        >
                                            <option value="">-- Chọn tiêu chí cụ thể tương ứng --</option>
                                            {CRITERIA_TREE[customForm.target_standard as keyof typeof CRITERIA_TREE]?.items.map(
                                                (item, idx) => (
                                                    <option key={idx} value={item.full} title={item.full}>
                                                        {item.display}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Link ảnh/chứng nhận minh chứng (nếu có)</label>
                                        <input
                                            type="url"
                                            placeholder="https://drive.google.com/..."
                                            value={customForm.proof_url}
                                            onChange={(e) => setCustomForm({ ...customForm, proof_url: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#0C5776] text-white font-semibold rounded-lg hover:bg-[#001C44] transition-colors text-xs shadow-sm"
                                >
                                    Lưu vào hồ sơ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="mt-20 border-t border-slate-200 py-8 text-center text-xs text-slate-500 space-y-1 bg-white">
                <p className="text-slate-400">
                    Đại học Bách khoa Hà Nội • Bản quyền © 2026
                </p>
                <p className="text-[#0C5776] pt-1">
                    Xây dựng và phát triển bởi <span className="font-semibold text-[#001C44]">Phạm Thị Vân Anh</span>
                </p>
            </footer>
        </main>
    );
}