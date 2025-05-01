import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { MessageSquare, MoreHorizontal, ThumbsUp, MessageCircle, Share, Send } from 'lucide-react';
import { Button } from '../components/index.jsx';

const DiscussionForumPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock discussion posts
  const posts = [
    {
      id: 1,
      author: 'Jane Doe',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Doe&background=0D8ABC&color=fff',
      date: '2 days ago',
      title: 'Tips for Freshman Year',
      content: 'Starting college can be overwhelming. Here are some tips that helped me during my freshman year...',
      likes: 24,
      comments: 8,
      tags: ['advice', 'freshman']
    },
    {
      id: 2,
      author: 'John Smith',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=8A2BE2&color=fff',
      date: '1 week ago',
      title: 'Computer Science Study Group',
      content: 'Looking for people interested in forming a study group for CS 301. We can meet at the library twice a week...',
      likes: 12,
      comments: 15,
      tags: ['study group', 'computer science']
    },
    {
      id: 3,
      author: 'Alex Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=FF5733&color=fff',
      date: '3 days ago',
      title: 'Campus Event Announcement',
      content: 'The student council is organizing a cultural festival next month. If you want to participate or volunteer...',
      likes: 32,
      comments: 7,
      tags: ['event', 'campus']
    }
  ];
  
  return (
    <AppLayout>
      <Header title="Discussion Forum" />
      
      {/* Tab Navigation */}
      <div className="bg-background border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto py-3">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium rounded-md whitespace-nowrap ${activeTab === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              All Discussions
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 font-medium rounded-md whitespace-nowrap ${activeTab === 'trending' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 font-medium rounded-md whitespace-nowrap ${activeTab === 'my' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              My Discussions
            </button>
            
            <div className="ml-auto">
              <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors">
                New Post
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Create Post Box */}
        <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-md p-5 mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Start a new discussion..."
              className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ml-3"
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-muted-foreground">Add photos, tags, or category</div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-md transition-colors flex items-center gap-1">
              <Send size={14} />
              Post
            </Button>
          </div>
        </div>
        
        {/* Discussion Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-card/90 backdrop-blur-sm rounded-xl shadow-md p-5">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-card-foreground">{post.author}</h3>
                    <p className="text-sm text-muted-foreground">{post.date}</p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <h2 className="text-lg font-semibold text-card-foreground mt-3">{post.title}</h2>
              <p className="text-foreground mt-2">{post.content}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-primary/5 text-primary text-xs px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Actions */}
              <div className="mt-4 flex gap-6 text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-primary">
                  <ThumbsUp size={18} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary">
                  <MessageCircle size={18} />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary">
                  <Share size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </AppLayout>
  );
};

export default DiscussionForumPage; 