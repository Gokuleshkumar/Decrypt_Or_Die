/* ==========================================================================
   DECRYPT OR DIE - APPLICATION ENGINE, SHUFFLED QUIZ & SESSION PERSISTENCE
   ========================================================================== */

// 25 ROUND 1 QUALIFYING QUIZ QUESTIONS (BASE QUESTION BANK)
const r1Questions = [
  {
    q: "What does HTTP stand for?",
    options: ["HyperText Transfer Protocol", "HyperTech Transfer Process", "High Text Transfer Program", "HyperText Transmission Portal"],
    correct: 0
  },
  {
    q: "Which default TCP port is used for HTTPS encrypted communication?",
    options: ["Port 80", "Port 21", "Port 443", "Port 22"],
    correct: 2
  },
  {
    q: "What type of cipher substitutes each plaintext letter by shifting a fixed number of positions?",
    options: ["RSA Algorithm", "Caesar Cipher", "AES-256", "Diffie-Hellman"],
    correct: 1
  },
  {
    q: "Which data structure operates on a First-In, First-Out (FIFO) principle?",
    options: ["Stack", "Queue", "Binary Tree", "Min Heap"],
    correct: 1
  },
  {
    q: "What is the main security role of a network firewall?",
    options: ["Cool down physical server racks", "Filter and monitor incoming and outgoing traffic", "Compress SQL database backups", "Increase wifi bandwidth"],
    correct: 1
  },
  {
    q: "Which hash function produces a 160-bit hash and is now considered cryptographically broken?",
    options: ["SHA-256", "SHA-1", "SHA-512", "BLAKE2b"],
    correct: 1
  },
  {
    q: "What does SQL stand for in database management?",
    options: ["Structured Query Language", "Sequential Queue Logic", "System Quality Level", "Standard Query Link"],
    correct: 0
  },
  {
    q: "In symmetric key cryptography:",
    options: ["Two different keys are used", "The same key is used for encryption and decryption", "No secret key is required", "Only public keys are used"],
    correct: 1
  },
  {
    q: "What attack floods a target server with artificial traffic to disable service access?",
    options: ["Man-in-the-Middle (MitM)", "Denial of Service (DoS / DDoS)", "Phishing Attack", "SQL Injection"],
    correct: 1
  },
  {
    q: "Which OSI model layer handles IP addressing and logical routing?",
    options: ["Physical Layer", "Network Layer", "Transport Layer", "Application Layer"],
    correct: 1
  },
  {
    q: "What is the standard IPv4 loopback address for localhost?",
    options: ["192.168.1.1", "10.0.0.1", "127.0.0.1", "255.255.255.0"],
    correct: 2
  },
  {
    q: "Which of the following is a non-linear data structure?",
    options: ["Array", "Singly Linked List", "Tree", "Queue"],
    correct: 2
  },
  {
    q: "What does VPN stand for?",
    options: ["Virtual Private Network", "Verified Public Node", "Visual Protection Gateway", "Variable Passcode Network"],
    correct: 0
  },
  {
    q: "In ROT13 cipher, how many positions down the alphabet is each letter shifted?",
    options: ["3 positions", "10 positions", "13 positions", "26 positions"],
    correct: 2
  },
  {
    q: "Which core operating system component manages memory, CPU schedules, and hardware drivers?",
    options: ["Shell", "Kernel", "Compiler", "BIOS"],
    correct: 1
  },
  {
    q: "What type of attack tricks users into surrendering passwords via fake emails or websites?",
    options: ["Phishing", "Buffer Overflow", "Cross-Site Scripting (XSS)", "Brute Force Attack"],
    correct: 0
  },
  {
    q: "What is the worst-case time complexity of QuickSort?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(1)"],
    correct: 2
  },
  {
    q: "Which HTTP status code signifies '404 Not Found'?",
    options: ["200 OK", "500 Internal Error", "404 Not Found", "301 Redirect"],
    correct: 2
  },
  {
    q: "What is an exploit payload primarily designed to do once delivered?",
    options: ["Format hard drive storage", "Grant terminal/shell control to the researcher", "Run antivirus updates", "Show desktop background popups"],
    correct: 1
  },
  {
    q: "Which command displays network interface details and IP addresses in Linux?",
    options: ["ipconfig", "ifconfig / ip addr", "netstat", "ping"],
    correct: 1
  },
  {
    q: "What is the total length of an IPv4 address in bits?",
    options: ["16 bits", "32 bits", "64 bits", "128 bits"],
    correct: 1
  },
  {
    q: "Which asymmetric encryption algorithm relies on the mathematical hardness of prime factorization?",
    options: ["AES-GCM", "RSA", "DES", "SHA-3"],
    correct: 1
  },
  {
    q: "What vulnerability occurs when untrusted user input is directly concatenated into SQL statements?",
    options: ["Cross-Site Scripting (XSS)", "SQL Injection", "CSRF", "Directory Traversal"],
    correct: 1
  },
  {
    q: "Which Git command downloads a remote repository copy to your local workspace?",
    options: ["git pull", "git push", "git clone", "git commit"],
    correct: 2
  },
  {
    q: "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct: 1
  }
];

