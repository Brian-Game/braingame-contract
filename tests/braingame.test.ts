import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Counter Functions Tests", () => {
  it("allows incrementing the counter", () => {
    const incrementResponse = simnet.callPublicFn(
      "braingame",
      "increment",
      [],
      deployer
    );

    expect(incrementResponse.result).toBeOk(Cl.uint(1));
  });

  it("emits event when incrementing counter", () => {
    const incrementResponse = simnet.callPublicFn(
      "braingame",
      "increment",
      [],
      deployer
    );

    expect(incrementResponse.result).toBeOk(Cl.uint(1));

    // Check for print event
    const printEvents = incrementResponse.events.filter(
      (e) => e.event === "print_event"
    );
    expect(printEvents).toHaveLength(1);
    
    const eventData = printEvents[0].data.value as any;
    expect(eventData.value.event.value).toBe("counter-incremented");
    expect(eventData.value.caller.value).toBe(deployer);
    expect(eventData.value["new-value"].value).toBe(1n);
    expect(eventData.value["block-height"].type).toBe("uint");
  });

  it("allows multiple increments", () => {
    simnet.callPublicFn("braingame", "increment", [], deployer);
    simnet.callPublicFn("braingame", "increment", [], deployer);
    const incrementResponse = simnet.callPublicFn(
      "braingame",
      "increment",
      [],
      deployer
    );

    expect(incrementResponse.result).toBeOk(Cl.uint(3));
  });

  it("allows decrementing the counter", () => {
    simnet.callPublicFn("braingame", "increment", [], deployer);
    simnet.callPublicFn("braingame", "increment", [], deployer);

    const decrementResponse = simnet.callPublicFn(
      "braingame",
      "decrement",
      [],
      deployer
    );

    expect(decrementResponse.result).toBeOk(Cl.uint(1));
  });

  it("emits event when decrementing counter", () => {
    simnet.callPublicFn("braingame", "increment", [], deployer);
    simnet.callPublicFn("braingame", "increment", [], deployer);

    const decrementResponse = simnet.callPublicFn(
      "braingame",
      "decrement",
      [],
      deployer
    );

    expect(decrementResponse.result).toBeOk(Cl.uint(1));

    // Check for print event
    const printEvents = decrementResponse.events.filter(
      (e) => e.event === "print_event"
    );
    expect(printEvents).toHaveLength(1);

    const eventData = printEvents[0].data.value as any;
    expect(eventData.value.event.value).toBe("counter-decremented");
    expect(eventData.value.caller.value).toBe(deployer);
    expect(eventData.value["new-value"].value).toBe(1n);
    expect(eventData.value["block-height"].type).toBe("uint");
  });

  it("prevents underflow when decrementing at zero", () => {
    const decrementResponse = simnet.callPublicFn(
      "braingame",
      "decrement",
      [],
      deployer
    );

    // Should return ERR_UNDERFLOW (err u105)
    expect(decrementResponse.result).toBeErr(Cl.uint(105));
  });

  it("returns the current counter value", () => {
    simnet.callPublicFn("braingame", "increment", [], deployer);
    simnet.callPublicFn("braingame", "increment", [], deployer);

    const counterValue = simnet.callReadOnlyFn(
      "braingame",
      "get-counter",
      [],
      deployer
    );

    expect(counterValue.result).toBeOk(Cl.uint(2));
  });
});

