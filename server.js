const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/decrypt_or_die_db';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MongoDB Schema
const registrationSchema = new mongoose.Schema({
  participantName: { type: String, default: 'Participant' },
  teamName: { type: String, required: true },
  collegeName: { type: String, default: 'College' },
  mobileNumber: { type: String, default: '0000000000' },
  teamHash: { type: String, required: true },
  round1Score: { type: Number, default: 0 },
  round1CorrectCount: { type: Number, default: 0 },
  round1Completed: { type: Boolean, default: false },
  round1TimeTakenSeconds: { type: Number, default: 0 },
  round1SubmittedAt: { type: Date },
  round2Score: { type: Number, default: 0 },
  round2CorrectCount: { type: Number, default: 0 },
  round2Completed: { type: Boolean, default: false },
  round2TimeTakenSeconds: { type: Number, default: 0 },
  round2SubmittedAt: { type: Date },
  round3Score: { type: Number, default: 0 },
  round3CorrectCount: { type: Number, default: 0 },
  round3Completed: { type: Boolean, default: false },
  round3TimeTakenSeconds: { type: Number, default: 0 },
  round3SubmittedAt: { type: Date },
  registeredAt: { type: Date, default: Date.now },
  tabSwitchCount: { type: Number, default: 0 },
  disqualified: { type: Boolean, default: false },
  disqualificationReason: { type: String, default: '' },
  incidentReport: { type: Object, default: null },
  round2Approved: { type: Boolean, default: false },
  round3Approved: { type: Boolean, default: false }
});

const Registration = mongoose.model('Registration', registrationSchema);

let isMongoConnected = false;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
}).then(() => {
  isMongoConnected = true;
  console.log(`\n===================================================`);
  console.log(` [MONGODB COMPASS SUCCESS] Connected to Database!  `);
  console.log(` URI        : ${MONGODB_URI}`);
  console.log(` Database   : decrypt_or_die_db`);
  console.log(` Collection : registrations`);
  console.log(`===================================================\n`);
}).catch((err) => {
  isMongoConnected = false;
  console.error(`[MONGODB ERROR] Failed to connect: ${err.message}`);
});

// POST /api/login -> Finds or Inserts Team Login into MongoDB Compass
app.post('/api/login', async (req, res) => {
  console.log('\n[HTTP REQUEST RECEIVED] POST /api/login Body:', req.body);

  const { teamName, teamHash } = req.body;

  if (!teamName || !teamHash) {
    return res.status(400).json({
      success: false,
      message: 'Team Name and Team ID are required.'
    });
  }

  try {
    if (!isMongoConnected) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
    }

    // Find if team exists, if not, create it
    let existingTeam = await Registration.findOne({ teamHash: teamHash });

    if (existingTeam) {
      // Reject duplicate team IDs strictly
      return res.status(401).json({
        success: false,
        message: 'Team id already exists.'
      });
    }

    // Create new team
    const newDoc = new Registration({
      participantName: 'Participant',
      teamName,
      collegeName: 'College',
      mobileNumber: '0000000000',
      teamHash
    });

    const savedDoc = await newDoc.save();
    const count = await Registration.countDocuments();

    console.log(`\n===================================================`);
    console.log(` [MONGODB COMPASS TEAM CREATED SUCCESSFULLY!]       `);
    console.log(`  Document ID      : ${savedDoc._id}`);
    console.log(`  Team Name        : "${teamName}"`);
    console.log(`  Team ID          : "${teamHash}"`);
    console.log(`  Total Collection : ${count} docs in 'registrations'`);
    console.log(`===================================================\n`);

    return res.status(201).json({
      success: true,
      message: 'New Team created and logged in successfully!',
      data: savedDoc
    });

  } catch (err) {
    console.error('[MONGODB SAVE ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: `Database operation failed: ${err.message}`
    });
  }
});

// DELETE /api/team/:id -> Deletes a team from MongoDB Compass
app.delete('/api/team/:id', async (req, res) => {
  console.log(`\n[HTTP REQUEST RECEIVED] DELETE /api/team/${req.params.id}`);

  try {
    if (!isMongoConnected) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
    }

    const deletedDoc = await Registration.findByIdAndDelete(req.params.id);

    if (!deletedDoc) {
      return res.status(404).json({
        success: false,
        message: 'Team not found in database.'
      });
    }

    const count = await Registration.countDocuments();
    
    console.log(`\n===================================================`);
    console.log(` [MONGODB COMPASS TEAM DELETED SUCCESSFULLY!]      `);
    console.log(`  Document ID      : ${deletedDoc._id}`);
    console.log(`  Team Name        : "${deletedDoc.teamName}"`);
    console.log(`  Total Collection : ${count} docs in 'registrations'`);
    console.log(`===================================================\n`);

    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully!'
    });

  } catch (err) {
    console.error('[MONGODB DELETE ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: `Database delete failed: ${err.message}`
    });
  }
});

