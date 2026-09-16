'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Send, CheckCircle2, AlertCircle, RotateCcw, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { CRITERIA_TREE } from '@/data/criteria';

const DRAFT_STORAGE_KEY = 'sv5t_proposal_form_draft';

const INITIAL_FORM = {
    student_name: '',
    student_id: '',
    activity_title: '',
    organizer: '',
    target_audience: '',
    project_url: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    completion_condition: '',
    location: '',
    standard: 'DAO_DUC',
    sub_criterion: CRITERIA_TREE['DAO_DUC']?.items[0]?.full || '',
    levels: ['DAI_HOC'] as string[],
    proof_method: '',
    note: '',
};

export default function ProposalPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);
    const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);

    const [formData, setFormData] = useState(INITIAL_FORM);

    // 1. Tự động kiểm tra phiên đăng nhập hồ sơ cá nhân và phục hồi bản nháp
    useEffect(() => {
        const loadSessionAndDraft = async () => {
            let sessionMssv = '';
            let sessionName = '';
            let loggedIn = false;

            // Kiểm tra session đăng nhập từ /ho-so
            try {
                const savedSession = localStorage.getItem('sv5t_student_session');
                if (savedSession) {
                    const { mssv } = JSON.parse(savedSession);
                    if (mssv) {
                        sessionMssv = mssv;
                        loggedIn = true;

                        // Truy vấn họ và tên từ thông tin học vụ của sinh viên
                        const { data } = await supabase
                            .from('student_academic_info')
                            .select('full_name')
                            .eq('student_id', mssv)
                            .maybeSingle();

                        if (data && data.full_name) {
                            sessionName = data.full_name;
                        }
                    }
                }
            } catch (e) {
                console.error('Lỗi khi đọc session sinh viên:', e);
            }

            setIsStudentLoggedIn(loggedIn);

            // Nạp dữ liệu bản nháp từ localStorage (nếu có)
            try {
                const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
                if (savedDraft) {
                    const parsed = JSON.parse(savedDraft);
                    setFormData((prev) => ({
                        ...prev,
                        ...parsed,
                        // Ưu tiên thông tin định danh từ tài khoản đã đăng nhập
                        ...(loggedIn ? {
                            student_id: sessionMssv,
                            student_name: sessionName || parsed.student_name || '',
                        } : {}),
                    }));
                } else if (loggedIn) {
                    setFormData((prev) => ({
                        ...prev,
                        student_id: sessionMssv,
                        student_name: sessionName,
                    }));
                }
            } catch (e) {
                console.error('Không thể nạp bản nháp:', e);
            } finally {
                setIsDraftLoaded(true);
            }
        };

        loadSessionAndDraft();
    }, []);

    // 2. Tự động lưu bản nháp theo thời gian thực mỗi khi nhập liệu
    useEffect(() => {
        if (isDraftLoaded && !success) {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        }
    }, [formData, isDraftLoaded, success]);

    const handleStandardChange = (stdKey: string) => {
        const firstItem = CRITERIA_TREE[stdKey]?.items[0]?.full || '';
        setFormData((prev) => ({
            ...prev,
            standard: stdKey,
            sub_criterion: firstItem,
        }));
    };

    const handleLevelChange = (level: string) => {
        setFormData((prev) => {
            const exists = prev.levels.includes(level);
            if (exists) {
                if (prev.levels.length === 1) return prev;
                return { ...prev, levels: prev.levels.filter((l) => l !== level) };
            } else {
                return { ...prev, levels: [...prev.levels, level] };
            }
        });
    };

    const handleResetForm = () => {
        if (confirm('Bạn có chắc chắn muốn xóa nội dung đang soạn để nhập lại từ đầu?')) {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            setFormData({
                ...INITIAL_FORM,
                ...(isStudentLoggedIn ? {
                    student_id: formData.student_id,
                    student_name: formData.student_name,
                } : {}),
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const payload = {
            student_name: formData.student_name,
            student_id: formData.student_id,
            activity_title: formData.activity_title,
            organizer: formData.organizer,
            target_audience: formData.target_audience,
            project_url: formData.project_url,
            start_date: formData.start_date,
            end_date: formData.end_date,
            registration_deadline: formData.registration_deadline || null,
            completion_condition: formData.completion_condition || null,
            location: formData.location,
            target_standard: formData.standard,
            target_sub_criterion: formData.sub_criterion,
            target_levels: formData.levels,
            proof_method: formData.proof_method,
            note: formData.note,
            status: 'PENDING',
        };

        const { error } = await supabase.from('proposals').insert([payload]);

        setLoading(false);

        if (error) {
            console.error('Lỗi Supabase:', error);
            setErrorMessage(error.message);
        } else {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            setSuccess(true);
        }
    };

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
            <div>
                <header className="bg-[#001C44] text-white border-b border-[#0C5776]">
                    <div className="max-w-3xl mx-auto px-4 py-7">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs text-[#BCFEFE] hover:underline mb-3"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Quay lại danh sách hoạt động
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                            Đề xuất hoạt động xét chọn Sinh viên 5 tốt
                        </h1>
                        <p className="text-xs sm:text-sm text-[#BCFEFE]/80 mt-1">
                            Biểu mẫu tiếp nhận các hoạt động hỗ trợ tiêu chí xét chọn danh hiệu trong năm học.
                        </p>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto px-4 mt-6">
                    <div className="bg-[#BCFEFE]/20 border border-[#2D99AE]/40 rounded-xl p-4 mb-6 text-xs text-[#001C44] space-y-2 leading-relaxed">
                        <p className="font-bold flex items-center gap-1.5 text-[#0C5776]">
                            <AlertCircle className="w-4 h-4 text-[#2D99AE] shrink-0" />
                            Chú ý:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                            <li>
                                Đối với tiêu chuẩn <strong>Học tập tốt</strong>: Danh sách các CLB học thuật sẽ được Hội Sinh viên Đại học công bố sau, sinh viên không đề xuất hoạt động hỗ trợ tiêu chí này.
                            </li>
                            <li>
                                Đối với tiêu chuẩn <strong>Thể lực tốt</strong>: Tiêu chí "Thành viên đội tuyển thể thao cấp Đại học trở lên" yêu cầu có giấy xác nhận của giáo viên quản lý đội tuyển theo mẫu, sinh viên không đề xuất hoạt động hỗ trợ tiêu chí này.
                            </li>
                            <li>
                                Đối với tiêu chuẩn <strong>Thể lực tốt</strong>: Danh sách các CLB thể thao sẽ được Hội Sinh viên Đại học công bố sau, sinh viên không đề xuất hoạt động hỗ trợ tiêu chí này.
                            </li>
                        </ul>
                    </div>

                    {success ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
                            <CheckCircle2 className="w-12 h-12 text-[#2D99AE] mx-auto" />
                            <h2 className="text-lg font-bold text-[#001C44]">Đã gửi đề xuất thành công</h2>
                            <p className="text-xs text-slate-600 max-w-md mx-auto">
                                Hoạt động đã được lưu lại để rà soát theo tiêu chí đã đăng ký.
                            </p>
                            <div className="pt-3 flex justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setSuccess(false);
                                        localStorage.removeItem(DRAFT_STORAGE_KEY);
                                        setFormData({
                                            ...INITIAL_FORM,
                                            ...(isStudentLoggedIn ? {
                                                student_id: formData.student_id,
                                                student_name: formData.student_name,
                                            } : {}),
                                        });
                                    }}
                                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#0C5776] text-white hover:bg-[#001C44] transition-colors"
                                >
                                    Gửi thêm hoạt động khác
                                </button>
                                <Link
                                    href="/"
                                    className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Về danh sách hoạt động
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
                            {errorMessage && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Nhóm 1: Thông tin sinh viên */}
                            <div>
                                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 mb-3 gap-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C5776]">
                                        1. Thông tin sinh viên đề xuất
                                    </h3>
                                    {isStudentLoggedIn && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Đã xác thực từ Hồ sơ cá nhân
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ví dụ: Phạm Thị Vân Anh"
                                                value={formData.student_name}
                                                readOnly={isStudentLoggedIn && !!formData.student_name}
                                                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                                                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-all ${isStudentLoggedIn && !!formData.student_name
                                                    ? 'bg-slate-100 text-slate-600 font-semibold border-slate-200 cursor-not-allowed pr-8'
                                                    : 'border-slate-300 focus:border-[#0C5776] bg-white'
                                                    }`}
                                            />
                                            {isStudentLoggedIn && !!formData.student_name && (
                                                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Mã số sinh viên (MSSV) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ví dụ: 20230000"
                                                value={formData.student_id}
                                                readOnly={isStudentLoggedIn}
                                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-all ${isStudentLoggedIn
                                                    ? 'bg-slate-100 text-slate-600 font-bold border-slate-200 cursor-not-allowed pr-8'
                                                    : 'border-slate-300 focus:border-[#0C5776] bg-white'
                                                    }`}
                                            />
                                            {isStudentLoggedIn && (
                                                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nhóm 2: Chi tiết hoạt động */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C5776] border-b border-slate-100 pb-2 mb-3">
                                    2. Thông tin chi tiết hoạt động
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Tên hoạt động <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nhập chính xác tên hoạt động/ cuộc thi"
                                            value={formData.activity_title}
                                            onChange={(e) => setFormData({ ...formData, activity_title: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <div>
                                            <label className='block text-xs font-medium text-slate-700 mb-1'>
                                                Đơn vị tổ chức <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                type='text'
                                                required
                                                placeholder='Tên đơn vị, đoàn thể hoặc ban tổ chức'
                                                value={formData.organizer}
                                                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                                                className='w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-white'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-xs font-medium text-slate-700 mb-1'>
                                                Đối tượng tham gia <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                type='text'
                                                required
                                                placeholder='Ví dụ: Toàn thể sinh viên, đoàn viên thanh niên...'
                                                value={formData.target_audience}
                                                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                                className='w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-white'
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                                Thời gian bắt đầu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                lang="vi-VN"
                                                required
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                                Thời gian kết thúc <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                lang="vi-VN"
                                                required
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Hạn chót đăng ký (ngày & giờ, nếu có)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.registration_deadline}
                                            onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Địa điểm tổ chức <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Địa điểm trực tiếp hoặc ghi rõ 'Trực tuyến'"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Nội dung hoạt động (Link đề án hoặc bài viết giới thiệu) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://... liên kết bài viết truyền thông hoặc đề án chi tiết"
                                            value={formData.project_url}
                                            onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Nhóm 3: Chọn tiêu chuẩn và tiêu chí */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C5776] border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                                    3. Tiêu chuẩn và tiêu chí tương ứng
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Tiêu chuẩn <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.standard}
                                            onChange={(e) => handleStandardChange(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776]"
                                        >
                                            {Object.keys(CRITERIA_TREE).map((key) => (
                                                <option key={key} value={key}>
                                                    {CRITERIA_TREE[key].name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Tiêu chí cụ thể <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.sub_criterion}
                                            onChange={(e) => setFormData({ ...formData, sub_criterion: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0C5776] leading-relaxed text-slate-800"
                                        >
                                            {CRITERIA_TREE[formData.standard]?.items.map((item, index) => (
                                                <option key={index} value={item.full}>
                                                    {item.display}
                                                </option>
                                            ))}
                                        </select>

                                        {formData.sub_criterion && (
                                            <div className="mt-2.5 p-3 rounded-lg bg-[#BCFEFE]/20 border border-[#2D99AE]/30 text-xs text-[#001C44] leading-relaxed">
                                                <span className="font-semibold text-[#0C5776] block mb-1">
                                                    Nội dung tiêu chí đã chọn:
                                                </span>
                                                <p className="text-slate-700">
                                                    {formData.sub_criterion}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Điều kiện hoàn thành / ghi nhận tiêu chí (nếu có)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ví dụ: Đạt từ 38/40 điểm trở lên; Hoàn thành tối thiểu 5 chặng..."
                                            value={formData.completion_condition}
                                            onChange={(e) => setFormData({ ...formData, completion_condition: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-white"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            * Quy định cụ thể của BTC để được tính tiêu chí (giúp Quản trị viên duyệt đề xuất chính xác hơn).
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                            Cấp xét dự kiến phù hợp:
                                        </label>
                                        <div className="flex flex-wrap gap-4 text-xs">
                                            {[
                                                { id: 'DAI_HOC', label: 'Cấp Đại học' },
                                                { id: 'THANH_PHO', label: 'Cấp Thành phố' },
                                                { id: 'TRUNG_UONG', label: 'Cấp Trung ương' },
                                            ].map((lvl) => (
                                                <label key={lvl.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.levels.includes(lvl.id)}
                                                        onChange={() => handleLevelChange(lvl.id)}
                                                        className="rounded text-[#0C5776] focus:ring-0"
                                                    />
                                                    <span>{lvl.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nhóm 4: Cách thức minh chứng */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C5776] border-b border-slate-100 pb-2 mb-3">
                                    4. Cách thức minh chứng và ghi chú
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Cách thức minh chứng <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Giấy chứng nhận tham gia, quyết định khen thưởng, xác nhận hoàn thành cự ly..."
                                            value={formData.proof_method}
                                            onChange={(e) => setFormData({ ...formData, proof_method: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Ghi chú thêm (nếu có)
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Mô tả cụ thể vai trò hoặc thông tin bổ sung cho nhóm rà soát..."
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Xóa bản nháp</span>
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0C5776] text-white text-xs font-semibold hover:bg-[#001C44] transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {loading ? 'Đang gửi...' : 'Gửi đề xuất hoạt động'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

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