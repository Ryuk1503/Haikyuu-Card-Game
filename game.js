// ============================================
// HAIKYUU!! VOLLEYBALL CARD GAME - SANDBOX MODE
// ============================================

const GamePhase = {
    WAITING: 'waiting',
    SERVE: 'serve',
    RECEIVE: 'receive',
    TOSS: 'toss',
    ATTACK: 'attack',
    BLOCK: 'block',
    GAME_END: 'game_end'
};

// Card Database - Organized by School
const cardDatabase = [
    // ============ KARASUNO - NHÂN VẬT ============
    { 
        id: 1, 
        name: "Hinata Shoyo", 
        cardId: "hinata-shouyo-1",
        school: "Karasuno",
        type: "character",
        serve: 2, 
        receive: 0, 
        toss: 0, 
        attack: 3, 
        block: 2,
        skill: "[3 Ý chí] Khi thẻ này xuất hiện ở khu vực Đập Bóng từ trên tay, nếu có 3+ Ý Chí ở khu vực này, tự +1 điểm Đập.",
        artwork: "Card/Karasuno/Nhan vat/hinata-shouyo-1.png"
    },
    { 
        id: 21, 
        name: "Hinata Shoyo", 
        cardId: "hinata-shouyo-2",
        school: "Karasuno",
        type: "character",
        serve: 1, 
        receive: 0, 
        toss: 0, 
        attack: 3, 
        block: 3,
        artwork: "Card/Karasuno/Nhan vat/hinata-shouyo-2.png"
    },
    { 
        id: 22, 
        name: "Kageyama Tobio", 
        cardId: "kageyama-tobio-1",
        school: "Karasuno",
        type: "character",
        serve: 1, 
        receive: 0, 
        toss: 1, 
        attack: 3, 
        block: 0,
        skill: "Khi thẻ này xuất hiện ở khu vực Chuyền Bóng, có thể tìm 1 thẻ từ Deck và thêm vào tay.",
        artwork: "Card/Karasuno/Nhan vat/kageyama-tobio-1.png"
    },
    { 
        id: 23, 
        name: "Kageyama Tobio", 
        cardId: "kageyama-tobio-2",
        school: "Karasuno",
        type: "character",
        serve: 1, 
        receive: 0, 
        toss: 1, 
        attack: 2, 
        block: 2,
        artwork: "Card/Karasuno/Nhan vat/kageyama-tobio-2.png"
    },
    { 
        id: 24, 
        name: "Sawamura Daichi", 
        cardId: "sawamura-daichi-1",
        school: "Karasuno",
        type: "character",
        serve: 2, 
        receive: 4, 
        toss: 0, 
        attack: 0, 
        block: 0,
        artwork: "Card/Karasuno/Nhan vat/sawamura-daichi-1.png"
    },
    { 
        id: 25, 
        name: "Sugawara Koshi", 
        cardId: "sugawara-koshi-1",
        school: "Karasuno",
        type: "character",
        serve: 2, 
        receive: 2, 
        toss: 1, 
        attack: 0, 
        block: 1,
        skill: "[Đỡ][Chặn][Kích hoạt] +1 điểm Đỡ hoặc Chặn cho một nhân vật trên sân mình.",
        artwork: "Card/Karasuno/Nhan vat/sugawara-koshi-1.png"
    },
    { 
        id: 26, 
        name: "Tanaka Ryunosuke", 
        cardId: "tanaka-ryunosuke-1",
        school: "Karasuno",
        type: "character",
        serve: 1, 
        receive: 3, 
        toss: 0, 
        attack: 3, 
        block: 1,
        skill: "Khi thẻ này xuất hiện ở khu vực Đập Bóng, đối phương -2 điểm Chặn.",
        artwork: "Card/Karasuno/Nhan vat/tanaka-ryunosuke-1.png"
    },
    { 
        id: 27, 
        name: "Tsukishima Kei", 
        cardId: "tsukishima-kei-1",
        school: "Karasuno",
        type: "character",
        serve: 1, 
        receive: 2, 
        toss: 0, 
        attack: 2, 
        block: 3,
        skill: "[3 Ý chí] Khi thẻ này xuất hiện ở khu vực Chặn Bóng, nếu có 3+ Ý Chí, tự +1 điểm Chặn.",
        artwork: "Card/Karasuno/Nhan vat/tsukishima-kei-1.png"
    },
    { 
        id: 28, 
        name: "Tsukishima Kei", 
        cardId: "tsukishima-kei-2",
        school: "Karasuno",
        type: "character",
        serve: 1, 
        receive: 0, 
        toss: 0, 
        attack: 3, 
        block: 3,
        artwork: "Card/Karasuno/Nhan vat/tsukishima-kei-2.png"
    },
    { 
        id: 29, 
        name: "Yamaguchi Tadashi", 
        cardId: "yamaguchi-tadashi-1",
        school: "Karasuno",
        type: "character",
        serve: 3, 
        receive: 4, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[2 Ý chí] Khi thẻ này ra sân, lấy 1 thẻ Karasuno từ Drop về tay.",
        artwork: "Card/Karasuno/Nhan vat/yamaguchi-tadashi-1.png"
    },
    { 
        id: 30, 
        name: "Nishinoya Yu", 
        cardId: "nishinoya-yu-1",
        school: "Karasuno",
        type: "character",
        serve: 0, 
        receive: 4, 
        toss: 0, 
        attack: 0, 
        block: 0,
        isLibero: true,
        skill: "[Libero] Không thể Giao bóng. [1 Ý chí] Tự + điểm Đỡ bằng điểm Chặn của Ý chí.",
        artwork: "Card/Karasuno/Nhan vat/nishinoya-yu-1.png"
    },
    { 
        id: 31, 
        name: "Nishinoya Yu", 
        cardId: "nishinoya-yu-2",
        school: "Karasuno",
        type: "character",
        serve: 0, 
        receive: 6, 
        toss: 0, 
        attack: 0, 
        block: 0,
        isLibero: true,
        skill: "[Libero] Không thể Giao bóng.",
        artwork: "Card/Karasuno/Nhan vat/nishinoya-yu-2.png"
    },
    { 
        id: 32, 
        name: "Azumane Asahi", 
        cardId: "azumane-asahi-1",
        school: "Karasuno",
        type: "character",
        serve: 1, 
        receive: 0, 
        toss: 0, 
        attack: 3, 
        block: 3,
        skill: "Khi thẻ này xuất hiện ở khu vực Chặn Bóng, nếu có 2+ nhân vật Chặn, tự +2 điểm Chặn.",
        artwork: "Card/Karasuno/Nhan vat/azumane-asahi-1.png"
    },
    // ============ SHIRATORIZAWA - NHÂN VẬT ============
    { 
        id: 33, 
        name: "Ushijima Wakatoshi", 
        cardId: "ushijima-wakatoshi-1",
        school: "Shiratorizawa",
        type: "character",
        serve: 3, 
        receive: 0, 
        toss: 0, 
        attack: 3, 
        block: 0,
        skill: "Khi thẻ này xuất hiện ở khu vực Đập Bóng, nếu có 3+ Ý Chí và thẻ Action, tự +3 điểm Đập.",
        artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-1.png"
    },
    { 
        id: 34, 
        name: "Ushijima Wakatoshi", 
        cardId: "ushijima-wakatoshi-2",
        school: "Shiratorizawa",
        type: "character",
        serve: 4, 
        receive: 0, 
        toss: 0, 
        attack: 3, 
        block: 0,
        skill: "Khi thẻ này xuất hiện ở khu vực Giao Bóng, có thể +2 điểm Giao.",
        artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-2.png"
    },
    { 
        id: 35, 
        name: "Ushijima Wakatoshi", 
        cardId: "ushijima-wakatoshi-3",
        school: "Shiratorizawa",
        type: "character",
        serve: 2, 
        receive: 3, 
        toss: 0, 
        attack: 3, 
        block: 0,
        skill: "Khi thẻ này xuất hiện ở khu vực Đỡ Bóng, có thể bỏ 1 thẻ trên tay để tự +1 điểm Đỡ, sau đó đặt 1 thẻ trên cùng bộ bài đối phương vào Drop.",
        artwork: "Card/Shiratorizawa/Nhan vat/ushijima-wakatoshi-3.png"
    },
    { 
        id: 36, 
        name: "Tendo Satori", 
        cardId: "tendo-satori-1",
        school: "Shiratorizawa",
        type: "character",
        serve: 1, 
        receive: 0, 
        toss: 0, 
        attack: 1, 
        block: 4,
        skill: "Khi thẻ này xuất hiện ở khu vực Chặn Bóng, đặt 1 thẻ trên cùng bộ bài đối phương vào Drop. Nếu thẻ đó trùng tên với nhân vật Đập Bóng của đối phương, ngay lập tức Chặn Bóng thành công, sau đó đặt 2 thẻ trên cùng bộ bài đối phương vào Drop.",
        artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-1.png"
    },
    { 
        id: 37, 
        name: "Tendo Satori", 
        cardId: "tendo-satori-2",
        school: "Shiratorizawa",
        type: "character",
        serve: 2, 
        receive: 0, 
        toss: 0, 
        attack: 3, 
        block: 2,
        skill: "[Bỏ thẻ này từ trên tay] : +2 điểm Đỡ hoặc Chặn cho 1 nhân vật trường Shiratorizawa trên sân mình.",
        artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-2.png"
    },
    { 
        id: 38, 
        name: "Tendo Satori", 
        cardId: "tendo-satori-3",
        school: "Shiratorizawa",
        type: "character",
        serve: 3, 
        receive: 1, 
        toss: 0, 
        attack: 3, 
        block: 4,
        artwork: "Card/Shiratorizawa/Nhan vat/tendo-satori-3.png"
    },
    { 
        id: 39, 
        name: "Goshiki Tsutomu", 
        cardId: "goshiki-tsutomu-1",
        school: "Shiratorizawa",
        type: "character",
        serve: 2, 
        receive: 2, 
        toss: 0, 
        attack: 3, 
        block: 0,
        skill: "[3 Ý chí] Khi thẻ này xuất hiện ở khu vực Đập Bóng từ trên tay, nếu có 3+ Ý Chí ở khu vực này, tự +1 điểm Đập. Nếu trên sân mình có nhân vật \"Ushijima Wakatoshi\", có thể loại bỏ 1 Ý Chí của 1 nhân vật trên sân đối phương.",
        artwork: "Card/Shiratorizawa/Nhan vat/goshiki-tsutomu-1.png"
    },
    { 
        id: 40, 
        name: "Goshiki Tsutomu", 
        cardId: "goshiki-tsutomu-2",
        school: "Shiratorizawa",
        type: "character",
        serve: 4, 
        receive: 1, 
        toss: 0, 
        attack: 3, 
        block: 0,
        skill: "Khi thẻ này xuất hiện ở khu vực Giao Bóng, có thể bỏ 1 thẻ trên tay để đặt 2 thẻ trên cùng bộ bài đối phương vào Drop.",
        artwork: "Card/Shiratorizawa/Nhan vat/goshiki-tsutomu-2.png"
    },
    { 
        id: 41, 
        name: "Goshiki Tsutomu", 
        cardId: "goshiki-tsutomu-3",
        school: "Shiratorizawa",
        type: "character",
        serve: 3, 
        receive: 4, 
        toss: 0, 
        attack: 3, 
        block: 2,
        artwork: "Card/Shiratorizawa/Nhan vat/goshiki-tsutomu-3.png"
    },
    { 
        id: 42, 
        name: "Shirabu Kenjiro", 
        cardId: "shirabu-kenjiro-1",
        school: "Shiratorizawa",
        type: "character",
        serve: 2, 
        receive: 3, 
        toss: 1, 
        attack: 0, 
        block: 1,
        skill: "Khi nhân vật Đập Bóng xuất hiện trên sân mình, nếu nhân vật này (Shirabu Kenjiro) có 3+ Ý Chí, tự +1 điểm Chuyền. Nếu nhân vật Đập Bóng là \"Ushijima Wakatoshi\", có thể loại bỏ tối đa 1 Ý Chí của 1 nhân vật trên sân đối phương.",
        artwork: "Card/Shiratorizawa/Nhan vat/shirabu-kenjiro-1.png"
    },
    { 
        id: 43, 
        name: "Shirabu Kenjiro", 
        cardId: "shirabu-kenjiro-2",
        school: "Shiratorizawa",
        type: "character",
        serve: 3, 
        receive: 0, 
        toss: 1, 
        attack: 0, 
        block: 3,
        skill: "Khi thẻ này xuất hiện ở khu vực Chuyền Bóng, có thể bỏ 1 thẻ Nhân Vật trường Shiratorizawa từ trên tay để thực hiện Bỏ nhỏ. (Kết thúc lượt mà không cần triển khai nhân vật Đập bóng. Ở lượt tiếp theo, đối phương không thể Chặn Bóng và chỉ Đỡ Bóng thành công với điểm Đỡ từ 3 trở lên).",
        artwork: "Card/Shiratorizawa/Nhan vat/shirabu-kenjiro-2.png"
    },
    { 
        id: 44, 
        name: "Shirabu Kenjiro", 
        cardId: "shirabu-kenjiro-3",
        school: "Shiratorizawa",
        type: "character",
        serve: 4, 
        receive: 4, 
        toss: 1, 
        attack: 1, 
        block: 2,
        artwork: "Card/Shiratorizawa/Nhan vat/shirabu-kenjiro-3.png"
    },
    { 
        id: 45, 
        name: "Ohira Reon", 
        cardId: "ohira-reon-1",
        school: "Shiratorizawa",
        type: "character",
        serve: 1, 
        receive: 3, 
        toss: 0, 
        attack: 3, 
        block: 1,
        skill: "Khi thẻ này xuất hiện ở khu vực Đập bóng, hai người chơi bỏ 1 thẻ trên cùng bộ bài của mình vào Drop.",
        artwork: "Card/Shiratorizawa/Nhan vat/ohira-reon-1.png"
    },
    { 
        id: 46, 
        name: "Ohira Reon", 
        cardId: "ohira-reon-2",
        school: "Shiratorizawa",
        type: "character",
        serve: 1, 
        receive: 4, 
        toss: 0, 
        attack: 1, 
        block: 1,
        skill: "[2 Ý chí] Khi nhân vật \"Ushijima Wakatoshi\" xuất hiện ở khu vực Đập Bóng trên sân mình, có thể dùng 2 Ý Chí của nhân vật này để +1 điểm Đập cho nhân vật \"Ushijima Wakatoshi\" đó.",
        artwork: "Card/Shiratorizawa/Nhan vat/ohira-reon-2.png"
    },
    { 
        id: 47, 
        name: "Kawanishi Taichi", 
        cardId: "kawanishi-taichi",
        school: "Shiratorizawa",
        type: "character",
        serve: 1, 
        receive: 0, 
        toss: 0, 
        attack: 3, 
        block: 3,
        skill: "Khi thẻ này ra sân, có thể bỏ 1 thẻ trên tay để đặt 1 thẻ trên cùng bộ bài đối phương vào Drop và rút 1 thẻ từ bộ bài.",
        artwork: "Card/Shiratorizawa/Nhan vat/kawanishi-taichi.png"
    },
    { 
        id: 48, 
        name: "Yamagata Hayato", 
        cardId: "yamagata-hayato",
        school: "Shiratorizawa",
        type: "character",
        serve: 0, 
        receive: 5, 
        toss: 0, 
        attack: 0, 
        block: 0,
        artwork: "Card/Shiratorizawa/Nhan vat/yamagata-hayato.png"
    },
    { 
        id: 49, 
        name: "Semi Eita", 
        cardId: "semi-eita",
        school: "Shiratorizawa",
        type: "character",
        serve: 4, 
        receive: 2, 
        toss: 1, 
        attack: 0, 
        block: 0,
        skill: "[2 Ý chí] Khi thẻ này xuất hiện ở khu vực Chuyền Bóng từ trên tay, nếu có 3+ Ý Chí, thu hồi lên tay tối đa 1 thẻ Nhân Vật trường Shiratorizawa từ Drop.",
        artwork: "Card/Shiratorizawa/Nhan vat/semi-eita.png"
    },
    // ============ KARASUNO - HÀNH ĐỘNG ============
    { 
        id: 100, 
        name: "Chuyền tới đây cho tôi!!", 
        cardId: "chuyen-toi-day-cho-toi",
        school: "Karasuno",
        type: "action",
        phases: ["receive"],
        spiritCost: 0,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Đỡ] +2 điểm Đỡ cho nhân vật Đỡ Bóng trường Karasuno trên sân mình. Sau đó, nếu nhân vật đó là \"Nishinoya Yu\", có thể chọn tối đa 1 thẻ \"Nishinoya Yu\" từ bộ bài rồi thêm vào Ý Chí của nhân vật đó. Xáo lại bộ bài.",
        artwork: "Card/Karasuno/Hanh dong/chuyen-toi-day-cho-toi.png"
    },
    { 
        id: 101, 
        name: "Chú mày cũng có máu ăn thua đấy…!!", 
        cardId: "chu-may-cung-co-mau-an-thua-day",
        school: "Karasuno",
        type: "action",
        phases: ["attack"],
        spiritCost: 3,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Đập] [3 Ý chí] +1 điểm Chuyền cho nhân vật Chuyền Bóng trường Karasuno trên sân mình. Hoặc nếu nhân vật đó và nhân vật Đập Bóng có từ 3 Ý Chí trở lên, +3 điểm Chuyền.",
        artwork: "Card/Karasuno/Hanh dong/chu-may-cung-co-mau-an-thua-day.png"
    },
    { 
        id: 102, 
        name: "Phòng thủ tuyệt đối!!", 
        cardId: "phong-thu-tuyet-doi",
        school: "Karasuno",
        type: "action",
        phases: ["receive", "block"],
        spiritCost: 0,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Đỡ][Chặn] +2 điểm Đỡ hoặc Chặn cho 1 nhân vật trường Karasuno trên sân mình. Nếu nhân vật đó là nhân vật Chặn Bóng, rút 2 thẻ từ bộ bài. Sau đó, trong lượt này không được phép sử dụng thẻ \"Phòng thủ tuyệt đối!!\" nữa.",
        artwork: "Card/Karasuno/Hanh dong/phong-thu-tuyet-doi.png"
    },
    { 
        id: 103, 
        name: "Dù chỉ là sinh hoạt CLB…", 
        cardId: "du-chi-la-sinh-hoat-clb",
        school: "Karasuno",
        type: "action",
        phases: ["block"],
        spiritCost: 3,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Chặn] [3 Ý chí] +2 điểm Chặn cho 1 nhân vật \"Tsukishima Kei\" trên sân mình. Nếu trên sân mình có nhân vật Đỡ Bóng trường Karasuno với 3 Ý Chí trở lên, ở lượt tiếp theo của đối phương, đối phương chỉ Đỡ Bóng thành công với điểm Đỡ từ 8 trở lên.",
        artwork: "Card/Karasuno/Hanh dong/du-chi-la-sinh-hoat-clb.png"
    },
    { 
        id: 104, 
        name: "\"1 điểm bằng 100 điểm\" phải hôn!?", 
        cardId: "1-diem-bang-100-diem-phai-hon",
        school: "Karasuno",
        type: "action",
        phases: ["receive", "toss", "attack", "block"],
        spiritCost: 2,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Đỡ][Chuyền][Đập][Chặn] [2 Ý chí] +1 điểm bất kì cho 1 nhân vật trường Karasuno trên sân mình. Sau đó, có thể sử dụng 2 Ý Chí của 1 nhân vật trường Karasuno khác để thu hồi lên tay 1 thẻ nhân vật từ khu vực Loại Bỏ.",
        artwork: "Card/Karasuno/Hanh dong/1-diem-bang-100-diem-phai-hon.png"
    },
    // ============ SHIRATORIZAWA - HÀNH ĐỘNG ============
    { 
        id: 105, 
        name: "Chuyền hết bóng cho anh.", 
        cardId: "chuyen-het-bong-cho-anh",
        school: "Shiratorizawa",
        type: "action",
        phases: ["toss", "attack"],
        spiritCost: 3,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Chuyền][Đập] [3 ý chí] +1 điểm cho nhân vật Shiratorizawa.",
        artwork: "Card/Shiratorizawa/Hanh dong/chuyen-het-bong-cho-anh.png"
    },
    { 
        id: 106, 
        name: "Mà là nghệ thuật đập bóng thẳng xuống sân.", 
        cardId: "ma-la-nghe-thuat-dap-bong-thang-xuong-san",
        school: "Shiratorizawa",
        type: "action",
        phases: ["block"],
        spiritCost: 0,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Chặn] Rút 1 thẻ từ bộ bài. Sau đó, +2 điểm Chặn cho 1 nhân vật trường Shiratorizawa trên sân mình. Nếu nhân vật đó là \"Tendo Satori\", đặt 1 thẻ trên cùng bộ bài của đối phương vào khu vực Loại Bỏ.",
        artwork: "Card/Shiratorizawa/Hanh dong/ma-la-nghe-thuat-dap-bong-thang-xuong-san.png"
    },
    { 
        id: 107, 
        name: "Là một đối thủ \"vượt quá tầm hiểu biết\"…", 
        cardId: "la-mot-doi-thu-vuot-qua-tam-hieu-biet",
        school: "Shiratorizawa",
        type: "action",
        phases: ["receive", "toss", "attack", "block"],
        spiritCost: 3,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Đỡ][Chuyền][Đập][Chặn] [3 Ý chí] +1 điểm bất kì cho 1 nhân vật trường Shiratorizawa trên sân mình. Nếu nhân vật đó có từ 3 Ý Chí trở lên, và trên sân đối phương, trừ nhân vật Giao Bóng, có nhân vật có từ 2 Ý Chí trở xuống, rút 2 thẻ từ bộ bài. Sau đó, trong lượt này không được sử dụng thẻ \"Là một đối thủ 'vượt quá tầm hiểu biết'…\" nữa.",
        artwork: "Card/Shiratorizawa/Hanh dong/la-mot-doi-thu-vuot-qua-tam-hieu-biet.png"
    },
    { 
        id: 108, 
        name: "Thấy chưa hả? Cú bóng thần tốc của em đó!", 
        cardId: "thay-chua-ha-cu-bong-than-toc-cua-em-do",
        school: "Shiratorizawa",
        type: "action",
        phases: ["attack"],
        spiritCost: 0,
        serve: 0, 
        receive: 0, 
        toss: 0, 
        attack: 0, 
        block: 0,
        skill: "[Đập] +1 điểm Đập cho 1 nhân vật trên sân mình. Sau đó, nếu nhân vật đó là \"Goshiki Tsutomu\", ở lượt tiếp theo của đối phương, đối phương không được đưa ra nhân vật Chặn Bóng.",
        artwork: "Card/Shiratorizawa/Hanh dong/thay-chua-ha-cu-bong-than-toc-cua-em-do.png"
    }
];

