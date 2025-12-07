
import React, { useState, useRef } from 'react';
import { Announcement, NewsCategory, User, UserRole, Comment, Language } from '../types';
import { translations } from '../services/translations';

interface NewsFeedProps {
  user: User;
  language: Language;
  posts: Announcement[];
  onUpdatePosts: (posts: Announcement[]) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ user, language, posts, onUpdatePosts }) => {
  const t = translations[language];
  const [activeFilter, setActiveFilter] = useState<NewsCategory | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NewsCategory>(NewsCategory.GENERAL);
  const [allowComments, setAllowComments] = useState(true);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const postFileInputRef = useRef<HTMLInputElement>(null);

  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [commentImages, setCommentImages] = useState<{ [postId: string]: string | null }>({});
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const hasWriteAccess = user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;

  const getCategoryLabel = (cat: NewsCategory | 'ALL') => {
    if (cat === 'ALL') return t.filterAll;
    switch (cat) {
      case NewsCategory.GENERAL: return t.catGeneral;
      case NewsCategory.MEETING: return t.catMeeting;
      case NewsCategory.EVENT: return t.catEvent;
      case NewsCategory.EMERGENCY: return t.catEmergency;
      case NewsCategory.DEATH_ANNOUNCEMENT: return t.catDeath;
      default: return cat;
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePostImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setNewPostImage(base64);
    }
  };

  const handleCommentImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeCommentPostId) {
      const base64 = await fileToBase64(e.target.files[0]);
      setCommentImages(prev => ({ ...prev, [activeCommentPostId]: base64 }));
      setActiveCommentPostId(null);
    }
  };

  const triggerCommentFileInput = (postId: string) => {
    setActiveCommentPostId(postId);
    setTimeout(() => commentFileInputRef.current?.click(), 0);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: Announcement = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      category: newCategory,
      date: 'Just now',
      author: user.role === UserRole.ADMIN ? 'Admin' : `Moderator (${user.firstName} ${user.lastName})`,
      allowComments: allowComments,
      comments: [],
      imageUrl: newPostImage || undefined
    };
    onUpdatePosts([newPost, ...posts]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewContent('');
    setNewCategory(NewsCategory.GENERAL);
    setNewPostImage(null);
  };

  const handleAddComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    const image = commentImages[postId];

    if (!text && !image) return;
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments, 
            {
              id: Date.now().toString(),
              userId: user.email,
              userName: `${user.firstName} ${user.lastName}`,
              content: text || '',
              timestamp: 'Just now',
              imageUrl: image || undefined
            }
          ]
        };
      }
      return post;
    });
    onUpdatePosts(updatedPosts);
    setCommentText({ ...commentText, [postId]: '' });
    setCommentImages({ ...commentImages, [postId]: null });
  };

  const filteredPosts = activeFilter === 'ALL' 
    ? posts 
    : posts.filter(p => p.category === activeFilter);

  const getCategoryStyles = (cat: NewsCategory) => {
    switch (cat) {
      case NewsCategory.EMERGENCY:
        return 'bg-red-50 border-red-200 text-red-800 border-l-4 border-l-red-500 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300';
      case NewsCategory.DEATH_ANNOUNCEMENT:
        return 'bg-gray-50 border-gray-300 text-gray-800 border-l-4 border-l-black dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300';
      case NewsCategory.MEETING:
        return 'bg-blue-50 border-blue-200 text-blue-800 border-l-4 border-l-blue-500 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-300';
      case NewsCategory.EVENT:
        return 'bg-green-50 border-green-200 text-green-800 border-l-4 border-l-green-500 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300';
      default:
        return 'bg-white border-gray-100 text-gray-800 border-l-4 border-l-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200';
    }
  };

  const getIcon = (cat: NewsCategory) => {
    switch (cat) {
      case NewsCategory.EMERGENCY: return 'warning';
      case NewsCategory.DEATH_ANNOUNCEMENT: return 'nightlight_round';
      case NewsCategory.MEETING: return 'groups';
      case NewsCategory.EVENT: return 'calendar_month';
      default: return 'article';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 relative transition-colors">
      <input 
        type="file" 
        ref={commentFileInputRef}
        onChange={handleCommentImageSelect}
        accept="image/*"
        className="hidden"
      />

      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{language === Language.URDU ? 'کمیونٹی نیوز' : 'Community News'}</h2>
            {hasWriteAccess && (
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg flex items-center shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm mr-1">add_circle</span>
                    {language === Language.URDU ? 'پوسٹ بنائیں' : 'Create Post'}
                </button>
            )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['ALL', ...Object.values(NewsCategory)].map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveFilter(cat as NewsCategory | 'ALL')}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeFilter === cat 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    {getCategoryLabel(cat as NewsCategory | 'ALL')}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {filteredPosts.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-10">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <p>No announcements in this category.</p>
            </div>
        ) : (
            filteredPosts.map(post => (
                <div key={post.id} className={`rounded-xl p-4 shadow-sm border ${getCategoryStyles(post.category)} transition-colors`}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-xl opacity-80">{getIcon(post.category)}</span>
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                                    {getCategoryLabel(post.category)}
                                </span>
                                <div className="flex items-center text-xs opacity-60">
                                    <span>{post.author}</span>
                                    <span className="material-symbols-outlined text-[14px] ml-1 text-blue-500" title="Verified Staff">verified</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-xs opacity-50">{post.date}</span>
                    </div>

                    <h3 className="font-bold text-lg mb-2 leading-tight">{post.title}</h3>
                    <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {post.imageUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                            <img src={post.imageUrl} alt="Post Attachment" className="w-full h-auto object-cover max-h-64" />
                        </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10">
                        {post.allowComments ? (
                            <div>
                                {post.comments.length > 0 && (
                                    <div className="space-y-3 mb-3">
                                        {post.comments.map(c => (
                                            <div key={c.id} className="bg-white/50 dark:bg-black/20 p-2.5 rounded-lg text-xs">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold">{c.userName}</span>
                                                    <span className="opacity-50 text-[10px]">{c.timestamp}</span>
                                                </div>
                                                {c.content && <p className="opacity-90">{c.content}</p>}
                                                {c.imageUrl && (
                                                    <img src={c.imageUrl} alt="Comment" className="mt-2 rounded max-h-32 w-auto border border-gray-200 dark:border-gray-700" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {commentImages[post.id] && (
                                    <div className="relative inline-block mb-2">
                                        <img src={commentImages[post.id]!} alt="Preview" className="h-16 w-auto rounded border border-gray-300 dark:border-gray-600" />
                                        <button 
                                            onClick={() => setCommentImages({ ...commentImages, [post.id]: null })}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                                        >
                                            <span className="material-symbols-outlined text-[10px]">close</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 flex items-center bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-2 focus-within:ring-1 focus-within:ring-black/20 dark:focus-within:ring-white/20">
                                        <input 
                                            type="text" 
                                            placeholder="Write a comment..."
                                            className="flex-1 bg-transparent py-2 text-sm focus:outline-none dark:text-gray-200 dark:placeholder-gray-500"
                                            value={commentText[post.id] || ''}
                                            onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                                        />
                                        <button 
                                            onClick={() => triggerCommentFileInput(post.id)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                                            title="Attach Image"
                                        >
                                            <span className="material-symbols-outlined text-lg">image</span>
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => handleAddComment(post.id)}
                                        className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-emerald-400 font-bold text-xs px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs italic opacity-50 flex items-center">
                                <span className="material-symbols-outlined text-sm mr-1">comments_disabled</span>
                                Comments are turned off for this post.
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                <div className="bg-gray-900 dark:bg-gray-950 text-white p-4 flex justify-between items-center shrink-0">
                    <h3 className="font-bold">{language === Language.URDU ? 'نئی اطلاع' : 'New Announcement'}</h3>
                    <button onClick={() => setShowCreateModal(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleCreatePost} className="p-4 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Title</label>
                        <input 
                            type="text" 
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Monthly Meeting Update"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(NewsCategory).map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setNewCategory(cat)}
                                    className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                                        newCategory === cat 
                                        ? 'bg-gray-800 text-white border-gray-800 dark:bg-gray-600 dark:border-gray-600' 
                                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {getCategoryLabel(cat)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Content</label>
                        <textarea 
                            required
                            rows={4}
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="Type your announcement here..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Attachment (Optional)</label>
                        <input 
                            type="file" 
                            ref={postFileInputRef}
                            onChange={handlePostImageSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        {!newPostImage ? (
                            <button 
                                type="button"
                                onClick={() => postFileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl mb-1">add_photo_alternate</span>
                                <span className="text-xs">Tap to upload image</span>
                            </button>
                        ) : (
                            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img src={newPostImage} alt="Preview" className="w-full h-40 object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setNewPostImage(null);
                                        if (postFileInputRef.current) postFileInputRef.current.value = '';
                                    }}
                                    className="absolute top-2 right-2 bg-white/90 text-red-600 p-1 rounded-full shadow-sm hover:bg-white"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <input 
                            type="checkbox"
                            checked={allowComments}
                            onChange={(e) => setAllowComments(e.target.checked)}
                            className="rounded text-primary focus:ring-primary w-4 h-4"
                        />
                        <label className="text-xs text-gray-600 dark:text-gray-300 font-medium">Allow Comments</label>
                    </div>

                    <div className="pt-2">
                         <button 
                            type="submit"
                            className="w-full bg-gray-900 dark:bg-black text-white font-bold py-3 rounded-xl hover:bg-black shadow-lg flex justify-center items-center"
                        >
                            <span className="material-symbols-outlined text-sm mr-2">send</span>
                            Publish Announcement
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
