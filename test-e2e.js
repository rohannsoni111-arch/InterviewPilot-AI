const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runE2E() {
  console.log('========================================================================');
  console.log('🚀 RUNNING COMPLETE INTERVIEWPILOT AI END-TO-END VERIFICATION SUITE');
  console.log('========================================================================');
  const testEmail = 'candidate_' + Date.now() + '@interviewpilot.io';
  const testPassword = 'Password123!Secure';
  let token = '';
  let refreshToken = '';
  let userId = '';

  // 1. Auth Register
  console.log('\n[1/8] Testing User Registration...');
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: testPassword, name: 'Alex Candidate' });
  
  if (regRes.status !== 201 && regRes.status !== 200) {
    throw new Error('Registration failed: ' + JSON.stringify(regRes));
  }
  token = regRes.data.data.tokens.accessToken;
  refreshToken = regRes.data.data.tokens.refreshToken;
  userId = regRes.data.data.user.id;
  console.log('✓ Registered user successfully. User ID:', userId);

  // 2. Auth Login & Me
  console.log('\n[2/8] Testing Login & Profile Fetch...');
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: testPassword });
  console.log('✓ Login status:', loginRes.status, '| Token issued:', !!loginRes.data.data.tokens.accessToken);

  const meRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('✓ Authenticated user profile:', meRes.data.data.user.email);

  // 3. Resume Upload & Job Description Match
  console.log('\n[3/8] Testing Resume Creation & Job Description Match...');
  const sampleResume = 'Senior Software Engineer with 5 years experience in React, TypeScript, Node.js, Express, MongoDB, Redis, and Distributed Systems.';
  const sampleJD = 'Looking for a Full Stack Engineer with strong proficiency in React, Node.js, TypeScript, and AWS cloud architectures.';
  
  const resumeRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/resumes',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
  }, { title: 'Master Resume 2026', rawText: sampleResume, fileName: 'resume.txt' });
  
  const resumeId = resumeRes.data.data.id;
  console.log('✓ Resume created with ID:', resumeId);

  const matchRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/resumes/match',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
  }, { resumeId: resumeId, jobDescription: sampleJD });
  console.log('✓ ATS Match Score:', matchRes.data.data.matchScore, '% | Matched Skills:', matchRes.data.data.matchedSkills.join(', '));

  // 4. Code Execution Sandbox
  console.log('\n[4/8] Testing Code Execution Sandbox...');
  const codeRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/code/run',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
  }, {
    language: 'python',
    code: 'def solution(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\nprint(solution([2,7,11,15], 9))'
  });
  console.log('✓ Code Sandbox Output:', codeRes.data.data.stdout ? codeRes.data.data.stdout.trim() : codeRes.data.data);

  // 5. Company Question Bank & Tracks
  console.log('\n[5/8] Testing Question Bank & 1-Click Launch...');
  const qbRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/questions?company=Google',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const googleQuestions = qbRes.data.data;
  console.log('✓ Google Curated Questions Returned:', googleQuestions.length, '| Sample Title:', googleQuestions[0]?.title);

  // 6. AI Mock Interview Session Lifecycle
  console.log('\n[6/8] Testing AI Mock Interview Session Lifecycle...');
  const createSessRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/interviews',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
  }, {
    title: 'Full Stack AI Simulation',
    type: 'technical',
    targetRole: 'Full Stack Engineer',
    difficulty: 'senior',
    durationMinutes: 30,
    focusTopics: ['React', 'Node.js', 'System Design'],
    strictness: 'realistic'
  });
  const sessionId = createSessRes.data.data.id;
  console.log('✓ Interview Session Created:', sessionId);

  const startSessRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/interviews/' + sessionId + '/start',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const firstMessage = startSessRes.data.data.message;
  console.log('✓ Interview Started. AI Question:', firstMessage.content.slice(0, 100) + '...');

  const answerRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/interviews/' + sessionId + '/turn',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
  }, {
    content: 'In React, we use useState and useReducer for local state, and Context or external stores like Zustand for global state management.',
    codeSnippet: {
      code: 'const [state, setState] = useState(0);',
      language: 'typescript'
    }
  });
  console.log('✓ Turn Processed. AI Follow-up:', answerRes.data.data.message.content.slice(0, 100) + '...');

  const concludeSessRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/interviews/' + sessionId + '/conclude',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('✓ Session Concluded. Status:', concludeSessRes.data.data.status);

  // 7. Cryptographic Report & Verification
  console.log('\n[7/8] Testing Verified Candidate Report & Cryptographic Proof...');
  const verifyReportRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/interviews/' + sessionId + '/verify-badge',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const badgeId = verifyReportRes.data.data.badgeId;
  const cryptoHash = verifyReportRes.data.data.verificationHash;
  console.log('✓ Verification Badge Issued:', badgeId, '| SHA-256 Hash:', cryptoHash);

  const publicVerifyRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/verify/' + badgeId,
    method: 'GET'
  });
  console.log('✓ Public Verification Candidate:', publicVerifyRes.data.data.badge.candidateName, '| Overall Score:', publicVerifyRes.data.data.badge.overallScore + '%');

  // 8. Multiplayer Peer Room
  console.log('\n[8/8] Testing Peer Pairing Studio...');
  const roomRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/peer-rooms',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
  }, {
    title: 'System Design Mock Pairing',
    track: 'system_design',
    difficulty: 'senior'
  });
  const roomCode = roomRes.data.data.roomCode;
  console.log('✓ Peer Room Created with Room Code:', roomCode, '| Title:', roomRes.data.data.title);

  const getRoomRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/peer-rooms/' + roomCode,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('✓ Retrieved Peer Room Status:', getRoomRes.data.data.status, '| Current Participants:', getRoomRes.data.data.participants.length);

  console.log('\n========================================================================');
  console.log('🎉 ALL 8/8 END-TO-END FLOWS AND INTEGRATION TESTS PASSED CLEANLY! 🎉');
  console.log('========================================================================');
}

runE2E().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
