const socket = io();

let myPlayerNum = 0;
let currentPlayer = 1;
let selectedHexId = null;
let boardState = [];
let gameActive = false;

// DOM Elements
const roomInput = document.getElementById('room-input');
const joinBtn = document.getElementById('join-btn');
const chainToggle = document.getElementById('chain-toggle');
const lockingToggle = document.getElementById('locking-toggle');
const timerSelect = document.getElementById('timer-select');
const hexGrid = document.getElementById('hex-grid');
const selectedDisplay = document.getElementById('selected-criteria-display');
const champInput = document.getElementById('champ-input');
const submitBtn = document.getElementById('submit-btn');
const systemMsg = document.getElementById('system-msg');
const turnAnnounce = document.getElementById('turn-announcement');
const p1Score = document.getElementById('p1-score');
const p2Score = document.getElementById('p2-score');
const timerProgress = document.getElementById('timer-progress');
const autocompleteList = document.getElementById('autocomplete-list');

let championPool = [];
let usedChampions = [];
let currentSuggestions = [];
let activeSuggestionIndex = -1;

const HEX_RADIUS = 46;
function hexToPixel(q, r) {
  const x = HEX_RADIUS * Math.sqrt(3) * (q + r / 2);
  const y = HEX_RADIUS * (3 / 2) * r;
  return { x, y };
}

function createHexPoints(radius) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push(`${radius * Math.cos(angle)},${radius * Math.sin(angle)}`);
  }
  return points.join(' ');
}

function applyControlPermissions() {
  const isP2 = (myPlayerNum === 2);
  chainToggle.disabled = isP2;
  lockingToggle.disabled = isP2;
  timerSelect.disabled = isP2;

  document.querySelectorAll('.toggle-card').forEach(card => {
    if (isP2) {
      card.classList.add('readonly');
      card.setAttribute('title', 'Controlled by Player 1 (Host)');
    } else {
      card.classList.remove('readonly');
      card.removeAttribute('title');
    }
  });
}

// 1. Lobby Setup & Settings Listeners
joinBtn.addEventListener('click', () => {
  const roomCode = roomInput.value.trim();
  if (roomCode) {
    socket.emit('joinRoom', {
      roomCode,
      settings: {
        chainingEnabled: chainToggle.checked,
        championLocking: lockingToggle.checked,
        roundDuration: parseInt(timerSelect.value, 10)
      }
    });
    joinBtn.disabled = true;
    roomInput.disabled = true;
  }
});

chainToggle.addEventListener('change', (e) => {
  socket.emit('toggleChaining', { enabled: e.target.checked });
});

lockingToggle.addEventListener('change', (e) => {
  socket.emit('toggleChampionLocking', { enabled: e.target.checked });
});

timerSelect.addEventListener('change', (e) => {
  socket.emit('setRoundDuration', { duration: e.target.value });
});

socket.on('settingsUpdated', ({ chainingEnabled, championLocking, roundDuration, message }) => {
  chainToggle.checked = chainingEnabled;
  lockingToggle.checked = championLocking;
  timerSelect.value = roundDuration;
  if (message) {
    systemMsg.innerText = message;
  } else if (gameActive) {
    const timerText = roundDuration === 0 ? 'Unlimited' : `${roundDuration}s`;
    systemMsg.innerText = `Settings updated! Mode: ${chainingEnabled ? 'Chain ON' : 'Chain OFF'} | Locking: ${championLocking ? 'ON' : 'OFF'} | Timer: ${timerText}`;
  }
});

// 2. Session Initialization
socket.on('initSession', (data) => {
  myPlayerNum = data.playerNum;
  currentPlayer = data.currentPlayer;
  boardState = data.board;
  chainToggle.checked = data.chainingEnabled;
  lockingToggle.checked = data.championLocking;
  timerSelect.value = data.roundDuration;
  championPool = data.championPool || [];
  usedChampions = data.usedChampions || [];

  applyControlPermissions();

  systemMsg.innerText = `Connected as Player ${myPlayerNum} (${myPlayerNum === 1 ? 'Host' : 'Guest'}). Waiting for opponent...`;
  renderBoard(boardState);
});

