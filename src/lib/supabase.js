import { createClient } from '@supabase/supabase-js';

// Supabase bağlantı bilgileri
// Bu bilgileri kendi Supabase projenizden alın
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Kullanıcı oturum kontrolü
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Kullanıcı bilgisi alınamadı:', error);
    return null;
  }
  return user;
};

// ============================================
// BOARDS API
// ============================================

/**
 * Kullanıcının tüm boardlarını getir
 */
export const getBoards = async () => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('order', { ascending: true });
  
  return { data, error };
};

/**
 * Tek bir board getir
 */
export const getBoard = async (boardId) => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();
  
  return { data, error };
};

/**
 * Yeni board oluştur
 */
export const createBoard = async (name, order) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('boards')
    .insert([{ name, order, user_id: user.id }])
    .select()
    .single();
  
  return { data, error };
};

/**
 * Board güncelle
 */
export const updateBoard = async (boardId, updates) => {
  const { data, error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', boardId)
    .select()
    .single();
  
  return { data, error };
};

/**
 * Board sil
 */
export const deleteBoard = async (boardId) => {
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId);
  
  return { error };
};

/**
 * Kullanıcı kaydı
 */
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

/**
 * Kullanıcı girişi
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

/**
 * Kullanıcı çıkışı
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Kolonları getir
 */
export const getColumns = async (boardId) => {
  let query = supabase
    .from('columns')
    .select('*');
  
  if (boardId) {
    query = query.eq('board_id', boardId);
  }
  
  const { data, error } = await query.order('order', { ascending: true });
  
  return { data, error };
};

/**
 * Yeni kolon oluştur
 */
export const createColumn = async (title, order, pinned = false, boardId) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('columns')
    .insert([{ title, order, pinned, board_id: boardId, user_id: user?.id }])
    .select()
    .single();
  
  return { data, error };
};

/**
 * Kolon güncelle
 */
export const updateColumn = async (id, updates) => {
  const { data, error } = await supabase
    .from('columns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

/**
 * Kolon sil
 */
export const deleteColumn = async (id) => {
  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', id);
  
  return { error };
};

/**
 * Kartları getir
 */
export const getCards = async (boardId) => {
  let query = supabase
    .from('cards')
    .select('*');
  
  if (boardId) {
    query = query.eq('board_id', boardId);
  }
  
  const { data, error } = await query.order('order', { ascending: true });
  
  return { data, error };
};

/**
 * Yeni kart oluştur
 */
export const createCard = async (title, description, price, column_id, order, priority = null, note = null, boardId = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('cards')
    .insert([{ title, description, price, column_id, order, priority, note, board_id: boardId, user_id: user?.id }])
    .select()
    .single();
  
  return { data, error };
};

/**
 * Kart güncelle
 */
export const updateCard = async (id, updates) => {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

/**
 * Kart sil
 */
export const deleteCard = async (id) => {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);
  
  return { error };
};

/**
 * Kullanıcı ayarlarını getir
 */
export const getUserSettings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // Eğer ayar yoksa varsayılan değer döndür
  if (error && error.code === 'PGRST116') {
    return { data: { star_count: 5 }, error: null };
  }
  
  return { data, error };
};

/**
 * Kullanıcı ayarlarını güncelle veya oluştur
 */
export const updateUserSettings = async (settings) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: user.id, ...settings },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  
  return { data, error };
};

/**
 * Kullanıcı widget'larını getir
 */
export const getUserWidgets = async (boardId) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: [], error: new Error('User not authenticated') };
  }

  let query = supabase
    .from('user_widgets')
    .select('*')
    .eq('user_id', user.id);
  
  if (boardId) {
    query = query.eq('board_id', boardId);
  }

  const { data, error } = await query.order('order', { ascending: true });
  
  return { data: data || [], error };
};

/**
 * Widget oluştur
 */
export const createWidget = async (widgetData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('user_widgets')
    .insert([{ user_id: user.id, ...widgetData }])
    .select()
    .single();
  
  return { data, error };
};

/**
 * Widget güncelle
 */
export const updateWidget = async (id, updates) => {
  const { data, error } = await supabase
    .from('user_widgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

/**
 * Widget sil
 */
export const deleteWidget = async (id) => {
  const { error } = await supabase
    .from('user_widgets')
    .delete()
    .eq('id', id);
  
  return { error };
};

/**
 * Varsayılan widget'ları oluştur
 */
export const createDefaultWidgets = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: new Error('User not authenticated') };
  }

  const { error } = await supabase.rpc('create_default_widgets', {
    p_user_id: user.id
  });
  
  return { error };
};

// ============================================
// REPORTS (SNAPSHOTS) API
// ============================================

/**
 * Tüm raporları getir
 */
export const getReports = async (boardId = null) => {
  let query = supabase
    .from('reports')
    .select('*');
  
  if (boardId) {
    query = query.eq('board_id', boardId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { data, error };
};

/**
 * Rapor oluştur (snapshot)
 */
export const createReport = async (title, description, snapshotData, boardId = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('reports')
    .insert([{ 
      title, 
      description, 
      snapshot_data: snapshotData,
      board_id: boardId,
      user_id: user?.id 
    }])
    .select()
    .single();
  
  return { data, error };
};

/**
 * Rapor güncelle
 */
export const updateReport = async (id, updates) => {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

/**
 * Rapor sil
 */
export const deleteReport = async (id) => {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);
  
  return { error };
};

/**
 * Tek bir raporu getir
 */
export const getReport = async (id) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};


