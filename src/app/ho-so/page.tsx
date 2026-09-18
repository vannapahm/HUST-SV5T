'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
    ArrowLeft, PlusCircle, Trash2, Calendar, Award,
    ExternalLink, User, Sparkles, X, LogOut, ArrowRight,
    CheckCircle2, Clock, AlertCircle, Lock, KeyRound, FileSpreadsheet, Save, Calculator, Info,
    Download, Search
} from 'lucide-react';
import { CRITERIA_TREE } from '@/data/criteria';
import { generateDocxReport } from '@/lib/exportDocx';

interface StudentRecord {
    id: number;
    created_at: string;
    student_id: string;
    activity_id?: string;
    activity_title: string;
    organizer?: string;
    target_standard: string;
    criteria_detail: string;
    completion_condition?: string | null;
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
    completion_condition?: string | null;
    start_date: string;
    status?: 'APPROVED' | 'PENDING' | 'REJECTED';
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

const getCurrentAcademicYear = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const isAfterSep15 = month > 9 || (month === 9 && day >= 15);
    return isAfterSep15 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const formatGPA = (val: number) => {
    if (!val || isNaN(val)) return '0.0';
    const rounded = Number(val.toFixed(2));
    return rounded % 1 === 0 ? `${rounded}.0` : `${rounded}`;
};

export default function StudentPortfolioPage() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

