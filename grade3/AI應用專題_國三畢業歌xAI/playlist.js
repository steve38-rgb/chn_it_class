// CSV Playlist Loader for Part 5
let playlistData = [];

// Parse CSV line properly (handles commas in URLs)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Load CSV data
async function loadPlaylistData() {
    try {
        console.log('Loading playlist data...');
        const response = await fetch('作品發表.csv');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        console.log('CSV loaded, length:', csvText.length);

        // Parse CSV - split by line breaks
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        console.log('Total lines:', lines.length);

        playlistData = [];

        // Skip header (line 0) and parse data
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Split by comma, but handle URLs with query parameters
            // Format: 班級,組別,組員座號,歌名,網址
            const parts = line.split(',');

            // The URL might contain commas in query params, so join everything after index 4
            const entry = {
                class: parts[0]?.trim() || '',
                group: parts[1]?.trim() || '',
                members: parts[2]?.trim() || '',
                songName: parts[3]?.trim() || '',
                url: parts.slice(4).join(',').trim() || ''
            };

            console.log('Parsed entry:', entry);

            if (entry.class && entry.group) {
                playlistData.push(entry);
            }
        }

        console.log('Total entries loaded:', playlistData.length);
        console.log('Playlist data:', playlistData);

        if (playlistData.length > 0) {
            populateClassDropdown();
        } else {
            console.error('No valid data found in CSV');
        }
    } catch (error) {
        console.error('Error loading playlist data:', error);
        alert('無法載入作品清單，請檢查 CSV 檔案是否存在。');
    }
}

// Populate class dropdown
function populateClassDropdown() {
    const classSelect = document.getElementById('classSelect');
    if (!classSelect) {
        console.error('classSelect element not found');
        return;
    }

    const classes = [...new Set(playlistData.map(item => item.class))].filter(c => c);
    console.log('Available classes:', classes);

    classSelect.innerHTML = '<option value="">-- 請選擇班級 --</option>';
    classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classSelect.appendChild(option);
    });

    console.log('Class dropdown populated with', classes.length, 'classes');
}

// Handle class selection
function onClassChange() {
    const classSelect = document.getElementById('classSelect');
    const groupSelect = document.getElementById('groupSelect');
    const selectedClass = classSelect.value;

    console.log('Class selected:', selectedClass);

    // Reset group dropdown
    groupSelect.innerHTML = '<option value="">-- 請選擇組別 --</option>';
    groupSelect.disabled = !selectedClass;

    // Hide video
    document.getElementById('videoContainer').style.display = 'none';
    document.getElementById('noSelection').style.display = 'block';

    if (selectedClass) {
        // Get groups for selected class
        const groups = playlistData
            .filter(item => item.class === selectedClass)
            .map(item => item.group)
            .filter(g => g);

        const uniqueGroups = [...new Set(groups)];
        console.log('Available groups for', selectedClass, ':', uniqueGroups);

        uniqueGroups.forEach(groupName => {
            const option = document.createElement('option');
            option.value = groupName;
            option.textContent = groupName;
            groupSelect.appendChild(option);
        });
    }
}

// Handle group selection
function onGroupChange() {
    const classSelect = document.getElementById('classSelect');
    const groupSelect = document.getElementById('groupSelect');
    const selectedClass = classSelect.value;
    const selectedGroup = groupSelect.value;

    console.log('Group selected:', selectedGroup);

    if (selectedClass && selectedGroup) {
        // Find the matching entry
        const entry = playlistData.find(
            item => item.class === selectedClass && item.group === selectedGroup
        );

        console.log('Found entry:', entry);

        if (entry) {
            displayVideo(entry);
        }
    } else {
        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('noSelection').style.display = 'block';
    }
}

// Display video
function displayVideo(entry) {
    const videoContainer = document.getElementById('videoContainer');
    const noSelection = document.getElementById('noSelection');
    const videoTitle = document.getElementById('videoTitle');
    const videoInfo = document.getElementById('videoInfo');
    const openVideoBtn = document.getElementById('openVideoBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const copySuccess = document.getElementById('copySuccess');

    console.log('Displaying video for:', entry);

    // Update title and info
    videoTitle.textContent = entry.songName;
    videoInfo.textContent = `組員座號: ${entry.members} | 班級: ${entry.class} | 組別: ${entry.group}`;

    // Set the link for opening in new window
    openVideoBtn.href = entry.url;

    console.log('Video URL:', entry.url);

    // Copy link button functionality
    copyLinkBtn.onclick = function () {
        navigator.clipboard.writeText(entry.url).then(() => {
            copySuccess.style.display = 'block';
            setTimeout(() => {
                copySuccess.style.display = 'none';
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('複製失敗，請手動複製連結');
        });
    };

    // Show video container, hide placeholder
    videoContainer.style.display = 'block';
    noSelection.style.display = 'none';
}

// Initialize when page loads
console.log('Playlist script loaded');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlaylist);
} else {
    initPlaylist();
}

function initPlaylist() {
    console.log('Initializing playlist...');
    const classSelect = document.getElementById('classSelect');
    const groupSelect = document.getElementById('groupSelect');

    if (classSelect && groupSelect) {
        console.log('Elements found, loading data...');
        loadPlaylistData();

        classSelect.addEventListener('change', onClassChange);
        groupSelect.addEventListener('change', onGroupChange);
    } else {
        console.error('Playlist elements not found on page');
    }
}
