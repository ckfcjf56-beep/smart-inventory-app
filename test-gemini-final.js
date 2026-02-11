// Gemini API 최종 테스트 (올바른 모델명 사용)
// 사용법: node test-gemini-final.js

const https = require('https');

const API_KEY = 'AIzaSyDulQlx2CxbO5foZIFyghq25UpQhrod-Qw';
const testMessage = '안녕하세요! 간단히 자기소개 해주세요.';

console.log('🤖 Gemini API 최종 테스트\n');
console.log(`📝 메시지: "${testMessage}"\n`);

const data = JSON.stringify({
  contents: [{
    parts: [{ text: testMessage }]
  }]
});

const models = [
  'gemini-2.5-flash',      // 최신, 가장 빠름
  'gemini-2.0-flash',      // 안정 버전
  'gemini-2.5-pro'         // 고성능
];

let currentIndex = 0;

function tryModel(modelName) {
  console.log(`🔄 시도: ${modelName}\n`);

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
      console.log(`📊 상태: ${res.statusCode}\n`);

      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(responseData);
          const answer = json?.candidates?.[0]?.content?.parts?.[0]?.text || '응답 없음';
          
          console.log('✅✅✅ 성공! ✅✅✅\n');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(answer);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log(`🎉 ${modelName} 모델 작동 확인!\n`);
          console.log('💡 React 앱에서 사용할 모델명:');
          console.log(`   ${modelName}\n`);
          
        } catch (e) {
          console.error('❌ 파싱 오류:', e.message);
          tryNext();
        }
      } else if (res.statusCode === 429) {
        console.error('⚠️ 429 - 할당량 초과\n');
        console.log('해결: 새 API 키 발급 또는 몇 시간 대기\n');
      } else if (res.statusCode === 400) {
        console.error('❌ 400 - 요청 오류\n');
        try {
          const err = JSON.parse(responseData);
          console.log('내용:', err.error?.message || responseData);
        } catch {
          console.log('내용:', responseData);
        }
        tryNext();
      } else if (res.statusCode === 403) {
        console.error('🔒 403 - API 키 권한 문제\n');
      } else {
        console.error(`❌ ${res.statusCode} 오류\n`);
        console.log(responseData);
        tryNext();
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 네트워크 오류:', error.message);
  });

  req.write(data);
  req.end();
}

function tryNext() {
  currentIndex++;
  if (currentIndex < models.length) {
    setTimeout(() => tryModel(models[currentIndex]), 1000);
  } else {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ 모든 모델 실패');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

tryModel(models[currentIndex]);
