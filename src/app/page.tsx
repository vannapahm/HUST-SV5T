'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, MapPin, Building2, CheckCircle2, ExternalLink, CalendarPlus, Clock } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  title: string;
  organizer: string;
  content_description: string;
  project_url: string;
  start_date: string;
  end_date: string;
  location: string;
  proof_method: string;
  supported_standard: string;
  target_levels: string[];
  registration_deadline?: string;
}

const CRITERIA_MAP: Record<string, { label: string; badgeStyle: string }> = {
  DAO_DUC: {
    label: 'Đạo đức tốt',
    badgeStyle: 'bg-[#F8DAD0]/60 text-[#001C44] border-[#F8DAD0]'
  },
  HOC_TAP: {
    label: 'Học tập tốt',
    badgeStyle: 'bg-[#BCFEFE]/50 text-[#0C5776] border-[#2D99AE]/40'
  },
  THE_LUC: {
    label: 'Thể lực tốt',
    badgeStyle: 'bg-[#2D99AE]/15 text-[#0C5776] border-[#2D99AE]/30'
  },
  TINH_NGUYEN: {
    label: 'Tình nguyện tốt',
    badgeStyle: 'bg-[#F8DAD0]/40 text-[#001C44] border-[#F8DAD0]'
  },
  HOI_NHAP: {
    label: 'Hội nhập tốt',
    badgeStyle: 'bg-[#0C5776]/10 text-[#0C5776] border-[#0C5776]/25'
  },
};

const LEVEL_STYLE: Record<string, { label: string; className: string }> = {
  DAI_HOC: {
    label: 'Cấp Đại học',
    className: 'bg-[#BCFEFE]/40 text-[#0C5776] border-[#2D99AE]/30'
  },
  THANH_PHO: {
    label: 'Cấp Thành phố',
    className: 'bg-[#2D99AE]/20 text-[#001C44] border-[#2D99AE]/40'
  },
  TRUNG_UONG: {
    label: 'Cấp Trung ương',
    className: 'bg-[#F8DAD0] text-[#001C44] border-[#F8DAD0] font-semibold'
  },
};

const FILTER_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'DAO_DUC', label: 'Đạo đức tốt' },
  { key: 'HOC_TAP', label: 'Học tập tốt' },
  { key: 'THE_LUC', label: 'Thể lực tốt' },
  { key: 'TINH_NGUYEN', label: 'Tình nguyện tốt' },
  { key: 'HOI_NHAP', label: 'Hội nhập tốt' },
];