// --- SHUFFLE HELPER (FISHER-YATES ALGORITHM) ---
function shuffleQuestions(questions) {
  const arr = questions.map(item => ({ ...item }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- GLOBAL GAME STATE ---
const state = {
  // Participant Registration
  participantName: '',
  teamName: '',
  collegeName: '',
  mobileNumber: '',
  teamHash: '',

  // Challenge Progression
  currentRound: 1,
  unlockedRound: 1,
  score: 0,
  timeRemainingSeconds: 2100, // 35 minutes
  timerStarted: false,
  soundEnabled: true,
  timerInterval: null,

  // Round 1 MCQ State
  shuffledR1Questions: null,
  r1CurrentQIndex: 0,
  r1UserAnswers: new Array(25).fill(null),
  r1Completed: false,
  tabSwitchCount: 0,

  // Round 2 Decryption Puzzles State
  r2CurrentIndex: 0,
  r2UserAnswers: new Array(6).fill(''),
  r2SolvedStatus: new Array(6).fill(false),
  r2TimeRemainingSeconds: 1500, // 25 minutes
  r2TimerStarted: false,
  r2TimerInterval: null,
  r2Completed: false,
  r2Score: 0,
  r2TimeTakenSeconds: 0,

  // Round 3 State
  r3CurrentMatrix: [],
  r3TargetMatrix: [
    1, 0, 0, 1,
    0, 1, 1, 0,
    0, 1, 1, 0,
    1, 0, 0, 1
  ],
  r3Completed: false
};

// --- WEB AUDIO SYNTHESIZER ---
class AudioController {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playClick() {
    if (!state.soundEnabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playSuccess() {
    if (!state.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }

  playError() {
    if (!state.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }

  playVictory() {
    if (!state.soundEnabled) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.12;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    });
  }
}

const sound = new AudioController();

// --- PERSISTENCE HELPERS (PREVENT RESET ON PAGE REFRESH) ---
function persistStateToStorage() {
  const payload = {
    participantName: state.participantName,
    teamName: state.teamName,
    collegeName: state.collegeName,
    mobileNumber: state.mobileNumber,
    teamHash: state.teamHash,
    currentRound: state.currentRound,
    unlockedRound: state.unlockedRound,
    score: state.score,
    timeRemainingSeconds: state.timeRemainingSeconds,
    timerStarted: state.timerStarted,
    r1Completed: state.r1Completed,
    r1CurrentQIndex: state.r1CurrentQIndex,
    r1UserAnswers: state.r1UserAnswers,
    shuffledR1Questions: state.shuffledR1Questions,
    r1QuizActive: state.r1QuizActive,
    tabSwitchCount: state.tabSwitchCount,
    r2CurrentIndex: state.r2CurrentIndex,
    r2UserAnswers: state.r2UserAnswers,
    r2SolvedStatus: state.r2SolvedStatus,
    r2TimeRemainingSeconds: state.r2TimeRemainingSeconds,
    r2TimerStarted: state.r2TimerStarted,
    r2Completed: state.r2Completed,
    r2Score: state.r2Score,
    r2TimeTakenSeconds: state.r2TimeTakenSeconds,
    r3Completed: state.r3Completed,
    r3CurrentMatrix: state.r3CurrentMatrix,
    disqualified: state.disqualified,
    disqualificationReason: state.disqualificationReason
  };
  try {
    sessionStorage.setItem('decrypt_session_data', JSON.stringify(payload));
  } catch (e) {
    console.warn('[STORAGE WARN]', e);
  }
}

window.logoutCurrentParticipant = function() {
  if (confirm('Are you sure you want to log out and start a new registration?')) {
    try {
      sessionStorage.removeItem('decrypt_session_data');
      localStorage.removeItem('decrypt_session_data');
    } catch(e) {}
    if (document.documentElement) document.documentElement.classList.remove('has-active-session');
    location.reload();
  }
};

function restoreStateFromStorage() {
  let saved = null;
  try {
    saved = sessionStorage.getItem('decrypt_session_data');
  } catch (e) {}

  if (!saved) {
    if (document.documentElement) document.documentElement.classList.remove('has-active-session');
    return false;
  }

  try {
    const data = JSON.parse(saved);
    if (data && data.participantName && data.teamName) {
      if (document.documentElement) document.documentElement.classList.add('has-active-session');

      state.participantName = data.participantName;
      state.teamName = data.teamName;
      state.collegeName = data.collegeName;
      state.mobileNumber = data.mobileNumber;
      state.teamHash = data.teamHash;
      state.currentRound = data.currentRound || 1;
      state.unlockedRound = data.unlockedRound || 1;
      state.score = data.score || 0;
      state.timeRemainingSeconds = data.timeRemainingSeconds !== undefined ? data.timeRemainingSeconds : 2100;
      state.timerStarted = data.timerStarted || false;
      state.r1Completed = data.r1Completed || false;
      state.r1CurrentQIndex = data.r1CurrentQIndex || 0;
      state.r1UserAnswers = data.r1UserAnswers || new Array(25).fill(null);
      if (data.shuffledR1Questions && data.shuffledR1Questions.length === 25) {
        state.shuffledR1Questions = data.shuffledR1Questions;
      }
      state.r1QuizActive = data.r1QuizActive || false;
      state.tabSwitchCount = data.tabSwitchCount || 0;
      state.r2CurrentIndex = data.r2CurrentIndex || 0;
      state.r2UserAnswers = data.r2UserAnswers || new Array(6).fill('');
      state.r2SolvedStatus = data.r2SolvedStatus || new Array(6).fill(false);
      state.r2TimeRemainingSeconds = data.r2TimeRemainingSeconds !== undefined ? data.r2TimeRemainingSeconds : 1500;
      state.r2TimerStarted = data.r2TimerStarted || false;
      state.r2Completed = data.r2Completed || false;
      state.r2Score = data.r2Score || 0;
      state.r2TimeTakenSeconds = data.r2TimeTakenSeconds || 0;
      state.r3Completed = data.r3Completed || false;
      state.disqualified = data.disqualified || false;
      state.disqualificationReason = data.disqualificationReason || '';
      if (data.r3CurrentMatrix && data.r3CurrentMatrix.length === 16) {
        state.r3CurrentMatrix = data.r3CurrentMatrix;
      }

      updateHeaderTelemetryUI();

      // If disqualified, show the disqualified view but continue restoring the dashboard underneath
      if (state.disqualified) {
        const startBtn = document.getElementById('btn-start-r1-quiz');
        if (startBtn) {
          startBtn.disabled = true;
          startBtn.style.opacity = '0.4';
          startBtn.style.cursor = 'not-allowed';
          startBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Disqualified';
        }
        showDisqualifiedView();
      }

      if (state.r1Completed && state.unlockedRound < 2) {
        showWaitingView();
        return true;
      }

      // Transition views: Hide Login view and Show Mission Dashboard view
      const loginView = document.getElementById('view-login');
      if (loginView) {
        loginView.classList.remove('active');
        loginView.style.display = 'none';
      }

      const dashView = document.getElementById('view-dashboard');
      if (dashView) {
        dashView.classList.add('active');
        dashView.style.display = 'flex';
      }

      // Restore unlocked status for rounds
      for (let r = 1; r <= state.unlockedRound; r++) {
        unlockRound(r);
      }

      // Switch to the saved current round tab
      switchRoundTab(state.currentRound);

      // Restore Round 1 quiz UI if quiz was active or in progress
      if (state.r1QuizActive || (state.timerStarted && !state.r1Completed)) {
        const rulesView = document.getElementById('r1-rules-view');
        const quizView = document.getElementById('r1-quiz-view');
        const descElem = document.getElementById('r1-banner-desc');

        if (rulesView) rulesView.style.display = 'none';
        if (quizView) quizView.style.display = 'block';
        if (descElem) descElem.innerText = 'Select correct answers for all 25 questions and click Submit.';

        buildPaletteGrid();
        renderQuestion(state.r1CurrentQIndex);
      } else if (state.r1Completed) {
        const rulesView = document.getElementById('r1-rules-view');
        const quizView = document.getElementById('r1-quiz-view');
        const waitingSubview = document.getElementById('r1-waiting-subview');
        const descElem = document.getElementById('r1-banner-desc');

        if (rulesView) rulesView.style.display = 'none';
        if (quizView) quizView.style.display = 'none';
        if (waitingSubview) waitingSubview.style.display = 'block';
        if (descElem) descElem.innerText = state.unlockedRound >= 2 
          ? 'Round 1 Quiz Completed successfully.' 
          : 'Round 1 Quiz Submitted! Submission Recorded. Awaiting Admin Selection & Approval to unlock Round 2.';

        const sp = document.getElementById('sub-part-name');
        const st = document.getElementById('sub-team-name');
        const sc = document.getElementById('sub-coll-name');
        const sh = document.getElementById('sub-team-hash');

        if (sp) sp.innerText = state.participantName || '-';
        if (st) st.innerText = state.teamName || '-';
        if (sc) sc.innerText = state.collegeName || '-';
        if (sh) sh.innerText = state.teamHash || '-';
      }

      // Restore Round 2 puzzle state if active
      if (state.currentRound === 2 && state.r2TimerStarted && !state.r2Completed) {
        const rulesView = document.getElementById('r2-rules-view');
        const puzzleView = document.getElementById('r2-puzzle-view');
        const descElem = document.getElementById('r2-banner-desc');

        if (rulesView) rulesView.style.display = 'none';
        if (puzzleView) puzzleView.style.display = 'block';
        if (descElem) descElem.innerText = 'Decrypt all 6 ciphers and click Submit Round 2 Puzzles.';

        buildR2PaletteGrid();
        renderR2Puzzle(state.r2CurrentIndex);
        if (state.r2TimeRemainingSeconds > 0) startR2Timer();
      } else if (state.r2Completed) {
        const rulesView = document.getElementById('r2-rules-view');
        const puzzleView = document.getElementById('r2-puzzle-view');
        const waitingSubview = document.getElementById('r2-waiting-subview');
        const descElem = document.getElementById('r2-banner-desc');

        if (rulesView) rulesView.style.display = 'none';
        if (puzzleView) puzzleView.style.display = 'none';
        if (waitingSubview) waitingSubview.style.display = 'block';
        if (descElem) descElem.innerText = 'Round 2 Decryption Puzzles Completed! Waiting results for round-2.';

        const solvedElem = document.getElementById('r2-sub-solved');
        const scoreElem = document.getElementById('r2-sub-score');
        const timeElem = document.getElementById('r2-sub-time');
        const hashElem = document.getElementById('r2-sub-hash');

        let solvedCount = 0;
        state.r2SolvedStatus.forEach(status => { if (status) solvedCount++; });

        if (solvedElem) solvedElem.innerText = `${solvedCount} / 6 Solved`;
        if (scoreElem) scoreElem.innerText = `${state.r2Score} PTS`;

        const mins = Math.floor(state.r2TimeTakenSeconds / 60);
        const secs = state.r2TimeTakenSeconds % 60;
        if (timeElem) timeElem.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        if (hashElem) hashElem.innerText = state.teamHash;
      }

      // Resume countdown timer if timer was started
      if (state.timerStarted && !state.r1Completed && state.timeRemainingSeconds > 0) {
        startTimer();
      } else {
        const mins = Math.floor(state.timeRemainingSeconds / 60);
        const secs = state.timeRemainingSeconds % 60;
        document.querySelectorAll('.countdown-timer-display').forEach(el => el.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        
        // Change color based on remaining time
        const timerColor = state.timeRemainingSeconds <= 60 ? 'var(--accent-red)' : 'var(--accent-green)';
        document.querySelectorAll('.timer-val').forEach(el => el.style.color = timerColor);
      }

      // If Round 1 is completed and waiting for admin selection, start polling
      if (state.r1Completed && state.unlockedRound < 2 && !state.disqualified) {
        startAdminApprovalPolling();
      }

      updateMetricsDisplay();
      return true;
    }
  } catch (err) {
    console.warn('[RESTORE WARN]', err);
  }
  if (document.documentElement) document.documentElement.classList.remove('has-active-session');
  return false;
}

function updateHeaderTelemetryUI() {
  const tElem = document.getElementById('hdr-team-name');
  const hElem = document.getElementById('hdr-team-hash');
  const hTopElem = document.getElementById('hdr-team-id-top');

  if (tElem) tElem.innerText = state.teamName;
  if (hElem) hElem.innerText = state.teamHash;
  if (hTopElem) hTopElem.innerText = state.teamHash;

  const vpElem = document.getElementById('v-participant');
  const vtElem = document.getElementById('v-team');
  const vcElem = document.getElementById('v-college');
  const vmElem = document.getElementById('v-mobile');
  const vhElem = document.getElementById('v-hash');

  if (vpElem) vpElem.innerText = state.participantName;
  if (vtElem) vtElem.innerText = state.teamName;
  if (vcElem) vcElem.innerText = state.collegeName;
  if (vmElem) vmElem.innerText = state.mobileNumber;
  if (vhElem) vhElem.innerText = state.teamHash;
}

// --- INITIALIZATION ---
// Immediate restoration as script parses
restoreStateFromStorage();

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initRound3Grid();
  loadExternalQuestions();

  const regForm = document.getElementById('registration-form');
  if (regForm) {
    regForm.addEventListener('submit', window.handleRegistrationSubmit);
  }

  // Restore Active Session on Page Refresh
  restoreStateFromStorage();
});

// --- MONGODB REGISTRATION SUBMIT HANDLER ---
let isFormSubmitting = false;

window.handleRegistrationSubmit = async function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (isFormSubmitting) return false;
  isFormSubmitting = true;

  const teamInput = document.getElementById('reg-team');
  const idInput = document.getElementById('reg-id');

  const teamName = teamInput ? teamInput.value.trim() : '';
  const teamHash = idInput ? idInput.value.trim() : '';
  const statusMsg = document.getElementById('login-status-msg');
  const submitBtn = document.getElementById('btn-submit-reg');

  if (!teamName || !teamHash) {
    isFormSubmitting = false;
    if (statusMsg) {
      statusMsg.style.color = '#ef4444';
      statusMsg.innerText = 'Please complete all required fields.';
    }
    alert('Please fill in Team Name and Team ID.');
    return false;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to MongoDB Compass...';
  }

  if (statusMsg) {
    statusMsg.style.color = '#3b82f6';
    statusMsg.innerText = `Connecting to MongoDB...`;
  }

  const serverUrl = window.location.origin.startsWith('http') 
    ? '/api/login' 
    : 'http://localhost:8080/api/login';

  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName,
        teamHash
      })
    });

    const data = await response.json();

    if (data.success) {
      if (statusMsg) {
        statusMsg.style.color = '#10b981';
        statusMsg.innerText = `Logged into MongoDB Compass! Team: "${teamName}"`;
      }
      saveSessionAndTransition(teamName, teamHash);
    } else {
      if (statusMsg) {
        statusMsg.style.color = '#ef4444';
        statusMsg.innerText = data.message || 'Login error.';
      }
      alert(data.message || 'Login error.');
      isFormSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
      }
    }
  } catch (err) {
    console.error('[MONGODB COMPASS NOTE]:', err);
    if (statusMsg) {
      statusMsg.style.color = '#ef4444';
      statusMsg.innerText = 'Network error: ' + err.message;
    }
    alert('Failed to connect to the server. Please try again.');
    isFormSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Login';
    }
  }

  return false;
};

function saveSessionAndTransition(teamName, teamHash) {
  if (document.documentElement) document.documentElement.classList.add('has-active-session');
  // Initialize missing fields as empty string or placeholder for backward compatibility
  state.participantName = 'Participant';
  state.teamName = teamName;
  state.collegeName = 'College';
  state.mobileNumber = '0000000000';
  state.teamHash = teamHash;

  updateHeaderTelemetryUI();
  persistStateToStorage();

  sound.playSuccess();

  setTimeout(() => {
    // Hide Page 1 (Login View)
    const loginView = document.getElementById('view-login');
    if (loginView) {
      loginView.classList.remove('active');
      loginView.style.display = 'none';
    }

    // Show Page 2 (Dashboard View)
    const dashView = document.getElementById('view-dashboard');
    if (dashView) {
      dashView.classList.add('active');
      dashView.style.display = 'flex';
    }

    document.querySelectorAll('.countdown-timer-display').forEach(el => el.innerText = '35:00');
    updateMetricsDisplay();
  }, 400);
}