// ============================================
// GAME STATE
// ============================================
class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.phase = GamePhase.WAITING;
        this.currentPlayer = 1;
        this.viewingPlayer = 1;
        this.servingPlayer = 1;
        this.attackingPlayer = null;
        
        this.sets = { 1: 0, 2: 0 };
        this.decks = { 1: [], 2: [] };
        this.hands = { 1: [], 2: [] };
        this.discards = { 1: [], 2: [] };
        
        // Action area cards
        this.actionCards = { 1: [], 2: [] };
        // actionAreaEls is initialized in constructor, don't reset here
        
        // Played cards - each player has zones
        this.playedCards = {
            1: { serve: null, receive: null, toss: null, attack: null, block: [] },
            2: { serve: null, receive: null, toss: null, attack: null, block: [] }
        };
        
        // Spirit cards ("Ý chí")
        this.spiritCards = {
            1: { serve: [], receive: [], toss: [], attack: [], block: [] },
            2: { serve: [], receive: [], toss: [], attack: [], block: [] }
        };
        
        this.currentStats = {
            servePower: 0,
            receivePower: 0,
            attackPower: 0,
            blockPower: 0
        };
        
        // Context menu state
        this.contextCard = null;
        this.contextPlayer = null;
    }
}

// ============================================
// GAME CONTROLLER - SANDBOX MODE
// ============================================
class HaikyuuCardGame {
    constructor() {
        this.state = new GameState();
        
        // Online mode properties
        this.isOnline = false;
        this.onlineManager = null;
        this.myPlayerNumber = null;
        this.playerNames = { 1: 'Player 1', 2: 'Player 2' };
        
        // Initialize action area elements (needed before bindEvents)
        this.actionAreaEls = {
            1: document.getElementById('p1-action-cards'),
            2: document.getElementById('p2-action-cards')
        };
        
        this.initElements();
        this.bindEvents();
        this.initChatLog();
    }
    
