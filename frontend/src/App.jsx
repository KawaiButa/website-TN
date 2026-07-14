import { useState, useEffect, useRef } from 'react';
import { supabase, adminPassword } from './supabase';


function App() {
  // --- STATE QUẢN LÝ ---
  const [name, setName] = useState('');
  const [attending, setAttending] = useState(true);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [thanksState, setThanksState] = useState({ show: false, message: '' });
  const [confetti, setConfetti] = useState([]);
  const [sparkleEffects, setSparkleEffects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- STATE CHO INTRO WELCOME SCREEN ---
  const [showIntro, setShowIntro] = useState(true);
  const [introText, setIntroText] = useState('');
  const [introIsFadingOut, setIntroIsFadingOut] = useState(false);
  const [introShowContinue, setIntroShowContinue] = useState(false);
  const [introStars, setIntroStars] = useState([]);
  const typingIntervalRef = useRef(null);

  // --- STATE CHO ĐỒNG HỒ ĐẾM NGƯỢC ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- STATE CHO VẬT THỂ BAY NỀN ---
  const [bgParticles, setBgParticles] = useState([]);

  // --- STATE CHO NHẠC NỀN ---
  const [isPlaying, setIsPlaying] = useState(false);

  // --- STATE CHO ADMIN LOGIN ---
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');


  // =========================================================================
  // 1. CHỈNH SỬA: ĐƯỜNG DẪN ẢNH CỦA BẢN THÂN
  // Hãy thay thế hoặc thêm các file ảnh của bạn vào thư mục 'frontend/public/'
  // và cập nhật đường dẫn dưới đây (ví dụ: '/anh_tot_nghiep_1.jpg')
  // =========================================================================
  const personalPhotos = [
    '/a.jpg',      // Ảnh 1 (Mặc định)
    '/b.jpg',    // Ảnh 2 (Click để đổi)
    '/c.jpg',
    '/d.jpg',
    '/e.jpg',
    '/f.jpg',
    '/g.jpg',
  ];
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // --- TẢI DANH SÁCH RSVP TỪ SUPABASE ---
  const fetchRSVPs = async () => {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setRsvps(data);
      }
    } catch (error) {
      console.warn("Lỗi kết nối Supabase. Dùng dữ liệu dự phòng từ LocalStorage:", error);
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    const localData = localStorage.getItem('rsvp_backup');
    if (localData) {
      setRsvps(JSON.parse(localData));
    } else {
    }
  };

  useEffect(() => {
    fetchRSVPs();

    // Kiểm tra xem URL có chứa tham số ?admin=true hay không
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
      const savedAuth = window.localStorage.getItem('admin-auth');
      if (savedAuth === 'true') {
        setIsAdminAuthenticated(true);
      }
    }

    // --- KHỞI TẠO VẬT THỂ BAY NỀN INTRO ---
    const introSymbols = ['🎓', '✨', '🎈', '🌸', '⭐', '🎓', '🎉'];
    const starsArray = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 120 - 10,
      size: 16 + Math.random() * 24,
      symbol: introSymbols[Math.floor(Math.random() * introSymbols.length)],
      duration: 12 + Math.random() * 15,
      delay: Math.random() * -20,
      opacity: 0.08 + Math.random() * 0.15
    }));
    setIntroStars(starsArray);

    // --- HIỆU ỨNG ĐÁNH CHỮ INTRO ---
    const fullText = "Hello bạn, là Thúy An đây, ​Xin gửi lời cảm ơn sâu sắc nhất đến bạn – người đã cùng mình đi qua những năm tháng sinh viên quý giá nhất. Hành trình này của mình có thể chưa hoàn hảo, nhưng có sự đồng hành và tình cảm của bạn chính là điều làm nên một thanh xuân rực rỡ. Trong buổi lễ tốt nghiệp thiêng liêng này, hãy để Thúy An được cùng bạn lưu giữ những kỷ niệm đáng quý qua những bức hình thật đẹp nhé! ​Cảm ơn vì đã là một phần thanh xuân tuyệt vời của mình nhé!";
    let currentIdx = 0;
    typingIntervalRef.current = setInterval(() => {
      if (currentIdx < fullText.length) {
        setIntroText(fullText.substring(0, currentIdx + 1));
        currentIdx++;
      } else {
        clearInterval(typingIntervalRef.current);
        setIntroShowContinue(true);
      }
    }, 35);

    // --- KHỜI TẠO ĐỒNG HỒ ĐẾM NGƯỢC ---
    const targetDate = new Date('2026-07-23T14:00:00+07:00');
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    };
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    // --- KHỞI TẠO VẬT THỂ NỀN ---
    const symbols = ['🎓', '✨', '🎈', '🌸', '⭐', '🎓', '🎉'];
    const initialParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 16 + Math.random() * 24,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      delay: Math.random() * -20, // chạy ngay khi load
      duration: 15 + Math.random() * 20,
      opacity: 0.12 + Math.random() * 0.2
    }));
    setBgParticles(initialParticles);

    return () => {
      clearInterval(countdownInterval);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // --- SCROLL LOCK KHI ĐANG MỞ INTRO ---
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showIntro]);

  // --- XỬ LÝ PLAY/PAUSE NHẠC ---
  const togglePlayMusic = () => {
    const audio = document.getElementById('bg-music');
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.log("Không thể phát nhạc:", err));
    }
    setIsPlaying(!isPlaying);
  };

  // --- XỬ LÝ CLICK TRÊN MÀN HÌNH INTRO ---
  const handleIntroClick = () => {
    const fullText = "Hello bạn, là Thúy An đây, ​Xin gửi lời cảm ơn sâu sắc nhất đến bạn – người đã cùng mình đi qua những năm tháng sinh viên quý giá nhất. Hành trình này của mình có thể chưa hoàn hảo, nhưng có sự đồng hành và tình cảm của bạn chính là điều làm nên một thanh xuân rực rỡ. Trong buổi lễ tốt nghiệp thiêng liêng này, hãy để Thúy An được cùng bạn lưu giữ những kỷ niệm đáng quý qua những bức hình thật đẹp nhé! ​Cảm ơn vì đã là một phần thanh xuân tuyệt vời của mình nhé!";

    if (introText.length < fullText.length) {
      // Nhấp lần đầu: Hiển thị toàn bộ chữ ngay lập tức
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      setIntroText(fullText);
      setIntroShowContinue(true);
    } else {
      // Nhấp lần hai: Mờ dần màn hình intro và bật nhạc nền
      setIntroIsFadingOut(true);
      const audio = document.getElementById('bg-music');
      if (audio) {
        audio.play().catch(err => console.log("Không thể phát nhạc:", err));
        setIsPlaying(true);
      }
      setTimeout(() => {
        setShowIntro(false);
      }, 1000); // Khớp với thời gian transition mờ dần trong CSS (1s)
    }
  };


  // --- HIỆU ỨNG THẢ CONFETTI KHI ĐĂNG KÝ THÀNH CÔNG ---
  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // % width
      delay: Math.random() * 2, // s
      duration: 2 + Math.random() * 3, // s
      size: 5 + Math.random() * 8, // px
      color: ['#ffd700', '#ff4081', '#00e676', '#29b6f6', '#ab47bc'][Math.floor(Math.random() * 5)]
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 6000);
  };

  // --- HIỆU ỨNG TẠO SAO LẤP LÁNH KHI CLICK CHUỘT LÊN ẢNH ---
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  const handlePhotoClick = (e) => {
    if (isPhotoLoading) return;
    const nextIndex = (currentPhotoIdx + 1) % personalPhotos.length;
    setSelectedThumbnail(nextIndex);
    setIsPhotoLoading(true);
    setCurrentPhotoIdx(nextIndex);

    // Tạo hiệu ứng lấp lánh tại vị trí click
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparkle = {
      id: Date.now(),
      x,
      y
    };

    setSparkleEffects((prev) => [...prev, newSparkle]);
    setTimeout(() => {
      setSparkleEffects((prev) => prev.filter(s => s.id !== newSparkle.id));
    }, 1500);
  };

  const handleSelectPhoto = (index) => {
    console.log("Selected photo index: %d", index);
    if (isPhotoLoading || index === currentPhotoIdx) return;
    setSelectedThumbnail(index);
    setIsPhotoLoading(true);
    setCurrentPhotoIdx(index);
  };

  const handleCenterImageLoad = () => {
    setIsPhotoLoading(false);
    setSelectedThumbnail(null);
  };

  // --- XỬ LÝ GỬI FORM RSVP LÊN SUPABASE ---
  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      attending: attending,
      message: message.trim() || null
    };

    try {
      const { data, error } = await supabase
        .from('rsvps')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const savedRSVP = data[0];
        // Cập nhật state danh sách
        setRsvps((prev) => [savedRSVP, ...prev]);
        showThanks('💌 Cảm ơn bạn đã gửi thông tin cho Thúy An!');
        triggerConfetti();
        // Reset form
        setName('');
        setMessage('');
      } else {
        throw new Error('Không thể lưu phản hồi');
      }
    } catch (error) {
      console.warn("Lỗi kết nối Supabase. Thực hiện lưu cục bộ (Local Fallback):", error);
      // Fallback cục bộ
      const mockSaved = {
        id: Date.now(),
        ...payload,
        created_at: new Date().toISOString()
      };
      const updatedRsvps = [mockSaved, ...rsvps];
      setRsvps(updatedRsvps);
      localStorage.setItem('rsvp_backup', JSON.stringify(updatedRsvps));

      showThanks('💌 Đã ghi nhận lời mời của bạn (Chế độ Offline/Demo)');
      triggerConfetti();
      setName('');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasswordInput === adminPassword) {
      setIsAdminAuthenticated(true);
      setAdminLoginError('');
      window.localStorage.setItem('admin-auth', 'true');
      setThanksState({ show: true, message: '🔐 Đã vào khu vực quản trị' });
    } else {
      setAdminLoginError('Mật khẩu không đúng, thử lại nha 🐾');
    }
  };

  const showThanks = (msg) => {
    setThanksState({ show: true, message: msg });
  };

  return (
    <div className="sky-bg">
      {/* Màn hình giới thiệu chào mừng (Intro Overlay) */}
      {showIntro && (
        <div
          className={`intro-overlay ${introIsFadingOut ? 'fade-out' : ''}`}
          onClick={handleIntroClick}
        >
          <div className="intro-stars">
            {introStars.map((s) => (
              <div
                key={s.id}
                className="intro-star"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  fontSize: `${s.size}px`,
                  animationDuration: `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                  opacity: s.opacity
                }}
              >
                {s.symbol}
              </div>
            ))}
          </div>
          <div className="intro-card" onClick={(e) => e.stopPropagation()}>
            <p className="intro-quote">
              {introText}
              {introText.length < "Hello bạn, là Thúy An đây, ​Xin gửi lời cảm ơn sâu sắc nhất đến bạn – người đã cùng mình đi qua những năm tháng sinh viên quý giá nhất. Hành trình này của mình có thể chưa hoàn hảo, nhưng có sự đồng hành và tình cảm của bạn chính là điều làm nên một thanh xuân rực rỡ. Trong buổi lễ tốt nghiệp thiêng liêng này, hãy để Thúy An được cùng bạn lưu giữ những kỷ niệm đáng quý qua những bức hình thật đẹp nhé! ​Cảm ơn vì đã là một phần thanh xuân tuyệt vời của mình nhé!".length && (
                <span className="intro-cursor"></span>
              )}
            </p>
            {introShowContinue && (
              <div className="intro-continue" onClick={handleIntroClick}>
                <span>Click để tiếp tục</span>
                <span className="intro-continue-arrow">👇</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thẻ nhạc nền ẩn */}
      <audio id="bg-music" src="/music.mp3" loop />


      {/* Lớp hạt chấm li ti Halftone */}
      <div className="sky-dots"></div>

      {/* Hiệu ứng vật thể bay trong nền */}
      <div className="bg-particles-container">
        {bgParticles.map((p) => (
          <div
            key={p.id}
            className="bg-particle"
            style={{
              left: `${p.x}%`,
              fontSize: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity: p.opacity
            }}
          >
            {p.symbol}
          </div>
        ))}
      </div>

      {/* Mây bay trang trí */}
      <div className="clouds-container">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {/* Hiệu ứng pháo hoa giấy khi thành công */}
      {confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="confetti-piece"
              style={{
                left: `${c.x}%`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}
        </div>
      )}

      {/* Thông báo cảm ơn dạng card lớn */}
      {thanksState.show && (
        <div className="thanks-overlay" onClick={() => setThanksState({ show: false, message: '' })}>
          <div className="thanks-card" onClick={(e) => e.stopPropagation()}>
            <div className="thanks-emoji">💖</div>
            <h3>Thank you, sweetheart!</h3>
            <p>{thanksState.message}</p>
            <button className="thanks-close" onClick={() => setThanksState({ show: false, message: '' })}>Đóng</button>
          </div>
        </div>
      )}

      {/* NỘI DUNG CHÍNH WEBSITE */}
      <div className="container">

        {/* ==========================================
            MỤC 1: HERO SECTION & ẢNH CÁ NHÂN (POLAROID)
           ========================================== */}
        <header style={{ textAlign: 'center', position: 'relative' }}>
          <div className="paw-decor paw-top">🐾</div>
          <div className="kitty-badge">🐱</div>
          {/* Nhãn "LỄ TỐT NGHIỆP" dễ thương */}
          <div className="capsule-badge">
            LỄ TỐT NGHIỆP
          </div>

          {/* Khung ảnh Polaroid chứa hình cá nhân và các ảnh xung quanh */}
          <div className="photo-hub">

            <div className="hub-center" onClick={handlePhotoClick}>
              <div className="polaroid-frame">
                <div className="polaroid-image-container">
                  <img
                    src={personalPhotos[currentPhotoIdx]}
                    alt="Thúy An Graduation"
                    className="polaroid-image"
                    onLoad={handleCenterImageLoad}
                  />

                  {/* Click sparkle effect render */}
                  {sparkleEffects.map((s) => (
                    <div
                      key={s.id}
                      className="sparkle-fly"
                      style={{ left: s.x, top: s.y }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" style={{ color: '#ffd700' }}>
                        <path fill="currentColor" d="M12,2L14.7,8.7L22,10L16.2,14.7L18.2,22L12,18L5.8,22L7.8,14.7L2,10L9.3,8.7L12,2Z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <div className="polaroid-caption">
                  THÚY AN
                </div>
              </div>
            </div>
            <div className="thumb">
              {personalPhotos
                .map((photo, index) => ({ photo, index }))
                .filter(({ index }) => index !== currentPhotoIdx)
                .map(({ photo, index }, idx) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    className={`thumb-pos photo-thumb thumb-pos-${idx + 1} ${selectedThumbnail === index ? 'disabled' : ''}`}
                    onClick={() => handleSelectPhoto(index)}
                    disabled={isPhotoLoading || index === currentPhotoIdx}
                  >
                    <img src={photo} alt={`Xung quanh ${idx + 1}`} />
                  </button>
                ))}
            </div>
          </div>
        </header>


        <p className="photo-switch-hint">
          <span>✨</span> Nhấp vào ảnh để xem thêm nhe🐾
        </p>

        {/* =========================================================================
              ĐỒNG HỒ ĐẾM NGƯỢC (COUNTDOWN TIMER)
             ========================================================================= */}
        <div className="countdown-container">
          <div className="countdown-title">⏳ Đếm ngược tới ngày được gặp Thúy An nò!</div>
          <div className="countdown-timer">
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.days}</span>
              <span className="countdown-label">Ngày</span>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="countdown-label">Giờ</span>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="countdown-label">Phút</span>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="countdown-label">Giây</span>
            </div>
          </div>
        </div>


        <div className="bento-grid">
          <div className="section-card bento-hero" style={{ marginTop: '25px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', lineHeight: '1.8', textAlign: 'center' }}>
              Thân mời bạn đến chung vui trong ngày tốt nghiệp của

              <strong style={{
                display: 'block',
                color: 'var(--pink-deep)',
                fontSize: '1.6rem',
                fontFamily: 'var(--font-display)',
                marginTop: '0.5rem',
                marginBottom: '0.2rem'
              }}>
                THÚY AN aka Nauyth
              </strong>

              <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '500' }}>
                Cử nhân ngành Sư phạm Lịch sử  - Địa lý
              </span>
            </p>
            <p style={{ fontSize: '1.05rem', color: 'var(--light-text)', marginTop: '10px' }}>
              Được chụp cùng bạn một bức hình (và nhận quà của bạn) là niềm vui mà mình luôn hằng ao ước.
            </p>
          </div>

          <div className="section-card bento-time" id="thoi-gian">
            <h2 className="section-title">
              {/* Icon Lịch */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Thời gian & Địa điểm
            </h2>

            <div className="datetime-container">
              {/* =========================================================================
                  CHỈNH SỬA: CHI TIẾT THỜI GIAN LỄ TỐT NGHIỆP
                  Sửa ngày, giờ ở phần detail-value bên dưới
                 ========================================================================= */}
              <div className="detail-item">
                <div className="detail-icon">📅</div>
                <div className="detail-label">Thời gian</div>
                <div className="detail-value">14h00 - 16h30</div>
                <div className="detail-value">Thứ năm, 23/07/2026</div>
                <div className="detail-subvalue">(Có thể sẽ trễ hơn dự kiến nếu trường không thả mình ra sớm nhé)</div>
              </div>

              {/* =========================================================================
                  CHỈNH SỬA: CHI TIẾT ĐỊA ĐIỂM TỔ CHỨC
                  Sửa tên giảng đường, trường học ở bên dưới
                 ========================================================================= */}
              <div className="detail-item">
                <div className="detail-icon">🎓</div>
                <div className="detail-label">Địa điểm</div>
                <div className="detail-value">Sân M </div>
                <div className="detail-value">Trường Đại học Sư phạm Thành phố Hồ Chí Minh - HCMUE</div>
              </div>
            </div>
          </div>

          <div className="section-card bento-map" id="ban-do">
            <h2 className="section-title">
              {/* Icon Ghim bản đồ */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Bản đồ Đường đi
            </h2>

            {/* =========================================================================
                CHỈNH SỬA: NỘI DUNG MÔ TẢ ĐỊA ĐIỂM
               ========================================================================= */}
            <p style={{ textAlign: 'left', marginBottom: '10px' }}>
              📍 <strong>Trường Đại học Sư phạm Thành phố Hồ Chí Minh</strong>: 280 An Dương Vương, phường Chợ Quán, Thành phố Hồ Chí Minh, Việt Nam
            </p>
            <p style={{ textAlign: 'left', fontSize: '0.95rem', color: 'var(--light-text)' }}>
              Ráng chạy theo ggm nhé chứ cái này mình khó mà chỉ....
            </p>

            {/* BẢN ĐỒ GOOGLE MAPS NHÚNG (Bản đồ thực tế của UIT) */}
            <div className="map-iframe-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d440.6091024707942!2d106.6816096337353!3d10.76212010915725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2s!4v1784043028689!5m2!1svi!2s"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ HCMUE"
              ></iframe>
            </div>

            {/* =========================================================================
                CHỈNH SỬA: LINK LIÊN KẾT GOOGLE MAPS (Nút mở trên điện thoại)
                Thay thuộc tính href bằng link Google Maps của bạn nếu cần
               ========================================================================= */}
            <a
              href="https://maps.app.goo.gl/kXRjjmeCvNZV8CaY8"
              target="_blank"
              rel="noopener noreferrer"
              className="map-button-link"
            >
              <span>🗺️</span> Chỉ đường trên Google Maps
            </a>
          </div>
          <div>

            <div className="section-card bento-campus" id="ban-do-khuon-vien" style={{ marginBottom: '15px', minHeight: 0 }}>
              <h2 className="section-title">
                {/* Icon Sơ đồ */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                Sơ đồ Khuôn viên HCMUE
              </h2>
              <p style={{ textAlign: 'left', marginBottom: '5px' }}>
                Tòa nhà thư viện sẽ là nơi làm lễ. Sau khi làm lễ xong, mời các bạn di chuyển đến sân M (ngay trước tòa nhà thư viện) để chụp hình cùng mình nha! (Các bạn có thể xem thêm ở sơ đồ để dễ hình dung hơn nhaaaaa)
              </p>
              <div className="campus-map-container">
                <img
                  src="/dichuyen.jpg"
                  alt="Sơ đồ khuôn viên HCMUE"
                  className="campus-map-img"
                />
              </div>
            </div>
            <div className="section-card bento-contact" id="lien-he" style={{ minHeight: 0}} >
              <h2 className="section-title">
                {/* Icon Điện thoại */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Thông tin liên lạc
              </h2>

              <p style={{ textAlign: 'left', marginBottom: '15px', color: 'var(--light-text)' }}>
                Nếu bạn có câu hỏi hoặc cần hỗ trợ thêm thông tin gì, đừng ngần ngại liên lạc với Thúy An qua:
              </p>

              <div className="contacts-grid">
                {/* =========================================================================
                  CHỈNH SỬA: SỐ ĐIỆN THOẠI
                  Thay đổi tel: số điện thoại và số hiển thị bên dưới
                 ========================================================================= */}
                <a href="tel:0982962655" className="contact-link-card">
                  <div className="contact-icon-wrapper">📞</div>
                  <div className="contact-info-text">
                    <span className="contact-title">Điện thoại</span>
                    <span className="contact-value">0325395352</span>
                  </div>
                </a>

                {/* =========================================================================
                  CHỈNH SỬA: TRANG CÁ NHÂN FACEBOOK / MESSENGER
                  Thay đổi href thành link Facebook của bạn
                 ========================================================================= */}
                <a
                  href="https://www.facebook.com/nthuyan.1402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link-card"
                  style={{ gridColumn: '1 / -1' }}
                >
                  <div className="contact-icon-wrapper">💬</div>
                  <div className="contact-info-text">
                    <span className="contact-title">Facebook</span>
                    <span className="contact-value">fb.com/nthuyan</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="section-card bento-parking" id="gui-xe">
            <h2 className="section-title">
              {/* Icon Xe hơi/Xe máy */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              Hướng dẫn gửi xe
            </h2>
            <div className="campus-map-container" style={{ marginBottom: '15px' }}>
              <img
                src="/guixe.jpg"
                alt="Sơ đồ khuôn viên HCMUE"
                className="campus-map-img"
              />
            </div>
            {/* =========================================================================
                CHỈNH SỬA: CÁC BƯỚC HƯỚNG DẪN GỬI XE
                Thay đổi hoặc thêm bớt các bước bên dưới tùy tình hình thực tế
               ========================================================================= */}
            <ul className="parking-steps">
              <li className="parking-step-item">
                <div className="parking-step-num">1</div>
                <div className="parking-step-text">
                  <strong>Bãi gửi xe:</strong> Nếu bạn đi từ Cổng chính (Đường An Dương Vương), hãy rẽ trái chạy men theo đường nội bộ phía trước nhà A. Nếu đi từ Cổng phụ phía bên trái, bạn chỉ cần chạy thẳng vào đường nội bộ. Bãi xe gắn máy nằm ngay bên tay phải của bạn.
                </div>
              </li>
              <li className="parking-step-item">
                <div className="parking-step-num">2</div>
                <div className="parking-step-text">
                  <strong>Lấy thẻ xe:</strong> Tại lối vào bãi xe, dù bạn là sinh viên trong trường hay khách ngoài trường thì đều cần dừng lại để lấy thẻ xe từ các bác bảo vệ nhé.
                </div>
              </li>
              <li className="parking-step-item">
                <div className="parking-step-num">3</div>
                <div className="parking-step-text">
                  <strong>Chi phí gửi xe:</strong> Chi phí gửi xe sẽ dao động từ 3k đến 6k tùy thuộc vào khung giờ và đối tượng. Bạn nên chuẩn bị sẵn một ít tiền lẻ để lúc lấy xe ra về được thuận tiện và nhanh chóng hơn.
                </div>
              </li>
              <li className="parking-step-item">
                <div className="parking-step-num">4</div>
                <div className="parking-step-text">
                  <strong>Lưu ý:</strong> Sau khi gửi xe xong, bạn đi bộ ra phía sau để đến khu vực làm lễ hoặc check-in trước. Hãy nhắn tin hoặc gọi điện liền cho An để mình biết và ra đón bạn nếu mình đã làm lễ xong nhé!.
                </div>
              </li>
            </ul>
          </div>

          <div className="section-card bento-rsvp" id="xac-nhan">
            <h2 className="section-title">
              {/* Icon Thư xác nhận */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Xác nhận tham dự
            </h2>

            <p style={{ textAlign: 'left', marginBottom: '20px', color: 'var(--light-text)' }}>
              Hãy phản hồi giúp mình trước ngày <strong>22h00 22/07/2026</strong> để mình chuẩn bị đón tiếp chu đáo nhất nhé!
            </p>

            <form onSubmit={handleSubmitRSVP} className="rsvp-form-container">
              {/* Nhập Họ và tên */}
              <div className="form-group">
                <label htmlFor="guest-name" className="form-label">Cho mình xin bí danh nha! (viết sao cho mình biết là ai á...)*</label>
                <input
                  type="text"
                  id="guest-name"
                  className="form-input"
                  placeholder="Nhập họ và tên của bạn..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Câu hỏi lựa chọn Có/Không */}
              <div className="form-group">
                <label className="form-label">Bạn sẽ đến và chụp cùng mình tấm ảnh chứ?</label>
                <div className="rsvp-options-grid">

                  {/* Lựa chọn CÓ tham gia */}
                  <div
                    className={`rsvp-option-card ${attending ? 'selected-yes' : ''}`}
                    onClick={() => setAttending(true)}
                  >
                    <div className="option-emoji">🥳</div>
                    <div className="option-title option-title-yes">Mình sẽ đến chụp chung với Thúy An nha!!</div>
                    <div className="option-desc">ok iu iu moa moa!</div>
                  </div>

                  {/* Lựa chọn KHÔNG tham gia */}
                  <div
                    className={`rsvp-option-card ${!attending ? 'selected-no' : ''}`}
                    onClick={() => setAttending(false)}
                  >
                    <div className="option-emoji">😢</div>
                    <div className="option-title option-title-no">Mình bận mất tiu òi!</div>
                    <div className="option-desc">Thoai không sao, nhưng nhớ gửi quà cho mình sau nhé hẹ hẹ.!</div>
                  </div>

                </div>
              </div>

              {/* Lời chúc gửi kèm */}
              <div className="form-group">
                <label htmlFor="guest-msg" className="form-label">Bạn có gì muốn nhắn gửi đến mình hông?</label>
                <textarea
                  id="guest-msg"
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Gửi lời chúc mừng hoặc lời nhắn tại đây..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Nút gửi */}
              <button
                type="submit"
                className="bubbly-button"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? 'Đang gửi phản hồi...' : 'Gửi xác nhận của bạn'}
              </button>
            </form>

            {/* DANH SÁCH KHÁCH MỜI ĐÃ XÁC NHẬN (Chỉ hiển thị cho Admin khi truy cập qua link bí mật ?admin=true) */}
            {isAdmin && !isAdminAuthenticated ? (
              <div className="admin-login-card">
                <h3 className="admin-login-title">🔐 Khu vực quản trị</h3>
                <p className="admin-login-copy">Nhập mật khẩu để xem danh sách phản hồi của các bạn thân 🐾</p>
                <form onSubmit={handleAdminLogin} className="admin-login-form">
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Nhập mật khẩu"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                  />
                  {adminLoginError && <p className="admin-login-error">{adminLoginError}</p>}
                  <button type="submit" className="admin-login-button">
                    Mở khóa
                  </button>
                </form>
              </div>
            ) : null}

            {isAdmin && isAdminAuthenticated && (
              <div className="guest-list-section">
                <h3 className="guest-list-title">
                  👥 Những người bạn đã gửi phản hồi ({rsvps.length})
                </h3>

                <div className="guest-cards-container">
                  {rsvps.length === 0 ? (
                    <p style={{ color: 'var(--light-text)', fontSize: '0.9rem', gridColumn: '1 / -1', textAlign: 'center' }}>
                      Chưa có ai gửi xác nhận. Hãy là người đầu tiên!
                    </p>
                  ) : (
                    rsvps.map((guest) => (
                      <div key={guest.id} className="guest-card">
                        <div className="guest-card-header">
                          <div className="guest-name" title={guest.name}>{guest.name}</div>
                          <span className={`guest-badge ${guest.attending ? 'badge-yes' : 'badge-no'}`}>
                            {guest.attending ? 'Sẽ tham gia' : 'Vắng mặt'}
                          </span>
                        </div>
                        {guest.message && <div className="guest-message">"{guest.message}"</div>}
                        <span className="guest-time">
                          {new Date(guest.created_at).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer>
        <p>🎓 Made with ❤️ for Thuy An's Graduation Day 🎓</p>
        <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.7 }}>© 2026 Thúy An. All rights reserved.</p>
      </footer>

      {/* NÚT PHÁT NHẠC NỀN FLOATING */}
      <button
        className={`floating-music-btn ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlayMusic}
        title={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc nền"}
      >
        <div className="music-disk">
          🎵
        </div>
      </button>
    </div>

  );
}

export default App;