// --- FULLSCREEN & PROCTORING ANTI-CHEAT HELPERS ---
function requestFullScreen() {
  const elem = document.documentElement;
  try {
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  } catch (e) {}
}

let lastTabViolationTime = 0;

function triggerTabViolation(reason) {
  const isR1Active = state.r1QuizActive && !state.r1Completed;
  const isR2Active = state.r2TimerStarted && !state.r2Completed;

  if (!isR1Active && !isR2Active) return;

  const now = Date.now();
  if (now - lastTabViolationTime < 2500) return;
  lastTabViolationTime = now;

  state.tabSwitchCount = (state.tabSwitchCount || 0) + 1;
  persistStateToStorage();

  sound.playError();

  const countElem = document.getElementById('tab-violation-count');
  const reasonElem = document.getElementById('tab-warning-reason');

  if (countElem) countElem.innerText = `${state.tabSwitchCount} / 2`;
  if (reasonElem) reasonElem.innerText = `${reason}. Navigating away from the quiz window or exiting fullscreen is prohibited.`;

  openModal('modal-tab-warning');

  if (state.tabSwitchCount >= 2) {
    setTimeout(() => {
      closeModal('modal-tab-warning');
      
      const partElem = document.getElementById('dq-part-name');
      const teamElem = document.getElementById('dq-team-name');
      const collElem = document.getElementById('dq-college-name');
      const reasonElemDq = document.getElementById('dq-reason-text');
      
      if (partElem) partElem.innerText = state.participantName;
      if (teamElem) teamElem.innerText = state.teamName;
      if (collElem) collElem.innerText = state.collegeName;
      if (reasonElemDq) reasonElemDq.innerText = `You have committed 2 proctoring violations (${reason}).`;

      showDisqualifiedView(); // Hide dashboard instantly so no buttons are clickable
      openModal('modal-disqualified-alert');
      if (isR1Active) {
        submitR1Quiz(true, `Exceeded 2 proctoring violations (${reason})`);
      } else if (isR2Active) {
        submitR2Puzzles(true, `Exceeded 2 proctoring violations (${reason})`);
      }
    }, 800);
  }
}

window.handleDisqualificationOk = function() {
  closeModal('modal-disqualified-alert');
  showDisqualifiedView();
};

function showDisqualifiedView() {
  state.disqualified = true;
  state.r1QuizActive = false;
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  if (state.r2TimerInterval) {
    clearInterval(state.r2TimerInterval);
    state.r2TimerInterval = null;
  }
  persistStateToStorage();
  
  // Do not hide the dashboard so the data remains visible behind the overlay
  const dqView = document.getElementById('view-disqualified');
  if (dqView) {
    dqView.classList.add('active');
    dqView.style.display = 'flex';
  }

  const startBtn = document.getElementById('btn-start-r1-quiz');
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.style.opacity = '0.4';
    startBtn.style.cursor = 'not-allowed';
    startBtn.style.pointerEvents = 'none';
    startBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Disqualified';
  }

  const prevBtn = document.getElementById('btn-prev-q');
  const nextBtn = document.getElementById('btn-next-q');
  const submitBtn = document.getElementById('btn-submit-r1-quiz');
  if (prevBtn) { prevBtn.disabled = true; prevBtn.style.pointerEvents = 'none'; prevBtn.style.opacity = '0.5'; }
  if (nextBtn) { nextBtn.disabled = true; nextBtn.style.pointerEvents = 'none'; nextBtn.style.opacity = '0.5'; }
  if (submitBtn) { submitBtn.disabled = true; submitBtn.style.pointerEvents = 'none'; submitBtn.style.opacity = '0.5'; }

  const r2PrevBtn = document.getElementById('btn-prev-pz');
  const r2NextBtn = document.getElementById('btn-next-pz');
  const r2SubmitBtn = document.getElementById('btn-submit-r2-puzzles');
  if (r2PrevBtn) { r2PrevBtn.disabled = true; r2PrevBtn.style.pointerEvents = 'none'; r2PrevBtn.style.opacity = '0.5'; }
  if (r2NextBtn) { r2NextBtn.disabled = true; r2NextBtn.style.pointerEvents = 'none'; r2NextBtn.style.opacity = '0.5'; }
  if (r2SubmitBtn) { r2SubmitBtn.disabled = true; r2SubmitBtn.style.pointerEvents = 'none'; r2SubmitBtn.style.opacity = '0.5'; }
}

function showWaitingView() {
  // Ensure Mission Dashboard view is active
  const loginView = document.getElementById('view-login');
  if (loginView) { loginView.classList.remove('active'); loginView.style.display = 'none'; }

  const dashView = document.getElementById('view-dashboard');
  if (dashView) { dashView.classList.add('active'); dashView.style.display = 'flex'; }

  // Hide rules subview and quiz subview inside Round 1 stage
  const rulesView = document.getElementById('r1-rules-view');
  const quizView = document.getElementById('r1-quiz-view');
  const waitingSubview = document.getElementById('r1-waiting-subview');
  const descElem = document.getElementById('r1-banner-desc');

  if (rulesView) rulesView.style.display = 'none';
  if (quizView) quizView.style.display = 'none';
  if (waitingSubview) waitingSubview.style.display = 'block';
  if (descElem) descElem.innerText = 'Round 1 Quiz Submitted! Submission Recorded. Awaiting Admin Selection & Approval to unlock Round 2.';

  // Populate subview participant summary
  const sp = document.getElementById('sub-part-name');
  const st = document.getElementById('sub-team-name');
  const sc = document.getElementById('sub-coll-name');
  const sh = document.getElementById('sub-team-hash');

  if (sp) sp.innerText = state.participantName || '-';
  if (st) st.innerText = state.teamName || '-';
  if (sc) sc.innerText = state.collegeName || '-';
  if (sh) sh.innerText = state.teamHash || '-';

  // Also populate top-level waiting view elements if needed
  const wp = document.getElementById('wait-part-name');
  const wt = document.getElementById('wait-team-name');
  const wc = document.getElementById('wait-coll-name');
  const wh = document.getElementById('wait-team-hash');

  if (wp) wp.innerText = state.participantName || '-';
  if (wt) wt.innerText = state.teamName || '-';
  if (wc) wc.innerText = state.collegeName || '-';
  if (wh) wh.innerText = state.teamHash || '-';
}

// --- ROUND 1 QUIZ ENGINE ---
function startRound1Quiz() {
  sound.playClick();
  requestFullScreen();
  
  // Shuffle questions randomly for this participant
  if (!state.shuffledR1Questions || state.shuffledR1Questions.length === 0) {
    state.shuffledR1Questions = shuffleQuestions(r1Questions);
  }

  state.r1QuizActive = true;

  // Hide Rules View, Show Quiz View
  const rulesView = document.getElementById('r1-rules-view');
  const quizView = document.getElementById('r1-quiz-view');
  const descElem = document.getElementById('r1-banner-desc');

  if (rulesView) rulesView.style.display = 'none';
  if (quizView) quizView.style.display = 'block';
  if (descElem) descElem.innerText = 'Select correct answers for all 25 questions and click Submit.';

  // Build Palette Grid (1..25)
  buildPaletteGrid();

  // Render Q1
  state.r1CurrentQIndex = 0;
  renderQuestion(0);

  // START 35-MINUTE TIMER NOW
  if (!state.timerStarted) {
    state.timerStarted = true;
    startTimer();
  }

  persistStateToStorage();
}

function buildPaletteGrid() {
  const grid = document.getElementById('q-palette-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let i = 0; i < 25; i++) {
    const btn = document.createElement('button');
    btn.className = 'palette-item';
    btn.id = `palette-btn-${i}`;
    btn.innerText = i + 1;
    if (state.disqualified) {
      btn.disabled = true;
      btn.classList.add('disabled');
      btn.style.pointerEvents = 'none';
    }
    btn.onclick = () => {
      if (state.disqualified) return;
      state.r1CurrentQIndex = i;
      renderQuestion(i);
      persistStateToStorage();
    };
    grid.appendChild(btn);
  }
}

function renderQuestion(index) {
  const questionsList = state.shuffledR1Questions || r1Questions;
  const qData = questionsList[index];
  if (!qData) return;

  const counterTag = document.getElementById('q-counter-tag');
  const promptElem = document.getElementById('q-prompt-text');
  const optionsContainer = document.getElementById('q-options-container');
  const prevBtn = document.getElementById('btn-prev-q');
  const nextBtn = document.getElementById('btn-next-q');
  const submitBtn = document.getElementById('btn-submit-r1-quiz');

  if (counterTag) counterTag.innerText = `Question ${index + 1} of 25`;
  if (promptElem) promptElem.innerText = `${index + 1}. ${qData.q}`;

  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    qData.options.forEach((optText, optIdx) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      if (state.disqualified) {
        card.classList.add('disabled');
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.45';
        card.style.cursor = 'not-allowed';
      } else {
        card.classList.remove('disabled');
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
        card.style.cursor = 'pointer';
      }

      if (state.r1UserAnswers[index] === optIdx) {
        card.classList.add('selected');
      }

      card.onclick = () => {
        if (state.disqualified) return;
        state.r1UserAnswers[index] = optIdx;
        sound.playClick();
        renderQuestion(index);
        updatePaletteGrid();
        updateScoreTag();
        persistStateToStorage();
      };

      card.innerHTML = `
        <div class="opt-letter">${letters[optIdx]}</div>
        <div class="opt-text">${optText}</div>
      `;
      optionsContainer.appendChild(card);
    });
  }

  // Update Nav Buttons
  if (prevBtn) {
    prevBtn.disabled = (index === 0) || state.disqualified;
    if (state.disqualified || index === 0) {
      prevBtn.style.pointerEvents = 'none';
      prevBtn.style.opacity = '0.45';
      prevBtn.style.cursor = 'not-allowed';
    } else {
      prevBtn.style.pointerEvents = 'auto';
      prevBtn.style.opacity = '1';
      prevBtn.style.cursor = 'pointer';
    }
  }
  
  if (index === 24) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) {
      submitBtn.style.display = 'inline-flex';
      submitBtn.disabled = state.disqualified;
      if (state.disqualified) {
        submitBtn.style.pointerEvents = 'none';
        submitBtn.style.opacity = '0.45';
        submitBtn.style.cursor = 'not-allowed';
      } else {
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
    }
  } else {
    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.disabled = state.disqualified;
      if (state.disqualified) {
        nextBtn.style.pointerEvents = 'none';
        nextBtn.style.opacity = '0.45';
        nextBtn.style.cursor = 'not-allowed';
      } else {
        nextBtn.style.pointerEvents = 'auto';
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
      }
    }
    if (submitBtn) submitBtn.style.display = 'none';
  }

  updatePaletteGrid();
}

