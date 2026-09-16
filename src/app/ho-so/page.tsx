'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
    ArrowLeft, PlusCircle, Trash2, Calendar, Award,
    ExternalLink, User, Sparkles, X, LogOut, ArrowRight,
    CheckCircle2, Clock, AlertCircle, Lock, KeyRound, FileSpreadsheet, Save, Calculator, Info,
    Send, Pencil, MapPin, Building2, Check
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
    completion_condition?: string | null;
    participation_date: string;
    proof_url?: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface MyProposal {
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
    note?: string | null;
    status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
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

const PROPOSAL_STATUS: Record<string, { label: string; badgeClass: string }> = {
    PENDING: { label: '🟡 Mới tiếp nhận', badgeClass: 'bg-amber-50 text-amber-700 border-amber-300' },
    SUBMITTED: { label: '🔵 Đã gửi đề xuất', badgeClass: 'bg-blue-50 text-blue-700 border-blue-300' },
    APPROVED: { label: '🟢 Đã công nhận', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    REJECTED: { label: '🔴 Từ chối', badgeClass: 'bg-rose-50 text-rose-700 border-rose-300' },
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

// Hàm tự động tính năm học hiện tại theo mốc 15/09
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

const formatDatetimeLocal = (isoStr?: string | null) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function StudentPortfolioPage() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
    const [academicYear, setAcademicYear] = useState<string>(getCurrentAcademicYear);
    const startYear = academicYear.split('-')[0];

    // Tab hiển thị: Hoạt động tích lũy (RECORDS) hoặc Đề xuất của tôi (PROPOSALS)
    const [activeTab, setActiveTab] = useState<'RECORDS' | 'PROPOSALS'>('RECORDS');

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

    // Modal thông tin học vụ
    const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
    const [savingAcademic, setSavingAcademic] = useState(false);
    const [academicData, setAcademicData] = useState<AcademicInfo>({
        student_id: '',
        full_name: '',
        gender: 'Nam',
        birth_year: '',
        ethnicity: 'Kinh',
        class_name: '',
        student_year: '1',
        position: '',
        union_status: 'Đoàn viên',
        phone: '',
        email_sis: '',
        faculty_name: 'Trường Công nghệ Thông tin và Truyền thông',
        drl_sem1: 0,
        drl_sem2: 0,
        gpa_sem1: 0,
        credits_sem1: 0,
        gpa_sem2: 0,
        credits_sem2: 0,
        physical_education_status: 'Hoàn thành đủ 05 học phần GDTC',
        foreign_language_status: '',
        other_achievements: ''
    });

    // Hoạt động cá nhân
    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [systemActivities, setSystemActivities] = useState<OfficialActivity[]>([]);

    // Đề xuất của sinh viên
    const [myProposals, setMyProposals] = useState<MyProposal[]>([]);
    const [loadingProposals, setLoadingProposals] = useState(false);

    // Modal sửa đề xuất
    const [isEditProposalOpen, setIsEditProposalOpen] = useState(false);
    const [editingProposal, setEditingProposal] = useState<MyProposal | null>(null);
    const [updatingProposal, setUpdatingProposal] = useState(false);

    // Modal thêm hoạt động vào hồ sơ
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addMode, setAddMode] = useState<'SYSTEM' | 'CUSTOM'>('SYSTEM');
    const [selectedSystemActId, setSelectedSystemActId] = useState<string>('');
    const [systemProofUrl, setSystemProofUrl] = useState<string>('');

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
        checkAutoLogin();
    }, []);

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
                        fetchRecords(mssv);
                        fetchAcademicInfo(mssv);
                        fetchMyProposals(mssv);
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
        if (data) setSystemActivities(data);
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

    const fetchMyProposals = async (mssv: string) => {
        setLoadingProposals(true);
        const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .eq('student_id', mssv.trim())
            .order('created_at', { ascending: false });

        if (!error && data) {
            setMyProposals(data as MyProposal[]);
        }
        setLoadingProposals(false);
    };

    const fetchAcademicInfo = async (mssv: string, year: string = academicYear) => {
        const { data } = await supabase
            .from('student_academic_info')
            .select('*')
            .eq('student_id', mssv.trim())
            .eq('academic_year', year)
            .maybeSingle();

        if (data) {
            setAcademicData(data);
        } else {
            setAcademicData((prev) => ({
                ...prev,
                student_id: mssv,
                email_sis: '',
                drl_sem1: '',
                drl_sem2: '',
                gpa_sem1: '',
                credits_sem1: '',
                gpa_sem2: '',
                credits_sem2: '',
                other_achievements: ''
            }));
        }
    };

    useEffect(() => {
        if (isLoggedIn && currentMssv) {
            fetchRecords(currentMssv, academicYear);
            fetchAcademicInfo(currentMssv, academicYear);
            fetchMyProposals(currentMssv);
        }
    }, [academicYear]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanMssv = mssvInput.trim();
        const cleanPin = pinInput.trim();
        setAuthError('');

        if (!cleanMssv) {
            setAuthError('Vui lòng nhập MSSV!');
            return;
        }
        if (!/^\d{6}$/.test(cleanPin)) {
            setAuthError('Mật khẩu phải bao gồm đúng 6 chữ số!');
            return;
        }

        setSubmittingAuth(true);

        const { data, error } = await supabase
            .from('student_profiles')
            .select('pin_code')
            .eq('student_id', cleanMssv)
            .maybeSingle();

        setSubmittingAuth(false);

        if (error) {
            setAuthError('Lỗi kết nối cơ sở dữ liệu: ' + error.message);
            return;
        }

        if (!data) {
            const confirmCreate = confirm(
                `MSSV "${cleanMssv}" chưa kích hoạt hồ sơ trên hệ thống.\n\nBạn có muốn khởi tạo hồ sơ mới với mật khẩu: ${cleanPin} không?`
            );
            if (!confirmCreate) return;

            const { error: insertErr } = await supabase
                .from('student_profiles')
                .insert([{ student_id: cleanMssv, pin_code: cleanPin }]);

            if (insertErr) {
                setAuthError('Không thể tạo hồ sơ: ' + insertErr.message);
                return;
            }

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
        fetchRecords(mssv);
        fetchAcademicInfo(mssv);
        fetchMyProposals(mssv);
    };

    const handleLogout = () => {
        localStorage.removeItem('sv5t_student_session');
        setIsLoggedIn(false);
        setCurrentMssv('');
        setMssvInput('');
        setPinInput('');
        setSavedPin('');
        setRecords([]);
        setMyProposals([]);
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
    }, [
        academicData.gpa_sem1,
        academicData.credits_sem1,
        academicData.gpa_sem2,
        academicData.credits_sem2,
        academicData.drl_sem1,
        academicData.drl_sem2,
    ]);

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

        const { error } = await supabase
            .from('student_academic_info')
            .upsert(payload);

        setSavingAcademic(false);

        if (error) {
            alert('Lỗi lưu thông tin học vụ: ' + error.message);
        } else {
            alert('Lưu thông tin học vụ thành công! Dữ liệu đã sẵn sàng để tự động xuất đơn Báo cáo thành tích.');
            setIsAcademicModalOpen(false);
        }
    };

    const handleChangePin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (oldPinInput !== savedPin) {
            alert('Mật khẩu hiện tại không đúng!');
            return;
        }
        if (!/^\d{6}$/.test(newPinInput)) {
            alert('Mật khẩu mới phải bao gồm đúng 6 chữ số!');
            return;
        }

        const { error } = await supabase
            .from('student_profiles')
            .update({ pin_code: newPinInput })
            .eq('student_id', currentMssv);

        if (error) {
            alert('Không thể đổi mật khẩu: ' + error.message);
            return;
        }

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
        } else {
            if (!customForm.activity_title || !customForm.criteria_detail) {
                alert('Vui lòng nhập tên hoạt động và tiêu chí cụ thể!');
                return;
            }
            newRecordPayload = {
                student_id: currentMssv,
                academic_year: academicYear,
                activity_id: null,
                activity_title: customForm.activity_title,
                organizer: customForm.organizer || 'Ban tổ chức',
                target_standard: customForm.target_standard,
                criteria_detail: customForm.criteria_detail,
                completion_condition: null,
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
            setSystemProofUrl('');
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

    const handleDeleteRecord = async (id: number, title: string) => {
        if (!confirm(`Xác nhận xóa hoạt động:\n"${title}"\nkhỏi hồ sơ tích lũy?`)) return;

        const { error } = await supabase.from('student_activities').delete().eq('id', id);
        if (!error) {
            setRecords(records.filter((r) => r.id !== id));
        } else {
            alert('Lỗi khi xóa: ' + error.message);
        }
    };

    // Mở modal sửa đề xuất
    const handleOpenEditProposal = (prop: MyProposal) => {
        if (prop.status === 'APPROVED') {
            alert('Hoạt động này đã được Quản trị viên công nhận nên không thể chỉnh sửa.');
            return;
        }
        setEditingProposal({ ...prop });
        setIsEditProposalOpen(true);
    };

    // Lưu chỉnh sửa đề xuất lên bảng proposals
    const handleUpdateProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProposal) return;
        if (editingProposal.status === 'APPROVED') return;

        setUpdatingProposal(true);

        const payload = {
            activity_title: editingProposal.activity_title.trim(),
            organizer: editingProposal.organizer.trim(),
            target_audience: editingProposal.target_audience.trim(),
            project_url: editingProposal.project_url.trim(),
            start_date: editingProposal.start_date,
            end_date: editingProposal.end_date || editingProposal.start_date,
            registration_deadline: editingProposal.registration_deadline
                ? new Date(editingProposal.registration_deadline).toISOString()
                : null,
            completion_condition: editingProposal.completion_condition?.trim() || null,
            location: editingProposal.location.trim(),
            target_standard: editingProposal.target_standard,
            target_sub_criterion: editingProposal.target_sub_criterion,
            target_levels: editingProposal.target_levels,
            proof_method: editingProposal.proof_method.trim(),
            note: editingProposal.note?.trim() || null,
        };

        const { error } = await supabase
            .from('proposals')
            .update(payload)
            .eq('id', editingProposal.id);

        setUpdatingProposal(false);

        if (error) {
            alert('Lỗi cập nhật đề xuất: ' + error.message);
        } else {
            alert('Đã lưu thay đổi đề xuất thành công!');
            setIsEditProposalOpen(false);
            fetchMyProposals(currentMssv);
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
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-1.5 text-xs text-[#BCFEFE] hover:underline mb-1.5"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Về Trang chủ
                                </Link>
                                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-[#BCFEFE]" />
                                    Hồ sơ cá nhân Sinh viên 5 tốt
                                </h1>
                                <p className="text-xs text-[#BCFEFE]/80 mt-0.5">
                                    Theo dõi tiến độ, số lượng tiêu chí đạt chuẩn và lưu trữ minh chứng rèn luyện.
                                </p>
                            </div>

                            {isLoggedIn && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => setIsAcademicModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                                        <span>Khai báo Báo cáo thành tích</span>
                                    </button>

                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BCFEFE] text-[#001C44] text-xs font-semibold hover:bg-white transition-all shadow-sm"
                                    >
                                        <PlusCircle className="w-4 h-4 text-[#0C5776]" />
                                        Thêm hoạt động
                                    </button>

                                    <button
                                        onClick={() => setIsChangePinOpen(true)}
                                        title="Đổi mật khẩu bảo mật"
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                                    >
                                        <KeyRound className="w-3.5 h-3.5 text-[#BCFEFE]" />
                                        <span>Đổi mật khẩu</span>
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

                {/* Màn hình đăng nhập */}
                {!isLoggedIn && (
                    <div className="max-w-md mx-auto px-4 py-10 animate-in fade-in zoom-in duration-150">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                            <div className="text-center space-y-1">
                                <div className="w-12 h-12 bg-[#0C5776]/10 text-[#0C5776] rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg font-bold text-[#001C44]">Hồ sơ Sinh viên 5 tốt</h2>
                                <p className="text-xs text-slate-500">
                                    Quản lý hoạt động rèn luyện và lập báo cáo thành tích
                                </p>
                            </div>

                            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 text-xs text-slate-700 flex items-start gap-2.5">
                                <Info className="w-4 h-4 text-[#0C5776] shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    Mật khẩu gồm 6 chữ số. Sinh viên truy cập lần đầu sẽ tự thiết lập mật khẩu trực tiếp tại đây.
                                </div>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        MSSV *
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            placeholder="Nhập MSSV..."
                                            value={mssvInput}
                                            onChange={(e) => setMssvInput(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Mật khẩu *
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            required
                                            maxLength={6}
                                            placeholder="Nhập 6 số..."
                                            value={pinInput}
                                            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-9 pr-3 py-2 text-xs font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-0.5 text-xs">
                                    <label className="inline-flex items-center gap-2 cursor-pointer text-slate-600 select-none text-[11px]">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="rounded border-slate-300 text-[#0C5776] focus:ring-0 w-3.5 h-3.5"
                                        />
                                        <span>Ghi nhớ đăng nhập</span>
                                    </label>
                                </div>

                                {authError && (
                                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium leading-relaxed">
                                        {authError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submittingAuth}
                                    className="w-full py-2.5 bg-[#0C5776] hover:bg-[#001C44] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                                >
                                    <span>{submittingAuth ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Màn hình hồ sơ tích lũy */}
                {isLoggedIn && (
                    <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6 animate-in fade-in duration-150">
                        {/* Thẻ tóm tắt thông tin sinh viên */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500">Năm học xét duyệt:</span>
                                    <select
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        className="text-xs font-bold text-[#0C5776] bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#0C5776] cursor-pointer"
                                    >
                                        <option value="2024-2025">Năm học 2024 – 2025</option>
                                        <option value="2025-2026">Năm học 2025 – 2026</option>
                                        <option value="2026-2027">Năm học 2026 – 2027</option>
                                        <option value="2027-2028">Năm học 2027 – 2028</option>
                                    </select>
                                </div>

                                <div className="text-xl font-bold text-[#001C44] flex flex-wrap items-center gap-2">
                                    <span>{academicData.full_name || 'Chưa cập nhật họ tên'}</span>
                                    <span className="text-sm font-semibold text-slate-500">({currentMssv})</span>
                                    {academicData.class_name && (
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                            {academicData.class_name}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                                    <span>Trường/Khoa: <strong>{academicData.faculty_name}</strong></span>
                                    <span>•</span>
                                    <span>GPA trung bình: <strong className="text-[#0C5776]">{formatGPA(calculatedStats.averageGpa)}/4.0</strong></span>
                                    <span>•</span>
                                    <span>ĐRL trung bình: <strong className="text-emerald-700">{calculatedStats.averageDrl || '0'}</strong></span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-xs text-slate-500">Tiêu chí được công nhận:</span>
                                <div className="text-lg font-bold text-[#0C5776]">{totalApproved} tiêu chí</div>
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

                        {/* THANH 2 TAB: HOẠT ĐỘNG TÍCH LŨY vs ĐỀ XUẤT CỦA TÔI */}
                        <div className="flex border-b border-slate-200 gap-4 pt-2">
                            <button
                                onClick={() => setActiveTab('RECORDS')}
                                className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'RECORDS'
                                        ? 'border-[#0C5776] text-[#001C44]'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                <Award className="w-4 h-4 text-[#0C5776]" />
                                Hoạt động tích lũy tiêu chí
                                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-[#0C5776] font-bold">
                                    {records.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('PROPOSALS')}
                                className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'PROPOSALS'
                                        ? 'border-[#0C5776] text-[#001C44]'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                <Send className="w-4 h-4 text-[#0C5776]" />
                                Đề xuất hoạt động của tôi
                                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">
                                    {myProposals.length}
                                </span>
                            </button>
                        </div>

                        {/* ================= TAB 1: HOẠT ĐỘNG TÍCH LŨY TIÊU CHÍ ================= */}
                        {activeTab === 'RECORDS' && (
                            <div className="space-y-3">
                                {loadingRecords ? (
                                    <div className="py-12 text-center text-xs text-slate-500">Đang tải hồ sơ tích lũy...</div>
                                ) : records.length === 0 ? (
                                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs space-y-3">
                                        <p>Hồ sơ MSSV <strong>{currentMssv}</strong> chưa có hoạt động nào trong năm học {academicYear}.</p>
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
                                                                Không công nhận
                                                            </span>
                                                        ) : isPending ? (
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Chờ xét duyệt
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

                                                    {r.completion_condition && (
                                                        <p className="text-xs text-amber-800 bg-amber-50/80 border border-amber-200 px-2 py-1 rounded-md inline-block">
                                                            <strong>Yêu cầu hoàn thành:</strong> {r.completion_condition}
                                                        </p>
                                                    )}

                                                    {r.organizer && (
                                                        <p className="text-xs text-slate-500">Đơn vị tổ chức: {r.organizer}</p>
                                                    )}

                                                    {isRejected && (
                                                        <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                                                            * Hoạt động này không được thông qua tiêu chí SV5T. Bạn có thể xóa khỏi hồ sơ bằng nút thùng rác bên cạnh.
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
                        )}

                        {/* ================= TAB 2: ĐỀ XUẤT CỦA TÔI ================= */}
                        {activeTab === 'PROPOSALS' && (
                            <div className="space-y-3">
                                {loadingProposals ? (
                                    <div className="py-12 text-center text-xs text-slate-500">Đang tải danh sách đề xuất của bạn...</div>
                                ) : myProposals.length === 0 ? (
                                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs space-y-3">
                                        <p>Bạn chưa gửi đề xuất hoạt động nào lên hệ thống.</p>
                                        <Link
                                            href="/de-xuat"
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0C5776] text-white text-xs font-semibold hover:bg-[#001C44] transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                            Tạo đề xuất hoạt động mới
                                        </Link>
                                    </div>
                                ) : (
                                    myProposals.map((prop) => {
                                        const statusInfo = PROPOSAL_STATUS[prop.status] || {
                                            label: prop.status,
                                            badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
                                        };
                                        const isApproved = prop.status === 'APPROVED';

                                        return (
                                            <div
                                                key={prop.id}
                                                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#0C5776] text-white">
                                                            {CRITERIA_MAP[prop.target_standard] || prop.target_standard}
                                                        </span>
                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${statusInfo.badgeClass}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        {isApproved ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                                                <Lock className="w-3 h-3 text-emerald-600" />
                                                                Đã duyệt (Khóa chỉnh sửa)
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleOpenEditProposal(prop)}
                                                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#BCFEFE] text-[#001C44] border border-slate-200 transition-colors"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 text-[#0C5776]" />
                                                                <span>Sửa đề xuất</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-bold text-[#001C44]">{prop.activity_title}</h4>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                        <strong>Tiêu chí:</strong> {prop.target_sub_criterion}
                                                    </p>
                                                    {prop.completion_condition && (
                                                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md inline-block mt-1">
                                                            <strong>Điều kiện ghi nhận:</strong> {prop.completion_condition}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-[#2D99AE]" />
                                                        <span>Đơn vị: <strong>{prop.organizer}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-[#2D99AE]" />
                                                        <span>Thời gian: {prop.start_date} → {prop.end_date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-[#2D99AE]" />
                                                        <span>Địa điểm: {prop.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Award className="w-3.5 h-3.5 text-[#2D99AE]" />
                                                        <span>Minh chứng: {prop.proof_method}</span>
                                                    </div>
                                                </div>

                                                {prop.project_url && (
                                                    <div>
                                                        <a
                                                            href={prop.project_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs text-[#0C5776] hover:underline inline-flex items-center gap-1 font-medium"
                                                        >
                                                            Xem bài viết đề án <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL CHỈNH SỬA ĐỀ XUẤT (Chỉ mở khi chưa APPROVED) */}
            {isEditProposalOpen && editingProposal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
                            <div>
                                <h3 className="text-base font-bold text-[#001C44]">Chỉnh sửa đề xuất hoạt động</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Cập nhật thông tin trước khi Ban tổ chức tiến hành xét duyệt.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditProposalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProposal} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 max-h-[calc(90vh-130px)]">
                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Tên hoạt động *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingProposal.activity_title}
                                        onChange={(e) => setEditingProposal({ ...editingProposal, activity_title: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Đơn vị tổ chức *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editingProposal.organizer}
                                            onChange={(e) => setEditingProposal({ ...editingProposal, organizer: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Đối tượng tham gia *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editingProposal.target_audience}
                                            onChange={(e) => setEditingProposal({ ...editingProposal, target_audience: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Ngày bắt đầu *</label>
                                        <input
                                            type="date"
                                            required
                                            value={editingProposal.start_date?.split('T')[0] || ''}
                                            onChange={(e) => setEditingProposal({ ...editingProposal, start_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Ngày kết thúc *</label>
                                        <input
                                            type="date"
                                            required
                                            value={editingProposal.end_date?.split('T')[0] || ''}
                                            onChange={(e) => setEditingProposal({ ...editingProposal, end_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Hạn chót đăng ký (ngày & giờ, nếu có)</label>
                                    <input
                                        type="datetime-local"
                                        value={formatDatetimeLocal(editingProposal.registration_deadline)}
                                        onChange={(e) => setEditingProposal({ ...editingProposal, registration_deadline: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] text-xs bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Địa điểm tổ chức *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Trực tiếp hoặc ghi rõ 'Trực tuyến'"
                                        value={editingProposal.location}
                                        onChange={(e) => setEditingProposal({ ...editingProposal, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Link bài viết / đề án chi tiết *</label>
                                    <input
                                        type="url"
                                        required
                                        value={editingProposal.project_url}
                                        onChange={(e) => setEditingProposal({ ...editingProposal, project_url: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Tiêu chuẩn SV5T *</label>
                                    <select
                                        value={editingProposal.target_standard}
                                        onChange={(e) => {
                                            const newStd = e.target.value;
                                            const firstItem = CRITERIA_TREE[newStd]?.items[0]?.full || '';
                                            setEditingProposal({
                                                ...editingProposal,
                                                target_standard: newStd,
                                                target_sub_criterion: firstItem,
                                            });
                                        }}
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
                                        value={editingProposal.target_sub_criterion}
                                        onChange={(e) => setEditingProposal({ ...editingProposal, target_sub_criterion: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776]"
                                        required
                                    >
                                        {CRITERIA_TREE[editingProposal.target_standard]?.items.map((item, idx) => (
                                            <option key={idx} value={item.full}>
                                                {item.display}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Điều kiện hoàn thành / ghi nhận (nếu có)</label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: Đạt từ 38/40 điểm trở lên; Chạy tối thiểu 5km..."
                                        value={editingProposal.completion_condition || ''}
                                        onChange={(e) => setEditingProposal({ ...editingProposal, completion_condition: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Cách thức minh chứng *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingProposal.proof_method}
                                        onChange={(e) => setEditingProposal({ ...editingProposal, proof_method: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1 text-[#001C44]">Ghi chú thêm</label>
                                    <textarea
                                        rows={2}
                                        value={editingProposal.note || ''}
                                        onChange={(e) => setEditingProposal({ ...editingProposal, note: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setIsEditProposalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 text-xs"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingProposal}
                                    className="px-5 py-2 bg-[#0C5776] text-white font-semibold rounded-lg hover:bg-[#001C44] transition-colors disabled:opacity-50 text-xs shadow-sm flex items-center gap-1.5"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{updatingProposal ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal thông tin học vụ & Báo cáo SV5T */}
            {isAcademicModalOpen && (
                <div
                    onClick={() => setIsAcademicModalOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
                            <div>
                                <h3 className="text-base font-bold text-[#001C44] flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                    Báo cáo thành tích cá nhân
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cung cấp dữ liệu cá nhân và học vụ phục vụ lập hồ sơ Sinh viên 5 tốt.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAcademicModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAcademicInfo} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 max-h-[calc(92vh-130px)]">
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                                    <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">
                                        1. Thông tin cá nhân
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2">
                                            <label className="block font-semibold mb-1">Họ và tên *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="VD: Nguyễn Văn A"
                                                value={academicData.full_name}
                                                onChange={(e) => setAcademicData({ ...academicData, full_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Giới tính *</label>
                                            <select
                                                value={academicData.gender}
                                                onChange={(e) => setAcademicData({ ...academicData, gender: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block font-semibold mb-1">Năm sinh *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="VD: 2005"
                                                value={academicData.birth_year}
                                                onChange={(e) => setAcademicData({ ...academicData, birth_year: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Dân tộc *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="VD: Kinh"
                                                value={academicData.ethnicity}
                                                onChange={(e) => setAcademicData({ ...academicData, ethnicity: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Năm học thứ *</label>
                                            <select
                                                required
                                                value={academicData.student_year}
                                                onChange={(e) => setAcademicData({ ...academicData, student_year: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            >
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Đoàn viên/ Đảng viên *</label>
                                            <select
                                                required
                                                value={academicData.union_status}
                                                onChange={(e) => setAcademicData({ ...academicData, union_status: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            >
                                                <option value="Đảng viên">Đảng viên</option>
                                                <option value="Đoàn viên">Đoàn viên</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold mb-1">Lớp *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="VD: CTTT Phân tích KD 02 – K68"
                                                value={academicData.class_name}
                                                onChange={(e) => setAcademicData({ ...academicData, class_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">Trường/ Khoa *</label>
                                            <select
                                                required
                                                value={academicData.faculty_name}
                                                onChange={(e) => setAcademicData({ ...academicData, faculty_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-[#0C5776] focus:outline-none focus:border-[#0C5776]"
                                            >
                                                {FACULTIES.map((fac) => (
                                                    <option key={fac} value={fac}>{fac}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        <div className="sm:col-span-4">
                                            <label className="block font-semibold mb-1">Chức vụ Đoàn - Hội *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder='VD: Chi hội trưởng (hoặc ghi "Không")'
                                                value={academicData.position}
                                                onChange={(e) => setAcademicData({ ...academicData, position: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label className="block font-semibold mb-1">Số điện thoại *</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="VD: 0912345678"
                                                value={academicData.phone}
                                                onChange={(e) => setAcademicData({ ...academicData, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                        <div className="sm:col-span-5">
                                            <label className="block font-semibold mb-1">Email SIS *</label>
                                            <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white focus-within:border-[#0C5776]">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="anh.ptv233017"
                                                    value={academicData.email_sis.replace(/@sis\.hust\.edu\.vn$/i, '')}
                                                    onChange={(e) => {
                                                        const prefix = e.target.value.trim().replace(/@sis\.hust\.edu\.vn$/i, '');
                                                        setAcademicData({
                                                            ...academicData,
                                                            email_sis: prefix ? `${prefix}@sis.hust.edu.vn` : ''
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 text-xs border-0 focus:outline-none bg-transparent"
                                                />
                                                <span className="bg-slate-100 px-2.5 py-2 text-[11px] text-slate-500 font-mono select-none border-l border-slate-200 shrink-0">
                                                    @sis.hust.edu.vn
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                            <Calculator className="w-4 h-4 text-[#0C5776]" />
                                            2. Kết quả Học tập & Rèn luyện
                                        </span>
                                        <span className="text-[11px] text-blue-700 font-semibold">
                                            Tự động tính theo trọng số tín chỉ
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                        <div className="font-semibold text-xs text-[#001C44] flex items-center">
                                            Kỳ học {startYear}.1:
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">GPA Kỳ 1 (thang 4.0)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="4"
                                                placeholder="VD: 3.2"
                                                value={academicData.gpa_sem1 === 0 ? '' : academicData.gpa_sem1}
                                                onChange={(e) => setAcademicData({ ...academicData, gpa_sem1: e.target.value })}
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-[#0C5776]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">Số tín chỉ tích lũy Kỳ 1</label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="VD: 20"
                                                value={academicData.credits_sem1 === 0 ? '' : academicData.credits_sem1}
                                                onChange={(e) => setAcademicData({ ...academicData, credits_sem1: e.target.value })}
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                        <div className="font-semibold text-xs text-[#001C44] flex items-center">
                                            Kỳ học {startYear}.2:
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">GPA Kỳ 2 (thang 4.0)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="4"
                                                placeholder="VD: 3.5"
                                                value={academicData.gpa_sem2 === 0 ? '' : academicData.gpa_sem2}
                                                onChange={(e) => setAcademicData({ ...academicData, gpa_sem2: e.target.value })}
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-[#0C5776]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">Số tín chỉ tích lũy Kỳ 2</label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="VD: 20"
                                                value={academicData.credits_sem2 === 0 ? '' : academicData.credits_sem2}
                                                onChange={(e) => setAcademicData({ ...academicData, credits_sem2: e.target.value })}
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">Điểm rèn luyện Kỳ {startYear}.1</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="VD: 90"
                                                value={academicData.drl_sem1 === 0 ? '' : academicData.drl_sem1}
                                                onChange={(e) => setAcademicData({ ...academicData, drl_sem1: e.target.value })}
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 mb-0.5">Điểm rèn luyện Kỳ {startYear}.2</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="VD: 95"
                                                value={academicData.drl_sem2 === 0 ? '' : academicData.drl_sem2}
                                                onChange={(e) => setAcademicData({ ...academicData, drl_sem2: e.target.value })}
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white rounded-lg border border-blue-300 flex items-center justify-around text-center">
                                        <div>
                                            <span className="text-[11px] text-slate-500 block">Tổng tín chỉ cả năm</span>
                                            <strong className="text-base text-slate-800">{calculatedStats.totalCredits} tín chỉ</strong>
                                        </div>
                                        <div className="border-l pl-4">
                                            <span className="text-[11px] text-slate-500 block">GPA cả năm (Trọng số)</span>
                                            <strong className="text-lg text-[#0C5776]">{calculatedStats.averageGpa} / 4.0</strong>
                                        </div>
                                        <div className="border-l pl-4">
                                            <span className="text-[11px] text-slate-500 block">ĐRL trung bình</span>
                                            <strong className="text-lg text-emerald-700">{calculatedStats.averageDrl} / 100</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                                    <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">
                                        3. Thể lực & Ngoại ngữ
                                    </span>
                                    <div>
                                        <label className="block font-semibold mb-1">Giáo dục thể chất</label>
                                        <select
                                            value={academicData.physical_education_status}
                                            onChange={(e) => setAcademicData({ ...academicData, physical_education_status: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                                        >
                                            <option value="">-- Chưa hoàn thành / Bổ sung sau --</option>
                                            <option value="Hoàn thành chương trình đào tạo Giáo dục thể chất theo quy định tại Đại học Bách khoa Hà Nội (hoàn thành đủ 05 học phần GDTC).">
                                                Hoàn thành đủ 05 học phần GDTC
                                            </option>
                                            <option value="Không có điểm F nào trong tất cả các học phần Giáo dục thể chất đã học trong 02 học kỳ chính trong năm học.">
                                                Không có điểm F học phần GDTC trong 02 học kỳ chính
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Trình độ Ngoại ngữ</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Miễn học tiếng Anh / TOEIC nội bộ: 745 ngày 15/04/2025..."
                                            value={academicData.foreign_language_status}
                                            onChange={(e) => setAcademicData({ ...academicData, foreign_language_status: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                    <span className="font-bold text-[#001C44] uppercase tracking-wider text-[11px] block">
                                        4. Các thành tích / Khen thưởng khác (nếu có)
                                    </span>
                                    <textarea
                                        rows={3}
                                        placeholder="Ghi các thành tích đóng góp ngoài 5 tiêu chuẩn..."
                                        value={academicData.other_achievements}
                                        onChange={(e) => setAcademicData({ ...academicData, other_achievements: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setIsAcademicModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-100 text-xs"
                                >
                                    Đóng
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingAcademic}
                                    className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-xs shadow-sm flex items-center gap-1.5"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{savingAcademic ? 'Đang lưu...' : 'Lưu thông tin'}</span>
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
                            <button onClick={() => setIsChangePinOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePin} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Mật khẩu hiện tại (6 số) *</label>
                                <input
                                    type="password"
                                    required
                                    maxLength={6}
                                    value={oldPinInput}
                                    onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-3 py-2 border rounded-lg text-center font-bold tracking-widest"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Mật khẩu mới (đúng 6 số) *</label>
                                <input
                                    type="password"
                                    required
                                    maxLength={6}
                                    value={newPinInput}
                                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
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

            {/* Modal ghi nhận hoạt động */}
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
                                <div className="space-y-3">
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
                                    </div>

                                    {(() => {
                                        const act = systemActivities.find((a) => String(a.id) === selectedSystemActId);
                                        if (!act || !act.completion_condition) return null;
                                        return (
                                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                                                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold text-amber-800">Yêu cầu hoàn thành:</span>{' '}
                                                    <span className="font-medium text-slate-700">{act.completion_condition}</span>
                                                    <p className="text-[11px] text-amber-700/80 mt-0.5">
                                                        Hãy đính kèm ảnh chụp điểm số / giấy chứng nhận đạt điều kiện ở ô bên dưới.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div>
                                        <label className="block font-semibold mb-1 text-[#001C44]">Link ảnh / minh chứng kết quả (nếu có)</label>
                                        <input
                                            type="url"
                                            placeholder="https://drive.google.com/... (ảnh chụp điểm số, giấy chứng nhận)"
                                            value={systemProofUrl}
                                            onChange={(e) => setSystemProofUrl(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-white"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            * Dùng để lưu trữ minh chứng khi xuất đơn Báo cáo thành tích cuối năm.
                                        </p>
                                    </div>
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