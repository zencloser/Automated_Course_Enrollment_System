const API='http://localhost:5000/api';
let allStudents=[],allCourses=[],currentUser=null;

// ── UTILS ──
function toast(msg,type='info'){const t=document.getElementById('toast');t.textContent=msg;t.className='show '+(type||'info');setTimeout(()=>t.className='',3200);}
function badge(cls,text){return `<span class="badge ${cls}">${text}</span>`;}
function scholarBadge(t){return badge({Gold:'b-gold',Silver:'b-silver',Bronze:'b-bronze',None:'b-gray'}[t]||'b-gray',t);}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function svgIcon(d,size=15){return `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">${d}</svg>`;}

async function api(path,opts={}){
  try{
    const r=await fetch(API+path,{credentials:'include',...opts});
    return await r.json();
  }catch(e){toast('API error: '+e.message,'error');return null;}
}

// ── LOGIN ──
async function doLogin(){
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-pass').value.trim();
  const err=document.getElementById('login-error');
  const btn=document.querySelector('.login-btn');
  err.textContent='';
  if(!email||!pass){err.textContent='Please enter email and password.';return;}

  const res=await api('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pass})});

  // ── Handle rate limit (429) specially ──
  if(!res){err.textContent='Login failed. Please try again.';return;}
  if(res.retry_after){
    // Show countdown timer
    let seconds = 60;
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    const countdown = setInterval(()=>{
      err.textContent = `Too many attempts. Try again in ${seconds}s`;
      err.style.color = 'var(--red)';
      seconds--;
      if(seconds < 0){
        clearInterval(countdown);
        err.textContent = '';
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    }, 1000);
    return;
  }
  if(res.error){err.textContent=res?.error||'Login failed.';return;}}

async function doLogout(){
  await api('/logout',{method:'POST'});
  currentUser=null;allStudents=[];allCourses=[];
  document.getElementById('app').style.display='none';
  document.getElementById('login-page').style.display='flex';
}

function startApp(user){
  document.getElementById('login-page').style.display='none';
  document.getElementById('app').style.display='block';
  // set user chip
  const initials=user.full_name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('user-avatar').textContent=initials;
  document.getElementById('user-name-chip').textContent=user.full_name;
  document.getElementById('user-role-chip').textContent=user.role;
  buildNav(user.user_type);
  loadAlerts();
  // load first page
  if(user.user_type==='student') showPage('portal');
  else showPage('dashboard');
}

function buildNav(type){
  const nav=document.getElementById('sidebar-nav');
  const isAdmin=type==='admin';
  const isStudent=type==='student';
  const isFaculty=type==='instructor';

  let html='';
  if(isStudent){
    html+=`<div class="nav-section">My account</div>
    ${navItem('portal', svgIcon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),'My portal')}
    ${navItem('att-calc',svgIcon('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/>'),'Attendance calc')}
    ${navItem('gpa-calc',svgIcon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),'GPA calculator')}
    <div class="nav-section">Academic</div>
    ${navItem('courses',svgIcon('<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>'),'Courses')}
    ${navItem('payments',svgIcon('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),'Payments')}
    ${navItem('alerts',svgIcon('<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>'),'Alerts','nav-badge','alert-badge')}
    ${navItem('helpline',svgIcon('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>'),'Help & contact')}`;
  } else if(isFaculty){
    html+=`<div class="nav-section">Overview</div>
    ${navItem('dashboard',svgIcon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),'Dashboard')}
    <div class="nav-section">Academic</div>
    ${navItem('students',svgIcon('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>'),'Students')}
    ${navItem('courses',svgIcon('<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>'),'Courses')}
    ${navItem('attendance',svgIcon('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/>'),'Attendance')}
    ${navItem('grades',svgIcon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),'Grades')}
    ${navItem('alerts',svgIcon('<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>'),'Alerts','nav-badge','alert-badge')}
    ${navItem('helpline',svgIcon('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>'),'Help & contact')}`;
  } else {
    html+=`<div class="nav-section">Overview</div>
    ${navItem('dashboard',svgIcon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),'Dashboard')}
    <div class="nav-section">Academic</div>
    ${navItem('students',svgIcon('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>'),'Students')}
    ${navItem('courses',svgIcon('<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>'),'Courses')}
    ${navItem('enrollment',svgIcon('<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>'),'Enrollment')}
    ${navItem('attendance',svgIcon('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/>'),'Attendance')}
    ${navItem('grades',svgIcon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),'Grades')}
    <div class="nav-section">Finance & Admin</div>
    ${navItem('payments',svgIcon('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),'Payments')}
    ${navItem('reports',svgIcon('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),'Reports')}
    ${navItem('alerts',svgIcon('<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>'),'Alerts','nav-badge','alert-badge')}
    ${navItem('helpline',svgIcon('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>'),'Help & contact')}`;
  }
  nav.innerHTML=html;
}

function navItem(page,iconSvg,label,badgeClass='',badgeId=''){
  return `<div class="nav-item" onclick="showPage('${page}')">
    <div class="nav-icon">${iconSvg}</div>
    <span class="nav-label">${label}</span>
    ${badgeId?`<span class="${badgeClass}" id="${badgeId}">0</span>`:''}
  </div>`;
}

// ── PAGE NAV ──
function showPage(p){
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  const pg=document.getElementById('page-'+p);
  if(pg)pg.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el=>{
    if(el.getAttribute('onclick')===`showPage('${p}')`)el.classList.add('active');
  });
  const L={
    dashboard:loadDashboard,students:loadStudents,courses:loadCourses,
    enrollment:()=>{loadEnrollmentSelects();loadCourseHealth();},
    attendance:loadAttendanceSelects,grades:()=>{loadGradeSelects();loadAtRisk();},
    payments:loadPaymentSelects,reports:()=>{loadReportSelects();loadScholarship();},
    alerts:loadAlerts,portal:loadPortal,
    'att-calc':loadAttCalc,'gpa-calc':loadGpaCalc,
    helpline:()=>{}
  };
  if(L[p])L[p]();
}

// ── SELECTS ──
async function loadStudentSelects(...ids){
  if(!allStudents.length)allStudents=await api('/students')||[];
  ids.forEach(id=>{const el=document.getElementById(id);if(!el)return;const cur=el.value;el.innerHTML='<option value="">Select student...</option>';allStudents.forEach(s=>{el.innerHTML+=`<option value="${s.student_id}">${s.full_name} (${s.dept_name||''})</option>`;});el.value=cur;});
}
async function loadCourseSelects(...ids){
  if(!allCourses.length)allCourses=await api('/courses')||[];
  ids.forEach(id=>{const el=document.getElementById(id);if(!el)return;const cur=el.value;el.innerHTML='<option value="">Select course...</option>';allCourses.forEach(c=>{el.innerHTML+=`<option value="${c.course_id}">${c.course_code} — ${c.course_name}</option>`;});el.value=cur;});
}

// ── STUDENT PORTAL ──
async function loadPortal(){
  if(!currentUser||currentUser.user_type!=='student')return;
  const sid=currentUser.user_id;
  const s=await api('/students/'+sid);
  if(!s||!s.student_id)return;
  const initials=s.full_name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('portal-avatar').textContent=initials;
  document.getElementById('portal-name').textContent=s.full_name;
  document.getElementById('portal-meta').textContent=`${s.dept_name||'—'} · ${s.program_name||'—'} · Batch ${s.batch_year||'—'}`;
  document.getElementById('portal-cgpa').textContent=parseFloat(s.computed_cgpa||0).toFixed(2);
  document.getElementById('portal-scholarship').innerHTML=scholarBadge(s.scholarship||'None');

  const courses=await api('/students/'+sid+'/courses')||[];
  // Show payment summary in student portal
  const feeSummary = await api('/student-fee-summary/'+sid);
  if(feeSummary && !feeSummary.error && feeSummary.remaining > 0){
    const existing = document.getElementById('portal-pay-alert');
    if(!existing){
      const alertDiv = document.createElement('div');
      alertDiv.id = 'portal-pay-alert';
      alertDiv.style.cssText = 'background:rgba(255,95,95,0.07);border:1px solid rgba(255,95,95,0.2);border-radius:14px;padding:16px 20px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between';
      alertDiv.innerHTML = `<div>
        <div style="font-size:13px;font-weight:600;color:var(--red)">&#x26A0;&nbsp; Payment due</div>
        <div style="font-size:11px;color:var(--text2);margin-top:3px;font-family:'IBM Plex Mono',monospace">
          Outstanding balance: <strong style="color:var(--red)">&#8377;${feeSummary.remaining.toLocaleString()}</strong> for ${feeSummary.dept_name}
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="showPage('payments')">View & pay</button>`;
      const list = document.getElementById('portal-courses-list');
      list.parentNode.insertBefore(alertDiv, list);
    }
  }

  const el=document.getElementById('portal-courses-list');
  if(!courses.length){el.innerHTML='<div class="empty">No active courses.</div>';return;}
  el.innerHTML=`<div class="grid-2">${courses.map(c=>`
    <div class="card">
      <div class="card-title">${badge('b-violet',c.course_code)} <span style="margin-left:6px">${c.course_name}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">
        <div style="font-size:10px;color:var(--text3)">Grade<br><span class="mono" style="color:${parseFloat(c.grade||100)>=40?'var(--accent-mid)':'var(--red)'};font-size:18px;font-weight:700">${c.grade||'—'}</span></div>
        <div style="font-size:10px;color:var(--text3)">Completion<br><span class="mono" style="color:var(--text);font-size:18px;font-weight:700">${c.completion_pct||0}%</span></div>
        <div style="font-size:10px;color:var(--text3)">Attendance<br><span class="mono" style="color:${parseFloat(c.attendance||0)>=75?'var(--accent-mid)':parseFloat(c.attendance||0)>=50?'var(--amber)':'var(--red)'};font-size:18px;font-weight:700">${parseFloat(c.attendance||0).toFixed(1)}%</span></div>
      </div>
      <div class="prog-bar"><div class="prog-bar-fill" style="width:${c.completion_pct||0}%"></div></div>
    </div>`).join('')}</div>`;
}

// ── FEATURE 3: ATTENDANCE CALCULATOR ──
async function loadAttCalc(){
  if(!currentUser)return;
  const sid=currentUser.user_type==='student'?currentUser.user_id:null;
  if(!sid){document.getElementById('att-calc-body').innerHTML='<div class="empty">Only available for student login.</div>';return;}
  const data=await api('/students/'+sid+'/attendance-detail')||[];
  if(!data.length){document.getElementById('att-calc-body').innerHTML='<div class="empty">No attendance data found.</div>';return;}

  document.getElementById('att-calc-body').innerHTML=data.map(c=>{
    const pct     = parseFloat(c.attendance_pct || 0);
    const total   = parseInt(c.total_classes   || 0);
    const present = parseInt(c.present_count   || 0);
    const absent  = total - present;
    const cls     = pct >= 75 ? 'att-safe' : pct >= 50 ? 'att-warn' : 'att-danger';
    const barColor = pct >= 75 ? 'var(--accent-mid)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';

    // ── CAN MISS (when above 75%) ──
    // We want: present / (total + x) >= 0.75
    // x = floor(present/0.75) - total   [x = extra classes you can miss]
    // But those future classes are also attended by others — we assume you miss them
    // present stays same, total increases by x
    // So: present / (total + x) = 0.75
    // x = present/0.75 - total
    const canMiss = pct >= 75 ? Math.max(0, Math.floor(present / 0.75) - total) : 0;

    // ── NEED ATTEND (when below 75%) ──
    // We want: (present + x) / (total + x) = 0.75
    // present + x = 0.75 * total + 0.75 * x
    // x - 0.75x = 0.75*total - present
    // 0.25x = 0.75*total - present
    // x = (0.75*total - present) / 0.25
    const needAttend = pct < 75 ? Math.ceil((0.75 * total - present) / 0.25) : 0;
    // After attending needAttend more classes:
    const newTotal   = total + needAttend;
    const newPresent = present + needAttend;
    const newPct     = newTotal > 0 ? (newPresent / newTotal * 100).toFixed(1) : 0;

    // Status label
    let statusLabel = '';
    if(pct >= 90)      statusLabel = 'Excellent';
    else if(pct >= 75) statusLabel = 'Safe';
    else if(pct >= 50) statusLabel = 'Warning';
    else               statusLabel = 'Critical';

    return `<div class="att-card">
      <div class="att-card-header">
        <div>
          <div class="att-course-name">${c.course_code} — ${c.course_name}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px;font-family:'IBM Plex Mono',monospace">
            ${present} present &nbsp;|&nbsp; ${absent} absent &nbsp;|&nbsp; ${total} total classes
          </div>
        </div>
        <div class="att-pct-big ${cls}">${total > 0 ? pct.toFixed(1) : '—'}%</div>
      </div>
      <div class="att-bar-wrap">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:5px;font-family:'IBM Plex Mono',monospace">
          <span>0%</span><span style="color:var(--amber)">75% threshold</span><span>100%</span>
        </div>
        <div class="att-bar-bg">
          <div class="att-bar-fill" style="width:${Math.min(pct,100)}%;background:${barColor}"></div>
        </div>
        <div style="position:relative;height:0">
          <div style="position:absolute;left:75%;top:-12px;width:1px;height:24px;background:rgba(255,179,71,0.5)"></div>
        </div>
      </div>

      ${total === 0
        ? `<div class="att-calc-row">
             <div class="att-calc-chip" style="color:var(--text3)">
               <span class="chip-val" style="color:var(--text3)">—</span>No classes recorded yet
             </div>
           </div>`
        : pct >= 75
          ? `<div class="att-calc-row">
               <div class="att-calc-chip att-safe">
                 <span class="chip-val">${canMiss}</span>classes you can still miss
               </div>
               <div class="att-calc-chip" style="color:var(--text2)">
                 <span class="chip-val" style="color:var(--green)">${statusLabel}</span>
                 Above 75% threshold
               </div>
               <div class="att-calc-chip" style="color:var(--text3)">
                 <span class="chip-val" style="color:var(--text2)">${absent}</span>
                 classes missed so far
               </div>
             </div>`
          : `<div class="att-calc-row">
               <div class="att-calc-chip att-danger">
                 <span class="chip-val">${needAttend}</span>more classes to attend
               </div>
               <div class="att-calc-chip att-warn">
                 <span class="chip-val" style="color:var(--amber)">${newPct}%</span>
                 attendance after attending ${needAttend} more
               </div>
               <div class="att-calc-chip" style="color:var(--text2)">
                 <span class="chip-val" style="color:var(--red)">${absent}</span>
                 classes missed
               </div>
             </div>
             <div style="margin-top:8px;font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace;padding:6px 8px;background:rgba(255,60,60,0.06);border-radius:6px">
               You need ${newPresent}/${newTotal} attendance to reach 75%
             </div>`
      }
    </div>`;
  }).join('');
}

// ── FEATURE 4: GPA CALCULATOR ──
// ── GPA CALCULATOR ──
let gpaCoursesData = [];
let userEdits = {}; // keyed by course index; value = string entered

async function loadGpaCalc(){
  if(!currentUser) return;
  const sid = currentUser.user_type === 'student' ? currentUser.user_id : null;
  if(!sid){
    document.getElementById('gpa-calc-courses').innerHTML = '<div class="empty">Only available for student login.</div>';
    return;
  }
  gpaCoursesData = await api('/students/' + sid + '/courses') || [];
  userEdits = {};
  if(!gpaCoursesData.length){
    document.getElementById('gpa-calc-courses').innerHTML = '<div class="empty">No enrolled courses.</div>';
    return;
  }

  const el = document.getElementById('gpa-calc-courses');
  el.innerHTML =
    `<div style="display:flex;padding:6px 0;border-bottom:1px solid var(--glass-border);margin-bottom:4px;font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace">
      <span style="flex:1">Course</span>
      <span style="width:50px;text-align:center">Cr</span>
      <span style="width:80px;text-align:center">Grade/100</span>
      <span style="width:36px;text-align:center"></span>
    </div>`
    + gpaCoursesData.map((c, i) => {
        const hasDBGrade = c.grade !== null && c.grade !== undefined && c.grade !== '';
        const dbVal = hasDBGrade ? parseFloat(c.grade) : null;
        const letter = (hasDBGrade && !isNaN(dbVal)) ? getGradeAndPoint(dbVal).grade : '';
        return `
        <div class="gpa-row" id="gpa-row-${i}">
          <div class="gpa-course-name">${c.course_code} — ${c.course_name}</div>
          <div class="gpa-credits">${c.credits}</div>
          <input class="gpa-input" type="number" min="0" max="100" step="0.5"
            value="${hasDBGrade ? dbVal : ''}" placeholder="—"
            oninput="onGpaInput(${i}, this)" id="gpa-g-${i}"
            ${hasDBGrade ? 'style="border-color:rgba(59,108,183,0.25)"' : ''}>
          <span id="gpa-lbl-${i}" style="width:36px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--accent-mid);font-weight:700">${letter}</span>
        </div>`;
      }).join('');

  // populate reverse course select
  const sel = document.getElementById('reverse-course');
  sel.innerHTML = '<option value="">Select course...</option>';
  gpaCoursesData.forEach((c, i) => {
    sel.innerHTML += `<option value="${i}">${c.course_code} — ${c.course_name}</option>`;
  });

  calcGpa();
}

function onGpaInput(i, inp){
  const c = gpaCoursesData[i];
  const val = inp.value;
  const dbRaw = (c.grade !== null && c.grade !== undefined && c.grade !== '') ? String(parseFloat(c.grade)) : '';

  // Track edits: if value differs from original DB value, record it
  if(val !== dbRaw && val !== ''){
    userEdits[i] = val;
  } else {
    delete userEdits[i];
  }

  // Update live letter label
  const lbl = document.getElementById('gpa-lbl-' + i);
  if(lbl){
    const score = parseFloat(val);
    lbl.textContent = (!isNaN(score) && val !== '') ? getGradeAndPoint(score).grade : '';
  }

  calcGpa();
}

function calcGpa(){
  let totalW = 0, totalC = 0;
  gpaCoursesData.forEach((c, i) => {
    const g = parseFloat(document.getElementById('gpa-g-' + i)?.value);
    if(!isNaN(g) && g >= 0 && document.getElementById('gpa-g-' + i)?.value !== ''){
      const {gp} = getGradeAndPoint(g);
      totalW += gp * parseInt(c.credits);
      totalC += parseInt(c.credits);
    }
  });
  const cgpa = totalC > 0 ? (totalW / totalC) : 0;
  document.getElementById('gpa-predicted').textContent = totalC > 0 ? cgpa.toFixed(2) : '—';
  calcReverse();
}

// ── GRADE & GRADE POINT HELPER (SNU grading scale) ──
function getGradeAndPoint(marks){
  if(marks >= 90) return {grade:'A',   gp:10};
  if(marks >= 85) return {grade:'A*',  gp:9.5};
  if(marks >= 80) return {grade:'A-',  gp:9};
  if(marks >= 75) return {grade:'A-*', gp:8.5};
  if(marks >= 70) return {grade:'B',   gp:8};
  if(marks >= 65) return {grade:'B*',  gp:7.5};
  if(marks >= 60) return {grade:'B-',  gp:7};
  if(marks >= 55) return {grade:'B-*', gp:6.5};
  if(marks >= 50) return {grade:'C',   gp:6};
  if(marks >= 45) return {grade:'C*',  gp:5.5};
  if(marks >= 40) return {grade:'C-',  gp:5};
  if(marks >= 35) return {grade:'E',   gp:2};
  return               {grade:'F',   gp:0};
}

// Given a required GP (may be fractional), return the minimum marks needed to
// reach a band whose GP satisfies >= gpRequired, plus the grade & actual GP awarded.
function _gpToMinMarks(gpRequired){
  const bands = [
    [90,'A',10],[85,'A*',9.5],[80,'A-',9],[75,'A-*',8.5],
    [70,'B',8],[65,'B*',7.5],[60,'B-',7],[55,'B-*',6.5],
    [50,'C',6],[45,'C*',5.5],[40,'C-',5],[35,'E',2],[0,'F',0]
  ];
  // Walk from highest band down; return first band whose GP >= gpRequired
  for(const [minMarks, grade, gp] of bands){
    if(gp >= gpRequired) return {minMarks, grade, gp};
  }
  return {minMarks:0, grade:'F', gp:0};
}

// ── SHARED: compute needed marks for one course ──
// knownGrades: { courseIndex: marksValue } for courses with known marks.
// Ungraded other courses are excluded — we cannot assume their GP.
function _computeNeeded(targetIdx, knownGrades){
  let otherWeightedSum = 0; // sum of gp*credits for other known courses
  let knownCredits = 0;

  gpaCoursesData.forEach((oc, i) => {
    if(i === targetIdx) return;
    if(knownGrades.hasOwnProperty(i)){
      const marks = parseFloat(knownGrades[i]);
      if(!isNaN(marks)){
        const {gp} = getGradeAndPoint(marks);
        knownCredits += parseInt(oc.credits);
        otherWeightedSum += gp * parseInt(oc.credits);
      }
    }
  });

  const selCredits = parseInt(gpaCoursesData[targetIdx].credits);
  const totalCredits = knownCredits + selCredits;
  const target = parseFloat(document.getElementById('target-cgpa')?.value);
  if(isNaN(target)) return null;

  // Solve: (otherWeightedSum + gpNeeded*selCredits) / totalCredits = target
  const gpNeeded = (target * totalCredits - otherWeightedSum) / selCredits;

  // Translate the required GP into minimum marks (ceiling to next grade band)
  const {minMarks, grade, gp} = _gpToMinMarks(gpNeeded);

  // Max achievable CGPA (score 100 = GP 10)
  const maxPossibleCGPA = (otherWeightedSum + 10 * selCredits) / totalCredits;

  return {gpNeeded, minMarks, grade, gp, totalCredits, otherWeightedSum, selCredits, maxPossibleCGPA};
}

// ── RENDER a single-course reverse card ──
// Signature changed: takes the full result object 'r' from _computeNeeded
function _reverseCard(c, idx, r, note){
  const {gpNeeded, minMarks, grade, gp, maxPossibleCGPA} = r;

  if(gpNeeded > 10){
    return `<div style="background:rgba(255,95,95,0.07);border:1px solid rgba(255,95,95,0.2);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px">${c.course_code} — ${c.course_name}</div>
      <div style="color:var(--red);font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6">
        Not achievable alone. Max CGPA scoring A (100 marks) here: <strong>${maxPossibleCGPA.toFixed(2)}</strong>
      </div>
      ${note ? `<div style="font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace;margin-top:6px">${note}</div>` : ''}
    </div>`;
  }
  if(gpNeeded <= 0){
    return `<div style="background:rgba(26,122,74,0.06);border:1px solid rgba(26,122,74,0.2);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px">${c.course_code} — ${c.course_name}</div>
      <div style="color:var(--green);font-family:'IBM Plex Mono',monospace;font-size:11px">✓ Already achievable — even scoring 0 here meets your target CGPA.</div>
      ${note ? `<div style="font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace;margin-top:6px">${note}</div>` : ''}
    </div>`;
  }
  return `<div style="background:rgba(107,110,187,0.07);border:1px solid rgba(107,110,187,0.2);border-radius:10px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:14px">
    <div style="flex:1;min-width:0">
      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px">${c.course_code} — ${c.course_name}</div>
      <div style="font-size:11px;color:var(--text3);font-family:'IBM Plex Mono',monospace;line-height:1.8">
        Min marks needed: <span style="color:#6B6EBB;font-weight:700">${minMarks}</span> / 100<br>
        Grade: <span style="color:#6B6EBB;font-weight:700">${grade}</span> &nbsp;·&nbsp;
        GP awarded: <span style="color:#6B6EBB;font-weight:700">${gp}</span> &nbsp;·&nbsp;
        <span style="color:var(--text3)">GP required: ${gpNeeded.toFixed(2)}</span>
      </div>
      ${note ? `<div style="font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace;margin-top:4px">${note}</div>` : ''}
    </div>
    <div style="text-align:center;flex-shrink:0;min-width:70px">
      <div style="font-size:32px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:#6B6EBB;line-height:1">${minMarks}</div>
      <div style="font-size:10px;color:#6B6EBB;font-family:'IBM Plex Mono',monospace">${grade} (${gp})</div>
    </div>
  </div>`;
}

function calcReverse(){
  const rawVal = document.getElementById('target-cgpa')?.value;
  const target = parseFloat(rawVal);
  const idx = document.getElementById('reverse-course')?.value;
  const modeAEl = document.getElementById('reverse-mode-a');
  const modeBEl = document.getElementById('reverse-mode-b');
  if(!modeAEl || !modeBEl) return;

  // Clear when empty
  if(rawVal === '' || rawVal === null || rawVal === undefined || isNaN(target) || idx === '' || idx === null || idx === undefined){
    modeAEl.innerHTML = ''; modeBEl.innerHTML = ''; return;
  }
  if(target < 0 || target > 10){
    modeAEl.innerHTML = '<div style="color:var(--red);font-family:\'IBM Plex Mono\',monospace;font-size:12px">Target CGPA must be between 0 and 10.</div>';
    modeBEl.innerHTML = ''; return;
  }

  const warningBanner = target >= 9.5 && target <= 10
    ? `<div style="background:rgba(255,179,71,0.08);border:1px solid rgba(255,179,71,0.3);border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:var(--amber);font-family:'IBM Plex Mono',monospace">⚠ CGPA ${target} is near the maximum of 10 — very few students achieve this.</div>`
    : '';

  const c = gpaCoursesData[parseInt(idx)];
  if(!c){ modeAEl.innerHTML = ''; modeBEl.innerHTML = ''; return; }

  const hasEdits = Object.keys(userEdits).length > 0;

  // MODE A — DB grades as fixed, missing = 0
  const dbKnown = {};
  gpaCoursesData.forEach((oc, i) => {
    if(oc.grade !== null && oc.grade !== undefined && oc.grade !== '') dbKnown[i] = parseFloat(oc.grade);
  });
  const rA = _computeNeeded(parseInt(idx), dbKnown);
  if(!rA){ modeAEl.innerHTML = ''; return; }
  modeAEl.innerHTML = warningBanner
    + `<div style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;font-family:'IBM Plex Mono',monospace;margin-bottom:8px">Mode A — Based on recorded marks</div>`
    + _reverseCard(c, parseInt(idx), rA, 'Based on your current recorded marks.');

  // MODE B — user-entered inputs as fixed, missing = 0
  if(hasEdits){
    const inputKnown = {};
    gpaCoursesData.forEach((oc, i) => {
      const inputEl = document.getElementById('gpa-g-' + i);
      const v = inputEl ? inputEl.value : '';
      if(v !== '' && !isNaN(parseFloat(v))) inputKnown[i] = parseFloat(v);
    });
    const rB = _computeNeeded(parseInt(idx), inputKnown);
    if(rB){
      modeBEl.innerHTML =
        `<div style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;font-family:'IBM Plex Mono',monospace;margin-bottom:8px;margin-top:4px">Mode B — Based on your expected marks</div>`
        + _reverseCard(c, parseInt(idx), rB, 'Based on your expected marks.');
    }
  } else {
    modeBEl.innerHTML = '';
  }
}

// ── Show ALL missing-grade courses in both modes ──
function calcReverseAll(){
  const rawVal = document.getElementById('target-cgpa')?.value;
  const target = parseFloat(rawVal);
  const modeAEl = document.getElementById('reverse-mode-a');
  const modeBEl = document.getElementById('reverse-mode-b');
  if(!modeAEl || !modeBEl) return;

  if(rawVal === '' || isNaN(target)){
    modeAEl.innerHTML = '<div style="color:var(--text3);font-family:\'IBM Plex Mono\',monospace;font-size:12px">Enter a target CGPA first.</div>';
    modeBEl.innerHTML = ''; return;
  }
  if(target < 0 || target > 10){
    modeAEl.innerHTML = '<div style="color:var(--red);font-family:\'IBM Plex Mono\',monospace;font-size:12px">Target CGPA must be between 0 and 10.</div>';
    modeBEl.innerHTML = ''; return;
  }

  const warningBanner = target >= 9.5 && target <= 10
    ? `<div style="background:rgba(255,179,71,0.08);border:1px solid rgba(255,179,71,0.3);border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:var(--amber);font-family:'IBM Plex Mono',monospace">⚠ CGPA ${target} is near the maximum of 10 — very few students achieve this.</div>`
    : '';

  // Build DB-known map (fixed grades)
  const dbKnown = {};
  gpaCoursesData.forEach((oc, i) => {
    if(oc.grade !== null && oc.grade !== undefined && oc.grade !== '') dbKnown[i] = parseFloat(oc.grade);
  });

  // Missing = courses with no DB grade
  const missingIdxs = gpaCoursesData.map((c, i) => i).filter(i => !dbKnown.hasOwnProperty(i));

  if(!missingIdxs.length){
    modeAEl.innerHTML = `<div style="color:var(--text2);font-family:'IBM Plex Mono',monospace;font-size:12px">All courses already have recorded grades — no missing courses to calculate.</div>`;
    modeBEl.innerHTML = ''; return;
  }

  // MODE A
  let htmlA = warningBanner + `<div style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;font-family:'IBM Plex Mono',monospace;margin-bottom:8px">Mode A — Based on recorded marks</div>`;
  missingIdxs.forEach(i => {
    const r = _computeNeeded(i, dbKnown);
    if(r) htmlA += _reverseCard(gpaCoursesData[i], i, r, 'Based on your current recorded marks.');
  });
  modeAEl.innerHTML = htmlA;

  // MODE B — only if user has edits
  const hasEdits = Object.keys(userEdits).length > 0;
  if(hasEdits){
    const inputKnown = {};
    gpaCoursesData.forEach((oc, i) => {
      const inputEl = document.getElementById('gpa-g-' + i);
      const v = inputEl ? inputEl.value : '';
      if(v !== '' && !isNaN(parseFloat(v))) inputKnown[i] = parseFloat(v);
    });
    let htmlB = `<div style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;font-family:'IBM Plex Mono',monospace;margin-bottom:8px;margin-top:4px">Mode B — Based on your expected marks</div>`;
    missingIdxs.forEach(i => {
      const r = _computeNeeded(i, inputKnown);
      if(r) htmlB += _reverseCard(gpaCoursesData[i], i, r, 'Based on your expected marks.');
    });
    modeBEl.innerHTML = htmlB;
  } else {
    modeBEl.innerHTML = '';
  }
}

// ── FAQ TOGGLE ──
function toggleFaq(el){el.classList.toggle('open');}

// ── DASHBOARD ──
let deptChart=null,corrChart=null;
async function loadDashboard(){
  const s=await api('/analytics/dashboard');if(!s)return;
  document.getElementById('s-students').textContent=s.total_students;
  document.getElementById('s-courses').textContent=s.active_courses;
  document.getElementById('s-alerts').textContent=s.unread_alerts;
  document.getElementById('s-probation').textContent=s.on_probation;
  document.getElementById('s-enrollments').textContent=s.active_enrollments;
  document.getElementById('s-waitlist').textContent=s.on_waitlist;
  document.getElementById('s-certs').textContent=s.certificates_issued;
  document.getElementById('s-cgpa').textContent=parseFloat(s.avg_cgpa||0).toFixed(2);
  const ab=document.getElementById('alert-badge');if(ab)ab.textContent=s.unread_alerts;

  Chart.defaults.color='#8892a4';Chart.defaults.borderColor='#F0F3F7';
  const dept=await api('/analytics/dept-performance');
  if(dept&&dept.length){if(deptChart)deptChart.destroy();deptChart=new Chart(document.getElementById('chart-dept'),{type:'bar',data:{labels:dept.map(d=>d.dept_name.replace(' Engineering','').replace(' Science','')),datasets:[{label:'Avg CGPA',data:dept.map(d=>parseFloat(d.avg_cgpa||0)),backgroundColor:'rgba(59,108,183,0.65)',borderRadius:5},{label:'Students',data:dept.map(d=>d.students),backgroundColor:'rgba(107,110,187,0.45)',borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:10},color:'#8496AE'}}},scales:{x:{ticks:{font:{size:9}}},y:{beginAtZero:true,ticks:{font:{size:10}}}}}});}
  const corr=await api('/analytics/attendance-grade-correlation');
  if(corr&&corr.length){if(corrChart)corrChart.destroy();corrChart=new Chart(document.getElementById('chart-corr'),{type:'bar',data:{labels:corr.map(c=>c.attendance_bucket),datasets:[{label:'Avg grade',data:corr.map(c=>parseFloat(c.avg_grade||0)),backgroundColor:['rgba(255,95,95,0.6)','rgba(255,179,71,0.6)','rgba(59,108,183,0.6)'],borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100,ticks:{font:{size:10}}}}}});}
  const top=await api('/analytics/top-students');
  if(top){document.querySelector('#top-students-tbl tbody').innerHTML=top.map((s,i)=>`<tr><td class="mono" style="color:var(--text3)">${i+1}</td><td><strong>${s.full_name}</strong></td><td style="color:var(--text2)">${s.dept_name}</td><td class="mono" style="color:var(--accent-mid);font-weight:700">${parseFloat(s.cgpa).toFixed(2)}</td><td class="mono" style="color:var(--text3)">#${s.dept_rank}</td><td>${scholarBadge(s.scholarship)}</td></tr>`).join('');}
  updateClock();
}

