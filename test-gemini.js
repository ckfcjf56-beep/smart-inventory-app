// Gemini API 테스트 스크립트 (수정 버전)
// 사용법: node test-gemini-fixed.js

const https = require('https');

// 여기에 API 키를 입력하세요 (따옴표로 감싸기!)
const API_KEY = 'AIzaSyAkak8ZMrUHwGV01nPw69QCs1qnfwipZiA';

const testMessage = '안녕하세요! 간단히 자기소개 해주세요.';

console.log('🤖 Gemini API 테스트 시작...\n');
console.log(`📝 테스트 메시지: "${testMessage}"\n`);

const data = JSON.stringify({
  contents: [{
    parts: [{ text: testMessage }]
  }]
});

// 여러 모델 버전 시도
const models = [
  'gemini-1.5-flash',           // 가장 안정적
  'gemini-1.5-pro',             // 고성능 버전
  'gemini-pro',                 // 구버전
  'gemini-2.0-flash-exp'        // 실험 버전
];

let currentModelIndex = 0;

function tryModel(modelName) {
  console.log(`\n🔄 모델 시도: ${modelName}\n`);

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log(`📊 HTTP 상태 코드: ${res.statusCode}`);

      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(responseData);
          const answer = json?.candidates?.[0]?.content?.parts?.[0]?.text || '응답 없음';
          console.log('\n✅ 성공! AI 응답:\n');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(answer);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log(`🎉 ${modelName} 모델이 정상 작동합니다!`);
          console.log(`\n💡 .env 파일이나 React 앱에서 이 모델을 사용하세요:`);
          console.log(`   모델명: ${modelName}`);
        } catch (e) {
          console.error('❌ JSON 파싱 오류:', e.message);
          console.log('원본 응답:', responseData);
          tryNextModel();
        }
      } else if (res.statusCode === 429) {
        console.error('\n⚠️  429 Too Many Requests - 무료 할당량 초과\n');
        console.log('해결 방법:');
        console.log('1. 몇 시간 후 다시 시도 (할당량은 UTC 자정에 리셋)');
        console.log('2. Google AI Studio에서 새 프로젝트로 API 키 재발급');
        console.log('3. Google Cloud Console에서 결제 활성화\n');
        console.log('📌 현재 무료 제한: 하루 15 requests, 분당 15 requests');
      } else if (res.statusCode === 400) {
        console.error(`\n❌ 400 Bad Request - ${modelName} 모델 사용 불가\n`);
        try {
          const errorJson = JSON.parse(responseData);
          console.log('오류 내용:', errorJson.error?.message || responseData);
        } catch {
          console.log('오류 내용:', responseData);
        }
        tryNextModel();
      } else if (res.statusCode === 403) {
        console.error('\n🔒 403 Forbidden - API 키 권한 문제\n');
        console.log('API 키를 확인하세요: https://aistudio.google.com/apikey');
      } else if (res.statusCode === 404) {
        console.error(`\n❌ 404 Not Found - ${modelName} 모델을 찾을 수 없음\n`);
        tryNextModel();
      } else {
        console.error(`\n❌ 오류 발생 (${res.statusCode})\n`);
        console.log('응답 내용:', responseData);
        tryNextModel();
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ 네트워크 오류:', error.message);
    console.log('인터넷 연결을 확인하세요.\n');
  });

  req.write(data);
  req.end();
}

function tryNextModel() {
  currentModelIndex++;
  if (currentModelIndex < models.length) {
    setTimeout(() => {
      tryModel(models[currentModelIndex]);
    }, 1000);
  } else {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ 모든 모델 테스트 실패');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('가능한 원인:');
    console.log('1. API 키가 잘못됨');
    console.log('2. 무료 할당량 초과 (429 에러)');
    console.log('3. 인터넷 연결 문제');
    console.log('\n새 API 키 발급: https://aistudio.google.com/apikey');
  }
}

// 첫 번째 모델부터 시도
tryModel(models[currentModelIndex]);