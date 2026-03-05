import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BASE_URL = 'https://inventory-backend-2-6yqv.onrender.com/api';

// ============================================================
// 부품종류별 아이콘 (SVG)
// ============================================================
const categoryIcons = {
  '베어링': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="6" />
      <circle cx="24" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="34.4" cy="18" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="34.4" cy="30" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="24" cy="36" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="30" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="18" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  '오일필터': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="14" y="8" width="20" height="32" rx="4" />
      <line x1="14" y1="16" x2="34" y2="16" />
      <line x1="16" y1="22" x2="32" y2="22" />
      <line x1="16" y1="27" x2="30" y2="27" />
      <line x1="16" y1="32" x2="28" y2="32" />
    </svg>
  ),
  '벨트': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="24" r="7" />
      <circle cx="36" cy="24" r="7" />
      <line x1="12" y1="17" x2="36" y2="17" />
      <line x1="12" y1="31" x2="36" y2="31" />
    </svg>
  ),
  '패킹': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="24" cy="24" rx="16" ry="8" />
      <ellipse cx="24" cy="20" rx="16" ry="8" />
      <ellipse cx="24" cy="16" rx="16" ry="8" />
    </svg>
  ),
  '볼트/너트': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="24,6 30,12 30,18 24,22 18,18 18,12" />
      <line x1="24" y1="22" x2="24" y2="42" />
      <line x1="20" y1="27" x2="28" y2="27" />
      <line x1="20" y1="31" x2="28" y2="31" />
      <line x1="20" y1="35" x2="28" y2="35" />
    </svg>
  ),
  '감속기': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="14" width="14" height="20" rx="2" />
      <rect x="26" y="10" width="14" height="28" rx="2" />
      <circle cx="15" cy="24" r="4" />
      <circle cx="33" cy="24" r="6" />
      <line x1="22" y1="20" x2="26" y2="20" />
      <line x1="22" y1="28" x2="26" y2="28" />
    </svg>
  ),
  '베어링': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="6" />
      <circle cx="24" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="34.4" cy="18" r="2" fill="currentColor" stroke="none" />
      <circle cx="34.4" cy="30" r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="36" r="2" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="30" r="2" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  '계장부품': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 38a14 14 0 1 1 28 0" />
      <path d="M24 38V20l6 4" />
      <line x1="14" y1="30" x2="16" y2="32" />
      <line x1="32" y1="30" x2="34" y2="32" />
    </svg>
  ),
  '기타': (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12h32M8 24h32M8 36h32" />
      <rect x="6" y="6" width="36" height="36" rx="4" />
    </svg>
  ),
};

const defaultIcon = (
  <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="8" width="32" height="32" rx="4" />
    <line x1="8" y1="20" x2="40" y2="20" />
    <line x1="16" y1="30" x2="32" y2="30" />
  </svg>
);

