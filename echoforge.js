// --- CONFIGURE THESE ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
// -------------------------

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authSection = document.getElementById('authSection');
const serversSection = document.getElementById('serversSection');
const chatSection = document.getElementById('chatSection');
const serversList = document.getElementById('serversList');
const chatConsole = document.getElementById('chatConsole');
let currentServerId = null;

// --- THEME ---
document.getElementById('themeToggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('light-theme');
});

// --- AUTH ---
document.getElementById('signupBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });
  if(error) alert(error.message);
  else alert('Signup successful! Check your email.');
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if(error) alert(error.message);
  else {
    authSection.classList.add('hidden');
    serversSection.classList.remove('hidden');
    chatSection.classList.remove('hidden');
    loadServers();
  }
});

// --- SERVERS ---
async function loadServers(){
  const { data, error } = await supabase.from('Servers').select('*');
  if(error) console.error(error);
  serversList.innerHTML = '';
  data.forEach(server => {
    const li = document.createElement('li');
    li.textContent = server.name;
    li.onclick = () => selectServer(server.id, server.name);
    serversList.appendChild(li);
  });
}

document.getElementById('createServerBtn').addEventListener('click', async () => {
  const name = document.getElementById('newServerName').value;
  const user = supabase.auth.getUser();
  await supabase.from('Servers').insert([{ name, owner_id: (await user).data.user.id }]);
  loadServers();
});

// --- CHAT ---
function addMessage(content){
  const div = document.createElement('div');
  div.textContent = content;
  chatConsole.appendChild(div);
  chatConsole.scrollTop = chatConsole.scrollHeight;
}

async function selectServer(serverId, serverName){
  currentServerId = serverId;
  document.getElementById('currentServerName').textContent = serverName;
  chatConsole.innerHTML = '';
  // load past messages
  const { data } = await supabase.from('Messages').select('*').eq('server_id', serverId).order('created_at', {ascending:true});
  data.forEach(msg => addMessage(`${msg.content}`));

  // subscribe realtime
  supabase.removeAllChannels();
  supabase.channel('messages')
    .on('postgres_changes', { event: '*', schema:'public', table:'Messages', filter: `server_id=eq.${serverId}`}, payload=>{
      addMessage(payload.new.content);
    }).subscribe();
}

document.getElementById('sendMessageBtn').addEventListener('click', async () => {
  const content = document.getElementById('messageInput').value;
  if(!currentServerId) return alert('Select a server first.');
  const user = await supabase.auth.getUser();
  await supabase.from('Messages').insert([{ server_id: currentServerId, user_id: user.data.user.id, content }]);
  document.getElementById('messageInput').value = '';
});
