/* ============================================================
   KANOU CAPITAL - Client Portal JS
   Supabase client, auth helpers, utility functions
   ============================================================ */

const SUPABASE_URL = 'https://zwyymyalysvjlujrgfcg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eXlteWFseXN2amx1anJnZmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTU2MTEsImV4cCI6MjA4OTkzMTYxMX0.yrVjQbGAs_wkZssYVplRLZxIqQexYAceGrb6heoWel4';

var _sbClient;

function initSupabase() {
  if (!window.supabase) {
    console.error('Supabase JS library not loaded');
    return null;
  }
  if (!_sbClient) {
    _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sbClient;
}

/* --- Auth Helpers --- */

async function getSession() {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.auth.getSession();
  if (error || !data.session) return null;
  return data.session;
}

async function getProfile(userId) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error) { console.error('Profile fetch error:', error); return null; }
  return data;
}

async function signIn(email, password) {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const sb = initSupabase();
  if (!sb) return;
  await sb.auth.signOut();
  window.location.href = '../index.html';
}

async function updatePassword(newPassword) {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

async function updateProfile(userId, updates) {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
  return data;
}

/* --- Auth Guard --- */

async function requireAuth(opts) {
  opts = opts || {};
  const session = await getSession();
  if (!session) {
    window.location.href = './login.html';
    return null;
  }

  const profile = await getProfile(session.user.id);
  if (!profile) {
    window.location.href = './login.html';
    return null;
  }

  // Check must_change_password
  if (profile.must_change_password && !opts.allowChangePassword) {
    window.location.href = './change-password.html';
    return null;
  }

  // Check admin requirement
  if (opts.requireAdmin && profile.role !== 'admin') {
    window.location.href = './dashboard.html';
    return null;
  }

  // Check disclaimer (skip for admins, change-password, disclaimer page)
  if (!opts.skipDisclaimer && !profile.disclaimer_accepted && profile.role !== 'admin') {
    window.location.href = './disclaimer.html';
    return null;
  }

  return { session, profile };
}

/* --- Document Helpers --- */

async function getDocuments(fundTypes) {
  const sb = initSupabase();
  if (!sb) return [];
  // fundTypes can be a string or an array
  if (typeof fundTypes === 'string') fundTypes = [fundTypes];
  var orParts = fundTypes.map(function(ft) { return 'fund_type.eq.' + ft; });
  orParts.push('fund_type.eq.all');
  const { data, error } = await sb
    .from('documents')
    .select('*')
    .or(orParts.join(','))
    .order('uploaded_at', { ascending: false });
  if (error) { console.error('Documents fetch error:', error); return []; }
  return data || [];
}

async function getAllDocuments() {
  const sb = initSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false });
  if (error) { console.error('Documents fetch error:', error); return []; }
  return data || [];
}

async function getAllProfiles() {
  const sb = initSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('Profiles fetch error:', error); return []; }
  return data || [];
}

async function deleteDocument(docId, filePath) {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  // Delete from storage
  if (filePath) {
    await sb.storage.from('documents').remove([filePath]);
  }

  // Delete from database
  const { error } = await sb.from('documents').delete().eq('id', docId);
  if (error) throw error;
}

async function uploadDocument(file, name, category, fundType, uploaderId) {
  const sb = initSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  // Upload file to storage
  var ext = file.name.split('.').pop();
  var path = category + '/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  var { data: storageData, error: storageError } = await sb.storage
    .from('documents')
    .upload(path, file);

  if (storageError) throw storageError;

  // Insert document record
  var { data, error } = await sb.from('documents').insert({
    name: name,
    category: category,
    fund_type: fundType,
    file_path: path,
    file_size: file.size,
    uploaded_by: uploaderId,
    uploaded_at: new Date().toISOString()
  }).select().single();

  if (error) throw error;
  return data;
}

function getDocumentUrl(filePath) {
  var sb = initSupabase();
  if (!sb) return '#';
  var { data } = sb.storage.from('documents').getPublicUrl(filePath);
  return data.publicUrl;
}

async function getDocumentSignedUrl(filePath) {
  var sb = initSupabase();
  if (!sb) return '#';
  var { data, error } = await sb.storage.from('documents').createSignedUrl(filePath, 3600);
  if (error) { console.error('Signed URL error:', error); return '#'; }
  return data.signedUrl;
}

/* --- Admin: Create User --- */

async function createUser(firstName, lastName, email, role, fundTypes) {
  // fundTypes is an array of selected fund types
  var primaryFundType = fundTypes[0];

  // Generate random temp password
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  var tempPassword = '';
  for (var i = 0; i < 12; i++) {
    tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Use the admin API via edge function or direct API
  // Since we're client-side, we'll use the Supabase admin API with service role
  // Actually, we need to call the auth API from client side
  // We'll use the admin createUser via REST API
  var response = await fetch(SUPABASE_URL + '/auth/v1/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY
    },
    body: JSON.stringify({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    })
  });

  if (!response.ok) {
    var errBody = await response.json();
    throw new Error(errBody.msg || errBody.message || 'Failed to create user');
  }

  var userData = await response.json();

  // Create profile
  var sb = initSupabase();
  // Use service role to insert profile
  var profileResponse = await fetch(SUPABASE_URL + '/rest/v1/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: userData.id,
      first_name: firstName,
      last_name: lastName,
      email: email,
      role: role,
      fund_type: primaryFundType,
      fund_types: fundTypes,
      disclaimer_accepted: false,
      must_change_password: true
    })
  });

  if (!profileResponse.ok) {
    var profileErr = await profileResponse.json();
    throw new Error(profileErr.message || 'Failed to create profile');
  }

  return { user: userData, tempPassword: tempPassword };
}

// Service key for admin operations (only used on admin page)
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eXlteWFseXN2amx1anJnZmNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1NTYxMSwiZXhwIjoyMDg5OTMxNjExfQ.1VEo9f5gWLuM-StAvyNDZAprP7dFxyxvuRBz5CtFcFY';

/* --- Utility --- */

function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatFundType(ft) {
  var map = {
    'long_only': 'Long Only',
    'low_net_hedge': 'Low Net Hedge Fund',
    'variable_net_hedge': 'Variable Net Hedge Fund',
    'all': 'All Funds'
  };
  return map[ft] || ft;
}

function formatFundTypes(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
  return arr.map(function(ft) { return formatFundType(ft); }).join(', ');
}

function formatCategory(cat) {
  var map = {
    'presentation': 'Presentations',
    'annual_letter': 'Annual Letters',
    'monthly_letter': 'Monthly Letters',
    'other': 'Others'
  };
  return map[cat] || cat;
}

function showAlert(el, msg) {
  el.textContent = msg;
  el.classList.add('alert--visible');
}

function hideAlert(el) {
  el.classList.remove('alert--visible');
}

function showAdminAlert(el, msg) {
  el.textContent = msg;
  el.classList.add('admin-alert--visible');
}

function hideAdminAlert(el) {
  el.classList.remove('admin-alert--visible');
}