function updatePaletteGrid() {
  for (let i = 0; i < 25; i++) {
    const btn = document.getElementById(`palette-btn-${i}`);
    if (!btn) continue;

    btn.className = 'palette-item';
    if (state.disqualified) {
      btn.disabled = true;
      btn.classList.add('disabled');
      btn.style.pointerEvents = 'none';
    } else {
      btn.disabled = false;
      btn.classList.remove('disabled');
      btn.style.pointerEvents = 'auto';
    }
    if (state.r1UserAnswers[i] !== null) {
      btn.classList.add('answered');
    }
    if (i === state.r1CurrentQIndex) {
      btn.classList.add('active');
    }
  }
}

function updateScoreTag() {
  let score = 0;
  const questionsList = state.shuffledR1Questions || r1Questions;
  state.r1UserAnswers.forEach((ans, idx) => {
    if (questionsList[idx] && ans === questionsList[idx].correct) {
      score += 15;
    }
  });
  state.score = score;
  updateMetricsDisplay();
}

let approvalPollingInterval = null;

function startAdminApprovalPolling() {
  if (approvalPollingInterval) clearInterval(approvalPollingInterval);

  approvalPollingInterval = setInterval(async () => {
    if (!state.teamHash || state.unlockedRound >= 3) {
      clearInterval(approvalPollingInterval);
      return;
    }

    const serverUrl = window.location.origin.startsWith('http') 
      ? `/api/participant-status?teamHash=${encodeURIComponent(state.teamHash)}` 
      : `http://localhost:8080/api/participant-status?teamHash=${encodeURIComponent(state.teamHash)}`;

    try {
      const res = await fetch(serverUrl);
      const data = await res.json();

      if (data.success && data.round3Approved && state.unlockedRound < 3) {
        state.disqualified = false;
        state.disqualificationReason = '';
        state.r2Completed = true;
        
        const waitingView = document.getElementById('view-waiting');
        if (waitingView) { waitingView.classList.remove('active'); waitingView.style.display = 'none'; }
        const dqView = document.getElementById('view-disqualified');
        if (dqView) { dqView.classList.remove('active'); dqView.style.display = 'none'; }
        const dashView = document.getElementById('view-dashboard');
        if (dashView) { dashView.classList.add('active'); dashView.style.display = 'flex'; }

        sound.playVictory();
        unlockRound(3);
        switchRoundTab(3);
        persistStateToStorage();
        alert(`CONGRATULATIONS!\n\nYour team "${state.teamName}" has been SELECTED & APPROVED by the Admin for Round 3!\n\nNeural Core Matrix is now UNLOCKED.`);
        return;
      }

      if (data.success && data.round2Approved && state.unlockedRound < 2) {
        const r1Status = document.getElementById('r1-waiting-status-text');
        if (r1Status) {
          r1Status.innerHTML = '<i class="fa-solid fa-circle-check"></i> Selected for Round-2';
          r1Status.style.color = 'var(--accent-green)';
        }

        const globalStatus = document.getElementById('global-waiting-status-text');
        if (globalStatus) {
          globalStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Selected for Round-2';
          globalStatus.style.color = 'var(--accent-green)';
        }

        setTimeout(() => {
          state.disqualified = false;
          state.disqualificationReason = '';
          state.r1Completed = true;
          
          const dashView = document.getElementById('view-dashboard');
          if (dashView) { dashView.classList.add('active'); dashView.style.display = 'flex'; }

          sound.playVictory();
          unlockRound(2);
          switchRoundTab(2);
          persistStateToStorage();
          alert(`CONGRATULATIONS!\n\nYour team "${state.teamName}" has been SELECTED & APPROVED by the Admin for Round 2!\n\nDecryption Puzzles are now UNLOCKED.`);
        }, 1500);
        return;
      }

      if (data.success && data.disqualified && !data.round2Approved && !data.round3Approved) {
        state.disqualified = true;
        state.disqualificationReason = data.disqualificationReason || 'Disqualified by Admin';
        showDisqualifiedView();
        openModal('modal-disqualified-alert');
        persistStateToStorage();
        return;
      }
    } catch (e) {
      console.warn('[APPROVAL POLLING NOTE]', e);
    }
  }, 4000);
}

async function submitR1Quiz(isDisqualified = false, disqualificationReason = '') {
  if (state.disqualified) return;
  const actuallyDisqualified = isDisqualified === true;
  const reason = typeof disqualificationReason === 'string' ? disqualificationReason : '';
  if (state.timerInterval) clearInterval(state.timerInterval);

  let correctCount = 0;
  const questionsList = state.shuffledR1Questions || r1Questions;
  state.r1UserAnswers.forEach((ans, idx) => {
    if (questionsList[idx] && ans === questionsList[idx].correct) {
      correctCount++;
    }
  });

  const finalScore = actuallyDisqualified ? 0 : correctCount * 15;
  state.score = finalScore;
  state.r1Completed = true;
  state.r1QuizActive = false;

  if (actuallyDisqualified) {
    state.disqualified = true;
    state.disqualificationReason = reason;
    const startBtn = document.getElementById('btn-start-r1-quiz');
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.style.opacity = '0.4';
      startBtn.style.cursor = 'not-allowed';
      startBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Disqualified';
    }
  } else {
    sound.playSuccess();
    // Round 2 remains locked until Admin selects/approves participant in Admin Portal
  }

  state.r1TimeTakenSeconds = Math.max(0, 2100 - state.timeRemainingSeconds);

  const serverUrl = window.location.origin.startsWith('http') 
    ? '/api/submit-round1' 
    : 'http://localhost:8080/api/submit-round1';

  try {
    await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantName: state.participantName,
        teamName: state.teamName,
        collegeName: state.collegeName,
        mobileNumber: state.mobileNumber,
        teamHash: state.teamHash,
        score: finalScore,
        correctCount: correctCount,
        timeTakenSeconds: state.r1TimeTakenSeconds,
        tabSwitchCount: state.tabSwitchCount,
        disqualified: actuallyDisqualified,
        disqualificationReason: reason || (actuallyDisqualified ? 'Exceeded maximum 2 proctoring violations' : ''),
        incidentReport: {
          participantName: state.participantName,
          teamName: state.teamName,
          collegeName: state.collegeName,
          mobileNumber: state.mobileNumber,
          teamHash: state.teamHash,
          violationCount: state.tabSwitchCount,
          reason: reason || 'Exceeded maximum 2 proctoring violations',
          timestamp: new Date().toISOString()
        }
      })
    });
  } catch (err) {
    console.warn('[MONGODB R1 SAVE NOTE]:', err);
  }

  persistStateToStorage();

  if (!actuallyDisqualified) {
    showWaitingView();
    openModal('modal-r1-submitted');
    startAdminApprovalPolling();
  }
}

window.submitR1Quiz = submitR1Quiz;

// --- TIMER CONTROL (35 MINUTES) ---
function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {
    if (state.timeRemainingSeconds <= 0) {
      clearInterval(state.timerInterval);
      document.querySelectorAll('.countdown-timer-display').forEach(el => el.innerText = '00:00');
      
      if (state.currentRound === 1 && !state.r1Completed) {
        alert('TIME EXPIRED! Round 1 Quiz auto-submitted.');
        submitR1Quiz();
      } else if (state.currentRound === 2 && !state.r2Completed) {
        alert('TIME EXPIRED! Round 2 Puzzles auto-submitted.');
        submitR2Puzzles();
      } else if (state.currentRound === 3 && !state.r3Completed) {
        alert('TIME EXPIRED! Round 3 Matrix auto-submitted.');
        submitR3Matrix();
      }
      return;
    }

    state.timeRemainingSeconds--;
    persistStateToStorage();

    const mins = Math.floor(state.timeRemainingSeconds / 60);
    const secs = state.timeRemainingSeconds % 60;
    document.querySelectorAll('.countdown-timer-display').forEach(el => el.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    
    // Change color based on remaining time
    const timerColor = state.timeRemainingSeconds <= 60 ? 'var(--accent-red)' : 'var(--accent-green)';
    document.querySelectorAll('.timer-val').forEach(el => el.style.color = timerColor);
  }, 1000);
}

// --- ROUND 2 DECRYPTION PUZZLES DATASET & ENGINE ---
const r2Puzzles = [
  {
    id: 1,
    title: "1. The Mirror Alphabet",
    cipherText: "GSRH RH Z HVXIVG",
    hint: "\"What is written becomes clear when the alphabet looks into a mirror.\"",
    answer: "THIS IS A SECRET"
  },
  {
    id: 2,
    title: "2. Two Layers Deep",
    cipherText: "WKLV LV QRW WKH UHDO PHVVDJH",
    hint: "The first layer uses a Caesar cipher.\nThe key is 3.\nAfter decrypting, look carefully at the resulting sentence.\nThe phrase itself tells you whether there is another layer.",
    answer: "THIS IS NOT THE REAL MESSAGE"
  },
  {
    id: 3,
    title: "3. Numbers in Disguise",
    cipherText: "20-8-5 / 11-5-25 / 9-19 / 3-15-4-5 / 6-9-18-5",
    hint: "A = 1, B = 2, C = 3...",
    answer: "THE KEY IS CODE FIRE"
  },
  {
    id: 4,
    title: "4. The Database Administrator's Find",
    cipherText: "53 45 4C 45 43 54\n20\n2A\n20\n46 52 4F 4D\n20\n55 53 45 52 53",
    hint: "The values are hexadecimal.\nConvert them into ASCII.\nThe result is an SQL statement.",
    answer: "SELECT * FROM USERS"
  },
  {
    id: 5,
    title: "5. The Network Engineer's Message",
    cipherText: "48:45:4C:50\n4D:45\n43:52:41:43:4B",
    hint: "Each pair is hexadecimal ASCII.",
    answer: "HELP ME CRACK"
  },
  {
    id: 6,
    title: "6. Binary Bits",
    cipherText: "01000011 01011001 01000010 01000101 01010010",
    hint: "Every 8 bits represents one ASCII character.",
    answer: "CYBER"
  }
];

