// NoizeLoser Stream Hub - JavaScript Engine

class StreamHub {
    constructor() {
        this.config = null;
        this.isMobile = window.innerWidth < 850;
        this.twitchPlayer = null;
        this.isStreamLive = false;

        // Initialize
        this.init();
    }

    async init() {
        try {
            // Load configuration
            await this.loadConfig();

            // Set up event listeners
            this.setupEventListeners();

            // Render the entire UI
            this.renderUI();

            // Check Twitch status (simulated - in production you'd call Twitch API)
            this.checkTwitchStatus();

            // Hide loading, show app
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('app').classList.remove('hidden');
                // Create icons for any newly rendered elements
                if (window.lucide) {
                    lucide.createIcons();
                }
            }, 500);

        } catch (error) {
            console.error('Failed to initialize Stream Hub:', error);
            console.error('Error details:', error.message, error.stack);
            this.showError('Failed to load configuration. Check browser console for details.');
        }
    }

    async loadConfig() {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }
        this.config = await response.json();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('mobileMenuToggle');
        const closeMenu = document.getElementById('closeMobileSidebar');
        const overlay = document.getElementById('mobileSidebarOverlay');
        const mobileSidebar = document.getElementById('mobileSidebar');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                mobileSidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeMenu) {
            closeMenu.addEventListener('click', this.closeMobileMenu.bind(this));
        }

        if (overlay) {
            overlay.addEventListener('click', this.closeMobileMenu.bind(this));
        }

        // Window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth < 850;
            if (!this.isMobile) {
                this.closeMobileMenu();
            }
        });
    }

    closeMobileMenu() {
        const mobileSidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('mobileSidebarOverlay');

        mobileSidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    renderUI() {
        if (!this.config) return;

        // Set site title
        document.title = this.config.siteTitle;
        document.getElementById('siteTitleMobile').textContent = this.config.siteTitle;

        // Render sidebar (both desktop and mobile)
        this.renderSidebar();

        // Render all modules
        this.renderModule(1);  // Text Block
        this.renderModule(2);  // Twitch Embed
        this.renderModule(3);  // Announcements
        this.renderModule(4);  // Links
        this.renderModule(5);  // Support
        this.renderModule(6);  // Schedule
        this.renderModule(7);  // Sponsor
        this.renderModule(8);  // Shoutouts
    }

    renderSidebar() {
        const sidebar = this.config.sidebar;
        if (!sidebar.enabled) return;

        // Safely get all properties with defaults
        const bannerImage = sidebar.bannerImage || '';
        const avatarImage = sidebar.avatarImage || '';
        const creatorName = sidebar.creatorName || 'Streamer';
        const creatorHandle = sidebar.creatorHandle || '@streamer';
        const creatorStyle = sidebar.creatorStyle || 'txt-crimson-glow';
        const bio = sidebar.bio || '';
        const bioStyle = sidebar.bioStyle || 'txt-muted-gray';

        const sidebarHTML = `
            <div class="sidebar-banner" style="background-image: url('${this.processImagePath(bannerImage)}')"></div>
            <div class="p-6">
                <div class="sidebar-avatar-container">
                    <img src="${this.processImagePath(avatarImage)}" 
                         alt="${creatorName}" 
                         class="sidebar-avatar">
                </div>
                
                <div class="text-center mb-6">
                    <h2 class="${this.getStyleClass(creatorStyle, 'txt-crimson-glow')} text-2xl mb-1">
                        ${creatorName}
                    </h2>
                    <p class="txt-sharp-mono text-base opacity-90">${creatorHandle}</p>
                </div>
                
                <p class="${this.getStyleClass(bioStyle, 'txt-muted-gray')} text-sm leading-relaxed text-center px-4">
                    ${bio}
                </p>
            </div>
        `;

        // Render to both desktop and mobile sidebars
        const sidebarContentEl = document.getElementById('sidebarContent');
        const sidebarContentDesktopEl = document.getElementById('sidebarContentDesktop');

        if (sidebarContentEl) sidebarContentEl.innerHTML = sidebarHTML;
        if (sidebarContentDesktopEl) sidebarContentDesktopEl.innerHTML = sidebarHTML;
    }

    renderModule(moduleNumber) {
        const moduleKey = `module${moduleNumber}`;
        const module = this.config.modules[moduleKey];
        const moduleElement = document.getElementById(moduleKey);

        if (!moduleElement) return;

        if (!module || !module.enabled) {
            moduleElement.style.display = 'none';
            return;
        }

        try {
            let moduleHTML = '';

            switch (module.type) {
                case 'textBlock':
                    moduleHTML = this.renderTextBlock(module);
                    break;
                case 'twitchEmbed':
                    moduleHTML = this.renderTwitchEmbed(module);
                    break;
                case 'announcements':
                    moduleHTML = this.renderAnnouncements(module);
                    break;
                case 'links':
                    moduleHTML = this.renderLinks(module);
                    break;
                case 'support':
                    moduleHTML = this.renderSupport(module);
                    break;
                case 'schedule':
                    moduleHTML = this.renderSchedule(module);
                    break;
                case 'sponsor':
                    moduleHTML = this.renderSponsor(module);
                    break;
                case 'shoutouts':
                    moduleHTML = this.renderShoutouts(module);
                    break;
                default:
                    moduleHTML = `<div class="text-red-400">Unknown module type: ${module.type}</div>`;
            }

            moduleElement.innerHTML = moduleHTML;

        } catch (error) {
            console.error(`Error rendering module ${moduleKey}:`, error);
            moduleElement.innerHTML = `
                <div class="text-red-400">
                    Error rendering module ${moduleKey}: ${error.message}
                </div>
            `;
        }
    }

    renderTextBlock(module) {
        let textHTML = module.content.map(item => `
            <div class="text-block-item">
                ${item.heading ? `<h4 class="text-block-heading">${item.heading}</h4>` : ''}
                <div class="${this.getStyleClass(item.style, 'txt-muted-gray')} text-block-content">
                    ${item.text}
                </div>
            </div>
        `).join('');

        return `
            <h3 class="${this.getStyleClass(module.titleStyle, 'txt-pure-white')} text-xl font-bold mb-8">
                ${module.title}
            </h3>
            <div class="space-y-6">
                ${textHTML}
            </div>
        `;
    }

    renderTwitchEmbed(module) {
        // Always show offline for now to avoid Twitch API issues
        const isLive = false; // Set to false to show offline state

        const title = module.title || 'LIVE NOW';
        const titleStyle = this.getStyleClass(module.titleStyle, 'txt-pure-white');
        const twitchChannel = module.twitchChannel || 'noizeloser';
        const offlineStyle = this.getStyleClass(module.offlineStyle, 'txt-muted-gray');
        const offlineMessage = module.offlineMessage || 'Stream is currently offline. Check schedule below!';

        if (isLive) {
            return `
                <h3 class="${titleStyle} text-lg font-bold mb-4">
                    ${title}
                </h3>
                <div class="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden border border-[#e61a29]">
                    <div class="w-full h-full flex items-center justify-center">
                        <div class="text-center">
                            <i data-lucide="tv" class="w-12 h-12 text-[#e61a29] mx-auto mb-2"></i>
                            <p class="txt-pure-white font-semibold">LIVE: ${twitchChannel}</p>
                            <p class="txt-muted-gray text-sm mt-1">(Twitch embed would appear here)</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <h3 class="${titleStyle} text-lg font-bold mb-4">
                    ${title}
                </h3>
                <div class="offline-indicator">
                    <div class="offline-pulse"></div>
                    <p class="${offlineStyle} text-lg font-semibold">
                        STREAM OFFLINE
                    </p>
                    <p class="txt-muted-gray mt-2">${offlineMessage}</p>
                </div>
            `;
        }
    }

    renderAnnouncements(module) {
        let announcementsHTML = module.content.map(item => `
            <div class="mb-6 pb-6 border-b border-[#e61a29]/20 last:border-0 last:mb-0 last:pb-0">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-[#e61a29]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="megaphone" class="text-[#e61a29]"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="txt-pure-white font-semibold">${item.title}</h4>
                            <span class="txt-sharp-mono text-xs opacity-75">${item.date}</span>
                        </div>
                        <p class="txt-muted-gray text-sm leading-relaxed">${item.text}</p>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <h3 class="${this.getStyleClass(module.titleStyle, 'txt-pure-white')} text-lg font-bold mb-6">
                ${module.title}
            </h3>
            ${announcementsHTML}
        `;
    }

    renderLinks(module) {
        const iconMap = {
            'twitch': 'twitch',
            'youtube': 'youtube',
            'message-circle': 'message-circle',
            'twitter': 'twitter',
            'instagram': 'instagram',
            'discord': 'discord',
            'github': 'github',
            'globe': 'globe'
        };

        const customIcons = {
            'twitch': `<svg class="w-5 h-5 fill-[#e61a29]" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`,
            'youtube': `<svg class="w-5 h-5 fill-[#e61a29]" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
            'discord': `<svg class="w-5 h-5 fill-[#e61a29]" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/></svg>`,
            'message-circle': `<svg class="w-5 h-5 fill-none stroke-[#e61a29] stroke-2" viewBox="0 0 24 24"><path d="M21.13 17.6a10 10 0 1 0-2.6 2.6L22 22z"/></svg>` // Качественный SVG для Telegram/Чат-кружка
        };

        let linksHTML = module.links.map(link => {
            const iconKey = iconMap[link.icon] || 'link';

            const iconHTML = customIcons[iconKey]
                ? customIcons[iconKey]
                : `<i data-lucide="${iconKey}" class="text-[#e61a29]"></i>`;

            return `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-item group">
                <div class="w-10 h-10 bg-[#e61a29]/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-[#e61a29]/20 transition-colors">
                    ${iconHTML}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center">
                        <h4 class="txt-pure-white font-medium truncate">${link.name}</h4>
                        <i data-lucide="chevron-right" class="text-[#8c7374] ml-2 flex-shrink-0"></i>
                    </div>
                    <p class="txt-muted-gray text-sm truncate">${link.description}</p>
                </div>
            </a>
        `;
        }).join('');

        return `
        <h3 class="${this.getStyleClass(module.titleStyle, 'txt-pure-white')} text-lg font-bold mb-6">
            ${module.title}
        </h3>
        <div class="space-y-2">
            ${linksHTML}
        </div>
    `;
    }


    renderSupport(module) {
        let supportHTML = module.supports.map(support => `
            <div class="support-item">
                <div class="w-12 h-12 bg-[#e61a29]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i data-lucide="heart" class="text-[#e61a29]"></i>
                </div>
                <h4 class="txt-pure-white font-semibold text-center mb-2">${support.platform}</h4>
                <p class="txt-muted-gray text-sm text-center mb-4">${support.description}</p>
                <a href="${support.url}" target="_blank" rel="noopener noreferrer" 
                   class="btn-crimson block text-center ${this.getStyleClass(support.buttonStyle, 'txt-heavy-strike')}">
                    ${support.buttonText}
                </a>
            </div>
        `).join('');

        return `
            <h3 class="${this.getStyleClass(module.titleStyle, 'txt-pure-white')} text-lg font-bold mb-6">
                ${module.title}
            </h3>
            <div class="support-grid">
                ${supportHTML}
            </div>
        `;
    }

    renderSchedule(module) {
        let scheduleHTML = module.schedule.map(day => {
            const statusClass = day.status === 'off' ? 'off' :
                day.status === 'special' ? 'special' : '';

            return `
                <div class="schedule-day ${statusClass}">
                    <div class="w-20 flex-shrink-0">
                        <div class="txt-heavy-strike text-sm">${day.day}</div>
                        <div class="txt-sharp-mono text-xs opacity-75">${day.time}</div>
                    </div>
                    <div class="flex-1 ml-4">
                        <div class="txt-pure-white font-medium">${day.game}</div>
                        ${day.status === 'special' ?
                    '<span class="inline-block px-2 py-1 bg-[#ff6b81]/10 text-[#ff6b81] text-xs rounded mt-1">SPECIAL EVENT</span>' :
                    ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <h3 class="${this.getStyleClass(module.titleStyle, 'txt-pure-white')} text-lg font-bold mb-6">
                ${module.title}
            </h3>
            <div class="text-xs txt-muted-gray mb-4">Timezone: ${module.timezone}</div>
            <div class="space-y-2">
                ${scheduleHTML}
            </div>
        `;
    }

    renderSponsor(module) {
        let bannersHTML = module.banners.map(banner => `
            <a href="${banner.url}" target="_blank" rel="noopener noreferrer" class="block">
                <div class="bg-black/30 border border-[#e61a29]/30 rounded-lg overflow-hidden hover:border-[#e61a29] transition-colors">
                    <img src="${this.processImagePath(banner.image)}" 
                         alt="${banner.alt}" 
                         class="w-full h-32 object-cover">
                    <div class="p-3 text-center">
                        <p class="txt-pure-white text-sm">${banner.alt}</p>
                    </div>
                </div>
            </a>
        `).join('');

        return `
            <h3 class="${this.getStyleClass(module.titleStyle, 'txt-pure-white')} text-lg font-bold mb-6">
                ${module.title}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${bannersHTML}
            </div>
        `;
    }

    renderShoutouts(module) {
        // Сортируем массив по рангу, чтобы ранк 100 гарантированно ушел вниз
        const sortedSupporters = [...module.supporters].sort((a, b) => Number(a.rank) - Number(b.rank));

        let supportersHTML = sortedSupporters.map(supporter => {
            // Проверяем, есть ли картинка в JSON
            const hasAvatar = supporter.avatar && supporter.avatar.trim() !== "";

            // Создаем HTML для аватарки только если она указана
            const avatarHTML = hasAvatar ? `
                <div class="w-10 h-10 rounded-full overflow-hidden border border-[#e61a29] mr-4 flex-shrink-0">
                <img src="${this.processImagePath(supporter.avatar)}" alt="${supporter.name}" class="w-full h-full object-cover">
                </div>
            ` : '';

            return `
                <div class="shoutout-item flex items-center p-4 mb-2 rounded-lg border border-[#e61a29]/30 bg-black/20">
                    <!-- Номер -->
                    <div class="shoutout-rank flex-shrink-0 mr-4">${supporter.rank}</div>
                    
                    <!-- Аватарка (отобразится только если поле заполнено) -->
                    ${avatarHTML}
                    
                    <!-- Главный контейнер -->
                    <div class="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-x-6 gap-y-1 min-w-0">
                    
                    <!-- Левая часть: Ники и Роли -->
                    <div class="flex-shrink-0">
                        <h4 class="txt-pure-white font-medium text-base whitespace-nowrap">${supporter.name}</h4>
                        <p class="txt-muted-gray text-xs whitespace-nowrap opacity-75">${supporter.role}</p>
                    </div>
                    
                    <!-- Правая часть: Текст благодарности -->
                    <div class="flex-1 md:text-right">
                        <span class="txt-crimson-glow text-sm font-bold block whitespace-normal break-words">${supporter.amount}</span>
                    </div>
                    
                    </div>
                </div>
            `;
        }).join('');

        return `
            <h3 class="${this.getStyleClass(module.titleStyle, 'txt-pure-white')} text-lg font-bold mb-6">
            ${module.title}
            </h3>
            <div class="space-y-2">
            ${supportersHTML}
            </div>
        `;
    }



    processImagePath(imagePath) {
        // Check if imagePath is undefined or null
        if (!imagePath) {
            // Return a safe placeholder image
            return 'https://static.photos/gaming/320x240/100';
        }

        // Local file resolution engine
        if (imagePath.startsWith('file:')) {
            // Strip the 'file:' prefix and return relative path
            const path = imagePath.substring(5);
            return path;
        }

        // If it's a placeholder or external URL, return as-is
        return imagePath;
    }

    getStyleClass(style, fallback) {
        return style || fallback;
    }

    checkTwitchStatus() {
        // In production, implement actual Twitch API check
        // This is a placeholder for the functionality
        console.log('Twitch status check would happen here');
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="bg-[#110505] border border-[#e61a29] rounded-lg p-8 max-w-md text-center">
                    <i data-lucide="alert-circle" class="w-12 h-12 text-[#e61a29] mx-auto mb-4"></i>
                    <h2 class="txt-pure-white text-xl font-bold mb-2">Error Loading Dashboard</h2>
                    <p class="txt-muted-gray mb-6">${message}</p>
                    <button onclick="location.reload()" class="btn-crimson">
                        <i data-lucide="refresh-ccw" class="w-4 h-4 mr-2"></i>
                        Retry
                    </button>
                </div>
            </div>
        `;
        app.classList.remove('hidden');
        document.getElementById('loading').style.display = 'none';
        lucide.createIcons();
    }
}

// Initialize the Stream Hub when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.streamHub = new StreamHub();
}); 