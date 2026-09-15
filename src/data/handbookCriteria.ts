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
        subTitle: 'Tất cả các thành tích xét trao danh hiệu cấp TP được tính từ ngày 01/8 năm trước tới 31/7 năm xét danh hiệu.',
        standards: {
            DAO_DUC: {
                mandatory: [
                    'Điểm rèn luyện trung bình cả năm học đạt từ 85 điểm trở lên.',
                    'Không vi phạm pháp luật, nội quy, quy chế của Đại học, địa phương và cộng đồng.'
                ],
                elective: [
                    'Là thanh niên tiêu biểu, thanh niên tiên tiến làm theo lời Bác; gương người tốt, việc tốt; gương thanh niên, sinh viên sống đẹp; gương có hành động dũng cảm cứu người... được cấp ĐH, phường, xã trở lên được biểu dương, ghi nhận.',
                    'Là Đảng viên Đảng Cộng sản Việt Nam, đánh giá xếp loại Đảng viên hoàn thành tốt nhiệm vụ trở lên.',
                    'Tham gia các cuộc thi về Đảng, Đoàn - Hội do Trung ương, Thành phố tổ chức và phát động.',
                    'Đạt giải tại các cuộc thi về Đảng, Đoàn - Hội cấp ĐH, phường, xã tổ chức và phát động.',
                ]
            },
            HOC_TAP: {
                mandatory: [
                    'Đối với sinh viên Đại học: Điểm trung bình chung học tập cả năm học đạt từ 3.2/4.0 trở lên.',
                ],
                elective: [
                    'Có đề tài NCKH, sinh viên đạt giải cấp ĐH trở lên (không áp dụng đối với luận văn tốt nghiệp.',
                    'Có bài tham luận tại hội thảo khoa học hoặc tạp chí chuyên ngành của trường.',
                    'Có sản phẩm sáng tạo được cấp bằng sáng chế, cấp giấy phép xuất bản hoặc đạt giải thưởng trong các cuộc thi ý tưởng sáng tạo từ cấp ĐH trở lên.',
                    'Là thành viên các đội tuyển tham gia các kỳ thi học thuật cấp khu vực, cấp quốc gia, quốc tế.',
                    'Đạt giải thưởng trong các cuộc thi ý tưởng sáng tạo từ cấp ĐH trở lên.'
                ]
            },
            THE_LUC: {
                mandatory: [
                    'Hoàn thành chương trình đào tạo Giáo dục thể chất theo quy định tại Đại học Bách khoa Hà Nội (hoàn thành đủ 05 học phần GDTC).',
                    'Không có điểm F nào trong tất cả các học phần Giáo dục thể chất đã học trong 02 học kỳ chính trong năm học (Với sinh viên chưa học đủ 05 học phần GDTC).'
                ],
                elective: [
                    'Tham gia các hoạt động sát hạch thể lực và đạt giấy chứng nhận "Sinh viên khỏe" từ cấp ĐH trở lên.',
                    'Tham gia và đạt giải tại các hoạt động thể thao phong trào tại địa phương hoặc từ cấp ĐH trở lên tổ chức.'
                ]
            },
            TINH_NGUYEN: {
                mandatory: [
                    'Tham gia ít nhất 05 ngày tình nguyện/ năm (được tính theo số ngày thực tế tham gia các hoạt động tình nguyện cộng đồng).'
                ],
                note: 'Ví dụ: Sinh viên A tham gia 3 ngày tình nguyện tại mái ấm nhà mở, 1 lần hiến máu tình nguyện, 1 ngày tình nguyện Chủ nhật xanh, ở những thời điểm khác nhau trong năm sẽ được tính đủ tiêu chuẩn).',
                priority: [
                    'Đạt huy hiệu "Chiến sỹ tình nguyện Thủ đô.',
                    'Được khen thưởng cấp ĐH, phường, xã trở lên về hoạt động tình nguyện.'
                ]
            },
            HOI_NHAP: {
                mandatory: [
                    'Đạt chứng chỉ tiếng Anh trình độ B2 (theo khung tham chiếu châu Âu) hoặc tương đương B2 hoặc chứng chỉ ngoại ngữ khác ở trình độ tương đương trở lên; hoặc tổng điểm các học phần ngoại ngữ (trừ môn ngoại ngữ chuyên ngành) tích lũy từ năm nhất tới thời điểm xét đạt từ 3.4/4.0 trở lên.',
                    'Tham gia ít nhất 01 hoạt động giao lưu quốc tế: Hội nghị, hội thảo quốc tế, các chương trình gặp gỡ, giao lưu, hợp tác với thanh niên, sinh viên quốc tế trong và ngoài nước.'
                ],
                elective: [
                    'Là thành viên ban chủ nhiệm các câu lạc bộ, đội, nhóm ngoại ngữ tại các cơ sở giáo dục, địa bàn dân cư, thường xuyên tổ chức các hoạt động giao lưu, trao đổi nâng cao năng lực ngoại ngữ và hội nhập quốc tế.',
                    'Tham gia các cuộc thi về kiến thức hội nhập hoặc có sử dụng Ngoại ngữ từ cấp ĐH trở lên tổ chức.',
                    'Là thành viên đội thi cấp ĐH tham gia các cuộc thi về ngoại ngữ do Trung ương và Thành phố tổ chức.',
                    'Đạt chứng chỉ tương đương với trình độ B1 theo khung chiếu châu Âu đối với ít nhất 02 ngoại ngữ khác nhau trở lên. Riêng đối với chứng chỉ tiếng Anh, cần đạt trình độ B2 hoặc tương đương B2 trở lên.'
                ],
                note: 'Việc quy đổi giá trị tương đương của các chứng chỉ ngoại ngữ khác nhau căn cứ theo Thông tư số 01/2014/TT-BGDĐT và Thông tư số 23/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo.'
            }
        }
    },

    // =========================================================================
    // 3. CẤP TRUNG ƯƠNG (QUY CHUẨN TRUNG ƯƠNG HỘI SINH VIÊN VIỆT NAM)
    // =========================================================================
    TRUNG_UONG: {
        title: 'BỘ TIÊU CHUẨN XÉT CHỌN DANH HIỆU “SINH VIÊN 5 TỐT” CẤP TRUNG ƯƠNG',
        subTitle: 'Hồ sơ đạt danh hiệu cấp TW trong nước cần phải đạt đồng thời tất cả các tiêu chí bắt buộc của 05 tiêu chuẩn và đạt từ 02 tiêu chí đạt thêm trở lên.',
        standards: {
            DAO_DUC: {
                mandatory: [
                    'Điểm rèn luyện đạt từ 95 điểm trở lên (trên thang điểm 100 theo quy chế đánh giá kết quả rèn luyện sinh viên hiện hành của Bộ Giáo dục và Đào tạo).',
                    'Không vi phạm pháp luật và các quy chế, nội quy của nhà trường, quy định của địa phương và cộng đồng.'
                ],
                elective: [
                    'Là thanh niên tiêu biểu, thanh niên tiên tiến làm theo lời Bác; gương người tốt, việc tốt; gương thanh niên, sinh viên sống đẹp; gương có hành động dũng cảm cứu người... được cấp tỉnh, thành phố trở lên biểu dương, ghi nhận.',
                    'Đạt xếp loại "Đảng viên hoàn thành xuất sắc nhiệm vụ" trong năm gần nhất (áp dụng đối với sinh viên là Đảng viên chính thức của Đảng Cộng sản Việt Nam).'
                ]
            },
            HOC_TAP: {
                mandatory: [
                    'Đối với sinh viên Đại học: Điểm trung bình chung học tập cả năm học đạt từ 3.4/4.0 trở lên.'
                ],
                elective: [
                    'Có đề tài NCKH (không áp dụng đối với luận văn tốt nghiệp) đạt giải từ cấp tỉnh, thành phố trở lên.',
                    'Tác giả bài viết đăng trên tạp chí khoa học quốc tế uy tín, có mã số chuẩn quốc tế ISSN trong danh mục WoS/Scopus (Q1, Q2). Tác giả chính bài viết đăng trên tạp chí khoa học quốc tế uy tín, có mã số chuẩn quốc tế ISSN trong danh mục WoS/Scopus (Q3, Q4).',
                    'Có sản phẩm sáng tạo được cấp bằng sáng chế, cấp giấy phép xuất bản hoặc được các giải thưởng từ cấp tỉnh trở lên.',
                    'Đạt giải Ba trở lên trong các cuộc thi về học thuật, khoa học kỹ thuật, ý tưởng sáng tạo khởi nghiệp... cấp quốc gia, quốc tế.'
                ]
            },
            THE_LUC: {
                mandatory: [
                    'Tham gia và đạt giải các hoạt động thể thao cấp ĐH trở lên hoặc tham gia các hoạt động thể thao cấp TW.'
                ],
                elective: [
                    'Tham gia và đạt giải Ba trở lên trong các hoạt động thể thao từ cấp tỉnh trở lên.'
                ],
                note: 'Đối với sinh viên gặp khó khăn trong học tập do mắc bệnh mãn tính, bị khuyết tật, bị tai nạn hoặc hoặc bị bệnh phải điều trị được miễn học phần thực hành môn GDTC, GDQP-AN cần có xác nhận của Nhà trường để được miễn xét tiêu chí Thể lực tốt.'
            },
            TINH_NGUYEN: {
                mandatory: [
                    'Tham gia ít nhất 05 ngày tình nguyện/năm (được tính theo số ngày thực tế tham gia các hoạt động tình nguyện cộng dồn).'
                ],
                elective: [
                    'Là người sáng lập hoặc đồng sáng lập các dự án tình nguyện đem lại kết quả thiết thực đối với tổ chức, đơn vị được thụ hưởng và được nhận xét, đánh giá giới thiệu từ tổ chức, đơn vị thụ hưởng.',
                    'Được khen thưởng từ cấp tỉnh trở lên về hoạt động tình nguyện.'
                ]
            },
            HOI_NHAP: {
                mandatory: [
                    'Đạt chứng chỉ tiếng Anh trình độ B2 (theo khung tham chiếu châu Âu) hoặc tương đương B2 hoặc chứng chỉ ngoại ngữ khác ở trình độ tương đương trở lên; hoặc tổng điểm các học phần ngoại ngữ (trừ môn ngoại ngữ chuyên ngành) tích lũy từ năm nhất tới thời điểm xét đạt từ 3.4/4.0 trở lên.',
                    'Tham gia ít nhất 01 hoạt động giao lưu quốc tế: Hội nghị, hội thảo quốc tế, các chương trình gặp gỡ, giao lưu, hợp tác với thanh niên, sinh viên quốc tế trong và ngoài nước.'
                ],
                elective: [
                    'Là thành viên ban chủ nhiệm các câu lạc bộ, đội, nhóm ngoại ngữ tại các cơ sở giáo dục, địa bàn dân cư, thường xuyên tổ chức các hoạt động giao lưu, trao đổi nâng cao năng lực ngoại ngữ và hội nhập quốc tế.',
                    'Đạt giải Ba trở lên tại các cuộc thi về kiến thức hội nhập hoặc các cuộc thi học thuật bằng ngoại ngữ từ cấp tỉnh trở lên.',
                    'Đạt chứng chỉ tương đương với trình độ B1 theo khung chiếu châu Âu đối với ít nhất 02 ngoại ngữ khác nhau trở lên. Riêng đối với chứng chỉ tiếng Anh, cần đạt trình độ B2 hoặc tương đương B2 trở lên.'
                ],
                note: 'Việc quy đổi giá trị tương đương của các chứng chỉ ngoại ngữ khác nhau căn cứ theo Thông tư số 01/2014/TT-BGDĐT và Thông tư số 23/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo.'
            }
        }
    }
};