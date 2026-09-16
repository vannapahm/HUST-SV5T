'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
  Calendar, MapPin, Building2, Award, ExternalLink, Filter,
  Search, Sparkles, BookOpen, PlusCircle, CheckCircle2,
  Clock, AlertCircle, ArrowRight, ShieldCheck, Timer, Settings
} from 'lucide-react';

interface Activity {
  id: string | number;
  academic_year?: string;
  title: string;
  organizer: string;
  target_audience?: string;
  content_description?: string;
  project_url?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  completion_condition?: string;
  location?: string;
  proof_method?: string;
  supported_standard: string;
  criteria_detail?: string;
  target_levels?: string[];
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
}

const CRITERIA_MAP: Record<string, string> = {
  DAO_DUC: 'Đạo đức tốt',
  HOC_TAP: 'Học tập tốt',
  THE_LUC: 'Thể lực tốt',
  TINH_NGUYEN: 'Tình nguyện tốt',
  HOI_NHAP: 'Hội nhập tốt',
};

// Hàm xác định năm học theo mốc: từ 15/09 năm trước đến trước 15/09 năm sau
const getAcademicYearFromDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length < 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Từ 15/09 trở đi tính cho năm học mới (year -> year + 1)
  const isAfterSep15 = month > 9 || (month === 9 && day >= 15);
  return isAfterSep15 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('start_date', { ascending: false });

    if (!error && data) {
      setActivities(data as Activity[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel('realtime_activities_home')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDateVN = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const getDeadlineInfo = (deadlineStr?: string) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    if (isNaN(deadline.getTime())) return null;

    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return {
        text: `Đã hết hạn đăng ký (${formatDateVN(deadlineStr)})`,
        isExpired: true,
        isUrgent: false,
      };
    }

    if (diffDays <= 3) {
      return {
        text: `Sắp hết hạn: còn ${diffDays === 0 ? 'hôm nay' : `${diffDays} ngày`} (${formatDateVN(deadlineStr)})`,
        isExpired: false,
        isUrgent: true,
      };
    }

    return {
      text: `Hạn đăng ký: ${formatDateVN(deadlineStr)} (còn ${diffDays} ngày)`,
      isExpired: false,
      isUrgent: false,
    };
  };

  // Lọc danh sách hoạt động theo mốc 15/09 dựa trên start_date
  const activitiesInYear = useMemo(() => {
    return activities.filter((act) => {
      const actYear = getAcademicYearFromDate(act.start_date) || act.academic_year;
      return actYear === selectedYear;
    });
  }, [activities, selectedYear]);

  const filteredActivities = useMemo(() => {
    return activitiesInYear.filter((act) => {
      const actStatus = act.status || 'APPROVED';
      const matchStandard = selectedStandard === 'ALL' || act.supported_standard === selectedStandard;
      const matchStatus = selectedStatus === 'ALL' || actStatus === selectedStatus;
      const matchSearch =
        searchQuery.trim() === '' ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        act.organizer.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (act.criteria_detail && act.criteria_detail.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      return matchStandard && matchStatus && matchSearch;
    });
  }, [activitiesInYear, selectedStandard, selectedStatus, searchQuery]);

  // Thống kê số lượng hoạt động tương ứng theo năm đang chọn
  const approvedCount = activitiesInYear.filter((a) => (a.status || 'APPROVED') === 'APPROVED').length;
  const pendingCount = activitiesInYear.filter((a) => a.status === 'PENDING').length;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      <div>
        {/* Header chính */}
        <header className="bg-[#001C44] text-white border-b border-[#0C5776] shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-block mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#BCFEFE] bg-[#0C5776]/60 px-2.5 py-0.5 rounded border border-[#2D99AE]/40">
                    Đại học Bách khoa Hà Nội
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
                  Nền tảng xét chọn “Sinh viên 5 tốt”
                </h1>
                <p className="text-xs text-[#BCFEFE]/80 mt-1">
                  Theo dõi danh mục hoạt động rèn luyện, tự đánh giá tiêu chí và quản lý hồ sơ tích lũy cá nhân.
                </p>
              </div>

              {/* Các nút truy cập nhanh trên Header */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/tieu-chi"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15"
                >
                  <BookOpen className="w-4 h-4 text-[#BCFEFE]" />
                  Bộ tiêu chuẩn SV5T
                </Link>

                <Link
                  href="/ho-so"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BCFEFE] text-[#001C44] text-xs font-bold hover:bg-white transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#0C5776]" />
                  Hồ sơ cá nhân
                </Link>

                <Link
                  href="/de-xuat"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-[#001C44] hover:bg-[#BCFEFE] text-xs font-semibold transition-all shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 text-[#0C5776]" />
                  Đề xuất hoạt động
                </Link>

                {/* NÚT BẤM CHO QUẢN TRỊ VIÊN */}
                <Link
                  href="/tong-hop"
                  title="Chuyển đến bàn làm việc Quản trị viên"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0C5776] hover:bg-[#2D99AE] text-white text-xs font-semibold transition-all border border-white/20 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#BCFEFE]" />
                  Quản trị viên
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Khối giới thiệu 2 nhóm hoạt động */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-emerald-900">Hoạt động tự động ghi nhận ({approvedCount})</div>
                <div className="text-emerald-700 mt-0.5 leading-relaxed">
                  Đã được Quản trị viên phê duyệt trước tiêu chuẩn. Sinh viên tham gia mặc định được công nhận tiêu chí.
                </div>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-amber-900">Hoạt động bên ngoài - Chờ xét ({pendingCount})</div>
                <div className="text-amber-700 mt-0.5 leading-relaxed">
                  Đang tổ chức bên ngoài. Sinh viên chủ động tham gia lấy minh chứng; tiêu chí sẽ được Quản trị viên rà soát sau.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-5 space-y-5">
          {/* Bảng điều khiển tra cứu & Bộ lọc */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm tên hoạt động, đơn vị tổ chức, nội dung tiêu chuẩn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            {/* Phân loại trạng thái & Tiêu chuẩn */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#0C5776]" /> Phân loại:
                </span>
                <button
                  onClick={() => setSelectedStatus('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedStatus === 'ALL'
                    ? 'bg-[#001C44] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Tất cả ({activitiesInYear.length})
                </button>
                <button
                  onClick={() => setSelectedStatus('APPROVED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${selectedStatus === 'APPROVED'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tự động ghi nhận ({approvedCount})
                </button>
                <button
                  onClick={() => setSelectedStatus('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${selectedStatus === 'PENDING'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Chờ xét duyệt ({pendingCount})
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Năm học:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold text-[#0C5776] focus:outline-none focus:border-[#0C5776] cursor-pointer"
                  >
                    <option value="2024-2025">2024 – 2025</option>
                    <option value="2025-2026">2025 – 2026</option>
                    <option value="2026-2027">2026 – 2027</option>
                    <option value="2027-2028">2027 – 2028</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Tiêu chuẩn:</span>
                  <select
                    value={selectedStandard}
                    onChange={(e) => setSelectedStandard(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0C5776] cursor-pointer"
                  >
                    <option value="ALL">Toàn bộ 5 tiêu chuẩn</option>
                    <option value="DAO_DUC">Đạo đức tốt</option>
                    <option value="HOC_TAP">Học tập tốt</option>
                    <option value="THE_LUC">Thể lực tốt</option>
                    <option value="TINH_NGUYEN">Tình nguyện tốt</option>
                    <option value="HOI_NHAP">Hội nhập tốt</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách hoạt động */}
          <div className="space-y-4">
            <div className="text-xs text-slate-500 px-1">
              Đang hiển thị: <strong className="text-[#001C44]">{filteredActivities.length}</strong> hoạt động
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-slate-500">Đang tải danh sách hoạt động...</div>
            ) : filteredActivities.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
                Không có hoạt động nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              filteredActivities.map((act) => {
                const isApproved = (act.status || 'APPROVED') === 'APPROVED';
                const isPending = act.status === 'PENDING';
                const isRejected = act.status === 'REJECTED';
                const deadlineInfo = getDeadlineInfo(act.registration_deadline);

                return (
                  <div
                    key={act.id}
                    className={`bg-white border rounded-xl p-5 shadow-xs space-y-3.5 transition-all ${isRejected
                      ? 'border-rose-200 bg-rose-50/15'
                      : isPending
                        ? 'border-amber-200/80 hover:border-amber-300'
                        : 'border-slate-200 hover:border-[#2D99AE]/60'
                      }`}
                  >
                    {/* Hàng 1: Tiêu chuẩn, Cấp xét, Hạn đăng ký & Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
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

                        {deadlineInfo && (
                          <div>
                            {deadlineInfo.isExpired ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {deadlineInfo.text}
                              </span>
                            ) : deadlineInfo.isUrgent ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                                </span>
                                <Timer className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                {deadlineInfo.text}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-pulse relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                {deadlineInfo.text}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Tự động ghi nhận
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Chờ xét duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Không công nhận
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hàng 2: Tên hoạt động & Tiêu chí chi tiết */}
                    <div>
                      <h2 className={`text-base font-bold ${isRejected ? 'text-rose-900 line-through opacity-80' : 'text-[#001C44]'}`}>
                        {act.title}
                      </h2>
                      {act.criteria_detail && (
                        <div className="mt-2 p-2.5 rounded-lg bg-[#BCFEFE]/15 border border-[#2D99AE]/25 text-xs text-[#001C44] flex items-start gap-2">
                          <Award className="w-4 h-4 text-[#0C5776] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#0C5776]">Tiêu chí tương ứng:</span>{' '}
                            <span className="text-slate-700">{act.criteria_detail}</span>
                          </div>
                        </div>
                      )}

                      {/* Điều kiện ghi nhận tiêu chí */}
                      {act.completion_condition && (
                        <div className="mt-1.5 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-800">Điều kiện ghi nhận:</span>{' '}
                            <span className="text-slate-700 font-medium">{act.completion_condition}</span>
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
                        <span>Thời gian diễn ra: {formatDateVN(act.start_date)} → {formatDateVN(act.end_date)}</span>
                      </div>
                      {act.registration_deadline && (
                        <div className="flex items-center gap-2">
                          <Timer className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>Hạn chót đăng ký: <strong className="text-rose-600 font-bold">{formatDateVN(act.registration_deadline)}</strong></span>
                        </div>
                      )}
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

                    {/* Hàng 4: Liên kết bài viết & Nút lưu hồ sơ */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                      {act.project_url ? (
                        <a
                          href={act.project_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#0C5776] hover:text-[#001C44] font-semibold underline"
                        >
                          Xem chi tiết đề án / bài viết
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Theo thông báo từ đơn vị tổ chức</span>
                      )}

                      <Link
                        href="/ho-so"
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#BCFEFE] text-[#001C44] transition-colors"
                      >
                        <span>Ghi nhận vào hồ sơ cá nhân</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer có kèm liên kết Cổng Quản trị viên */}
      <footer className="mt-20 border-t border-slate-200 py-8 text-center text-xs text-slate-500 space-y-2 bg-white">
        <p className="text-slate-400">
          Đại học Bách khoa Hà Nội • Bản quyền © 2026
        </p>
        <div className="flex items-center justify-center gap-3 text-[#0C5776]">
          <span>
            Xây dựng và phát triển bởi <strong className="text-[#001C44]">Phạm Thị Vân Anh</strong>
          </span>
          <span>|</span>
          <Link
            href="/tong-hop"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0C5776] hover:text-[#001C44] hover:underline"
          >
            <Settings className="w-3.5 h-3.5" />
            Trang Quản trị
          </Link>
        </div>
      </footer>
    </main>
  );
}