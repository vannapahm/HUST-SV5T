'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
    ArrowLeft, PlusCircle, Trash2, Calendar, Award,
    ExternalLink, User, Sparkles, X, LogOut, ArrowRight,
    CheckCircle2, Clock, AlertCircle, Lock, KeyRound, ShieldCheck
} from 'lucide-react';
import { CRITERIA_TREE } from '@/data/criteria';

interface StudentRecord {
    id: number;
    created_at: string;
    student_id: string;
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
    // Trạng thái đăng nhập bảo mật: 'INPUT_MSSV' | 'SET_PIN' | 'ENTER_PIN' | 'AUTHENTICATED'
    const [authStep, setAuthStep] = useState<'INPUT_MSSV' | 'SET_PIN' | 'ENTER_PIN' | 'AUTHENTICATED'>('INPUT_MSSV');

    const [mssvInput, setMssvInput] = useState('');
    const [currentMssv, setCurrentMssv] = useState<string>('');
    const [savedPin, setSavedPin] = useState<string>(''); // PIN trong CSDL

    // Form nhập / tạo PIN
    const [pinInput, setPinInput] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [pinError, setPinError] = useState('');

    // Modal đổi PIN
    const [isChangePinOpen, setIsChangePinOpen] = useState(false);
    const [oldPinInput, setOldPinInput] = useState('');
    const [newPinInput, setNewPinInput] = useState('');

    // Dữ liệu hồ sơ
    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [systemActivities, setSystemActivities] = useState<OfficialActivity[]>([]);