function startRound2Puzzles() {
  if (state.disqualified) {
    showDisqualifiedView();
    return;
  }
  sound.playClick();
  requestFullScreen();
  
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.r2TimerStarted = true;
  state.r2CurrentIndex = 0;
  
  const rulesView = document.getElementById('r2-rules-view');
  const puzzleView = document.getElementById('r2-puzzle-view');
  const descElem = document.getElementById('r2-banner-desc');

  if (rulesView) rulesView.style.display = 'none';
  if (puzzleView) puzzleView.style.display = 'block';
  if (descElem) descElem.innerText = 'Decrypt all 6 ciphers and click Submit Round 2 Puzzles.';

  buildR2PaletteGrid();
  renderR2Puzzle(0);
  startR2Timer();
  persistStateToStorage();
}

function startR2Timer() {
  if (state.r2TimerInterval) clearInterval(state.r2TimerInterval);

  state.r2TimerInterval = setInterval(() => {
    if (state.r2TimeRemainingSeconds <= 0) {
      clearInterval(state.r2TimerInterval);
      state.r2TimeRemainingSeconds = 0;
      if (!state.r2Completed) {
        alert('ROUND 2 TIME EXPIRED! Auto-submitting your decryption puzzles now.');
        submitR2Puzzles();
      }
      return;
    }

    state.r2TimeRemainingSeconds--;
    persistStateToStorage();

    if (state.currentRound === 2) {
      const mins = Math.floor(state.r2TimeRemainingSeconds / 60);
      const secs = state.r2TimeRemainingSeconds % 60;
      document.querySelectorAll('.countdown-timer-display').forEach(el => el.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      
      const timerColor = state.r2TimeRemainingSeconds <= 60 ? 'var(--accent-red)' : 'var(--accent-green)';
      document.querySelectorAll('.timer-val').forEach(el => el.style.color = timerColor);
    }
  }, 1000);
}

function handleR2InputAnswer(val) {
  const index = state.r2CurrentIndex;
  state.r2UserAnswers[index] = val ? val.trim().toUpperCase() : '';
  updateR2PaletteGrid();
  persistStateToStorage();
}

function renderR2Puzzle(index) {
  state.r2CurrentIndex = index;
  const pz = r2Puzzles[index];
  if (!pz) return;

  const tagElem = document.getElementById('pz-counter-tag');
  const titleElem = document.getElementById('pz-prompt-title');
  const cipherTextElem = document.getElementById('pz-ciphertext-text');
  const hintTextElem = document.getElementById('pz-hint-text');
  const inputElem = document.getElementById('pz-answer-input');

  if (tagElem) tagElem.innerText = `Puzzle ${index + 1} of 6`;
  if (titleElem) titleElem.innerText = pz.title;
  if (cipherTextElem) cipherTextElem.innerText = pz.cipherText;
  if (hintTextElem) hintTextElem.innerText = pz.hint || '';

  if (inputElem) {
    inputElem.value = state.r2UserAnswers[index] || '';
  }

  const prevBtn = document.getElementById('btn-prev-pz');
  const nextBtn = document.getElementById('btn-next-pz');
  const submitBtn = document.getElementById('btn-submit-r2-puzzles');

  if (prevBtn) {
    prevBtn.disabled = (index === 0) || state.disqualified;
    if (state.disqualified || index === 0) {
      prevBtn.style.pointerEvents = 'none';
      prevBtn.style.opacity = '0.45';
      prevBtn.style.cursor = 'not-allowed';
    } else {
      prevBtn.style.pointerEvents = 'auto';
      prevBtn.style.opacity = '1';
      prevBtn.style.cursor = 'pointer';
    }
  }

  if (index === 5) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) {
      submitBtn.style.display = 'inline-flex';
      submitBtn.disabled = state.disqualified;
      if (state.disqualified) {
        submitBtn.style.pointerEvents = 'none';
        submitBtn.style.opacity = '0.45';
        submitBtn.style.cursor = 'not-allowed';
      } else {
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
    }
  } else {
    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.disabled = state.disqualified;
      if (state.disqualified) {
        nextBtn.style.pointerEvents = 'none';
        nextBtn.style.opacity = '0.45';
        nextBtn.style.cursor = 'not-allowed';
      } else {
        nextBtn.style.pointerEvents = 'auto';
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
      }
    }
    if (submitBtn) submitBtn.style.display = 'none';
  }

  updateR2PaletteGrid();
}

function navigateR2Puzzle(direction) {
  if (state.disqualified) return;
  sound.playClick();
  const nextIdx = state.r2CurrentIndex + direction;
  if (nextIdx >= 0 && nextIdx < 6) {
    renderR2Puzzle(nextIdx);
  }
}

function buildR2PaletteGrid() {
  const gridElem = document.getElementById('pz-palette-grid');
  if (!gridElem) return;

  gridElem.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const btn = document.createElement('button');
    btn.className = 'palette-item';
    btn.id = `pz-palette-btn-${i}`;
    btn.innerText = i + 1;
    btn.onclick = () => {
      if (state.disqualified) return;
      sound.playClick();
      renderR2Puzzle(i);
    };
    gridElem.appendChild(btn);
  }
}

function updateR2PaletteGrid() {
  for (let i = 0; i < 6; i++) {
    const btn = document.getElementById(`pz-palette-btn-${i}`);
    if (!btn) continue;

    btn.className = 'palette-item';
    if (state.r2UserAnswers[i] && state.r2UserAnswers[i].trim() !== '') {
      btn.classList.add('answered');
    }
    if (i === state.r2CurrentIndex) {
      btn.classList.add('active');
    }
  }
}

async function submitR2Puzzles(isDisqualified = false, disqualificationReason = '') {
  const actuallyDisqualified = isDisqualified === true;
  if (state.disqualified && !actuallyDisqualified) return;
  if (state.r2TimerInterval) clearInterval(state.r2TimerInterval);
  state.r2Completed = true;

  // Evaluate answers upon submission
  let solvedCount = 0;
  r2Puzzles.forEach((pz, i) => {
    const userAns = (state.r2UserAnswers[i] || '').trim().toUpperCase();
    const correctAns = pz.answer.trim().toUpperCase();
    if (userAns === correctAns || userAns.replace(/\s+/g, '') === correctAns.replace(/\s+/g, '')) {
      state.r2SolvedStatus[i] = true;
      solvedCount++;
    } else {
      state.r2SolvedStatus[i] = false;
    }
  });

  const baseScore = solvedCount * 50;
  const timeTakenSeconds = 1500 - state.r2TimeRemainingSeconds;
  state.r2TimeTakenSeconds = Math.max(0, timeTakenSeconds);

  // Less time taken = higher bonus score
  const speedBonus = Math.max(0, Math.floor((1500 - state.r2TimeTakenSeconds) / 10));
  state.r2Score = baseScore + speedBonus;
  state.score += state.r2Score;

  sound.playVictory();

  // Save to backend MongoDB
  const serverUrl = window.location.origin.startsWith('http')
    ? '/api/submit-round2'
    : 'http://localhost:8080/api/submit-round2';

  try {
    await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantName: state.participantName,
        teamName: state.teamName,
        teamHash: state.teamHash,
        score: state.r2Score,
        correctCount: solvedCount,
        timeTakenSeconds: state.r2TimeTakenSeconds,
        tabSwitchCount: state.tabSwitchCount,
        disqualified: isDisqualified,
        disqualificationReason: disqualificationReason || (isDisqualified ? 'Exceeded maximum 2 proctoring violations' : ''),
        incidentReport: isDisqualified ? {
          timestamp: new Date().toISOString(),
          reason: disqualificationReason || 'Exceeded maximum 2 proctoring violations',
          round: 2
        } : null
      })
    });
  } catch (err) {
    console.warn('[MONGODB R2 SAVE NOTE]:', err);
  }

  if (isDisqualified) return; // Do not update waiting subview if disqualified

  // Update UI sub-view
  const rulesView = document.getElementById('r2-rules-view');
  const puzzleView = document.getElementById('r2-puzzle-view');
  const waitingSubview = document.getElementById('r2-waiting-subview');
  const descElem = document.getElementById('r2-banner-desc');

  if (rulesView) rulesView.style.display = 'none';
  if (puzzleView) puzzleView.style.display = 'none';
  if (waitingSubview) waitingSubview.style.display = 'block';
  if (descElem) descElem.innerText = 'Round 2 Decryption Puzzles Completed! Waiting results for round-2.';

  const solvedElem = document.getElementById('r2-sub-solved');
  const scoreElem = document.getElementById('r2-sub-score');
  const timeElem = document.getElementById('r2-sub-time');
  const hashElem = document.getElementById('r2-sub-hash');

  if (solvedElem) solvedElem.innerText = `${solvedCount} / 6 Solved`;
  if (scoreElem) scoreElem.innerText = `${state.r2Score} PTS`;

  const mins = Math.floor(state.r2TimeTakenSeconds / 60);
  const secs = state.r2TimeTakenSeconds % 60;
  if (timeElem) timeElem.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  if (hashElem) hashElem.innerText = state.teamHash || '-';

  startAdminApprovalPolling();
  updateMetricsDisplay();
  persistStateToStorage();
}