describe("Quiz Creation Tests", () => {
  it("allows creating a quiz with valid data", () => {
    const title = "Web3 Basics";
    const questions = [
      "What is Web3?",
      "What is a smart contract?",
      "What is DeFi?",
    ];
    const correctAnswers = [0, 2, 1];

    const createResponse = simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii(title),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(correctAnswers.map((a) => Cl.uint(a))),
      ],
      wallet1
    );

    expect(createResponse.result).toBeOk(Cl.uint(0)); // First quiz ID is 0
  });

  it("emits event when creating a quiz", () => {
    const title = "Blockchain Quiz";
    const questions = ["Question 1", "Question 2"];
    const correctAnswers = [0, 1];

    const createResponse = simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii(title),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(correctAnswers.map((a) => Cl.uint(a))),
      ],
      wallet1
    );

    expect(createResponse.result).toBeOk(Cl.uint(0));

    // Check for print event
    const printEvents = createResponse.events.filter(
      (e) => e.event === "print_event"
    );
    expect(printEvents).toHaveLength(1);
    
    const eventData = printEvents[0].data.value as any;
    expect(eventData.value.event.value).toBe("quiz-created");
    expect(eventData.value["quiz-id"].value).toBe(0n);
    expect(eventData.value.title.value).toBe(title);
    expect(eventData.value.creator.value).toBe(wallet1);
    expect(eventData.value["question-count"].value).toBe(2n);
    expect(eventData.value["created-at"].type).toBe("uint");
  });

  it("increments quiz ID for each new quiz", () => {
    const questions = ["Q1", "Q2"];
    const answers = [0, 1];

    const quiz1 = simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 1"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      wallet1
    );

    const quiz2 = simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 2"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      wallet2
    );

    expect(quiz1.result).toBeOk(Cl.uint(0));
    expect(quiz2.result).toBeOk(Cl.uint(1));
  });

  it("rejects quiz with no questions", () => {
    const createResponse = simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [Cl.stringAscii("Empty Quiz"), Cl.list([]), Cl.list([])],
      wallet1
    );

    // Should return ERR_INVALID_QUIZ_DATA (err u104)
    expect(createResponse.result).toBeErr(Cl.uint(104));
  });

  it("rejects quiz with mismatched question and answer counts", () => {
    const questions = ["Q1", "Q2", "Q3"];
    const answers = [0, 1]; // Only 2 answers for 3 questions

    const createResponse = simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Mismatched Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      wallet1
    );

    // Should return ERR_INVALID_QUIZ_DATA (err u104)
    expect(createResponse.result).toBeErr(Cl.uint(104));
  });

  it("allows creating quiz with maximum questions (20)", () => {
    const questions = Array.from({ length: 20 }, (_, i) => `Question ${i + 1}`);
    const answers = Array.from({ length: 20 }, (_, i) => i % 4);

    const createResponse = simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Max Questions Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      wallet1
    );

    expect(createResponse.result).toBeOk(Cl.uint(0));
  });

  it("allows different users to create quizzes", () => {
    const questions = ["Q1"];
    const answers = [0];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz by Wallet1"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      wallet1
    );

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz by Wallet2"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      wallet2
    );

    const totalQuizzes = simnet.callReadOnlyFn(
      "braingame",
      "get-total-quizzes",
      [],
      deployer
    );

    expect(totalQuizzes.result).toBeOk(Cl.uint(2));
  });
});

describe("Answer Submission Tests", () => {
  beforeEach(() => {
    // Create a test quiz before each test
    const questions = ["Q1", "Q2", "Q3"];
    const correctAnswers = [0, 2, 1];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Test Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(correctAnswers.map((a) => Cl.uint(a))),
      ],
      deployer
    );
  });

  it("allows submitting answers to a quiz", () => {
    const answers = [0, 2, 1]; // All correct

    const submitResponse = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    expect(submitResponse.result).toBeOk(
      Cl.tuple({
        score: Cl.uint(3),
        percentage: Cl.uint(100),
      })
    );
  });

  it("calculates correct score for perfect answers", () => {
    const answers = [0, 2, 1]; // All correct

    const submitResponse = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    expect(submitResponse.result).toBeOk(
      Cl.tuple({
        score: Cl.uint(3),
        percentage: Cl.uint(100),
      })
    );
  });

  it("calculates correct score for partial answers", () => {
    const answers = [0, 1, 1]; // 2 out of 3 correct

    const submitResponse = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    expect(submitResponse.result).toBeOk(
      Cl.tuple({
        score: Cl.uint(2),
        percentage: Cl.uint(66), // 2/3 * 100 = 66
      })
    );
  });

  it("calculates correct score for all wrong answers", () => {
    const answers = [3, 3, 3]; // All wrong

    const submitResponse = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    expect(submitResponse.result).toBeOk(
      Cl.tuple({
        score: Cl.uint(0),
        percentage: Cl.uint(0),
      })
    );
  });

  it("emits event when submitting answers", () => {
    const answers = [0, 2, 1];

    const submitResponse = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    // Check for print event
    const printEvents = submitResponse.events.filter(
      (e) => e.event === "print_event"
    );
    expect(printEvents).toHaveLength(1);
    
    const eventData = printEvents[0].data.value as any;
    expect(eventData.value.event.value).toBe("quiz-submitted");
    expect(eventData.value["quiz-id"].value).toBe(0n);
    expect(eventData.value.player.value).toBe(wallet1);
    expect(eventData.value.score.value).toBe(3n);
    expect(eventData.value.percentage.value).toBe(100n);
    expect(eventData.value["submitted-at"].type).toBe("uint");
  });

  it("prevents taking the same quiz twice", () => {
    const answers = [0, 2, 1];

    // First attempt
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    // Second attempt should fail
    const secondAttempt = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    // Should return ERR_ALREADY_TAKEN (err u102)
    expect(secondAttempt.result).toBeErr(Cl.uint(102));
  });

  it("rejects submission for non-existent quiz", () => {
    const answers = [0, 1, 2];

    const submitResponse = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(999), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    // Should return ERR_QUIZ_NOT_FOUND (err u101)
    expect(submitResponse.result).toBeErr(Cl.uint(101));
  });

  it("rejects submission with wrong number of answers", () => {
    const answers = [0, 1]; // Only 2 answers for 3 questions

    const submitResponse = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    // Should return ERR_INVALID_ANSWERS (err u103)
    expect(submitResponse.result).toBeErr(Cl.uint(103));
  });

  it("allows different users to take the same quiz", () => {
    const answers = [0, 2, 1];

    const submit1 = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    const submit2 = simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet2
    );

    expect(submit1.result).toBeOk(
      Cl.tuple({
        score: Cl.uint(3),
        percentage: Cl.uint(100),
      })
    );

    expect(submit2.result).toBeOk(
      Cl.tuple({
        score: Cl.uint(3),
        percentage: Cl.uint(100),
      })
    );
  });
});