// ── STUDENTS ──
let studentsData=[];
async function loadStudents(){studentsData=await api('/students')||[];renderStudents(studentsData);}
function renderStudents(data){
  const tb=document.querySelector('#students-tbl tbody');
  if(!data.length){tb.innerHTML='<tr><td colspan="9" class="empty">No students found</td></tr>';return;}
  tb.innerHTML=data.map(s=>`<tr><td class="mono" style="color:var(--text3)">${s.student_id}</td><td><strong>${s.full_name}</strong></td><td style="color:var(--text2);font-size:12px">${s.email}</td><td>${s.dept_name||'—'}</td><td style="color:var(--text2)">${s.program_name||'—'}</td><td class="mono" style="color:var(--accent-mid);font-weight:700">${parseFloat(s.cgpa||0).toFixed(2)}</td><td class="mono" style="color:var(--text3)">${s.batch_year||'—'}</td><td>${s.academic_probation?badge('b-red','Yes'):badge('b-teal','No')}</td><td><button class="btn btn-ghost btn-sm" onclick="viewStudentDetail(${s.student_id})">View</button></td></tr>`).join('');
}
function filterStudents(){
  const q=document.getElementById('student-search').value.toLowerCase();
  const p=document.getElementById('filter-probation').value;
  renderStudents(studentsData.filter(s=>{const mt=(s.full_name||'').toLowerCase().includes(q)||(s.email||'').toLowerCase().includes(q);const mp=p===''||String(s.academic_probation)===p;return mt&&mp;}));
}
async function viewStudentDetail(sid){
  const s=await api('/students/'+sid);if(!s||!s.student_id)return;
  const courses=await api('/students/'+sid+'/courses')||[];
  document.getElementById('modal-student-name').textContent=s.full_name;
  document.getElementById('modal-student-info').innerHTML=`<div class="info-row"><span class="info-label">Student ID</span><span class="info-val mono">${s.student_id}</span></div><div class="info-row"><span class="info-label">Email</span><span class="info-val" style="font-size:12px">${s.email}</span></div><div class="info-row"><span class="info-label">Department</span><span class="info-val">${s.dept_name||'—'}</span></div><div class="info-row"><span class="info-label">Program</span><span class="info-val">${s.program_name||'—'}</span></div><div class="info-row"><span class="info-label">Computed CGPA</span><span class="info-val mono" style="color:var(--green)">${parseFloat(s.computed_cgpa||0).toFixed(2)}</span></div><div class="info-row"><span class="info-label">Scholarship</span><span class="info-val">${scholarBadge(s.scholarship||'None')}</span></div><div class="info-row"><span class="info-label">Batch</span><span class="info-val mono">${s.batch_year||'—'}</span></div><div class="info-row"><span class="info-label">Probation</span><span class="info-val">${s.academic_probation?badge('b-red','Yes'):badge('b-teal','No')}</span></div>`;
  document.getElementById('modal-student-courses').innerHTML=courses.length?courses.map(c=>`<div style="padding:10px 0;border-bottom:1px solid #F0F3F7"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong style="font-size:13px">${c.course_code} — ${c.course_name}</strong>${badge(c.status==='active'?'b-teal':c.status==='dropped'?'b-red':'b-violet',c.status)}</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:7px"><div style="font-size:10px;color:var(--text3)">Grade<br><span class="mono" style="font-size:13px;color:var(--text)">${c.grade ? `${c.grade} (${c.letter_grade})` : '—'}</span></div><div style="font-size:10px;color:var(--text3)">Completion<br><span class="mono" style="font-size:13px;color:var(--text)">${c.completion_pct||0}%</span></div><div style="font-size:10px;color:var(--text3)">Attendance<br><span class="mono" style="font-size:13px;color:${parseFloat(c.attendance||0)>=75?'var(--accent-mid)':'var(--red)'}">${parseFloat(c.attendance||0).toFixed(1)}%</span></div></div><div class="prog-bar"><div class="prog-bar-fill" style="width:${c.completion_pct||0}%"></div></div></div>`).join(''):'<div class="empty">No courses enrolled.</div>';
  openModal('modal-student');
}

