export interface CriterionOption {
    full: string;
    display: string;
}

export const CRITERIA_TREE: Record<string, { name: string; items: CriterionOption[] }> = {
    DAO_DUC: {
        name: 'Đạo đức tốt',
        items: [
            {
                full: 'Tham gia các cuộc thi, diễn đàn học thuật tìm hiểu về chủ nghĩa Mác-Lênin, tư tưởng Hồ Chí Minh.',
                display: 'Tham gia các cuộc thi, diễn đàn học thuật tìm hiểu về chủ nghĩa Mác-Lênin, tư tưởng Hồ Chí Minh.',
            },
            {
                full: 'Là thanh niên tiêu biểu, thanh niên tiên tiến làm theo lời Bác; gương người tốt, việc tốt; gương thanh niên, sinh viên sống đẹp, gương có hành động dũng cảm cứu người,… được cấp trường, phường, xã trở lên biểu dương, ghi nhận.',
                display: 'Là thanh niên tiêu biểu... được cấp trường, phường, xã trở lên biểu dương, ghi nhận.',
            },
            {
                full: 'Là thanh niên tiêu biểu; thanh niên tiên tiến làm theo lời Bác; gương người tốt, việc tốt; gương thanh niên, sinh viên sống đẹp, gương có hành động dũng cảm cứu người,… được tỉnh, thành phố trở lên biểu dương, ghi nhận.',
                display: 'Là thanh niên tiêu biểu... được tỉnh, thành phố trở lên biểu dương, ghi nhận.',
            },
            {
                full: 'Tham gia các cuộc thi về Đảng, Đoàn - Hội do Trung ương, Thành phố tổ chức và phát động.',
                display: 'Tham gia các cuộc thi về Đảng, Đoàn - Hội do Trung ương, Thành phố tổ chức và phát động.',
            },
            {
                full: 'Tham gia tích cực các cuộc thi về Đảng, Đoàn - Hội do cấp Đại học trở lên tổ chức, phát động hoặc công nhận.',
                display: 'Tham gia tích cực các cuộc thi về Đảng, Đoàn - Hội do cấp Đại học trở lên tổ chức, phát động hoặc công nhận.',
            },
            {
                full: 'Đạt giải tại các cuộc thi về Đảng, Đoàn - Hội cấp trường, phường, xã tổ chức và phát động.',
                display: 'Đạt giải tại các cuộc thi về Đảng, Đoàn - Hội cấp trường, phường, xã tổ chức và phát động.',
            },
        ],
    },
    HOC_TAP: {
        name: 'Học tập tốt',
        items: [
            {
                full: 'Có bài tham luận tại hội thảo khoa học hoặc tạp chí chuyên ngành của trường.',
                display: 'Có bài tham luận tại hội thảo khoa học hoặc tạp chí chuyên ngành của trường.',
            },
            {
                full: 'Có bài tham luận tại hội thảo khoa học hoặc tạp chí chuyên ngành.',
                display: 'Có bài tham luận tại hội thảo khoa học hoặc tạp chí chuyên ngành.',
            },
            {
                full: 'Tác giả bài viết đăng trên tạp chí khoa học quốc tế uy tín, có mã số chuẩn quốc tế ISSN trong danh mục WoS/Scopus (Q1, Q2). Tác giả chính bài viết đăng trên tạp chí khoa học quốc tế uy tín, có mã số chuẩn quốc tế ISSN trong danh mục WoS/Scopus (Q3, Q4).',
                display: 'Tác giả bài viết đăng tạp chí quốc tế uy tín... danh mục WoS/Scopus (Q1, Q2, Q3, Q4).',
            },
            {
                full: 'Tham gia kỳ thi, cuộc thi học thuật cấp Đại học trở lên.',
                display: 'Tham gia kỳ thi, cuộc thi học thuật cấp Đại học trở lên.',
            },
            {
                full: 'Có sản phẩm sáng tạo được cấp bằng sáng chế, cấp giấy phép xuất bản hoặc đạt giải thưởng trong các cuộc thi ý tưởng sáng tạo từ cấp Đại học trở lên.',
                display: 'Có sản phẩm sáng tạo... đạt giải thưởng trong các cuộc thi ý tưởng sáng tạo từ cấp ĐH trở lên.',
            },
            {
                full: 'Có sản phẩm sáng tạo được cấp bằng sáng chế, cấp giấy phép xuất bản hoặc được các giải thưởng từ cấp tỉnh trở lên.',
                display: 'Có sản phẩm sáng tạo... được các giải thưởng từ cấp tỉnh trở lên.',
            },
            {
                full: 'Là thành viên các đội tuyển tham gia các kỳ thi học thuật cấp khu vực, cấp quốc gia, quốc tế.',
                display: 'Là thành viên các đội tuyển tham gia các kỳ thi học thuật cấp khu vực, cấp quốc gia, quốc tế.',
            },
            {
                full: 'Đạt giải Ba trở lên trong các cuộc thi về học thuật, khoa học kỹ thuật, ý tưởng sáng tạo khởi nghiệp cấp quốc gia, quốc tế.',
                display: 'Đạt giải Ba trở lên trong các cuộc thi về học thuật, khoa học kỹ thuật, ý tưởng sáng tạo khởi nghiệp cấp quốc gia, quốc tế.',
            },
            {
                full: 'Đạt giải thưởng trong các cuộc thi ý tưởng sáng tạo từ cấp trường trở lên.',
                display: 'Đạt giải thưởng trong các cuộc thi ý tưởng sáng tạo từ cấp trường trở lên.',
            },
        ],
    },
    THE_LUC: {
        name: 'Thể lực tốt',
        items: [
            {
                full: 'Tham gia và đạt giải các hoạt động thể thao cấp ĐH trở lên hoặc tham gia các hoạt động thể thao cấp Trung ương.',
                display: 'Tham gia và đạt giải các hoạt động thể thao cấp ĐH trở lên hoặc tham gia các hoạt động thể thao cấp TW.',
            },
            {
                full: 'Tham gia các hoạt động sát hạch thể lực và đạt danh hiệu “Sinh viên khỏe”, “Thanh niên khỏe” từ cấp Đại học trở lên.',
                display: 'Tham gia các hoạt động sát hạch thể lực và đạt danh hiệu “Sinh viên khỏe”, “Thanh niên khỏe” từ cấp Đại học trở lên.',
            },
            {
                full: 'Tham gia các hoạt động sát hạch thể lực và đạt danh hiệu “Sinh viên khỏe” từ cấp trường trở lên.',
                display: 'Tham gia các hoạt động sát hạch thể lực và đạt danh hiệu “Sinh viên khỏe” từ cấp trường trở lên.',
            },
            {
                full: 'Tham gia và đạt giải Ba trở lên trong các hoạt động thể thao từ cấp tỉnh trở lên.',
                display: 'Tham gia và đạt giải Ba trở lên trong các hoạt động thể thao từ cấp tỉnh trở lên.',
            },
            {
                full: 'Tham gia và đạt giải trong các hoạt động về thể thao từ cấp Đoàn Thanh niên - Hội Sinh viên Trường/ Liên chi đoàn – Liên chi hội Sinh viên Khoa trở lên được Hội Sinh viên Đại học công nhận.',
                display: 'Tham gia và đạt giải thể thao từ cấp ĐTN - HSV Trường/ LCĐ - LCHSV Khoa trở lên... được HSV Đại học công nhận.',
            },
            {
                full: 'Tham gia và đạt giải tại các hoạt động thể thao phong trào tại địa phương hoặc từ cấp trường trở lên tổ chức.',
                display: 'Tham gia và đạt giải tại các hoạt động thể thao phong trào tại địa phương hoặc từ cấp trường trở lên tổ chức.',
            },
            {
                full: 'Tham gia ít nhất 02 hoạt động thể dục thể thao từ cấp Đại học trở lên.',
                display: 'Tham gia ít nhất 02 hoạt động thể dục thể thao từ cấp Đại học trở lên.',
            },
        ],
    },
    TINH_NGUYEN: {
        name: 'Tình nguyện tốt',
        items: [
            {
                full: 'Tham gia ít nhất 05 ngày tình nguyện/năm (được tính theo số ngày thực tế tham gia các hoạt động tình nguyện cộng dồn. Ví dụ: sinh viên A tham gia 3 ngày tình nguyện tại mái ấm nhà mở, 1 lần hiến máu tình nguyện, 1 ngày tình nguyện Chủ nhật xanh, ở những thời điểm khác nhau trong năm sẽ được tính đủ tiêu chuẩn).',
                display: 'Tham gia ít nhất 05 ngày tình nguyện/năm... (tính theo số ngày thực tế cộng dồn).',
            },
            {
                full: 'Được khen thưởng từ cấp ĐH trở lên về hoạt động tình nguyện.',
                display: 'Được khen thưởng từ cấp ĐH trở lên về hoạt động tình nguyện.',
            },
            {
                full: 'Được khen thưởng cấp trường, phường, xã trở lên về hoạt động tình nguyện.',
                display: 'Được khen thưởng cấp trường, phường, xã trở lên về hoạt động tình nguyện.',
            },
            {
                full: 'Được khen thưởng từ cấp tỉnh trở lên về hoạt động tình nguyện.',
                display: 'Được khen thưởng từ cấp tỉnh trở lên về hoạt động tình nguyện.',
            },
            {
                full: 'Đạt huy hiệu "Chiến sỹ tình nguyện Thủ đô".',
                display: 'Đạt huy hiệu "Chiến sỹ tình nguyện Thủ đô".',
            },
            {
                full: 'Là người sáng lập hoặc đồng sáng lập các dự án tình nguyện đem lại kết quả thiết thực đối với tổ chức, đơn vị được thụ hưởng và nhận xét, đánh giá giới thiệu từ tổ chức, đơn vị thụ hưởng.',
                display: 'Là người sáng lập hoặc đồng sáng lập các dự án tình nguyện... có nhận xét, đánh giá từ đơn vị thụ hưởng.',
            },
        ],
    },
    HOI_NHAP: {
        name: 'Hội nhập tốt',
        items: [
            {
                full: 'Hoàn thành ít nhất 01 khóa trang bị kỹ năng thực hành xã hội hoặc được Đoàn Thanh niên/ Hội Sinh viên từ cấp Đại học trở lên khen thưởng về thành tích xuất sắc trong công tác Đoàn và phong trào thanh niên/ công tác Hội và phong trào sinh viên Đại học trong năm học.',
                display: 'Hoàn thành ít nhất 01 khóa kỹ năng thực hành xã hội hoặc được ĐTN/HSV cấp ĐH trở lên khen thưởng.',
            },
            {
                full: 'Tham gia ít nhất một hoạt động giao lưu quốc tế: Hội nghị, Hội thảo quốc tế, các chương trình gặp gỡ, giao lưu, hợp tác với thanh niên, sinh viên quốc tế trong và ngoài nước.',
                display: 'Tham gia ít nhất một hoạt động giao lưu quốc tế: Hội nghị, hội thảo, gặp gỡ giao lưu quốc tế.',
            },
            {
                full: 'Tham gia tích cực ít nhất 01 hoạt động hội nhập từ cấp Đại học trở lên tổ chức.',
                display: 'Tham gia tích cực ít nhất 01 hoạt động hội nhập từ cấp Đại học trở lên tổ chức.',
            },
            {
                full: 'Là thành viên ban chủ nhiệm các câu lạc bộ, đội, nhóm ngoại ngữ tại các cơ sở giáo dục, địa bàn dân cư, thường xuyên tổ chức các hoạt động giao lưu, trao đổi nâng cao năng lực ngoại ngữ và hội nhập quốc tế.',
                display: 'Là thành viên BCN các CLB, đội, nhóm ngoại ngữ... thường xuyên tổ chức giao lưu hội nhập quốc tế.',
            },
            {
                full: 'Tham gia các cuộc thi về kiến thức Hội nhập hoặc có sử dụng Ngoại ngữ từ cấp Trường/Khoa trở lên tổ chức.',
                display: 'Tham gia các cuộc thi về kiến thức Hội nhập hoặc có sử dụng Ngoại ngữ từ cấp Trường/Khoa trở lên tổ chức.',
            },
            {
                full: 'Tham gia các cuộc thi về kiến thức hội nhập hoặc có sử dụng Ngoại ngữ từ cấp Đại học trở lên tổ chức.',
                display: 'Tham gia các cuộc thi về kiến thức hội nhập hoặc có sử dụng Ngoại ngữ từ cấp Đại học trở lên tổ chức.',
            },
            {
                full: 'Đạt giải Ba trở lên tại các cuộc thi về kiến thức hội nhập hoặc các cuộc thi học thuật bằng ngoại ngữ từ cấp tỉnh trở lên.',
                display: 'Đạt giải Ba trở lên tại các cuộc thi về kiến thức hội nhập hoặc các cuộc thi học thuật bằng ngoại ngữ từ cấp tỉnh trở lên.',
            },
            {
                full: 'Là thành viên Ban tổ chức hoặc CTV tổ chức ít nhất 02 hoạt động, sự kiện có quy mô cấp Đại học trở lên.',
                display: 'Là thành viên Ban tổ chức hoặc CTV tổ chức ít nhất 02 hoạt động, sự kiện có quy mô cấp Đại học trở lên.',
            },
            {
                full: 'Là thành viên đội thi cấp Đại học tham gia Cuộc thi về ngoại ngữ do Trung ương và Thành phố tổ chức.',
                display: 'Là thành viên đội thi cấp Đại học tham gia Cuộc thi về ngoại ngữ do Trung ương và Thành phố tổ chức.',
            },
        ],
    },
};