    // Modal thêm hoạt động
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addMode, setAddMode] = useState<'SYSTEM' | 'CUSTOM'>('SYSTEM');
    const [selectedSystemActId, setSelectedSystemActId] = useState<string>('');

    const [customForm, setCustomForm] = useState({
        activity_title: '',
        organizer: '',
        target_standard: 'DAO_DUC',
        criteria_detail: '',
        participation_date: new Date().toISOString().split('T')[0],
        proof_url: '',
    });

    useEffect(() => {
        fetchSystemActivities();
    }, []);

    const fetchSystemActivities = async () => {
        const { data } = await supabase
            .from('activities')
            .select('*')
            .order('start_date', { ascending: false });
        if (data) setSystemActivities(data);
    };

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

    // BƯỚC 1: KIỂM TRA MSSV ĐÃ CÓ MÃ PIN CHƯA
    const handleCheckMssv = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanMssv = mssvInput.trim();
        if (!cleanMssv) {
            alert('Vui lòng nhập Mã số sinh viên (MSSV)!');
            return;
        }

        setPinError('');
        setPinInput('');
        setPinConfirm('');
        setCurrentMssv(cleanMssv);

        // Tra cứu trong bảng student_profiles
        const { data, error } = await supabase
            .from('student_profiles')
            .select('pin_code')
            .eq('student_id', cleanMssv)
            .maybeSingle();

        if (error) {
            alert('Lỗi kết nối cơ sở dữ liệu: ' + error.message);
            return;
        }

        if (data && data.pin_code) {
            // Đã có mã PIN -> Yêu cầu nhập PIN
            setSavedPin(data.pin_code);
            setAuthStep('ENTER_PIN');
        } else {
            // Chưa có mã PIN -> Yêu cầu tạo mới mã PIN
            setAuthStep('SET_PIN');
        }
    };

    // BƯỚC 2A: TẠO MÃ PIN LẦN ĐẦU
    const handleCreatePin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput.length < 4 || pinInput.length > 6) {
            setPinError('Mã PIN phải có từ 4 đến 6 chữ số!');
            return;
        }
        if (pinInput !== pinConfirm) {
            setPinError('Mã PIN xác nhận không trùng khớp!');
            return;
        }

        const { error } = await supabase
            .from('student_profiles')
            .insert([{ student_id: currentMssv, pin_code: pinInput }]);

        if (error) {
            alert('Không thể tạo mã PIN: ' + error.message);
            return;
        }

        setSavedPin(pinInput);
        setAuthStep('AUTHENTICATED');
        fetchRecords(currentMssv);
        alert('Tạo mã PIN thành công! Hãy ghi nhớ mã PIN này cho các lần truy cập sau.');
    };

    // BƯỚC 2B: XÁC MINH MÃ PIN ĐÃ CÓ
    const handleVerifyPin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput !== savedPin) {
            setPinError('Mã PIN không chính xác! Vui lòng thử lại.');
            return;
        }

        setAuthStep('AUTHENTICATED');
        fetchRecords(currentMssv);
    };

    // ĐỔI MÃ PIN
    const handleChangePin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (oldPinInput !== savedPin) {
            alert('Mã PIN cũ không chính xác!');
            return;
        }
        if (newPinInput.length < 4 || newPinInput.length > 6) {
            alert('Mã PIN mới phải có từ 4 đến 6 ký tự số!');
            return;
        }

        const { error } = await supabase
            .from('student_profiles')
            .update({ pin_code: newPinInput })
            .eq('student_id', currentMssv);

        if (error) {
            alert('Không thể đổi mã PIN: ' + error.message);
            return;
        }

        setSavedPin(newPinInput);
        setIsChangePinOpen(false);
        setOldPinInput('');
        setNewPinInput('');
        alert('Đổi mã PIN thành công!');
    };

    // ĐĂNG XUẤT / ĐỔI MSSV
    const handleLogout = () => {
        setAuthStep('INPUT_MSSV');
        setCurrentMssv('');
        setMssvInput('');
        setPinInput('');
        setPinConfirm('');
        setSavedPin('');
        setRecords([]);
    };

    // THÊM HOẠT ĐỘNG
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
                status: act.status || 'APPROVED',
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
                status: 'PENDING',
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

    // XÓA HOẠT ĐỘNG
    const handleDeleteRecord = async (id: number, title: string) => {
        if (!confirm(`Bạn có chắc muốn xóa hoạt động:\n"${title}"\nkhỏi hồ sơ tích lũy của mình?`)) return;

        const { error } = await supabase.from('student_activities').delete().eq('id', id);
        if (!error) {
            setRecords(records.filter((r) => r.id !== id));
        } else {
            alert('Lỗi khi xóa: ' + error.message);
        }
    };

    // Chỉ tính vào tổng tiêu chuẩn các hoạt động APPROVED
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
                                    Bảo mật thông tin cá nhân bằng Mã PIN riêng biệt cho từng sinh viên.
                                </p>
                            </div>

                            {/* Các nút hành động khi đã đăng nhập thành công */}
                            {authStep === 'AUTHENTICATED' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BCFEFE] text-[#001C44] text-xs font-semibold hover:bg-white transition-all shadow-sm"
                                    >
                                        <PlusCircle className="w-4 h-4 text-[#0C5776]" />
                                        Ghi nhận hoạt động
                                    </button>
                                    <button
                                        onClick={() => setIsChangePinOpen(true)}
                                        title="Đổi mã PIN bảo mật"
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                                    >
                                        <KeyRound className="w-3.5 h-3.5 text-[#BCFEFE]" />
                                        <span>Đổi PIN</span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        title="Đăng xuất khỏi hồ sơ"
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-rose-500/30 text-xs font-medium text-white transition-colors"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ==================== MÀN HÌNH 1: NHẬP MSSV ==================== */}
                {authStep === 'INPUT_MSSV' && (
                    <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in zoom-in duration-150">
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                            <div className="w-16 h-16 bg-[#BCFEFE]/20 text-[#0C5776] rounded-2xl flex items-center justify-center mx-auto">
                                <User className="w-8 h-8" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#001C44]">Cổng tra cứu hồ sơ sinh viên</h2>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Nhập Mã số sinh viên của bạn để tiếp tục. Mỗi hồ sơ được bảo vệ riêng bằng Mã PIN cá nhân.
                                </p>
                            </div>

                            <form onSubmit={handleCheckMssv} className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="Nhập MSSV (VD: 20211234)..."
                                    value={mssvInput}
                                    onChange={(e) => setMssvInput(e.target.value)}
                                    className="w-full px-4 py-3 text-sm text-center font-bold tracking-wider border border-slate-300 rounded-xl focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white"
                                />

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-[#0C5776] hover:bg-[#001C44] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span>Tiếp tục</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ==================== MÀN HÌNH 2A: THIẾT LẬP MÃ PIN LẦN ĐẦU ==================== */}
                {authStep === 'SET_PIN' && (
                    <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in zoom-in duration-150">
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
                            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                                <ShieldCheck className="w-8 h-8" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#001C44]">Thiết lập mã PIN bảo vệ</h2>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    MSSV: <strong className="text-[#001C44]">{currentMssv}</strong> chưa có mã PIN. Vui lòng tạo mã PIN (4–6 số) để không ai khác có thể xem hồ sơ của bạn.
                                </p>
                            </div>

                            <form onSubmit={handleCreatePin} className="space-y-3 text-left">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mã PIN mới (4 - 6 số) *</label>
                                    <input
                                        type="password"
                                        required
                                        maxLength={6}
                                        autoFocus
                                        placeholder="Nhập mã PIN..."
                                        value={pinInput}
                                        onChange={(e) => setPinInput(e.target.value)}
                                        className="w-full px-4 py-2.5 text-center text-base tracking-widest font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Xác nhận lại mã PIN *</label>
                                    <input
                                        type="password"
                                        required
                                        maxLength={6}
                                        placeholder="Nhập lại mã PIN..."
                                        value={pinConfirm}
                                        onChange={(e) => setPinConfirm(e.target.value)}
                                        className="w-full px-4 py-2.5 text-center text-base tracking-widest font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                {pinError && (
                                    <p className="text-xs text-rose-600 font-medium text-center">{pinError}</p>
                                )}

                                <div className="pt-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAuthStep('INPUT_MSSV')}
                                        className="w-1/3 py-2.5 border border-slate-300 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-100"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-2/3 py-2.5 bg-[#0C5776] hover:bg-[#001C44] text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                                    >
                                        Lưu mã PIN & Vào hồ sơ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ==================== MÀN HÌNH 2B: NHẬP MÃ PIN ĐỂ MỞ KHÓA ==================== */}
                {authStep === 'ENTER_PIN' && (
                    <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in zoom-in duration-150">
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
                            <div className="w-16 h-16 bg-[#0C5776]/10 text-[#0C5776] rounded-2xl flex items-center justify-center mx-auto">
                                <Lock className="w-8 h-8" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#001C44]">Mở khóa hồ sơ cá nhân</h2>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Hồ sơ MSSV: <strong className="text-[#001C44]">{currentMssv}</strong> đã được bảo vệ. Vui lòng nhập mã PIN cá nhân của bạn.
                                </p>
                            </div>

                            <form onSubmit={handleVerifyPin} className="space-y-4">
                                <input
                                    type="password"
                                    required
                                    autoFocus
                                    maxLength={6}
                                    placeholder="••••••"
                                    value={pinInput}
                                    onChange={(e) => setPinInput(e.target.value)}
                                    className="w-full px-4 py-3 text-xl text-center font-bold tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white"
                                />

                                {pinError && (
                                    <p className="text-xs text-rose-600 font-medium">{pinError}</p>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAuthStep('INPUT_MSSV')}
                                        className="w-1/3 py-2.5 border border-slate-300 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-100"
                                    >
                                        Đổi MSSV
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-2/3 py-2.5 bg-[#0C5776] hover:bg-[#001C44] text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                                    >
                                        Mở khóa hồ sơ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ==================== MÀN HÌNH 3: HỒ SƠ TÍCH LŨY (ĐÃ XÁC THỰC) ==================== */}
                {authStep === 'AUTHENTICATED' && (
                    <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6 animate-in fade-in duration-150">
                        {/* Thanh thông tin sinh viên */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <span className="text-xs text-slate-500">Đang xem hồ sơ bảo mật:</span>
                                <div className="text-xl font-bold text-[#001C44] flex items-center gap-2">
                                    <span>MSSV: {currentMssv}</span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Đã bảo vệ bằng PIN
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-right">
                                <div>
                                    <span className="text-xs text-slate-500">Hợp lệ tính điểm:</span>
                                    <div className="text-lg font-bold text-[#0C5776]">{totalApproved} tiêu chí</div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-slate-400 hover:text-rose-600 underline"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>

                        {/* Thống kê 5 tiêu chuẩn */}
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
                                <h3 className="text-sm font-bold text-[#001C44]">Lịch sử hoạt động đã tích lũy</h3>
                                <span className="text-xs text-slate-500">{records.length} hoạt động trong hồ sơ</span>
                            </div>

                            {loading ? (
                                <div className="py-12 text-center text-xs text-slate-500">Đang tải hồ sơ tích lũy...</div>
                            ) : records.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs space-y-3">
                                    <p>Hồ sơ MSSV <strong>{currentMssv}</strong> chưa có hoạt động nào.</p>
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
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#0C5776] text-white">
                                                        {CRITERIA_MAP[r.target_standard] || r.target_standard}
                                                    </span>

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
                                                        * Hoạt động này không được hội đồng thông qua tiêu chí SV5T. Bạn có thể tự xóa khỏi hồ sơ bằng nút thùng rác bên cạnh.
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

            {/* MODAL ĐỔI MÃ PIN */}
            {isChangePinOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-sm font-bold text-[#001C44]">Đổi mã PIN bảo mật</h3>
                            <button onClick={() => setIsChangePinOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePin} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Mã PIN hiện tại *</label>
                                <input
                                    type="password"
                                    required
                                    maxLength={6}
                                    value={oldPinInput}
                                    onChange={(e) => setOldPinInput(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-center font-bold tracking-widest"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Mã PIN mới (4–6 số) *</label>
                                <input
                                    type="password"
                                    required
                                    maxLength={6}
                                    value={newPinInput}
                                    onChange={(e) => setNewPinInput(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-center font-bold tracking-widest"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsChangePinOpen(false)}
                                    className="px-3 py-1.5 border rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-[#0C5776] text-white font-semibold rounded-lg hover:bg-[#001C44]"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL GHI NHẬN HOẠT ĐỘNG */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
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