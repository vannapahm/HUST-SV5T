export interface LevelValidity {
    daiHoc: boolean;
    thanhPho: boolean;
    trungUong: boolean;
}

/**
 * Kiểm tra ngày diễn ra hoạt động có rơi vào khung thời gian xét của từng cấp trong năm học đó không.
 * @param dateStr Định dạng YYYY-MM-DD
 * @param academicYear Định dạng "2025-2026"
 */
export function checkLevelEligibility(dateStr: string, academicYear: string): LevelValidity {
    if (!dateStr) return { daiHoc: false, thanhPho: false, trungUong: false };

    const startYear = parseInt(academicYear.split('-')[0], 10);
    const endYear = parseInt(academicYear.split('-')[1], 10);
    const date = dateStr.split('T')[0];

    // Cấp Đại học: 15/09 năm trước -> 10/09 năm xét
    const dhStart = `${startYear}-09-15`;
    const dhEnd = `${endYear}-09-10`;
    const isDaiHoc = date >= dhStart && date <= dhEnd;

    // Cấp Thành phố & Trung ương: 01/08 năm trước -> 31/07 năm xét
    const tpStart = `${startYear}-08-01`;
    const tpEnd = `${endYear}-07-31`;
    const isThanhPho = date >= tpStart && date <= tpEnd;

    return {
        daiHoc: isDaiHoc,
        thanhPho: isThanhPho,
        trungUong: isThanhPho, // Cấp Trung ương áp dụng khung tương đương Cấp TP
    };
}