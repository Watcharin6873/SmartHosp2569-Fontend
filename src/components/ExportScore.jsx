import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// =========================
// 🔥 map data (reuse)
// =========================
const mapRowData = (item) => {
    return [
        Number(item.zone),
        item.province,
        `${item.hospital_name} (${item.hospital_code})`,

        item.ans_value_id1,
        item.ans_required_id1,

        item.ans_value_id2,
        item.ans_required_id2,

        item.ans_value_id3,
        item.ans_required_id3,

        item.ans_value_id4,

        item.total_ans_value,
        item.total_ans_required,

        item.score_level,
        item.cyber_levelname,
    ];
};

// =========================
// 🚀 MAIN EXPORT
// =========================
const ExportScore = async (finalData) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Report");

    // =========================
    // 🟩 HEADER ROW 1
    // =========================
    ws.addRow([
        "เขต",
        "จังหวัด",
        "โรงพยาบาล",
        "ด้านโครงสร้าง", "",
        "ด้านบริหารจัดการ", "",
        "ด้านการบริการ", "",
        "ด้านบุคลากร",
        "คะแนนที่ได้(รวม)",
        "คะแนนจำเป็น(รวม)",
        "ระดับที่ได้",
        "ระดับ CTAM +"
    ]);

    // =========================
    // 🟩 HEADER ROW 2
    // =========================
    ws.addRow([
        "", "", "",
        "คะแนนที่ได้", "คะแนนจำเป็น",
        "คะแนนที่ได้", "คะแนนจำเป็น",
        "คะแนนที่ได้", "คะแนนจำเป็น",
        "คะแนนที่ได้",
        "", "", "", ""
    ]);

    // =========================
    // 🔥 MERGE
    // =========================
    ws.mergeCells("A1:A2");
    ws.mergeCells("B1:B2");
    ws.mergeCells("C1:C2");

    ws.mergeCells("D1:E1");
    ws.mergeCells("F1:G1");
    ws.mergeCells("H1:I1");

    ws.mergeCells("J1:J2");
    ws.mergeCells("K1:K2");
    ws.mergeCells("L1:L2");
    ws.mergeCells("M1:M2");
    ws.mergeCells("N1:N2");

    // =========================
    // 🟩 STYLE HEADER
    // =========================
    const headerColor = "FFB7D7C5";

    [1, 2].forEach((rowNum) => {
        const row = ws.getRow(rowNum);
        row.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: headerColor },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
    });

    // =========================
    // 📊 DATA
    // =========================
    finalData.forEach((item) => {
        const row = ws.addRow(mapRowData(item));

        row.eachCell((cell, colNumber) => {
            // default alignment
            cell.alignment = { horizontal: "center", vertical: "middle" };

            // 👉 hospital left + wrap
            if (colNumber === 3) {
                cell.alignment = {
                    horizontal: "left",
                    vertical: "middle",
                    wrapText: true,
                };
            }

            // 👉 CTAM
            if (colNumber === 14) {
                const currentFont = cell.font || {};

                if (item.cyber_levelname?.includes("ไม่ผ่าน")) {
                    // 🔴 ไม่ผ่าน
                    cell.font = {
                        ...currentFont,
                        color: { argb: "FFFF0000" },
                    };
                } else if (item.cyber_levelname?.includes("ผ่าน")) {
                    // 🟢 ผ่าน
                    cell.font = {
                        ...currentFont,
                        color: { argb: "FF28A745" }, // เขียว (Bootstrap success)
                    };
                }
            }

            // 👉 ระดับคะแนน
            if (colNumber === 13) {
                const currentFont = cell.font || {};

                if (item.score_level?.includes("เพชร")) {
                    cell.font = {
                        ...currentFont,
                        bold: true,
                        color: { argb: "FF007BFF" },
                    };
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFE6F0FF" },
                    };
                } else if (item.score_level?.includes("ทอง")) {
                    cell.font = {
                        ...currentFont,
                        color: { argb: "FFFFC000" },
                    };
                } else if (item.score_level?.includes("เงิน")) {
                    cell.font = {
                        ...currentFont,
                        color: { argb: "FF808080" },
                    };
                } else if (item.score_level?.includes("ไม่ผ่าน")) {
                    cell.font = {
                        ...currentFont,
                        color: { argb: "FFFF0000" },
                    };
                }
            }

            // border
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
    });

    // =========================
    // 📏 COLUMN WIDTH
    // =========================
    ws.columns = [
        { width: 6 },
        { width: 14 },
        { width: 40 },
        { width: 12 }, { width: 12 },
        { width: 12 }, { width: 12 },
        { width: 12 }, { width: 12 },
        { width: 12 },
        { width: 16 },
        { width: 18 },
        { width: 14 },
        { width: 25 },
    ];

    // =========================
    // ❄️ FREEZE HEADER
    // =========================
    ws.views = [{ state: "frozen", ySplit: 2 }];

    // =========================
    // 🔍 FILTER
    // =========================
    ws.autoFilter = {
        from: "A2",
        to: "N2",
    };

    // =========================
    // 🚀 EXPORT
    // =========================
    const buffer = await wb.xlsx.writeBuffer({
        useStyles: true,
        useSharedStrings: true,
    });

    saveAs(
        new Blob([buffer]),
        "รายละเอียดคะแนนทั้งหมด(Smarthospital69).xlsx"
    );
};

export default ExportScore;