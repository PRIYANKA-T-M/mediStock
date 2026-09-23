import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  AlertTriangle,
  Clock3,
  PackageX,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationService";

const NotificationBell = () => {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  const loadNotifications = async () => {

    try {

      const data =
        await notificationService.getNotifications();

      setNotifications(data);

    } catch (error) {

      console.error(
        "Failed to load notifications:",
        error
      );

    }
  };

  useEffect(() => {

    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  const unreadCount = notifications.filter(
    (notification) =>
      notification.status === "OPEN"
  ).length;

  const latestNotifications =
    notifications.slice(0, 5);

  const getIcon = (type) => {

    switch (type) {

      case "LOW_STOCK":
        return <PackageX size={17} />;

      case "OUT_OF_STOCK":
        return <XCircle size={17} />;

      case "EXPIRY":
        return <Clock3 size={17} />;

      default:
        return <AlertTriangle size={17} />;
    }
  };

  const getIconStyle = (severity) => {

    if (severity === "CRITICAL") {
      return "bg-red-50 text-red-600";
    }

    if (severity === "WARNING") {
      return "bg-amber-50 text-amber-600";
    }

    return "bg-blue-50 text-blue-600";
  };

  const handleAcknowledge = async (id) => {

    try {

      await notificationService.acknowledge(id);

      await loadNotifications();

    } catch (error) {

      console.error(
        "Failed to acknowledge notification:",
        error
      );

    }
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >

      {/* BELL */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >

        <Bell size={21} />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}

      </button>


      {/* DROPDOWN */}

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

            <div>

              <h3 className="text-sm font-bold text-slate-900">
                Notifications
              </h3>

              <p className="text-xs text-slate-500">
                {unreadCount} unread
              </p>

            </div>

            <Bell
              size={18}
              className="text-blue-600"
            />

          </div>


          <div className="max-h-[360px] overflow-y-auto">

            {latestNotifications.length === 0 ? (

              <div className="px-5 py-10 text-center">

                <Check
                  size={30}
                  className="mx-auto text-emerald-500"
                />

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  You're all caught up
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  No notifications available.
                </p>

              </div>

            ) : (

              latestNotifications.map((notification) => (

                <div
                  key={notification.id}
                  className={`border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 ${
                    notification.status === "OPEN"
                      ? "bg-blue-50/40"
                      : ""
                  }`}
                >

                  <div className="flex gap-3">

                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${getIconStyle(
                        notification.severity
                      )}`}
                    >
                      {getIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <p className="text-sm font-semibold text-slate-900">
                          {notification.title}
                        </p>

                        {notification.status === "OPEN" && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        )}

                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between">

                        <span className="text-[11px] text-slate-400">
                          {notification.createdAt
                            ? new Date(
                                notification.createdAt
                              ).toLocaleString()
                            : ""}
                        </span>

                        {notification.status === "OPEN" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleAcknowledge(
                                notification.id
                              )
                            }
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Mark read
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>


          {/* FOOTER */}

          <div className="border-t border-slate-200 bg-slate-50 p-2">

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/alerts");
              }}
              className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              View all notifications
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default NotificationBell;