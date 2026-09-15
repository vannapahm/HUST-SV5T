export interface HandbookStandard {
    name: string;
    mandatory: string[];
    note?: string;          // Ví dụ hoặc ghi chú hướng dẫn
    elective?: string[];    // Đạt thêm 01 tiêu chí trong các tiêu chí sau
    priority?: string[];    // Tiêu chí ưu tiên
}

export const HANDBOOK_CRITERIA: Record<string, HandbookStandard> = {
    DAO_DUC: {
        name: 'Đạo đức tốt',
        mandatory: [
            'Điểm rèn luyện trung bình 02 học kỳ chính đạt từ 80 điểm trở lên (trên thang điểm 100 theo quy chế đánh giá kết quả rèn luyện sinh viên hiện hành của Bộ Giáo dục và Đào tạo, Bộ Lao động - Thương binh và Xã hội)',
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
            'Đối với sinh viên Đại học: Điểm trung bình học tập 02 học kỳ chính đạt từ 2.8/4.0 trở lên, bắt buộc đạt thêm 01 hoạt động trong các tiêu chí phụ.',
            'Đối với sinh viên là cán bộ Đoàn Thanh niên, Hội Sinh viên, đang giữ chức vụ từ Ủy viên Ban Chấp hành Chi đoàn, Chi hội trở lên: Điểm trung bình học tập 02 học kỳ chính học đạt từ 2.5/4.0 trở lên, bắt buộc đạt thêm 01 hoạt động trong các tiêu chí phụ.',
            'Đối với sinh viên trường Cao đẳng Nghề: Điểm trung bình học tập cả năm học đạt từ 6,0/10 trở lên, ưu tiên tiêu chí phụ.',
            'Đối với sinh viên diện chương trình trao đổi sinh viên trong 01 học kỳ hoặc 02 kỳ học chính: Điểm trung bình học tập 02 học kỳ chính đạt từ 2.8/4.0 trở lên, cần làm đơn trình lên Ban Thư ký Hội Sinh viên Đại học phê duyệt, bắt buộc đạt thêm 01 hoạt động trong các tiêu chí phụ.'
        ],
        elective: [
            'Là thành viên tham gia tích cực mảng/ban Chuyên môn/Nội dung của CLB học thuật cấp Đoàn Thanh niên, Hội Sinh viên trường/Liên chi đoàn, Liên chi hội sinh viên khoa trở lên được Ban Thư ký Hội Sinh viên Đại học công nhận.',
            'Tham gia đề tài nghiên cứu khoa học sinh viên.',
            'Tham gia kỳ thi, cuộc thi học thuật có quy mô từ cấp Đại học trở lên.',
            'Tham gia nhóm nghiên cứu khoa học cấp trường/khoa trở lên.',
            'Có bài tham luận tại hội thảo khoa học hoặc tạp chí chuyên ngành.',
            'Có sản phẩm sáng tạo được cấp bằng sáng chế, cấp giấy phép xuất bản hoặc đạt giải thưởng trong các cuộc thi ý tưởng sáng tạo có quy mô từ cấp Đại học trở lên.'
        ]
    },

    THE_LUC: {
        name: 'Thể lực tốt',
        mandatory: [
            'Hoàn thành chương trình đào tạo Giáo dục thể chất theo quy định tại Đại học Bách khoa Hà Nội (hoàn thành đủ 05 học phần GDTC).',
            'Không có điểm F nào trong tất cả các học phần Giáo dục thể chất đã học trong 02 học kỳ chính trong năm học (Với sinh viên chưa học đủ 05 học phần GDTC).'
        ],
        elective: [
            'Tham gia các hoạt động sát hạch thể lực và đạt danh hiệu “Sinh viên khỏe”, “Thanh niên khỏe” từ cấp Đại học trở lên.',
            'Tham gia và đạt giải trong các hoạt động về thể thao từ cấp Đoàn Thanh niên - Hội Sinh viên trường/Liên chi đoàn – Liên chi hội sinh viên khoa trở lên được Hội Sinh viên Đại học công nhận.',
            'Là thành viên đội tuyển thể thao cấp Đại học trở lên.',
            'Là thành viên tích cực của 01 Câu lạc bộ thể thao cấp Đại học.',
            'Tham gia ít nhất 02 hoạt động thể dục thể thao có quy mô từ cấp Đại học trở lên.'
        ]
    },

    TINH_NGUYEN: {
        name: 'Tình nguyện tốt',
        mandatory: [
            'Tham gia ít nhất 05 ngày tình nguyện/năm (được tính theo số ngày thực tế tham gia các hoạt động tình nguyện cộng dồn).'
        ],
        note: 'Ví dụ: Sinh viên A tham gia 3 ngày tình nguyện tại mái ấm nhà mở, 1 lần hiến máu tình nguyện, 1 ngày tình nguyện Chủ nhật xanh, ở những thời điểm khác nhau trong năm sẽ được tính đủ tiêu chuẩn.',
        priority: [
            'Được khen thưởng từ cấp Đại học trở lên về hoạt động tình nguyện.'
        ]
    },

    HOI_NHAP: {
        name: 'Hội nhập tốt',
        mandatory: [
            'Hoàn thành ít nhất 01 khóa trang bị kỹ năng thực hành xã hội hoặc được Đoàn Thanh niên/Hội Sinh viên từ cấp Đại học trở lên khen thưởng về thành tích xuất sắc trong công tác Đoàn và phong trào thanh niên /công tác Hội và phong trào sinh viên Đại học trong năm học.',
            'Tham gia tích cực ít nhất 01 hoạt động hội nhập có quy mô từ cấp Đại học trở lên.',
            'Đạt trình độ ngoại ngữ theo tiến độ của chương trình đào tạo của Đại học:\n• K70: Điểm từ B trở lên với các học phần ngoại ngữ trong 2 kỳ chính (hoặc miễn TA / TOEIC từ 350+ trở lên);\n• K69: Điểm từ B trở lên các học phần ngoại ngữ (hoặc miễn TA / TOEIC từ 400+ trở lên);\n• K68: Điểm từ B trở lên các học phần ngoại ngữ (hoặc miễn TA / TOEIC từ 450+ trở lên);\n• K67: Điểm từ B trở lên các học phần ngoại ngữ (hoặc miễn TA / TOEIC từ 500+ trở lên);\n• Sinh viên các CTĐT thuộc khoa Ngoại ngữ: Điểm từ B trở lên đối với các học phần Ngoại ngữ 2 trong 2 kỳ chính.'
        ],
        elective: [
            'Tham gia ít nhất một hoạt động giao lưu quốc tế: Hội nghị, Hội thảo quốc tế, các chương trình gặp gỡ, giao lưu, hợp tác với thanh niên, sinh viên quốc tế trong và ngoài nước.',
            'Tham gia các cuộc thi về kiến thức Hội nhập hoặc có sử dụng Ngoại ngữ từ cấp trường/khoa trở lên tổ chức.'
        ],
        priority: [
            'Là thành viên Ban tổ chức hoặc cộng tác viên tổ chức ít nhất 02 hoạt động, sự kiện có quy mô cấp Đại học trở lên.'
        ]
    }
};