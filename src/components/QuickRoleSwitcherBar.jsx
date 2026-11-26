import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserCheck, Clock, Building2, UserX, RefreshCw, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

export const QuickRoleSwitcherBar = () => {
  const { userRole, currentUser, quickSwitchUser, resetToInitialData, backendOnline } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MÔ PHỎNG ĐỀ TÀI</span>
          </div>
          <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60 text-[10px] text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>Backend: {backendOnline ? 'REST API Online (:5000)' : 'Kết Nối Máy Chủ...'}</span>
          </span>
          <span className="hidden sm:inline text-slate-400">
            Đang đăng nhập: <strong className="text-white">{currentUser?.fullName || currentUser?.name || 'Khách vãng lai'}</strong>
            {userRole !== 'guest' && (
              <span className={`ml-1.5 px-1.5 py-0.2 rounded text-[11px] font-medium ${
                userRole === 'admin' ? 'bg-purple-900/60 text-purple-200' :
                userRole === 'organization' ? 'bg-blue-900/60 text-blue-200' : 'bg-emerald-900/60 text-emerald-200'
              }`}>
                {userRole === 'admin' ? 'Admin Quản trị' : userRole === 'organization' ? 'Đơn vị Tổ chức' : 'Tình nguyện viên'}
                {currentUser?.status === 'pending' ? ' (Chờ duyệt)' : ''}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {!collapsed && (
            <div className="flex items-center gap-1">
              {/* TNV Đã duyệt */}
              <button
                onClick={() => quickSwitchUser('volunteer', 'vol-1')}
                title="TNV Nguyễn Văn An (Đã duyệt, 24h công tích lũy)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap ${
                  userRole === 'volunteer' && currentUser?.id === 'vol-1'
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>TNV Đã duyệt (An)</span>
              </button>

              {/* TNV Chờ duyệt */}
              <button
                onClick={() => quickSwitchUser('volunteer', 'vol-4')}
                title="TNV Phạm Quỳnh Chi (Chờ duyệt bởi Admin)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap ${
                  userRole === 'volunteer' && currentUser?.id === 'vol-4'
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>TNV Chờ duyệt (Chi)</span>
              </button>

              {/* Tổ chức Đã duyệt */}
              <button
                onClick={() => quickSwitchUser('organization', 'org-1')}
                title="Tổ chức Green Life Vietnam (Đã duyệt pháp lý)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap ${
                  userRole === 'organization' && currentUser?.id === 'org-1'
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Tổ chức (Green Life)</span>
              </button>

              {/* Tổ chức Chờ duyệt */}
              <button
                onClick={() => quickSwitchUser('organization', 'org-4')}
                title="CLB Kết Nối Trái Tim Đà Nẵng (Chờ duyệt giấy phép)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap ${
                  userRole === 'organization' && currentUser?.id === 'org-4'
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>T/chức Chờ duyệt</span>
              </button>

              {/* Admin */}
              <button
                onClick={() => quickSwitchUser('admin')}
                title="Quản trị viên hệ thống toàn quyền"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap ${
                  userRole === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Toàn Quyền</span>
              </button>

              {/* Khách */}
              <button
                onClick={() => quickSwitchUser('guest')}
                title="Khách vãng lai chưa đăng nhập"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap ${
                  userRole === 'guest'
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <UserX className="w-3.5 h-3.5 text-slate-400" />
                <span>Khách</span>
              </button>

              {/* Reset Data */}
              <button
                onClick={resetToInitialData}
                title="Khôi phục toàn bộ dữ liệu mẫu ban đầu"
                className="flex items-center gap-1 px-2 py-1 bg-rose-900/50 hover:bg-rose-800 text-rose-200 rounded-lg transition-colors border border-rose-700/50 ml-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden md:inline">Reset Data</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors ml-1"
            title={collapsed ? 'Mở rộng thanh chuyển vai trò' : 'Thu gọn'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
