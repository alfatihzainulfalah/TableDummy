class PiagamBoard {
    constructor() {
        this.boardData = {
            id: 1,
            title: "PIAGAM Board",
            lists: [
                {
                    id: 1,
                    title: "📋 To Do",
                    cards: [
                        {
                            id: 1,
                            title: "Enhance UI Design",
                            description: "Improve the user interface with modern design patterns and better user experience",
                            due_date: "2025-09-30",
                            priority: "high",
                            comments: ["Focus on mobile responsiveness", "Add dark mode support"]
                        },
                        {
                            id: 2,
                            title: "Implement Search Functionality",
                            description: "Add advanced search and filtering capabilities",
                            due_date: "2025-10-05",
                            priority: "medium",
                            comments: ["Include tags and labels in search"]
                        }
                    ]
                },
                {
                    id: 2,
                    title: "🔄 In Progress",
                    cards: [
                        {
                            id: 3,
                            title: "Drag & Drop Enhancement",
                            description: "Improve drag and drop functionality with better visual feedback",
                            due_date: "2025-09-28",
                            priority: "high",
                            comments: ["Almost complete", "Testing cross-browser compatibility"]
                        }
                    ]
                },
                {
                    id: 3,
                    title: "🔍 Review",
                    cards: [
                        {
                            id: 5,
                            title: "Code Review Process",
                            description: "Establish code review guidelines and processes",
                            due_date: "2025-09-25",
                            priority: "medium",
                            comments: ["Define review criteria"]
                        }
                    ]
                },
                {
                    id: 4,
                    title: "✅ Done",
                    cards: [
                        {
                            id: 4,
                            title: "Project Setup",
                            description: "Initialize project structure and development environment",
                            due_date: "2025-09-20",
                            priority: "high",
                            comments: ["Successfully completed", "All dependencies configured"]
                        }
                    ]
                }
            ]
        };
        
        this.currentCard = null;
        this.cardIdCounter = 6;
        this.listIdCounter = 5;
        this.draggedElement = null;
        
        this.init();
    }

    init() {
        this.renderBoard();
        this.setupEventListeners();
        this.addActivity("Board initialized successfully!");
    }

    renderBoard() {
        const container = document.getElementById('boardContainer');
        container.innerHTML = '';
        
        this.boardData.lists.forEach(list => {
            const listElement = this.createListElement(list);
            container.appendChild(listElement);
        });
        
        this.setupDragAndDrop();
    }

    createListElement(list) {
        const listDiv = document.createElement('div');
        listDiv.className = 'list';
        listDiv.dataset.listId = list.id;
        
        listDiv.innerHTML = `
            <div class="list-header">
                <h2 class="list-title">${list.title}</h2>
                <div class="list-actions">
                    <button class="list-action-btn" onclick="piagamBoard.addCard(${list.id})" title="Add Card">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="list-action-btn delete" onclick="piagamBoard.deleteList(${list.id})" title="Delete List">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="list-container" data-list-id="${list.id}">
                ${list.cards.map(card => this.createCardHTML(card)).join('')}
            </div>
        `;
        
        return listDiv;
    }

    createCardHTML(card) {
        const dueDate = card.due_date ? new Date(card.due_date).toLocaleDateString() : '';
        const isOverdue = card.due_date && new Date(card.due_date) < new Date();
        const priorityClass = card.priority ? `priority-${card.priority}` : '';
        
        return `
            <div class="card" data-card-id="${card.id}" onclick="piagamBoard.openCardModal(${card.id})">
                <h3 class="card-title">${card.title}</h3>
                <p class="card-description">${card.description}</p>
                <div class="card-meta">
                    ${dueDate ? `
                        <div class="card-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar-alt"></i>
                            ${dueDate}
                        </div>
                    ` : ''}
                    ${card.priority ? `
                        <div class="card-priority ${priorityClass}">
                            <i class="fas fa-flag"></i>
                            ${card.priority}
                        </div>
                    ` : ''}
                    ${card.comments.length > 0 ? `
                        <div class="card-comments">
                            <i class="fas fa-comment"></i>
                            ${card.comments.length}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        const listContainers = document.querySelectorAll('.list-container');
        
        listContainers.forEach(container => {
            new Sortable(container, {
                group: 'shared',
                animation: 200,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onStart: (evt) => {
                    this.draggedElement = evt.item;
                    document.body.style.cursor = 'grabbing';
                },
                onEnd: (evt) => {
                    document.body.style.cursor = 'default';
                    const cardId = parseInt(evt.item.dataset.cardId);
                    const newListId = parseInt(evt.to.dataset.listId);
                    const newIndex = evt.newIndex;
                    
                    if (evt.from !== evt.to || evt.oldIndex !== evt.newIndex) {
                        this.moveCard(cardId, newListId, newIndex);
                        const listTitle = this.getListTitle(newListId);
                        const cardTitle = this.findCard(cardId)?.title || 'Card';
                        this.addActivity(`"${cardTitle}" moved to ${listTitle}`);
                    }
                    
                    this.draggedElement = null;
                }
            });
        });
    }

    moveCard(cardId, newListId, newIndex) {
        let card = null;
        let oldListTitle = '';
        
        for (let list of this.boardData.lists) {
            const cardIndex = list.cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                card = list.cards.splice(cardIndex, 1)[0];
                oldListTitle = list.title;
                break;
            }
        }
        

        if (card) {
            const newList = this.boardData.lists.find(l => l.id === newListId);
            newList.cards.splice(newIndex, 0, card);
        }
    }

    getListTitle(listId) {
        const list = this.boardData.lists.find(l => l.id === listId);
        return list ? list.title : 'Unknown List';
    }

    addCard(listId) {
        const title = prompt("Enter card title:");
        if (title && title.trim()) {
            const newCard = {
                id: this.cardIdCounter++,
                title: title.trim(),
                description: "",
                due_date: "",
                priority: "",
                comments: []
            };
            
            const list = this.boardData.lists.find(l => l.id === listId);
            if (list) {
                list.cards.push(newCard);
                this.renderBoard();
                this.addActivity(`New card "${title}" added to ${list.title}`);
            }
        }
    }

    addList() {
        const title = prompt("Enter list title:");
        if (title && title.trim()) {
            const newList = {
                id: this.listIdCounter++,
                title: title.trim(),
                cards: []
            };
            
            this.boardData.lists.push(newList);
            this.renderBoard();
            this.addActivity(`New list "${title}" created`);
        }
    }

    deleteList(listId) {
        const list = this.boardData.lists.find(l => l.id === listId);
        if (list && confirm(`Are you sure you want to delete "${list.title}"? This action cannot be undone.`)) {
            const listIndex = this.boardData.lists.findIndex(l => l.id === listId);
            this.boardData.lists.splice(listIndex, 1);
            this.renderBoard();
            this.addActivity(`List "${list.title}" deleted`);
        }
    }

    openCardModal(cardId) {
        this.currentCard = this.findCard(cardId);
        if (this.currentCard) {
            document.getElementById('modalTitle').value = this.currentCard.title;
            document.getElementById('modalDescription').value = this.currentCard.description;
            document.getElementById('modalDueDate').value = this.currentCard.due_date;
            document.getElementById('modalPriority').value = this.currentCard.priority || '';
            this.renderComments();
            this.showModal();
        }
    }

    findCard(cardId) {
        for (let list of this.boardData.lists) {
            const card = list.cards.find(c => c.id === cardId);
            if (card) return card;
        }
        return null;
    }

    renderComments() {
        const commentsList = document.getElementById('commentsList');
        if (this.currentCard && this.currentCard.comments.length > 0) {
            commentsList.innerHTML = this.currentCard.comments.map((comment, index) => `
                <div class="comment">
                    <span class="comment-text">${comment}</span>
                    <button class="comment-delete" onclick="piagamBoard.deleteComment(${index})" title="Delete comment">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        } else {
            commentsList.innerHTML = '<div class="comment" style="justify-content: center; color: #94a3b8;">No comments yet</div>';
        }
    }

    addComment() {
        const commentInput = document.getElementById('newComment');
        const commentText = commentInput.value.trim();
        
        if (commentText && this.currentCard) {
            this.currentCard.comments.push(commentText);
            commentInput.value = '';
            this.renderComments();
            this.addActivity(`Comment added to "${this.currentCard.title}"`);
        }
    }

    deleteComment(index) {
        if (this.currentCard && confirm("Delete this comment?")) {
            this.currentCard.comments.splice(index, 1);
            this.renderComments();
            this.addActivity(`Comment deleted from "${this.currentCard.title}"`);
        }
    }

    saveCard() {
        if (this.currentCard) {
            const newTitle = document.getElementById('modalTitle').value.trim();
            const newDescription = document.getElementById('modalDescription').value.trim();
            const newDueDate = document.getElementById('modalDueDate').value;
            const newPriority = document.getElementById('modalPriority').value;
            
            if (!newTitle) {
                alert('Card title is required!');
                return;
            }
            
            this.currentCard.title = newTitle;
            this.currentCard.description = newDescription;
            this.currentCard.due_date = newDueDate;
            this.currentCard.priority = newPriority;
            
            this.hideModal();
            this.renderBoard();
            this.addActivity(`Card "${this.currentCard.title}" updated`);
        }
    }

    deleteCard() {
        if (this.currentCard && confirm(`Are you sure you want to delete "${this.currentCard.title}"?`)) {
            const cardTitle = this.currentCard.title;
            
            for (let list of this.boardData.lists) {
                const cardIndex = list.cards.findIndex(c => c.id === this.currentCard.id);
                if (cardIndex !== -1) {
                    list.cards.splice(cardIndex, 1);
                    break;
                }
            }
            
            this.hideModal();
            this.renderBoard();
            this.addActivity(`Card "${cardTitle}" deleted`);
        }
    }

    showModal() {
        const modal = document.getElementById('cardModal');
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        const modal = document.getElementById('cardModal');
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentCard = null;
    }

    addActivity(message) {
        const activityLog = document.getElementById('activityLog');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        activityItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <span style="font-size: 0.75rem; opacity: 0.7;">${timeString}</span>
            </div>
        `;
        
        activityLog.insertBefore(activityItem, activityLog.firstChild);
        
        while (activityLog.children.length > 50) {
            activityLog.removeChild(activityLog.lastChild);
        }
    }

    searchCards() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const cards = document.querySelectorAll('[data-card-id]');
        let matchCount = 0;
        
        cards.forEach(card => {
            const cardId = parseInt(card.dataset.cardId);
            const cardData = this.findCard(cardId);
            
            if (cardData) {
                const title = cardData.title.toLowerCase();
                const description = cardData.description.toLowerCase();
                const comments = cardData.comments.join(' ').toLowerCase();
                
                const isMatch = title.includes(searchTerm) || 
                               description.includes(searchTerm) || 
                               comments.includes(searchTerm);
                
                if (searchTerm === '' || isMatch) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    if (searchTerm !== '' && isMatch) {
                        card.style.outline = '2px solid #fbbf24';
                        card.style.outlineOffset = '2px';
                        matchCount++;
                    } else {
                        card.style.outline = 'none';
                    }
                } else {
                    card.style.display = 'none';
                    card.style.opacity = '0.5';
                    card.style.outline = 'none';
                }
            }
        });
        
        if (searchTerm !== '') {
            this.addActivity(`Search found ${matchCount} matching card${matchCount !== 1 ? 's' : ''}`);
        }
    }

    setupEventListeners() {
        document.getElementById('addListBtn').addEventListener('click', () => this.addList());
        
        document.getElementById('closeModal').addEventListener('click', () => this.hideModal());
        document.getElementById('cancelCard').addEventListener('click', () => this.hideModal());
        document.getElementById('saveCard').addEventListener('click', () => this.saveCard());
        document.getElementById('deleteCard').addEventListener('click', () => this.deleteCard());
        document.getElementById('addComment').addEventListener('click', () => this.addComment());
        
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => this.searchCards());
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                this.searchCards();
            }
        });
        
        document.getElementById('cardModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideModal();
            }
        });
        
        document.getElementById('newComment').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.addComment();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        document.getElementById('searchInput').focus();
                        break;
                    case 's':
                        e.preventDefault();
                        if (this.currentCard) {
                            this.saveCard();
                        }
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                if (document.getElementById('cardModal').classList.contains('active')) {
                    this.hideModal();
                }
            }
        });
        
        // Auto-save
        setInterval(() => {
            console.log('Auto-saving board data...', this.boardData);
        }, 30000);
        
        // Welcome message
        setTimeout(() => {
            this.addActivity("Welcome to PIAGAM! Start by creating cards and organizing your workflow.");
        }, 1000);
    }
}

let piagamBoard;

document.addEventListener('DOMContentLoaded', () => {
    piagamBoard = new PiagamBoard();
});