window.startRound2Puzzles = startRound2Puzzles;
window.handleR2InputAnswer = handleR2InputAnswer;
window.navigateR2Puzzle = navigateR2Puzzle;
window.submitR2Puzzles = submitR2Puzzles;

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Prevent Copy, Cut, Select, Right Click (Context Menu), Dragging on Quiz View
  ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'].forEach(evt => {
    document.addEventListener(evt, (e) => {
      const isTestActive = (state.r1QuizActive && !state.r1Completed) || (state.r2TimerStarted && !state.r2Completed);
      if (isTestActive) {
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInput) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }, true);
  });

  // Block Keyboard Shortcuts (Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+U, F12) during Quiz/Test
  document.addEventListener('keydown', (e) => {
    const isTestActive = (state.r1QuizActive && !state.r1Completed) || (state.r2TimerStarted && !state.r2Completed);
    if (isTestActive) {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (!isInput) {
        const key = e.key.toLowerCase();
        if (
          ((e.ctrlKey || e.metaKey) && ['c', 'a', 'x', 'u', 's'].includes(key)) ||
          e.key === 'F12' ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key))
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }
  }, true);

  // Fullscreen Exit Detector
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
    document.addEventListener(evt, () => {
      const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      const isTestActive = (state.r1QuizActive && !state.r1Completed) || (state.r2TimerStarted && !state.r2Completed);
      if (!isFull && isTestActive) {
        triggerTabViolation('Exited Fullscreen mode');
      }
    });
  });

  // Visibility (Tab Switch) & Window Blur Listener
  let isReloading = false;
  window.addEventListener('beforeunload', () => {
    isReloading = true;
  });

  document.addEventListener('visibilitychange', () => {
    if (isReloading) return;
    const isTestActive = (state.r1QuizActive && !state.r1Completed) || (state.r2TimerStarted && !state.r2Completed);
    if (document.hidden && isTestActive) {
      triggerTabViolation('Switched browser tab or minimized window');
    }
  });

  window.addEventListener('blur', () => {
    if (isReloading) return;
    const isTestActive = (state.r1QuizActive && !state.r1Completed) || (state.r2TimerStarted && !state.r2Completed);
    if (isTestActive) {
      triggerTabViolation('Lost window focus or switched application');
    }
  });

  // Return to Fullscreen Button Handler
  const returnFsBtn = document.getElementById('btn-return-fullscreen');
  if (returnFsBtn) {
    returnFsBtn.addEventListener('click', () => {
      closeModal('modal-tab-warning');
      requestFullScreen();
    });
  }

  document.body.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.classList.contains('node-tile')) {
      sound.playClick();
    }
  });

  // Start Round 1 Quiz Button
  const startR1Btn = document.getElementById('btn-start-r1-quiz');
  if (startR1Btn) {
    startR1Btn.addEventListener('click', startRound1Quiz);
  }

  // Quiz Navigation
  const prevQBtn = document.getElementById('btn-prev-q');
  if (prevQBtn) {
    prevQBtn.addEventListener('click', () => {
      if (state.disqualified) return;
      if (state.r1CurrentQIndex > 0) {
        state.r1CurrentQIndex--;
        renderQuestion(state.r1CurrentQIndex);
        persistStateToStorage();
      }
    });
  }

  const nextQBtn = document.getElementById('btn-next-q');
  if (nextQBtn) {
    nextQBtn.addEventListener('click', () => {
      if (state.disqualified) return;
      if (state.r1CurrentQIndex < 24) {
        state.r1CurrentQIndex++;
        renderQuestion(state.r1CurrentQIndex);
        persistStateToStorage();
      }
    });
  }

  const submitQuizBtn = document.getElementById('btn-submit-r1-quiz');
  if (submitQuizBtn) {
    submitQuizBtn.addEventListener('click', () => {
      if (state.disqualified) return;
      submitR1Quiz();
    });
  }

  // Sound Toggle
  const sndBtn = document.getElementById('btn-toggle-sound');
  if (sndBtn) {
    sndBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      const icon = document.getElementById('sound-icon');
      if (icon) icon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    });
  }

  // Logout / New Registration Button
  const logoutBtn = document.getElementById('btn-logout-reg');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (document.documentElement) document.documentElement.classList.remove('has-active-session');
      try {
        sessionStorage.removeItem('decrypt_session_data');
        localStorage.removeItem('decrypt_session_data');
      } catch (e) {}

      state.participantName = '';
      state.teamName = '';
      state.collegeName = '';
      state.mobileNumber = '';
      state.teamHash = '';

      const dashView = document.getElementById('view-dashboard');
      const loginView = document.getElementById('view-login');
      if (dashView) { dashView.classList.remove('active'); dashView.style.display = 'none'; }
      if (loginView) { loginView.classList.add('active'); loginView.style.display = 'flex'; }

      const regForm = document.getElementById('registration-form');
      if (regForm) regForm.reset();
      const statusMsg = document.getElementById('login-status-msg');
      if (statusMsg) statusMsg.innerText = '';
      const submitBtn = document.getElementById('btn-submit-reg');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> REGISTER &amp; BEGIN MISSION';
      }
    });
  }

  // Rules Modal
  const rulesBtn = document.getElementById('btn-open-rules');
  if (rulesBtn) {
    rulesBtn.addEventListener('click', () => {
      openModal('modal-rules');
    });
  }

  // Admin Portal Modal
  const adminBtn = document.getElementById('btn-open-admin-login');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      openModal('modal-admin-login');
    });
  }

  // Round 2 CLI
  const cliInput = document.getElementById('cli-input');
  if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCliCommand();
    });
  }

  const cliSendBtn = document.getElementById('cli-send-btn');
  if (cliSendBtn) cliSendBtn.addEventListener('click', handleCliCommand);

  // Round 3
  const resetBtn = document.getElementById('btn-reset-nodes');
  if (resetBtn) resetBtn.addEventListener('click', initRound3Grid);

  const r3SubBtn = document.getElementById('btn-r3-submit');
  if (r3SubBtn) r3SubBtn.addEventListener('click', checkRound3Submit);
}

// --- TAB SWITCHING ---
function switchRoundTab(roundNum) {
  if (state.disqualified) {
    showDisqualifiedView();
    return;
  }

  if (roundNum > state.unlockedRound) {
    sound.playError();
    alert(`ROUND LOCKED: Complete Round ${roundNum - 1} first to unlock Round ${roundNum}.`);
    return;
  }

  state.currentRound = roundNum;

  for (let i = 1; i <= 3; i++) {
    const navCard = document.getElementById(`nav-round-${i}`);
    const stagePanel = document.getElementById(`stage-round-${i}`);

    if (i === roundNum) {
      if (navCard) navCard.classList.add('active');
      if (stagePanel) stagePanel.classList.add('active');
    } else {
      if (navCard) navCard.classList.remove('active');
      if (stagePanel) stagePanel.classList.remove('active');
    }
  }

  const roundInd = document.getElementById('round-indicator');
  if (roundInd) roundInd.innerText = `ROUND ${roundNum} / 3`;
  persistStateToStorage();
}

// --- TERMINAL ---
function handleCliCommand() {
  const inputElem = document.getElementById('cli-input');
  const cmd = inputElem ? inputElem.value.trim() : '';
  if (!cmd) return;

  const outputScreen = document.getElementById('cli-output-screen');

  const promptLine = document.createElement('div');
  promptLine.className = 'cli-row';
  promptLine.innerHTML = `<span class="prompt-label">decrypt@mainframe:~$</span> ${escapeHtml(cmd)}`;
  if (outputScreen) outputScreen.appendChild(promptLine);

  if (inputElem) inputElem.value = '';

  const parts = cmd.toLowerCase().split(/\s+/);
  const mainCmd = parts[0];

  let response = '';
  let rowClass = 'cli-row';

  switch (mainCmd) {
    case 'help':
      response = `AVAILABLE COMMANDS:
  help               - View command reference
  scan / nmap        - Perform network port vulnerability scan
  ls                 - List mainframe directory files
  cat <filename>     - Read file contents
  exploit <token>    - Deploy exploit payload with security token
  clear              - Clear output screen
  hint               - Request round hint`;
      break;

    case 'scan':
    case 'nmap':
      response = `[PORT SCAN INITIATED ON TARGET 192.168.10.88]
Port 22/tcp   - CLOSED (SSH)
Port 80/tcp   - OPEN (HTTP - Security Landing)
Port 8820/tcp - VULNERABLE (Custom Decrypt Shell Service)
--> Status: Port 8820 exposing security files! Type 'ls' to view files.`;
      break;

    case 'ls':
      response = `readme.txt   firewall_rules.conf   security_override_token.enc`;
      break;

    case 'cat':
      const fileName = parts[1];
      if (!fileName) {
        response = `Error: Usage: cat <filename>`;
        rowClass = 'cli-row error';
      } else if (fileName.includes('readme')) {
        response = `[README.TXT]
Welcome to Round 2 Security Breach.
To unlock Round 3, read 'security_override_token.enc' and type: exploit <token>`;
      } else if (fileName.includes('firewall')) {
        response = `[FIREWALL_RULES.CONF]
ALLOW PORT 8820;
DENY ALL OTHERS;
LOG_LEVEL: VERBOSE;`;
      } else if (fileName.includes('security_override_token') || fileName.includes('token')) {
        response = `[SECURITY_OVERRIDE_TOKEN.ENC]
SECURITY RECORD:
TOKEN_ID = ${state.r2Token}
STATUS = ACTIVE AUTHORIZATION`;
        rowClass = 'cli-row success';
      } else {
        response = `cat: ${fileName}: File not found.`;
        rowClass = 'cli-row error';
      }
      break;

    case 'exploit':
      const tokenArg = parts[1];
      if (!tokenArg) {
        response = `Error: Usage: exploit <token>`;
        rowClass = 'cli-row error';
      } else if (tokenArg.toUpperCase() === state.r2Token || tokenArg === '8892') {
        sound.playSuccess();
        state.r2Completed = true;
        state.score += 350;
        unlockRound(3);
        response = `[EXPLOIT SUCCESSFUL] Firewall bypassed! Authorization granted.
Round 3 Neural Core Unlocked! (+350 PTS)`;
        rowClass = 'cli-row success';

        setTimeout(() => {
          switchRoundTab(3);
        }, 1500);
      } else {
        sound.playError();
        response = `[EXPLOIT FAILED] Invalid token provided.`;
        rowClass = 'cli-row error';
      }
      break;

    case 'clear':
      if (outputScreen) outputScreen.innerHTML = '';
      return;

    case 'hint':
      state.score = Math.max(0, state.score - 50);
      updateMetricsDisplay();
      response = `HINT: Type 'cat security_override_token.enc' to find token, then run 'exploit TOKEN-CYBER-8892'.`;
      rowClass = 'cli-row intro';
      break;

    default:
      response = `Command not found: '${mainCmd}'. Type 'help' for available commands.`;
      rowClass = 'cli-row error';
      break;
  }

  if (outputScreen) {
    const responseLine = document.createElement('div');
    responseLine.className = rowClass;
    responseLine.innerText = response;
    outputScreen.appendChild(responseLine);
    outputScreen.scrollTop = outputScreen.scrollHeight;
  }
}

// --- NEURAL GRID ---
function initRound3Grid() {
  const gridContainer = document.getElementById('neural-matrix-grid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  state.r3CurrentMatrix = [
    1, 0, 1, 0,
    0, 1, 0, 1,
    1, 0, 1, 0,
    0, 1, 0, 1
  ];

  for (let i = 0; i < 16; i++) {
    const node = document.createElement('div');
    node.className = 'node-tile';
    node.dataset.index = i;
    node.innerText = state.r3CurrentMatrix[i];

    node.addEventListener('click', () => {
      state.r3CurrentMatrix[i] = state.r3CurrentMatrix[i] === 1 ? 0 : 1;
      node.innerText = state.r3CurrentMatrix[i];
      node.classList.toggle('active', state.r3CurrentMatrix[i] === 1);
      updateRound3Sync();
    });

    if (state.r3CurrentMatrix[i] === 1) node.classList.add('active');
    gridContainer.appendChild(node);
  }

  updateRound3Sync();
}

