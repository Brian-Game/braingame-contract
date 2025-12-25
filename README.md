# BrainGame

A simple on-chain quiz smart contract for Stacks blockchain built with Clarity. Create quizzes, test knowledge, score answers, and compete on the leaderboard.

## What It Does

BrainGame allows you to:
- Create quizzes with multiple questions
- Submit answers to quizzes
- Automatic scoring and grading
- Track quiz attempts and scores
- Maintain quiz leaderboards
- Award badges for high scores

Perfect for:
- Educational platforms
- Trivia competitions
- Knowledge verification
- Learning testing logic
- Understanding scoring systems
- Building educational dApps

## Features

- **Quiz Creation**: Anyone can create quizzes
- **Multiple Choice**: Support for various question types
- **Auto Scoring**: Instant grading and results
- **Attempt Tracking**: See all your quiz attempts
- **High Score Boards**: Compete with others
- **One Attempt Per Quiz**: Fair competition
- **Permanent Records**: All results on-chain

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) installed
- Basic understanding of Stacks blockchain
- A Stacks wallet for testnet deployment

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/braingame.git
cd braingame

# Check Clarinet installation
clarinet --version
```

## Project Structure

```
braingame/
├── contracts/
│   └── braingame.clar       # Main quiz contract
├── tests/
│   └── braingame_test.ts    # Contract tests
├── Clarinet.toml            # Project configuration
└── README.md
```

## Usage

### Deploy Locally

```bash
# Start Clarinet console
clarinet console

# Create a quiz
(contract-call? .braingame create-quiz 
  "Web3 Basics" 
  (list "What is Web3?" "What is a smart contract?" "What is DeFi?")
  (list u0 u2 u1)  ;; Correct answer indices
)

# Take the quiz
(contract-call? .braingame submit-answers 
  u0  ;; Quiz ID
  (list u0 u2 u1)  ;; Your answers
)

# Get your score
(contract-call? .braingame get-quiz-score u0 tx-sender)

# View leaderboard
(contract-call? .braingame get-quiz-leaderboard u0)
```

### Contract Functions

**create-quiz (title, questions, correct-answers)**
```clarity
(contract-call? .braingame create-quiz 
  "Clarity Basics"
  (list "Clarity is decidable?" "Clarity has loops?" "Clarity is interpreted?")
  (list u0 u1 u0)  ;; true, false, true (indices for options)
)
```
Creates a new quiz and returns quiz ID

**submit-answers (quiz-id, answers)**
```clarity
(contract-call? .braingame submit-answers 
  u0 
  (list u0 u1 u0)  ;; Submit your answers
)
```
Submit answers and get scored automatically

**get-quiz-info (quiz-id)**
```clarity
(contract-call? .braingame get-quiz-info u0)
```
Returns quiz title, question count, creator

**get-quiz-score (quiz-id, player)**
```clarity
(contract-call? .braingame get-quiz-score u0 tx-sender)
```
Get a player's score for a specific quiz

**get-player-stats (player)**
```clarity
(contract-call? .braingame get-player-stats tx-sender)
```
Returns total quizzes taken, average score, best score

**get-quiz-leaderboard (quiz-id)**
```clarity
(contract-call? .braingame get-quiz-leaderboard u0)
```
Returns top scorers for a quiz

**has-taken-quiz (quiz-id, player)**
```clarity
(contract-call? .braingame has-taken-quiz u0 tx-sender)
```
Check if player has already taken this quiz

**get-total-quizzes**
```clarity
(contract-call? .braingame get-total-quizzes)
```
Returns total number of quizzes created

## How It Works

### Creating Quizzes
1. Creator calls `create-quiz` with title, questions, and answers
2. Quiz assigned unique ID
3. Questions stored on-chain
4. Correct answers hashed for security
5. Quiz becomes available to all

### Taking Quizzes
1. Player calls `submit-answers` with quiz ID and their answers
2. Contract checks if player already took quiz
3. Answers compared to correct answers
4. Score calculated (correct/total)
5. Results stored permanently

### Scoring System
- 1 point per correct answer
- Total score = correct answers / total questions
- Percentage calculated automatically
- Perfect score = 100%
- Scores stored forever

### Leaderboard Logic
- Sorted by score (highest first)
- Then by completion time (faster wins ties)
- Top 10 displayed
- Updates automatically

## Data Structure

### Quiz Structure
```clarity
{
  id: uint,
  title: (string-ascii 100),
  creator: principal,
  question-count: uint,
  correct-answers-hash: (buff 32),
  total-attempts: uint,
  created-at: uint
}
```

### Answer Submission
```clarity
{
  quiz-id: uint,
  player: principal,
  answers: (list 20 uint),
  score: uint,
  percentage: uint,
  submitted-at: uint
}
```

### Storage Pattern
```clarity
;; Map of quiz-id to quiz data
(define-map quizzes uint quiz-data)

