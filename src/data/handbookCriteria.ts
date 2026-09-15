// Dành riêng cho hiển thị Sổ tay / Bộ tiêu chuẩn 3 cấp (/tieu-chi)
export interface HandbookStandard {
    name: string;
    mandatory: string[]; // Ô 1: Tiêu chí bắt buộc
    elective: string[];  // Ô 2: Đạt thêm 01 tiêu chí trong các tiêu chí sau
}

export const HANDBOOK_CRITERIA: Record<string, HandbookStandard> = {
    DAO_DUC: {
        name: 'Đạo đức tốt',
        mandatory: [
            'Điểm rèn luyện trung bình 02 học kỳ chính đạt từ 80 điểm trở lên (trên thang điểm 100 theo quy chế đánh giá kết quả rèn luyện sinh viên hiện hành của Bộ Giáo dục và Đào tạo, Bộ Lao động - Thương binh và Xã hội).',
            'Đối với sinh viên các hệ đào tạo không sử dụng Điểm rèn luyện, yêu cầu có giấy xác nhận của giáo viên chủ nhiệm đạt hạnh kiểm tốt trong năm học.',
            'Không vi phạm pháp luật và các quy chế, nội quy của Đại học, quy định của địa phương và cộng đồng.'
        ],
        elective: [
            'Tham gia các cuộc thi, diễn đàn học thuật tìm hiểu về chủ nghĩa Mác – Lênin, tư tưởng Hồ Chí Minh.',
            'Là Đảng viên Đảng Cộng sản Việt Nam, đánh giá xếp loại Đảng viên là hoàn thành tốt nhiệm vụ trở lên.',
            'Đạt Giấy chứng nhận hoàn thành lớp Bồi dưỡng nhận thức về Đảng cho đối tượng Đảng từ loại Giỏi trở lên.',
            'Tham gia tích cực các cuộc thi về Đảng, Đoàn - Hội do cấp Đại học trở lên tổ chức, phát động hoặc công nhận.',
            'Là thanh niên tiêu biểu, thanh niên tiên tiến, gương người tốt, việc tốt, có hành động dũng cảm cứu người được ghi nhận, biểu dương.'
        ]
    },

    HOC_TAP: {
        name: 'Học tập tốt',
        mandatory: [
            'Điểm trung bình học tập năm học 2025 - 2026 đạt từ 2.8/4.0 trở lên (đối với đào tạo tín chỉ) và không có môn học nào bị nợ hoặc thi trượt trong năm học.'
        ],
        elective: [
            'Tham gia đề tài Nghiên cứu khoa học sinh viên các cấp trường/khoa được nghiệm thu đạt từ loại Khá trở lên.',
            'Có bài báo khoa học được công bố trên các kỷ yếu hội nghị khoa học hoặc tạp chí chuyên ngành (trong nước hoặc quốc tế Scopus/WoS).',
            'Đoạt giải thưởng trong các cuộc thi học thuật, chuyên môn, Olympic các môn học, giải thưởng sinh viên nghiên cứu khoa học hoặc khởi nghiệp sáng tạo cấp trường/khoa trở lên.',
            'Là thành viên ban điều hành hoặc thành viên có đóng góp tích cực cho Câu lạc bộ học thuật, Lab nghiên cứu cấp trường/khoa có xác nhận.'
        ]
    },

    THE_LUC: {
        name: 'Thể lực tốt',
        mandatory: [
            'Đạt danh hiệu "Sinh viên khỏe" theo quy định của Trung ương Hội Sinh viên Việt Nam hoặc đạt điểm A/B môn Giáo dục thể chất trong năm học.'
        ],
        elective: [
            'Tham gia ngày chạy Olympic vì sức khỏe toàn dân, giải chạy bán marathon hoặc các giải chạy trực tuyến/trực tiếp do trường/khoa phát động.',
            'Đoạt giải Nhất, Nhì, Ba hoặc tương đương trong các hội thao, giải thi đấu thể dục thể thao do cấp trường/khoa hoặc thành phố tổ chức.',
            'Là thành viên đội tuyển thi đấu thể thao của trường/khoa, tham gia rèn luyện và thi đấu thường xuyên có xác nhận của ban huấn luyện.'
        ]
    },

    TINH_NGUYEN: {
        name: 'Tình nguyện tốt',
        mandatory: [
            'Tham gia tích cực và đủ ít nhất 2,5 ngày tình nguyện trong năm học (hoặc tối thiểu 05 hoạt động tình nguyện cấp trường/khoa).'
        ],
        elective: [
            'Tham gia hiến máu tình nguyện ít nhất 01 lần trong năm học (được cấp Giấy chứng nhận hiến máu của Viện Huyết học hoặc cơ quan y tế).',
            'Tham gia đầy đủ các chiến dịch tình nguyện cao điểm: Tiếp sức mùa thi, Chiến dịch tình nguyện Mùa hè xanh, Đông ấm vùng cao có xác nhận của Đoàn - Hội trường/khoa.',
            'Được khen thưởng, biểu dương từ cấp trường/khoa trở lên hoặc chính quyền địa phương vì đã có thành tích xuất sắc trong công tác tình nguyện xã hội.'
        ]
    },

    HOI_NHAP: {
        name: 'Hội nhập tốt',
        mandatory: [
            'Đạt chứng chỉ ngoại ngữ quốc tế tương đương TOEIC 600+, IELTS 5.5+ hoặc hoàn thành đạt chuẩn các học phần tiếng Anh theo lộ trình đào tạo của Đại học Bách khoa Hà Nội.'
        ],
        elective: [
            'Hoàn thành ít nhất 01 khóa tập huấn kỹ năng mềm, kỹ năng thực hành xã hội, kỹ năng khởi nghiệp do trường/khoa hoặc tổ chức uy tín tổ chức.',
            'Tham gia các chương trình trao đổi sinh viên quốc tế, trại hè quốc tế hoặc hội thảo học thuật bằng tiếng nước ngoài.',
            'Đoạt giải trong các cuộc thi hùng biện tiếng Anh, cuộc thi Olympic ngoại ngữ hoặc cuộc thi kỹ năng hội nhập từ cấp trường/khoa trở lên.'
        ]
    }
};