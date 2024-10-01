import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { auth, db } from './auth-logic.js';

class LeaderboardManager {
    constructor() {
        this.leaderboardList = document.getElementById('leaderboardList');
        this.subjectFilter = 'All';
        this.timeFilter = 'all-time';
    }

    async fetchLeaderboardData() {
        const gameHistoryRef = collection(db, 'gameHistory');
        let queryConstraints = [
            orderBy('score', 'desc'),
            limit(100)
        ];

        if (this.subjectFilter !== 'All') {
            queryConstraints.push(where('subject', '==', this.subjectFilter));
        }

        if (this.timeFilter !== 'all-time') {
            const cutoffDate = this.getTimeFilterDate();
            queryConstraints.push(where('timestamp', '>=', cutoffDate));
        }

        const q = query(gameHistoryRef, ...queryConstraints);
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    getTimeFilterDate() {
        const now = new Date();
        switch (this.timeFilter) {
            case 'daily':
                return new Date(now.setHours(0, 0, 0, 0));
            case 'weekly':
                const lastWeek = new Date(now.setDate(now.getDate() - 7));
                return new Date(lastWeek.setHours(0, 0, 0, 0));
            case 'monthly':
                const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
                return new Date(lastMonth.setHours(0, 0, 0, 0));
            default:
                return null;
        }
    }

    async displayLeaderboard() {
        this.leaderboardList.innerHTML = '<p>Loading leaderboard...</p>';

        try {
            const leaderboardData = await this.fetchLeaderboardData();
            
            if (leaderboardData.length === 0) {
                this.leaderboardList.innerHTML = '<p>No data available for the selected filters.</p>';
                return;
            }

            const leaderboardHTML = await this.generateLeaderboardHTML(leaderboardData);
            this.leaderboardList.innerHTML = leaderboardHTML;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            this.leaderboardList.innerHTML = '<p>Error loading leaderboard. Please try again later.</p>';
        }
    }

    async generateLeaderboardHTML(leaderboardData) {
        let html = `
            <div class="leaderboard-filters">
                <select id="subjectFilter">
                    <option value="All">All Subjects</option>
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                </select>
                <select id="timeFilter">
                    <option value="all-time">All Time</option>
                    <option value="daily">Today</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                </select>
            </div>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Subject</th>
                        <th>Score</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const userPromises = leaderboardData.map(entry => 
            this.getUserName(entry.userId)
        );

        const userNames = await Promise.all(userPromises);

        leaderboardData.forEach((entry, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${userNames[index]}</td>
                    <td>${entry.subject}</td>
                    <td>${entry.score}</td>
                    <td>${entry.timeTaken}s</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        return html;
    }

    async getUserName(userId) {
        if (!userId) return 'Anonymous';

        try {
            const userDoc = await firebase.firestore().collection('users').doc(userId).get();
            return userDoc.exists ? userDoc.data().displayName : 'Unknown User';
        } catch (error) {
            console.error('Error fetching user:', error);
            return 'Unknown User';
        }
    }

    setupEventListeners() {
        document.getElementById('subjectFilter').addEventListener('change', (e) => {
            this.subjectFilter = e.target.value;
            this.displayLeaderboard();
        });

        document.getElementById('timeFilter').addEventListener('change', (e) => {
            this.timeFilter = e.target.value;
            this.displayLeaderboard();
        });
    }
}

// Initialize LeaderboardManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const leaderboardManager = new LeaderboardManager();
    leaderboardManager.setupEventListeners();
});
