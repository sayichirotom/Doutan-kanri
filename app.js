const sb = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const params = new URLSearchParams(location.search);
const token = params.get('t');
let member = null;
async function init(){
 if(!token){document.getElementById('who').textContent='専用QRからアクセスしてください';return;}
 const {data,error}=await sb.rpc('resolve_member_token',{p_token:token});
 if(error||!data?.length){document.getElementById('who').textContent='無効なQRです';return;}
 member=data[0]; document.getElementById('who').textContent=member.display_name;
 document.getElementById('status').textContent='現在：'+(member.current_state||'未登録');
}
async function setState(state){
 if(!member)return;
 const msg=document.getElementById('msg'); msg.textContent='登録中...';
 const {data,error}=await sb.rpc('record_status',{p_token:token,p_state:state});
 if(error){msg.textContent='登録できませんでした';return;}
 const ts=new Date(data).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
 document.getElementById('status').textContent='現在：'+state; msg.textContent=`${state} ${ts} 登録しました`;
 member.current_state=state;
}
function openLeaveMenu() {
  document.getElementById('leaveMenu').style.display = 'block';
  document.getElementById('timeLeaveMenu').style.display = 'none';
}
function selectLeave(type) {
  if (type === '時間休') {
    document.getElementById('timeLeaveMenu').style.display = 'block';
    createTimeOptions();
    return;
  }

  let minutes = 0;

  if (type === '1日') minutes = 465;
  if (type === '午前') minutes = 210;
  if (type === '午後') minutes = 255;

  saveLeave(type, null, null, minutes);
}
function createTimeOptions() {
  const start = document.getElementById('leaveStart');
  const end = document.getElementById('leaveEnd');

  start.innerHTML = '';
  end.innerHTML = '';

  for (let minutes = 510; minutes <= 1035; minutes += 15) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const time =
      String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0');

    const option1 = document.createElement('option');
    option1.value = time;
    option1.textContent = time;
    start.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = time;
    option2.textContent = time;
    end.appendChild(option2);
  }
}
function submitTimeLeave() {
  const start = document.getElementById('leaveStart').value;
  const end = document.getElementById('leaveEnd').value;

  const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const startMin = toMinutes(start);
  const endMin = toMinutes(end);

  if (endMin <= startMin) {
    alert('終了時刻は開始時刻より後を選んでください。');
    return;
  }

  let minutes = endMin - startMin;

  // 12:00～13:00を休暇時間から除外
  const lunchStart = 720;
  const lunchEnd = 780;
  const overlap =
    Math.max(0, Math.min(endMin, lunchEnd) - Math.max(startMin, lunchStart));

  minutes -= overlap;

  if (minutes <= 0) {
    alert('休憩時間だけを休暇として選択することはできません。');
    return;
  }

  saveLeave('時間休', start, end, minutes);
}
async function saveLeave(type, start, end, minutes) {
  if (!member) return;

  const msg = document.getElementById('msg');
  msg.textContent = '登録中...';

  const { data, error } = await sb.rpc('record_leave', {
    p_token: token,
    p_leave_type: type,
    p_leave_start: start,
    p_leave_end: end,
    p_leave_minutes: minutes
  });

  if (error) {
    msg.textContent = '休暇を登録できませんでした';
    return;
  }

  document.getElementById('status').textContent = '現在：休暇';
  member.current_state = '休暇';

  document.getElementById('leaveMenu').style.display = 'none';
  document.getElementById('timeLeaveMenu').style.display = 'none';

  msg.textContent = type + '休暇を登録しました';
}
document.querySelectorAll('button[data-state]').forEach(b=>b.addEventListener('click',()=>setState(b.dataset.state)));
init();