;; Map of (quiz-id, player) to score
(define-map quiz-scores {quiz-id: uint, player: principal} uint)

;; Map of player to stats
(define-map player-stats principal {
  quizzes-taken: uint,
  total-score: uint,
  best-score: uint
})
```

## Testing

```bash
# Run all tests
npm run test

# Check contract syntax
clarinet check

# Run specific test
npm run test -- braingame
```

## Learning Goals

Building this contract teaches you:
- ✅ Testing and verification logic
- ✅ Scoring algorithms
- ✅ Hash-based answer storage
- ✅ Preventing duplicate submissions
- ✅ Leaderboard management
- ✅ Statistical tracking

## Example Use Cases

**Educational Quiz:**
```clarity
;; Teacher creates quiz
(contract-call? .braingame create-quiz 
  "Blockchain 101"
  (list 
    "Bitcoin was created in?" 
    "What is consensus?" 
    "What is a wallet?"
  )
  (list u2 u0 u1)  ;; Correct answer indices
)

;; Students take quiz
(contract-call? .braingame submit-answers u0 (list u2 u0 u1))
```

**Trivia Night:**
```clarity
;; Host creates trivia quiz
(contract-call? .braingame create-quiz 
  "90s Pop Culture"
  (list 
    "Who sang 'Baby One More Time'?" 
    "Matrix released in?" 
    "Friends premiered in?"
  )
  (list u0 u2 u1)
)

;; Players compete
(contract-call? .braingame submit-answers u0 (list u0 u2 u1))
```

**Job Screening:**
```clarity
;; Company creates skills test
(contract-call? .braingame create-quiz 
  "Smart Contract Developer Test"
  (list 
    "Clarity is decidable?" 
    "What's stx-transfer?" 
    "What's try!?"
  )
  (list u0 u1 u2)
)

;; Candidates take test
(contract-call? .braingame submit-answers u0 (list u0 u1 u2))
```

**Certification Exam:**
```clarity
;; Create certification quiz
(contract-call? .braingame create-quiz 
  "Web3 Certified Developer"
  (list "Question 1" "Question 2" "Question 3" "Question 4" "Question 5")
  (list u0 u2 u1 u0 u3)
)

;; Take certification
(contract-call? .braingame submit-answers u0 (list u0 u2 u1 u0 u3))
```

## Quiz Examples

### Blockchain Quiz:
```
Quiz: "Blockchain Fundamentals"
Q1: What is a blockchain?
  0. Distributed ledger ✓
  1. Centralized database
  2. Cloud storage
  
Q2: Bitcoin uses which consensus?
  0. Proof of Stake
  1. Proof of Authority
  2. Proof of Work ✓
  
Q3: Smart contracts are?
  0. Paper contracts
  1. Self-executing code ✓
  2. Legal agreements
```

### Clarity Quiz:
```
Quiz: "Clarity Language Basics"
Q1: Clarity has loops?
  0. True
  1. False ✓
  
Q2: What's tx-sender?
  0. Transaction sender ✓
  1. Contract owner
  2. Block producer
  
Q3: What does try! do?
  0. Catch errors
  1. Unwrap or return ✓
  2. Execute function
```

## Common Patterns

### Create and Share
```clarity
;; Create quiz
(contract-call? .braingame create-quiz "My Quiz" questions answers)

;; Get quiz ID
(contract-call? .braingame get-total-quizzes)

;; Share with friends
;; "Hey, take quiz #5!"
```

### Check Before Taking
```clarity
;; Check if already taken
(contract-call? .braingame has-taken-quiz u0 tx-sender)

;; If not, take it
(contract-call? .braingame submit-answers u0 answers)
```

### Track Progress
```clarity
;; Check your stats
(contract-call? .braingame get-player-stats tx-sender)

;; View specific scores
(contract-call? .braingame get-quiz-score u0 tx-sender)
(contract-call? .braingame get-quiz-score u1 tx-sender)
```

### Compete for Top Score
```clarity
;; Check leaderboard
(contract-call? .braingame get-quiz-leaderboard u0)

