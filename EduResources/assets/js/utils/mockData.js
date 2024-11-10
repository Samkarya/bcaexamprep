// assets/js/utils/mockData.js

const mockData = {
    contents: [
        {
            id: 1,
            title: "Complete MCA Entrance Guide 2024",
            type: "pdf",
            thumbnail: "assets/img/pdfPlaceHolder.png",
            tags: ["MCA", "Entrance Exam", "Study Guide"],
            rating: 1,
            ratingCount: 128,
            url: "#",
            dateAdded: "2024-08-15",
            views: 1500,
            isBookmarked: false
        },
        {
            id: 2,
            title: "Data Structures & Algorithms Tutorial",
            type: "video",
            thumbnail: "https://img.youtube.com/vi/uBypDN_Zr5I/maxresdefault.jpg",
            tags: ["DSA", "Programming", "Tutorial"],
            rating: 4,
            ratingCount: 256,
            url: "https://www.youtube.com/watch?v=uBypDN_Zr5I&ab_channel=ApnaCollege",
            dateAdded: "2024-07-14",
            views: 2500,
            isBookmarked: true
        },
        {
            id: 3,
            title: "NIMCET Previous Year Papers Analysis",
            type: "article",
            thumbnail: "assets/img/articlePlaceHolder.png",
            tags: ["NIMCET", "Exam Prep", "Analysis"],
            rating: 3,
            ratingCount: 89,
            url: "#",
            dateAdded: "2024-08-13",
            views: 800,
            isBookmarked: false
        }
    ],

    // Trending content is sorted by views
    getTrendingContent() {
        return this.contents.sort((a, b) => b.views - a.views).slice(0, 6);
    },

    getPopularContent() {
        return this.contents.sort((a, b) => b.rating - a.rating).slice(0, 6);
    },

    // Recent content is sorted by date
    getRecentContent() {
        return this.contents.sort((a, b) => 
            new Date(b.dateAdded) - new Date(a.dateAdded)
        ).slice(0, 3);
    },

    // Search content by query
    searchContent(query) {
        query = query.toLowerCase();
        return this.contents.filter(content => 
            content.title.toLowerCase().includes(query) ||
            content.tags.some(tag => tag.toLowerCase().includes(query))
        );
    },

    // Filter content by type
    filterByType(types) {
        return this.contents.filter(content => 
            types.includes(content.type)
        );
    },

    // Filter content by tags
    filterByTags(tags) {
        return this.contents.filter(content =>
            content.tags.some(tag => tags.includes(tag))
        );
    },

    // Filter content by minimum rating
    filterByRating(minRating) {
        return this.contents.filter(content =>
            content.rating >= minRating
        );
    }
};