// ============================================================
// App (루트 컴포넌트)
// ============================================================
function App() {
  const [page, setPage] = useState('main');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userName, setUserName] = useState('');

  // ✨ 알림 체크 (앱 시작 및 주기적)
  useEffect(() => {
// 앱이 켜지자마자 이름을 물어봅니다.
const savedName = localStorage.getItem('inventory_user');
if (savedName) {
  setUserName(savedName);
} else {
  const inputName = prompt("성함을 입력해주세요 (재고 로그에 기록됩니다):", "홍길동");
  const finalName = inputName || "미확인 사용자";
  setUserName(finalName);
  localStorage.setItem('inventory_user', finalName);
}
    loadCategories();
    loadAlerts();
    
    // 1분마다 알림 체크
    const interval = setInterval(loadAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  // ✨ 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/inventory/categories`);
      setCategories(res.data.data);
    } catch (err) {
      setError('데이터를 로드하는 데 문제가 있습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ✨ 알림 로드 및 브라우저 푸시
  async function loadAlerts() {
    try {
      const res = await axios.get(`${BASE_URL}/inventory/alerts`);
      const newAlerts = res.data.data;
      setAlerts(newAlerts);

      // 긴급 알림 (재고 0) 브라우저 푸시
      if ('Notification' in window && Notification.permission === 'granted') {
        const criticalAlerts = newAlerts.filter(a => a.최소보유수량 > 0 && a.긴급도 === 'critical');
        if (criticalAlerts.length > 0) {
          new Notification('⚠️ 긴급 재고 부족', {
            body: `${criticalAlerts.length}개 품목의 재고가 완전 소진되었습니다!`,
            icon: '/favicon.ico',
            tag: 'inventory-critical'
          });
        }
      }
    } catch (err) {
      console.error('알림 로드 실패:', err);
    }
  }

  async function handleCategoryClick(categoryName) {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/inventory/category/${encodeURIComponent(categoryName)}`);
      setDetailItems(res.data.data);
      setSelectedCategory(categoryName);
      setPage('detail');
    } catch (err) {
      setError('상세 데이터를 로드하는 데 문제가 있습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/inventory/summary`);
      setSummary(res.data.data);
      setPage('summary');
    } catch (err) {
      setError('요약 데이터를 로드하는 데 문제가 있습니다.');
    } finally {
      setLoading(false);
    }
  }

  // ✨ 검색 기능
  async function handleSearch(query) {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const res = await axios.get(`${BASE_URL}/inventory/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data.data);
    } catch (err) {
      console.error('검색 실패:', err);
      setSearchResults([]);
    }
  }

  // ✨ 재고 업데이트 후 데이터 새로고침
  async function refreshData() {
    await loadCategories();
    await loadAlerts();
    if (page === 'detail' && selectedCategory) {
      const res = await axios.get(`${BASE_URL}/inventory/category/${encodeURIComponent(selectedCategory)}`);
      setDetailItems(res.data.data);
    }
  }

  const renderPage = () => {
    if (loading) return <div className="loading-spinner"><div className="spinner"></div><p>로드 중...</p></div>;

    switch (page) {
      case 'detail':
        return (
          <DetailPage
            items={detailItems}
            categoryName={selectedCategory}
            onBack={() => setPage('main')}
            onUpdate={refreshData}
            userName={userName}
          />
        );
      case 'summary':
        return <SummaryPage summary={summary} onBack={() => setPage('main')} />;
      case 'logs':
        return <LogsPage onBack={() => setPage('main')} />;
      default:
        return (
          <MainPage
            categories={categories}
            onCategoryClick={handleCategoryClick}
            onSummaryClick={loadSummary}
            alerts={alerts}
            onSearch={handleSearch}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearchResultClick={(item) => {
  // ✨ 소분류가 아닌 '대분류' 이름을 전달하여 해당 카테고리 전체를 불러옵니다.
  handleCategoryClick(item.대분류 || '기타'); 
  setSearchResults([]);
  setIsSearching(false);
}}
          />
        );
    }
  };

  return (
    <div className="app-root">
      <header className="top-nav">
        <div className="nav-left">
          <button className="nav-logo" onClick={() => { setPage('main'); setSearchResults([]); setIsSearching(false); }}>
            <svg viewBox="0 0 28 28" width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="10" height="10" rx="2" />
              <rect x="16" y="2" width="10" height="10" rx="2" />
              <rect x="2" y="16" width="10" height="10" rx="2" />
              <rect x="16" y="16" width="10" height="10" rx="2" />
            </svg>
            <span>Smart Inventory</span>
          </button>
        </div>
        <div className="nav-right">
          {/* ✨ 알림 아이콘 */}
          {alerts.length > 0 && (
            <button className="nav-btn alert-btn" onClick={loadSummary} title={`${alerts.length}개 재고 부족`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="alert-badge">{alerts.length}</span>
            </button>
          )}
          <button className="nav-btn" onClick={() => setPage('logs')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            이력
          </button>
          <button className="nav-btn summary-btn" onClick={loadSummary}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            전체 요약
          </button>
        </div>
      </header>

      <main className="main-content">
        {error && <div className="error-bar">{error}</div>}
        {renderPage()}
      </main>

      <AIChatBar onInventoryUpdate={refreshData} />
    </div>
  );
}

// ============================================================
// MainPage (메인 화면 — 카테고리 아이콘 그리드 + 검색)
// ============================================================
function MainPage({ categories, onCategoryClick, onSummaryClick, alerts, onSearch, searchResults, isSearching, onSearchResultClick }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="main-page">
      <div className="page-header">
        <h1>스페어파츠 재고 관리</h1>
        <p className="page-subtitle">부품종류를 클릭하여 상세 재고를 확인하세요</p>
      </div>

      {/* ✨ 검색 바 */}
      <div className="search-container">
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="모델명, 부품종류, 적용설비 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => { setSearchQuery(''); onSearch(''); }}>✕</button>
          )}
        </div>

        {/* 검색 결과 드롭다운 */}
        {isSearching && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(item => (
              <div key={item.id} className="search-result-item" onClick={() => { onSearchResultClick(item); setSearchQuery(''); }}>
                <div className="search-result-top">
                  <span className="search-result-category">
  {item.대분류} <small>({item.부품종류})</small> {/* ✨ 대분류와 소분류 함께 표시 */}
</span>
                  <span className={`search-result-qty ${item.현재수량 <= item.최소보유수량 ? 'low' : ''}`}>
                    {item.현재수량}개
                  </span>
                </div>
                <div className="search-result-model">{item.모델명}</div>
                <div className="search-result-facility">{item.적용설비}</div>
              </div>
            ))}
          </div>
        )}
        {isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
          <div className="search-results">
            <div className="search-no-result">검색 결과가 없습니다</div>
          </div>
        )}
      </div>

      {/* ✨ 긴급 알림 배너 */}
      {alerts.filter(a => a.최소보유수량 > 0 && a.긴급도 === 'critical').length > 0 && (
  <div className="alert-banner critical">
          <div className="alert-banner-icon">🚨</div>
          <div className="alert-banner-text">
            <strong>긴급!</strong> {alerts.filter(a => a.긴급도 === 'critical').length}개 품목 재고 소진
          </div>
          <button className="alert-banner-btn" onClick={onSummaryClick}>확인</button>
        </div>
      )}

      {/* 카테고리 아이콘 그리드 */}
      <div className="category-grid">
        {categories.map((cat) => {
          const hasLowStock = cat.lowStockCount > 0;
          return (
            <button
              key={cat.name}
              className={`category-card ${hasLowStock ? 'has-low-stock' : ''}`}
              onClick={() => onCategoryClick(cat.name)}
            >
              <div className="category-icon-wrap">
  {/* ✨ 대분류 이름에 따라 실시간으로 아이콘 매칭 */}
  {(() => {
    switch (cat.name) {
      case '솔밸브류':
        return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 12h24v24H12zM24 8v4M24 36v4M8 24h4M36 24h4M18 24h12M24 18v12"/></svg>;
      case '실린더류':
        return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="10" y="20" width="20" height="8" rx="1"/><rect x="30" y="16" width="4" height="16"/><path d="M40 24h-6M10 24H4"/></svg>;
      case '모터류':
        return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="4"/><path d="M24 10v4M24 34v4M10 24h4M34 24h4"/></svg>;
      case '계장부품류':
        return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 38a14 14 0 1 1 28 0M24 38V20l8 4"/><circle cx="24" cy="38" r="2" fill="currentColor"/></svg>;
      case '릴레이류':
        return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="14" y="10" width="20" height="28" rx="2"/><path d="M14 18h20M14 28h20M20 10v28"/></svg>;
      case '히터류':
        return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 10v24c0 4 8 4 8 0V10c0-4 8-4 8 0v24c0 4 8 4 8 0V10M10 40h28"/></svg>;
      case '베어링류':
        return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="6"/><circle cx="24" cy="10" r="2" fill="currentColor"/><circle cx="38" cy="24" r="2" fill="currentColor"/><circle cx="24" cy="38" r="2" fill="currentColor"/><circle cx="10" cy="24" r="2" fill="currentColor"/></svg>;
      case '기타':
        return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="8" y="8" width="32" height="32" rx="4"/><path d="M8 20h32M20 8v32"/></svg>;
      default:
        return defaultIcon;
    }
  })()}
</div>
<div className="category-label">{cat.name}</div>
              <div className="category-meta">
                <span className="category-count">{cat.itemCount}종</span>
                {hasLowStock && (
                  <span className="low-stock-badge">⚠ {cat.lowStockCount}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// DetailPage (카테고리 클릭 후 리스트 + ✨ 수동 수정 UI)
// ============================================================
function DetailPage({ items, categoryName, onBack, onUpdate, userName }) { 
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.현재수량);
  };

  const handleSave = async (item) => {
    try {
      setIsSaving(true);
      // 기존에 '입고', '출고'로 나뉘던 action을 '수량변경'으로 통합하여 보냅니다.
      await axios.post(`${BASE_URL}/inventory/manual-update`, {
        id: item.id,
        현재수량: editValue,
        action: '수량변경', 
        user: userName 
      });
      setEditingId(null);
      await onUpdate(); // ✅ 데이터 새로고침
    } catch (err) {
      alert('저장 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
          뒤로
        </button>
        <div className="detail-category-header">
  <h2 className="main-cat-title">{items[0]?.대분류 || categoryName}</h2>
  <span className="sub-cat-badge">{categoryName}</span>
</div>
      </div>

      <div className="detail-list">
        {items.map((item) => {
          const isLow = item.현재수량 <= item.최소보유수량;
          const stockPercent = Math.min((item.현재수량 / item.최소보유수량) * 100, 100);
          const isEditing = editingId === item.id;

          return (
          <div key={item.id} className={`detail-card ${isLow ? 'low-stock' : ''}`}>
  <div className="detail-card-top">
  <div className="detail-model-wrapper">
    {/* ✨ 부품종류(소분류) 텍스트 태그 추가 */}
    <span className="sub-category-tag">{item.부품종류}</span>
    
    <span className="detail-model">{item.모델명}</span>
    {isLow && <span className="low-stock-badge-inline">⚠️ 재고부족</span>}
  </div>
    {!isEditing && (
                  <span className={`detail-quantity ${isLow ? 'text-red' : ''}`}>
                    {item.현재수량} <small>개</small>
                  </span>
                )}
              </div>

              <div className="detail-card-body">
                <div className="detail-info-row">
                  <span className="detail-info-label">적용설비</span>
                  <span className="detail-info-value">{item.적용설비}</span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-info-label">최소보유수량</span>
                  <span className="detail-info-value">{item.최소보유수량} 개</span>
                </div>
                <>
                <div className="detail-info-row">
                  <span className="detail-info-label">최종수정시각</span>
                  <span className="detail-info-value">{item.최종수정시각}</span>
                </div>
                <div className="detail-info-row">
                   <span className="detail-info-label">최종 작업자</span>
                   <span className="detail-info-value">👤 {item.작업자 || '기록 없음'}</span>
              </div>
              <div className="detail-usage-section">
                <div className="detail-info-label">사용 용도</div>
                <div className="detail-usage-box">
                {item.용도 || '등록된 용도 정보가 없습니다.'}
              </div>
              {/* ✨ 보관 위치 정보 추가 */}
                <div className="detail-info-row" style={{ marginTop: '4px', color: '#374151' }}>
   <span className="detail-info-label">보관 위치</span>
   <span className="detail-info-value" style={{ fontWeight: '600', color: '#059669' }}>
     {item.보관장소}
   </span>
</div>
                <div className="detail-usage-section"></div>
              </div>
              </>

              {/* ✨ 수동 수정 UI */}
              {isEditing ? (
                <div className="edit-controls">
                  <div className="edit-input-group">
                    <button className="edit-btn-dec" onClick={() => setEditValue(Math.max(0, editValue - 1))}>−</button>
                    <input
                      type="number"
                      className="edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                    />
                    <button className="edit-btn-inc" onClick={() => setEditValue(editValue + 1)}>+</button>
                  </div>
                  <div className="edit-actions">
  <button
    className="edit-save-btn"
    style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
    onClick={() => handleSave(item)}
    disabled={isSaving}
  >
    {isSaving ? '저장 중...' : '✓ 변경확인'}
  </button>
  <button 
    className="edit-cancel-btn" 
    onClick={handleCancel} 
    disabled={isSaving}
    style={{ marginLeft: '8px' }}
  >
    ✕ 취소
  </button>
</div>
                </div>
              ) : (
                <button className="edit-trigger-btn" onClick={() => handleEdit(item)}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  수정
                </button>
              )}
              </div>

              {/* 재고 게이지 바 */}
              <div className="stock-gauge-bg">
                <div className={`stock-gauge-fill ${isLow ? 'gauge-low' : 'gauge-ok'}`} style={{ width: `${stockPercent}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// SummaryPage (전체 사용량 요약)
// ============================================================
function SummaryPage({ summary, onBack }) {
  if (!summary) return null;

  return (
    <div className="summary-page">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
          뒤로
        </button>
        <h2>전체 사용량 요약</h2>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-icon blue">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </div>
          <div className="summary-card-value">{summary.totalItems}</div>
          <div className="summary-card-label">전체 부품종류</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon green">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <div className="summary-card-value">{summary.totalQuantity}</div>
          <div className="summary-card-label">전체 재고 수량</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon red">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="summary-card-value">{summary.lowStockCount}</div>
          <div className="summary-card-label">재고 부족 항목</div>
        </div>
      </div>

      {summary.lowStockItems.length > 0 && (
        <div className="summary-section">
          <h3 className="section-title red-title">⚠ 재고 부족 목록</h3>
          <div className="low-stock-table">
            <table>
              <thead>
                <tr>
                  <th>부품종류</th>
                  <th>모델명</th>
                  <th>적용설비</th>
                  <th>현재수량</th>
                  <th>최소보유수량</th>
                </tr>
              </thead>
              <tbody>
                {summary.lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.부품종류}</td>
                    <td>{item.모델명}</td>
                    <td>{item.적용설비}</td>
                    <td className="text-red bold">{item.현재수량}</td>
                    <td>{item.최소보유수량}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="summary-section">
        <h3 className="section-title">종류별 재고 현황</h3>
        <div className="category-bars">
          {Object.entries(summary.categoryBreakdown).map(([name, info]) => (
            <div key={name} className="category-bar-item">
              <div className="category-bar-label">
                <span>{name}</span>
                <span className="category-bar-num">{info.total} 개</span>
              </div>
              <div className="category-bar-bg">
                <div
                  className={`category-bar-fill ${info.lowStock > 0 ? 'bar-warning' : 'bar-normal'}`}
                  style={{ width: `${Math.min((info.total / summary.totalQuantity) * 100 * 4, 100)}%` }}
                ></div>
              </div>
              <div className="category-bar-sub">{info.count}종 · {info.lowStock > 0 ? `부족 ${info.lowStock}종` : '정상'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ✨ LogsPage (재고 변경 이력)
// ============================================================
function LogsPage({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/inventory/logs?limit=100`);
      setLogs(res.data.data);
    } catch (err) {
      console.error('로그 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading-spinner"><div className="spinner"></div><p>로드 중...</p></div>;

  return (
    <div className="logs-page">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
          뒤로
        </button>
        <h2>재고 변경 이력</h2>
      </div>

      <div className="logs-list">
        {logs.length === 0 && <div className="logs-empty">변경 이력이 없습니다</div>}
        {logs.map(log => (
          <div key={log.id} className={`log-item ${log.action}`}>
            <div className="log-header">
              <span className={`log-action ${log.action === '입고' ? 'in' : log.action === '출고' ? 'out' : 'edit'}`}>
                {log.action === '입고' ? '📥' : log.action === '출고' ? '📤' : '✏️'} {log.action}
              </span>
              <span className="log-time">{log.timestampKR}</span>
            </div>
            <div className="log-body">
              <div className="log-item-name">
                <span className="log-category">{log.부품종류}</span>
                <span className="log-model">{log.모델명}</span>
              </div>
              <div className="log-quantity">
                <span className="log-qty-before">{log.변경전수량}</span>
                <span className="log-qty-arrow">→</span>
                <span className={`log-qty-after ${log.변경수량 > 0 ? 'positive' : 'negative'}`}>
                  {log.변경후수량}
                </span>
                <span className={`log-qty-change ${log.변경수량 > 0 ? 'positive' : 'negative'}`}>
                  ({log.변경수량 > 0 ? '+' : ''}{log.변경수량})
                </span>
              </div>
              <div className="log-meta">
                <span>📍 {log.적용설비}</span>
                <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                <span className="log-user-badge">👤 {log.user || '시스템'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// AIChatBar (하단 고정 AI 채팅 한 줄)
// ============================================================
function AIChatBar({ onInventoryUpdate }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = React.useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role === 'model' ? 'model' : 'user',
        text: m.text 
      }));
      
      const res = await axios.post(`${BASE_URL}/ai/chat`, {
        message: userMsg.text,
        conversationHistory: history,
        user: localStorage.getItem('inventory_user') || '미확인 사용자' // 실제 사용자 이름 전달
      });

      let aiText = res.data.message;
      
      if (res.data.inventoryUpdated && res.data.updateResult) {
        const { action, items } = res.data.updateResult;
        const itemsText = items.map(i => `${i.모델명} ${i.수량}개`).join(', ');
        aiText += `\n\n✅ ${action} 완료: ${itemsText}`;
        
        // ✅ 재고 업데이트 후 데이터 새로고침
        setTimeout(() => onInventoryUpdate(), 500);
      }

      const aiMsg = { role: 'model', text: aiText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = { role: 'model', text: '⚠️ AI 응답 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="ai-chat-container">
      {isChatOpen && (
        <div className="ai-chat-popup">
          <div className="ai-chat-popup-header">
            <span>🤖 AI 재고 관리 어시스턴트</span>
            <button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>✕</button>
          </div>
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-placeholder">재고에 대해 궁금한 점을 물어보세요!</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-chat-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
                <div className="ai-chat-bubble">{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-chat-msg ai">
                <div className="ai-chat-bubble ai-typing">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      <div className="ai-chat-bar">
        <button className="ai-chat-toggle" onClick={() => setIsChatOpen(prev => !prev)}>
          🤖
        </button>
        <input
          type="text"
          className="ai-chat-input"
          placeholder="AI에게 재고 관련 질문하기... (Enter로 전송)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsChatOpen(true)}
        />
        <button className="ai-chat-send" onClick={handleSend} disabled={isLoading}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 15,22 11,13 2,9" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;