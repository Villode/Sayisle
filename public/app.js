(() => {
  const toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  const form = document.querySelector('form.search');
  if (form) form.addEventListener('submit', e => e.preventDefault());
  const ip = document.getElementById('ip-signature');
  if (ip) {
    const api = ip.getAttribute('data-api') || 'https://v2.xxapi.cn/api/ippic';
    fetch(api).then(r => r.json()).then(d => {
      if (d && d.data) ip.src = d.data;
    }).catch(() => {
      ip.src = 'https://cdn.xxhzm.cn/v2api/cache/ippic/fa32b5b4defbd08cdfa6cd4f9737e209.jpg';
    });
  }
  const qt = document.getElementById('quote-text');
  if (qt) {
    fetch('https://v2.xxapi.cn/api/aiqinggongyu').then(r => r.json()).then(d => {
      const fallback = '好歹是个男人，叫得跟小沈阳似的。——胡一菲';
      const txt = d && d.data ? d.data : fallback;
      qt.textContent = txt;
    }).catch(() => {
      qt.textContent = '好歹是个男人，叫得跟小沈阳似的。——胡一菲';
    });
  }
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme','dark');
  
  // 主题切换功能（支持多个按钮）
  const themeToggle = () => {
    const cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', cur);
    localStorage.setItem('theme', cur);
  };
  
  // 为所有主题切换按钮添加事件监听
  document.querySelectorAll('#theme-toggle, #themeToggle, .theme-toggle').forEach(btn => {
    btn.addEventListener('click', themeToggle);
  });

  try {
    const es = new EventSource('/__events');
    es.addEventListener('reload', () => location.reload());
  } catch (_) {
  }
  // 数字格式化函数
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  window.addEventListener('load', () => {
    const card = document.querySelector('.sidebar .ipcard');
    if (card) {
      const h = card.offsetHeight;
      card.style.height = h + 'px';
      card.style.overflow = 'auto';
    }
    
    // 检测标签溢出
    const tags = document.querySelector('.tags');
    if (tags) {
      if (tags.scrollHeight > tags.clientHeight) {
        tags.classList.add('has-overflow');
      }
    }
    
    // 计算运营天数并格式化
    const siteDaysEl = document.getElementById('site-days');
    if (siteDaysEl) {
      const startDate = new Date('2021-01-01'); // 修改为你的网站创建日期
      const today = new Date();
      const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      siteDaysEl.textContent = formatNumber(days);
    }
    
    // 格式化所有统计数字
    document.querySelectorAll('.stat-value').forEach(el => {
      if (el.id !== 'site-days') { // 跳过已处理的运营天数
        const num = parseInt(el.textContent);
        if (!isNaN(num)) {
          el.textContent = formatNumber(num);
        }
      }
    });
  });

  document.querySelectorAll('.mobile-nav .mobile-nav-item').forEach(el => {
    const fire = () => {
      el.classList.add('clicked');
      setTimeout(() => el.classList.remove('clicked'), 350);
    };
    el.addEventListener('touchstart', fire, { passive: true });
    el.addEventListener('click', fire);
  });

  // 图片灯箱
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    let currentImages = [];
    let currentIndex = 0;

    // 点击图片打开灯箱
    document.addEventListener('click', (e) => {
      if (e.target.matches('.moment-images img')) {
        const container = e.target.closest('.moment-images');
        currentImages = Array.from(container.querySelectorAll('img')).map(img => img.src);
        currentIndex = currentImages.indexOf(e.target.src);
        showImage(currentIndex);
      }
    });

    // 显示图片
    function showImage(index) {
      if (index < 0 || index >= currentImages.length) return;
      currentIndex = index;
      lightboxImg.src = currentImages[index];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // 显示/隐藏前后按钮
      prevBtn.style.display = currentImages.length > 1 ? 'block' : 'none';
      nextBtn.style.display = currentImages.length > 1 ? 'block' : 'none';
    }

    // 关闭灯箱
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // 上一张/下一张
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      showImage(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % currentImages.length;
      showImage(currentIndex);
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    });
  }

  // 加载音乐播放器
  const musicPlayer = document.getElementById('music-player');
  const musicModal = document.getElementById('music-modal');
  let audio = null;
  let isPlaying = false;
  let currentConfig = null;
  
  if (musicPlayer && musicModal) {
    const musicConfig = musicPlayer.getAttribute('data-music-config');
    
    // 点击播放器打开弹窗
    musicPlayer.addEventListener('click', (e) => {
      if (!e.target.closest('.control-btn')) {
        musicModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
    
    // 关闭弹窗
    const closeModal = () => {
      musicModal.classList.remove('active');
      document.body.style.overflow = '';
      if (audio) {
        audio.pause();
        isPlaying = false;
      }
    };
    
    const musicClose = document.getElementById('music-close');
    if (musicClose) {
      musicClose.addEventListener('click', closeModal);
    }
    
    musicModal.addEventListener('click', (e) => {
      if (e.target === musicModal) closeModal();
    });
    
    // 解析歌词
    const parseLyric = (lrcText) => {
      if (!lrcText) return [];
      
      const lines = lrcText.split('\n');
      const lyrics = [];
      
      lines.forEach(line => {
        const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
        if (match) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const time = minutes * 60 + seconds;
          const text = match[4].trim();
          if (text) {
            lyrics.push({ time, text });
          }
        }
      });
      
      return lyrics;
    };
    
    let currentLyrics = [];
    let currentLyricIndex = -1;
    
    // 加载歌曲函数
    const loadSong = (songName) => {
      if (!currentConfig) return;
      
      const params = new URLSearchParams(currentConfig.params);
      params.set('msg', songName);
      
      fetch(`${currentConfig.api}?${params}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.name) {
            // 更新显示
            document.getElementById('music-cover-img').src = data.cover ? (data.cover.large || data.cover.medium || data.cover.small) : '';
            document.getElementById('music-title').textContent = data.name;
            document.getElementById('music-artist').textContent = data.artists ? data.artists.map(a => a.name).join(' / ') : '未知艺术家';
            document.getElementById('music-album').textContent = data.album ? data.album.name : '未知专辑';
            
            // 解析并显示歌词
            const lyricDisplay = document.getElementById('lyric-display');
            if (data.lyric && data.lyric.text) {
              currentLyrics = parseLyric(data.lyric.text);
              if (currentLyrics.length > 0) {
                lyricDisplay.innerHTML = currentLyrics.map((lyric, index) => 
                  `<div class="lyric-line" data-time="${lyric.time}">${lyric.text}</div>`
                ).join('');
              } else {
                lyricDisplay.innerHTML = '<div class="lyric-empty">暂无歌词</div>';
              }
            } else {
              lyricDisplay.innerHTML = '<div class="lyric-empty">暂无歌词</div>';
              currentLyrics = [];
            }
            
            // 更新小播放器
            const songNameEl = musicPlayer.querySelector('.song-name');
            const songArtistEl = musicPlayer.querySelector('.song-artist');
            const coverImg = musicPlayer.querySelector('.player-cover img');
            
            if (songNameEl) songNameEl.textContent = data.name;
            if (songArtistEl && data.artists) {
              songArtistEl.textContent = data.artists.map(a => a.name).join(' / ');
            }
            if (coverImg && data.cover) {
              coverImg.src = data.cover.medium || data.cover.small || data.cover.large;
            }
            
            // 创建新音频
            if (audio) {
              audio.pause();
              audio = null;
            }
            
            if (data.url) {
              audio = new Audio(data.url);
              const playBtn = document.getElementById('music-play');
              const miniPlayBtn = musicPlayer.querySelector('.play-btn');
              
              // 不自动播放，等待用户点击
              isPlaying = false;
              if (playBtn) {
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
              }
              if (miniPlayBtn) {
                miniPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
              }
              
              // 更新进度和歌词
              audio.addEventListener('timeupdate', () => {
                const progressFill = document.getElementById('music-progress-fill');
                const currentTime = document.getElementById('music-current');
                const miniProgressFill = musicPlayer.querySelector('.progress-fill');
                const miniCurrentTime = musicPlayer.querySelector('.progress-time span:first-child');
                
                if (progressFill && audio.duration) {
                  const percent = (audio.currentTime / audio.duration) * 100;
                  progressFill.style.width = percent + '%';
                }
                if (miniProgressFill && audio.duration) {
                  const percent = (audio.currentTime / audio.duration) * 100;
                  miniProgressFill.style.width = percent + '%';
                }
                if (currentTime) {
                  const mins = Math.floor(audio.currentTime / 60);
                  const secs = Math.floor(audio.currentTime % 60);
                  currentTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
                if (miniCurrentTime) {
                  const mins = Math.floor(audio.currentTime / 60);
                  const secs = Math.floor(audio.currentTime % 60);
                  miniCurrentTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
                
                // 同步歌词
                if (currentLyrics.length > 0) {
                  const time = Math.floor(audio.currentTime);
                  let newIndex = -1;
                  
                  for (let i = 0; i < currentLyrics.length; i++) {
                    if (time >= currentLyrics[i].time) {
                      newIndex = i;
                    } else {
                      break;
                    }
                  }
                  
                  if (newIndex !== currentLyricIndex) {
                    currentLyricIndex = newIndex;
                    const lyricLines = document.querySelectorAll('.lyric-line');
                    lyricLines.forEach((line, index) => {
                      line.classList.toggle('active', index === currentLyricIndex);
                    });
                    
                    // 滚动到当前歌词
                    if (currentLyricIndex >= 0 && lyricLines[currentLyricIndex]) {
                      lyricLines[currentLyricIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }
                }
              });
              
              audio.addEventListener('loadedmetadata', () => {
                const duration = document.getElementById('music-duration');
                const miniDuration = musicPlayer.querySelector('.progress-time span:last-child');
                if (duration) {
                  const mins = Math.floor(audio.duration / 60);
                  const secs = Math.floor(audio.duration % 60);
                  duration.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
                if (miniDuration) {
                  const mins = Math.floor(audio.duration / 60);
                  const secs = Math.floor(audio.duration % 60);
                  miniDuration.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
              });
              
              audio.addEventListener('ended', () => {
                isPlaying = false;
                if (playBtn) {
                  playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                }
                if (miniPlayBtn) {
                  miniPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                }
              });
              
              // 为小播放器的播放按钮添加事件
              if (miniPlayBtn && !miniPlayBtn.hasAttribute('data-bound')) {
                miniPlayBtn.setAttribute('data-bound', 'true');
                miniPlayBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  if (!audio) return;
                  
                  if (isPlaying) {
                    audio.pause();
                    miniPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                    if (playBtn) {
                      playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                    }
                    isPlaying = false;
                  } else {
                    audio.play();
                    miniPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
                    if (playBtn) {
                      playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
                    }
                    isPlaying = true;
                  }
                });
              }
              
              // 为小播放器进度条添加事件
              const miniProgressBar = musicPlayer.querySelector('.progress-bar');
              if (miniProgressBar && !miniProgressBar.hasAttribute('data-bound')) {
                miniProgressBar.setAttribute('data-bound', 'true');
                miniProgressBar.addEventListener('click', (e) => {
                  e.stopPropagation();
                  if (!audio || !audio.duration) return;
                  
                  const rect = miniProgressBar.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  audio.currentTime = percent * audio.duration;
                });
              }
            }
          }
        })
        .catch(err => console.error('Music API error:', err));
    };
    
    if (musicConfig) {
      try {
        const config = JSON.parse(musicConfig);
        currentConfig = config;
        
        // 初始加载第一首歌
        loadSong(config.params.msg);
        
        // 加载播放列表
        if (config.playlist && Array.isArray(config.playlist)) {
          const playlistContainer = document.getElementById('playlist-container');
          playlistContainer.innerHTML = config.playlist.map((song, index) => {
            // 支持字符串或对象格式
            const songName = typeof song === 'string' ? song : song.name;
            const artistName = typeof song === 'string' ? '点击播放' : (song.artist || '未知艺术家');
            const searchQuery = typeof song === 'string' ? song : `${song.name} ${song.artist}`;
            
            return `
              <div class="playlist-item ${index === 0 ? 'active' : ''}" data-song="${searchQuery}">
                <div class="playlist-item-info">
                  <div class="playlist-item-name">${songName}</div>
                  <div class="playlist-item-artist">${artistName}</div>
                </div>
              </div>
            `;
          }).join('');
          
          // 添加播放列表点击事件
          playlistContainer.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
              const searchQuery = item.getAttribute('data-song');
              
              // 更新激活状态
              playlistContainer.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
              item.classList.add('active');
              
              // 加载歌曲
              loadSong(searchQuery);
            });
          });
        }
        
        // 播放/暂停按钮（大播放器）
        const playBtn = document.getElementById('music-play');
        if (playBtn) {
          playBtn.addEventListener('click', () => {
            if (!audio) return;
            
            const miniPlayBtn = musicPlayer.querySelector('.play-btn');
            if (isPlaying) {
              audio.pause();
              playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
              if (miniPlayBtn) {
                miniPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
              }
              isPlaying = false;
            } else {
              audio.play();
              playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
              if (miniPlayBtn) {
                miniPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
              }
              isPlaying = true;
            }
          });
        }
        
        // 进度条拖动（大播放器）
        const progressBar = document.getElementById('music-progress-bar');
        if (progressBar) {
          progressBar.addEventListener('click', (e) => {
            if (!audio || !audio.duration) return;
            
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
          });
        }
        
        // 标签页切换
        const tabs = document.querySelectorAll('.music-tab');
        tabs.forEach(tab => {
          tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // 更新标签激活状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 切换内容
            document.querySelectorAll('.tab-pane').forEach(pane => {
              pane.classList.remove('active');
            });
            document.getElementById(`tab-${tabName}`).classList.add('active');
          });
        });
        
      } catch (e) {
        console.error('Music config error:', e);
      }
    }
  }

  // 加载游戏展示
  const gamesTrigger = document.querySelector('.games-trigger');
  const gamesModal = document.getElementById('games-modal');
  
  if (gamesTrigger && gamesModal) {
    const gamesConfig = gamesTrigger.getAttribute('data-games-config');
    
    // 点击触发器打开弹窗
    gamesTrigger.addEventListener('click', () => {
      gamesModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    // 关闭弹窗
    const closeGamesModal = () => {
      gamesModal.classList.remove('active');
      document.body.style.overflow = '';
    };
    
    const gamesClose = document.getElementById('games-close');
    if (gamesClose) {
      gamesClose.addEventListener('click', closeGamesModal);
    }
    
    gamesModal.addEventListener('click', (e) => {
      if (e.target === gamesModal) closeGamesModal();
    });
    
    // 渲染游戏墙
    if (gamesConfig) {
      try {
        const config = JSON.parse(gamesConfig);
        if (config.enabled && config.list && Array.isArray(config.list)) {
          const gamesWall = document.getElementById('games-wall');
          
          gamesWall.innerHTML = config.list.map(game => {
            // 生成星级
            const stars = Array.from({length: 5}, (_, i) => 
              `<span class="game-star ${i < game.rating ? '' : 'empty'}">★</span>`
            ).join('');
            
            // 状态样式和标签
            const statusClass = game.status === '游玩中' ? 'playing' : 'completed';
            const statusText = game.status;
            
            return `
              <div class="game-card">
                <img src="${game.cover}" alt="${game.name}" class="game-cover" loading="lazy">
                <div class="game-status-badge ${statusClass}">${statusText}</div>
                <div class="game-overlay">
                  <h3 class="game-name">${game.name}</h3>
                  <div class="game-rating">${stars}</div>
                  <div class="game-meta">
                    <span class="game-badge">${game.platform}</span>
                    <span class="game-badge">${game.genre}</span>
                  </div>
                  <div class="game-playtime">⏱️ ${game.playTime}</div>
                </div>
              </div>
            `;
          }).join('');
        }
      } catch (e) {
        console.error('Games config error:', e);
      }
    }
  }

  // 星座运势查询（简化版）
  const zodiacCompact = document.querySelector('.zodiac-fortune-compact');
  if (zodiacCompact) {
    const zodiacName = zodiacCompact.getAttribute('data-zodiac');
    const toggleBtn = zodiacCompact.querySelector('.fortune-toggle');
    const compactContent = zodiacCompact.querySelector('.fortune-compact-content');
    const fortuneLoading = zodiacCompact.querySelector('.fortune-loading');
    const fortuneData = zodiacCompact.querySelector('.fortune-data');
    let isExpanded = false;
    let isLoaded = false;
    
    // 提取星座名称（去掉"座"字）
    const zodiacQuery = zodiacName.replace('座', '');
    
    // 切换展开/收起
    const toggleHeader = zodiacCompact.querySelector('.zodiac-compact-header');
    toggleHeader.addEventListener('click', () => {
      isExpanded = !isExpanded;
      zodiacCompact.classList.toggle('expanded', isExpanded);
      compactContent.style.display = isExpanded ? 'block' : 'none';
      
      // 首次展开时加载运势
      if (isExpanded && !isLoaded) {
        loadFortune();
      }
    });
    
    // 加载运势
    const loadFortune = async () => {
      fortuneLoading.style.display = 'flex';
      fortuneData.style.display = 'none';
      
      try {
        const response = await fetch(`https://v.api.aa1.cn/api/xingzuo/?msg=${encodeURIComponent(zodiacQuery)}`);
        const data = await response.json();
        
        if (data.code === 1 && data.msg) {
          // 只显示关键信息
          zodiacCompact.querySelector('.fortune-color').textContent = data.xyys || '—';
          zodiacCompact.querySelector('.fortune-number').textContent = data.xysz || '—';
          zodiacCompact.querySelector('.fortune-noble').textContent = (data.grxz || '—') + (data.grfw ? ' ' + data.grfw : '');
          
          // 显示数据，隐藏加载
          fortuneLoading.style.display = 'none';
          fortuneData.style.display = 'block';
          isLoaded = true;
        } else {
          throw new Error('运势数据获取失败');
        }
      } catch (error) {
        console.error('Fortune API error:', error);
        fortuneLoading.innerHTML = '<span>加载失败</span>';
      }
    };
  }

  // 标签筛选
  const tagChips = document.querySelectorAll('.tags .chip');
  const postCards = document.querySelectorAll('.post-card');
  
  if (tagChips.length > 0 && postCards.length > 0) {
    tagChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedTag = chip.getAttribute('data-tag');
        
        // 更新激活状态
        tagChips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        
        // 筛选文章
        postCards.forEach(card => {
          const cardTags = card.getAttribute('data-tags');
          
          if (selectedTag === 'all' || !cardTags) {
            card.style.display = '';
          } else {
            // 转换为小写进行不区分大小写的匹配
            const tags = cardTags.split(',').map(t => t.trim().toLowerCase());
            const selectedTagLower = selectedTag.toLowerCase();
            
            if (tags.includes(selectedTagLower)) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          }
        });
        
        // 平滑滚动到文章列表
        const postsSection = document.querySelector('.posts');
        if (postsSection) {
          postsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  // 即刻自动轮播
  const autoCarousel = document.querySelector('.moments-auto');
  if (autoCarousel) {
    const cards = autoCarousel.querySelectorAll('.auto-card');
    let currentAuto = 0;
    let autoTimer = null;

    const showAutoCard = (index) => {
      cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
      });
    };

    const nextAuto = () => {
      currentAuto = (currentAuto + 1) % cards.length;
      showAutoCard(currentAuto);
    };

    const startAuto = () => {
      autoTimer = setInterval(nextAuto, 3000);
    };

    const stopAuto = () => {
      if (autoTimer) clearInterval(autoTimer);
    };

    autoCarousel.addEventListener('mouseenter', stopAuto);
    autoCarousel.addEventListener('mouseleave', startAuto);

    startAuto();
  }

  // 分类轮播
  const carousel = document.querySelector('.category-carousel');
  if (carousel) {
    const cards = carousel.querySelectorAll('.category-card');
    let currentIndex = 0;
    let autoPlayTimer = null;

    const showCard = (index) => {
      cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
      });
    };

    const nextCard = () => {
      currentIndex = (currentIndex + 1) % cards.length;
      showCard(currentIndex);
    };

    // 自动播放
    const startAutoPlay = () => {
      autoPlayTimer = setInterval(nextCard, 4000);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };

    // 鼠标悬停暂停
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // 启动自动播放
    startAutoPlay();
  }

  // 问候语功能
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    const greetingText = greetingEl.querySelector('.greeting-text');
    const greetingSub = greetingEl.querySelector('.greeting-sub');
    
    // 获取时间问候语
    const getTimeGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 3) return '深夜了';
      if (hour >= 3 && hour < 6) return '凌晨了';
      if (hour >= 6 && hour < 9) return '早上好';
      if (hour >= 9 && hour < 12) return '上午好';
      if (hour >= 12 && hour < 14) return '中午好';
      if (hour >= 14 && hour < 18) return '下午好';
      if (hour >= 18 && hour < 22) return '晚上好';
      if (hour >= 22) return '夜深了';
      return '你好';
    };

    // 根据天气和时间生成关怀语
    const getWeatherCare = (weather, temp) => {
      const tempNum = parseFloat(temp);
      const hour = new Date().getHours();
      
      // 深夜/凌晨特殊关怀
      if (hour >= 22 || hour < 6) {
        const lateNightCares = [
          '早点休息哦',
          '注意休息',
          '别熬夜了',
          '该睡觉了',
          '熬夜伤身',
          '感谢深夜来访',
          '注意身体',
          '夜猫子啊'
        ];
        return lateNightCares[Math.floor(Math.random() * lateNightCares.length)];
      }
      
      // 清晨特殊问候
      if (hour >= 6 && hour < 9) {
        const morningCares = [
          '新的一天',
          '元气满满',
          '早起的鸟儿',
          '美好的早晨'
        ];
        return morningCares[Math.floor(Math.random() * morningCares.length)];
      }
      
      // 天气相关关怀
      if (weather.includes('雨')) {
        return '记得带伞哦';
      }
      if (weather.includes('雪')) {
        return '注意保暖';
      }
      if (tempNum < 10) {
        return '天冷，多穿点';
      }
      if (tempNum > 30) {
        return '天热，多喝水';
      }
      if (weather.includes('晴')) {
        return '天气不错';
      }
      if (weather.includes('阴') || weather.includes('云')) {
        return '适合出门';
      }
      return '祝你开心';
    };

    // 获取天气并更新问候语
    fetch('https://api.kxzjoker.cn/api/Weather?ip')
      .then(res => res.json())
      .then(data => {
        if (data.code === 200 && data.data) {
          const tianqi = data.data.tianqi;
          const timeGreeting = getTimeGreeting();
          const weatherCare = getWeatherCare(tianqi.weather, tianqi.temperature);
          
          greetingText.textContent = `${timeGreeting}，${weatherCare}`;
          greetingSub.textContent = `${tianqi.district || tianqi.city} · ${tianqi.weather} ${tianqi.temperature}°C`;
        } else {
          greetingText.textContent = getTimeGreeting();
          greetingSub.textContent = '祝你开心每一天';
        }
      })
      .catch(() => {
        greetingText.textContent = getTimeGreeting();
        greetingSub.textContent = '祝你开心每一天';
      });
  }

  // 图片懒加载优化
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
      img.addEventListener('error', () => {
        img.classList.add('loaded');
      });
    }
  });

  // 页面过渡效果 - 平滑导航切换
  const navLinks = document.querySelectorAll('.sidenav a:not(.theme-btn)');
  const content = document.querySelector('.content');
  const sidebar = document.querySelector('.sidebar');
  
  if (content && navLinks.length > 0) {
    // 预加载链接
    navLinks.forEach(link => {
      // 鼠标悬停时预加载
      link.addEventListener('mouseenter', () => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'prefetch';
        preloadLink.href = link.href;
        document.head.appendChild(preloadLink);
      });
      
      link.addEventListener('click', (e) => {
        // 如果是当前页面，不处理
        if (link.classList.contains('is-active')) {
          e.preventDefault();
          return;
        }
        
        // 只对主内容区和侧边栏添加淡出动画
        content.style.transition = 'opacity 0.15s ease-out';
        content.style.opacity = '0';
        if (sidebar) {
          sidebar.style.transition = 'opacity 0.15s ease-out';
          sidebar.style.opacity = '0';
        }
        
        // 快速跳转
        e.preventDefault();
        setTimeout(() => {
          window.location.href = link.href;
        }, 150);
      });
    });
    
    // 页面加载完成后的淡入
    window.addEventListener('pageshow', () => {
      content.style.transition = 'opacity 0.2s ease-in';
      content.style.opacity = '1';
      if (sidebar) {
        sidebar.style.transition = 'opacity 0.2s ease-in';
        sidebar.style.opacity = '1';
      }
    });
  }

  // iOS风格触摸反馈 - 移动端
  if (window.innerWidth <= 768) {
    // 标签触摸反馈
    const archiveTags = document.querySelectorAll('.archive-tag');
    archiveTags.forEach(item => {
      item.addEventListener('touchstart', function() {
        this.style.transition = 'none';
      });
      
      item.addEventListener('touchend', function() {
        this.style.transition = 'background 0.2s ease, transform 0.2s ease';
      });
    });
    
    // 分类模块触摸反馈
    const categoryItems = document.querySelectorAll('.category-module-header, .category-module-item, .category-module-more');
    categoryItems.forEach(item => {
      item.addEventListener('touchstart', function() {
        this.style.transition = 'none';
      });
      
      item.addEventListener('touchend', function() {
        this.style.transition = 'background 0.2s ease';
      });
    });

    // 滚动回弹效果（优化版，避免卡顿）
    const scrollAreas = document.querySelectorAll('.scroll-area');
    scrollAreas.forEach(scrollArea => {
      let startY = 0;
      let startScrollTop = 0;
      let isPulling = false;

      scrollArea.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startScrollTop = scrollArea.scrollTop;
        isPulling = false;
        scrollArea.style.transition = '';
      }, { passive: true });

      scrollArea.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        const currentScrollTop = scrollArea.scrollTop;
        
        // 检查是否在顶部并且向下拉
        if (currentScrollTop === 0 && deltaY > 0) {
          isPulling = true;
          const pullDistance = Math.min(deltaY * 0.3, 80);
          scrollArea.style.transform = `translateY(${pullDistance}px)`;
          scrollArea.style.transition = 'none';
        }
        // 检查是否在底部并且向上拉
        else if (currentScrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 1 && deltaY < 0) {
          isPulling = true;
          const pullDistance = Math.max(deltaY * 0.3, -80);
          scrollArea.style.transform = `translateY(${pullDistance}px)`;
          scrollArea.style.transition = 'none';
        }
        // 正常滚动时重置
        else if (isPulling) {
          scrollArea.style.transform = '';
          isPulling = false;
        }
      }, { passive: true });

      scrollArea.addEventListener('touchend', () => {
        if (isPulling) {
          scrollArea.style.transform = '';
          scrollArea.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          isPulling = false;
          
          setTimeout(() => {
            scrollArea.style.transition = '';
          }, 300);
        }
      }, { passive: true });
    });
  }

  // iPod 播放器会在单独的脚本文件中加载

  // 滚动动画观察器 - 只播放一次
  const animateOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          let delay = element.dataset.delay || '0';
          
          // 为文章卡片和动态卡片自动添加递增延迟
          if (element.classList.contains('post-card') || element.classList.contains('moment-item')) {
            const parent = element.parentElement;
            const siblings = Array.from(parent.children).filter(child => 
              (child.classList.contains('post-card') || child.classList.contains('moment-item')) &&
              child.style.display !== 'none'
            );
            const index = siblings.indexOf(element);
            delay = index * 60;
          }
          
          // 设置延迟后添加类
          setTimeout(() => {
            element.classList.add('in-view');
          }, delay);
          
          // 停止观察，只播放一次
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    // 观察所有需要动画的元素
    document.querySelectorAll('.post-card, .moment-item').forEach(el => {
      observer.observe(el);
    });
  };

  // 页面加载后启动动画观察器
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateOnScroll);
  } else {
    animateOnScroll();
  }

  // 搜索功能
  if (document.getElementById('search-input')) {
    let searchData = [];
    let searchTimeout;

    // 加载搜索数据
    try {
      const searchScript = document.getElementById('search-data');
      if (searchScript) {
        searchData = JSON.parse(searchScript.textContent);
      }
    } catch (e) {
      console.error('搜索数据加载失败:', e);
    }

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchClear = document.getElementById('search-clear');
    const searchStats = document.getElementById('search-stats');
    const searchEmpty = document.getElementById('search-empty');
    const searchNoResults = document.getElementById('search-no-results');
    const searchLoading = document.getElementById('search-loading');
    const searchList = document.getElementById('search-list');
    const resultsCount = document.getElementById('results-count');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');

    // 搜索函数
    function performSearch(query) {
      if (!query.trim()) {
        showEmpty();
        return;
      }

      showLoading();

      // 模拟搜索延迟
      setTimeout(() => {
        const results = searchArticles(query.trim());
        displayResults(results, query);
      }, 300);
    }

    // 搜索算法
    function searchArticles(query) {
      const keywords = query.toLowerCase().split(/\s+/);
      
      return searchData.filter(article => {
        const searchText = [
          article.title,
          article.summary,
          article.content,
          ...article.tags,
          ...article.categories
        ].join(' ').toLowerCase();

        return keywords.every(keyword => searchText.includes(keyword));
      }).sort((a, b) => {
        // 按相关度排序：标题匹配优先
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const queryLower = query.toLowerCase();
        
        const aTitleMatch = aTitle.includes(queryLower);
        const bTitleMatch = bTitle.includes(queryLower);
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        // 按日期排序
        return new Date(b.date) - new Date(a.date);
      });
    }

    // 高亮关键词
    function highlightText(text, query) {
      if (!query) return text;
      
      const keywords = query.split(/\s+/);
      let result = text;
      
      keywords.forEach(keyword => {
        if (keyword.length > 1) {
          const regex = new RegExp(`(${keyword})`, 'gi');
          result = result.replace(regex, '<span class="search-highlight">$1</span>');
        }
      });
      
      return result;
    }

    // 显示搜索结果
    function displayResults(results, query) {
      hideAll();
      
      if (results.length === 0) {
        searchNoResults.style.display = 'block';
        return;
      }

      searchStats.style.display = 'block';
      resultsCount.textContent = results.length;
      
      searchList.innerHTML = results.map(article => {
        const highlightedTitle = highlightText(article.title, query);
        const highlightedSummary = highlightText(article.summary, query);
        
        return `
          <a href="${article.url}" class="search-item">
            <h3 class="search-item-title">${highlightedTitle}</h3>
            <div class="search-item-meta">
              <div class="search-item-date">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                ${formatDate(article.date)}
              </div>
              ${article.tags.length > 0 ? `
                <div class="search-item-tags">
                  ${article.tags.slice(0, 3).map(tag => 
                    `<span class="search-item-tag">${tag}</span>`
                  ).join('')}
                  ${article.tags.length > 3 ? `<span class="search-item-tag">+${article.tags.length - 3}</span>` : ''}
                </div>
              ` : ''}
            </div>
            <p class="search-item-summary">${highlightedSummary}</p>
          </a>
        `;
      }).join('');
    }

    // 格式化日期
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // 显示状态函数
    function showEmpty() {
      hideAll();
      searchEmpty.style.display = 'block';
    }

    function showLoading() {
      hideAll();
      searchLoading.style.display = 'block';
    }

    function hideAll() {
      searchStats.style.display = 'none';
      searchEmpty.style.display = 'none';
      searchNoResults.style.display = 'none';
      searchLoading.style.display = 'none';
      searchList.innerHTML = '';
    }

    // 事件监听
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value;
      
      // 显示/隐藏清除按钮
      if (value.trim()) {
        searchClear.style.display = 'flex';
      } else {
        searchClear.style.display = 'none';
      }
      
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(value);
      }, 500);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchTimeout);
        performSearch(searchInput.value);
      }
    });

    searchBtn.addEventListener('click', () => {
      performSearch(searchInput.value);
    });

    // 清除按钮
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      searchInput.focus();
      showEmpty();
    });

    // 建议标签点击
    suggestionTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-query');
        searchInput.value = query;
        searchClear.style.display = 'flex';
        performSearch(query);
      });
    });

    // URL 参数搜索
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      searchInput.value = queryParam;
      performSearch(queryParam);
    }
  }
})();
 