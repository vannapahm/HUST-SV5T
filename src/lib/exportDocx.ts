import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

interface ExportParams {
    academicData: any;
    records: any[];
    academicYear: string;
    calculatedStats: {
        averageGpa: number;
        averageDrl: number;
        totalCredits: number;
    };
}

export const generateDocxReport = async ({
    academicData,
    records,
    academicYear,
    calculatedStats,
}: ExportParams) => {
    // 1. Tải file Word mẫu theo năm học (ví dụ: mau_bctt_2526.docx)
    const yearCode = academicYear.replace(/20(\d{2})-20(\d{2})/, '$1$2'); // Chuyển "2025-2026" thành "2526"
    const templatePath = `/templates/mau_bctt_${yearCode}.docx`;

    let response = await fetch(templatePath);
    if (!response.ok) {
        // Fallback về file mặc định nếu chưa có file riêng của năm đó
        response = await fetch('/templates/mau_bctt_2526.docx');
        if (!response.ok) {
            throw new Error(`Không tìm thấy file mẫu Word tại ${templatePath}`);
        }
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    // 2. Hàm gom nhóm hoạt động, tách riêng STT và Nội dung để in đậm từng phần trong Word
    const formatActivitiesBlock = (standardKey: string, startIdx: number = 1) => {
        const filtered = records.filter(
            (r) => r.target_standard === standardKey && r.status === 'APPROVED'
        );

        if (filtered.length === 0) {
            return []; // Trả về mảng rỗng để không in ra gì nếu không có hoạt động
        }

        return filtered.map((r, index) => {
            const currentNum = startIdx + index;
            const title = r.activity_title || '';
            const detail = r.criteria_detail ? ` - ${r.criteria_detail}` : '';
            const proof = r.proof_url ? ` (${r.proof_url})` : '';

            // Tách riêng số thứ tự và nội dung
            return {
                stt: `${currentNum}.`,
                noidung: ` ${title}${detail}${proof}` // Thêm dấu cách ở đầu để cách số ra 1 nhịp
            };
        });
    };

    // Trích xuất năm bắt đầu (Ví dụ: "2025-2026" -> "2025")
    const startYear = academicYear.split('-')[0];

    // 3. Chuẩn bị dữ liệu điền vào các thẻ biến {...}
    const dataToFill = {
        // Tự động sinh tên học kỳ (Ví dụ: 2025.1, 2025.2)
        ky_1: `${startYear}.1`,
        ky_2: `${startYear}.2`,
        // Thông tin cá nhân
        ho_ten: academicData.full_name || '',
        mssv: academicData.student_id || '',
        gioi_tinh: academicData.gender || 'Nam',
        nam_sinh: academicData.birth_year || '',
        dan_toc: academicData.ethnicity || 'Kinh',
        lop: academicData.class_name || '',
        nam_thu: academicData.student_year || '1',
        khoa: academicData.faculty_name || '',
        chuc_vu: academicData.position || 'Không',
        doan_dang: academicData.union_status || 'Đoàn viên',
        sdt: academicData.phone || '',
        email: academicData.email_sis || '',
        nam_hoc: academicYear,

        // Điểm số & Tiêu chí cứng
        gpa_1: academicData.gpa_sem1 || '0',
        tin_chi_1: academicData.credits_sem1 || '0',
        drl_1: academicData.drl_sem1 || '0',

        gpa_2: academicData.gpa_sem2 || '0',
        tin_chi_2: academicData.credits_sem2 || '0',
        drl_2: academicData.drl_sem2 || '0',

        tong_tin_chi: calculatedStats.totalCredits || '0',
        gpa_nam: calculatedStats.averageGpa || '0',
        drl_nam: calculatedStats.averageDrl || '0',

        gdtc: academicData.physical_education_status || 'Đạt',
        ngoai_ngu: academicData.foreign_language_status || 'Đạt chứng chỉ ngoại ngữ theo quy định',
        thanh_tich_khac: academicData.other_achievements || 'Không có',

        // Khối danh sách hoạt động 5 tiêu chuẩn (tự động tiếp nối STT chuẩn xác)
        // Đạo đức: mục 1 & 2 cố định -> hoạt động bắt đầu từ số 3
        list_dao_duc: formatActivitiesBlock('DAO_DUC', 3),

        // Học tập: mục 1 cố định (GPA) -> hoạt động bắt đầu từ số 2
        list_hoc_tap: formatActivitiesBlock('HOC_TAP', 2),

        // Thể lực: nếu có mục 1 là GDTC -> hoạt động bắt đầu từ số 2
        list_the_luc: formatActivitiesBlock('THE_LUC', 2),

        // Tình nguyện: bắt đầu từ số 1 (hoặc số 2 nếu có mục cố định)
        list_tinh_nguyen: formatActivitiesBlock('TINH_NGUYEN', 1),

        // Hội nhập: mục 1 là ngoại ngữ -> hoạt động bắt đầu từ số 2
        list_hoi_nhap: formatActivitiesBlock('HOI_NHAP', 2),
    };

    // 4. Tiến hành kết xuất dữ liệu vào file Word
    doc.render(dataToFill);

    // 5. Tải file về máy người dùng
    const outputBlob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const safeName = (academicData.full_name || 'SinhVien').replace(/\s+/g, '_');
    const fileName = `Bao_cao_thanh_tich_SV5T_${academicData.student_id || 'MSSV'}_${safeName}.docx`;

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(outputBlob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
};