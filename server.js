const express = require('express');
const cors = require('cors');
const axios = require('axios');
const XLSX = require('xlsx');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ============================================================
// Gemini AI 설정
// ============================================================
const genAI = new GoogleGenerativeAI('AIzaSyDulQlx2CxbO5foZIFyghq25UpQhrod-Qw');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ============================================================
// OneDrive 엑셀 파일 링크 (직접 다운로드 URL 변환)
// ============================================================
const ONEDRIVE_SHARE_LINK = 'https://1drv.ms/x/c/a4af552d7a74f298/IQARzoFN1UAHT7QPwERgm4vCAY-ZIjOAiIkrkj0edcnhvE8?e=GtTsHI';

// OneDrive 공유 링크 → 직접 다운로드 URL 변환
function convertOneDriveLink(shareLink) {
  const encoded = Buffer.from(shareLink).toString('base64');
  return `https://api.onedrive.com/v1.0/shares/u!${encoded.replace(/=/g, '')}/root/content`;
}

// ============================================================
// 엑셀 파일 읽기 (OneDrive에서 직접 다운로드)
// ============================================================
let cachedData = null;
let lastFetchTime = null;
const CACHE_DURATION = 60 * 1000; // 1분 캐시

async function fetchExcelData() {
  const now = Date.now();
  if (cachedData && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    // 방법 1: OneDrive API 직접 변환 시도
    const downloadUrl = convertOneDriveLink(ONEDRIVE_SHARE_LINK);
    let response;

    try {
      response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
    } catch (e) {
      // 방법 2: 공유 링크 직접 요청 후 리다이렉트 따라가기
      response = await axios.get(ONEDRIVE_SHARE_LINK, {
        responseType: 'arraybuffer',
        timeout: 10000,
        maxRedirects: 10,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
    }

    const workbook = XLSX.read(Buffer.from(response.data), { type: 'buffer' });

    // 시트명: 재고관리
    const sheetName = '재고관리';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      console.error(`시트 "${sheetName}"를 찾을 수 없습니다. 사용 가능한 시트: ${workbook.SheetNames}`);
      return getDummyData();
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // 필드 매핑
    const mappedData = jsonData.map((row, index) => ({
      id: index + 1,
      부품종류: row['부품종류'] || '',
      모델명: row['모델명'] || '',
      적용설비: row['적용설비'] || '',
      현재수량: Number(row['현재수량']) || 0,
      최소보유수량: Number(row['최소보유수량']) || 0,
      최종수정시각: row['최종수정시각'] || ''
    }));

    cachedData = mappedData;
    lastFetchTime = now;

    console.log(`✅ 엑셀 데이터 로드 완료: ${mappedData.length}건`);
    return mappedData;

  } catch (error) {
    console.error('❌ OneDrive 엑셀 파일 읽기 실패:', error.message);

    // 개발 테스트용 더미 데이터 반환
    console.log('⚠️ 테스트용 더미 데이터 반환 중...');
    return getDummyData();
  }
}

// ============================================================
// 테스트용 더미 데이터 (OneDrive 연동 실패 시 사용)
// ============================================================
function getDummyData() {
  return [
    { id: 1, 부품종류: '베어링', 모델명: 'SKF-6205', 적용설비: '펌프A', 현재수량: 15, 최소보유수량: 5, 최종수정시각: '2026-02-03 09:00' },
    { id: 2, 부품종류: '베어링', 모델명: 'SKF-6304', 적용설비: '펌프B', 현재수량: 3, 최소보유수량: 5, 최종수정시각: '2026-02-02 14:30' },
    { id: 3, 부품종류: '베어링', 모델명: 'NSK-7205', 적용설비: '모터C', 현재수량: 8, 최소보유수량: 3, 최종수정시각: '2026-02-01 11:00' },
    { id: 4, 부품종류: '오일필터', 모델명: 'MANN-W940', 적용설비: '컴프레서1', 현재수량: 20, 최소보유수량: 8, 최종수정시각: '2026-02-03 08:00' },
    { id: 5, 부품종류: '오일필터', 모델명: 'MANN-W1060', 적용설비: '컴프레서2', 현재수량: 4, 최소보유수량: 6, 최종수정시각: '2026-01-30 16:00' },
    { id: 6, 부품종류: '오일필터', 모델명: 'Donaldson-P551', 적용설비: '펌프D', 현재수량: 10, 최소보유수량: 4, 최종수정시각: '2026-02-02 10:15' },
    { id: 7, 부품종류: '벨트', 모델명: 'Gates-A68', 적용설비: '모터A', 현재수량: 6, 최소보유수량: 3, 최종수정시각: '2026-02-01 09:30' },
    { id: 8, 부품종류: '벨트', 모델명: 'Gates-B82', 적용설비: '모터B', 현재수량: 2, 최소보유수량: 4, 최종수정시각: '2026-01-28 13:00' },
    { id: 9, 부품종류: '패킹', 모델명: 'Teikoku-S1', 적용설비: '펌프A', 현재수량: 30, 최소보유수량: 10, 최종수정시각: '2026-02-03 07:45' },
    { id: 10, 부품종류: '패킹', 모델명: 'Teikoku-S2', 적용설비: '펌프B', 현재수량: 5, 최소보유수량: 8, 최종수정시각: '2026-01-25 11:20' },
    { id: 11, 부품종류: '볼트/너트', 모델명: 'M12-SUS304', 적용설비: '구조체1', 현재수량: 100, 최소보유수량: 30, 최종수정시각: '2026-02-02 15:00' },
    { id: 12, 부품종류: '볼트/너트', 모델명: 'M16-SUS316', 적용설비: '구조체2', 현재수량: 25, 최소보유수량: 20, 최종수정시각: '2026-02-01 08:00' },
    { id: 13, 부품종류: '감속기', 모델명: 'SEW-R57', 적용설비: '컨베이어1', 현재수량: 4, 최소보유수량: 2, 최종수정시각: '2026-01-29 14:00' },
    { id: 14, 부품종류: '감속기', 모델명: 'SEW-R67', 적용설비: '컨베이어2', 현재수량: 1, 최소보유수량: 2, 최종수정시각: '2026-01-20 09:00' },
  ];
}

// ============================================================
// API Routes
// ============================================================

// [GET] 전체 재고 데이터
app.get('/api/inventory', async (req, res) => {
  try {
    const data = await fetchExcelData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] 부품종류별 그룹화된 데이터
app.get('/api/inventory/categories', async (req, res) => {
  try {
    const data = await fetchExcelData();
    const categories = {};

    data.forEach(item => {
      if (!categories[item.부품종류]) {
        categories[item.부품종류] = {
          name: item.부품종류,
          totalCount: 0,
          itemCount: 0,
          lowStockCount: 0,
          items: []
        };
      }
      categories[item.부품종류].items.push(item);
      categories[item.부품종류].totalCount += item.현재수량;
      categories[item.부품종류].itemCount += 1;
      if (item.현재수량 <= item.최소보유수량) {
        categories[item.부품종류].lowStockCount += 1;
      }
    });

    res.json({ success: true, data: Object.values(categories) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] 특정 부품종류의 상세 리스트
app.get('/api/inventory/category/:categoryName', async (req, res) => {
  try {
    const data = await fetchExcelData();
    const filtered = data.filter(item => item.부품종류 === req.params.categoryName);
    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] 전체 사용량 요약
app.get('/api/inventory/summary', async (req, res) => {
  try {
    const data = await fetchExcelData();

    const summary = {
      totalItems: data.length,                                          // 전체 부품 종류 수
      totalQuantity: data.reduce((sum, d) => sum + d.현재수량, 0),      // 전체 재고 수량
      lowStockItems: data.filter(d => d.현재수량 <= d.최소보유수량),     // 부족 재고 목록
      lowStockCount: data.filter(d => d.현재수량 <= d.최소보유수량).length,
      categoryBreakdown: {}                                             // 종류별 요약
    };

    data.forEach(item => {
      if (!summary.categoryBreakdown[item.부품종류]) {
        summary.categoryBreakdown[item.부품종류] = { total: 0, count: 0, lowStock: 0 };
      }
      summary.categoryBreakdown[item.부품종류].total += item.현재수량;
      summary.categoryBreakdown[item.부품종류].count += 1;
      if (item.현재수량 <= item.최소보유수량) {
        summary.categoryBreakdown[item.부품종류].lowStock += 1;
      }
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// [POST] Gemini AI 채팅
// ============================================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const inventoryData = await fetchExcelData();

    // 재고 데이터를 AI에게 컨텍스트로 제공
    const inventoryContext = `
현재 스페어파츠 재고 상황:
${JSON.stringify(inventoryData, null, 2)}

규칙:
- 현재수량 ≤ 최소보유수량이면 → 재고 부족 상태
- 재고 부족 시 입고 권유
- 사용자가 입출고를 요청하면 구체적인 권유를 해주세요
- 질문에 대해 정확하고 간결하게 답변하세요
- 한국어로 답변해주세요
`;

    // 대화 히스토리 구성
    const contents = [];

    // 이전 대화 히스토리 추가
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.text }]
        });
      });
    }

    // 현재 메시지 (재고 컨텍스트 포함)
    contents.push({
      role: 'user',
      parts: [{ text: `${inventoryContext}\n\n사용자 질문: ${message}` }]
    });

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();

    res.json({
      success: true,
      message: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, message: 'AI 응답 중 오류가 발생했습니다.' });
  }
});

// ============================================================
// 서버 시작
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🚀 백엔드 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📋 API 엔드포인트:`);
  console.log(`   GET  /api/inventory          - 전체 재고`);
  console.log(`   GET  /api/inventory/categories - 종류별 그룹`);
  console.log(`   GET  /api/inventory/category/:name - 특정 종류 상세`);
  console.log(`   GET  /api/inventory/summary  - 전체 요약`);
  console.log(`   POST /api/ai/chat            - AI 채팅\n`);
});
