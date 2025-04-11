export const statusConfig = {
  Pending: { color: 'badge-warning', label: 'Pending' },
  Resolved: { color: 'badge-success', label: 'Resolved' },
  InProgress: { color: 'badge-info', label: 'In Progress' },
  Urgent: { color: 'badge-error', label: 'Urgent' },
};

export const initialComplaints = [
  {
    id: 1,
    title: "Payment Issue",
    author: "John Doe",
    date: new Date(2024, 11, 20), // December 20, 2024
    status: "Pending",
    likes: 12,
    isLiked: false,
    featured: false,
    description: "Users can't complete payments",
    comments: [
      { id: 1, author: "Tech Support", text: "We're investigating this issue", date: new Date() },
      { id: 2, author: "User123", text: "Having the same problem!", date: new Date() }
    ]
  },
  {
    id: 2,
    title: "Login Problem",
    author: "Jane Smith",
    date: new Date(),
    status: "Resolved",
    likes: 8,
    isLiked: false,
    featured: false,
    description: "Login fails with 2FA",
    comments: []
  },
  {
    id: 3,
    title: "Server Down - Critical!",
    author: "Sam Wilson",
    date: new Date(),
    status: "Urgent",
    likes: 15,
    isLiked: false,
    featured: false,
    description: "Production server is down affecting all users",
    comments: []
  },
  {
    id: 4,
    title: "Payment Issue",
    author: "John Doe",
    date: new Date(),
    status: "InProgress",
    likes: 12,
    isLiked: false,
    featured: false,
    description: "Users can't complete payments",
    comments: [
      { id: 1, author: "Tech Support", text: "We're investigating this issue", date: new Date() },
      { id: 2, author: "User123", text: "Having the same problem!", date: new Date() }
    ]
  },
  {
    id: 5,
    title: "Login Problem",
    author: "Jane Smith",
    date: new Date(),
    status: "Resolved",
    likes: 8,
    isLiked: false,
    featured: false,
    description: "Login fails with 2FA",
    comments: []
  },
  {
    id: 6,
    title: "Payment Issue",
    author: "John Doe",
    date: new Date(),
    status: "Pending",
    likes: 12,
    isLiked: false,
    featured: false,
    description: "Users can't complete payments",
    comments: [
      { id: 1, author: "Tech Support", text: "We're investigating this issue", date: new Date() },
      { id: 2, author: "User123", text: "Having the same problem!", date: new Date() }
    ]
  },
  {
    id: 7,
    title: "Login Problem",
    author: "Jane Smith",
    date: new Date(),
    status: "InProgress",
    likes: 8,
    isLiked: false,
    featured: false,
    description: "Login fails with 2FA",
    comments: []
  },
  {
    id: 8,
    title: "Payment Issue",
    author: "John Doe",
    date: new Date(),
    status: "Pending",
    likes: 12,
    isLiked: false,
    featured: false,
    description: "Users can't complete payments",
    comments: [
      { id: 1, author: "Tech Support", text: "We're investigating this issue", date: new Date() },
      { id: 2, author: "User123", text: "Having the same problem!", date: new Date() }
    ]
  },
  {
    id: 9,
    title: "Login Problem",
    author: "Jane Smith",
    date: new Date(),
    status: "Resolved",
    likes: 8,
    isLiked: false,
    featured: false,
    description: "Login fails with 2FA",
    comments: []
  },
  {
    id: 10,
    title: "Plumbing ",
    author: "Sam Wilson",
    date: new Date(),
    status: "Urgent",
    likes: 15,
    isLiked: false,
    featured: false,
    description: "Production server is down affecting all users",
    comments: []
  },
  {
    id: 11,
    title: "Waste Management",
    author: "Sam Wilson",
    date: new Date(),
    status: "Urgent",
    likes: 15,
    isLiked: false,
    featured: false,
    description: "Production server is down affecting all users",
    comments: []
  },
];