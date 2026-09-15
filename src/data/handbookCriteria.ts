export interface CriteriaBlock {
    mandatory: string[];
    note?: string;
    elective?: string[];
    priority?: string[];
}

export interface LevelData {
    title: string;
    subTitle: string;
    standards: Record<string, CriteriaBlock>;
}

export const HANDBOOK_DATA: Record<string, LevelData> = {
    // =========================================================================
    // 1. CẤP ĐẠI HỌC (CHUẨN 100% THEO 5 ẢNH BAN HÀNH CỦA ĐẠI HỌC BÁCH KHOA HÀ NỘI)
    // =========================================================================
    DAI_HOC: {
        title: 'BỘ TIÊU CHUẨN XÉT CHỌN DANH HIỆU “SINH VIÊN 5 TỐT” CẤP ĐẠI HỌC',
        subTitle: 'Áp dụng xét duyệt danh hiệu cấp Đại học Bách khoa Hà Nội năm học 2025 - 2026',
        standards: {
            DAO_DUC: {
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
                mandatory: [
                    'Tham gia ít nhất 05 ngày tình nguyện/năm (được tính theo số ngày thực tế tham gia các hoạt động tình nguyện cộng dồn).'
                ],
                note: 'Ví dụ: Sinh viên A tham gia 3 ngày tình nguyện tại mái ấm nhà mở, 1 lần hiến máu tình nguyện, 1 ngày tình nguyện Chủ nhật xanh, ở những thời điểm khác nhau trong năm sẽ được tính đủ tiêu chuẩn).',
                priority: [
                    'Được khen thưởng từ cấp Đại học trở lên về hoạt động tình nguyện.'
                ]
            },

            HOI_NHAP: {
                mandatory: [
                    'Hoàn thành ít nhất 01 khóa trang bị kỹ năng thực hành xã hội hoặc được Đoàn Thanh niên/Hội Sinh viên từ cấp Đại học trở lên khen thưởng về thành tích xuất sắc trong công tác Đoàn và phong trào thanh niên /công tác Hội và phong trào sinh viên Đại học trong năm học.',
                    'Tham gia tích cực ít nhất 01 hoạt động hội nhập có quy mô từ cấp Đại học trở lên.',
                    'Với sinh viên K70: Đạt điểm từ B trở lên với các học phần ngoại ngữ đã học trong 2 kỳ chính. Các sinh viên miễn học Tiếng Anh hoặc có TOEIC từ 350+ (hoặc các chứng chỉ quy đổi tương đương theo quy định của Bộ Giáo dục và Đào tạo) trở lên được công nhận hoàn thành tiêu chí này;',
                    'Với sinh viên K69: Đạt điểm từ B trở lên với các học phần ngoại ngữ đã học trong 2 kỳ chính. Đối với các sinh viên không học học phần tiếng Anh nào trong 2 kỳ chính, các sinh viên miễn học Tiếng Anh hoặc có TOEIC từ 400+ (hoặc các chứng chỉ quy đổi tương đương theo quy định của Bộ Giáo dục và Đào tạo) trở lên được công nhận hoàn thành tiêu chí này;',
                    'Với sinh viên K68: Đạt điểm từ B trở lên với các học phần ngoại ngữ đã học trong 2 kỳ chính. Đối với các sinh viên không học học phần tiếng Anh nào trong 2 kỳ chính, các sinh viên miễn học Tiếng Anh hoặc có TOEIC từ 450+ (hoặc các chứng chỉ quy đổi tương đương theo quy định của Bộ Giáo dục và Đào tạo) trở lên được công nhận hoàn thành tiêu chí này;',
                    'Với sinh viên K67: Đạt điểm từ B trở lên với các học phần ngoại ngữ đã học trong 2 kỳ chính. Đối với các sinh viên không học học phần tiếng Anh nào trong 2 kỳ chính, các sinh viên miễn học Tiếng Anh hoặc có TOEIC từ 500+ (hoặc các chứng chỉ quy đổi tương đương theo quy định của Bộ Giáo dục và Đào tạo) trở lên được công nhận hoàn thành tiêu chí này;',
                    'Đối với sinh viên các chương trình đào tạo thuộc khoa Ngoại ngữ, đạt điểm từ B trở lên đối với các học phần Ngoại ngữ 2 đã học trong 2 kỳ chính.'
                ],
                elective: [
                    'Tham gia ít nhất một hoạt động giao lưu quốc tế: Hội nghị, Hội thảo quốc tế, các chương trình gặp gỡ, giao lưu, hợp tác với thanh niên, sinh viên quốc tế trong và ngoài nước.',
                    'Tham gia các cuộc thi về kiến thức Hội nhập hoặc có sử dụng Ngoại ngữ từ cấp trường/khoa trở lên tổ chức.'
                ],
                priority: [
                    'Là thành viên Ban tổ chức hoặc cộng tác viên tổ chức ít nhất 02 hoạt động, sự kiện có quy mô cấp Đại học trở lên.'
                ]
            }
        }
    },

    // =========================================================================
    // 2. CẤP THÀNH PHỐ (QUY CHUẨN HỘI SINH VIÊN TP. HÀ NỘI)
    // =========================================================================
    THANH_PHO: {
        title: 'BỘ TIÊU CHUẨN XÉT CHỌN DANH HIỆU “SINH VIÊN 5 TỐT” CẤP THÀNH PHỐ',
        subTitle: 'Quy chuẩn xét duyệt danh hiệu cấp Thành phố Hà Nội năm học 2025 - 2026',
        standards: {
            DAO_DUC: {
                mandatory: [
                    'Điểm rèn luyện trung bình cả năm học đạt từ 85 điểm trở lên.',
                    'Không vi phạm pháp luật, nội quy, quy chế của Đại học, địa phương và nơi cư trú.'
                ],
                elective: [
                    'Đoạt giải trong các cuộc thi tìm hiểu chủ nghĩa Mác – Lênin, tư tưởng Hồ Chí Minh cấp Thành phố trở lên.',
                    'Là Đảng viên Đảng Cộng sản Việt Nam được đánh giá hoàn thành tốt nhiệm vụ trở lên trong năm học.',
                    'Đạt danh hiệu Thanh niên tiên tiến làm theo lời Bác hoặc Gương người tốt việc tốt cấp Thành phố trở lên.',
                    'Được Thành đoàn - Hội Sinh viên Thành phố khen thưởng về công tác Đoàn và phong trào thanh niên/sinh viên.'
                ]
            },
            HOC_TAP: {
                mandatory: [
                    'Đối với sinh viên Đại học: Điểm trung bình học tập cả năm đạt từ 3.2/4.0 trở lên.',
                    'Đối với sinh viên là cán bộ Đoàn - Hội (từ Bí thư Chi đoàn, Chi hội trưởng trở lên): Điểm trung bình học tập năm học đạt từ 3.0/4.0 trở lên.'
                ],
                elective: [
                    'Tham gia đề tài Nghiên cứu khoa học sinh viên cấp Thành phố hoặc cấp Bộ nghiệm thu đạt loại Khá trở lên.',
                    'Có bài báo khoa học đăng trên kỷ yếu hội thảo khoa học cấp quốc gia hoặc tạp chí chuyên ngành.',
                    'Đoạt giải trong các kỳ thi Olympic môn học hoặc cuộc thi học thuật, sáng tạo kỹ thuật cấp Thành phố trở lên.'
                ]
            },
            THE_LUC: {
                mandatory: [
                    'Đạt danh hiệu “Sinh viên khỏe” cấp Thành phố hoặc cấp Đại học theo quy định hiện hành.'
                ],
                elective: [
                    'Đoạt giải trong các hội thao, giải thi đấu thể dục thể thao cấp Thành phố trở lên.',
                    'Là thành viên đội tuyển thể thao tham gia thi đấu các giải đấu cấp Thành phố hoặc cấp quốc gia.'
                ]
            },
            TINH_NGUYEN: {
                mandatory: [
                    'Tham gia tích cực các chiến dịch tình nguyện cao điểm, đạt tối thiểu 05 ngày tình nguyện cộng dồn trong năm học.',
                    'Tham gia hiến máu tình nguyện ít nhất 01 lần trong năm học (hoặc vận động được ít nhất 03 người cùng hiến máu).'
                ],
                priority: [
                    'Được Ban Chấp hành Thành đoàn hoặc Hội Sinh viên Thành phố tặng Bằng khen/Giấy khen về hoạt động tình nguyện vì cộng đồng.'
                ]
            },
            HOI_NHAP: {
                mandatory: [
                    'Đạt chứng chỉ tiếng Anh tương đương TOEIC 785+, IELTS 5.5+ trở lên (hoặc các chứng chỉ ngoại ngữ quốc tế tương đương).',
                    'Hoàn thành ít nhất 01 khóa bồi dưỡng, tập huấn kỹ năng hội nhập, kỹ năng thực hành xã hội cấp Thành phố trở lên.'
                ],
                elective: [
                    'Tham gia các chương trình giao lưu thanh niên, sinh viên quốc tế do Thành phố hoặc Trung ương tổ chức.',
                    'Đoạt giải trong các cuộc thi hùng biện tiếng Anh, Olympic ngoại ngữ từ cấp Thành phố trở lên.'
                ]
            }
        }
    },

    // =========================================================================
    // 3. CẤP TRUNG ƯƠNG (QUY CHUẨN TRUNG ƯƠNG HỘI SINH VIÊN VIỆT NAM)
    // =========================================================================
    TRUNG_UONG: {
        title: 'BỘ TIÊU CHUẨN XÉT CHỌN DANH HIỆU “SINH VIÊN 5 TỐT” CẤP TRUNG ƯƠNG',
        subTitle: 'Quy chế xét chọn danh hiệu Sinh viên 5 tốt cấp Trung ương - Trung ương Hội Sinh viên Việt Nam',
        standards: {
            DAO_DUC: {
                mandatory: [
                    'Điểm rèn luyện trung bình năm học đạt từ 90 điểm trở lên (trên thang điểm 100).',
                    'Tuyệt đối không vi phạm pháp luật, nội quy nhà trường và quy định của cộng đồng.'
                ],
                elective: [
                    'Là Đảng viên Đảng Cộng sản Việt Nam được đánh giá xếp loại Hoàn thành xuất sắc nhiệm vụ.',
                    'Được tuyên dương danh hiệu Thanh niên tiên tiến làm theo lời Bác toàn quốc hoặc Bằng khen Trung ương Đoàn/Trung ương Hội.',
                    'Đoạt giải trong các cuộc thi tìm hiểu lịch sử, Mác – Lênin, tư tưởng Hồ Chí Minh cấp toàn quốc.'
                ]
            },
            HOC_TAP: {
                mandatory: [
                    'Đối với sinh viên Đại học: Điểm trung bình học tập năm học đạt từ 3.4/4.0 trở lên (hoặc 8.5/10).',
                    'Đối với sinh viên có đề tài NCKH đạt giải cấp Bộ hoặc bài báo quốc tế: Điểm trung bình học tập đạt từ 3.2/4.0 trở lên.'
                ],
                elective: [
                    'Có đề tài Nghiên cứu khoa học sinh viên đạt giải Nhất, Nhì, Ba cấp Bộ hoặc Giải thưởng Sinh viên nghiên cứu khoa học Euréka.',
                    'Có ít nhất 01 bài báo khoa học đăng trên tạp chí quốc tế uy tín thuộc danh mục Scopus hoặc Web of Science (WoS).',
                    'Đoạt giải Nhất, Nhì, Ba trong các kỳ thi Olympic sinh viên toàn quốc hoặc cuộc thi sáng tạo, khởi nghiệp cấp quốc gia/quốc tế.'
                ]
            },
            THE_LUC: {
                mandatory: [
                    'Đạt danh hiệu “Sinh viên khỏe” cấp Tỉnh/Thành phố hoặc cấp Trung ương.'
                ],
                elective: [
                    'Đoạt huy chương tại các Đại hội thể thao, giải vô địch thể thao cấp quốc gia hoặc quốc tế.',
                    'Là vận động viên thể thao được công nhận cấp kiện tướng hoặc cấp 1 quốc gia.'
                ]
            },
            TINH_NGUYEN: {
                mandatory: [
                    'Tham gia thường xuyên các hoạt động tình nguyện xã hội, đạt từ 05 ngày tình nguyện cộng dồn trở lên trong năm.',
                    'Có hành động dũng cảm cứu người hoặc tham gia hiến máu tình nguyện tích cực có xác nhận.'
                ],
                priority: [
                    'Được Ban Chấp hành Trung ương Đoàn hoặc Ban Thư ký Trung ương Hội Sinh viên Việt Nam tặng Bằng khen về hoạt động tình nguyện vì cộng đồng.'
                ]
            },
            HOI_NHAP: {
                mandatory: [
                    'Đạt chứng chỉ ngoại ngữ quốc tế tương đương TOEIC 700+, IELTS 6.5+, TOEFL iBT 79+ trở lên.'
                ],
                elective: [
                    'Đại diện thanh niên, sinh viên Việt Nam tham gia các hội nghị, diễn đàn giao lưu thanh niên quốc tế chính thức.',
                    'Đoạt giải trong các cuộc thi tiếng Anh, Olympic ngoại ngữ hoặc cuộc thi tranh biện quy mô toàn quốc/quốc tế.'
                ]
            }
        }
    }
};