socket.on('gameStart', ({ currentPlayer: starter, chainingEnabled, championLocking, roundDuration }) => {
  gameActive = true;
  currentPlayer = starter;

  chainToggle.checked = chainingEnabled;
  lockingToggle.checked = championLocking;
  timerSelect.value = roundDuration;

  applyControlPermissions();
  updateTurnDisplay();
  
  const timerText = roundDuration === 0 ? 'Unlimited' : `${roundDuration}s`;
  systemMsg.innerText = `Match Started! Mode: ${chainingEnabled ? 'Chain ON' : 'Chain OFF'} | Locking: ${championLocking ? 'ON' : 'OFF'} | Timer: ${timerText}`;
});

// Timer Bar Handler
socket.on('timerUpdate', ({ timeLeft, totalDuration }) => {
  if (totalDuration === 0) {
    timerProgress.classList.add('unlimited');
  } else {
    timerProgress.classList.remove('unlimited');
    timerProgress.style.width = `${(timeLeft / totalDuration) * 100}%`;
  }
});

// 3. Board Rendering
function renderBoard(board) {
  hexGrid.innerHTML = '';
  const pointsStr = createHexPoints(HEX_RADIUS - 2);

  board.forEach(tile => {
    const { x, y } = hexToPixel(tile.q, tile.r);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `hex-tile owner-${tile.owner}`);
    g.setAttribute('id', tile.id);
    g.setAttribute('transform', `translate(${x}, ${y})`);

    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    inner.setAttribute('class', 'hex-inner');

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('class', 'hex-polygon');
    poly.setAttribute('points', pointsStr);

    const textCat = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textCat.setAttribute('class', 'hex-text-cat');
    textCat.setAttribute('y', -12);
    textCat.setAttribute('fill', tile.criteriaObj.color || '#94a3b8');
    textCat.textContent = tile.criteriaObj.cat;

    const textName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textName.setAttribute('class', 'hex-text-name');
    textName.setAttribute('y', 8);
    textName.textContent = tile.criteriaObj.name;

    inner.appendChild(poly);
    inner.appendChild(textCat);
    inner.appendChild(textName);
    g.appendChild(inner);

    g.addEventListener('click', () => onHexClick(tile));
    hexGrid.appendChild(g);
  });
}

