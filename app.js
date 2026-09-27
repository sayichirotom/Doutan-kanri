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
document.querySelectorAll('button[data-state]').forEach(b=>b.addEventListener('click',()=>setState(b.dataset.state)));
init();
