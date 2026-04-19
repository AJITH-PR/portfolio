  const PAGE_SIZE  = 10;
  let allQuestions = [];
  let currentPage  = 1;
  let totalPages   = 1;
  let revealedSet  = new Set(); // global set of revealed question indices

  async function loadQuiz() {
    try {
      const res = await fetch('/assets/java_juice_contents_transformed.json');
      if (!res.ok) throw new Error('Failed to fetch sample.json');
      const data = await res.json();
      init(data);
    } catch (err) {
      document.getElementById('status').innerHTML = `
        <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
        <p style="color:#ff5c7a">Could not load <strong>sample.json</strong>.</p>
        <p style="margin-top:8px;font-size:.85rem">
          Make sure <code>sample.json</code> is in the same folder as this HTML file.
        </p>
        <p style="margin-top:4px;font-size:.78rem;color:#555">${err.message}</p>`;
    }
  }

  function init(data) {
    document.getElementById('test-title').textContent = data.title || 'Mock Test';
    document.getElementById('test-desc').textContent  = data.description || '';
    allQuestions = data.questions || [];
    totalPages   = Math.ceil(allQuestions.length / PAGE_SIZE);

    document.getElementById('stats-bar').innerHTML = `
      <div class="stat">
        <div class="stat-num">${allQuestions.length}</div>
        <div class="stat-label">Total Questions</div>
      </div>
      <div class="stat">
        <div class="stat-num">${totalPages}</div>
        <div class="stat-label">Pages</div>
      </div>
      <div class="stat">
        <div class="stat-num" id="reveal-count">0</div>
        <div class="stat-label">Revealed</div>
      </div>`;

    document.getElementById('status').style.display = 'none';
    if (allQuestions.length > PAGE_SIZE) {
      document.getElementById('jump-wrap').style.display = 'flex';
      document.getElementById('jump-input').max = totalPages;
    }
    goToPage(1);
  }

  function renderPage() {
    const start  = (currentPage - 1) * PAGE_SIZE;
    const end    = Math.min(start + PAGE_SIZE, allQuestions.length);
    const slice  = allQuestions.slice(start, end);
    const letters = ['A','B','C','D','E','F'];
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    slice.forEach((q, localIdx) => {
      const gi = start + localIdx; // global index
      const revealed = revealedSet.has(gi);

      const optionsHTML = (q.options || []).map((opt, i) => {
        const correct = opt === q.answer;
        return `<div class="option${correct ? ' correct' : ''}">
          <span class="option-letter">${letters[i]}</span>
          <span class="option-text">${esc(opt)}</span>
        </div>`;
      }).join('');

      const card = document.createElement('div');
      card.className = 'question-card' + (revealed ? ' revealed' : '');
      card.id = 'card-' + gi;
      card.innerHTML = `
        <div class="card-header">
          <span class="q-num">Q${String(gi + 1).padStart(3,'0')}</span>
          <p class="q-text">${esc(q.question)}</p>
        </div>
        ${q.options?.length ? `<div class="options-list">${optionsHTML}</div>` : ''}
        <div class="card-footer">
          <button class="reveal-btn${revealed ? ' active' : ''}" id="btn-${gi}" onclick="toggle(${gi})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span>${revealed ? 'Hide Answer' : 'Show Answer'}</span>
          </button>
          <div class="answer-panel${revealed ? ' open' : ''}" id="panel-${gi}">
            <div class="answer-inner">
            <!-- <div class="answer-label">Correct Answer</div> -->
              <div class="answer-value">${revealed ? esc(q.answer) : ''}</div>
              <div class="answer-explanation">${revealed && q.explanation ? esc(q.explanation) : ''}</div>
            </div>
          </div>
        </div>`;
      container.appendChild(card);
    });

    updatePageInfo();
    renderPagination();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggle(gi) {
    const q     = allQuestions[gi];
    const panel = document.getElementById('panel-' + gi);
    const btn   = document.getElementById('btn-' + gi);
    const card  = document.getElementById('card-' + gi);
    const label = btn.querySelector('span');
    const open  = panel.classList.contains('open');

    if (!open) {
      panel.querySelector('.answer-value').textContent       = q.answer || '';
      panel.querySelector('.answer-explanation').textContent = q.explanation || '';
      panel.classList.add('open');
      card.classList.add('revealed');
      btn.classList.add('active');
      label.textContent = 'Hide Answer';
      if (!revealedSet.has(gi)) { revealedSet.add(gi); updateProgress(); }
    } else {
      panel.classList.remove('open');
      card.classList.remove('revealed');
      btn.classList.remove('active');
      label.textContent = 'Show Answer';
    }
  }

  function revealAll() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end   = Math.min(start + PAGE_SIZE, allQuestions.length);
    for (let i = start; i < end; i++) {
      if (!document.getElementById('panel-' + i)?.classList.contains('open')) toggle(i);
    }
  }

  function hideAll() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end   = Math.min(start + PAGE_SIZE, allQuestions.length);
    for (let i = start; i < end; i++) {
      if (document.getElementById('panel-' + i)?.classList.contains('open')) toggle(i);
    }
  }

  function goToPage(p) {
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    renderPage();
  }

  function jumpToPage() {
    const v = parseInt(document.getElementById('jump-input').value);
    if (v >= 1 && v <= totalPages) goToPage(v);
    document.getElementById('jump-input').value = '';
  }

  function renderPagination() {
    const nav = document.getElementById('pagination');
    if (totalPages <= 1) { nav.innerHTML = ''; return; }

    const range = pageRange(currentPage, totalPages);
    const prev  = `<button class="pg-btn" onclick="goToPage(${currentPage-1})"
      ${currentPage===1?'disabled':''} title="Previous">&#8249;</button>`;
    const next  = `<button class="pg-btn" onclick="goToPage(${currentPage+1})"
      ${currentPage===totalPages?'disabled':''} title="Next">&#8250;</button>`;

    const mid = range.map(p =>
      p === '…'
        ? `<span class="pg-ellipsis">…</span>`
        : `<button class="pg-btn${p===currentPage?' active':''}" onclick="goToPage(${p})">${p}</button>`
    ).join('');

    nav.innerHTML = prev + mid + next;
  }

  function pageRange(cur, tot) {
    if (tot <= 7) return Array.from({length: tot}, (_,i) => i+1);
    const r = [1];
    if (cur > 3) r.push('…');
    for (let p = Math.max(2,cur-1); p <= Math.min(tot-1,cur+1); p++) r.push(p);
    if (cur < tot-2) r.push('…');
    r.push(tot);
    return r;
  }

  function updatePageInfo() {
    const s = (currentPage-1)*PAGE_SIZE + 1;
    const e = Math.min(currentPage*PAGE_SIZE, allQuestions.length);
    document.getElementById('page-info').textContent =
      `Page ${currentPage} / ${totalPages}  ·  Q${s}–Q${e}`;
  }

  function updateProgress() {
    const total = allQuestions.length;
    const count = revealedSet.size;
    document.getElementById('progress-fill').style.width = total ? (count/total*100)+'%' : '0%';
    document.getElementById('progress-text').textContent = `${count} / ${total} revealed`;
    const rc = document.getElementById('reveal-count');
    if (rc) rc.textContent = count;
  }

  function esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  loadQuiz();