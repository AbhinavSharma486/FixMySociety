import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useSocketContext } from "../context/SocketContext";
import {
  getUserNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification
} from "../lib/notificationService";

const NotificationCenter = () => {
  const { currentUser } = useSelector((s) => s.user);
  const { admin } = useSelector((s) => s.admin);
  const userId = currentUser?._id || admin?._id || null;

  // Source of truth: all notifications (both read & unread).
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const notificationRef = useRef(null);

  // Ref to track if socket listeners have been initialized
  const listenersInitialized = useRef(false);

  // Refs so handlers always see current values without needing to re-create callbacks.
  const notificationsRef = useRef([]);
  const userIdRef = useRef(userId);

  // Module/global-level dedupe sets to persist across component remounts
  // (helps avoid duplicate toasts when component is remounted)
  const GLOBAL_PROCESSED_NOTIFICATION_KEYS = (globalThis.__GLOBAL_PROCESSED_NOTIFICATION_KEYS__ ||= new Set());
  const GLOBAL_PROCESSED_TOAST_KEYS = (globalThis.__GLOBAL_PROCESSED_TOAST_KEYS__ ||= new Set());
  const GLOBAL_PROCESSED_BROADCAST_DELETED = (globalThis.__GLOBAL_PROCESSED_BROADCAST_DELETED__ ||= new Set());

  // Map for processed keys to dedupe notifications within this instance
  const processedKeysRef = useRef(new Map());
  // Keep track of toasts already shown in this instance
  const processedToastKeysRef = useRef(new Set());
  // processed broadcasts to avoid duplicate broadcast:deleted toasts
  const processedBroadcastsRef = useRef(new Set());

  // helper to build a stable key for deduplication
  const getNotificationKey = (n) => {
    if (!n) return `gen-${Date.now()}-${Math.random()}`;
    if (n._id) return String(n._id);
    // fallback: type + title/message + sender + recipient + createdAt
    const parts = [
      n.type || "",
      n.title || n.message || "",
      n.sender || n.senderRole || "",
      n.recipient || userIdRef.current || "",
      n.createdAt ? String(n.createdAt) : ""
    ];
    return parts.join("|");
  };

  // add key to processed map and keep size bounded
  const markKeyProcessed = (key) => {
    const map = processedKeysRef.current;
    map.set(key, Date.now());
    // keep map size reasonable (evict oldest) - adjust threshold as needed
    const MAX = 1000;
    if (map.size > MAX) {
      const firstKey = map.keys().next().value;
      map.delete(firstKey);
    }
  };

  // normalize and add a notification (deduped). showToast controls whether we display toast.
  const addNotification = useCallback((rawNotification, showToast = true) => {
    if (!rawNotification) return false;
    const key = getNotificationKey(rawNotification);
    if (processedKeysRef.current.has(key) || GLOBAL_PROCESSED_NOTIFICATION_KEYS.has(key)) {
      // already handled this exact notification in this instance or globally
      return false;
    }

    // normalize object
    const _id = rawNotification._id || rawNotification.id || key || `gen-${Date.now()}-${Math.random()}`;
    const notification = {
      ...rawNotification,
      _id,
      read: !!rawNotification.read,
      createdAt: rawNotification.createdAt || new Date().toISOString()
    };

    // Insert at top (most recent first)
    setNotifications((prev) => {
      // Prevent duplicates in state as well
      if (prev.some((n) => n._id === notification._id)) return prev;
      const next = [notification, ...prev];
      return next;
    });

    markKeyProcessed(key);
    GLOBAL_PROCESSED_NOTIFICATION_KEYS.add(key);

    if (showToast) {
      // For admin broadcasts, prefer a generic toast and avoid duplicate toasts
      const isAdminMessage = notification.senderRole === 'admin' || notification.type === 'admin_message';
      const toastMsg = isAdminMessage ? "New Notification" : (notification.message || notification.title || "New notification");
      // Show toast asynchronously and dedupe by key both globally and locally
      setTimeout(() => {
        try {
          if (!processedToastKeysRef.current.has(key) && !GLOBAL_PROCESSED_TOAST_KEYS.has(key)) {
            processedToastKeysRef.current.add(key);
            GLOBAL_PROCESSED_TOAST_KEYS.add(key);
            import('../lib/toastManager').then(({ default: tm }) => tm.showSuccess(key, toastMsg));
          }
        } catch (e) {
          console.error('Toast error:', e);
        }
      }, 0);
    }

    return true;
  }, []);

  // Fetch all notifications from server, normalize, and populate processed keys so socket duplicates don't toast.
  const fetchAllAndCategorizeNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getUserNotifications({});
      const fetched = (res && res.notifications) || [];

      // Normalize and sort by createdAt desc
      const normalized = fetched.map((n) => ({
        ...n,
        _id: n._id || n.id || getNotificationKey(n),
        read: !!n.read,
        createdAt: n.createdAt || new Date().toISOString()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // populate processed keys so we don't double-handle notifications that already exist
      const map = processedKeysRef.current;
      normalized.forEach((n) => {
        const key = getNotificationKey(n);
        if (!map.has(key)) map.set(key, Date.now());
      });
      // Keep map size bounded
      if (map.size > 1000) {
        // simple fallback — create new Map of most recent 1000 keys
        const entries = Array.from(map.entries()).slice(-1000);
        processedKeysRef.current = new Map(entries);
      }

      setNotifications(normalized);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error(err?.message || "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // keep refs in sync with latest values for handlers
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // ---------- Socket handlers (use refs inside, so handlers are stable) ----------
  const handleNotificationReceived = useCallback((payload) => {
    console.log("[NotificationCenter] - Received new notification via socket:", payload);
    // payload may be the notification object; addNotification handles dedupe
    addNotification(payload, true);
  }, [addNotification]);

  const handleComplaintStatusUpdate = useCallback((update) => {
    console.log("[NotificationCenter] - Received complaintStatusUpdate via socket:", update);
    const newNotification = {
      _id: `status-${Date.now()}-${Math.random()}`,
      title: `Complaint status updated`,
      message: `Complaint '${update.title || update.complaintId}' status updated to '${update.newStatus || update.status}'.`,
      type: "statusUpdate",
      link: update.complaintId ? `/complaints/${update.complaintId}` : (update.link || ""),
      createdAt: new Date().toISOString(),
      read: false,
      senderRole: update.senderRole || "system"
    };
    addNotification(newNotification, true);
  }, [addNotification]);

  const handleComplaintLiked = useCallback((like) => {
    console.log("[NotificationCenter] - Received complaintLiked via socket:", like);
    const newNotification = {
      _id: `like-${Date.now()}-${Math.random()}`,
      title: "Complaint liked",
      message: `${like?.likedBy?.fullName || like?.senderName || "Someone"} liked your complaint '${like?.title || like?.complaintId || ""}'.`,
      type: "like",
      link: like?.complaintId ? `/complaints/${like.complaintId}` : "",
      createdAt: new Date().toISOString(),
      read: false
    };
    addNotification(newNotification, true);
  }, [addNotification]);

  const handleNewChatMessage = useCallback((message) => {
    // Ignore messages coming from the current user
    const senderId = message?.userId || message?.sender || message?.comment?.user?._id;
    console.log('[NotificationCenter] handleNewChatMessage - senderId:', senderId, 'userIdRef.current:', userIdRef.current);
    if (senderId && String(senderId) === String(userIdRef.current)) {
      console.log('[NotificationCenter] Ignoring own comment notification.');
      return;
    }

    console.log("[NotificationCenter] - Received newChatMessage via socket:", message);
    const newNotification = {
      _id: `comment-${Date.now()}-${Math.random()}`,
      title: "New comment",
      message: `${message?.fullName || message?.senderName || "Someone"} commented on a complaint.`,
      type: "comment",
      link: message?.complaintId ? `/complaints/${message.complaintId}` : "",
      createdAt: new Date().toISOString(),
      read: false
    };
    addNotification(newNotification, false); // No toast for others
  }, [addNotification]);

  const handleNotificationRead = useCallback(({ notificationId }) => {
    if (!notificationId) return;
    setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
  }, []);

  const handleAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleBroadcastDeleted = useCallback(({ broadcastId }) => {
    if (!broadcastId) return;
    // Deduplicate broadcast:deleted handling to avoid duplicate toast
    if (processedBroadcastsRef.current.has(String(broadcastId))) return;
    processedBroadcastsRef.current.add(String(broadcastId));

    // Use the notificationsRef to compute change outside of setState updater to avoid
    // triggering other component updates while rendering.
    const prev = notificationsRef.current || [];
    const next = prev.filter(n => String(n.broadcast) !== String(broadcastId));

    if (next.length === prev.length) {
      // nothing removed
      return;
    }

    // Update state with new list
    setNotifications(next);

    // Do not show a toast here to avoid duplicate toasts; AdminDashboard will handle global broadcast toasts
  }, []);

  const handleNotificationUnread = useCallback(({ notificationId }) => {
    if (!notificationId) return;
    setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: false } : n)));
  }, []);

  // ---------- Attach socket listeners safely (off before on) ----------
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket || listenersInitialized.current) return;
    listenersInitialized.current = true; // Mark as initialized

    // ensure we remove any previous listeners for these events (prevents duplicates)
    socket.on("notificationReceived", handleNotificationReceived);

    socket.on("complaint:statusUpdated", handleComplaintStatusUpdate);

    socket.on("like:toggled", handleComplaintLiked);

    // Support both real-time chat message and REST comment events
    socket.on("newChatMessage", handleNewChatMessage);
    socket.on("comment:added", handleNewChatMessage);

    socket.on("notificationRead", handleNotificationRead);

    socket.on("allNotificationsRead", handleAllNotificationsRead);

    socket.on("notificationUnread", handleNotificationUnread);

    socket.on("broadcast:deleted", handleBroadcastDeleted);

    return () => {
      socket.off("notificationReceived", handleNotificationReceived);
      socket.off("complaint:statusUpdated", handleComplaintStatusUpdate);
      socket.off("like:toggled", handleComplaintLiked);
      socket.off("newChatMessage", handleNewChatMessage);
      socket.off("comment:added", handleNewChatMessage);
      socket.off("notificationRead", handleNotificationRead);
      socket.off("allNotificationsRead", handleAllNotificationsRead);
      socket.off("notificationUnread", handleNotificationUnread);
      socket.off("broadcast:deleted", handleBroadcastDeleted);
      listenersInitialized.current = false; // Reset on cleanup
    };
    // we intentionally include handlers in deps so if someone re-defines them they'll rebind.
  }, [
    socket,
    handleNotificationReceived,
    handleComplaintStatusUpdate,
    handleComplaintLiked,
    handleNewChatMessage,
    handleNotificationRead,
    handleAllNotificationsRead,
    handleNotificationUnread,
    handleBroadcastDeleted
  ]);

  // fetch notifications on mount / when user changes
  useEffect(() => {
    fetchAllAndCategorizeNotifications();
  }, [fetchAllAndCategorizeNotifications]);

  // click-outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- UI actions ----------
  const toggleNotifications = () => setIsOpen((p) => !p);

  const markAsReadHandler = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
      toast.success("Notification marked as read.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to mark notification as read.");
    }
  };

  const markAsUnreadHandler = async (notificationId) => {
    try {
      await markNotificationAsUnread(notificationId);
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: false } : n)));
      toast.success("Notification marked as unread.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to mark notification as unread.");
    }
  };

  const deleteNotificationHandler = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to delete notification.");
    }
  };

  const handleNotificationClick = (notificationId, link) => {
    // keep UI behavior: don't auto mark read on click (existing logic) — just close
    setIsOpen(false);
  };

  // derive lists for counts & view
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const displayedNotifications = useMemo(() => {
    let list;
    if (filter === "unread" || filter === "all") list = notifications.filter((n) => !n.read);
    else if (filter === "read") list = notifications.filter((n) => n.read);
    else list = notifications;

    // dedupe by _id (should already be deduped, defensive)
    return list.filter((n, i, arr) => arr.findIndex((x) => x._id === n._id) === i);
  }, [filter, notifications]);

  const getIcon = (type) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="text-red-500 w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
      case "info":
      case "statusUpdate":
      case "like":
      case "comment":
      case "admin_message":
        return <Info className="text-blue-500 w-5 h-5" />;
      case "success":
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      default:
        return <Info className="text-gray-500 w-5 h-5" />;
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Bell Button */}
      <motion.button
        onClick={toggleNotifications}
        whileTap={{ scale: 0.95 }}
        className="group relative p-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br from-gray-50 to-gray-100 dark:hover:from-zinc-800 dark:hover:to-zinc-700  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-300 shadow-sm hover:shadow-lg backdrop-blur-sm border border-transparent hover:border-gray-200/50 dark:hover:border-zinc-600/50"
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Bell className="w-6 h-6 group-hover:scale-105 transition-transform duration-200" />
        </motion.div>

        {/* Animated Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg min-w-[1.25rem] h-5 animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[95vw] z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/20 dark:border-zinc-700/30 overflow-hidden transform translate-x-1/4 sm:translate-x-0"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200/30 dark:border-zinc-700/30 
                            bg-gradient-to-r from-transparent to-gray-50/30 
                            dark:from-transparent dark:to-zinc-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 
                                  rounded-xl flex items-center justify-center shadow-lg">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Notifications
                  </h3>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-zinc-700/70 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center bg-gradient-to-r from-gray-50/50 to-gray-100/50 
                            dark:from-zinc-800/50 dark:to-zinc-700/50 p-4 gap-2">
              {[
                { key: "all", label: "All", count: notifications.length },
                { key: "unread", label: "Unread", count: unreadCount },
                { key: "read", label: "Read", count: notifications.length - unreadCount }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${filter === tab.key
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-zinc-600/70 hover:shadow-sm"
                    }`}
                  onClick={() => setFilter(tab.key)}
                >
                  <span className="flex items-center justify-center space-x-1">
                    <span>{tab.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full
                                      ${filter === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-gray-200/50 dark:bg-zinc-600/50 text-gray-600 dark:text-gray-400"
                      }`}>
                      {tab.count}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full"
                    />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading notifications...</p>
                  </div>
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 
                                  dark:from-zinc-700 dark:to-zinc-600 rounded-full 
                                  flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    {filter === "unread" ? "All caught up!" : "Nothing to see here"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100/50 dark:divide-zinc-700/50">
                  {displayedNotifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative px-6 py-4 transition-all duration-300
                                  ${!notification.read
                          ? "bg-gradient-to-r from-blue-50/70 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20 border-l-4 border-blue-500"
                          : "hover:bg-gray-50/50 dark:hover:bg-zinc-800/50"
                        }`}
                    >
                      <Link
                        to={notification.link || "#"}
                        onClick={() => handleNotificationClick(notification._id, notification.link)}
                        className="block"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Icon with enhanced styling */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 
                                            dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center
                                            shadow-sm group-hover:shadow-md transition-shadow duration-200">
                              {getIcon(notification.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed pr-2">
                                  {notification.message || notification.title}
                                </p>

                                <div className="flex items-center space-x-3 mt-2">
                                  {notification.senderRole === "admin" && (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
                                      Admin
                                    </span>
                                  )}
                                  <time className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </time>
                                </div>
                              </div>

                              {/* Unread indicator */}
                              {!notification.read && (
                                <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                                                rounded-full shadow-sm mt-1 animate-pulse" />
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {filter === "all" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadHandler(notification._id);
                              }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Mark Read
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationHandler(notification._id);
                              }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Delete
                            </motion.button>
                          </>
                        )}
                        {filter === "unread" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadHandler(notification._id);
                              }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Mark Read
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationHandler(notification._id);
                              }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Delete
                            </motion.button>
                          </>
                        )}
                        {filter === "read" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationHandler(notification._id);
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            Delete
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #e5e7eb, #d1d5db);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #d1d5db, #9ca3af);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4b5563, #6b7280);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6b7280, #9ca3af);
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;