function updateRound3Sync() {
  let matches = 0;
  for (let i = 0; i < 16; i++) {
    if (state.r3CurrentMatrix[i] === state.r3TargetMatrix[i]) {
      matches++;
    }
  }

  const syncPercent = Math.round((matches / 16) * 100);
  const syncElem = document.getElementById('sync-percentage');
  const labelElem = document.getElementById('sync-status-label');

  if (syncElem) syncElem.innerText = `${syncPercent}%`;

  if (syncElem && labelElem) {
    if (syncPercent === 100) {
      syncElem.style.color = '#10b981';
      labelElem.innerText = 'Node Matrix 100% Aligned! Ready to Complete.';
    } else if (syncPercent > 70) {
      syncElem.style.color = '#3b82f6';
      labelElem.innerText = 'Signal Stable. Align remaining tiles.';
    } else {
      syncElem.style.color = '#9ca3af';
      labelElem.innerText = 'Signal Noise. Toggle tiles to align.';
    }
  }

  const nodes = document.querySelectorAll('.node-tile');
  nodes.forEach((node, idx) => {
    if (state.r3CurrentMatrix[idx] === state.r3TargetMatrix[idx]) {
      node.classList.add('target-aligned');
    } else {
      node.classList.remove('target-aligned');
    }
  });

  persistStateToStorage();
}

function checkRound3Submit() {
  let matches = 0;
  for (let i = 0; i < 16; i++) {
    if (state.r3CurrentMatrix[i] === state.r3TargetMatrix[i]) {
      matches++;
    }
  }

  if (matches === 16) {
    sound.playVictory();
    state.r3Completed = true;
    state.r3CorrectCount = 16;
    state.r3Score = 350;
    state.r3TimeTakenSeconds = Math.max(0, 2100 - state.timeRemainingSeconds);
    state.score += 350;
    updateMetricsDisplay();
    clearInterval(state.timerInterval);

    // Save Round 3 to backend MongoDB
    const serverUrl = window.location.origin.startsWith('http')
      ? '/api/submit-round3'
      : 'http://localhost:8080/api/submit-round3';

    try {
      fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: state.participantName,
          teamName: state.teamName,
          teamHash: state.teamHash,
          score: 350,
          correctCount: 16,
          timeTakenSeconds: state.r3TimeTakenSeconds
        })
      });
    } catch (e) {
      console.warn('[R3 SAVE NOTE]', e);
    }

    showFeedback('r3-feedback', 'CHALLENGE COMPLETED SUCCESSFULLY!', 'green');

    setTimeout(() => {
      const elapsedSecs = 2100 - state.timeRemainingSeconds;
      const mins = Math.floor(elapsedSecs / 60);
      const secs = elapsedSecs % 60;

      const ft = document.getElementById('v-final-time');
      if (ft) ft.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      openModal('modal-victory');
    }, 1000);

  } else {
    sound.playError();
    showFeedback('r3-feedback', `Alignment Error: Only ${Math.round((matches/16)*100)}% synced. Re-check node tiles.`, 'red');
  }
}

function submitR3Matrix() {
  let matches = 0;
  for (let i = 0; i < 16; i++) {
    if (state.r3CurrentMatrix[i] === state.r3TargetMatrix[i]) {
      matches++;
    }
  }

  state.r3Completed = true;
  state.r3CorrectCount = matches;
  state.r3Score = Math.round((matches / 16) * 350);
  state.r3TimeTakenSeconds = Math.max(0, 2100 - state.timeRemainingSeconds);
  state.score += state.r3Score;
  updateMetricsDisplay();
  if (state.timerInterval) clearInterval(state.timerInterval);

  const serverUrl = window.location.origin.startsWith('http')
    ? '/api/submit-round3'
    : 'http://localhost:8080/api/submit-round3';

  try {
    fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantName: state.participantName,
        teamName: state.teamName,
        teamHash: state.teamHash,
        score: state.r3Score,
        correctCount: matches,
        timeTakenSeconds: state.r3TimeTakenSeconds
      })
    });
  } catch (e) {
    console.warn('[R3 SAVE NOTE]', e);
  }

  showFeedback('r3-feedback', 'TIME EXPIRED! Round 3 Submitted.', 'orange');

  setTimeout(() => {
    const elapsedSecs = state.r3TimeTakenSeconds;
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;

    const ft = document.getElementById('v-final-time');
    if (ft) ft.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    openModal('modal-victory');
  }, 1000);
}


function unlockRound(roundNum) {
  state.unlockedRound = Math.max(state.unlockedRound, roundNum);

  const navCard = document.getElementById(`nav-round-${roundNum}`);
  const statusElem = document.getElementById(`status-r${roundNum}`);

  if (navCard) navCard.classList.remove('locked');
  if (statusElem) statusElem.innerHTML = '<i class="fa-solid fa-unlock"></i> Unlocked';

  updateMetricsDisplay();
}

function updateMetricsDisplay() {
  const hs = document.getElementById('hud-score');
  if (hs) hs.innerText = `${state.score} PTS`;

  let progressPercent = 10;
  if (state.r1Completed) progressPercent = 40;
  if (state.r2Completed) progressPercent = 75;
  if (state.r3Completed) progressPercent = 100;

  const op = document.getElementById('overall-progress');
  if (op) op.style.width = `${progressPercent}%`;
}

function showFeedback(elemId, msg, type) {
  const elem = document.getElementById(elemId);
  if (elem) {
    elem.innerText = msg;
    elem.style.color = type === 'green' ? '#10b981' : type === 'red' ? '#ef4444' : '#f59e0b';
  }
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('open');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('open');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- ADMIN PORTAL FUNCTIONS ---
let adminDatabaseRecords = [];

window.handleAdminLoginSubmit = function(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('admin-name-input');
  const keyInput = document.getElementById('admin-key-input');
  const statusMsg = document.getElementById('admin-login-status');

  const name = nameInput ? nameInput.value.trim() : '';
  const key = keyInput ? keyInput.value.trim() : '';

  if ((name.toLowerCase() === 'decrypt') && (key === 'Gokul#126')) {
    if (statusMsg) {
      statusMsg.style.color = '#10b981';
      statusMsg.innerText = 'Login successful! Opening Admin Control Center...';
    }

    setTimeout(() => {
      closeModal('modal-admin-login');
      openModal('modal-admin-dashboard');
      loadAdminDatabase();
    }, 400);

  } else {
    if (statusMsg) {
      statusMsg.style.color = '#ef4444';
      statusMsg.innerText = 'Invalid Admin Name or Key.';
    }
  }

  return false;
};

async function loadAdminDatabase() {
  const serverUrl = window.location.origin.startsWith('http') 
    ? '/api/registrations' 
    : 'http://localhost:8080/api/registrations';

  try {
    const res = await fetch(serverUrl);
    const data = await res.json();
    if (data.success) {
      adminDatabaseRecords = data.data || [];
      renderAdminModalTable(adminDatabaseRecords);
    }
  } catch (err) {
    console.error('[ADMIN FETCH ERROR]:', err);
  }
}

window.approveParticipantRound2 = async function(teamHash) {
  const serverUrl = window.location.origin.startsWith('http') 
    ? '/api/approve-round2' 
    : 'http://localhost:8080/api/approve-round2';

  try {
    const res = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamHash })
    });
    const data = await res.json();
    if (data.success) {
      alert(`APPROVED FOR ROUND 2!\n\n${data.message}`);
      loadAdminDatabase();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    alert(`Failed to approve: ${err.message}`);
  }
};

window.approveParticipantRound3 = async function(teamHash) {
  const serverUrl = window.location.origin.startsWith('http') 
    ? '/api/approve-round3' 
    : 'http://localhost:8080/api/approve-round3';

  try {
    const res = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamHash })
    });
    const data = await res.json();
    if (data.success) {
      alert(`APPROVED FOR ROUND 3!\n\n${data.message}`);
      loadAdminDatabase();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    alert(`Failed to approve for R3: ${err.message}`);
  }
};

window.deleteTeamAdmin = async function(id, teamName) {
  if(!confirm(`Are you SURE you want to delete team "${teamName}"? This action cannot be undone.`)) return;
  try {
    const serverUrl = window.location.origin.startsWith('http') ? `/api/team/${id}` : `http://localhost:8080/api/team/${id}`;
    const res = await fetch(serverUrl, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      alert('Team deleted successfully.');
      loadAdminDatabase();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    alert(`Failed to delete team: ${err.message}`);
  }
};

function formatLoginTime(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  } catch (e) {
    return '-';
  }
}