// POST /api/submit-round1 -> Saves Round 1 Quiz Score & Proctoring Incident to MongoDB
app.post('/api/submit-round1', async (req, res) => {
  console.log('\n[HTTP REQUEST RECEIVED] POST /api/submit-round1 Body:', req.body);
  const { participantName, teamName, teamHash, score, correctCount, tabSwitchCount, disqualified, disqualificationReason, incidentReport } = req.body;

  try {
    if (!isMongoConnected) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
    }

    let record = null;
    if (teamHash) {
      record = await Registration.findOne({ teamHash });
    }
    if (!record && participantName && teamName) {
      record = await Registration.findOne({ participantName, teamName });
    }

    if (record) {
      record.round1Score = score || 0;
      record.round1CorrectCount = correctCount || 0;
      record.round1Completed = true;
      record.round1TimeTakenSeconds = req.body.timeTakenSeconds || 0;
      record.round1SubmittedAt = new Date();
      if (tabSwitchCount !== undefined) record.tabSwitchCount = tabSwitchCount;
      if (disqualified !== undefined) record.disqualified = disqualified;
      if (disqualificationReason) record.disqualificationReason = disqualificationReason;
      if (incidentReport) record.incidentReport = incidentReport;
      await record.save();
    } else {
      record = await Registration.create({
        participantName: participantName || 'Participant',
        teamName: teamName || 'Team',
        collegeName: req.body.collegeName || 'Symposium College',
        mobileNumber: req.body.mobileNumber || '9876543210',
        teamHash: teamHash || '#TEAM-0000',
        round1Score: score || 0,
        round1CorrectCount: correctCount || 0,
        round1Completed: true,
        round1TimeTakenSeconds: req.body.timeTakenSeconds || 0,
        round1SubmittedAt: new Date(),
        tabSwitchCount: tabSwitchCount || 0,
        disqualified: disqualified || false,
        disqualificationReason: disqualificationReason || '',
        incidentReport: incidentReport || null
      });
    }

    if (disqualified || (record.tabSwitchCount >= 2)) {
      console.log(`\n===================================================`);
      console.log(` 🚨 [PROCTORING INCIDENT REPORTED TO ADMIN]        `);
      console.log(`  Participant Name : "${record.participantName}"`);
      console.log(`  Team Name        : "${record.teamName}"`);
      console.log(`  College Name     : "${record.collegeName}"`);
      console.log(`  Mobile Number    : "${record.mobileNumber}"`);
      console.log(`  Team Hash        : "${record.teamHash}"`);
      console.log(`  Violations Count : ${record.tabSwitchCount} / 2`);
      console.log(`  Incident Status  : DISQUALIFIED & AUTO-SUBMITTED`);
      console.log(`  Reason           : "${record.disqualificationReason || 'Exceeded maximum 2 proctoring violations'}"`);
      console.log(`===================================================\n`);
    } else {
      console.log(`\n===================================================`);
      console.log(` [ROUND 1 SCORE STORED IN MONGODB COMPASS!]        `);
      console.log(`  Participant Name : "${record.participantName}"`);
      console.log(`  Team Name        : "${record.teamName}"`);
      console.log(`  Round 1 Score    : ${record.round1Score} PTS (${record.round1CorrectCount}/25 Correct)`);
      console.log(`  Status           : Waiting for Admin Correction`);
      console.log(`===================================================\n`);
    }

    return res.status(200).json({
      success: true,
      message: 'Round 1 score saved to MongoDB successfully.',
      data: record
    });
  } catch (err) {
    console.error('[MONGODB ROUND 1 SAVE ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/submit-round2 -> Save Round 2 Puzzle Results
app.post('/api/submit-round2', async (req, res) => {
  console.log('\n[HTTP REQUEST RECEIVED] POST /api/submit-round2 Body:', req.body);
  const { participantName, teamName, teamHash, score, correctCount, timeTakenSeconds, tabSwitchCount, disqualified, disqualificationReason, incidentReport } = req.body;

  try {
    if (!isMongoConnected) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
    }

    let record = null;
    if (teamHash) {
      record = await Registration.findOne({ teamHash });
    }
    if (!record && participantName && teamName) {
      record = await Registration.findOne({ participantName, teamName });
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Participant record not found.' });
    }

    record.round2Score = score || 0;
    record.round2CorrectCount = correctCount || 0;
    record.round2Completed = true;
    record.round2TimeTakenSeconds = timeTakenSeconds || 0;
    record.round2SubmittedAt = new Date();
    if (tabSwitchCount !== undefined) record.tabSwitchCount = tabSwitchCount;
    if (disqualified !== undefined) record.disqualified = disqualified;
    if (disqualificationReason) record.disqualificationReason = disqualificationReason;
    if (incidentReport) record.incidentReport = incidentReport;
    await record.save();

    if (disqualified || (record.tabSwitchCount >= 2)) {
      console.log(`\n===================================================`);
      console.log(` 🚨 [PROCTORING INCIDENT REPORTED TO ADMIN - ROUND 2]`);
      console.log(`  Participant Name : "${record.participantName}"`);
      console.log(`  Team Name        : "${record.teamName}"`);
      console.log(`  College Name     : "${record.collegeName}"`);
      console.log(`  Mobile Number    : "${record.mobileNumber}"`);
      console.log(`  Team Hash        : "${record.teamHash}"`);
      console.log(`  Violations Count : ${record.tabSwitchCount} / 2`);
      console.log(`  Incident Status  : DISQUALIFIED & AUTO-SUBMITTED`);
      console.log(`  Reason           : "${record.disqualificationReason || 'Exceeded maximum 2 proctoring violations'}"`);
      console.log(`===================================================\n`);
    } else {
      console.log(`\n===================================================`);
      console.log(` [ROUND 2 DECRYPTION PUZZLES COMPLETED & SAVED!]    `);
      console.log(`  Participant Name : "${record.participantName}"`);
      console.log(`  Team Name        : "${record.teamName}"`);
      console.log(`  Round 2 Score    : ${record.round2Score} PTS (${record.round2CorrectCount}/6 Solved)`);
      console.log(`  Time Taken       : ${record.round2TimeTakenSeconds}s`);
      console.log(`===================================================\n`);
    }

    return res.status(200).json({
      success: true,
      message: 'Round 2 puzzle results saved to MongoDB successfully.',
      data: record
    });
  } catch (err) {
    console.error('[MONGODB ROUND 2 SAVE ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/submit-round3 -> Save Round 3 Neural Matrix Results
app.post('/api/submit-round3', async (req, res) => {
  console.log('\n[HTTP REQUEST RECEIVED] POST /api/submit-round3 Body:', req.body);
  const { participantName, teamName, teamHash, score, correctCount, timeTakenSeconds } = req.body;

  try {
    if (!isMongoConnected) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
    }

    let record = null;
    if (teamHash) {
      record = await Registration.findOne({ teamHash });
    }
    if (!record && participantName && teamName) {
      record = await Registration.findOne({ participantName, teamName });
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Participant record not found.' });
    }

    record.round3Score = score || 350;
    record.round3CorrectCount = correctCount || 16;
    record.round3Completed = true;
    record.round3TimeTakenSeconds = timeTakenSeconds || 0;
    record.round3SubmittedAt = new Date();
    await record.save();

    console.log(`\n===================================================`);
    console.log(` [ROUND 3 NEURAL MATRIX COMPLETED & SAVED!]        `);
    console.log(`  Participant Name : "${record.participantName}"`);
    console.log(`  Team Name        : "${record.teamName}"`);
    console.log(`  Round 3 Score    : ${record.round3Score} PTS (${record.round3CorrectCount}/16 Aligned)`);
    console.log(`  Time Taken       : ${record.round3TimeTakenSeconds}s`);
    console.log(`===================================================\n`);

    return res.status(200).json({
      success: true,
      message: 'Round 3 matrix results saved to MongoDB successfully.',
      data: record
    });
  } catch (err) {
    console.error('[MONGODB ROUND 3 SAVE ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/approve-round2 -> Admin selects participant to unlock Round 2
app.post('/api/approve-round2', async (req, res) => {
  console.log('\n[HTTP REQUEST RECEIVED] POST /api/approve-round2 Body:', req.body);
  const { teamHash, participantName, teamName } = req.body;

  try {
    if (!isMongoConnected) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
    }

    let record = null;
    if (teamHash) {
      record = await Registration.findOne({ teamHash });
    }
    if (!record && participantName && teamName) {
      record = await Registration.findOne({ participantName, teamName });
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Participant record not found.' });
    }

    record.round2Approved = true;
    record.disqualified = false;
    record.disqualificationReason = '';
    record.tabSwitchCount = 0;
    await record.save();

    console.log(`\n===================================================`);
    console.log(` [ADMIN APPROVED PARTICIPANT FOR ROUND 2!]         `);
    console.log(`  Participant Name : "${record.participantName}"`);
    console.log(`  Team Name        : "${record.teamName}"`);
    console.log(`  College Name     : "${record.collegeName}"`);
    console.log(`  Team Hash        : "${record.teamHash}"`);
    console.log(`  Status           : UNLOCKED FOR ROUND 2`);
    console.log(`===================================================\n`);

    return res.json({
      success: true,
      message: `Successfully approved ${record.participantName} for Round 2!`,
      data: record
    });
  } catch (err) {
    console.error('[ADMIN APPROVE ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/approve-round3 -> Admin selects participant to unlock Round 3
app.post('/api/approve-round3', async (req, res) => {
  console.log('\n[HTTP REQUEST RECEIVED] POST /api/approve-round3 Body:', req.body);
  const { teamHash, participantName, teamName } = req.body;

  try {
    if (!isMongoConnected) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
    }

    let record = null;
    if (teamHash) {
      record = await Registration.findOne({ teamHash });
    }
    if (!record && participantName && teamName) {
      record = await Registration.findOne({ participantName, teamName });
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Participant record not found.' });
    }

    record.round3Approved = true;
    record.disqualified = false;
    record.disqualificationReason = '';
    record.tabSwitchCount = 0;
    await record.save();

    console.log(`\n===================================================`);
    console.log(` [ADMIN APPROVED PARTICIPANT FOR ROUND 3!]         `);
    console.log(`  Participant Name : "${record.participantName}"`);
    console.log(`  Team Name        : "${record.teamName}"`);
    console.log(`  College Name     : "${record.collegeName}"`);
    console.log(`  Team Hash        : "${record.teamHash}"`);
    console.log(`  Status           : UNLOCKED FOR ROUND 3`);
    console.log(`===================================================\n`);

    return res.json({
      success: true,
      message: `Successfully approved ${record.participantName} for Round 3!`,
      data: record
    });
  } catch (err) {
    console.error('[ADMIN APPROVE R3 ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/participant-status -> Polling endpoint for participant status sync
app.get('/api/participant-status', async (req, res) => {
  const { teamHash, participantName, teamName } = req.query;
  try {
    let record = null;
    if (teamHash) {
      record = await Registration.findOne({ teamHash });
    }
    if (!record && participantName && teamName) {
      record = await Registration.findOne({ participantName, teamName });
    }

    if (!record) {
      return res.json({ success: false, message: 'Record not found.' });
    }

    const isDq = !!(record.disqualified || (record.tabSwitchCount >= 2));

    return res.json({
      success: true,
      round1Completed: record.round1Completed || false,
      round2Approved: !!record.round2Approved,
      round3Approved: !!record.round3Approved,
      disqualified: (record.round2Approved || record.round3Approved) ? false : isDq,
      disqualificationReason: record.disqualificationReason || ''
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/registrations -> Get all MongoDB docs
app.get('/api/registrations', async (req, res) => {
  try {
    const docs = await Registration.find().sort({ registeredAt: -1 });
    return res.json({
      success: true,
      total: docs.length,
      data: docs
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/questions -> Fetch question bank from questions.json
app.get('/api/questions', (req, res) => {
  const filePath = path.join(__dirname, 'questions.json');
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.json({ success: true, questions: data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  return res.status(404).json({ success: false, message: 'questions.json not found' });
});

// POST /api/questions -> Update question bank in questions.json
app.post('/api/questions', (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid questions array.' });
  }

  const filePath = path.join(__dirname, 'questions.json');
  try {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');
    console.log(`\n[QUESTION BANK UPDATED] Saved ${questions.length} questions to questions.json\n`);
    return res.json({ success: true, message: `Successfully saved ${questions.length} questions to questions.json`, questions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Start Express Server
const startServer = (portToTry) => {
  const server = app.listen(portToTry, () => {
    console.log(`===================================================`);
    console.log(`  DECRYPT OR DIE BACKEND LIVE AT http://localhost:${portToTry}`);
    console.log(`===================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`\n⚠️  [PORT ${portToTry} IN USE] A server process is already running on port ${portToTry}.`);
      if (portToTry === 8080) {
        console.log(`   Attempting fallback to port 8081...\n`);
        startServer(8081);
      }
    } else {
      console.error('[SERVER ERROR]:', err);
    }
  });
};

startServer(PORT);
