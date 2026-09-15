'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Search, CheckCircle2, Circle, Award, BookOpen,
    HeartHandshake, Activity, Globe, Filter, RotateCcw, Sparkles
} from 'lucide-react';
import { HANDBOOK_CRITERIA } from '@/data/handbookCriteria';

const STANDARDS_CONFIG: Record<string, { label: string; desc: string }> = {
    DAO_DUC: { label: 'Đạo đức tốt', desc: 'Rèn luyện tư tưởng, đạo đức, kỷ luật và nội quy.' },
    HOC_TAP: { label: 'Học tập tốt', desc: 'Thành tích học tập, NCKH, sáng tạo chuyên môn.' },
    THE_LUC: { label: 'Thể lực tốt', desc: 'Rèn luyện thể chất, đạt chuẩn Sinh viên khỏe.' },
    TINH_NGUYEN: { label: 'Tình nguyện tốt', desc: 'Hoạt động cộng đồng, an sinh xã hội, hiến máu.' },
    HOI_NHAP: { label: 'Hội nhập tốt', desc: 'Ngoại ngữ, kỹ năng thực hành xã hội, giao lưu quốc tế.' }
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
    const [selectedStandard, setSelectedStandard] = useState<string>('DAO_DUC');
    const [selectedLevel, setSelectedLevel] = useState<string>('DAI_HOC');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        try {
            const saved = localStorage.getItem('sv5t_checked_criteria');
            if (saved) setCheckedItems(JSON.parse(saved));
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
        if (confirm('Bạn có chắc muốn đặt lại toàn bộ tiêu chí đã tự đánh giá?')) {
            setCheckedItems({});
            localStorage.removeItem('sv5t_checked_criteria');
        }
    };

    const standardsToDisplay = useMemo(() => {
        return selectedStandard === 'ALL' ? Object.keys(HANDBOOK_CRITERIA) : [selectedStandard];
    }, [selectedStandard]);

    const totalCompleted = useMemo(() => {
        return Object.values(checkedItems).filter(Boolean).length;
    }, [checkedItems]);

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
            <div>
                {/* Header */}
                <header className="bg-[#001C44] text-white border-b border-[#0C5776] shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 py-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#BCFEFE] hover:underline mb-2">
                                    <ArrowLeft className="w-3.5 h-3.5" /> Về Trang chủ
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

                            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3.5 flex items-center gap-4 text-xs">
                                <div>
                                    <div className="text-[#BCFEFE] font-medium">Hồ sơ tự rà soát</div>
                                    <div className="text-lg font-bold text-white">
                                        {totalCompleted} <span className="text-xs font-normal text-slate-300">tiêu chí đạt</span>
                                    </div>
                                </div>
                                {totalCompleted > 0 && (
                                    <button onClick={handleResetProgress} title="Đặt lại bảng tự rà soát" className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors">
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
                    {/* Bảng điều khiển tra cứu */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Tra cứu tiêu chí (VD: điểm rèn luyện, GPA, nghiên cứu khoa học, hiến máu...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0C5776] bg-slate-50 focus:bg-white transition-all"
                            />
                        </div>

                        {/* Cấp xét */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5 text-[#0C5776]" /> Cấp xét:
                            </span>
                            {LEVELS.map((lvl) => (
                                <button
                                    key={lvl.key}
                                    onClick={() => setSelectedLevel(lvl.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedLevel === lvl.key ? 'bg-[#001C44] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>

                        {/* Tiêu chuẩn */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 mr-1">Tiêu chuẩn:</span>
                            <button
                                onClick={() => setSelectedStandard('ALL')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedStandard === 'ALL' ? 'bg-[#0C5776] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                Tất cả (5 tiêu chuẩn)
                            </button>
                            {Object.entries(STANDARDS_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedStandard(key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedStandard === key ? 'bg-[#001C44] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <span>{config.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ===================== VISUAL 2 Ô CHUẨN XÁC THEO MẪU ===================== */}
                    <div className="space-y-12">
                        {standardsToDisplay.map((stdKey) => {
                            const standard = HANDBOOK_CRITERIA[stdKey];
                            if (!standard) return null;

                            const filterFn = (fullText: string) => {
                                const levels = getLevelsOfCriterion(fullText);
                                const matchLevel = selectedLevel === 'ALL' || levels.includes(selectedLevel);
                                const matchSearch = searchQuery.trim() === '' || fullText.toLowerCase().includes(searchQuery.toLowerCase().trim());
                                return matchLevel && matchSearch;
                            };

                            const mandatoryList = standard.mandatory.filter(filterFn);
                            const electiveList = standard.elective.filter(filterFn);

                            if (mandatoryList.length === 0 && electiveList.length === 0) return null;

                            return (
                                <div key={stdKey} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                                    {/* Tiêu đề tiêu chuẩn */}
                                    <div className="text-center pb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#001C44]">
                                            {standard.name}
                                        </h2>
                                        <div className="w-12 h-1 bg-[#0C5776] mx-auto rounded-full mt-2"></div>
                                    </div>

                                    {/* KHỐI 1: TIÊU CHÍ BẮT BUỘC (Nền đậm, chữ trắng) */}
                                    {mandatoryList.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-sm sm:text-base font-black tracking-wide text-[#001C44] uppercase">
                                                TIÊU CHÍ BẮT BUỘC:
                                            </h3>
                                            <div className="space-y-3">
                                                {mandatoryList.map((fullText, idx) => {
                                                    const isChecked = !!checkedItems[fullText];
                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => toggleCriterion(fullText)}
                                                            className={`cursor-pointer rounded-2xl p-4 sm:p-5 text-white transition-all shadow-md flex items-start gap-3.5 ${isChecked ? 'bg-emerald-800 border-2 border-emerald-400' : 'bg-[#001C44] hover:bg-[#0C5776]'
                                                                }`}
                                                        >
                                                            <div className="mt-0.5 shrink-0">
                                                                {isChecked ? <CheckCircle2 className="w-5 h-5 text-[#BCFEFE] fill-emerald-600" /> : <Circle className="w-5 h-5 text-white/50" />}
                                                            </div>
                                                            <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                                                                {fullText}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* KHỐI 2: ĐẠT THÊM 01 TIÊU CHÍ (Nền trắng, viền đậm, chữ tối) */}
                                    {electiveList.length > 0 && (
                                        <div className="space-y-3 pt-4">
                                            <h3 className="text-sm sm:text-base font-black tracking-wide text-[#001C44] uppercase">
                                                ĐẠT THÊM 01 TIÊU CHÍ TRONG CÁC TIÊU CHÍ SAU:
                                            </h3>
                                            <div className="space-y-3">
                                                {electiveList.map((fullText, idx) => {
                                                    const isChecked = !!checkedItems[fullText];
                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => toggleCriterion(fullText)}
                                                            className={`cursor-pointer rounded-2xl p-4 sm:p-5 transition-all shadow-xs flex items-start gap-3.5 border-2 ${isChecked ? 'bg-emerald-50 border-emerald-500 text-emerald-950' : 'bg-white border-[#001C44] text-slate-800 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="mt-0.5 shrink-0">
                                                                {isChecked ? <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" /> : <Circle className="w-5 h-5 text-[#001C44]" />}
                                                            </div>
                                                            <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                                                                {fullText}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 border-t border-slate-200 py-8 text-center text-xs text-slate-500 space-y-1 bg-white">
                <p className="text-slate-400">Đại học Bách khoa Hà Nội • Bản quyền © 2026</p>
                <p className="text-[#0C5776] pt-1">
                    Xây dựng và phát triển bởi <span className="font-semibold text-[#001C44]">Phạm Thị Vân Anh</span>
                </p>
            </footer>
        </main>
    );
}