function renderAdminModalTable(records) {
  const tbody = document.getElementById('adm-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  let r2Count = 0;
  let r3Count = 0;
  let maxScore = 0;

  const totalElem = document.getElementById('adm-total-teams');
  if (totalElem) totalElem.innerText = records.length;

  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-sub); padding: 1.5rem;">No participant registrations found in MongoDB database.</td></tr>';
    const r2Elem = document.getElementById('adm-r2-completed');
    const r3Elem = document.getElementById('adm-r3-completed');
    const scoreElem = document.getElementById('adm-high-score');
    if (r2Elem) r2Elem.innerText = '0';
    if (r3Elem) r3Elem.innerText = '0';
    if (scoreElem) scoreElem.innerText = '0 PTS';
    return;
  }

  // Sort records in descending order of Round 1 Score
  records.sort((a, b) => {
    const r1A = a.round1Score || 0;
    const r1B = b.round1Score || 0;
    if (r1B !== r1A) return r1B - r1A;
    return new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0);
  });

  const currentFilter = document.getElementById('adm-filter-select') ? document.getElementById('adm-filter-select').value : 'all';

  records.forEach((rec, idx) => {
    if (rec.round3Approved) {
      r3Count++;
    } else if (rec.round2Approved) {
      r2Count++;
    }
    
    if ((rec.round1Score || 0) > maxScore) maxScore = rec.round1Score;

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';
    tr.style.transition = 'all 0.3s ease';

    const loginTimeStr = formatLoginTime(rec.registeredAt);
    const isDisqualifiedRec = rec.disqualified || (rec.tabSwitchCount >= 2);

    let actionBtn = '';
    let statusBadge = '';

    if (rec.round3Approved) {
      tr.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
      tr.style.borderLeft = '4px solid var(--accent-green)';
      actionBtn = '<button class="pro-btn success sm" disabled style="background: rgba(16, 185, 129, 0.25); color: var(--accent-green); border-color: var(--accent-green); cursor: default; font-weight: 700;"><i class="fa-solid fa-check-double"></i> R3 Selected</button>';
      statusBadge = '<span style="background: rgba(16, 185, 129, 0.25); color: var(--accent-green); border: 1px solid var(--accent-green); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.78rem;"><i class="fa-solid fa-check-double"></i> R3 Selected</span>';
    } else if (rec.round2Approved) {
      tr.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
      tr.style.borderLeft = '4px solid var(--accent-blue)';
      if (currentFilter === 'all') {
        actionBtn = `<button class="pro-btn success sm" disabled style="background: rgba(59, 130, 246, 0.25); color: var(--accent-blue); border-color: var(--accent-blue); cursor: default; font-weight: 700;"><i class="fa-solid fa-check"></i> R2 Selected</button>`;
      } else {
        actionBtn = `<button class="pro-btn primary sm" style="background: rgba(245, 158, 11, 0.2); border-color: var(--accent-gold); color: var(--accent-gold); font-weight: 700;" onclick="approveParticipantRound3('${escapeHtml(rec.teamHash)}')"><i class="fa-solid fa-user-check"></i> Select for R3</button>`;
      }
      statusBadge = '<span style="background: rgba(59, 130, 246, 0.2); color: var(--accent-blue); border: 1px solid var(--accent-blue); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.78rem;"><i class="fa-solid fa-check"></i> R2 Selected</span>';
    } else if (isDisqualifiedRec) {
      tr.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
      tr.style.borderLeft = '4px solid var(--accent-red)';
      actionBtn = `<button class="pro-btn primary sm" style="background: rgba(245, 158, 11, 0.2); border-color: var(--accent-gold); color: var(--accent-gold); font-weight: 700;" onclick="approveParticipantRound2('${escapeHtml(rec.teamHash)}')"><i class="fa-solid fa-user-check"></i> Override & Select R2</button>`;
      statusBadge = `<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.78rem;" title="${escapeHtml(rec.disqualificationReason || 'Incident Reported')}"><i class="fa-solid fa-triangle-exclamation"></i> Disqualified</span>`;
    } else {
      tr.style.borderLeft = '4px solid transparent';
      actionBtn = `<button class="pro-btn primary sm" style="background: var(--accent-blue); border-color: var(--accent-blue); color: #fff; font-weight: 700;" onclick="approveParticipantRound2('${escapeHtml(rec.teamHash)}')"><i class="fa-solid fa-user-check"></i> Select for R2</button>`;
      statusBadge = rec.round1Completed 
        ? '<span style="background: rgba(245, 158, 11, 0.15); color: var(--accent-gold); border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.78rem; white-space: nowrap;"><i class="fa-solid fa-circle-check"></i> Wait Selection</span>'
        : '<span style="background: rgba(156, 163, 175, 0.15); color: var(--text-sub); border: 1px solid var(--border-color); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.78rem; white-space: nowrap;"><i class="fa-solid fa-hourglass-start"></i> Not Completed</span>';
    }

    // Add delete button
    actionBtn += ` <button class="pro-btn danger sm" style="background: rgba(239, 68, 68, 0.2); border-color: var(--accent-red); color: var(--accent-red); font-weight: 700; margin-left: 0.5rem;" onclick="deleteTeamAdmin('${rec._id}', '${escapeHtml(rec.teamName)}')"><i class="fa-solid fa-trash"></i></button>`;

    function formatSecs(s) {
      if (!s || s <= 0) return '-';
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    const r1Correct = rec.round1CorrectCount !== undefined ? `${rec.round1CorrectCount} / 25` : '-';
    const r1Score = rec.round1Score !== undefined ? `${rec.round1Score} PTS` : '0 PTS';
    const r1Time = formatSecs(rec.round1TimeTakenSeconds);

    tr.innerHTML = `
      <td style="padding: 0.65rem 0.9rem;">${idx + 1}</td>
      <td style="padding: 0.65rem 0.9rem;">
        <strong style="color: #fff;">${escapeHtml(rec.teamName)}</strong>
        <div style="font-size: 0.73rem; color: var(--text-sub); margin-top: 0.15rem; display: flex; align-items: center; gap: 0.3rem; white-space: nowrap;">
          <i class="fa-regular fa-clock" style="color: var(--accent-gold); font-size: 0.7rem;"></i> Logged in: <span style="color: #e5e7eb; font-weight: 600;">${loginTimeStr}</span>
        </div>
      </td>
      <td style="padding: 0.65rem 0.9rem;"><code style="color: var(--accent-blue);">${escapeHtml(rec.teamHash || '#TEAM-0000')}</code></td>
      <td style="padding: 0.65rem 0.9rem;">${r1Correct}</td>
      <td style="padding: 0.65rem 0.9rem;"><strong style="color: ${isDisqualifiedRec ? 'var(--accent-red)' : 'var(--accent-green)'}; font-size: 0.95rem;">${r1Score}</strong></td>
      <td style="padding: 0.65rem 0.9rem;"><span style="font-family: var(--font-mono); color: #e5e7eb;">${r1Time}</span></td>
      <td style="padding: 0.65rem 0.9rem;">${actionBtn}</td>
      <td style="padding: 0.65rem 0.9rem;">${statusBadge}</td>
    `;
    tbody.appendChild(tr);
  });

  const r2Elem = document.getElementById('adm-r2-completed');
  const r3Elem = document.getElementById('adm-r3-completed');
  const scoreElem = document.getElementById('adm-high-score');
  if (r2Elem) r2Elem.innerText = r2Count;
  if (r3Elem) r3Elem.innerText = r3Count;
  if (scoreElem) scoreElem.innerText = `${maxScore} PTS`;
}

function filterAdminTable() {
  const query = (document.getElementById('adm-search-input')?.value || '').toLowerCase().trim();
  const filterStatus = (document.getElementById('adm-filter-select')?.value || 'all');
  
  const filtered = adminDatabaseRecords.filter(r => {
    // 1. Text Search Match
    const matchesSearch = !query || 
      (r.teamName || '').toLowerCase().includes(query) ||
      (r.participantName || '').toLowerCase().includes(query) ||
      (r.collegeName || '').toLowerCase().includes(query) ||
      (r.mobileNumber || '').toLowerCase().includes(query) ||
      (r.teamHash || '').toLowerCase().includes(query);

    // 2. Status Match
    let matchesStatus = true;
    if (filterStatus === 'r2_selected') {
      matchesStatus = !!r.round2Approved;
    } else if (filterStatus === 'r3_selected') {
      matchesStatus = !!r.round3Approved;
    } else if (filterStatus === 'disqualified') {
      matchesStatus = !!r.disqualified || (r.tabSwitchCount >= 2);
    }

    return matchesSearch && matchesStatus;
  });

  renderAdminModalTable(filtered);
}

function exportAdminCSV() {
  if (adminDatabaseRecords.length === 0) {
    alert('No participant records available to export.');
    return;
  }

  function formatSecs(s) {
    if (!s || s <= 0) return '00:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  let csv = 'S.No,Team Name,Participant Name,College Name,Mobile Number,Team Hash,R1 Correct,R1 Score,R1 Time,Status,Registration Date\n';
  adminDatabaseRecords.forEach((r, idx) => {
    let status = 'In Progress';
    if (r.disqualified || (r.tabSwitchCount >= 2)) status = 'Disqualified';
    else if (r.round3Approved) status = 'Round 3 Selected';
    else if (r.round2Approved) status = 'Round 2 Selected';
    else if (r.round1Completed) status = 'Round 1 Completed';

    const r1T = formatSecs(r.round1TimeTakenSeconds);

    csv += `"${idx+1}","${r.teamName}","${r.participantName}","${r.collegeName}","${r.mobileNumber}","${r.teamHash}","${r.round1CorrectCount || 0}","${r.round1Score || 0}","${r1T}","${status}","${r.registeredAt}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `decrypt_or_die_participants_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// --- QUESTION BANK EDITOR & FETCH ---
async function loadExternalQuestions() {
  try {
    const res = await fetch('/questions.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        r1Questions.length = 0;
        data.forEach(q => r1Questions.push(q));
        console.log(`[QUESTION BANK LOADED] ${r1Questions.length} questions loaded from questions.json.`);
      }
    }
  } catch (err) {
    console.warn('[QUESTION BANK LOAD NOTE]: Using embedded question bank.', err);
  }
}

window.handleAddNewQuestionSubmit = async function(event) {
  if (event) event.preventDefault();

  const promptInput = document.getElementById('new-q-prompt');
  const opt0Input = document.getElementById('new-q-opt0');
  const opt1Input = document.getElementById('new-q-opt1');
  const opt2Input = document.getElementById('new-q-opt2');
  const opt3Input = document.getElementById('new-q-opt3');
  const correctInput = document.getElementById('new-q-correct');
  const statusMsg = document.getElementById('add-q-status');

  const qText = promptInput ? promptInput.value.trim() : '';
  const opt0 = opt0Input ? opt0Input.value.trim() : '';
  const opt1 = opt1Input ? opt1Input.value.trim() : '';
  const opt2 = opt2Input ? opt2Input.value.trim() : '';
  const opt3 = opt3Input ? opt3Input.value.trim() : '';
  const correctIdx = correctInput ? parseInt(correctInput.value, 10) : 0;

  if (!qText || !opt0 || !opt1 || !opt2 || !opt3) {
    if (statusMsg) {
      statusMsg.style.color = '#ef4444';
      statusMsg.innerText = 'Please complete all question fields.';
    }
    return false;
  }

  const newQuestion = {
    q: qText,
    options: [opt0, opt1, opt2, opt3],
    correct: correctIdx
  };

  // Add to local array
  r1Questions.push(newQuestion);

  const serverUrl = window.location.origin.startsWith('http') 
    ? '/api/questions' 
    : 'http://localhost:8080/api/questions';

  try {
    const res = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: r1Questions })
    });

    const data = await res.json();
    if (data.success) {
      if (statusMsg) {
        statusMsg.style.color = '#10b981';
        statusMsg.innerText = `Question saved successfully! Total in bank: ${r1Questions.length}`;
      }
      setTimeout(() => {
        closeModal('modal-add-question');
        if (promptInput) promptInput.value = '';
        if (opt0Input) opt0Input.value = '';
        if (opt1Input) opt1Input.value = '';
        if (opt2Input) opt2Input.value = '';
        if (opt3Input) opt3Input.value = '';
      }, 1000);
    } else {
      throw new Error(data.message || 'Save failed');
    }
  } catch (err) {
    console.error('[ADD QUESTION ERROR]:', err);
    if (statusMsg) {
      statusMsg.style.color = '#ef4444';
      statusMsg.innerText = `Failed to save: ${err.message}`;
    }
  }

  return false;
};
