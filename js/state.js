const State = {
    currentUser: {
        id: 'user_me',
        email: 'alex@vibeshare.app',
        displayName: 'Alex Rivera',
        handle: 'alexrivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'Digital explorer & storytelling enthusiast 🚀✨',
        isConfirmed: true
    },

    networkUsers: [
        { id: 'u1', name: 'Sophia Chen', handle: 'sophiac', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', relationship: 'close_friend', bio: 'Creative director based in NYC' },
        { id: 'u2', name: 'Marcus Vance', handle: 'marcusv', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', relationship: 'friend', bio: 'Coffee lover & developer' },
        { id: 'u3', name: 'Elena Rostova', handle: 'elenar', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', relationship: 'follower', bio: 'Travel vlog community member' },
        { id: 'u4', name: 'Liam Harper', handle: 'liamh', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', relationship: 'follower', bio: 'Design enthusiast' }
    ],

    stories: [
        {
            id: 's1',
            userId: 'user_me',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
            caption: 'Sunset vibes by the ocean! 🌊',
            privacy: 'followers',
            timestamp: '1h ago',
            likes: 12,
            isLiked: false,
            viewers: ['Sophia Chen', 'Marcus Vance', 'Elena Rostova']
        },
        {
            id: 's2',
            userId: 'u1', // Close Friend
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600',
            caption: 'Architectural gems in Madrid ✨',
            privacy: 'close',
            timestamp: '3h ago',
            likes: 24,
            isLiked: true,
            viewers: ['Alex Rivera']
        },
        {
            id: 's3',
            userId: 'u2', // Friend
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
            caption: 'Morning coffee routine ☕',
            privacy: 'friends',
            timestamp: '5h ago',
            likes: 8,
            isLiked: false,
            viewers: ['Alex Rivera']
        }
    ],

    chats: [
        {
            id: 'c1',
            userId: 'u1',
            unread: false,
            messages: [
                { sender: 'u1', text: 'Hey Alex! Did you check out the new design setup?', time: '10:14 AM' },
                { sender: 'user_me', text: 'Yes! It looks absolutely stunning!', time: '10:16 AM' }
            ]
        },
        {
            id: 'c2',
            userId: 'u3', // Follower Request
            unread: true,
            isRequest: true,
            isAccepted: false,
            messages: [
                { sender: 'u3', text: 'Hi Alex! Loved your story post, where was that picture taken?', time: 'Yesterday' }
            ]
        }
    ],

    activeTab: 'feed',
    activeChatUserId: null,
    isDarkMode: true
};