describe("Player Statistics Tests", () => {
  beforeEach(() => {
    // Create multiple test quizzes
    const questions1 = ["Q1", "Q2", "Q3"];
    const answers1 = [0, 1, 2];

    const questions2 = ["Q1", "Q2"];
    const answers2 = [0, 1];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 1"),
        Cl.list(questions1.map((q) => Cl.stringAscii(q))),
        Cl.list(answers1.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 2"),
        Cl.list(questions2.map((q) => Cl.stringAscii(q))),
        Cl.list(answers2.map((a) => Cl.uint(a))),
      ],
      deployer
    );
  });

  it("returns zero stats for player who hasn't taken any quiz", () => {
    const stats = simnet.callReadOnlyFn(
      "braingame",
      "get-player-stats",
      [Cl.principal(wallet1)],
      wallet1
    );

    expect(stats.result).toBeOk(
      Cl.tuple({
        "quizzes-taken": Cl.uint(0),
        "total-score": Cl.uint(0),
        "best-score": Cl.uint(0),
      })
    );
  });

  it("updates stats after taking a quiz", () => {
    const answers = [0, 1, 2]; // 100% score

    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list(answers.map((a) => Cl.uint(a)))],
      wallet1
    );

    const stats = simnet.callReadOnlyFn(
      "braingame",
      "get-player-stats",
      [Cl.principal(wallet1)],
      wallet1
    );

    expect(stats.result).toBeOk(
      Cl.tuple({
        "quizzes-taken": Cl.uint(1),
        "total-score": Cl.uint(100),
        "best-score": Cl.uint(100),
      })
    );
  });

  it("accumulates stats across multiple quizzes", () => {
    // Take quiz 1 with 100% score
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0), Cl.uint(1), Cl.uint(2)])],
      wallet1
    );

    // Take quiz 2 with 50% score (1 out of 2 correct)
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(1), Cl.list([Cl.uint(0), Cl.uint(0)])],
      wallet1
    );

    const stats = simnet.callReadOnlyFn(
      "braingame",
      "get-player-stats",
      [Cl.principal(wallet1)],
      wallet1
    );

    expect(stats.result).toBeOk(
      Cl.tuple({
        "quizzes-taken": Cl.uint(2),
        "total-score": Cl.uint(150), // 100 + 50
        "best-score": Cl.uint(100),
      })
    );
  });

  it("tracks best score correctly", () => {
    // Take quiz 1 with 66% score (2 out of 3)
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0), Cl.uint(1), Cl.uint(0)])],
      wallet1
    );

    // Take quiz 2 with 100% score
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(1), Cl.list([Cl.uint(0), Cl.uint(1)])],
      wallet1
    );

    const stats = simnet.callReadOnlyFn(
      "braingame",
      "get-player-stats",
      [Cl.principal(wallet1)],
      wallet1
    );

    expect(stats.result).toBeOk(
      Cl.tuple({
        "quizzes-taken": Cl.uint(2),
        "total-score": Cl.uint(166), // 66 + 100
        "best-score": Cl.uint(100),
      })
    );
  });

  it("maintains separate stats for different players", () => {
    // Wallet1 takes quiz 1
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0), Cl.uint(1), Cl.uint(2)])],
      wallet1
    );

    // Wallet2 takes quiz 2
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(1), Cl.list([Cl.uint(0), Cl.uint(1)])],
      wallet2
    );

    const stats1 = simnet.callReadOnlyFn(
      "braingame",
      "get-player-stats",
      [Cl.principal(wallet1)],
      wallet1
    );

    const stats2 = simnet.callReadOnlyFn(
      "braingame",
      "get-player-stats",
      [Cl.principal(wallet2)],
      wallet2
    );

    expect(stats1.result).toBeOk(
      Cl.tuple({
        "quizzes-taken": Cl.uint(1),
        "total-score": Cl.uint(100),
        "best-score": Cl.uint(100),
      })
    );

    expect(stats2.result).toBeOk(
      Cl.tuple({
        "quizzes-taken": Cl.uint(1),
        "total-score": Cl.uint(100),
        "best-score": Cl.uint(100),
      })
    );
  });
});