// ── COURSES ──
async function loadCourses(){
  const data=await api('/courses')||[];
  const tb=document.querySelector('#courses-tbl tbody');
  if(!data.length){tb.innerHTML='<tr><td colspan="7" class="empty">No courses</td></tr>';return;}
  tb.innerHTML=data.map(c=>`
<tr>
<td>${badge('b-violet',c.course_code)}</td>
<td><strong>${c.course_name}</strong></td>
<td class="mono">${c.credits}</td>
<td class="mono">${c.semester}</td>
<td style="color:var(--text2)">${c.instructor||'—'}</td>
<td class="mono">${c.enrolled_count||0}/${c.max_seats||'?'}</td>
<td>
  <div style="display:flex;align-items:center;gap:8px">
    <div class="prog-bar" style="width:60px">
      <div class="prog-bar-fill" style="width:${Math.min(c.fill_pct||0,100)}%"></div>
    </div>
    <span class="mono" style="font-size:11px;color:var(--text3)">${c.fill_pct||0}%</span>
  </div>
</td>
<td>
  <button class="btn btn-ghost btn-sm" onclick="openCourseView(${c.course_id})">
    View
  </button>
</td>
</tr>
`).join('');
}

async function openCourseView(courseId) {
  // switch page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-course-detail').classList.add('active');

  const res = await fetch(API + `/courses/${courseId}/students`);
  const data = await res.json();

  const tbody = document.getElementById('course-detail-body');
  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="4">No students found</td></tr>`;
    return;
  }

  data.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.full_name}</td>
      <td>${s.status}</td>
      <td>${s.grade ?? '-'}</td>
      <td>${s.attendance ?? 0}%</td>
    `;
    tbody.appendChild(tr);
  });
}

