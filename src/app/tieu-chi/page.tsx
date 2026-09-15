'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Search, CheckCircle2, Circle, Award, BookOpen,
    HeartHandshake, Activity, Globe, Filter, RotateCcw, Sparkles
} from 'lucide-react';
import { CRITERIA_TREE } from '@/data/criteria';

const STANDARDS_CONFIG: Record<string, { label: string; icon: any; color: string; desc: string }> = {
    DAO_DUC: {
        label: 'Đạo đức tốt',
        icon: Award,
        color: 'text-amber-700 bg-amber-50 border-amber-300',
        desc: 'Rèn luyện tư tưởng, ý thức pháp luật, đạo đức lối sống, văn hóa học đường và nội quy nhà trường.'
    },
    HOC_TAP: {
        label: 'Học tập tốt',
        icon: BookOpen,
        color: 'text-blue-700 bg-blue-50 border-blue-300',
        desc: 'Thành tích học tập, nghiên cứu khoa học, đổi mới sáng tạo, học thuật và chuyên môn.'
    },
    THE_LUC: {
        label: 'Thể lực tốt',
        icon: Activity,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        desc: 'Rèn luyện thể chất thường xuyên, đạt danh hiệu Sinh viên khỏe và tham gia các hoạt động thể thao.'
    },
    TINH_NGUYEN: {
        label: 'Tình nguyện tốt',
        icon: HeartHandshake,
        color: 'text-rose-700 bg-rose-50 border-rose-300',
        desc: 'Tham gia các hoạt động tình nguyện vì cộng đồng, bảo vệ môi trường, an sinh xã hội và hiến máu nhân đạo.'
    },
    HOI_NHAP: {
        label: 'Hội nhập tốt',
        icon: Globe,
        color: 'text-indigo-700 bg-indigo-50 border-indigo-300',
        desc: 'Năng lực ngoại ngữ, kỹ năng thực hành xã hội, tin học và tham gia các hoạt động giao lưu quốc tế.'
    }
};

const LEVELS = [
    { key: 'ALL', label: 'Tất cả các cấp' },
    { key: 'DAI_HOC', label: 'Cấp Đại học (2025 - 2026)' },
    { key: 'THANH_PHO', label: 'Cấp Thành phố' },
    { key: 'TRUNG_UONG', label: 'Cấp Trung ương' }
];

function getLevelsOfCriterion(fullText: string): string[] {
    const text = fullText.toLowerCase();
    const levels: string[] = [];

    if (text.includes('đại học') || text.includes('trường') || text.includes('khoa') || text.includes('phường') || text.includes('xã')) {
        levels.push('DAI_HOC');
    }
    if (text.includes('thành phố') || text.includes('tỉnh') || text.includes('thủ đô')) {
        levels.push('THANH_PHO');
    }
    if (text.includes('trung ương') || text.includes('quốc gia') || text.includes('quốc tế') || text.includes('wos/scopus')) {
        levels.push('TRUNG_UONG');
    }

    if (levels.length === 0) {
        return ['DAI_HOC', 'THANH_PHO', 'TRUNG_UONG'];
    }
    return levels;
}

