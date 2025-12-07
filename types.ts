
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  PROFILE = 'PROFILE',
  ELECTIONS = 'ELECTIONS',
  ISSUES = 'ISSUES',
  ADMIN = 'ADMIN',
  CHAT = 'CHAT'
}

export interface NavItem {
  id: AppView;
  label: string;
  icon: string; // Material symbol name
}

export enum Language {
  ENGLISH = 'EN',
  GUJARATI = 'GU',
  URDU = 'UR'
}

export enum UserRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum NewsCategory {
  GENERAL = 'General',
  MEETING = 'Meeting',
  EVENT = 'Event',
  EMERGENCY = 'Emergency',
  DEATH_ANNOUNCEMENT = 'Death Announcement'
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: NewsCategory;
  date: string;
  author: string;
  allowComments: boolean;
  comments: Comment[];
  type?: string;
  imageUrl?: string;
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  email: string;
  firstName: string; // Changed from fullName
  lastName: string;  // Changed from fullName
  mobile: string;
  dob: string;
  age: number;
  area: string;
  isVoter: boolean;
  status: UserStatus;
  role: UserRole;
}

export interface Candidate {
  id: string;
  name: string;
  symbol: string; // Emoji or icon name
  votes: number;
}

export enum ElectionStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export interface Election {
  id: string;
  title: string;
  status: ElectionStatus;
  candidates: Candidate[];
  totalVotes: number;
  userHasVoted: boolean;
}

export interface SurveyOption {
  id: string;
  text: string;
  votes: number;
}

export enum SurveyType {
  POLL = 'POLL',
  EXTERNAL_LINK = 'EXTERNAL_LINK'
}

export interface Survey {
  id: string;
  question: string;
  type: SurveyType;
  options?: SurveyOption[];
  externalLink?: string;
  isActive: boolean;
  totalVotes: number;
  votedUserIds: string[]; // Emails of users who voted
  createdAt: string;
  endTime?: string; // ISO string for expiration
}

export enum IssueCategory {
  EDUCATION = 'Education',
  JOBS = 'Jobs',
  WELFARE = 'Welfare',
  MOSQUE = 'Mosque',
  INFRASTRUCTURE = 'Infrastructure',
  OTHER = 'Other'
}

export enum IssueStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected'
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  authorName: string;
  authorId: string; // Email
  timestamp: string;
  upvotes: number;
  upvotedBy: string[]; // List of Emails who upvoted
  status: IssueStatus;
  adminResponse?: string;
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  VOTE = 'VOTE',
  POST = 'POST',
  ISSUE = 'ISSUE',
  REGISTER = 'REGISTER',
  MODERATION = 'MODERATION'
}

export interface ActivityLog {
  id: string;
  userId: string; // Email
  userName: string;
  action: string;
  timestamp: string;
  type: ActivityType;
}

export enum MessageType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content?: string; // For text
  mediaUrl?: string; // For audio/video
  mediaType: MessageType;
  timestamp: string;
  isMe: boolean;
  status?: MessageStatus;
}