function goBackToCourses() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-courses').classList.add('active');
}

// ── ENROLLMENT ──
async function loadEnrollmentSelects(){await loadStudentSelects('enroll-student','drop-student');await loadCourseSelects('enroll-course','drop-course');}
async function enrollStudent(){
  const sid=document.getElementById('enroll-student').value,cid=document.getElementById('enroll-course').value;
  if(!sid||!cid){toast('Select both student and course','error');return;}
  const res=await api('/enroll',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({student_id:+sid,course_id:+cid})});
  if(!res)return;
  const color=res.status==='enrolled'?'var(--accent-mid)':res.status==='waitlisted'?'var(--amber)':'var(--red)';
  document.getElementById('enroll-result').innerHTML=`<span style="color:${color}">${res.message||res.error}</span>`;
  toast(res.message||res.error,res.status==='enrolled'?'success':'info');

  // reset form + reload dropdowns
  document.getElementById('enroll-student').value = "";
  document.getElementById('enroll-course').value = "";
  allCourses=[];loadCourseHealth();
  loadEnrollmentSelects();
}
async function dropCourse(){
  const sid=document.getElementById('drop-student').value,cid=document.getElementById('drop-course').value;
  if(!sid||!cid){toast('Select both student and course','error');return;}
  const res=await api(`/enrollment/${sid}/${cid}/drop`,{method:'PUT'});
  if(!res)return;
  document.getElementById('drop-result').innerHTML=`<span style="color:var(--green)">${res.message}</span>`;
  toast(res.message,'success');
  
  document.getElementById('drop-student').value = "";
  document.getElementById('drop-course').value = "";
  
  allCourses=[];loadCourseHealth();
}
async function loadCourseHealth(){
  const data=await api('/analytics/course-health')||[];
  const tb=document.querySelector('#health-tbl tbody');
  tb.innerHTML=data.length?data.map(c=>`<tr><td>${badge('b-violet',c.course_code)}</td><td>${c.course_name}</td><td class="mono">${c.max_seats||'?'}</td><td class="mono">${c.enrolled_count||0}</td><td class="mono" style="color:${(c.fill_pct||0)>80?'var(--red)':'var(--accent-mid)'}">${c.fill_pct||0}%</td><td class="mono">${c.dropouts||0}</td><td class="mono">${c.avg_grade||'—'}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">No data</td></tr>';
}

// ── ATTENDANCE ──
async function loadAttendanceSelects(){await loadStudentSelects('att-student','view-att-student');await loadCourseSelects('att-course','view-att-course');document.getElementById('att-date').value=new Date().toISOString().slice(0,10);}
async function markAttendance(){
  const data={student_id:+document.getElementById('att-student').value,course_id:+document.getElementById('att-course').value,date:document.getElementById('att-date').value,status:document.getElementById('att-status').value};
  if(!data.student_id||!data.course_id||!data.date){toast('Fill all fields','error');return;}
  const res=await api('/attendance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(res)toast('Attendance marked. Trigger fires if below 75%.','success');

  //reset form
  document.getElementById('att-student').value = "";
  document.getElementById('att-course').value = "";
  document.getElementById('att-status').value = "present";

   // reset date to today again
  document.getElementById('att-date').value = new Date().toISOString().slice(0,10);

  // reload dropdowns (clean UX)
  loadAttendanceSelects();
}
async function viewAttendance(){
  const sid=document.getElementById('view-att-student').value,cid=document.getElementById('view-att-course').value;
  if(!sid||!cid){toast('Select student and course','error');return;}
  const data=await api(`/attendance/${sid}/${cid}`);if(!data)return;
  const pct=parseFloat(data.attendance_pct||0);
  const color=pct>=75?'var(--accent-mid)':pct>=50?'var(--amber)':'var(--red)';
  document.getElementById('att-pct-display').innerHTML=`<span style="color:${color}">${pct.toFixed(1)}%</span>`;
  document.getElementById('att-records').innerHTML=(data.records||[]).slice(0,10).map(r=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F0F3F7;font-size:12px"><span class="mono" style="color:var(--text3)">${r.date}</span>${badge(r.status==='present'?'b-teal':'b-red',r.status)}</div>`).join('');
}