describe("Read-Only Function Tests", () => {
  it("returns current block height", () => {
    const currentBlock = simnet.blockHeight;

    const blockHeightResponse = simnet.callReadOnlyFn(
      "braingame",
      "get-current-block",
      [],
      deployer
    );

    expect(blockHeightResponse.result).toBeOk(Cl.uint(currentBlock));
  });

  it("returns total number of quizzes", () => {
    const questions = ["Q1"];
    const answers = [0];

    // Create 3 quizzes
    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 1"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 2"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 3"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    const totalQuizzes = simnet.callReadOnlyFn(
      "braingame",
      "get-total-quizzes",
      [],
      deployer
    );

    expect(totalQuizzes.result).toBeOk(Cl.uint(3));
  });

  it("returns quiz info correctly", () => {
    const title = "Blockchain Basics";
    const questions = ["Q1", "Q2", "Q3"];
    const answers = [0, 1, 2];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii(title),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      wallet1
    );

    const quizInfo = simnet.callReadOnlyFn(
      "braingame",
      "get-quiz-info",
      [Cl.uint(0)],
      deployer
    );

    const quizData = quizInfo.result as any;
    expect(quizData.type).toBe("ok");
    expect(quizData.value.value.title.value).toBe(title);
    expect(quizData.value.value.creator.value).toBe(wallet1);
    expect(quizData.value.value["question-count"].value).toBe(3n);
    expect(quizData.value.value["total-attempts"].value).toBe(0n);
    expect(quizData.value.value["created-at"].type).toBe("uint");
  });

  it("returns quiz questions correctly", () => {
    const questions = ["What is Web3?", "What is DeFi?"];
    const answers = [0, 1];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Test Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    const quizQuestions = simnet.callReadOnlyFn(
      "braingame",
      "get-quiz-questions",
      [Cl.uint(0)],
      deployer
    );

    expect(quizQuestions.result).toBeOk(
      Cl.list(questions.map((q) => Cl.stringAscii(q)))
    );
  });

  it("returns error for non-existent quiz info", () => {
    const quizInfo = simnet.callReadOnlyFn(
      "braingame",
      "get-quiz-info",
      [Cl.uint(999)],
      deployer
    );

    expect(quizInfo.result).toBeErr(Cl.uint(101)); // ERR_QUIZ_NOT_FOUND
  });

  it("returns player's quiz score", () => {
    const questions = ["Q1", "Q2"];
    const correctAnswers = [0, 1];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Test Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(correctAnswers.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    // Submit answers
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0), Cl.uint(1)])],
      wallet1
    );

    const score = simnet.callReadOnlyFn(
      "braingame",
      "get-quiz-score",
      [Cl.uint(0), Cl.principal(wallet1)],
      deployer
    );

    const scoreData = score.result as any;
    expect(scoreData.type).toBe("ok");
    expect(scoreData.value.value.score.value).toBe(2n);
    expect(scoreData.value.value.percentage.value).toBe(100n);
    expect(scoreData.value.value["submitted-at"].type).toBe("uint");
  });

  it("returns zero score for player who hasn't taken quiz", () => {
    const questions = ["Q1"];
    const answers = [0];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Test Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    const score = simnet.callReadOnlyFn(
      "braingame",
      "get-quiz-score",
      [Cl.uint(0), Cl.principal(wallet1)],
      deployer
    );

    expect(score.result).toBeOk(
      Cl.tuple({
        score: Cl.uint(0),
        percentage: Cl.uint(0),
        "submitted-at": Cl.uint(0),
      })
    );
  });

  it("checks if player has taken quiz", () => {
    const questions = ["Q1"];
    const answers = [0];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Test Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    // Before taking quiz
    const beforeTaking = simnet.callReadOnlyFn(
      "braingame",
      "has-taken-quiz",
      [Cl.uint(0), Cl.principal(wallet1)],
      deployer
    );

    expect(beforeTaking.result).toBeOk(Cl.bool(false));

    // Take quiz
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0)])],
      wallet1
    );

    // After taking quiz
    const afterTaking = simnet.callReadOnlyFn(
      "braingame",
      "has-taken-quiz",
      [Cl.uint(0), Cl.principal(wallet1)],
      deployer
    );

    expect(afterTaking.result).toBeOk(Cl.bool(true));
  });
});

