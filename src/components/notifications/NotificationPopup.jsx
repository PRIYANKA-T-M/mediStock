import React, { useEffect, useState } from 'react';
import { AlertCircle, Bell, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const NotificationPopup = () => {
  const navigate = useNavigate();
  const [popupAlert, setPopupAlert] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    const checkCriticalAlerts = async () => {
      try {
        const response = await api.get('/api/alerts', { params: { status: 'OPEN' } });
        const openAlerts = response.data || [];
        
        // Find highest priority alert (CRITICAL or OUT_OF_STOCK or LOW_STOCK)
        const criticalAlert = openAlerts.find(
          (a) => a.severity === 'CRITICAL' || a.type === 'OUT_OF_STOCK' || a.type === 'EXPIRY'
        ) || openAlerts[0];

        if (criticalAlert) {
          const shownAlertKey = `medistock_shown_alert_${criticalAlert.id}`;
          const alreadyShown = sessionStorage.getItem(shownAlertKey);

          if (!alreadyShown) {
            sessionStorage.setItem(shownAlertKey, 'true');
            setPopupAlert(criticalAlert);
            setVisible(true);

            // Auto-dismiss after 5 seconds
            timer = setTimeout(() => {
              setVisible(false);
            }, 5000);
          }
        }
      } catch (err) {
        // Silently catch in popup
      }
    };

    checkCriticalAlerts();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!visible || !popupAlert) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border-2 border-red-200 p-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
          <AlertCircle size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>🔔</span> {popupAlert.title || 'Critical Stock Alert'}
            </h4>
            <button
              onClick={() => setVisible(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
            {popupAlert.message || 'Immediate inventory replenishment or action is required.'}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Auto-dismissing in 5s</span>
            <button
              onClick={() => {
                setVisible(false);
                navigate('/alerts');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition"
            >
              View Alert <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