    initChatLog() {
        this.chatLogMessages = document.getElementById('chat-log-messages');
        this.chatInput = document.getElementById('chat-input');
        this.chatSendBtn = document.getElementById('chat-send-btn');
        
        if (this.chatSendBtn) {
            this.chatSendBtn.addEventListener('click', () => this.sendChatMessage());
        }
        
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }
    
    addLogMessage(message, type = 'log') {
        if (!this.chatLogMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-log-message';
        
        if (type === 'log') {
            messageEl.innerHTML = `<span class="log-tag">[Log]:</span> ${message}`;
        } else if (type === 'chat') {
            // Message format: "PlayerName: message text"
            const colonIndex = message.indexOf(':');
            if (colonIndex !== -1) {
                const playerName = message.substring(0, colonIndex);
                const messageText = message.substring(colonIndex + 1).trim();
                messageEl.innerHTML = `<span class="player-tag">[${playerName}]:</span> ${messageText}`;
        } else {
                messageEl.textContent = message;
            }
        } else {
            messageEl.textContent = message;
        }
        
        this.chatLogMessages.appendChild(messageEl);
        this.chatLogMessages.scrollTop = this.chatLogMessages.scrollHeight;
    }
    
    sendChatMessage() {
        if (!this.chatInput || !this.chatInput.value.trim()) return;
        
        const message = this.chatInput.value.trim();
        this.chatInput.value = '';
        
        if (this.isOnline && this.onlineManager) {
            this.onlineManager.socket.emit('chatMessage', { message });
        } else {
            // Offline mode - just show locally
            const playerName = this.getPlayerName(this.state.viewingPlayer || 1);
            this.addLogMessage(`${playerName}: ${message}`, 'chat');
        }
    }

    initElements() {
        // Scores (editable)
        this.p1SetsEl = document.getElementById('p1-sets');
        this.p2SetsEl = document.getElementById('p2-sets');
        
        // Score click to increment - triggers SERVE phase
        [this.p1SetsEl, this.p2SetsEl].forEach((el, idx) => {
            if (el) {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let val = parseInt(el.textContent.trim()) || 0;
                    val++;
                    el.textContent = val;
                    this.state.sets[idx + 1] = val;
                    
                    if (this.isOnline && this.onlineManager) {
                        this.onlineManager.socket.emit('setScore', { player: idx + 1, value: val });
                    }
                });
                el.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                    let val = parseInt(el.textContent.trim()) || 0;
                    val = Math.max(0, val - 1);
                    el.textContent = val;
                    this.state.sets[idx + 1] = val;
                    if (this.isOnline && this.onlineManager) {
                        this.onlineManager.socket.emit('setScore', { player: idx + 1, value: val });
                    }
                });
            }
        });
        
        // Current preview card reference for stat modification
        this.currentPreviewCard = null;
        
        // Phase & Turn
        this.phaseEl = document.getElementById('current-phase');
        this.turnIndicatorEl = document.getElementById('turn-indicator');
        
        // Hands
        this.p1HandEl = document.getElementById('p1-hand');
        this.p2HandEl = document.getElementById('p2-hand');
        
        // Deck counts
        this.p1DeckCountEl = document.getElementById('p1-deck-count');
        this.p2DeckCountEl = document.getElementById('p2-deck-count');
        
        // Zones for each player
        this.zones = {
            1: {
                serve: document.getElementById('p1-serve-cards'),
                receive: document.getElementById('p1-receive-cards'),
                toss: document.getElementById('p1-toss-cards'),
                attack: document.getElementById('p1-attack-cards'),
                block: document.getElementById('p1-block-cards')
            },
            2: {
                serve: document.getElementById('p2-serve-cards'),
                receive: document.getElementById('p2-receive-cards'),
                toss: document.getElementById('p2-toss-cards'),
                attack: document.getElementById('p2-attack-cards'),
                block: document.getElementById('p1-block-cards') // Shared block zone
            }
        };

        this.discardEls = {
            1: document.getElementById('p1-discard'),
            2: document.getElementById('p2-discard')
        };
        
        // Stats
        this.servePowerEl = document.getElementById('serve-power');
        this.receivePowerEl = document.getElementById('receive-power');
        this.blockPowerEl = document.getElementById('block-power');
        
        // Modals
        this.gameOverModal = document.getElementById('game-over-modal');
        this.winnerTextEl = document.getElementById('winner-text');
        this.finalScoreEl = document.getElementById('final-score');
        
        // Context menu
        this.contextMenu = document.getElementById('card-context-menu');
        this.contextMenuTitle = document.getElementById('context-menu-title');
        
        // Card Preview Panel
        this.previewCard = document.getElementById('preview-card');
    }

    bindEvents() {
        // Phase click to advance
        if (this.phaseEl) {
            this.phaseEl.addEventListener('click', () => this.advancePhase());
        }
        
        // Deck clicks
        const p1Deck = document.getElementById('p1-deck');
        const p2Deck = document.getElementById('p2-deck');
        
        if (p1Deck) {
            p1Deck.addEventListener('click', () => this.handleDeckClick(1));
            p1Deck.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.openDeckSearchModal(1);
            });
        }
        
        if (p2Deck) {
            p2Deck.addEventListener('click', () => this.handleDeckClick(2));
            p2Deck.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.openDeckSearchModal(2);
            });
        }
        
        // Discard pile clicks
        if (this.discardEls[1]) {
            this.discardEls[1].addEventListener('click', () => this.openDiscardModal(1));
        }
        if (this.discardEls[2]) {
            this.discardEls[2].addEventListener('click', () => this.openDiscardModal(2));
        }
        
        // Spirit zone clicks
        document.querySelectorAll('.zone-spirit').forEach(el => {
            el.addEventListener('click', () => {
                const player = parseInt(el.dataset.player);
                const zone = el.dataset.zone;
                this.openSpiritModal(player, zone);
            });
        });
        
        // Context menu events
        this.bindContextMenuEvents();
        
        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
        
        // Spirit modal close
        const btnCloseSpirit = document.getElementById('btn-close-spirit');
        if (btnCloseSpirit) {
            btnCloseSpirit.addEventListener('click', () => {
                document.getElementById('spirit-modal').classList.remove('show');
            });
        }
        
        // Deck search modal
        const btnCloseDeckSearch = document.getElementById('btn-close-deck-search');
        const btnShuffleDeck = document.getElementById('btn-shuffle-deck');
        if (btnCloseDeckSearch) {
            btnCloseDeckSearch.addEventListener('click', () => {
                document.getElementById('deck-search-modal').classList.remove('show');
            });
        }
        if (btnShuffleDeck) {
            btnShuffleDeck.addEventListener('click', () => {
                const player = this.deckSearchPlayer;
                this.shuffleDeck(player);
                document.getElementById('deck-search-modal').classList.remove('show');
            });
        }
        
        // Discard modal close
        const btnCloseDiscard = document.getElementById('btn-close-discard');
        if (btnCloseDiscard) {
            btnCloseDiscard.addEventListener('click', () => {
                document.getElementById('discard-modal').classList.remove('show');
            });
        }
        
        // Setup drag-drop for zones
        this.setupZoneDragDrop();
        
        // Setup drag-drop for action areas
        this.setupActionAreaDragDrop();
    }
    
    setupActionAreaDragDrop() {
        // Ensure actionAreaEls exists
        if (!this.actionAreaEls) {
            this.actionAreaEls = {
                1: document.getElementById('p1-action-cards'),
                2: document.getElementById('p2-action-cards')
            };
        }
        
        [1, 2].forEach(player => {
            const actionEl = this.actionAreaEls[player];
            if (!actionEl) {
                console.warn(`⚠️ Action area element not found for player ${player}`);
                return;
            }
            
            actionEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                actionEl.classList.add('drag-over');
            });
            
            actionEl.addEventListener('dragleave', (e) => {
                actionEl.classList.remove('drag-over');
            });
            
            actionEl.addEventListener('drop', (e) => {
                e.preventDefault();
                actionEl.classList.remove('drag-over');
                
                const cardUniqueId = e.dataTransfer.getData('card-id');
                const sourcePlayer = parseInt(e.dataTransfer.getData('card-player'));
                const sourceType = e.dataTransfer.getData('card-source') || 'unknown';
                
                if (!cardUniqueId) return;
                
                const card = this.findCardByUniqueId(cardUniqueId, sourcePlayer);
                if (!card) return;
                
                // Only allow action cards in action area
                if (card.type !== 'action') return;
                
                // Determine source location
                const sourceInfo = { source: sourceType, player: sourcePlayer };
                if (sourceType === 'zone') {
                    sourceInfo.zone = e.dataTransfer.getData('card-zone');
                }
                
                this.removeCardFromSource(card, sourcePlayer, 'any');
                this.placeCardAtTarget(card, player, 'action', null, sourceInfo);
                
                if (this.isOnline && this.onlineManager) {
                    this.onlineManager.socket.emit('moveCard', {
                        cardUniqueId: card.uniqueId,
                        player: String(player),
                        targetType: 'action',
                        targetZone: null
                    });
                }
                
                this.updateUI();
            });
        });
    }
    
    setupZoneDragDrop() {
        // Make all zones droppable
        document.querySelectorAll('.zone').forEach(zoneEl => {
            const player = parseInt(zoneEl.dataset.player);
            const zone = zoneEl.dataset.zone;
            
            zoneEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                zoneEl.classList.add('drag-over');
            });
            
            zoneEl.addEventListener('dragleave', (e) => {
                zoneEl.classList.remove('drag-over');
            });
            
            zoneEl.addEventListener('drop', (e) => {
                e.preventDefault();
                zoneEl.classList.remove('drag-over');
                
                const cardUniqueId = e.dataTransfer.getData('card-id');
                const sourcePlayer = parseInt(e.dataTransfer.getData('card-player'));
                const sourceType = e.dataTransfer.getData('card-source') || 'unknown';
                
                if (!cardUniqueId) return;
                
                // Find the card
                const card = this.findCardByUniqueId(cardUniqueId, sourcePlayer);
                if (!card) return;
                
                // Determine source location
                const sourceInfo = { source: sourceType, player: sourcePlayer };
                if (sourceType === 'zone') {
                    sourceInfo.zone = e.dataTransfer.getData('card-zone');
                }
                
                // Remove from source and place in zone
                this.removeCardFromSource(card, sourcePlayer, 'any');
                this.placeCardAtTarget(card, player, 'zone', zone, sourceInfo);
                
                if (this.isOnline && this.onlineManager) {
                    this.onlineManager.socket.emit('moveCard', {
                        cardUniqueId: card.uniqueId,
                        player: String(player),
                        targetType: 'zone',
                        targetZone: zone
                    });
        }

        this.updateUI();
            });
        });
        
        // Make block zone droppable
        const blockZone = document.getElementById('p1-block-zone');
        if (blockZone) {
            blockZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                blockZone.classList.add('drag-over');
            });
            
            blockZone.addEventListener('dragleave', (e) => {
                blockZone.classList.remove('drag-over');
            });
            
            blockZone.addEventListener('drop', (e) => {
                e.preventDefault();
                blockZone.classList.remove('drag-over');
                
                const cardUniqueId = e.dataTransfer.getData('card-id');
                const sourcePlayer = parseInt(e.dataTransfer.getData('card-player'));
                const sourceType = e.dataTransfer.getData('card-source') || 'unknown';
                
                if (!cardUniqueId) return;
                
                const card = this.findCardByUniqueId(cardUniqueId, sourcePlayer);
                if (!card) return;
                
                // Determine source location
                const sourceInfo = { source: sourceType, player: sourcePlayer };
                if (sourceType === 'zone') {
                    sourceInfo.zone = e.dataTransfer.getData('card-zone');
                }
                
                this.removeCardFromSource(card, sourcePlayer, 'any');
                this.placeCardAtTarget(card, sourcePlayer, 'zone', 'block', sourceInfo);
                
                if (this.isOnline && this.onlineManager) {
                    this.onlineManager.socket.emit('moveCard', {
                        cardUniqueId: card.uniqueId,
                        player: String(sourcePlayer),
                        targetType: 'zone',
                        targetZone: 'block'
                    });
                }
                
                this.updateUI();
            });
        }
        
        // Make discard piles droppable
        [1, 2].forEach(player => {
            const discardEl = this.discardEls[player];
            if (discardEl) {
                discardEl.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    discardEl.classList.add('drag-over');
                });
                
                discardEl.addEventListener('dragleave', (e) => {
                    discardEl.classList.remove('drag-over');
                });
                
                discardEl.addEventListener('drop', (e) => {
                    e.preventDefault();
                    discardEl.classList.remove('drag-over');
                    
                    const cardUniqueId = e.dataTransfer.getData('card-id');
                    const sourcePlayer = parseInt(e.dataTransfer.getData('card-player'));
                    const sourceType = e.dataTransfer.getData('card-source') || 'unknown';
                    
                    if (!cardUniqueId) return;
                    
                    const card = this.findCardByUniqueId(cardUniqueId, sourcePlayer);
                    if (!card) return;
                    
                    // Determine source location
                    const sourceInfo = { source: sourceType, player: sourcePlayer };
                    if (sourceType === 'zone') {
                        sourceInfo.zone = e.dataTransfer.getData('card-zone');
                    }
                    
                    this.removeCardFromSource(card, sourcePlayer, 'any');
                    this.placeCardAtTarget(card, player, 'discard', null, sourceInfo);
                    
                    if (this.isOnline && this.onlineManager) {
                        this.onlineManager.socket.emit('moveCard', {
                            cardUniqueId: card.uniqueId,
                            player: String(player),
                            targetType: 'discard',
                            targetZone: null
                        });
        }

        this.updateUI();
                });
            }
        });
    }
    
    findCardByUniqueId(uniqueId, player) {
        // Search in hand
        let card = this.state.hands[player]?.find(c => c.uniqueId === uniqueId);
        if (card) return card;
        
        // Search in played zones
        for (const zone of ['serve', 'receive', 'toss', 'attack']) {
            if (this.state.playedCards[player]?.[zone]?.uniqueId === uniqueId) {
                return this.state.playedCards[player][zone];
            }
        }
        
        // Search in block
        card = this.state.playedCards[player]?.block?.find(c => c.uniqueId === uniqueId);
        if (card) return card;
        
        // Search in action area
        card = this.state.actionCards[player]?.find(c => c.uniqueId === uniqueId);
        if (card) return card;
        
        // Search in spirit zones
        for (const zone of ['serve', 'receive', 'toss', 'attack', 'block']) {
            card = this.state.spiritCards[player]?.[zone]?.find(c => c.uniqueId === uniqueId);
            if (card) return card;
        }
        
        // Search in discards
        card = this.state.discards[player]?.find(c => c.uniqueId === uniqueId);
        if (card) return card;
        
        // Search in deck
        card = this.state.decks[player]?.find?.(c => c.uniqueId === uniqueId);
        if (card) return card;
        
        return null;
    }

    bindContextMenuEvents() {
        if (!this.contextMenu) return;
        
        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.closest('.context-menu-item').dataset.action;
                // Skip parent menu items (has-submenu)
                if (action && action !== 'spirit-parent') {
                    this.handleContextMenuAction(action);
                }
            });
        });
        
        // Handle submenu items
        this.contextMenu.querySelectorAll('.context-submenu .context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                if (action) {
                    this.handleContextMenuAction(action);
                }
            });
        });
    }

    // ============================================
    // PHASE MANAGEMENT
    // ============================================
    advancePhase() {
        // New phase cycle:
        // Giao A → Đỡ B → Chuyền B → Đập B → Chặn A → Đỡ A → Chuyền A → Đập A → Chặn B → lặp lại
        
        if (this.state.phase === GamePhase.WAITING || this.state.phase === GamePhase.GAME_END) {
            return;
        }
        
        let nextPhase;
        let nextPlayer;
        
        if (this.state.phase === GamePhase.SERVE) {
            // After serve, go to receive of opponent
            nextPhase = GamePhase.RECEIVE;
            nextPlayer = this.getOpponent(this.state.servingPlayer);
            this.state.attackingPlayer = nextPlayer;
        } else if (this.state.phase === GamePhase.RECEIVE) {
            // After receive, go to toss (same player)
            nextPhase = GamePhase.TOSS;
            nextPlayer = this.state.currentPlayer;
        } else if (this.state.phase === GamePhase.TOSS) {
            // After toss, go to attack (same player)
            nextPhase = GamePhase.ATTACK;
            nextPlayer = this.state.currentPlayer;
        } else if (this.state.phase === GamePhase.ATTACK) {
            // After attack, go to block (opponent blocks)
            nextPhase = GamePhase.BLOCK;
            nextPlayer = this.getOpponent(this.state.currentPlayer);
        } else if (this.state.phase === GamePhase.BLOCK) {
            // After block, go to receive (attacker becomes receiver)
            nextPhase = GamePhase.RECEIVE;
            nextPlayer = this.getOpponent(this.state.currentPlayer);
            this.state.attackingPlayer = nextPlayer;
        }
        
        this.state.phase = nextPhase;
        this.state.currentPlayer = nextPlayer;
        
        if (this.isOnline && this.onlineManager) {
            this.onlineManager.socket.emit('advancePhase', { phase: nextPhase, currentPlayer: this.state.currentPlayer });
        }
        
        this.updateUI();
    }
    
    // Reset to SERVE phase when score changes
    triggerServePhase(servingPlayer) {
        this.state.phase = GamePhase.SERVE;
        this.state.servingPlayer = servingPlayer;
        this.state.currentPlayer = servingPlayer;
        this.state.attackingPlayer = servingPlayer;
        this.updateUI();
    }

    setPhase(phase) {
        this.state.phase = phase;
        this.updateUI();
    }

    getOpponent(player) {
        return player === 1 ? 2 : 1;
    }
    
    getPlayerName(player) {
        return this.playerNames[player] || `Player ${player}`;
    }

    // ============================================
    // DECK ACTIONS
    // ============================================
    handleDeckClick(player) {
        if (this.isOnline && this.onlineManager) {
            this.onlineManager.socket.emit('drawCardSandbox', { player: String(player) });
        } else {
            this.drawCard(player);
            this.updateUI();
        }
    }

    drawCard(player) {
        if (this.state.decks[player].length > 0) {
            const card = this.state.decks[player].pop();
            this.state.hands[player].push(card);
            // Don't log draw card - it's visible
            return card;
        }
        return null;
    }

    shuffleDeck(player) {
        if (this.isOnline && this.onlineManager) {
            this.onlineManager.socket.emit('shuffleDeck', { player: String(player) });
        } else {
            this.state.decks[player] = this.shuffleArray(this.state.decks[player]);
            this.addLogMessage(`${this.getPlayerName(player)} đã xáo bộ bài`);
            this.updateUI();
        }
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    openDeckSearchModal(player) {
        this.deckSearchPlayer = player;
        const modal = document.getElementById('deck-search-modal');
        const container = document.getElementById('deck-search-cards');
        const title = document.getElementById('deck-search-title');
        
        title.textContent = `🔍 Deck của ${this.getPlayerName(player)}`;
        container.innerHTML = '';
        
        const deck = this.state.decks[player] || [];
        deck.forEach((card, index) => {
            const cardEl = this.createCardElement(card, player, true);
            cardEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showContextMenu(e, card, player, 'deck', index);
            });
            container.appendChild(cardEl);
        });
        
        if (deck.length === 0) {
            container.innerHTML = '<div class="empty-message">Deck trống</div>';
        }
        
        this.addLogMessage(`${this.getPlayerName(player)} đã mở tìm kiếm bộ bài`);
        modal.classList.add('show');
    }

    // ============================================
    // DISCARD ACTIONS
    // ============================================
    openDiscardModal(player) {
        const modal = document.getElementById('discard-modal');
        const container = document.getElementById('discard-card-list');
        const title = document.getElementById('discard-title');
        
        title.textContent = `📤 Drop của ${this.getPlayerName(player)}`;
        container.innerHTML = '';
        
        const discards = this.state.discards[player] || [];
        discards.forEach((card, index) => {
            const cardEl = this.createCardElement(card, player, true);
            cardEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showContextMenu(e, card, player, 'discard', index);
            });
            container.appendChild(cardEl);
        });
        
        if (discards.length === 0) {
            container.innerHTML = '<div class="empty-message">Drop trống</div>';
        }
        
        modal.classList.add('show');
    }

    // ============================================
    // SPIRIT MODAL
    // ============================================
    openSpiritModal(player, zone) {
        const modal = document.getElementById('spirit-modal');
        const container = document.getElementById('spirit-card-list');
        const title = document.getElementById('spirit-title');
        
        const zoneNames = {
            serve: 'Giao bóng',
            receive: 'Đỡ bóng', 
            toss: 'Chuyền bóng',
            attack: 'Đập bóng',
            block: 'Chắn bóng'
        };
        
        title.textContent = `Ý chí ${zoneNames[zone]} - ${this.getPlayerName(player)}`;
        container.innerHTML = '';
        
        const spirits = this.state.spiritCards[player][zone] || [];
        spirits.forEach((card, index) => {
            const cardEl = this.createCardElement(card, player, true);
            cardEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showContextMenu(e, card, player, `spirit-${zone}`, index);
            });
            container.appendChild(cardEl);
        });
        
        if (spirits.length === 0) {
            container.innerHTML = '<div class="empty-message">Không có Ý chí</div>';
        }
        
        modal.classList.add('show');
    }
    
    // ============================================
    // CONTEXT MENU
    // ============================================
    showContextMenu(e, card, player, source, index) {
        this.contextCard = card;
        this.contextPlayer = player;
        this.contextSource = source;
        this.contextIndex = index;
        
        if (this.contextMenuTitle) {
            this.contextMenuTitle.textContent = card.name;
        }
        
        // Show menu first to get dimensions
        this.contextMenu.classList.remove('hidden');
        this.contextMenu.style.left = '-9999px';
        this.contextMenu.style.top = '-9999px';
        
        // Get menu dimensions
        const rect = this.contextMenu.getBoundingClientRect();
        const menuHeight = rect.height;
        const menuWidth = rect.width;
        
        // Calculate available space
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - e.clientY;
        const spaceAbove = e.clientY;
        const spaceRight = viewportWidth - e.clientX;
        
        // Position horizontally
        let left = e.pageX;
        if (spaceRight < menuWidth) {
            left = e.pageX - menuWidth;
        }
        
        // Position vertically - prefer above if not enough space below
        let top;
        if (spaceBelow >= menuHeight) {
            // Enough space below - show below cursor
            top = e.pageY;
        } else if (spaceAbove >= menuHeight) {
            // Not enough below, but enough above - show above cursor
            top = e.pageY - menuHeight;
        } else {
            // Not enough space either way - fit to viewport
            top = Math.max(10, viewportHeight - menuHeight - 10);
        }
        
        this.contextMenu.style.left = Math.max(10, left) + 'px';
        this.contextMenu.style.top = top + 'px';
        
        // Adjust submenu position based on available space
        const submenus = this.contextMenu.querySelectorAll('.context-submenu');
        submenus.forEach(submenu => {
            if (spaceRight < menuWidth + 150) {
                submenu.classList.add('submenu-left');
            } else {
                submenu.classList.remove('submenu-left');
            }
        });
    }

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.classList.add('hidden');
        }
        this.contextCard = null;
        this.contextPlayer = null;
        this.contextSource = null;
        this.contextIndex = null;
    }

    handleContextMenuAction(action) {
        if (!this.contextCard || !this.contextPlayer) {
            this.hideContextMenu();
            return;
        }
        
        const card = this.contextCard;
        const player = this.contextPlayer;
        const source = this.contextSource;
        
        // Determine source location for logging
        const sourceInfo = { source: source || 'unknown', player: player };
        if (source === 'zone' && this.contextZone) {
            sourceInfo.zone = this.contextZone;
        }
        
        // Remove card from current location
        this.removeCardFromSource(card, player, source);
        
        // Determine target based on action
        let targetZone = null;
        let targetType = null; // 'zone', 'spirit', 'hand', 'discard', 'deck-top', 'deck-bottom'
        
        switch (action) {
            case 'spirit-serve':
                targetZone = 'serve';
                targetType = 'spirit';
                break;
            case 'spirit-receive':
                targetZone = 'receive';
                targetType = 'spirit';
                break;
            case 'spirit-toss':
                targetZone = 'toss';
                targetType = 'spirit';
                break;
            case 'spirit-attack':
                targetZone = 'attack';
                targetType = 'spirit';
                break;
            case 'spirit-block':
                targetZone = 'block';
                targetType = 'spirit';
                break;
            case 'to-hand':
                targetType = 'hand';
                break;
            case 'to-drop':
                targetType = 'discard';
                break;
            case 'to-deck-top':
                targetType = 'deck-top';
                break;
            case 'to-deck-bottom':
                targetType = 'deck-bottom';
                break;
            case 'to-serve':
                targetZone = 'serve';
                targetType = 'zone';
                break;
            case 'to-receive':
                targetZone = 'receive';
                targetType = 'zone';
                break;
            case 'to-toss':
                targetZone = 'toss';
                targetType = 'zone';
                break;
            case 'to-attack':
                targetZone = 'attack';
                targetType = 'zone';
                break;
            case 'to-block':
                targetZone = 'block';
                targetType = 'zone';
                break;
        }
        
        // Place card at target
        this.placeCardAtTarget(card, player, targetType, targetZone, sourceInfo);
        
        // Send to server if online
        if (this.isOnline && this.onlineManager) {
            this.onlineManager.socket.emit('moveCard', {
                cardUniqueId: card.uniqueId,
                player: String(player),
                targetType,
                targetZone
            });
        }
        
        this.hideContextMenu();
        this.closeAllModals();
        this.updateUI();
    }

    removeCardFromSource(card, player, source) {
        // Remove from hand
        const handIdx = this.state.hands[player].findIndex(c => c.uniqueId === card.uniqueId);
        if (handIdx !== -1) {
            this.state.hands[player].splice(handIdx, 1);
            return;
        }
        
        // Remove from zones - reset stat modifications when removing from zone
        ['serve', 'receive', 'toss', 'attack'].forEach(zone => {
            if (this.state.playedCards[player][zone]?.uniqueId === card.uniqueId) {
                // Reset stat modifications when card leaves zone
                this.resetCardModifications(card);
                this.state.playedCards[player][zone] = null;
            }
        });
        
        // Remove from block array
        const blockIdx = this.state.playedCards[player].block.findIndex(c => c.uniqueId === card.uniqueId);
        if (blockIdx !== -1) {
            this.state.playedCards[player].block.splice(blockIdx, 1);
        }
        
        // Remove from spirit zones
        ['serve', 'receive', 'toss', 'attack', 'block'].forEach(zone => {
            const idx = this.state.spiritCards[player][zone].findIndex(c => c.uniqueId === card.uniqueId);
            if (idx !== -1) {
                this.state.spiritCards[player][zone].splice(idx, 1);
            }
        });
        
        // Remove from discard
        const discardIdx = this.state.discards[player].findIndex(c => c.uniqueId === card.uniqueId);
        if (discardIdx !== -1) {
            this.state.discards[player].splice(discardIdx, 1);
        }
        
        // Remove from deck
        const deckIdx = this.state.decks[player].findIndex(c => c.uniqueId === card.uniqueId);
        if (deckIdx !== -1) {
            this.state.decks[player].splice(deckIdx, 1);
        }
    }

    placeCardAtTarget(card, player, targetType, targetZone, sourceInfo = null) {
        const cardName = card.name || 'Thẻ';
        const playerName = this.getPlayerName(player);
        let logMessage = '';
        
        // Get source location for logging
        const sourceLocation = this.getSourceLocationName(sourceInfo);
        
        switch (targetType) {
            case 'hand':
                this.state.hands[player].push(card);
                logMessage = `${playerName} đã di chuyển "${cardName}" từ ${sourceLocation} vào tay`;
                break;
            case 'discard':
                this.state.discards[player].push(card);
                logMessage = `${playerName} đã di chuyển "${cardName}" từ ${sourceLocation} vào Drop`;
                break;
            case 'deck-top':
                this.state.decks[player].push(card);
                logMessage = `${playerName} đã đặt "${cardName}" từ ${sourceLocation} lên đầu bộ bài`;
                break;
            case 'deck-bottom':
                this.state.decks[player].unshift(card);
                logMessage = `${playerName} đã đặt "${cardName}" từ ${sourceLocation} xuống cuối bộ bài`;
                break;
            case 'zone':
                if (targetZone === 'block') {
                    this.state.playedCards[player].block.push(card);
                    logMessage = `${playerName} đã đặt "${cardName}" từ ${sourceLocation} vào khu vực Chặn`;
                } else {
                    // Move existing card to spirit - reset its stat modifications
                    const existing = this.state.playedCards[player][targetZone];
                    if (existing) {
                        this.resetCardModifications(existing);
                        this.state.spiritCards[player][targetZone].push(existing);
                    }
                    this.state.playedCards[player][targetZone] = card;
                    const zoneNames = { serve: 'Giao', receive: 'Đỡ', toss: 'Chuyền', attack: 'Đập' };
                    logMessage = `${playerName} đã đặt "${cardName}" từ ${sourceLocation} vào khu vực ${zoneNames[targetZone]}`;
                }
                break;
            case 'spirit':
                // Reset stat modifications when becoming spirit
                this.resetCardModifications(card);
                this.state.spiritCards[player][targetZone].push(card);
                const zoneNames = { serve: 'Giao', receive: 'Đỡ', toss: 'Chuyền', attack: 'Đập', block: 'Chặn' };
                logMessage = `${playerName} đã đặt "${cardName}" từ ${sourceLocation} vào Ý chí khu vực ${zoneNames[targetZone]}`;
                break;
            case 'action':
                // Add to action area
                this.state.actionCards[player].push(card);
                logMessage = `${playerName} đã đặt "${cardName}" từ ${sourceLocation} vào khu vực Hành động`;
                break;
        }
        
        // Log only if it's not a visible action (like placing on zone is visible, so don't log)
        if (logMessage && targetType !== 'zone') {
            this.addLogMessage(logMessage);
        }
    }
    
    getSourceLocationName(sourceInfo) {
        if (!sourceInfo) return 'nơi không xác định';
        
        if (typeof sourceInfo === 'string') {
            const sourceNames = {
                'hand': 'tay',
                'discard': 'Drop',
                'deck': 'bộ bài',
                'zone': 'khu vực',
                'spirit': 'Ý chí',
                'action': 'khu vực Hành động'
            };
            return sourceNames[sourceInfo] || sourceInfo;
        }
        
        if (sourceInfo.source) {
            const sourceNames = {
                'hand': 'tay',
                'discard': 'Drop',
                'deck': 'bộ bài',
                'zone': sourceInfo.zone ? `khu vực ${sourceInfo.zone}` : 'khu vực',
                'spirit': 'Ý chí',
                'action': 'khu vực Hành động'
            };
            return sourceNames[sourceInfo.source] || sourceInfo.source;
        }
        
        return 'nơi không xác định';
    }

    closeAllModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // ============================================
    // GAME INITIALIZATION
    // ============================================
    startGame() {
        this.state.reset();
        // Decks are created by players in online mode
        // For offline mode, create default decks if empty
        if (!this.isOnline) {
            if (this.state.decks[1].length === 0 && this.state.decks[2].length === 0) {
                this.createDecks();
                this.shuffleDecks();
            }
        }
        this.drawInitialHands();
        this.decideFirstServer();
        this.state.phase = GamePhase.SERVE;
        this.updateUI();
    }

    createDecks() {
        for (let player = 1; player <= 2; player++) {
            this.state.decks[player] = [];
            for (let i = 0; i < 40; i++) {
                const randomCard = cardDatabase[Math.floor(Math.random() * cardDatabase.length)];
                this.state.decks[player].push({
                    ...randomCard,
                    uniqueId: `${player}-${randomCard.id}-${i}-${Date.now()}-${Math.random()}`
                });
            }
        }
    }

    shuffleDecks() {
        for (let player = 1; player <= 2; player++) {
            this.state.decks[player] = this.shuffleArray(this.state.decks[player]);
        }
    }

    drawInitialHands() {
        for (let player = 1; player <= 2; player++) {
            this.state.hands[player] = this.state.decks[player].splice(0, 6);
        }
    }

    decideFirstServer() {
        this.state.servingPlayer = Math.random() < 0.5 ? 1 : 2;
        this.state.currentPlayer = this.state.servingPlayer;
        this.state.attackingPlayer = this.state.servingPlayer;
    }
    
    // ============================================
    // ONLINE MODE
    // ============================================
    initOnlineGame(serverState, playerNumber, playerNames, onlineManager) {
        this.isOnline = true;
        this.myPlayerNumber = playerNumber;
        this.onlineManager = onlineManager;
        this.playerNames = playerNames || { 1: 'Player 1', 2: 'Player 2' };
        
        this.applyServerState(serverState);
        this.updateUI();
    }

    updateFromServer(serverState) {
        this.applyServerState(serverState);
        this.handlePhaseChange();
        this.updateUI();
    }

    applyServerState(serverState) {
        if (!serverState) return;
        
        // Map phase string to GamePhase constant
        const phaseMap = {
            'waiting': GamePhase.WAITING,
            'serve': GamePhase.SERVE,
            'receive': GamePhase.RECEIVE,
            'toss': GamePhase.TOSS,
            'attack': GamePhase.ATTACK,
            'block': GamePhase.BLOCK,
            'game_end': GamePhase.GAME_END
        };
        this.state.phase = phaseMap[serverState.phase] || serverState.phase || GamePhase.WAITING;
        this.state.currentPlayer = serverState.currentPlayer;
        this.state.servingPlayer = serverState.servingPlayer;
        this.state.attackingPlayer = serverState.attackingPlayer;
        this.state.sets = { ...serverState.sets };
        this.state.currentStats = { ...serverState.currentStats };
        
        // Copy played cards and spirit cards
        this.state.playedCards = JSON.parse(JSON.stringify(serverState.playedCards));
        this.state.spiritCards = JSON.parse(JSON.stringify(serverState.spiritCards));
        this.state.discards = JSON.parse(JSON.stringify(serverState.discards));
        this.state.hands = JSON.parse(JSON.stringify(serverState.hands));
        this.state.actionCards = JSON.parse(JSON.stringify(serverState.actionCards || { 1: [], 2: [] }));
        
        // Enrich cards with local data
        this.enrichCardsWithLocalData();
        
        // Copy deck counts
        this.state.decks = {
            1: serverState.decks[1].count !== undefined ? { length: serverState.decks[1].count } : serverState.decks[1],
            2: serverState.decks[2].count !== undefined ? { length: serverState.decks[2].count } : serverState.decks[2]
        };
    }

    enrichCardsWithLocalData() {
        const enrichCard = (card) => {
            if (!card || card.hidden) return card;
            const localCard = cardDatabase.find(c => c.cardId === card.cardId);
            if (localCard) {
                card.skill = localCard.skill;
                if (localCard.attackBase !== undefined) card.attackBase = localCard.attackBase;
                if (localCard.blockBase !== undefined) card.blockBase = localCard.blockBase;
            }
            return card;
        };
        
        for (let player = 1; player <= 2; player++) {
            this.state.hands[player] = this.state.hands[player].map(enrichCard);
            
            ['serve', 'receive', 'toss', 'attack'].forEach(zone => {
                if (this.state.playedCards[player][zone]) {
                    enrichCard(this.state.playedCards[player][zone]);
                }
            });
            
            if (this.state.playedCards[player].block) {
                this.state.playedCards[player].block = this.state.playedCards[player].block.map(enrichCard);
            }
            
            ['serve', 'receive', 'toss', 'attack', 'block'].forEach(zone => {
                if (this.state.spiritCards[player][zone]) {
                    this.state.spiritCards[player][zone] = this.state.spiritCards[player][zone].map(enrichCard);
                }
            });
            
            this.state.discards[player] = this.state.discards[player].map(enrichCard);
        }
    }

    handlePhaseChange() {
        if (this.state.phase === GamePhase.GAME_END && this.state.winner) {
            this.endGame(this.state.winner);
        }
    }

    endGame(winner) {
        if (this.gameOverModal) {
            this.winnerTextEl.textContent = `🎉 ${this.getPlayerName(winner)} thắng! 🎉`;
            this.finalScoreEl.textContent = `Tỉ số: ${this.state.sets[1]} - ${this.state.sets[2]}`;
            this.gameOverModal.classList.add('show');
        }
    }

    // ============================================
    // UI UPDATE
    // ============================================
    updateUI() {
        this.renderHands();
        this.renderZones();
        this.renderActionCards();
        this.updateDeckCounts();
        this.updatePhaseDisplay();
        this.updateScores();
        this.updateSpiritCounts();
        this.updateZoneLabels();
        this.updateZoneDimming();
    }

    renderHands() {
        [1, 2].forEach(player => {
            const handEl = player === 1 ? this.p1HandEl : this.p2HandEl;
            if (!handEl) return;
            
            handEl.innerHTML = '';
            const hand = this.state.hands[player] || [];
            
            hand.forEach((card, index) => {
                const isHidden = card.hidden || card.cardBack;
                const cardEl = this.createCardElement(card, player, !isHidden);
                
                if (!isHidden) {
                    cardEl.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.showContextMenu(e, card, player, 'hand', index);
                    });
                    
                    // Drag and drop
                    cardEl.draggable = true;
                    cardEl.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('card-id', card.uniqueId);
                        e.dataTransfer.setData('card-player', player);
                        e.dataTransfer.setData('card-source', 'hand');
                    });
                }
                
                handEl.appendChild(cardEl);
            });
        });
    }

    renderZones() {
        [1, 2].forEach(player => {
            ['serve', 'receive', 'toss', 'attack'].forEach(zone => {
                const zoneEl = this.zones[player][zone];
                if (!zoneEl) return;
                
                zoneEl.innerHTML = '';
                const card = this.state.playedCards[player][zone];
                
                if (card) {
                    const cardEl = this.createCardElement(card, player, true);
                    cardEl.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.showContextMenu(e, card, player, zone, 0);
                    });
                    
                    // Allow dragging card from zone to replace it
                    cardEl.draggable = true;
                    cardEl.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('card-id', card.uniqueId);
                        e.dataTransfer.setData('card-player', player);
                        e.dataTransfer.setData('card-source', 'zone');
                        e.dataTransfer.setData('card-zone', zone);
                    });
                    
                    zoneEl.appendChild(cardEl);
                }
            });
        });
        
        // Render block zone (shared)
        const blockEl = this.zones[1].block;
        if (blockEl) {
            blockEl.innerHTML = '';
            
            [1, 2].forEach(player => {
                const blockCards = this.state.playedCards[player].block || [];
                blockCards.forEach((card, index) => {
                    const cardEl = this.createCardElement(card, player, true);
                    cardEl.classList.add('block-card', `player-${player}-block`);
                    cardEl.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.showContextMenu(e, card, player, 'block', index);
                    });
                    
                    // Allow dragging card from block zone
                    cardEl.draggable = true;
                    cardEl.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('card-id', card.uniqueId);
                        e.dataTransfer.setData('card-player', player);
                        e.dataTransfer.setData('card-source', 'block');
                        e.dataTransfer.setData('card-index', index);
                    });
                    
                    blockEl.appendChild(cardEl);
                });
                    });
                }
            }
            
    renderActionCards() {
        // Ensure actionAreaEls exists
        if (!this.actionAreaEls) {
            this.actionAreaEls = {
                1: document.getElementById('p1-action-cards'),
                2: document.getElementById('p2-action-cards')
            };
        }
        
        [1, 2].forEach(player => {
            const actionEl = this.actionAreaEls[player];
            if (!actionEl) {
                console.warn(`⚠️ Action area element not found for player ${player}`);
                return;
            }
            
            actionEl.innerHTML = '';
            const actionCards = this.state.actionCards[player] || [];
            
            actionCards.forEach((card, index) => {
                const cardEl = this.createCardElement(card, player, true);
                cardEl.classList.add('action-card');
                
                cardEl.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showContextMenu(e, card, player, 'action', index);
                });
                
                // Allow dragging from action area
                cardEl.draggable = true;
                cardEl.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('card-id', card.uniqueId);
                    e.dataTransfer.setData('card-player', player);
                    e.dataTransfer.setData('card-source', 'action');
                });
                
                actionEl.appendChild(cardEl);
            });
        });
    }
            
    createCardElement(card, player, showFront = true) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.uniqueId = card.uniqueId;
        cardEl.dataset.player = player;
        
        // Add card type for CSS styling
        if (card.type === 'action') {
            cardEl.dataset.cardType = 'action';
        }
        
        if (showFront && !card.hidden && !card.cardBack) {
            const artworkUrl = card.artwork || '';
            // Clean card display - no overlay
            cardEl.innerHTML = `
                <div class="card-front">
                    ${artworkUrl ? `<img class="card-artwork" src="${artworkUrl}" alt="${card.name}">` : '<div class="card-placeholder">🏐</div>'}
                </div>
            `;
            
            // Hover preview
            cardEl.addEventListener('mouseenter', () => this.showCardPreview(card));
            cardEl.addEventListener('mouseleave', () => this.hideCardPreview());
                            } else {
            cardEl.innerHTML = `<div class="card-back">🏐</div>`;
        }
        
        return cardEl;
    }

    async showCardPreview(card) {
        this.currentPreviewCard = card;
        
        const previewFullCard = document.getElementById('preview-full-card');
        const previewName = document.getElementById('preview-name');
        const previewStats = document.getElementById('preview-stats');
        
        // Load JSON data for this card
        let jsonData = null;
        if (card.cardId) {
            try {
                // Determine JSON path based on cardId
                let jsonPath = '';
                if (card.type === 'action') {
                    jsonPath = `Card/${card.school}/Hanh dong/${card.cardId}.json`;
                } else {
                    jsonPath = `Card/${card.school}/Nhan vat/${card.cardId}.json`;
                }
                
                const response = await fetch(jsonPath);
                if (response.ok) {
                    jsonData = await response.json();
                }
            } catch (error) {
                console.warn('Could not load JSON for card:', card.cardId, error);
            }
        }
        
        // Use JSON data if available, otherwise fallback to card data
        const displayName = jsonData?.name || card.name;
        const displayStats = jsonData?.stats || {
            serve: card.serve || 0,
            receive: card.receive || 0,
            toss: card.toss || 0,
            attack: card.attack || 0,
            block: card.block || 0
        };
        const displaySkill = jsonData?.skill?.description || card.skill || '';
        // Convert JSON path to PNG - replace .json with .png
        let artworkPath = jsonData?.artwork || card.artwork;
        if (artworkPath && artworkPath.endsWith('.json')) {
            artworkPath = artworkPath.replace('.json', '.png');
        }
        
        if (previewFullCard) {
            if (artworkPath) {
                // For action cards, use original horizontal PNG (no rotation in preview)
                const isAction = card.type === 'action';
                const imgClass = isAction ? 'action-card-preview' : '';
                previewFullCard.innerHTML = `<img src="${artworkPath}" alt="${displayName}" class="${imgClass}">`;
            } else {
                previewFullCard.innerHTML = '<div class="card-placeholder">🏐</div>';
            }
        }
        
        if (previewName) {
            previewName.textContent = displayName;
        }
        
        // Show skill in preview (if exists)
        if (displaySkill) {
            // Add skill to preview name or create a skill display
            const skillEl = document.createElement('div');
            skillEl.className = 'preview-skill-text';
            skillEl.textContent = displaySkill;
            skillEl.style.cssText = 'font-size: 0.85rem; color: #ffd700; margin-top: 8px; padding: 8px; background: rgba(255, 215, 0, 0.1); border-radius: 4px; line-height: 1.4;';
            if (previewFullCard && previewFullCard.parentElement) {
                // Remove existing skill if any
                const existingSkill = previewFullCard.parentElement.querySelector('.preview-skill-text');
                if (existingSkill) existingSkill.remove();
                previewFullCard.parentElement.appendChild(skillEl);
            }
        }
        
        // Get current stats (with modifications)
        const stats = this.getCardStats(card);
        
        if (previewStats) {
            previewStats.innerHTML = `
                <div class="preview-stat" data-stat="serve"><span>Giao:</span><span class="stat-value" data-stat="serve">${stats.serve}</span></div>
                <div class="preview-stat" data-stat="receive"><span>Đỡ:</span><span class="stat-value" data-stat="receive">${stats.receive}</span></div>
                <div class="preview-stat" data-stat="toss"><span>Chuyền:</span><span class="stat-value" data-stat="toss">${stats.toss}</span></div>
                <div class="preview-stat" data-stat="attack"><span>Đập:</span><span class="stat-value" data-stat="attack">${stats.attack}</span></div>
                <div class="preview-stat" data-stat="block"><span>Chặn:</span><span class="stat-value" data-stat="block">${stats.block}</span></div>
            `;
            
            // Add click handlers for stat modification (only if not in deck builder)
            const deckBuilderModal = document.getElementById('deck-builder-modal');
            const isDeckBuilderOpen = deckBuilderModal && deckBuilderModal.classList.contains('show');
            
            if (!isDeckBuilderOpen) {
                previewStats.querySelectorAll('.stat-value').forEach(statEl => {
                    const statName = statEl.dataset.stat;
                    
                    // Left click to increase
                    statEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.modifyCardStat(card, statName, 1);
                    });
                    
                    // Right click to decrease
                    statEl.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.modifyCardStat(card, statName, -1);
            });
        });
            }
        }
    }
    
    getCardStats(card) {
        // Return current stats including modifications
        return {
            serve: card.modifiedServe ?? card.serve,
            receive: card.modifiedReceive ?? card.receive,
            toss: card.modifiedToss ?? card.toss,
            attack: card.modifiedAttack ?? card.attack,
            block: card.modifiedBlock ?? card.block
        };
    }
    
    modifyCardStat(card, statName, delta) {
        if (!card) return;
        
        const modKey = `modified${statName.charAt(0).toUpperCase() + statName.slice(1)}`;
        const baseValue = typeof card[statName] === 'string' ? 
            parseInt(card[statName]) || card[`${statName}Base`] || 0 : 
            card[statName];
        
        // Initialize modified value if not set
        if (card[modKey] === undefined) {
            card[modKey] = baseValue;
        }
        
        // Apply delta
        card[modKey] = Math.max(0, card[modKey] + delta);
        
        // Update preview display
        this.showCardPreview(card);
        
        // Update zone labels if card is in a zone
        this.updateZoneLabels();
        
        // Sync with server if online
        if (this.isOnline && this.onlineManager) {
            this.onlineManager.socket.emit('modifyCardStat', {
                cardUniqueId: card.uniqueId,
                statName,
                value: card[modKey]
            });
        }
    }
    
    resetCardModifications(card) {
        if (!card) return;
        delete card.modifiedServe;
        delete card.modifiedReceive;
        delete card.modifiedToss;
        delete card.modifiedAttack;
        delete card.modifiedBlock;
    }

    hideCardPreview() {
        // Keep last preview visible
    }

    updateDeckCounts() {
        if (this.p1DeckCountEl) {
            const count = Array.isArray(this.state.decks[1]) ? this.state.decks[1].length : (this.state.decks[1]?.length || 0);
            this.p1DeckCountEl.textContent = count;
        }
        if (this.p2DeckCountEl) {
            const count = Array.isArray(this.state.decks[2]) ? this.state.decks[2].length : (this.state.decks[2]?.length || 0);
            this.p2DeckCountEl.textContent = count;
        }
    }

    updatePhaseDisplay() {
        if (this.phaseEl) {
            const phaseNames = {
                [GamePhase.WAITING]: 'CHỜ',
                [GamePhase.SERVE]: 'GIAO',
                [GamePhase.RECEIVE]: 'ĐỠ',
                [GamePhase.TOSS]: 'CHUYỀN',
                [GamePhase.ATTACK]: 'ĐẬP',
                [GamePhase.BLOCK]: 'CHẶN',
                [GamePhase.GAME_END]: 'KẾT THÚC'
            };
            this.phaseEl.textContent = phaseNames[this.state.phase] || this.state.phase?.toUpperCase();
        }
        
        if (this.turnIndicatorEl) {
            this.turnIndicatorEl.textContent = `Lượt: ${this.getPlayerName(this.state.currentPlayer)}`;
        }
        
        // Update play-area background based on phase
        this.updatePhaseBackground();
    }
    
    updatePhaseBackground() {
        const playArea = document.querySelector('.play-area');
        if (!playArea) return;
        
        // Remove all phase classes
        playArea.classList.remove('phase-serve', 'phase-receive', 'phase-toss', 'phase-attack', 'phase-block');
        
        // Add current phase class
        const phaseClass = {
            [GamePhase.SERVE]: 'phase-serve',
            [GamePhase.RECEIVE]: 'phase-receive',
            [GamePhase.TOSS]: 'phase-toss',
            [GamePhase.ATTACK]: 'phase-attack',
            [GamePhase.BLOCK]: 'phase-block'
        };
        
        if (phaseClass[this.state.phase]) {
            playArea.classList.add(phaseClass[this.state.phase]);
        }
    }

    updateScores() {
        if (this.p1SetsEl) {
            this.p1SetsEl.textContent = this.state.sets[1];
        }
        if (this.p2SetsEl) {
            this.p2SetsEl.textContent = this.state.sets[2];
        }
        
        // Update player name tags
        const p1NameTag = document.getElementById('p1-name-tag');
        const p2NameTag = document.getElementById('p2-name-tag');
        if (p1NameTag) {
            p1NameTag.textContent = this.getPlayerName(1);
        }
        if (p2NameTag) {
            p2NameTag.textContent = this.getPlayerName(2);
        }
    }

    updateSpiritCounts() {
        [1, 2].forEach(player => {
            ['serve', 'receive', 'toss', 'attack'].forEach(zone => {
                const countEl = document.getElementById(`p${player}-${zone}-spirit`);
                if (countEl) {
                    const count = this.state.spiritCards[player][zone]?.length || 0;
                    countEl.textContent = count;
                }
            });
        });
    }
    
    updateZoneLabels() {
        const zoneNames = {
            serve: 'Giao',
            receive: 'Đỡ',
            toss: 'Chuyền',
            attack: 'Đập'
        };
        
        const statMap = {
            serve: 'serve',
            receive: 'receive',
            toss: 'toss',
            attack: 'attack'
        };
        
        [1, 2].forEach(player => {
            ['serve', 'receive', 'toss', 'attack'].forEach(zone => {
                const labelEl = document.getElementById(`p${player}-${zone}-label`);
                if (!labelEl) return;
                
                const card = this.state.playedCards[player][zone];
                if (card) {
                    const stats = this.getCardStats(card);
                    const statValue = stats[statMap[zone]];
                    labelEl.textContent = `${zoneNames[zone]} - ${statValue}`;
        } else {
                    labelEl.textContent = zoneNames[zone];
                }
            });
        });
    }
    
    updateZoneDimming() {
        const phase = this.state.phase;
        const currentPlayer = this.state.currentPlayer;
        const servingPlayer = this.state.servingPlayer;
        
        // Determine which player's zone should be highlighted for each phase
        // Phase cycle: SERVE A → RECEIVE B → TOSS B → ATTACK B → BLOCK A → RECEIVE A → TOSS A → ATTACK A → BLOCK B
        let activePlayer = null;
        let activeZone = null;
        
        if (phase === GamePhase.SERVE) {
            activePlayer = servingPlayer;
            activeZone = 'serve';
        } else if (phase === GamePhase.RECEIVE) {
            activePlayer = currentPlayer;
            activeZone = 'receive';
        } else if (phase === GamePhase.TOSS) {
            activePlayer = currentPlayer;
            activeZone = 'toss';
        } else if (phase === GamePhase.ATTACK) {
            activePlayer = currentPlayer;
            activeZone = 'attack';
        } else if (phase === GamePhase.BLOCK) {
            activePlayer = currentPlayer; // currentPlayer is the blocking player
            activeZone = 'block';
        }
        
        // Get all zone elements
        document.querySelectorAll('.zone').forEach(zoneEl => {
            const zoneType = zoneEl.dataset.zone;
            const zonePlayer = parseInt(zoneEl.dataset.player);
            
            // Skip if no phase config or during waiting
            if (!activePlayer || !activeZone || phase === GamePhase.WAITING || phase === GamePhase.GAME_END) {
                zoneEl.classList.remove('zone-dimmed');
                return;
            }
            
            // Check if this zone should be active
            const isActiveZone = zoneType === activeZone && zonePlayer === activePlayer;
            
            if (isActiveZone) {
                zoneEl.classList.remove('zone-dimmed');
            } else {
                zoneEl.classList.add('zone-dimmed');
            }
        });
        
        // Handle block zone specially (it's shared, but we highlight based on activePlayer)
        const blockZone = document.getElementById('p1-block-zone');
        if (blockZone) {
            if (phase === GamePhase.BLOCK && activePlayer === 1) {
                blockZone.classList.remove('zone-dimmed');
            } else if (phase === GamePhase.BLOCK && activePlayer === 2) {
                // Player 2's block zone (p2-block-zone)
                blockZone.classList.add('zone-dimmed');
            } else if (phase !== GamePhase.WAITING && phase !== GamePhase.GAME_END) {
                blockZone.classList.add('zone-dimmed');
            } else {
                blockZone.classList.remove('zone-dimmed');
            }
        }
        
        // Also handle p2-block-zone if it exists
        const blockZone2 = document.getElementById('p2-block-zone');
        if (blockZone2) {
            if (phase === GamePhase.BLOCK && activePlayer === 2) {
                blockZone2.classList.remove('zone-dimmed');
            } else if (phase === GamePhase.BLOCK && activePlayer === 1) {
                blockZone2.classList.add('zone-dimmed');
            } else if (phase !== GamePhase.WAITING && phase !== GamePhase.GAME_END) {
                blockZone2.classList.add('zone-dimmed');
            } else {
                blockZone2.classList.remove('zone-dimmed');
            }
        }
    }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new HaikyuuCardGame();
    window.game = game;
});
