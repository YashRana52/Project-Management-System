import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAllNotification,
  deleteNotification,
  getNotification,
  markAllAsRead,
  markAsRead,
} from "../../store/slices/notificationSlice";
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock5,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.list);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  useEffect(() => {
    dispatch(getNotification());
  }, [dispatch]);

  const markAsReadHandler = (id) => dispatch(markAsRead(id));

  const markAllReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = (id) => dispatch(deleteNotification(id));

  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;

      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;

      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;

      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;

      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;

      default:
        // Custom combined icon (User + Down Arrow)
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute" />
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-1-red-500";

      case "medium":
        return "border-1-yellow-500";

      case "low":
        return "border-1-green-500";

      default:
        return "border-1-slate-300";
    }
  };

  const formateDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((n) => {
        const notifDate = new Date(n.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title">Notifications</h1>
                <p className="card-subtitle">
                  Stay updated with your project progress deadline
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  className="btn-outline btn-small"
                  onClick={markAllReadHandler}
                >
                  Mark All as read {unreadCount}
                </button>
              )}
            </div>
          </div>

          {/* NOTIFICATION STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((item, i) => (
              <div key={i} className={`${item.bg} rounded-lg p-4`}>
                <div className="flex items-center">
                  <div className={`p-2 ${item.iconBg} rounded-lg`}>
                    <item.Icon className={`w-5 h-5 ${item.textColor} `} />
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium text-sm ${item.titleColor}`}>
                      {item.title}
                    </p>
                    <p className={`text-sm font-medium ${item.valueColor}`}>
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SHOW NOTIFICATIONS */}
          <div className="space-y-4">
            {notifications.map((noti) => (
              <div
                key={noti._id}
                className={`rounded-xl border p-4 transition-all duration-300
        ${getPriorityColor(noti.priority)}
        ${!noti.isRead ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-slate-50"}
      `}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotification(noti.type)}</div>

                    <div className="flex items-center space-x-2">
                      <h3
                        className={`font-semibold flex items-center gap-2
                ${!noti.isRead ? "text-slate-900" : "text-slate-700"}
              `}
                      >
                        {noti.title}
                        {!noti.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {formateDate(noti.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <span
                    className={`badge capitalize text-xs
            ${
              noti.priority === "high"
                ? "badge-rejected"
                : noti.priority === "medium"
                  ? "badge-pending"
                  : "badge-approved"
            }
          `}
                  >
                    {noti.priority}
                  </span>
                </div>

                {/* Message */}
                <div className="mt-3 bg-white/70 rounded-lg p-3">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {noti.message}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full capitalize
            ${
              noti.type === "feedback"
                ? "bg-blue-100 text-blue-800"
                : noti.type === "deadline"
                  ? "bg-red-100 text-red-800"
                  : noti.type === "approval"
                    ? "bg-green-100 text-green-800"
                    : noti.type === "meeting"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
            }
          `}
                  >
                    {noti.type}
                  </span>

                  <div className="flex items-center gap-4 text-sm">
                    {!noti.isRead && (
                      <button
                        onClick={() => markAsReadHandler(noti._id)}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotificationHandler(noti._id)}
                      className="text-red-600 hover:text-red-500 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center text-slate-300">
                <User className="w-12 h-12" />
                <Bell className="w-8 h-8 absolute top-10" />
              </div>
              <p className="text-slate-500">
                {" "}
                We’ll notify you when something new arrives
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