// ── GRADES ──
async function loadGradeSelects(){await loadStudentSelects('grade-student','hist-student');await loadCourseSelects('grade-course','hist-course');}
async function updateGrade(){
  const data={student_id:+document.getElementById('grade-student').value,course_id:+document.getElementById('grade-course').value,grade:parseFloat(document.getElementById('grade-val').value),completion_pct:parseInt(document.getElementById('completion-val').value)};
  if(!data.student_id||!data.course_id||isNaN(data.grade)){toast('Fill all grade fields','error');return;}
  const res=await api('/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(res){document.getElementById('grade-result').innerHTML=`<span style="color:var(--green)">${res.message}</span>`;toast('Grade updated. Triggers fired.','success');loadAtRisk();}
}
async function viewGradeHistory(){
  const sid=document.getElementById('hist-student').value,cid=document.getElementById('hist-course').value;
  if(!sid||!cid){toast('Select student and course','error');return;}
  const data=await api(`/progress/${sid}/${cid}/history`)||[];
  document.getElementById('grade-history').innerHTML=data.length?data.map(h=>`<div style="padding:8px 0;border-bottom:1px solid #F0F3F7;font-size:12px"><span class="mono" style="color:var(--text3)">${h.old_grade||'—'}</span><span style="color:var(--text3);margin:0 8px">&rarr;</span><span class="mono" style="color:var(--green)">${h.new_grade}</span><span style="color:var(--text3);margin-left:10px;font-size:10px">${(h.changed_at||'').slice(0,16)}</span><div style="color:var(--text3);margin-top:2px;font-size:10px">${h.changed_by||''} ${h.reason?'— '+h.reason:''}</div></div>`).join(''):'<div class="empty">No history found.</div>';
}
async function loadAtRisk(){
  const data=await api('/analytics/at-risk')||[];
  const tb=document.querySelector('#risk-tbl tbody');
  tb.innerHTML=data.length?data.map(r=>`<tr><td><strong>${r.full_name}</strong></td><td>${badge('b-violet',r.course_code)}</td><td class="mono" style="color:${parseFloat(r.grade||100)<40?'var(--red)':'var(--text)'}">${r.grade||'—'}</td><td class="mono" style="color:${parseFloat(r.att_pct||100)<75?'var(--amber)':'var(--text)'}">${parseFloat(r.att_pct||0).toFixed(1)}%</td><td>${badge(r.risk_level==='CRITICAL'?'b-red':'b-amber',r.risk_level)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">No at-risk students.</td></tr>';
}

// ── PAYMENTS ──
let _payStudentId = null;

async function loadPaymentSelects(){
  if(currentUser && currentUser.user_type==='student'){
    // Student sees only their own — no selector needed
    document.getElementById('admin-student-selector').style.display='none';
    document.getElementById('student-fee-summary').style.display='block';
    document.getElementById('admin-pay-tabs').style.display='none';
    _payStudentId = currentUser.user_id;
    await loadStudentFeeSummary(_payStudentId);
    await loadPayments();
    // "Pay Now" button in topbar
    document.getElementById('pay-actions-bar').innerHTML=
      `<button class="btn btn-primary" onclick="openPayModal(${_payStudentId})">&#x2192; Pay now</button>`;
  } else {
    // Admin / faculty
    document.getElementById('admin-student-selector').style.display='block';
    document.getElementById('student-fee-summary').style.display='none';
    document.getElementById('admin-pay-tabs').style.display='block';
    await loadStudentSelects('pay-student');
    await loadDeptPayTabs();
    // "Fee structure" button
    document.getElementById('pay-actions-bar').innerHTML=
      `<button class="btn btn-ghost btn-sm" onclick="openFeeStructModal()">Fee structure</button>`;
  }
}

async function loadStudentFeeSummary(sid){
  const data = await api('/student-fee-summary/'+sid);
  if(!data || data.error) return;

  const fees = data.fee_structure;
  const remaining = data.remaining;
  const paidPct = data.annual_fee > 0 ? Math.round((data.total_paid/data.annual_fee)*100) : 0;

  document.getElementById('fee-dept-label').textContent = data.dept_name || '—';

  // Summary card
  document.getElementById('fee-summary-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div><div style="font-size:10px;color:var(--text3)">Annual fee</div><div style="font-size:22px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:var(--text)">&#8377;${data.annual_fee.toLocaleString()}</div></div>
      <div><div style="font-size:10px;color:var(--text3)">Total paid</div><div style="font-size:22px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:var(--green)">&#8377;${data.total_paid.toLocaleString()}</div></div>
    </div>
    <div style="font-size:10px;color:var(--text3);margin-bottom:6px;font-family:'IBM Plex Mono',monospace">Payment progress — ${paidPct}%</div>
    <div class="prog-bar" style="height:8px;margin-bottom:12px"><div class="prog-bar-fill" style="width:${paidPct}%"></div></div>
    ${remaining > 0
      ? `<div style="background:rgba(255,95,95,0.08);border:1px solid rgba(255,95,95,0.2);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center">
           <div><div style="font-size:10px;color:var(--text3)">Remaining balance</div><div style="font-size:20px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:var(--red)">&#8377;${remaining.toLocaleString()}</div></div>
           <button class="btn btn-primary btn-sm" onclick="openPayModal(${sid})">Pay now</button>
         </div>`
      : `<div style="background:rgba(59,108,183,0.06);border:1px solid rgba(59,108,183,0.2);border-radius:8px;padding:12px;text-align:center;color:var(--text2);font-family:'IBM Plex Mono',monospace;font-size:12px">&#x2713; All fees paid for this year</div>`
    }`;

  // Fee breakdown card
  const feeItems = [
    ['Tuition fee', fees.tuition],
    ['Lab & equipment', fees.lab],
    ['Library', fees.library],
    ['Sports & activities', fees.sports],
    ['Hostel', fees.hostel],
    ['Mess (food)', fees.mess],
    ['Laundry', fees.laundry],
    ['Examination', fees.exam],
    ['Development', fees.development],
  ];
  document.getElementById('fee-breakdown-body').innerHTML =
    feeItems.map(([label, amt]) => `
      <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F0F3F7;font-size:13px">
        <span style="color:var(--text2)">${label}</span>
        <span class="mono" style="color:var(--text)">&#8377;${amt.toLocaleString()}</span>
      </div>`).join('') +
    `<div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:600;border-top:1px solid var(--glass-border);margin-top:4px">
       <span style="color:var(--text)">Total annual fee</span>
       <span class="mono" style="color:var(--green);font-size:15px">&#8377;${fees.total.toLocaleString()}</span>
     </div>`;

  // Due alert bar
  if(remaining > 0){
    document.getElementById('due-alert-bar').style.display='block';
    document.getElementById('due-alert-bar').innerHTML =
      `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px">
         <div>
           <div style="font-size:12px;font-weight:600;color:var(--red)">&#x26A0; Outstanding balance</div>
           <div style="font-size:11px;color:var(--text2);margin-top:2px;font-family:'IBM Plex Mono',monospace">You have &#8377;${remaining.toLocaleString()} remaining to pay for ${data.dept_name}</div>
         </div>
         <button class="btn btn-primary btn-sm" onclick="openPayModal(${sid})">Pay now</button>
       </div>`;
  }
}

async function loadDeptPayTabs(){
  const depts = await api('/payments/dept-summary') || [];
  const btns = document.getElementById('dept-tab-btns');
  btns.innerHTML = ['All',...depts.map(d=>d.dept_name)].map((d,i)=>
    `<button class="btn ${i===0?'btn-primary':'btn-ghost'} btn-sm" onclick="showDeptTab('${d}',this)">${d}</button>`
  ).join('');
  showDeptPayContent('All', depts);
}

function showDeptTab(deptName, btn){
  document.querySelectorAll('#dept-tab-btns .btn').forEach(b=>{b.classList.remove('btn-primary');b.classList.add('btn-ghost');});
  btn.classList.add('btn-primary'); btn.classList.remove('btn-ghost');
  api('/payments/dept-summary').then(depts=>showDeptPayContent(deptName, depts||[]));
}

function showDeptPayContent(deptName, depts){
  const filtered = deptName==='All' ? depts : depts.filter(d=>d.dept_name===deptName);

  document.getElementById('dept-pay-content').innerHTML = `
    <div class="grid-3">
      ${filtered.map(d=>{
        const pct = d.total_billed>0 ? Math.round((d.total_paid/d.total_billed)*100) : 0;

        return `<div class="card">
          <div style="font-size:11px;font-weight:600;color:var(--green);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-family:'IBM Plex Mono',monospace">
            ${d.dept_name}
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">

            <!-- TOTAL STUDENTS -->
            <div>
              <div style="font-size:10px;color:var(--text3)">Students</div>
              <div style="font-size:18px;font-weight:700;font-family:'IBM Plex Mono',monospace">
                ${d.total_students}
              </div>
            </div>

            <!-- PENDING STUDENTS (FIXED) -->
            <div>
              <div style="font-size:10px;color:var(--text3)">Pending Students</div>
              <div style="font-size:18px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:var(--red)">
                ${d.pending_students || 0}
              </div>

              <button class="btn btn-ghost btn-sm"
                onclick="viewPendingList('${d.dept_name}')"
                style="margin-top:6px">
                View list
              </button>
            </div>

          </div>

          <!-- PROGRESS BAR -->
          <div class="prog-bar" style="margin-bottom:6px">
            <div class="prog-bar-fill" style="width:${pct}%"></div>
          </div>

          <!-- SUMMARY -->
          <div style="font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace">
            ${pct}% collected &nbsp;&middot;&nbsp;
            &#8377;${(parseFloat(d.total_paid)||0).toLocaleString()} of
            &#8377;${(parseFloat(d.total_billed)||0).toLocaleString()}
          </div>

        </div>`;
      }).join('')}
    </div>`;
}

async function loadPayments(){
  const selEl = document.getElementById('pay-student');
  const sid = selEl ? selEl.value : _payStudentId;
  if(!sid) return;
  const data = await api('/payments/'+sid) || [];
  const tb = document.querySelector('#payments-tbl tbody');
  tb.innerHTML = data.length
    ? data.map(p=>`<tr>
        <td>${p.course_name}</td>
        <td class="mono">&#8377;${parseFloat(p.total_amount).toLocaleString()}</td>
        <td class="mono" style="color:var(--green)">&#8377;${parseFloat(p.paid_amount).toLocaleString()}</td>
        <td class="mono" style="color:${p.balance>0?'var(--red)':'var(--accent-mid)'}">&#8377;${parseFloat(p.balance).toLocaleString()}</td>
        <td>${badge(p.status==='paid'?'b-teal':p.status==='partial'?'b-amber':'b-red',p.status)}</td>
        <td class="mono" style="color:var(--text3);font-size:11px">${p.payment_date||'—'}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="loadInstallments(${p.payment_id})">
            Installments
          </button>

          <button class="btn btn-ghost btn-sm" onclick="viewPendingStudents('Computer Science')">
            Pending
          </button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="7" class="empty">No payment records found.</td></tr>';
}

async function loadInstallments(pid){
  const data=await api('/payments/'+pid+'/installments')||[];
  document.getElementById('modal-installments-body').innerHTML=data.length
    ?`<table style="width:100%;border-collapse:collapse"><thead><tr><th>#</th><th>Due</th><th>Paid</th><th>Due date</th><th>Paid on</th><th>Status</th></tr></thead><tbody>
      ${data.map(i=>`<tr>
        <td class="mono" style="color:var(--text3)">${i.installment_no}</td>
        <td class="mono">&#8377;${parseFloat(i.amount_due).toLocaleString()}</td>
        <td class="mono" style="color:var(--green)">&#8377;${parseFloat(i.amount_paid||0).toLocaleString()}</td>
        <td class="mono" style="font-size:11px;color:var(--text3)">${i.due_date||'—'}</td>
        <td class="mono" style="font-size:11px;color:var(--text3)">${i.paid_on||'—'}</td>
        <td>${badge(i.status==='paid'?'b-teal':i.status==='overdue'?'b-red':'b-amber',i.status)}</td>
      </tr>`).join('')}</tbody></table>`
    :'<div class="empty">No installments found.</div>';
  openModal('modal-installments');
}

async function openPayModal(sid){
  _payStudentId = sid;
  const summary = await api('/student-fee-summary/'+sid);
  const remaining = summary ? summary.remaining : 0;
  const dept = summary ? summary.dept_name : '—';
  document.getElementById('pay-outstanding-info').innerHTML =
    `<div style="display:flex;justify-content:space-between;align-items:center">
       <div>
         <div style="color:var(--text3)">Department</div>
         <div style="color:var(--text);font-size:14px">${dept}</div>
       </div>
       <div style="text-align:right">
         <div style="color:var(--text3)">Outstanding</div>
         <div style="color:var(--red);font-size:18px;font-weight:700">&#8377;${remaining.toLocaleString()}</div>
       </div>
     </div>`;
  document.getElementById('pay-amount-input').value = '';
  document.getElementById('pay-modal-result').innerHTML = '';
  openModal('modal-pay');
}

function togglePayMethod(){
  const m = document.getElementById('pay-method').value;
  document.getElementById('pay-upi-section').style.display = m==='upi'?'block':'none';
  document.getElementById('pay-card-section').style.display = m==='card'?'block':'none';
  document.getElementById('pay-dd-section').style.display = m==='dd'?'block':'none';
}

function fmtCard(el){
  let v = el.value.replace(/\D/g,'').slice(0,16);
  el.value = v.match(/.{1,4}/g)?.join(' ') || v;
}

async function submitPayment(){
  const sid = _payStudentId;
  const amount = parseFloat(document.getElementById('pay-amount-input').value);
  const method = document.getElementById('pay-method').value;
  const resEl = document.getElementById('pay-modal-result');

  if(!sid){resEl.innerHTML='<span style="color:var(--red)">No student selected.</span>';return;}
  if(!amount||amount<=0){resEl.innerHTML='<span style="color:var(--red)">Enter a valid amount.</span>';return;}

  // Simulate processing
  resEl.innerHTML='<span style="color:var(--text3)">Processing...</span>';
  await new Promise(r=>setTimeout(r,900));

  const res = await api('/payments/make',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({student_id:sid, amount, payment_method:method})});

  if(!res||res.error){
    resEl.innerHTML=`<span style="color:var(--red)">${res?.error||'Payment failed.'}</span>`;
    return;
  }

  resEl.innerHTML=`<div style="background:rgba(59,108,183,0.08);border:1px solid rgba(59,108,183,0.2);border-radius:8px;padding:12px;text-align:center">
    <div style="color:var(--green);font-size:16px;font-weight:700;margin-bottom:4px">&#x2713; ${res.message}</div>
    <div style="color:var(--text3);font-size:10px;font-family:'IBM Plex Mono',monospace">Transaction ID: ${res.transaction_id}</div>
  </div>`;
  toast(res.message,'success');

  // Refresh summaries after 1.5s
  setTimeout(async()=>{
    closeModal('modal-pay');
    if(currentUser && currentUser.user_type==='student'){
      await loadStudentFeeSummary(sid);
    }
    await loadPayments();
    loadAlerts();
  },1500);
}

async function openFeeStructModal(){
  const data = await api('/fee-structure');
  if(!data){return;}
  const depts = ['Computer Science','Electronics Engineering','Mathematics','Mechanical Engineering'];
  const feeKeys = ['tuition','lab','library','sports','hostel','mess','laundry','exam','development'];
  const labels = {'tuition':'Tuition fee','lab':'Lab & equipment','library':'Library','sports':'Sports','hostel':'Hostel','mess':'Mess (food)','laundry':'Laundry','exam':'Examination','development':'Development'};
  
  let html = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">
    <thead><tr><th style="text-align:left;padding:8px 10px;font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace;border-bottom:1px solid var(--glass-border)">Fee component</th>
    ${depts.map(d=>`<th style="text-align:right;padding:8px 10px;font-size:10px;color:var(--text2);font-family:'IBM Plex Mono',monospace;border-bottom:1px solid var(--glass-border)">${d.replace(' Engineering','<br>Engg').replace(' Science','<br>Sci')}</th>`).join('')}
    </tr></thead><tbody>
    ${feeKeys.map(k=>`<tr>
      <td style="padding:9px 10px;font-size:13px;color:var(--text2);border-bottom:1px solid #F4F6F9">${labels[k]}</td>
      ${depts.map(d=>{
        const fee = data[d] || data['default'];
        return `<td style="padding:9px 10px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--text);border-bottom:1px solid #F4F6F9">&#8377;${(fee[k]||0).toLocaleString()}</td>`;
      }).join('')}
    </tr>`).join('')}
    <tr style="border-top:1px solid var(--glass-border)">
      <td style="padding:10px 10px;font-weight:600;font-size:13px;color:var(--text)">Total</td>
      ${depts.map(d=>{
        const fee = data[d] || data['default'];
        return `<td style="padding:10px 10px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:700;color:var(--green)">&#8377;${(fee.total||0).toLocaleString()}</td>`;
      }).join('')}
    </tr>
    </tbody></table></div>`;
  
  document.getElementById('modal-fee-struct-body').innerHTML = html;
  openModal('modal-fee-struct');
}

// ── REPORTS ──
async function loadReportSelects(){await loadStudentSelects('rec-student');await loadCourseSelects('report-course');}
async function loadScholarship(){
  const data=await api('/reports/scholarship')||[];
  const tb=document.querySelector('#scholar-tbl tbody');
  tb.innerHTML=data.length?data.map(s=>`<tr><td><strong>${s.full_name}</strong></td><td style="color:var(--text2)">${s.dept_name}</td><td class="mono" style="color:var(--green)">${parseFloat(s.cgpa).toFixed(2)}</td><td>${scholarBadge(s.tier)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">No eligible students.</td></tr>';
}
async function loadRecommendations(){
  const sid=document.getElementById('rec-student').value;
  if(!sid) return;

  const data=await api(`/reports/recommendations/${sid}`)||[];

  document.getElementById('rec-results').innerHTML =
    data.length
    ? data.map(c=>`
        <div style="padding:8px 0;border-bottom:1px solid #F0F3F7;display:flex;justify-content:space-between">
          <span style="font-size:13px">${c.course_name}</span>
          <span class="mono" style="font-size:11px;color:var(--text3)">
            ${c.credits ? c.credits + ' cr' : '-'}
          </span>
        </div>
      `).join('')
    : '<div class="empty">No recommendations.</div>';
}
async function loadSemReport(){
  const cid=document.getElementById('report-course').value;if(!cid){toast('Select a course','error');return;}
  const data=await api(`/reports/semester/${cid}`)||[];
  const tb=document.querySelector('#semreport-tbl tbody');
  tb.innerHTML=data.length?data.map(r=>`<tr><td>${r.full_name}</td><td class="mono" style="color:${parseFloat(r.grade||0)>=40?'var(--accent-mid)':'var(--red)'}">${r.grade||'Not graded'}</td><td class="mono">${r.completion_pct||'—'}</td></tr>`).join(''):'<tr><td colspan="3" class="empty">No data.</td></tr>';
}