function onHexClick(tile) {
  if (!gameActive) {
    systemMsg.innerText = "Match has not started yet. Waiting for both players...";
    return;
  }
  if (myPlayerNum !== currentPlayer) {
    systemMsg.innerText = "It is not your turn!";
    return;
  }
  if (tile.owner !== 0) {
    systemMsg.innerText = "This hex is already claimed!";
    return;
  }

  document.querySelectorAll('.hex-tile').forEach(el => el.classList.remove('selected'));
  const targetEl = document.getElementById(tile.id);
  if (targetEl) targetEl.classList.add('selected');

  selectedHexId = tile.id;
  selectedDisplay.innerHTML = `Selected: <strong>[${tile.criteriaObj.cat}] ${tile.criteriaObj.name}</strong>`;
  champInput.disabled = false;
  submitBtn.disabled = false;
  champInput.value = '';
  hideSuggestions();
  champInput.focus();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getResolvedChampionName(rawInput) {
  const query = (rawInput || '').trim();
  if (!query) return '';

  // 1. Exact match (case-insensitive)
  const exact = championPool.find(c => c.toLowerCase() === query.toLowerCase());
  if (exact) return exact;

  // 2. Starts with query
  const starts = championPool.filter(c => c.toLowerCase().startsWith(query.toLowerCase()));
  if (starts.length > 0) {
    if (lockingToggle.checked) {
      const unlocked = starts.find(c => !usedChampions.includes(c));
      if (unlocked) return unlocked;
    }
    return starts[0];
  }

  // 3. Contains query
  const contains = championPool.filter(c => c.toLowerCase().includes(query.toLowerCase()));
  if (contains.length > 0) {
    if (lockingToggle.checked) {
      const unlocked = contains.find(c => !usedChampions.includes(c));
      if (unlocked) return unlocked;
    }
    return contains[0];
  }

  return query;
}

function updateSuggestions() {
  const query = champInput.value.trim().toLowerCase();
  if (!query || !gameActive || myPlayerNum !== currentPlayer) {
    hideSuggestions();
    return;
  }

  const starts = [];
  const contains = [];

  championPool.forEach(name => {
    const lower = name.toLowerCase();
    if (lower.startsWith(query)) {
      starts.push(name);
    } else if (lower.includes(query)) {
      contains.push(name);
    }
  });

  const isLocked = (name) => lockingToggle.checked && usedChampions.includes(name);

  starts.sort((a, b) => {
    const aLocked = isLocked(a);
    const bLocked = isLocked(b);
    if (aLocked !== bLocked) return aLocked ? 1 : -1;
    return a.localeCompare(b);
  });

  contains.sort((a, b) => {
    const aLocked = isLocked(a);
    const bLocked = isLocked(b);
    if (aLocked !== bLocked) return aLocked ? 1 : -1;
    return a.localeCompare(b);
  });

  currentSuggestions = [...starts, ...contains].slice(0, 8);
  activeSuggestionIndex = -1;

  if (currentSuggestions.length === 0) {
    hideSuggestions();
    return;
  }

  renderSuggestions(query);
}

function renderSuggestions(query) {
  autocompleteList.innerHTML = '';
  currentSuggestions.forEach((name) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    if (lockingToggle.checked && usedChampions.includes(name)) {
      item.classList.add('locked');
    }

    const nameSpan = document.createElement('span');
    const lower = name.toLowerCase();
    const matchIdx = lower.indexOf(query);
    if (matchIdx >= 0) {
      const before = name.substring(0, matchIdx);
      const match = name.substring(matchIdx, matchIdx + query.length);
      const after = name.substring(matchIdx + query.length);
      nameSpan.innerHTML = `${escapeHtml(before)}<strong class="match-highlight">${escapeHtml(match)}</strong>${escapeHtml(after)}`;
    } else {
      nameSpan.textContent = name;
    }

    item.appendChild(nameSpan);

    if (lockingToggle.checked && usedChampions.includes(name)) {
      const tag = document.createElement('span');
      tag.className = 'locked-tag';
      tag.textContent = 'Locked';
      item.appendChild(tag);
    }

    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      champInput.value = name;
      hideSuggestions();
      champInput.focus();
    });

    autocompleteList.appendChild(item);
  });

  autocompleteList.classList.remove('hidden');
}

function hideSuggestions() {
  autocompleteList.classList.add('hidden');
  autocompleteList.innerHTML = '';
  currentSuggestions = [];
  activeSuggestionIndex = -1;
}

function moveActiveSuggestion(delta) {
  if (currentSuggestions.length === 0) return;
  activeSuggestionIndex += delta;
  if (activeSuggestionIndex < 0) activeSuggestionIndex = currentSuggestions.length - 1;
  if (activeSuggestionIndex >= currentSuggestions.length) activeSuggestionIndex = 0;

  const items = autocompleteList.querySelectorAll('.autocomplete-item');
  items.forEach((el, idx) => {
    if (idx === activeSuggestionIndex) {
      el.classList.add('active');
      el.scrollIntoView({ block: 'nearest' });
    } else {
      el.classList.remove('active');
    }
  });
}

champInput.addEventListener('input', updateSuggestions);

champInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    moveActiveSuggestion(1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    moveActiveSuggestion(-1);
  } else if (e.key === 'Tab') {
    if (currentSuggestions.length > 0) {
      e.preventDefault();
      const selected = activeSuggestionIndex >= 0 ? currentSuggestions[activeSuggestionIndex] : currentSuggestions[0];
      champInput.value = selected;
      hideSuggestions();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (activeSuggestionIndex >= 0 && currentSuggestions[activeSuggestionIndex]) {
      champInput.value = currentSuggestions[activeSuggestionIndex];
    } else {
      champInput.value = getResolvedChampionName(champInput.value);
    }
    hideSuggestions();
    sendMove();
  } else if (e.key === 'Escape') {
    hideSuggestions();
  }
});

champInput.addEventListener('blur', () => {
  setTimeout(() => {
    hideSuggestions();
  }, 150);
});

