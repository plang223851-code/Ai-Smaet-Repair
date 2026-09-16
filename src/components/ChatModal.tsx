import React from 'react';
import { useApp } from '../context/AppContext';
import { ChatView } from './ChatView';

export const ChatModal: React.FC = () => {
  const { isChatModalOpen, closeChatModal, activeChatRepairId } = useApp();

  if (!isChatModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95">
        <ChatView
          initialRepairId={activeChatRepairId}
          isModal={true}
          onClose={closeChatModal}
        />
      </div>
    </div>
  );
};
