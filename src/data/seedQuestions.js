export const seedQuestions = [
  // Geography - Easy
  {
    id: "geo-1",
    subject: "Geography",
    topic: "Capitals",
    type: "mcq",
    prompt: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answerIndex: 2,
    difficulty: 1,
    hint: "This city is famous for the Eiffel Tower!",
    explanation: "Paris is the capital and largest city of France, known for landmarks like the Eiffel Tower and Louvre Museum."
  },
  {
    id: "geo-2",
    subject: "Geography",
    topic: "Countries",
    type: "short",
    prompt: "Which country is known as the Land of the Rising Sun?",
    acceptableAnswers: ["japan"],
    difficulty: 1,
    hint: "This Asian country is famous for sushi and anime.",
    explanation: "Japan is called the Land of the Rising Sun because of its location to the east of Asia."
  },
  {
    id: "geo-3",
    subject: "Geography",
    topic: "Continents",
    type: "mcq",
    prompt: "Which is the largest continent by area?",
    options: ["Africa", "Asia", "North America", "Europe"],
    answerIndex: 1,
    difficulty: 1,
    hint: "This continent includes countries like China, India, and Russia.",
    explanation: "Asia is the largest continent, covering about 30% of Earth's land area."
  },

  // Math - Easy
  {
    id: "math-1",
    subject: "Math",
    topic: "Addition",
    type: "numeric",
    prompt: "What is 15 + 27?",
    answerNumeric: 42,
    tolerance: 0,
    difficulty: 1,
    hint: "Break it down: 15 + 25 + 2",
    explanation: "15 + 27 = 42. You can think of it as 15 + 30 - 3 = 45 - 3 = 42."
  },
  {
    id: "math-2",
    subject: "Math",
    topic: "Multiplication",
    type: "numeric",
    prompt: "What is 8 × 7?",
    answerNumeric: 56,
    tolerance: 0,
    difficulty: 1,
    hint: "Think of 8 × 7 as (8 × 8) - 8",
    explanation: "8 × 7 = 56. This is part of the times tables you can memorize!"
  },
  {
    id: "math-3",
    subject: "Math",
    topic: "Percentages",
    type: "numeric",
    prompt: "What is 25% of 80?",
    answerNumeric: 20,
    tolerance: 0,
    difficulty: 2,
    hint: "25% is the same as one quarter (1/4).",
    explanation: "25% of 80 = 0.25 × 80 = 20. Since 25% = 1/4, you can also think of it as 80 ÷ 4 = 20."
  },

  // Science - Easy to Medium
  {
    id: "sci-1",
    subject: "Science",
    topic: "Solar System",
    type: "mcq",
    prompt: "Which planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Earth", "Mars"],
    answerIndex: 1,
    difficulty: 1,
    hint: "This planet is named after the Roman messenger god.",
    explanation: "Mercury is the closest planet to the Sun and the smallest planet in our solar system."
  },
  {
    id: "sci-2",
    subject: "Science",
    topic: "States of Matter",
    type: "short",
    prompt: "Name one of the three main states of matter.",
    acceptableAnswers: ["solid", "liquid", "gas"],
    difficulty: 1,
    hint: "Think of ice, water, and steam.",
    explanation: "The three main states of matter are solid, liquid, and gas. Matter can change between these states with temperature."
  },
  {
    id: "sci-3",
    subject: "Science",
    topic: "Human Body",
    type: "mcq",
    prompt: "How many bones are in an adult human body?",
    options: ["186", "206", "226", "246"],
    answerIndex: 1,
    difficulty: 2,
    hint: "It's just over 200.",
    explanation: "An adult human has 206 bones. Babies are born with about 270 bones, but many fuse together as they grow."
  },

  // English - Easy to Medium
  {
    id: "eng-1",
    subject: "English",
    topic: "Grammar",
    type: "mcq",
    prompt: "Which word is a noun?",
    options: ["quickly", "happy", "dog", "run"],
    answerIndex: 2,
    difficulty: 1,
    hint: "A noun is a person, place, or thing.",
    explanation: "Dog is a noun because it names a thing (an animal). The other words are an adverb, adjective, and verb."
  },
  {
    id: "eng-2",
    subject: "English",
    topic: "Spelling",
    type: "short",
    prompt: "Spell the word that means 'very large'.",
    acceptableAnswers: ["huge", "enormous", "gigantic", "massive"],
    difficulty: 1,
    hint: "Think of words that mean the opposite of tiny.",
    explanation: "Words like huge, enormous, gigantic, and massive all mean very large or big."
  },
  {
    id: "eng-3",
    subject: "English",
    topic: "Synonyms",
    type: "mcq",
    prompt: "Which word means the same as 'happy'?",
    options: ["sad", "joyful", "angry", "tired"],
    answerIndex: 1,
    difficulty: 1,
    hint: "Look for a word with a positive feeling.",
    explanation: "Joyful means the same as happy - both describe feeling good or pleased."
  },

  // History - Easy to Medium
  {
    id: "hist-1",
    subject: "History",
    topic: "Ancient Egypt",
    type: "short",
    prompt: "What are the large stone structures built by ancient Egyptians called?",
    acceptableAnswers: ["pyramids"],
    difficulty: 1,
    hint: "They have a triangular shape and were built as tombs.",
    explanation: "Pyramids were built by ancient Egyptians as tombs for pharaohs and important people."
  },
  {
    id: "hist-2",
    subject: "History",
    topic: "Exploration",
    type: "mcq",
    prompt: "Who was the first person to walk on the moon?",
    options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"],
    answerIndex: 1,
    difficulty: 2,
    hint: "His famous words were 'That's one small step for man...'",
    explanation: "Neil Armstrong was the first person to walk on the moon during the Apollo 11 mission in 1969."
  },

  // More challenging questions
  {
    id: "math-4",
    subject: "Math",
    topic: "Fractions",
    type: "numeric",
    prompt: "What is 3/4 + 1/4?",
    answerNumeric: 1,
    tolerance: 0,
    difficulty: 2,
    hint: "When fractions have the same denominator, just add the numerators.",
    explanation: "3/4 + 1/4 = (3+1)/4 = 4/4 = 1. When adding fractions with the same denominator, add the top numbers."
  },
  {
    id: "sci-4",
    subject: "Science",
    topic: "Weather",
    type: "mcq",
    prompt: "What causes thunder?",
    options: ["Clouds bumping together", "Lightning heating the air", "Wind moving fast", "Rain falling hard"],
    answerIndex: 1,
    difficulty: 3,
    hint: "It's related to lightning and how air expands when heated.",
    explanation: "Thunder is caused by lightning rapidly heating the air, which expands quickly and creates the sound we hear."
  },
  {
    id: "geo-4",
    subject: "Geography",
    topic: "Rivers",
    type: "short",
    prompt: "What is the longest river in the world?",
    acceptableAnswers: ["nile", "nile river"],
    difficulty: 2,
    hint: "This river flows through Egypt and several other African countries.",
    explanation: "The Nile River is the longest river in the world, flowing about 4,135 miles through northeastern Africa."
  },
];