describe("Integration Tests", () => {
  it("handles complete quiz lifecycle", () => {
    // Create quiz
    const questions = ["Q1", "Q2", "Q3"];
    const correctAnswers = [0, 1, 2];

    const createResponse = simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Integration Test Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(correctAnswers.map((a) => Cl.uint(a))),
      ],
      wallet1
    );

    expect(createResponse.result).toBeOk(Cl.uint(0));

    // Multiple players take the quiz
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0), Cl.uint(1), Cl.uint(2)])],
      wallet2
    );

    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0), Cl.uint(0), Cl.uint(2)])],
      wallet3
    );

    // Check quiz info shows attempts
    const quizInfo = simnet.callReadOnlyFn(
      "braingame",
      "get-quiz-info",
      [Cl.uint(0)],
      deployer
    );

    const quizData = quizInfo.result as any;
    expect(quizData.value.value["total-attempts"].value).toBe(2n);
  });

  it("handles multiple quizzes and players", () => {
    // Create 2 quizzes
    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 1"),
        Cl.list([Cl.stringAscii("Q1"), Cl.stringAscii("Q2")]),
        Cl.list([Cl.uint(0), Cl.uint(1)]),
      ],
      wallet1
    );

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Quiz 2"),
        Cl.list([Cl.stringAscii("Q1")]),
        Cl.list([Cl.uint(0)]),
      ],
      wallet2
    );

    // Wallet3 takes both quizzes
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0), Cl.uint(1)])],
      wallet3
    );

    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(1), Cl.list([Cl.uint(0)])],
      wallet3
    );

    // Check stats
    const stats = simnet.callReadOnlyFn(
      "braingame",
      "get-player-stats",
      [Cl.principal(wallet3)],
      wallet3
    );

    expect(stats.result).toBeOk(
      Cl.tuple({
        "quizzes-taken": Cl.uint(2),
        "total-score": Cl.uint(200), // Both 100%
        "best-score": Cl.uint(100),
      })
    );
  });

  it("tracks quiz attempts correctly", () => {
    const questions = ["Q1"];
    const answers = [0];

    simnet.callPublicFn(
      "braingame",
      "create-quiz",
      [
        Cl.stringAscii("Popular Quiz"),
        Cl.list(questions.map((q) => Cl.stringAscii(q))),
        Cl.list(answers.map((a) => Cl.uint(a))),
      ],
      deployer
    );

    // Three different players take the quiz
    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0)])],
      wallet1
    );

    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0)])],
      wallet2
    );

    simnet.callPublicFn(
      "braingame",
      "submit-answers",
      [Cl.uint(0), Cl.list([Cl.uint(0)])],
      wallet3
    );

    const quizInfo = simnet.callReadOnlyFn(
      "braingame",
      "get-quiz-info",
      [Cl.uint(0)],
      deployer
    );

    const quizData = quizInfo.result as any;
    expect(quizData.value.value["total-attempts"].value).toBe(3n);
  });
});