export default function ActivityHub() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Tính trạng thái hạn đăng ký
  const getDeadlineStatus = (deadlineStr?: string) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const diffMs = deadline - now;

    if (diffMs <= 0) {
      return {
        label: 'Đã đóng đơn đăng ký',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      };
    }

    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);

    if (hoursLeft < 24) {
      return {
        label: `⚡ Sắp đóng đơn: còn ${hoursLeft} giờ`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 font-semibold animate-pulse',
      };
    }

    return {
      label: `🟢 Đang mở đơn: còn ${daysLeft} ngày`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    };
  };

  // Tạo đường dẫn đồng bộ sự kiện vào Google Lịch
  const makeGoogleCalendarUrl = (act: Activity) => {
    const title = encodeURIComponent(`[SV5T] ${act.title}`);
    const details = encodeURIComponent(
      `Đơn vị tổ chức: ${act.organizer}\nTiêu chí: ${act.content_description}\nCách thức minh chứng: ${act.proof_method}\nLink bài viết/ đề án: ${act.project_url || ''}`
    );
    const location = encodeURIComponent(act.location || 'Đại học Bách khoa Hà Nội');
    const sDate = act.start_date ? act.start_date.replace(/-/g, '') : '';
    const eDate = act.end_date ? act.end_date.replace(/-/g, '') : sDate;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${sDate}/${eDate}&details=${details}&location=${location}`;
  };

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('start_date', { ascending: false });

      if (!error && data) {
        setActivities(data);
      }
      setLoading(false);
    };

    // 1. Tải dữ liệu ban đầu
    fetchActivities();

    // 2. Tự động đồng bộ lại khi có kết nối mạng trở lại
    const handleOnline = () => {
      fetchActivities();
    };

    // 3. Tự động tải lại khi người dùng quay lại tab trình duyệt này
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchActivities();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Lắng nghe thay đổi tức thì (Realtime) từ Supabase
    const channel = supabase
      .channel('realtime_activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setActivities((prev) => [payload.new as Activity, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setActivities((prev) => prev.filter((item) => item.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setActivities((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as Activity) : item))
            );
          }
        }
      )
      .subscribe();

    // Dọn dẹp sự kiện và kênh kết nối khi rời trang
    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  const displayedActivities = activities.filter((act) =>
    activeTab === 'ALL' ? true : act.supported_standard === activeTab
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      <div>
        {/* Header áp dụng Cách 2: Tên trường bên trái - Thẻ tác giả bên phải */}
        <header className="bg-[#001C44] text-white border-b border-[#0C5776] shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-semibold text-[#BCFEFE] tracking-wider uppercase">
                Đại học Bách khoa Hà Nội
              </span>
              <Link
                href="/de-xuat"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#BCFEFE] text-[#001C44] hover:bg-white transition-all shadow-sm"
              >
                + Đề xuất hoạt động
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Danh sách hoạt động xét chọn Sinh viên 5 tốt
            </h1>
            <p className="text-sm text-[#BCFEFE]/80 mt-2 max-w-2xl leading-relaxed">
              Năm học 2026 - 2027 | Bảng theo dõi các hoạt động xét chọn danh hiệu.
            </p>
          </div>
        </header>

        {/* Khung nội dung và thanh tab */}
        <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
          <div className="border-b border-slate-200 bg-white px-3 rounded-t-lg shadow-xs">
            <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {FILTER_TABS.map((tab) => {
                const isSelected = activeTab === tab.key;
                const count = tab.key === 'ALL'
                  ? activities.length
                  : activities.filter((a) => a.supported_standard === tab.key).length;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`whitespace-nowrap py-3.5 px-1 border-b-2 text-sm transition-all flex items-center gap-2 ${isSelected
                      ? 'border-[#0C5776] text-[#001C44] font-bold'
                      : 'border-transparent text-slate-500 hover:text-[#0C5776] hover:border-slate-300'
                      }`}
                  >
                    {tab.label}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${isSelected
                        ? 'bg-[#BCFEFE] text-[#001C44]'
                        : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Khu vực danh sách thẻ hoạt động */}
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Đang tải dữ liệu hoạt động...
            </div>
          ) : displayedActivities.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
              Hiện chưa có hoạt động nào trong danh mục này.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedActivities.map((act) => {
                const standardInfo = CRITERIA_MAP[act.supported_standard] || {
                  label: act.supported_standard,
                  badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const deadlineStatus = getDeadlineStatus(act.registration_deadline);

                return (
                  <div
                    key={act.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#2D99AE] hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-md border font-medium ${standardInfo.badgeStyle}`}>
                          {standardInfo.label}
                        </span>
                        <div className="flex gap-1.5">
                          {act.target_levels?.map((lvl) => {
                            const level = LEVEL_STYLE[lvl] || {
                              label: lvl,
                              className: 'bg-slate-100 text-slate-700 border-slate-200',
                            };
                            return (
                              <span
                                key={lvl}
                                className={`text-[11px] px-2 py-0.5 rounded border ${level.className}`}
                              >
                                {level.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <h2 className="text-base font-bold text-[#001C44] leading-snug">
                        {act.title}
                      </h2>

                      {/* Nhãn hạn đăng ký */}
                      {deadlineStatus && (
                        <div className="mt-2.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border ${deadlineStatus.badgeClass}`}>
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {deadlineStatus.label}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                        {act.content_description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        {(() => {
                          const startDate = new Date(act.start_date).toLocaleDateString('vi-VN');
                          const endDate = act.end_date ? new Date(act.end_date).toLocaleDateString('vi-VN') : null;

                          return (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                              <span>
                                Thời gian: {startDate}
                                {endDate && endDate !== startDate && ` → ${endDate}`}
                              </span>
                            </div>
                          );
                        })()}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#2D99AE] shrink-0" />
                          <span>Địa điểm: {act.location}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D99AE] shrink-0 mt-0.5" />
                          <span>Cách thức minh chứng: {act.proof_method}</span>
                        </div>
                      </div>
                    </div>

                    {/* Khung nút thêm vào Lịch và liên kết bài viết/ đề án */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={makeGoogleCalendarUrl(act)}
                        target="_blank"
                        rel="noreferrer"
                        title="Thêm nhắc hẹn vào Google Lịch trên điện thoại"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#2D99AE]/40 text-[#0C5776] hover:bg-[#BCFEFE]/20 transition-all"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-[#2D99AE]" />
                        <span>Thêm vào Lịch</span>
                      </a>

                      {act.project_url && (
                        <a
                          href={act.project_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#0C5776] hover:text-[#001C44] font-semibold"
                        >
                          Xem bài viết/ đề án chi tiết
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer áp dụng Cách 1: Ghi nhận bản quyền và đơn vị vận hành */}
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