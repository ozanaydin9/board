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
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Column from './Column';
import Card from './Card';
import SelectColumnModal from './SelectColumnModal';
import SettingsModal from './SettingsModal';
import WidgetModal from './WidgetModal';
import DashboardWidget from './DashboardWidget';
import ConfirmModal from './ConfirmModal';
import BoardTabs from './BoardTabs';
import Toast from './Toast';
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  getColumns,
  getCards,
  createColumn,
  createCard,
  updateCard,
  deleteCard,
  updateColumn,
  deleteColumn,
  signOut,
  getUserSettings,
  updateUserSettings,
  getUserWidgets,
  createWidget,
  updateWidget,
  deleteWidget,
} from '../lib/supabase';
import '../styles/board.css';

/**
 * Board Component
 * Ana board ekranı - drag & drop ve tüm CRUD operasyonlarını yönetir
 */
function Board({ user, onLogout }) {
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [showColumnSelectModal, setShowColumnSelectModal] = useState(false);
  const [cardToMove, setCardToMove] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userSettings, setUserSettings] = useState({ star_count: 5 });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [widgetToDelete, setWidgetToDelete] = useState(null);
  const [toast, setToast] = useState(null);

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
    loadBoards();
    loadUserSettings();
  }, []);

  // Board değiştiğinde verileri yükle
  useEffect(() => {
    if (activeBoard) {
      loadData();
      loadWidgets();
    }
  }, [activeBoard]);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const { data, error } = await getBoards();
      
      if (error) {
        console.error('Boardlar yüklenemedi:', error);
        setToast({ message: 'Board\'lar yüklenirken hata oluştu.', type: 'error' });
      } else if (data && data.length > 0) {
        setBoards(data);
        setActiveBoard(data[0]); // İlk board'u aktif yap
      } else {
        // Hiç board yoksa varsayılan board oluştur
        await handleCreateBoard('Ana Board');
      }
    } catch (error) {
      console.error('Board yükleme hatası:', error);
      setToast({ message: 'Board yükleme hatası oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const loadData = async () => {
    if (!activeBoard) return;
    
    try {
      const [columnsResult, cardsResult] = await Promise.all([
        getColumns(activeBoard.id),
        getCards(activeBoard.id),
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
    }
  };

  const loadUserSettings = async () => {
    const { data, error } = await getUserSettings();
    if (!error && data) {
      setUserSettings(data);
    }
  };

  const loadWidgets = async () => {
    if (!activeBoard) return;
    
    const { data, error } = await getUserWidgets(activeBoard.id);
    if (!error) {
      setWidgets(data);
    }
  };

  // Board CRUD işlemleri
  const handleCreateBoard = async (name) => {
    const maxOrder = boards.length > 0 
      ? Math.max(...boards.map(b => b.order || 0)) 
      : 0;

    const { data, error } = await createBoard(name, maxOrder + 1);
    
    if (error) {
      console.error('Board oluşturulamadı:', error);
      setToast({ message: 'Board oluşturulurken bir hata oluştu.', type: 'error' });
    } else if (data) {
      setBoards(prev => [...prev, data]);
      setActiveBoard(data); // Yeni board'u aktif yap
      setToast({ message: `"${name}" board'u oluşturuldu!`, type: 'success' });
    }
  };

  const handleBoardChange = (board) => {
    setActiveBoard(board);
    // Demo modda sadece görsel değişim
    if (board.id.startsWith('demo-')) {
      console.log(`🎨 DEMO MOD: "${board.name}" board'una geçildi (görsel demo)`);
    }
  };

  const handleBoardRename = async (boardId, newName) => {
    const { data, error } = await updateBoard(boardId, { name: newName });
    
    if (error) {
      console.error('Board güncellenemedi:', error);
      setToast({ message: 'Board güncellenirken bir hata oluştu.', type: 'error' });
    } else if (data) {
      setBoards(prev => prev.map(b => b.id === boardId ? data : b));
      if (activeBoard?.id === boardId) {
        setActiveBoard(data);
      }
      setToast({ message: `Board adı "${newName}" olarak değiştirildi.`, type: 'success' });
    }
  };

  const handleBoardDelete = async (boardId) => {
    const { error } = await deleteBoard(boardId);
    
    if (error) {
      console.error('Board silinemedi:', error);
      setToast({ message: 'Board silinirken bir hata oluştu.', type: 'error' });
    } else {
      const newBoards = boards.filter(b => b.id !== boardId);
      setBoards(newBoards);
      
      // Silinen board aktif board ise başka birine geç
      if (activeBoard?.id === boardId && newBoards.length > 0) {
        setActiveBoard(newBoards[0]);
      }
      setToast({ message: 'Board silindi.', type: 'success' });
    }
  };

  // Kolon ekleme
  const handleAddColumn = async () => {
    if (!activeBoard) {
      setToast({ message: 'Önce bir board seçmelisiniz.', type: 'error' });
      return;
    }

    const maxOrder = columns.length > 0 
      ? Math.max(...columns.map(c => c.order || 0)) 
      : 0;

    const { data, error } = await createColumn('Yeni Kolon', maxOrder + 1, false, activeBoard.id);

    if (error) {
      console.error('Kolon oluşturulamadı:', error);
      setToast({ message: 'Kolon oluşturulurken bir hata oluştu.', type: 'error' });
    } else if (data) {
      setColumns(prevColumns => [...prevColumns, data]);
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
      setColumns(prevColumns => prevColumns.map(col => col.id === columnId ? data : col));
    }
  };

  // Kolon silme
  const handleDeleteColumn = async (columnId) => {
    const { error } = await deleteColumn(columnId);

    if (error) {
      console.error('Kolon silinemedi:', error);
      alert('Kolon silinirken bir hata oluştu.');
    } else {
      setColumns(prevColumns => prevColumns.filter(col => col.id !== columnId));
    }
  };

  // Kart ekleme
  const handleAddCard = async (cardData) => {
    if (!activeBoard) {
      setToast({ message: 'Önce bir board seçmelisiniz.', type: 'error' });
      return;
    }

    const { data, error } = await createCard(
      cardData.title,
      cardData.description,
      cardData.price,
      cardData.column_id,
      cardData.order,
      cardData.priority,
      cardData.note,
      activeBoard.id
    );

    if (error) {
      console.error('Kart oluşturulamadı:', error);
      setToast({ message: 'Kart oluşturulurken bir hata oluştu.', type: 'error' });
    } else if (data) {
      setCards(prevCards => [...prevCards, data]);
    }
  };

  // Kart güncelleme
  const handleUpdateCard = async (cardId, updates) => {
    const { data, error } = await updateCard(cardId, updates);

    if (error) {
      console.error('Kart güncellenemedi:', error);
      alert('Kart güncellenirken bir hata oluştu.');
    } else if (data) {
      setCards(prevCards => prevCards.map(card => card.id === cardId ? data : card));
    }
  };

  // Kart silme
  const handleDeleteCard = async (cardId) => {
    const { error } = await deleteCard(cardId);

    if (error) {
      console.error('Kart silinemedi:', error);
      alert('Kart silinirken bir hata oluştu.');
    } else {
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    }
  };

  // Drag başlangıcı
  const handleDragStart = (event) => {
    const { active } = event;
    
    // Kolon başlığı mı sürükleniyor?
    if (active.id.toString().startsWith('column-')) {
      return; // Kolon drag'i için özel handler
    }
    
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card);
  };

  // Drag sonu
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    // Kolon drag & drop
    if (active.id.toString().startsWith('column-')) {
      const activeColumnId = active.id.toString().replace('column-', '');
      const overColumnId = over.id.toString().replace('column-', '');
      
      const oldIndex = columns.findIndex(c => c.id === activeColumnId);
      const newIndex = columns.findIndex(c => c.id === overColumnId);
      
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      
      const reorderedColumns = arrayMove(columns, oldIndex, newIndex);
      
      // UI güncelle
      setColumns(reorderedColumns);
      
      // Veritabanını güncelle
      for (let i = 0; i < reorderedColumns.length; i++) {
        await updateColumn(reorderedColumns[i].id, { order: i + 1 });
      }
      
      return;
    }

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

  // Kartı pinli kolona taşı
  const handleMoveCardToPin = (cardId) => {
    const pinnedCols = columns.filter(col => col.pinned);
    
    if (pinnedCols.length === 0) {
      alert('Pinlenmiş kolon bulunamadı. Önce bir kolonu pinleyin.');
      return;
    }
    
    if (pinnedCols.length === 1) {
      // Tek pinli kolon varsa direkt taşı
      moveCardToColumn(cardId, pinnedCols[0].id);
    } else {
      // Birden fazla pinli kolon varsa modal aç
      setCardToMove(cardId);
      setShowColumnSelectModal(true);
    }
  };

  // Kartı seçilen kolona taşı
  const moveCardToColumn = async (cardId, targetColumnId) => {
    const targetColumnCards = cards.filter(c => c.column_id === targetColumnId);
    const maxOrder = targetColumnCards.length > 0 
      ? Math.max(...targetColumnCards.map(c => c.order || 0)) 
      : 0;

    await handleUpdateCard(cardId, {
      column_id: targetColumnId,
      order: maxOrder + 1,
    });

    setShowColumnSelectModal(false);
    setCardToMove(null);
  };

  // Ayarları kaydet
  const handleSaveSettings = async (settings) => {
    const { data, error } = await updateUserSettings(settings);
    if (error) {
      console.error('Ayarlar kaydedilemedi:', error);
      alert('Ayarlar kaydedilirken bir hata oluştu.');
    } else if (data) {
      setUserSettings(data);
      setShowSettingsModal(false);
    }
  };

  // Widget CRUD işlemleri
  const handleAddWidget = () => {
    setEditingWidget(null);
    setShowWidgetModal(true);
  };

  const handleEditWidget = (widget) => {
    setEditingWidget(widget);
    setShowWidgetModal(true);
  };

  const handleSaveWidget = async (widgetData) => {
    if (editingWidget) {
      // Güncelleme
      const { data, error } = await updateWidget(editingWidget.id, widgetData);
      if (error) {
        setToast({ message: 'Widget güncellenirken hata oluştu.', type: 'error' });
      } else if (data) {
        setWidgets(prevWidgets => prevWidgets.map(w => w.id === editingWidget.id ? data : w));
        setShowWidgetModal(false);
        setEditingWidget(null);
      }
    } else {
      // Yeni widget
      if (!activeBoard) {
        setToast({ message: 'Önce bir board seçmelisiniz.', type: 'error' });
        return;
      }

      const maxOrder = widgets.length > 0 
        ? Math.max(...widgets.map(w => w.order || 0)) 
        : 0;
      
      const { data, error } = await createWidget({
        ...widgetData,
        board_id: activeBoard.id,
        order: maxOrder + 1
      });
      
      if (error) {
        setToast({ message: 'Widget eklenirken hata oluştu.', type: 'error' });
      } else if (data) {
        setWidgets(prevWidgets => [...prevWidgets, data]);
        setShowWidgetModal(false);
      }
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    setWidgetToDelete(widgetId);
  };

  const confirmDeleteWidget = async () => {
    if (!widgetToDelete) return;
    
    const { error } = await deleteWidget(widgetToDelete);
    if (error) {
      alert('Widget silinirken hata oluştu.');
    } else {
      setWidgets(prevWidgets => prevWidgets.filter(w => w.id !== widgetToDelete));
    }
    setWidgetToDelete(null);
  };

  // Widget drag & drop
  const handleWidgetDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    setWidgets(prevWidgets => {
      const oldIndex = prevWidgets.findIndex(w => w.id === active.id);
      const newIndex = prevWidgets.findIndex(w => w.id === over.id);
      
      const reorderedWidgets = arrayMove(prevWidgets, oldIndex, newIndex);
      
      // Veritabanını güncelle (background)
      setTimeout(async () => {
        for (let i = 0; i < reorderedWidgets.length; i++) {
          await updateWidget(reorderedWidgets[i].id, { order: i + 1 });
        }
      }, 0);
      
      return reorderedWidgets;
    });
  };

  // Çıkış yap
  const handleLogout = async () => {
    const { error} = await signOut();
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

  if (!activeBoard) {
    return (
      <div className="board-loading">
        <p>Board bulunamadı. Lütfen yeni bir board oluşturun.</p>
      </div>
    );
  }

  // Kolonları pinli ve pinlisiz olarak ayır
  const unpinnedColumns = columns.filter(col => !col.pinned);
  const pinnedColumns = columns.filter(col => col.pinned);
  const hasPinnedColumns = pinnedColumns.length > 0;

  const renderColumn = (column) => {
    const columnCards = cards
      .filter(card => card.column_id === column.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Key'e cards dependency ekle - cards değişince re-render garanti
    const columnKey = `${column.id}-${columnCards.length}-${columnCards.reduce((sum, c) => sum + (c.price || 0), 0)}`;

    return (
      <Column
        key={columnKey}
        column={column}
        cards={columnCards}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        onUpdateColumn={handleUpdateColumn}
        onDeleteColumn={handleDeleteColumn}
        onMoveCardToPin={handleMoveCardToPin}
        hasPinnedColumns={hasPinnedColumns}
        maxStars={userSettings.star_count || 5}
        autoEdit={column.id === editingColumnId}
        onEditComplete={() => setEditingColumnId(null)}
      />
    );
  };

  // Sortable Widget wrapper
  const SortableWidget = ({ widget }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: widget.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <DashboardWidget
          widget={widget}
          cards={cards}
          columns={columns}
          onEdit={handleEditWidget}
          onDelete={handleDeleteWidget}
          isDragging={isDragging}
        />
      </div>
    );
  };

  return (
    <div className="board-container">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="board-header">
        {/* Sol taraf: Dashboard widget'ları */}
        <div className="board-header-left">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleWidgetDragEnd}
          >
            <SortableContext items={widgets.map(w => w.id)} strategy={horizontalListSortingStrategy}>
              <div className={`dashboard-widgets dashboard-widgets-${userSettings.widget_display_mode || 'wrap'}`}>
                {widgets.map(widget => (
                  <SortableWidget key={widget.id} widget={widget} />
                ))}
                
                {/* Widget Ekle Butonu */}
                <button
                  onClick={handleAddWidget}
                  className="add-widget-btn"
                  title="Yeni Widget Ekle"
                >
                  <span className="add-widget-icon">➕</span>
                  <span className="add-widget-text">Widget</span>
                </button>
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Sağ taraf: Kullanıcı ve işlem alanı */}
        <div className="board-header-right">
          {/* İşlem butonları */}
          <div className="action-buttons">
            <button
              onClick={handleAddColumn}
              className="add-column-button"
            >
              + Yeni Kolon
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="settings-button"
              title="Ayarlar"
            >
              ⚙️
            </button>
          </div>

          {/* Kullanıcı profil alanı */}
          <div className="user-profile">
            <div 
              className="user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-menu-avatar">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-menu-info">
                    <span className="user-menu-email">{user?.email}</span>
                  </div>
                </div>
                <a
                  href="/reports"
                  className="user-menu-item reports-menu-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="menu-item-icon">📊</span>
                  <span className="menu-item-text">Raporlar</span>
                </a>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="user-menu-item logout-item"
                >
                  <span className="menu-item-icon">⎋</span>
                  <span className="menu-item-text">Çıkış Yap</span>
                </button>
              </div>
            )}
            
            {/* Overlay to close menu when clicking outside */}
            {showUserMenu && (
              <div 
                className="user-menu-overlay" 
                onClick={() => setShowUserMenu(false)}
              />
            )}
          </div>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-content">
          {/* Sol taraf - Normal kolonlar (scrollable) */}
          <SortableContext items={unpinnedColumns.map(c => `column-${c.id}`)} strategy={horizontalListSortingStrategy}>
            <div className="board-columns-scrollable">
              {unpinnedColumns.map(renderColumn)}
            </div>
          </SortableContext>

          {/* Sağ taraf - Pinlenen kolonlar (fixed) */}
          {pinnedColumns.length > 0 && (
            <SortableContext items={pinnedColumns.map(c => `column-${c.id}`)} strategy={horizontalListSortingStrategy}>
              <div className="board-columns-pinned">
                {pinnedColumns.map(renderColumn)}
              </div>
            </SortableContext>
          )}
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

      {/* Board Tabs - En altta */}
      <BoardTabs
        boards={boards}
        activeBoard={activeBoard}
        onBoardChange={handleBoardChange}
        onBoardCreate={handleCreateBoard}
        onBoardRename={handleBoardRename}
        onBoardDelete={handleBoardDelete}
      />

      <SelectColumnModal
        isOpen={showColumnSelectModal}
        columns={pinnedColumns}
        onSelect={(columnId) => moveCardToColumn(cardToMove, columnId)}
        onCancel={() => {
          setShowColumnSelectModal(false);
          setCardToMove(null);
        }}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        currentStarCount={userSettings.star_count || 5}
        currentWidgetDisplayMode={userSettings.widget_display_mode || 'wrap'}
        onSave={handleSaveSettings}
        onCancel={() => setShowSettingsModal(false)}
      />

      <WidgetModal
        isOpen={showWidgetModal}
        widget={editingWidget}
        columns={columns}
        onSave={handleSaveWidget}
        onCancel={() => {
          setShowWidgetModal(false);
          setEditingWidget(null);
        }}
      />

      <ConfirmModal
        isOpen={!!widgetToDelete}
        title="Widget Sil"
        message="Bu widget'ı silmek istediğinize emin misiniz?"
        onConfirm={confirmDeleteWidget}
        onCancel={() => setWidgetToDelete(null)}
        confirmText="Sil"
        cancelText="İptal"
        isDanger={true}
      />
    </div>
  );
}

export default Board;

