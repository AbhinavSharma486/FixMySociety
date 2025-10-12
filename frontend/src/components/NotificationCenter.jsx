import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  deleteNotification,
} from "../lib/notificationService";

// Memoized icon components to prevent re-renders
const NotificationIcon = React.memo(({ type }) => {
  switch (type) {
    case "emergency":
    case "warning":
      return <AlertTriangle className="w-5 h-5" />;
    case "success":
      return <CheckCircle className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
});

// Memoized individual notification item
const NotificationItem = React.memo(
  ({
    notification,
    index,
    filter,
    onMarkAsRead,
    onMarkAsUnread,
    onDelete,
    onClick,
    getIconGradient,
  }) => {
    const handleMarkAsRead = useCallback(
      (e) => {
        e.stopPropagation();
        onMarkAsRead(notification._id);
      },
      [notification._id, onMarkAsRead]
    );

    const handleDelete = useCallback(
      (e) => {
        e.stopPropagation();
        onDelete(notification._id);
      },
      [notification._id, onDelete]
    );

    const handleClick = useCallback(() => {
      onClick(notification._id, notification.link);
    }, [notification._id, notification.link, onClick]);

    return (
      <motion.div
        key={notification._id}
        initial={{ opacity: 0, x: -30, rotateX: -10 }}
        animate={{ opacity: 1, x: 0, rotateX: 0 }}
        transition={{
          delay: Math.min(index * 0.04, 0.4),
          type: "spring",
          stiffness: 400,
          damping: 28,
        }}
        whileHover={{ scale: 1.01 }}
        className={`group relative px-6 py-4 transition-all duration-300
                  ${
                    !notification.read
                      ? "bg-gradient-to-r from-blue-50/80 via-blue-50/50 to-transparent dark:from-blue-950/40 dark:via-blue-900/20 dark:to-transparent"
                      : "hover:bg-gray-50/60 dark:hover:bg-zinc-800/40"
                  }`}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      >
        {!notification.read && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            animate={{
              opacity: [0.6, 1, 0.6],
              boxShadow: [
                "0 0 15px rgba(59,130,246,0.6)",
                "0 0 25px rgba(59,130,246,0.8)",
                "0 0 15px rgba(59,130,246,0.6)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <Link
          to={notification.link || "#"}
          onClick={handleClick}
          className="block"
        >
          <div className="flex items-start space-x-4">
            <motion.div
              className="flex-shrink-0 mt-0.5"
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <div
                className={`relative w-11 h-11 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-shadow duration-300`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getIconGradient(
                    notification.type
                  )}`}
                />
                <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <NotificationIcon type={notification.type} />
                </div>
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{
                    backgroundPosition: ["-200% 0", "200% 0"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.3,
                  }}
                />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed pr-2 line-clamp-2  group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {notification.message || notification.title}
                  </p>

                  <div className="flex items-center flex-wrap gap-2.5 mt-2.5">
                    {notification.senderRole === "admin" && (
                      <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                        }}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-xl
                                 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500
                                 text-white shadow-[0_4px_12px_rgba(168,85,247,0.4)]
                                 backdrop-blur-sm"
                      >
                        <span className="relative">
                          Admin
                          <motion.span
                            className="absolute inset-0 bg-white/20 rounded-xl"
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </span>
                      </motion.span>
                    )}
                    <time
                      className="text-xs text-gray-500 dark:text-gray-400 font-medium
                                 bg-gray-100/70 dark:bg-zinc-700/50 px-2.5 py-1 rounded-lg
                                 backdrop-blur-sm"
                    >
                      {new Date(notification.createdAt).toLocaleString()}
                    </time>
                  </div>
                </div>

                {!notification.read && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 10px rgba(59,130,246,0.4)",
                        "0 0 20px rgba(59,130,246,0.6)",
                        "0 0 10px rgba(59,130,246,0.4)",
                      ],
                    }}
                    transition={{
                      scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-500
                             rounded-full shadow-lg mt-1 flex-shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-end gap-2 mt-4 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {filter === "all" && (
            <>
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleMarkAsRead}
                className="relative px-3.5 py-2 text-xs font-bold rounded-xl
                         text-white overflow-hidden
                         shadow-[0_4px_14px_rgba(34,197,94,0.35)]
                         hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)]
                         transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="absolute inset-[1px] bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl" />
                <span className="relative z-10">Mark Read</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleDelete}
                className="relative px-3.5 py-2 text-xs font-bold rounded-xl
                         text-white overflow-hidden
                         shadow-[0_4px_14px_rgba(239,68,68,0.35)]
                         hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)]
                         transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500" />
                <div className="absolute inset-[1px] bg-gradient-to-r from-red-400 to-rose-400 rounded-xl" />
                <span className="relative z-10">Delete</span>
              </motion.button>
            </>
          )}
          {filter === "unread" && (
            <>
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleMarkAsRead}
                className="relative px-3.5 py-2 text-xs font-bold rounded-xl
                         text-white overflow-hidden
                         shadow-[0_4px_14px_rgba(34,197,94,0.35)]
                         hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)]
                         transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="absolute inset-[1px] bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl" />
                <span className="relative z-10">Mark Read</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleDelete}
                className="relative px-3.5 py-2 text-xs font-bold rounded-xl
                         text-white overflow-hidden
                         shadow-[0_4px_14px_rgba(239,68,68,0.35)]
                         hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)]
                         transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500" />
                <div className="absolute inset-[1px] bg-gradient-to-r from-red-400 to-rose-400 rounded-xl" />
                <span className="relative z-10">Delete</span>
              </motion.button>
            </>
          )}
          {filter === "read" && (
            <motion.button
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleDelete}
              className="relative px-3.5 py-2 text-xs font-bold rounded-xl
                       text-white overflow-hidden
                       shadow-[0_4px_14px_rgba(239,68,68,0.35)]
                       hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)]
                       transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500" />
              <div className="absolute inset-[1px] bg-gradient-to-r from-red-400 to-rose-400 rounded-xl" />
              <span className="relative z-10">Delete</span>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.notification._id === nextProps.notification._id &&
      prevProps.notification.read === nextProps.notification.read &&
      prevProps.filter === nextProps.filter &&
      prevProps.index === nextProps.index
    );
  }
);

const NotificationCenter = () => {
  const { currentUser } = useSelector((s) => s.user);
  const { admin } = useSelector((s) => s.admin);
  const userId = currentUser?._id || admin?._id || null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const notificationRef = useRef(null);
  const listenersInitialized = useRef(false);
  const notificationsRef = useRef([]);
  const userIdRef = useRef(userId);

  const GLOBAL_PROCESSED_NOTIFICATION_KEYS =
    (globalThis.__GLOBAL_PROCESSED_NOTIFICATION_KEYS__ ||= new Set());
  const GLOBAL_PROCESSED_TOAST_KEYS =
    (globalThis.__GLOBAL_PROCESSED_TOAST_KEYS__ ||= new Set());
  const GLOBAL_PROCESSED_BROADCAST_DELETED =
    (globalThis.__GLOBAL_PROCESSED_BROADCAST_DELETED__ ||= new Set());

  const processedKeysRef = useRef(new Map());
  const processedToastKeysRef = useRef(new Set());
  const processedBroadcastsRef = useRef(new Set());

  // Memoize helper functions
  const getNotificationKey = useCallback((n) => {
    if (!n) return `gen-${Date.now()}-${Math.random()}`;
    if (n._id) return String(n._id);
    const parts = [
      n.type || "",
      n.title || n.message || "",
      n.sender || n.senderRole || "",
      n.recipient || userIdRef.current || "",
      n.createdAt ? String(n.createdAt) : "",
    ];
    return parts.join("|");
  }, []);

  const markKeyProcessed = useCallback((key) => {
    const map = processedKeysRef.current;
    map.set(key, Date.now());
    const MAX = 1000;
    if (map.size > MAX) {
      const firstKey = map.keys().next().value;
      map.delete(firstKey);
    }
  }, []);

  const addNotification = useCallback(
    (rawNotification, showToast = true) => {
      if (!rawNotification) return false;
      const key = getNotificationKey(rawNotification);
      if (
        processedKeysRef.current.has(key) ||
        GLOBAL_PROCESSED_NOTIFICATION_KEYS.has(key)
      ) {
        return false;
      }

      const _id =
        rawNotification._id ||
        rawNotification.id ||
        key ||
        `gen-${Date.now()}-${Math.random()}`;
      const notification = {
        ...rawNotification,
        _id,
        read: !!rawNotification.read,
        createdAt: rawNotification.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });

      markKeyProcessed(key);
      GLOBAL_PROCESSED_NOTIFICATION_KEYS.add(key);

      if (showToast) {
        const isAdminMessage =
          notification.senderRole === "admin" ||
          notification.type === "admin_message";
        const toastMsg = isAdminMessage
          ? "New Notification"
          : notification.message || notification.title || "New notification";
        setTimeout(() => {
          try {
            if (
              !processedToastKeysRef.current.has(key) &&
              !GLOBAL_PROCESSED_TOAST_KEYS.has(key)
            ) {
              processedToastKeysRef.current.add(key);
              GLOBAL_PROCESSED_TOAST_KEYS.add(key);
              import("../lib/toastManager").then(({ default: tm }) =>
                tm.showSuccess(key, toastMsg)
              );
            }
          } catch (e) {
            console.error("Toast error:", e);
          }
        }, 0);
      }

      return true;
    },
    [getNotificationKey, markKeyProcessed]
  );

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

      const normalized = fetched
        .map((n) => ({
          ...n,
          _id: n._id || n.id || getNotificationKey(n),
          read: !!n.read,
          createdAt: n.createdAt || new Date().toISOString(),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const map = processedKeysRef.current;
      normalized.forEach((n) => {
        const key = getNotificationKey(n);
        if (!map.has(key)) map.set(key, Date.now());
      });
      if (map.size > 1000) {
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
  }, [userId, getNotificationKey]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const handleNotificationReceived = useCallback(
    (payload) => {
      console.log(
        "[NotificationCenter] - Received new notification via socket:",
        payload
      );
      addNotification(payload, true);
    },
    [addNotification]
  );

  const handleComplaintStatusUpdate = useCallback(
    (update) => {
      console.log(
        "[NotificationCenter] - Received complaintStatusUpdate via socket:",
        update
      );
      const newNotification = {
        _id: `status-${Date.now()}-${Math.random()}`,
        title: `Complaint status updated`,
        message: `Complaint '${
          update.title || update.complaintId
        }' status updated to '${update.newStatus || update.status}'.`,
        type: "statusUpdate",
        link: update.complaintId
          ? `/complaints/${update.complaintId}`
          : update.link || "",
        createdAt: new Date().toISOString(),
        read: false,
        senderRole: update.senderRole || "system",
      };
      addNotification(newNotification, true);
    },
    [addNotification]
  );

  const handleComplaintLiked = useCallback(
    (like) => {
      console.log(
        "[NotificationCenter] - Received complaintLiked via socket:",
        like
      );
      const newNotification = {
        _id: `like-${Date.now()}-${Math.random()}`,
        title: "Complaint liked",
        message: `${
          like?.likedBy?.fullName || like?.senderName || "Someone"
        } liked your complaint '${like?.title || like?.complaintId || ""}'.`,
        type: "like",
        link: like?.complaintId ? `/complaints/${like.complaintId}` : "",
        createdAt: new Date().toISOString(),
        read: false,
      };
      addNotification(newNotification, true);
    },
    [addNotification]
  );

  const handleNewChatMessage = useCallback(
    (message) => {
      const senderId =
        message?.userId || message?.sender || message?.comment?.user?._id;
      console.log(
        "[NotificationCenter] handleNewChatMessage - senderId:",
        senderId,
        "userIdRef.current:",
        userIdRef.current
      );
      if (senderId && String(senderId) === String(userIdRef.current)) {
        console.log("[NotificationCenter] Ignoring own comment notification.");
        return;
      }

      console.log(
        "[NotificationCenter] - Received newChatMessage via socket:",
        message
      );
      const newNotification = {
        _id: `comment-${Date.now()}-${Math.random()}`,
        title: "New comment",
        message: `${
          message?.fullName || message?.senderName || "Someone"
        } commented on a complaint.`,
        type: "comment",
        link: message?.complaintId ? `/complaints/${message.complaintId}` : "",
        createdAt: new Date().toISOString(),
        read: false,
      };
      addNotification(newNotification, false);
    },
    [addNotification]
  );

  const handleNotificationRead = useCallback(({ notificationId }) => {
    if (!notificationId) return;
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const handleAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleBroadcastDeleted = useCallback(({ broadcastId }) => {
    if (!broadcastId) return;
    if (processedBroadcastsRef.current.has(String(broadcastId))) return;
    processedBroadcastsRef.current.add(String(broadcastId));

    const prev = notificationsRef.current || [];
    const next = prev.filter(
      (n) => String(n.broadcast) !== String(broadcastId)
    );

    if (next.length === prev.length) {
      return;
    }

    setNotifications(next);
  }, []);

  const handleNotificationUnread = useCallback(({ notificationId }) => {
    if (!notificationId) return;
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: false } : n))
    );
  }, []);

  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket || listenersInitialized.current) return;
    listenersInitialized.current = true;

    socket.on("notificationReceived", handleNotificationReceived);
    socket.on("complaint:statusUpdated", handleComplaintStatusUpdate);
    socket.on("like:toggled", handleComplaintLiked);
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
      listenersInitialized.current = false;
    };
  }, [
    socket,
    handleNotificationReceived,
    handleComplaintStatusUpdate,
    handleComplaintLiked,
    handleNewChatMessage,
    handleNotificationRead,
    handleAllNotificationsRead,
    handleNotificationUnread,
    handleBroadcastDeleted,
  ]);

  useEffect(() => {
    fetchAllAndCategorizeNotifications();
  }, [fetchAllAndCategorizeNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotifications = useCallback(() => setIsOpen((p) => !p), []);

  const markAsReadHandler = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      toast.success("Notification marked as read.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to mark notification as read.");
    }
  }, []);

  const markAsUnreadHandler = useCallback(async (notificationId) => {
    try {
      await markNotificationAsUnread(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: false } : n))
      );
      toast.success("Notification marked as unread.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to mark notification as unread.");
    }
  }, []);

  const deleteNotificationHandler = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to delete notification.");
    }
  }, []);

  const handleNotificationClick = useCallback((notificationId, link) => {
    setIsOpen(false);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const displayedNotifications = useMemo(() => {
    let list;
    if (filter === "unread" || filter === "all")
      list = notifications.filter((n) => !n.read);
    else if (filter === "read") list = notifications.filter((n) => n.read);
    else list = notifications;

    return list.filter(
      (n, i, arr) => arr.findIndex((x) => x._id === n._id) === i
    );
  }, [filter, notifications]);

  // Memoize gradient function
  const getIconGradient = useCallback((type) => {
    switch (type) {
      case "emergency":
        return "from-red-500 via-red-600 to-pink-600";
      case "warning":
        return "from-yellow-400 via-orange-500 to-red-500";
      case "statusUpdate":
        return "from-blue-500 via-cyan-500 to-teal-500";
      case "like":
        return "from-pink-500 via-rose-500 to-red-500";
      case "comment":
        return "from-purple-500 via-violet-500 to-indigo-500";
      case "admin_message":
        return "from-purple-600 via-fuchsia-600 to-pink-600";
      case "success":
        return "from-green-500 via-emerald-500 to-teal-500";
      default:
        return "from-blue-500 via-indigo-500 to-purple-500";
    }
  }, []);

  // Memoize tab data
  const filterTabs = useMemo(
    () => [
      {
        key: "all",
        label: "All",
        count: notifications.length,
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        key: "unread",
        label: "Unread",
        count: unreadCount,
        gradient: "from-purple-500 to-pink-500",
      },
      {
        key: "read",
        label: "Read",
        count: notifications.length - unreadCount,
        gradient: "from-green-500 to-emerald-500",
      },
    ],
    [notifications.length, unreadCount]
  );

  return (
    <div className="relative" ref={notificationRef}>
      <motion.button
        onClick={toggleNotifications}
        whileTap={{ scale: 0.92 }}
        className="group relative p-3.5 rounded-2xl overflow-hidden
                   bg-gradient-to-br from-white/80 via-white/60 to-white/40
                   dark:from-zinc-800/80 dark:via-zinc-800/60 dark:to-zinc-900/40
                   backdrop-blur-xl border border-white/40 dark:border-zinc-700/40
                   shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                   hover:shadow-[0_12px_48px_rgba(59,130,246,0.25)] dark:hover:shadow-[0_12px_48px_rgba(59,130,246,0.4)]
                   transition-all duration-500 ease-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2
                   focus:ring-offset-transparent"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0
                     group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10
                     transition-all duration-700"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 55%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="relative z-10"
          animate={
            unreadCount > 0
              ? {
                  rotate: [0, -12, 12, -8, 8, 0],
                  scale: [1, 1.05, 1, 1.05, 1],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Bell
            className="w-6 h-6 text-gray-700 dark:text-gray-200 
                           group-hover:text-blue-600 dark:group-hover:text-blue-400
                           transition-colors duration-300
                           drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
          />
        </motion.div>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -top-1.5 -right-1.5 z-20
                         inline-flex items-center justify-center
                         px-2 py-1 min-w-[1.4rem] h-5.5
                         text-xs font-bold text-white
                         bg-gradient-to-r from-red-500 via-pink-500 to-rose-500
                         rounded-full
                         shadow-[0_0_20px_rgba(239,68,68,0.6),0_0_40px_rgba(239,68,68,0.3)]
                         ring-2 ring-white/50 dark:ring-zinc-900/50
                         backdrop-blur-sm"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-blue-500/0
                     group-hover:border-blue-500/30 transition-all duration-500"
          animate={
            isOpen
              ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0, 0.5],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -20, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -20, rotateX: -15 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              mass: 0.8,
            }}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
            className="absolute right-0 mt-4 w-80 sm:w-[28rem] max-w-[95vw] z-50
                       overflow-hidden transform translate-x-1/4 sm:translate-x-0"
          >
            <div
              className="relative rounded-[2rem] 
                           bg-gradient-to-br from-white/90 via-white/80 to-white/70
                           dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/90
                           backdrop-blur-2xl
                           border border-white/50 dark:border-zinc-700/50
                           shadow-[0_20px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.1)_inset]
                           dark:shadow-[0_20px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]
                           overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 opacity-30 dark:opacity-20"
                style={{
                  background:
                    "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.15) 0%, transparent 50%)",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div
                className="relative px-6 py-5 border-b border-white/30 dark:border-zinc-700/30
                              backdrop-blur-xl overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r 
                                from-blue-500/5 via-purple-500/5 to-pink-500/5
                                dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <motion.div
                      className="relative w-10 h-10 rounded-2xl overflow-hidden
                                 shadow-[0_8px_24px_rgba(59,130,246,0.3)]"
                      whileHover={{ scale: 1.08, rotate: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600" />
                      <div className="absolute inset-[1px] bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                      </div>
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
                          backgroundSize: "200% 100%",
                        }}
                        animate={{
                          backgroundPosition: ["-200% 0", "200% 0"],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </motion.div>

                    <div>
                      <h3
                        className="text-xl font-bold bg-gradient-to-r 
                                   from-gray-900 via-gray-800 to-gray-700
                                   dark:from-white dark:via-gray-100 dark:to-gray-300
                                   bg-clip-text text-transparent
                                   drop-shadow-sm"
                      >
                        Notifications
                      </h3>
                      <motion.div
                        className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.12, rotate: 90 }}
                    whileTap={{ scale: 0.88 }}
                    className="relative p-2.5 rounded-xl
                               bg-white/50 dark:bg-zinc-800/50
                               backdrop-blur-xl
                               border border-white/40 dark:border-zinc-700/40
                               text-gray-600 hover:text-gray-900
                               dark:text-gray-400 dark:hover:text-gray-100
                               shadow-lg hover:shadow-xl
                               transition-all duration-300
                               group"
                  >
                    <X className="w-5 h-5 relative z-10" />
                    <div
                      className="absolute inset-0 rounded-xl bg-gradient-to-br 
                                    from-red-500/0 to-pink-500/0
                                    group-hover:from-red-500/10 group-hover:to-pink-500/10
                                    transition-all duration-300"
                    />
                  </motion.button>
                </div>
              </div>

              <div
                className="relative px-5 py-4 
                              bg-gradient-to-br from-gray-50/80 to-gray-100/60
                              dark:from-zinc-800/60 dark:to-zinc-900/40
                              backdrop-blur-xl border-b border-white/20 dark:border-zinc-700/20"
              >
                <div className="relative flex gap-2">
                  {filterTabs.map((tab, idx) => (
                    <motion.button
                      key={tab.key}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex-1 px-4 py-3 text-sm font-semibold rounded-2xl
                                  transition-all duration-500 overflow-hidden
                                  ${
                                    filter === tab.key
                                      ? "text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                  }`}
                      onClick={() => setFilter(tab.key)}
                    >
                      {filter === tab.key && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 bg-gradient-to-br ${tab.gradient}
                                      rounded-2xl`}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      {filter !== tab.key && (
                        <div
                          className="absolute inset-0 bg-white/60 dark:bg-zinc-700/40
                                        backdrop-blur-sm rounded-2xl
                                        border border-white/40 dark:border-zinc-600/40"
                        />
                      )}

                      {filter !== tab.key && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${tab.gradient}
                                      opacity-0 hover:opacity-10 transition-opacity duration-300
                                      rounded-2xl`}
                        />
                      )}

                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>{tab.label}</span>
                        <motion.span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold
                                      ${
                                        filter === tab.key
                                          ? "bg-white/25 text-white backdrop-blur-sm"
                                          : "bg-gray-200/70 dark:bg-zinc-600/60 text-gray-700 dark:text-gray-300"
                                      }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                            delay: idx * 0.05,
                          }}
                        >
                          {tab.count}
                        </motion.span>
                      </span>

                      {filter === tab.key && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background:
                              "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
                            backgroundSize: "200% 100%",
                          }}
                          animate={{
                            backgroundPosition: ["-200% 0", "200% 0"],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div
                className="max-h-96 overflow-y-auto overflow-x-hidden
                              scrollbar-thin scrollbar-track-transparent 
                              scrollbar-thumb-gray-300/50 dark:scrollbar-thumb-zinc-600/50
                              hover:scrollbar-thumb-gray-400/70 dark:hover:scrollbar-thumb-zinc-500/70
                              scroll-smooth"
                style={{
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="relative w-16 h-16">
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-blue-500/20"
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear",
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500"
                          animate={{ rotate: -360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                        />
                        <motion.div
                          className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut",
                          }}
                        />
                      </div>
                      <motion.p
                        className="text-gray-600 dark:text-gray-400 text-sm font-semibold"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        Loading notifications...
                      </motion.p>
                    </div>
                  </div>
                ) : displayedNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <motion.div
                      initial={{ scale: 0, rotateY: -180 }}
                      animate={{ scale: 1, rotateY: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      className="relative w-20 h-20 mb-6"
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300
                                      dark:from-zinc-700 dark:to-zinc-600 rounded-3xl
                                      shadow-[0_10px_40px_rgba(0,0,0,0.1)]
                                      transform rotate-6"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200
                                      dark:from-zinc-600 dark:to-zinc-700 rounded-3xl
                                      shadow-[0_10px_40px_rgba(0,0,0,0.15)]
                                      flex items-center justify-center"
                      >
                        <Bell className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      </div>
                    </motion.div>
                    <motion.h4
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      No notifications
                    </motion.h4>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-500 dark:text-gray-400 text-sm"
                    >
                      {filter === "unread"
                        ? "All caught up! 🎉"
                        : "Nothing to see here"}
                    </motion.p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100/50 dark:divide-zinc-700/30">
                    {displayedNotifications.map((notification, index) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        index={index}
                        filter={filter}
                        onMarkAsRead={markAsReadHandler}
                        onMarkAsUnread={markAsUnreadHandler}
                        onDelete={deleteNotificationHandler}
                        onClick={handleNotificationClick}
                        getIconGradient={getIconGradient}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