export default function CriteriaGuidePage() {
    const [selectedStandard, setSelectedStandard] = useState<string>('ALL');
    const [selectedLevel, setSelectedLevel] = useState<string>('DAI_HOC');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        try {
            const saved = localStorage.getItem('sv5t_checked_criteria');
            if (saved) {
                setCheckedItems(JSON.parse(saved));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const toggleCriterion = (fullText: string) => {
        const nextState = { ...checkedItems, [fullText]: !checkedItems[fullText] };
        setCheckedItems(nextState);
        try {
            localStorage.setItem('sv5t_checked_criteria', JSON.stringify(nextState));
        } catch (e) {
            console.error(e);
        }
    };

    const handleResetProgress = () => {
        if (confirm('Bạn có chắc muốn đặt lại toàn bộ tiêu chí đã đánh dấu tự đánh giá?')) {
            setCheckedItems({});
            localStorage.removeItem('sv5t_checked_criteria');
        }
    };

    const allCriteriaList = useMemo(() => {
        const list: Array<{
            standardKey: string;
            standardName: string;
            full: string;
            display: string;
            levels: string[];
        }> = [];

        Object.entries(CRITERIA_TREE).forEach(([stdKey, stdVal]) => {
            stdVal.items.forEach((item) => {
                list.push({
                    standardKey: stdKey,
                    standardName: stdVal.name,
                    full: item.full,
                    display: item.display,
                    levels: getLevelsOfCriterion(item.full)
                });
            });
        });

        return list;
    }, []);

    const filteredList = useMemo(() => {
        return allCriteriaList.filter((item) => {
            const matchStandard = selectedStandard === 'ALL' || item.standardKey === selectedStandard;
            const matchLevel = selectedLevel === 'ALL' || item.levels.includes(selectedLevel);
            const matchSearch =
                searchQuery.trim() === '' ||
                item.full.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                item.standardName.toLowerCase().includes(searchQuery.toLowerCase().trim());

            return matchStandard && matchLevel && matchSearch;
        });
    }, [allCriteriaList, selectedStandard, selectedLevel, searchQuery]);

    const totalCompleted = useMemo(() => {
        return Object.values(checkedItems).filter(Boolean).length;
    }, [checkedItems]);

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
            <div>
                {/* Header trang trọng chuẩn phong thái Đoàn - Hội */}
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
                                <div className="inline-block mb-1">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#BCFEFE] bg-[#0C5776]/60 px-2.5 py-0.5 rounded border border-[#2D99AE]/40">
                                        Hội Sinh viên Đại học Bách khoa Hà Nội
                                    </span>
                                </div>
                                <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-tight">
                                    Bộ tiêu chuẩn xét chọn danh hiệu “Sinh viên 5 tốt”
                                </h1>
                                <p className="text-xs text-[#BCFEFE]/80 mt-1">
                                    Cấp Đại học năm học 2025 - 2026 • Cấp Thành phố • Cấp Trung ương
                                </p>
                            </div>

                            {/* Bảng hồ sơ tự rà soát */}
                            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3.5 flex items-center gap-4 text-xs">
                                <div>
                                    <div className="text-[#BCFEFE] font-medium">Hồ sơ tự rà soát</div>
                                    <div className="text-lg font-bold text-white">
                                        {totalCompleted} <span className="text-xs font-normal text-slate-300">/ {allCriteriaList.length} tiêu chí đạt</span>
                                    </div>
                                </div>
                                {totalCompleted > 0 && (
                                    <button
                                        onClick={handleResetProgress}
                                        title="Đặt lại bảng tự rà soát"
                                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-4 mt-6 space-y-5">
                    {/* Bảng điều khiển tra cứu */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
                        {/* Thanh tìm kiếm */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Tra cứu nội dung tiêu chí (VD: điểm rèn luyện, nghiên cứu khoa học, hiến máu, thể thao...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white transition-all"
                            />
                        </div>

                        {/* Phân loại cấp xét */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5 text-[#0C5776]" /> Cấp xét:
                            </span>
                            {LEVELS.map((lvl) => (
                                <button
                                    key={lvl.key}
                                    onClick={() => setSelectedLevel(lvl.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedLevel === lvl.key
                                            ? 'bg-[#001C44] text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>

                        {/* Phân loại 5 tiêu chuẩn */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 mr-1">Tiêu chuẩn:</span>
                            <button
                                onClick={() => setSelectedStandard('ALL')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedStandard === 'ALL'
                                        ? 'bg-[#0C5776] text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                Toàn bộ 5 tiêu chuẩn
                            </button>
                            {Object.entries(STANDARDS_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedStandard(key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${selectedStandard === key
                                            ? 'bg-[#0C5776] text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <span>{config.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Danh sách tiêu chí chi tiết */}
                    <div className="space-y-3">
                        <div className="text-xs text-slate-500 flex items-center justify-between px-1">
                            <span>
                                Hiển thị: <strong className="text-[#001C44]">{filteredList.length}</strong> quy định tiêu chí
                            </span>
                            <span className="text-[11px] text-slate-400 italic">
                                * Bấm vào ô kiểm tròn để tự rà soát các điều kiện minh chứng bạn đã đạt được
                            </span>
                        </div>

                        {filteredList.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
                                Không tìm thấy điều kiện tiêu chí phù hợp với điều kiện tra cứu hiện tại.
                            </div>
                        ) : (
                            filteredList.map((item, idx) => {
                                const isChecked = !!checkedItems[item.full];
                                const standardInfo = STANDARDS_CONFIG[item.standardKey] || {
                                    label: item.standardName,
                                    color: 'text-slate-600 bg-slate-100 border-slate-200'
                                };

                                return (
                                    <div
                                        key={idx}
                                        className={`bg-white border rounded-xl p-4 transition-all flex items-start gap-3.5 shadow-xs ${isChecked
                                                ? 'border-emerald-300 bg-emerald-50/25'
                                                : 'border-slate-200 hover:border-[#2D99AE]/50'
                                            }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleCriterion(item.full)}
                                            className="mt-0.5 shrink-0 text-slate-300 hover:text-emerald-600 transition-colors focus:outline-none"
                                            title={isChecked ? 'Hủy đánh dấu' : 'Xác nhận đã đáp ứng tiêu chí'}
                                        >
                                            {isChecked ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                            ) : (
                                                <Circle className="w-5 h-5" />
                                            )}
                                        </button>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${standardInfo.color}`}>
                                                    {standardInfo.label}
                                                </span>

                                                <div className="flex items-center gap-1">
                                                    {item.levels.map((lvl) => (
                                                        <span
                                                            key={lvl}
                                                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${lvl === 'DAI_HOC'
                                                                    ? 'bg-blue-50 text-[#0C5776] border-blue-200'
                                                                    : lvl === 'THANH_PHO'
                                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                                }`}
                                                        >
                                                            {lvl === 'DAI_HOC' ? 'Cấp ĐH' : lvl === 'THANH_PHO' ? 'Cấp TP' : 'Cấp TW'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <p className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'text-slate-900 font-medium' : 'text-slate-700'
                                                }`}>
                                                {item.full}
                                            </p>
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
        </main>
    );
}