submitBtn.addEventListener('click', () => {
  if (activeSuggestionIndex >= 0 && currentSuggestions[activeSuggestionIndex]) {
    champInput.value = currentSuggestions[activeSuggestionIndex];
  } else {
    champInput.value = getResolvedChampionName(champInput.value);
  }
  hideSuggestions();
  sendMove();
});

function sendMove() {
  const resolved = getResolvedChampionName(champInput.value);
  if (!selectedHexId || !resolved) return;
  champInput.value = resolved;
  socket.emit('submitMove', {
    hexId: selectedHexId,
    champName: resolved
  });
}

// 4. Move Success & Capture Cascade Animation
socket.on('moveSuccess', (data) => {
  if (data.champName && !usedChampions.includes(data.champName)) {
    usedChampions.push(data.champName);
  }
  hideSuggestions();
  champInput.value = '';
  champInput.disabled = true;
  submitBtn.disabled = true;
  selectedDisplay.innerHTML = 'Selected: <em>None</em>';
  selectedHexId = null;

  p1Score.innerText = data.p1Score;
  p2Score.innerText = data.p2Score;

  applyCaptureStyle(data.primaryHexId, data.playerNum);

  if (data.stolenHexIds && data.stolenHexIds.length > 0) {
    data.stolenHexIds.forEach((hexId, index) => {
      setTimeout(() => {
        applyCaptureStyle(hexId, data.playerNum);
      }, (index + 1) * 120);
    });
  }
});

function applyCaptureStyle(hexId, playerNum) {
  const el = document.getElementById(hexId);
  if (!el) return;

  el.classList.remove('owner-0', 'owner-1', 'owner-2', 'selected');
  el.classList.add(`owner-${playerNum}`, 'anim-capture');

  setTimeout(() => {
    el.classList.remove('anim-capture');
  }, 500);
}

// 5. Hex Rejection Shake Animation
socket.on('hexVibrate', ({ hexId, reason, playerNum }) => {
  const el = document.getElementById(hexId);
  if (el) {
    el.classList.add('anim-vibrate');
    setTimeout(() => {
      el.classList.remove('anim-vibrate');
    }, 450);
  }

  if (myPlayerNum === playerNum) {
    hideSuggestions();
    champInput.classList.add('error-shake');
    setTimeout(() => {
      champInput.classList.remove('error-shake');
    }, 450);
  }

  systemMsg.innerText = reason;
});

// 6. Turn Lifecycle
socket.on('turnPass', ({ reason, currentPlayer: nextPlayer }) => {
  currentPlayer = nextPlayer;
  updateTurnDisplay();
  if (reason) systemMsg.innerText = reason;

  hideSuggestions();
  document.querySelectorAll('.hex-tile').forEach(el => el.classList.remove('selected'));
  selectedHexId = null;
  selectedDisplay.innerHTML = 'Selected: <em>None</em>';

  champInput.value = '';
  champInput.disabled = (myPlayerNum !== currentPlayer);
  submitBtn.disabled = (myPlayerNum !== currentPlayer);
});

function updateTurnDisplay() {
  if (myPlayerNum === currentPlayer) {
    turnAnnounce.innerText = "YOUR TURN";
    turnAnnounce.style.color = (myPlayerNum === 1) ? '#38bdf8' : '#f43f5e';
  } else {
    turnAnnounce.innerText = `PLAYER ${currentPlayer}'S TURN`;
    turnAnnounce.style.color = '#94a3b8';
  }
}

socket.on('gameOver', ({ winner, p1Score: finalP1, p2Score: finalP2 }) => {
  gameActive = false;
  turnAnnounce.innerText = winner === 0 ? "GAME OVER: DRAW!" : `PLAYER ${winner} WINS!`;
  turnAnnounce.style.color = '#facc15';
  systemMsg.innerText = `Final Score: P1 [${finalP1}] - P2 [${finalP2}]`;
  champInput.disabled = true;
  submitBtn.disabled = true;
});

socket.on('playerDisconnected', () => {
  systemMsg.innerText = "Opponent disconnected.";
});

socket.on('errorMsg', (msg) => {
  alert(msg);
});