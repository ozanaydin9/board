import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Column from './Column';
import Card from './Card';
import {
  getColumns,
  getCards,
  createColumn,
  createCard,
  updateCard,
  deleteCard,
  updateColumn,
  deleteColumn,
  signOut,
} from '../lib/supabase';
import '../styles/board.css';

/**
 * Board Component
 * Ana board ekranı - drag & drop ve tüm CRUD operasyonlarını yönetir
 */
function Board({ user, onLogout }) {
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingColumnId, setEditingColumnId] = useState(null);

  // Drag & drop sensorleri
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // İlk yüklemede verileri çek
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [columnsResult, cardsResult] = await Promise.all([
        getColumns(),
        getCards(),
      ]);

      if (columnsResult.error) {
        console.error('Kolonlar yüklenemedi:', columnsResult.error);
      } else {
        setColumns(columnsResult.data || []);
      }

      if (cardsResult.error) {
        console.error('Kartlar yüklenemedi:', cardsResult.error);
      } else {
        setCards(cardsResult.data || []);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kolon ekleme
  const handleAddColumn = async () => {
    const maxOrder = columns.length > 0 
      ? Math.max(...columns.map(c => c.order || 0)) 
      : 0;

    const { data, error } = await createColumn('Yeni Kolon', maxOrder + 1);

    if (error) {
      console.error('Kolon oluşturulamadı:', error);
      alert('Kolon oluşturulurken bir hata oluştu.');
    } else if (data) {
      setColumns([...columns, data]);
      setEditingColumnId(data.id);
    }
  };

  // Kolon güncelleme
  const handleUpdateColumn = async (columnId, updates) => {
    const { data, error } = await updateColumn(columnId, updates);

    if (error) {
      console.error('Kolon güncellenemedi:', error);
      alert('Kolon güncellenirken bir hata oluştu.');
    } else if (data) {
      setColumns(columns.map(col => col.id === columnId ? data : col));
    }
  };

  // Kolon silme
  const handleDeleteColumn = async (columnId) => {
    const { error } = await deleteColumn(columnId);

    if (error) {
      console.error('Kolon silinemedi:', error);
      alert('Kolon silinirken bir hata oluştu.');
    } else {
      setColumns(columns.filter(col => col.id !== columnId));
    }
  };

  // Kart ekleme
  const handleAddCard = async (cardData) => {
    const { data, error } = await createCard(
      cardData.title,
      cardData.description,
      cardData.price,
      cardData.column_id,
      cardData.order
    );

    if (error) {
      console.error('Kart oluşturulamadı:', error);
      alert('Kart oluşturulurken bir hata oluştu.');
    } else if (data) {
      setCards([...cards, data]);
    }
  };

  // Kart güncelleme
  const handleUpdateCard = async (cardId, updates) => {
    const { data, error } = await updateCard(cardId, updates);

    if (error) {
      console.error('Kart güncellenemedi:', error);
      alert('Kart güncellenirken bir hata oluştu.');
    } else if (data) {
      setCards(cards.map(card => card.id === cardId ? data : card));
    }
  };

  // Kart silme
  const handleDeleteCard = async (cardId) => {
    const { error } = await deleteCard(cardId);

    if (error) {
      console.error('Kart silinemedi:', error);
      alert('Kart silinirken bir hata oluştu.');
    } else {
      setCards(cards.filter(card => card.id !== cardId));
    }
  };

  // Drag başlangıcı
  const handleDragStart = (event) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card);
  };

  // Drag sonu
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    const overId = over.id;
    const overCard = cards.find(c => c.id === overId);
    const overColumn = columns.find(c => c.id === overId);

    let newColumnId = activeCard.column_id;
    let newCards = [...cards];

    // Kart bir kolona bırakıldıysa
    if (overColumn) {
      newColumnId = overColumn.id;
      const columnCards = newCards.filter(c => c.column_id === newColumnId);
      const newOrder = columnCards.length > 0 
        ? Math.max(...columnCards.map(c => c.order || 0)) + 1 
        : 1;

      // Kartı güncelle
      await handleUpdateCard(activeCard.id, {
        column_id: newColumnId,
        order: newOrder,
      });

      return;
    }

    // Kart başka bir kartın üzerine bırakıldıysa
    if (overCard) {
      newColumnId = overCard.column_id;

      if (activeCard.id === overCard.id) return;

      // Aynı kolon içinde sıralama
      if (activeCard.column_id === overCard.column_id) {
        const columnCards = newCards.filter(c => c.column_id === newColumnId);
        const oldIndex = columnCards.findIndex(c => c.id === activeCard.id);
        const newIndex = columnCards.findIndex(c => c.id === overCard.id);

        const reorderedCards = arrayMove(columnCards, oldIndex, newIndex);
        
        // Order değerlerini güncelle
        const updates = reorderedCards.map((card, index) => ({
          ...card,
          order: index + 1,
        }));

        // UI'ı hemen güncelle
        const otherCards = newCards.filter(c => c.column_id !== newColumnId);
        setCards([...otherCards, ...updates]);

        // Veritabanını güncelle
        for (const card of updates) {
          await updateCard(card.id, { order: card.order });
        }
      } else {
        // Farklı kolonlar arası taşıma
        const targetColumnCards = newCards.filter(c => c.column_id === newColumnId);
        const targetIndex = targetColumnCards.findIndex(c => c.id === overCard.id);
        
        await handleUpdateCard(activeCard.id, {
          column_id: newColumnId,
          order: targetIndex + 1,
        });
      }
    }
  };

  // Çıkış yap
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Çıkış yapılamadı:', error);
    }
    onLogout();
  };

  if (loading) {
    return (
      <div className="board-loading">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="board-container">
      <header className="board-header">
        <div className="board-header-left">
          <h1 className="board-title">📋 Board App</h1>
          <span className="board-user">👤 {user?.email}</span>
        </div>
        <div className="board-header-right">
          <button
            onClick={handleAddColumn}
            className="add-column-button"
          >
            + Yeni Kolon
          </button>
          <button onClick={handleLogout} className="logout-button">
            Çıkış Yap
          </button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {columns.map((column) => {
            const columnCards = cards
              .filter(card => card.column_id === column.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0));

            return (
              <Column
                key={column.id}
                column={column}
                cards={columnCards}
                onAddCard={handleAddCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
                onUpdateColumn={handleUpdateColumn}
                onDeleteColumn={handleDeleteColumn}
                autoEdit={column.id === editingColumnId}
                onEditComplete={() => setEditingColumnId(null)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeCard ? (
            <Card
              card={activeCard}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default Board;