// ── ALERTS ──
async function loadAlerts(){
  // Students see only their own alerts; admin/faculty see all
  let endpoint = '/alerts';
  let isStudent = false;
  if(currentUser && currentUser.user_type === 'student'){
    endpoint = '/alerts/student/' + currentUser.user_id;
    isStudent = true;
  }
  const data = await api(endpoint) || [];

  const unread = data.filter(a => !a.is_read).length;

  const ab = document.getElementById('alert-badge');
  if(ab){
    if(unread === 0){
      ab.style.display = "none";
    } else {
      ab.style.display = "flex";
      ab.textContent = unread > 99 ? "99+" : unread;
    }
  }

  const tb = document.querySelector('#alerts-tbl tbody');
  if(!tb) return;

  // For student view: hide the "Student" column (they know it's them)
  const thead = document.querySelector('#alerts-tbl thead tr');
  if(thead){
    const firstTh = thead.querySelector('th');
    if(firstTh) firstTh.style.display = isStudent ? 'none' : '';
  }

  tb.innerHTML = data.length
    ? data.map(a => `
      <tr style="${!a.is_read ? 'background:rgba(255,179,71,0.03)' : ''}">
        <td style="display:${isStudent?'none':''}"><strong>${a.full_name || '—'}</strong></td>
        <td style="color:var(--text2);font-size:12px">${a.course_name || '—'}</td>
        <td class="mono" style="font-size:11px">${a.alert_type}</td>
        <td>${badge(
          a.severity==='critical' ? 'b-red' :
          a.severity==='warning' ? 'b-amber' : 'b-violet',
          a.severity
        )}</td>
        <td style="font-size:12px;max-width:200px;color:var(--text2)">
          ${a.message}
        </td>
        <td class="mono" style="font-size:10px;color:var(--text3)">
          ${(a.created_at || '').slice(0,16) || '—'}
        </td>
        <td>${badge(a.is_read ? 'b-teal':'b-amber', a.is_read?'Read':'Unread')}</td>
        <td>
          ${!a.is_read
            ? `<button class="btn btn-ghost btn-sm" onclick="markRead(${a.alert_id})">Mark read</button>`
            : ''
          }
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="8" class="empty">${isStudent ? 'You have no alerts.' : 'No alerts.'}</td></tr>`;
}
async function markRead(id){await api(`/alerts/${id}/read`,{method:'PUT'});loadAlerts();toast('Alert marked as read.','success');}

function updateClock(){const el=document.getElementById('dash-time');if(el)el.textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}

async function updateAlertBadge(){
  const data = await api('/alerts') || [];
  const unread = data.filter(a => !a.is_read).length;

  const ab = document.getElementById('alert-badge');
  if(!ab) return;

  //  NEW ALERT DETECTION
  if(unread > lastAlertCount){
    toast("🔔 New alert received!");
  }

  lastAlertCount = unread;

  if(unread === 0){
    ab.style.display = "none";
  } else {
    ab.style.display = "flex";

    if(unread > 99) ab.textContent = "99+";
    else if(unread > 9) ab.textContent = "9+";
    else ab.textContent = unread;
  }
}

// ── PENDING STUDENTS MODAL ──
async function viewPendingList(dept){
  const modal = document.getElementById('pending-modal');
  const listEl = document.getElementById('pending-list');
  modal.style.display = 'flex';
  listEl.innerHTML = '<div style="color:var(--text3);font-family:\'IBM Plex Mono\',monospace;font-size:12px;padding:10px 0">Loading…</div>';

  const data = await api('/payments/pending/'+encodeURIComponent(dept)) || [];

  if(!data.length){
    listEl.innerHTML = '<div style="color:var(--text3);font-family:\'IBM Plex Mono\',monospace;font-size:12px;padding:10px 0">No pending students in this department.</div>';
    return;
  }

  listEl.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead>
      <tr>
        <th style="text-align:left;padding:6px 8px;font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace;border-bottom:1px solid #E8EDF4">ID</th>
        <th style="text-align:left;padding:6px 8px;font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace;border-bottom:1px solid #E8EDF4">Name</th>
        <th style="text-align:right;padding:6px 8px;font-size:10px;color:var(--text3);font-family:'IBM Plex Mono',monospace;border-bottom:1px solid #E8EDF4">Pending (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${data.map(s=>`<tr>
        <td style="padding:7px 8px;color:var(--text3);font-family:'IBM Plex Mono',monospace">${s.student_id}</td>
        <td style="padding:7px 8px;color:var(--text)">${s.name}</td>
        <td style="padding:7px 8px;text-align:right;color:var(--red);font-family:'IBM Plex Mono',monospace;font-weight:600">₹${parseFloat(s.pending).toLocaleString()}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function closePendingModal(){
  document.getElementById('pending-modal').style.display = 'none';
}

// ── INIT ──
window.onload=async()=>{
  // restore email
  const saved=localStorage.getItem('aces_email');
  if(saved){document.getElementById('login-email').value=saved;document.getElementById('remember-me').checked=true;}
  // check existing session
  const me=await api('/me');
  if(me&&me.logged_in){currentUser=me;startApp(me);}
  setInterval(updateClock,30000);
  setInterval(() => {
    const activePage = document.querySelector('.page.active');

    if(activePage && activePage.id === 'page-alerts'){
      loadAlerts(); // full table load
    } else {
      updateAlertBadge(); // only badge update
    }
  }, 5000);
};