    const [academicYear, setAcademicYear] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sv5t_ho_so_year') || getCurrentAcademicYear();
        }
        return getCurrentAcademicYear();
    });
    const startYear = academicYear.split('-')[0];

    // Form đăng nhập
    const [mssvInput, setMssvInput] = useState('');
    const [pinInput, setPinInput] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [submittingAuth, setSubmittingAuth] = useState(false);
    const [authError, setAuthError] = useState('');

    // Dữ liệu tài khoản
    const [currentMssv, setCurrentMssv] = useState<string>('');
    const [savedPin, setSavedPin] = useState<string>('');

    // Modal đổi mật khẩu
    const [isChangePinOpen, setIsChangePinOpen] = useState(false);
    const [oldPinInput, setOldPinInput] = useState('');
    const [newPinInput, setNewPinInput] = useState('');

    // Modal thông tin báo cáo
    const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
    const [savingAcademic, setSavingAcademic] = useState(false);
    const [academicData, setAcademicData] = useState<AcademicInfo>({
        student_id: '', full_name: '', gender: 'Nam', birth_year: '', ethnicity: 'Kinh',
        class_name: '', student_year: '1', position: '', union_status: 'Đoàn viên',
        phone: '', email_sis: '', faculty_name: 'Trường Công nghệ Thông tin và Truyền thông',
        drl_sem1: 0, drl_sem2: 0, gpa_sem1: 0, credits_sem1: 0, gpa_sem2: 0, credits_sem2: 0,
        physical_education_status: 'Hoàn thành đủ 05 học phần GDTC', foreign_language_status: '', other_achievements: ''
    });

    // Hoạt động cá nhân
    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [systemActivities, setSystemActivities] = useState<OfficialActivity[]>([]);

    // Modal thêm hoạt động
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSystemActId, setSelectedSystemActId] = useState<string>('');
    const [systemProofUrl, setSystemProofUrl] = useState<string>('');
    const [isAddingAct, setIsAddingAct] = useState(false);

    // Tìm kiếm hoạt động (Searchable Dropdown)
    const [actSearchTerm, setActSearchTerm] = useState('');
    const [isActDropdownOpen, setIsActDropdownOpen] = useState(false);

    const [exportingDocx, setExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        if (!academicData.full_name || !academicData.class_name) {
            alert('Vui lòng bấm vào "Khai báo Báo cáo thành tích" để điền Họ tên và Lớp trước khi xuất file!');
            setIsAcademicModalOpen(true);
            return;
        }

        try {
            setExportingDocx(true);
            await generateDocxReport({
                academicData,
                records,
                academicYear,
                calculatedStats,
            });
        } catch (error: any) {
            alert('Lỗi xuất file Word: ' + error.message);
        } finally {
            setExportingDocx(false);
        }
    };

    useEffect(() => {
        checkAutoLogin();
    }, []);

    useEffect(() => {
        fetchSystemActivities();
    }, [academicYear]);

    useEffect(() => {
        if (isLoggedIn && currentMssv) {
            fetchRecords(currentMssv, academicYear);
            fetchAcademicInfo(currentMssv, academicYear);
        }
    }, [isLoggedIn, currentMssv, academicYear]);

    const checkAutoLogin = async () => {
        try {
            const savedSession = localStorage.getItem('sv5t_student_session');
            if (savedSession) {
                const { mssv, pin } = JSON.parse(savedSession);
                if (mssv && pin) {
                    const { data } = await supabase
                        .from('student_profiles')
                        .select('pin_code')
                        .eq('student_id', mssv)
                        .maybeSingle();

                    if (data && data.pin_code === pin) {
                        setCurrentMssv(mssv);
                        setSavedPin(pin);
                        setIsLoggedIn(true);
                    } else {
                        localStorage.removeItem('sv5t_student_session');
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAuth(false);
        }
    };

    const fetchSystemActivities = async () => {
        const { data } = await supabase
            .from('activities')
            .select('*')
            .order('start_date', { ascending: false });

        if (data) {
            const startYearNum = parseInt(academicYear.split('-')[0]);
            const startBound = new Date(`${startYearNum}-08-01`);
            const endBound = new Date(`${startYearNum + 1}-08-01`);

            const filteredActs = data.filter((act) => {
                if (!act.start_date) return true;
                const d = new Date(act.start_date);
                return d >= startBound && d < endBound;
            });

            setSystemActivities(filteredActs);
        }
    };

    const fetchRecords = async (mssv: string, year: string = academicYear) => {
        setLoadingRecords(true);
        const { data, error } = await supabase
            .from('student_activities')
            .select('*')
            .eq('student_id', mssv.trim())
            .eq('academic_year', year)
            .order('participation_date', { ascending: false });

        if (!error && data) {
            setRecords(data as StudentRecord[]);
        }
        setLoadingRecords(false);
    };

    const fetchAcademicInfo = async (mssv: string, year: string = academicYear) => {
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

        setAcademicData(mergedData);
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanMssv = mssvInput.trim();
        const cleanPin = pinInput.trim();
        setAuthError('');

        if (!cleanMssv) { setAuthError('Vui lòng nhập MSSV!'); return; }
        if (!/^\d{6}$/.test(cleanPin)) { setAuthError('Mật khẩu phải bao gồm đúng 6 chữ số!'); return; }

        setSubmittingAuth(true);

        const { data, error } = await supabase
            .from('student_profiles')
            .select('pin_code')
            .eq('student_id', cleanMssv)
            .maybeSingle();

        setSubmittingAuth(false);

        if (error) { setAuthError('Lỗi kết nối cơ sở dữ liệu: ' + error.message); return; }

        if (!data) {
            const confirmCreate = confirm(
                `MSSV "${cleanMssv}" chưa kích hoạt hồ sơ trên hệ thống.\n\nBạn có muốn khởi tạo hồ sơ mới với mật khẩu: ${cleanPin} không?`
            );
            if (!confirmCreate) return;

            const { error: insertErr } = await supabase
                .from('student_profiles')
                .insert([{ student_id: cleanMssv, pin_code: cleanPin }]);

            if (insertErr) { setAuthError('Không thể tạo hồ sơ: ' + insertErr.message); return; }

            loginSuccess(cleanMssv, cleanPin);
            alert('Khởi tạo hồ sơ thành công! Hãy ghi nhớ mật khẩu 6 số này cho các lần sau.');
        } else {
            if (data.pin_code !== cleanPin) {
                setAuthError('Mật khẩu không chính xác! Vui lòng liên hệ Quản trị viên nếu bạn quên mật khẩu.');
                return;
            }
            loginSuccess(cleanMssv, cleanPin);
        }
    };

    const loginSuccess = (mssv: string, pin: string) => {
        if (rememberMe) {
            localStorage.setItem('sv5t_student_session', JSON.stringify({ mssv, pin }));
        } else {
            localStorage.removeItem('sv5t_student_session');
        }
        setCurrentMssv(mssv);
        setSavedPin(pin);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('sv5t_student_session');
        setIsLoggedIn(false);
        setCurrentMssv('');
        setMssvInput('');
        setPinInput('');
        setSavedPin('');
        setRecords([]);
        setAuthError('');
    };

    const calculatedStats = useMemo(() => {
        const totalCredits = (Number(academicData.credits_sem1) || 0) + (Number(academicData.credits_sem2) || 0);
        let averageGpa = 0;
        if (totalCredits > 0) {
            const weightedSum =
                (Number(academicData.gpa_sem1) || 0) * (Number(academicData.credits_sem1) || 0) +
                (Number(academicData.gpa_sem2) || 0) * (Number(academicData.credits_sem2) || 0);
            averageGpa = Number((weightedSum / totalCredits).toFixed(2));
        }

        const averageDrl = Number(
            (((Number(academicData.drl_sem1) || 0) + (Number(academicData.drl_sem2) || 0)) / 2).toFixed(1)
        );

        return { averageGpa, averageDrl, totalCredits };
    }, [academicData.gpa_sem1, academicData.credits_sem1, academicData.gpa_sem2, academicData.credits_sem2, academicData.drl_sem1, academicData.drl_sem2]);

    const handleSaveAcademicInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingAcademic(true);

        const payload = {
            ...academicData,
            academic_year: academicYear,
            drl_sem1: Number(academicData.drl_sem1) || 0,
            drl_sem2: Number(academicData.drl_sem2) || 0,
            gpa_sem1: Number(academicData.gpa_sem1) || 0,
            credits_sem1: Number(academicData.credits_sem1) || 0,
            gpa_sem2: Number(academicData.gpa_sem2) || 0,
            credits_sem2: Number(academicData.credits_sem2) || 0,
            student_id: currentMssv,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('student_academic_info').upsert(payload);

        setSavingAcademic(false);

        if (error) {
            alert('Lỗi lưu thông tin: ' + error.message);
        } else {
            alert('Đã lưu Thông tin cá nhân & Báo cáo thành tích thành công!');
            setIsAcademicModalOpen(false);
        }
    };

    const handleChangePin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (oldPinInput !== savedPin) { alert('Mật khẩu hiện tại không đúng!'); return; }
        if (!/^\d{6}$/.test(newPinInput)) { alert('Mật khẩu mới phải bao gồm đúng 6 chữ số!'); return; }

        const { error } = await supabase.from('student_profiles').update({ pin_code: newPinInput }).eq('student_id', currentMssv);

        if (error) { alert('Không thể đổi mật khẩu: ' + error.message); return; }

        setSavedPin(newPinInput);
        if (localStorage.getItem('sv5t_student_session')) {
            localStorage.setItem('sv5t_student_session', JSON.stringify({ mssv: currentMssv, pin: newPinInput }));
        }
        setIsChangePinOpen(false);
        setOldPinInput('');
        setNewPinInput('');
        alert('Đổi mật khẩu thành công!');
    };

    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMssv || isAddingAct) return;

        const isDuplicate = records.some(r => String(r.activity_id) === selectedSystemActId);
        if (isDuplicate) {
            alert('⚠️ Hoạt động này đã tồn tại trong hồ sơ của bạn rồi. Không thể thêm trùng lặp!');
            return;
        }

        setIsAddingAct(true);

        try {
            const act = systemActivities.find((a) => String(a.id) === selectedSystemActId);
            if (!act) {
                alert('Vui lòng chọn một hoạt động trong danh sách!');
                return;
            }

            const newRecordPayload = {
                student_id: currentMssv,
                academic_year: academicYear,
                activity_id: String(act.id),
                activity_title: act.title,
                organizer: act.organizer,
                target_standard: act.supported_standard,
                criteria_detail: act.criteria_detail || 'Tham gia hoạt động được công nhận',
                completion_condition: act.completion_condition || null,
                participation_date: act.start_date ? act.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
                proof_url: systemProofUrl.trim() || '',
                status: act.status || 'APPROVED',
            };

            const { data, error } = await supabase.from('student_activities').insert([newRecordPayload]).select();

            if (error) {
                alert('Không thể lưu hoạt động: ' + error.message);
            } else if (data) {
                setRecords([data[0] as StudentRecord, ...records]);
                setIsModalOpen(false);
                setSelectedSystemActId('');
                setSystemProofUrl('');
                setActSearchTerm('');
                alert('Đã ghi nhận hoạt động thành công vào hồ sơ MSSV: ' + currentMssv);
            }
        } finally {
            setIsAddingAct(false);
        }
    };

    const handleDeleteRecord = async (id: number, title: string) => {
        if (!confirm(`Xác nhận xóa hoạt động:\n"${title}"\nkhỏi hồ sơ tích lũy?`)) return;

        const { error } = await supabase.from('student_activities').delete().eq('id', id);
        if (!error) {
            setRecords(records.filter((r) => r.id !== id));
        } else {
            alert('Lỗi khi xóa: ' + error.message);
        }
    };

    const statsByStandard = {
        DAO_DUC: records.filter((r) => r.target_standard === 'DAO_DUC' && r.status === 'APPROVED').length,
        HOC_TAP: records.filter((r) => r.target_standard === 'HOC_TAP' && r.status === 'APPROVED').length,
        THE_LUC: records.filter((r) => r.target_standard === 'THE_LUC' && r.status === 'APPROVED').length,
        TINH_NGUYEN: records.filter((r) => r.target_standard === 'TINH_NGUYEN' && r.status === 'APPROVED').length,
        HOI_NHAP: records.filter((r) => r.target_standard === 'HOI_NHAP' && r.status === 'APPROVED').length,
    };

    const totalApproved = records.filter((r) => r.status === 'APPROVED').length;

    if (loadingAuth) {
        return (
            <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-xs">
                Đang kiểm tra hồ sơ đăng nhập...
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
            <div>
                {/* Header */}
                <header className="bg-[#001C44] text-white border-b border-[#0C5776] shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 py-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#BCFEFE] hover:underline mb-1.5">
                                    <ArrowLeft className="w-3.5 h-3.5" /> Về Trang chủ
                                </Link>
                                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-[#BCFEFE]" /> Hồ sơ cá nhân Sinh viên 5 tốt
                                </h1>
                                <p className="text-xs text-[#BCFEFE]/80 mt-0.5">
                                    Theo dõi tiến độ, số lượng tiêu chí đạt chuẩn và lưu trữ minh chứng rèn luyện.
                                </p>
                            </div>

                            {isLoggedIn && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button onClick={() => setIsAcademicModalOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm">
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                                        <span>Khai báo Báo cáo thành tích</span>
                                    </button>

                                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BCFEFE] text-[#001C44] text-xs font-semibold hover:bg-white transition-all shadow-sm">
                                        <PlusCircle className="w-4 h-4 text-[#0C5776]" /> Thêm hoạt động
                                    </button>

                                    <button onClick={handleExportDocx} disabled={exportingDocx} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50">
                                        <Download className="w-4 h-4 text-blue-100" />
                                        <span>{exportingDocx ? 'Đang tạo...' : 'Xuất đơn Word'}</span>
                                    </button>

                                    <button onClick={() => setIsChangePinOpen(true)} title="Đổi mật khẩu bảo mật" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors">
                                        <KeyRound className="w-3.5 h-3.5 text-[#BCFEFE]" /> <span>Đổi mật khẩu</span>
                                    </button>

                                    <button onClick={handleLogout} title="Đăng xuất khỏi hồ sơ" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-rose-500/30 text-xs font-medium text-white transition-colors">
                                        <LogOut className="w-3.5 h-3.5" /> <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {!isLoggedIn && (
                    <div className="max-w-md mx-auto px-4 py-10 animate-in fade-in zoom-in duration-150">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                            <div className="text-center space-y-1">
                                <div className="w-12 h-12 bg-[#0C5776]/10 text-[#0C5776] rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg font-bold text-[#001C44]">Hồ sơ Sinh viên 5 tốt</h2>
                                <p className="text-xs text-slate-500">Quản lý hoạt động rèn luyện và lập báo cáo thành tích</p>
                            </div>

                            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 text-xs text-slate-700 flex items-start gap-2.5">
                                <Info className="w-4 h-4 text-[#0C5776] shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    Mật khẩu gồm 6 chữ số. Sinh viên truy cập lần đầu sẽ tự thiết lập mật khẩu trực tiếp tại đây.
                                </div>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">MSSV *</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" required autoFocus placeholder="Nhập MSSV..." value={mssvInput} onChange={(e) => setMssvInput(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu *</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="password" required maxLength={6} placeholder="Nhập 6 số..." value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} className="w-full pl-9 pr-3 py-2 text-xs font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-0.5 text-xs">
                                    <label className="inline-flex items-center gap-2 cursor-pointer text-slate-600 select-none text-[11px]">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-slate-300 text-[#0C5776] focus:ring-0 w-3.5 h-3.5" />
                                        <span>Ghi nhớ đăng nhập</span>
                                    </label>
                                </div>
                                {authError && <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium leading-relaxed">{authError}</div>}
                                <button type="submit" disabled={submittingAuth} className="w-full py-2.5 bg-[#0C5776] hover:bg-[#001C44] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-1">
                                    <span>{submittingAuth ? 'Đang xác thực...' : 'Đăng nhập'}</span> <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {isLoggedIn && (
                    <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6 animate-in fade-in duration-150">
                        {/* Thẻ tóm tắt thông tin */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500">Năm học xét duyệt:</span>
                                    <select value={academicYear} onChange={(e) => { setAcademicYear(e.target.value); localStorage.setItem('sv5t_ho_so_year', e.target.value); }} className="text-xs font-bold text-[#0C5776] bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#0C5776] cursor-pointer">
                                        <option value="2024-2025">Năm học 2024 – 2025</option>
                                        <option value="2025-2026">Năm học 2025 – 2026</option>
                                        <option value="2026-2027">Năm học 2026 – 2027</option>
                                        <option value="2027-2028">Năm học 2027 – 2028</option>
                                    </select>
                                </div>
                                <div className="text-xl font-bold text-[#001C44] flex flex-wrap items-center gap-2">
                                    <span>{academicData.full_name || 'Chưa cập nhật họ tên'}</span>
                                    <span className="text-sm font-semibold text-slate-500">({currentMssv})</span>
                                    {academicData.class_name && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{academicData.class_name}</span>}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                                    <span>Trường/Khoa: <strong>{academicData.faculty_name}</strong></span> <span>•</span>
                                    <span>GPA trung bình: <strong className="text-[#0C5776]">{formatGPA(calculatedStats.averageGpa)}/4.0</strong></span> <span>•</span>
                                    <span>ĐRL trung bình: <strong className="text-emerald-700">{calculatedStats.averageDrl || '0'}</strong></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500">Tiêu chí được công nhận:</span>
                                <div className="text-lg font-bold text-[#0C5776]">{totalApproved} tiêu chí</div>
                            </div>
                        </div>

                        {/* Thống kê */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {Object.entries(CRITERIA_MAP).map(([key, label]) => {
                                const count = (statsByStandard as any)[key] || 0;
                                return (
                                    <div key={key} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                                        <div className="text-xs text-slate-600 font-medium truncate">{label}</div>
                                        <div className={`text-2xl font-bold mt-1 ${count > 0 ? 'text-[#0C5776]' : 'text-slate-300'}`}>{count}</div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">mục đạt chuẩn</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex border-b border-slate-200 gap-4 pt-2">
                            <button className="pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 border-[#0C5776] text-[#001C44]">
                                <Award className="w-4 h-4 text-[#0C5776]" /> Hoạt động tích lũy tiêu chí
                                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-[#0C5776] font-bold">{records.length}</span>
                            </button>
                        </div>

                        {/* Danh sách hoạt động */}
                        <div className="space-y-3">
                            {loadingRecords ? (
                                <div className="py-12 text-center text-xs text-slate-500">Đang tải hồ sơ tích lũy...</div>
                            ) : records.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs space-y-3">
                                    <p>Hồ sơ MSSV <strong>{currentMssv}</strong> chưa có hoạt động nào trong năm học {academicYear}.</p>
                                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0C5776] text-white text-xs font-semibold hover:bg-[#001C44] transition-colors">
                                        <PlusCircle className="w-4 h-4" /> Ghi nhận hoạt động đầu tiên
                                    </button>
                                </div>
                            ) : (
                                records.map((r) => {
                                    const isRejected = r.status === 'REJECTED';
                                    const isPending = r.status === 'PENDING';
                                    return (
                                        <div key={r.id} className={`border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${isRejected ? 'bg-rose-50/50 border-rose-200' : isPending ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#0C5776] text-white">{CRITERIA_MAP[r.target_standard] || r.target_standard}</span>
                                                    {isRejected ? (<span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Không công nhận</span>) : isPending ? (<span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"><Clock className="w-3 h-3" />Chờ xét duyệt</span>) : (<span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Đã công nhận</span>)}
                                                    <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {r.participation_date}</span>
                                                </div>
                                                <h4 className={`text-sm font-bold ${isRejected ? 'text-rose-900 line-through opacity-75' : 'text-[#001C44]'}`}>{r.activity_title}</h4>
                                                <p className="text-xs text-slate-600"><strong>Tiêu chí:</strong> {r.criteria_detail}</p>
                                                {r.completion_condition && <p className="text-xs text-amber-800 bg-amber-50/80 border border-amber-200 px-2 py-1 rounded-md inline-block"><strong>Yêu cầu hoàn thành:</strong> {r.completion_condition}</p>}
                                                {r.organizer && <p className="text-xs text-slate-500">Đơn vị tổ chức: {r.organizer}</p>}
                                                {isRejected && <p className="text-[11px] text-rose-600 font-medium pt-0.5">* Hoạt động này không được thông qua. Bạn có thể xóa khỏi hồ sơ bằng nút thùng rác bên cạnh.</p>}
                                                {r.proof_url && <a href={r.proof_url} target="_blank" rel="noreferrer" className="text-xs text-[#0C5776] hover:underline inline-flex items-center gap-1 font-medium pt-1">Xem minh chứng <ExternalLink className="w-3 h-3" /></a>}
                                            </div>
                                            <button onClick={() => handleDeleteRecord(r.id, r.activity_title)} title="Xóa hoạt động" className="shrink-0 p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Thông tin báo cáo */}
            {isAcademicModalOpen && (
                <div onClick={() => setIsAcademicModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
                            <div>
                                <h3 className="text-base font-bold text-[#001C44] flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Báo cáo thành tích cá nhân</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Cung cấp dữ liệu cá nhân và học vụ phục vụ lập hồ sơ Sinh viên 5 tốt.</p>
                            </div>
                            <button type="button" onClick={() => setIsAcademicModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveAcademicInfo} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 max-h-[calc(92vh-130px)]">
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                                    <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">1. Thông tin cá nhân</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2">
                                            <label className="block font-semibold mb-1">Họ và tên *</label>
                                            <input type="text" required placeholder="VD: Nguyễn Văn A" value={academicData.full_name} onChange={(e) => setAcademicData({ ...academicData, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Giới tính *</label>
                                            <select value={academicData.gender} onChange={(e) => setAcademicData({ ...academicData, gender: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]">
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block font-semibold mb-1">Năm sinh *</label>
                                            <input type="text" required placeholder="VD: 2005" value={academicData.birth_year} onChange={(e) => setAcademicData({ ...academicData, birth_year: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Dân tộc *</label>
                                            <input type="text" required placeholder="VD: Kinh" value={academicData.ethnicity} onChange={(e) => setAcademicData({ ...academicData, ethnicity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Năm học thứ *</label>
                                            <select required value={academicData.student_year} onChange={(e) => setAcademicData({ ...academicData, student_year: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]">
                                                <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Đoàn viên/ Đảng viên *</label>
                                            <select required value={academicData.union_status} onChange={(e) => setAcademicData({ ...academicData, union_status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]">
                                                <option value="Đảng viên">Đảng viên</option><option value="Đoàn viên">Đoàn viên</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold mb-1">Lớp *</label>
                                            <input type="text" required placeholder="VD: CTTT Phân tích KD 02 – K68" value={academicData.class_name} onChange={(e) => setAcademicData({ ...academicData, class_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Trường/ Khoa *</label>
                                            <select required value={academicData.faculty_name} onChange={(e) => setAcademicData({ ...academicData, faculty_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-[#0C5776] focus:outline-none focus:border-[#0C5776]">
                                                {FACULTIES.map((fac) => (<option key={fac} value={fac}>{fac}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        <div className="sm:col-span-4">
                                            <label className="block font-semibold mb-1">Chức vụ Đoàn - Hội *</label>
                                            <input type="text" required placeholder='VD: Không' value={academicData.position} onChange={(e) => setAcademicData({ ...academicData, position: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label className="block font-semibold mb-1">Số điện thoại *</label>
                                            <input type="tel" required placeholder="VD: 0912345678" value={academicData.phone} onChange={(e) => setAcademicData({ ...academicData, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                                        </div>
                                        <div className="sm:col-span-5">
                                            <label className="block font-semibold mb-1">Email SIS *</label>
                                            <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white focus-within:border-[#0C5776]">
                                                <input type="text" required placeholder="Anh.PTV233017" value={academicData.email_sis.replace(/@sis\.hust\.edu\.vn$/i, '')} onChange={(e) => { const prefix = e.target.value.trim().replace(/@sis\.hust\.edu\.vn$/i, ''); setAcademicData({ ...academicData, email_sis: prefix ? `${prefix}@sis.hust.edu.vn` : '' }); }} className="w-full px-3 py-2 text-xs border-0 focus:outline-none bg-transparent" />
                                                <span className="bg-slate-100 px-2.5 py-2 text-[11px] text-slate-500 font-mono select-none border-l border-slate-200 shrink-0">@sis.hust.edu.vn</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] flex items-center gap-1.5"><Calculator className="w-4 h-4 text-[#0C5776]" /> 2. Kết quả Học tập & Rèn luyện</span>
                                        <span className="text-[11px] text-blue-700 font-semibold">Tự động tính theo trọng số tín chỉ</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                        <div className="font-semibold text-xs text-[#001C44] flex items-center">Kỳ học {startYear}.1:</div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">GPA Kỳ 1 (thang 4.0)</label>
                                            <input type="number" step="0.01" min="0" max="4" placeholder="VD: 3.2" value={academicData.gpa_sem1 === 0 ? '' : academicData.gpa_sem1} onChange={(e) => setAcademicData({ ...academicData, gpa_sem1: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-[#0C5776]" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">Số tín chỉ tích lũy Kỳ 1</label>
                                            <input type="number" min="0" placeholder="VD: 20" value={academicData.credits_sem1 === 0 ? '' : academicData.credits_sem1} onChange={(e) => setAcademicData({ ...academicData, credits_sem1: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                        <div className="font-semibold text-xs text-[#001C44] flex items-center">Kỳ học {startYear}.2:</div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">GPA Kỳ 2 (thang 4.0)</label>
                                            <input type="number" step="0.01" min="0" max="4" placeholder="VD: 3.5" value={academicData.gpa_sem2 === 0 ? '' : academicData.gpa_sem2} onChange={(e) => setAcademicData({ ...academicData, gpa_sem2: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-[#0C5776]" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">Số tín chỉ tích lũy Kỳ 2</label>
                                            <input type="number" min="0" placeholder="VD: 20" value={academicData.credits_sem2 === 0 ? '' : academicData.credits_sem2} onChange={(e) => setAcademicData({ ...academicData, credits_sem2: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">Điểm rèn luyện Kỳ {startYear}.1</label>
                                            <input type="number" min="0" max="100" placeholder="VD: 90" value={academicData.drl_sem1 === 0 ? '' : academicData.drl_sem1} onChange={(e) => setAcademicData({ ...academicData, drl_sem1: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-700" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">Điểm rèn luyện Kỳ {startYear}.2</label>
                                            <input type="number" min="0" max="100" placeholder="VD: 95" value={academicData.drl_sem2 === 0 ? '' : academicData.drl_sem2} onChange={(e) => setAcademicData({ ...academicData, drl_sem2: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-700" />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-blue-300 flex items-center justify-around text-center">
                                        <div><span className="text-[11px] text-slate-500 block">Tổng tín chỉ</span><strong className="text-base text-slate-800">{calculatedStats.totalCredits} tín chỉ</strong></div>
                                        <div className="border-l pl-4"><span className="text-[11px] text-slate-500 block">GPA cả năm</span><strong className="text-lg text-[#0C5776]">{calculatedStats.averageGpa} / 4.0</strong></div>
                                        <div className="border-l pl-4"><span className="text-[11px] text-slate-500 block">ĐRL trung bình</span><strong className="text-lg text-emerald-700">{calculatedStats.averageDrl} / 100</strong></div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                                    <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">3. Thể lực & Ngoại ngữ</span>
                                    <div>
                                        <label className="block font-semibold mb-1">Giáo dục thể chất</label>
                                        <select value={academicData.physical_education_status} onChange={(e) => setAcademicData({ ...academicData, physical_education_status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs">
                                            <option value="">-- Chưa hoàn thành / Bổ sung sau --</option>
                                            <option value="Hoàn thành chương trình đào tạo Giáo dục thể chất theo quy định tại Đại học Bách khoa Hà Nội (hoàn thành đủ 05 học phần GDTC).">Hoàn thành đủ 05 học phần GDTC</option>
                                            <option value="Không có điểm F nào trong tất cả các học phần Giáo dục thể chất đã học trong 02 học kỳ chính trong năm học.">Không có điểm F học phần GDTC</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Trình độ Ngoại ngữ</label>
                                        <input type="text" placeholder="VD: Miễn học tiếng Anh..." value={academicData.foreign_language_status} onChange={(e) => setAcademicData({ ...academicData, foreign_language_status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                    <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">4. Các thành tích / Khen thưởng khác (nếu có)</span>
                                    <textarea rows={3} placeholder="Ghi các thành tích đóng góp ngoài 5 tiêu chuẩn..." value={academicData.other_achievements} onChange={(e) => setAcademicData({ ...academicData, other_achievements: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
                                <button type="button" onClick={() => setIsAcademicModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 text-xs">Đóng</button>
                                <button type="submit" disabled={savingAcademic} className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-xs shadow-sm flex items-center gap-1.5">
                                    <Save className="w-3.5 h-3.5" /><span>{savingAcademic ? 'Đang lưu...' : 'Lưu thông tin'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal đổi mật khẩu */}
            {isChangePinOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-sm font-bold text-[#001C44]">Đổi mật khẩu bảo mật</h3>
                            <button onClick={() => setIsChangePinOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleChangePin} className="space-y-3 text-xs">
                            <div><label className="block font-semibold mb-1">Mật khẩu hiện tại (6 số) *</label><input type="password" required maxLength={6} value={oldPinInput} onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 border rounded-lg text-center font-bold tracking-widest" /></div>
                            <div><label className="block font-semibold mb-1">Mật khẩu mới (đúng 6 số) *</label><input type="password" required maxLength={6} value={newPinInput} onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 border rounded-lg text-center font-bold tracking-widest" /></div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsChangePinOpen(false)} className="px-3 py-1.5 border rounded-lg">Hủy</button>
                                <button type="submit" className="px-4 py-1.5 bg-[#0C5776] text-white font-semibold rounded-lg hover:bg-[#001C44]">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal ghi nhận hoạt động */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
                            <div>
                                <h3 className="text-base font-bold text-[#001C44]">Ghi nhận hoạt động hệ thống</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Lưu vào hồ sơ MSSV: <strong>{currentMssv}</strong></p>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleAddActivity} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
                            <div className="space-y-3">
                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Chọn hoạt động bạn đã tham gia *</label>
                                    <div className="relative">
                                        <input type="text" placeholder="Gõ tên hoạt động để tìm kiếm nhanh..." value={actSearchTerm} onChange={(e) => { setActSearchTerm(e.target.value); setIsActDropdownOpen(true); setSelectedSystemActId(''); }} onFocus={() => setIsActDropdownOpen(true)} className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-white text-xs" />
                                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        {isActDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsActDropdownOpen(false)}></div>}
                                        {isActDropdownOpen && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                {Object.keys(CRITERIA_MAP).map((standardKey) => {
                                                    const actsInStandard = systemActivities.filter((a) => a.supported_standard === standardKey && a.title.toLowerCase().includes(actSearchTerm.toLowerCase()));
                                                    if (actsInStandard.length === 0) return null;
                                                    return (
                                                        <div key={standardKey}>
                                                            <div className="px-3 py-2 bg-slate-100 border-y border-slate-200 font-bold text-[#0C5776] text-[11px] sticky top-0 z-10">▬▬ {CRITERIA_MAP[standardKey].toUpperCase()} ▬▬</div>
                                                            {actsInStandard.map((act) => (
                                                                <div key={act.id} onClick={() => { setSelectedSystemActId(String(act.id)); setActSearchTerm(act.title); setIsActDropdownOpen(false); }} className={`px-3 py-2 cursor-pointer text-xs transition-colors ${selectedSystemActId === String(act.id) ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}>{act.title}</div>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                                {systemActivities.filter(a => a.title.toLowerCase().includes(actSearchTerm.toLowerCase())).length === 0 && <div className="px-3 py-6 text-center text-xs text-slate-500 relative z-10 bg-white">Không tìm thấy hoạt động nào mang tên "{actSearchTerm}"</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {(() => {
                                    const act = systemActivities.find((a) => String(a.id) === selectedSystemActId);
                                    if (!act || !act.completion_condition) return null;
                                    return (
                                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-amber-800">Yêu cầu hoàn thành:</span> <span className="font-medium text-slate-700">{act.completion_condition}</span>
                                                <p className="text-[11px] text-amber-700/80 mt-0.5">Hãy đính kèm ảnh chụp điểm số / chứng nhận đạt điều kiện ở ô bên dưới.</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Link ảnh / minh chứng kết quả (nếu có)</label>
                                    <input type="url" placeholder="https://drive.google.com/... (ảnh chụp điểm số, giấy chứng nhận)" value={systemProofUrl} onChange={(e) => setSystemProofUrl(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-white" />
                                    <p className="text-[11px] text-slate-400 mt-1">* Dùng để lưu trữ minh chứng khi xuất đơn Báo cáo thành tích cuối năm.</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors text-xs">Hủy bỏ</button>
                                <button type="submit" disabled={isAddingAct} className="px-5 py-2 bg-[#0C5776] text-white font-semibold rounded-lg hover:bg-[#001C44] transition-colors text-xs shadow-sm disabled:opacity-50">{isAddingAct ? 'Đang xử lý...' : 'Lưu vào hồ sơ'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <footer className="mt-20 border-t border-slate-200 py-8 text-center text-xs text-slate-500 space-y-1 bg-white">
                <p className="text-slate-400">Đại học Bách khoa Hà Nội • Bản quyền © 2026</p>
                <p className="text-[#0C5776] pt-1">Xây dựng và phát triển bởi <span className="font-semibold text-[#001C44]">Phạm Thị Vân Anh</span></p>
            </footer>
        </main>
    );
}