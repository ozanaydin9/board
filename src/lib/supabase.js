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
export const getColumns = async () => {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .order('order', { ascending: true });
  
  return { data, error };
};

/**
 * Yeni kolon oluştur
 */
export const createColumn = async (title, order) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('columns')
    .insert([{ title, order, user_id: user?.id }])
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
export const getCards = async () => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('order', { ascending: true });
  
  return { data, error };
};

/**
 * Yeni kart oluştur
 */
export const createCard = async (title, description, price, column_id, order) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('cards')
    .insert([{ title, description, price, column_id, order, user_id: user?.id }])
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