;; See if you're on it
(contract-call? .braingame get-quiz-score u0 tx-sender)
```

## Scoring Examples

### Perfect Score:
```
Questions: 5
Correct: 5
Score: 5/5 = 100%
Status: Perfect! 🎯
```

### Passing Score:
```
Questions: 10
Correct: 7
Score: 7/10 = 70%
Status: Pass ✓
```

### Failed Attempt:
```
Questions: 20
Correct: 8
Score: 8/20 = 40%
Status: Try again 📚
```

## Deployment

### Testnet
```bash
clarinet deployments generate --testnet --low-cost
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Mainnet
```bash
clarinet deployments generate --mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

## Roadmap

- [ ] Write the core contract
- [ ] Add comprehensive tests
- [ ] Deploy to testnet
- [ ] Add multiple quiz types (true/false, multi-select)
- [ ] Implement timed quizzes
- [ ] Add difficulty levels
- [ ] Support quiz categories
- [ ] Add explanation for answers
- [ ] Implement retry mechanism (with penalty)
- [ ] Create quiz badges/NFTs for achievements

## Advanced Features (Future)

**Quiz Types:**
- Multiple choice (current)
- True/False
- Multi-select answers
- Fill in the blank
- Matching questions

**Timed Quizzes:**
- Set time limits
- Bonus for speed
- Timeout handling
- Time-based scoring

**Categories:**
- Subject tags
- Difficulty levels
- Topic filtering
- Search by category

**Achievements:**
- Perfect score badges
- Quiz master titles
- Streak tracking
- Special NFTs for top performers

**Social Features:**
- Challenge friends
- Share scores
- Quiz recommendations
- Community quizzes

## Security Features

- ✅ One attempt per quiz (prevents cheating)
- ✅ Answers hashed (prevents snooping)
- ✅ Scores immutable (can't be changed)
- ✅ Transparent results (public verification)
- ✅ Time stamped (prevents manipulation)
- ✅ Creator attribution (credit to quiz makers)

## Best Practices

**Creating Quizzes:**
- Write clear questions
- Avoid ambiguous answers
- Test your quiz first
- Provide fair difficulty
- Credit sources if applicable

**Taking Quizzes:**
- Read questions carefully
- Don't rush
- One attempt only
- Be honest (no cheating)
- Learn from mistakes

**Gas Optimization:**
- Batch quiz creation
- Limit question count
- Keep titles concise
- Submit once per quiz

## Important Notes

⚠️ **Know Before Playing:**
- One attempt per quiz only
- Scores are permanent
- Can't retake quizzes
- All results public

💡 **Study Tips:**
- Review material first
- Take your time
- Read all options
- Check your answers
- Learn from results

🎯 **Scoring:**
- Aim for 100%
- 70%+ is usually passing
- Track your improvement
- Compete fairly

## Limitations

**Current Constraints:**
- Maximum 20 questions per quiz
- One attempt only
- No answer explanations yet
- No time limits
- Simple scoring only

**Design Choices:**
- One attempt prevents spam
- Public scores encourage honesty
- Simple structure keeps gas low
- Permanent records for credibility

## Quiz Categories (Ideas)

**Tech & Programming:**
- Blockchain basics
- Smart contracts
- Web development
- Clarity language
- Cybersecurity

**General Knowledge:**
- History
- Geography
- Science
- Pop culture
- Current events

**Professional:**
- Certification prep
- Skills assessment
- Industry knowledge
- Best practices
- Case studies

## Contributing

This is a learning project! Feel free to:
- Open issues for questions
- Submit PRs for improvements
- Fork and experiment
- Create awesome quizzes

## License

MIT License - do whatever you want with it

## Resources

- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)
- [Stacks Blockchain](https://www.stacks.co/)
- [Quiz Design Best Practices](https://book.clarity-lang.org/)

---

Built while learning Clarity 🧠

## Fun Stats Ideas

Track interesting metrics:
- Total quizzes created
- Total attempts made
- Average scores
- Perfect scores achieved
- Most popular quiz
- Hardest quiz (lowest avg)
- Quiz champion (most 100%s)

## Motivational Quotes

"Education is the most powerful weapon which you can use to change the world." - Nelson Mandela

Test your knowledge. Challenge your mind. Play BrainGame. 🎓

---

**Your Stats:**
- Quizzes Taken: ???
- Average Score: ???%
- Best Score: ???%
- Perfect Scores: ???

**Ready to test your knowledge?** 🚀
