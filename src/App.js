import React, { useState, useEffect } from 'react';

const App = () => {
  // Estado para controlar qual tela mostrar
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' ou 'practice'
  const [theme, setTheme] = useState('rosa');
  const [exercises, setExercises] = useState([]); // Array de 10 exercícios
  const [exerciseAnswers, setExerciseAnswers] = useState({}); // Respostas por exercício
  const [exerciseResults, setExerciseResults] = useState({}); // Resultados por exercício
  const [orderingAnswers, setOrderingAnswers] = useState({}); // Respostas de ordering por exercício
  const [selectedExerciseTypes, setSelectedExerciseTypes] = useState([]); // Múltiplos filtros
  const [difficulty, setDifficulty] = useState('tens');
  const [memoryPhases, setMemoryPhases] = useState({}); // Fases de memory por exercício
  const [memoryTimers, setMemoryTimers] = useState({}); // Timers de memory por exercício
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  // Virtual Paper states
  const [showVirtualPaper, setShowVirtualPaper] = useState(false);
  const [paperTool, setPaperTool] = useState('pencil'); // pencil, eraser, line, circle, square
  const [paperColor, setPaperColor] = useState('#000000');
  const [paperSize, setPaperSize] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [calculatorPrevious, setCalculatorPrevious] = useState(null);
  const [calculatorOperation, setCalculatorOperation] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  // Teacher Virtual Assistant states
  const [showTeacher, setShowTeacher] = useState(false);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [currentExerciseForHelp, setCurrentExerciseForHelp] = useState(null);
  // Track used exercises to prevent repetition
  const [usedExercises, setUsedExercises] = useState({
    pattern: new Set(),
    ordering: new Set(),
    missingNumber: new Set(),
    addition: new Set(),
    subtraction: new Set(),
    memory: new Set(),
    wordProblem: new Set()
  });
  
  // Função para tocar som de celebração
  const playCelebrationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRhwMAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQgMAACAOIQ3gDeAN4A3gDeAN4A3fziCOII4hDiGOII4fzh9OHw4gDiDOIQ4hDiEOHo4eDh6OII4iDiROIo4dThyOHE4ejiFOIU4iDiIOIM4gDh8OH44gTh6OHY4djiAOIo4jDiIOH04dDh2OHw4hziLOIY4eTh0OHg4fDiFOIA4fDh0OHI4fDiFOIU4hDh8OHM4eDh+OIY4iDh8OHI4dDh4OIM4hjiEOHw4cjh0OHo4gziKOII4eDh0OHY4fDiGOIo4gDh4OHA4ejh+OIk4jTh8OHM4dDh8OIU4jTiGOHk4cDh2OHo4hziJOIU4eDh2OHY4eDiIOIk4hDh4OHM4ejh8OIc4iziAOHI4dDh0OII4hTiHOHw4cDhyOHI4fziGOIY4fDhyOHA4djiBOIo4hDh6OHM4dDh6OIU4iDiCOHM4dDh0OII4iDiIOH84czh2OHw4hTiIOHw4djhzOH04gjiGOII4fDh2OHs4hDiEOII4fDh5OHY4ejiFOIU4gDh4OHE4fDiDOIg4hDh+OHI4eDh+OIc4hjiGOHY4dDh0OIM4jjiHOHs4cjh2OHs4gjiKOII4fDh1OHo4fDiHOIk4hDh0OHY4eDiCOIg4hTh4OHM4eDh+OIU4iDh6OHI4djh4OII4iDiEOH04dDh2OHw4hTiGOIM4dzh0OHw4gDiIOIM4fzh0OHw4hDiGOIU4fDh4OHg4fDiFOIQ4gDh0OHY4ejiBOIc4hDh6OHE4eDh9OIg4iDh+OHI4czh+OIU4ijiEOHg4czh7OII4isiLOIs4iziJOI44iDiKOIs4ijiJOII4hjiIOI04iDiEOHw4fziDOIg4hDiCOHY4eziBOIM4hDh8OH04fDiEOIU4hjiAOH44fDiDOIQ4hTiAOHY4fjiBOIY4hTiEOHo4fDiAOIo4iDiGOHo4fDh+OIc4hziEOHg4ejiAOIE4hDiCOH44ezh8OIQ4hjiAOH84fTh+OIE4hTiAOHw4fDiAOIU4hDiCOHw4fDiCOIM4hTiEOH44fDh+OII4hDiCOIE4gDh8OIM4hDiEOIE4gDh+OII4gDiEOII4fDh7OII4hDiEOIE4fDh8OIE4hDiEOIE4gDh7OIE4hDiEOIE4gDh8OIE4hDiBOIE4gDh+OIE4hDiCOH84gDh8OIM4gDiEOIE4gTh8OII4hDiCOII4gDh+OIE4hDiEOIE4gDh8OIE4hTiEOII4fzh8OIM4hDiEOII4gjh8OIE4hDiEOIE4gDh6OIE4hDiEOII4gDh8OIA4hDiCOII4fzh8OIA4hDiCOII4fzh8OII4hDiEOIE4gDh7OIE4hDiEOII4fzh9OIA4hDiEOIE4fzh8OII4hDiEOII4gDh+OII4hDiEOIE4fzh7OII4hDiCOII4gDh+OIE4hTiCOII4fzh8OII4hDiEOIE4gDh+OIE4hTiEOII4gDh8OII4hDiEOIE4fzh8OIE4hDiCOII4gDh9OIA4hTiEOIE4gDh7OIE4hDiCOoI6gTqBOoI6hDqEOoI6gTqAOoA6hDqEOoU6hDqBOoA6gDqEOoU6hTqEOoI6gDqCOoU6hTqEOoI6gTqBOoI6hDqGOoQ6gzqBOoI6gjqEOoY6hjqDOoI6gTqDOoQ6hjqFOoM6gTqBOoM6hTqEOoQ6gjqBOoI6gjqEOoQ6hDqCOoE6gjqDOoQ6hTqEOoI6gTqBOoI6hDqFOoM6gjqBOoA6hDqFOoY6hDqDOoE6gjqFOoU6hjqEOoI6gTqCOoM6hDqGOoU6gzqCOoI6hDqFOoc6hTqDOoE6gzqDOoY6hzqGOoM6gjqCOoU6hjqHOoU6hDqCOoM6hTqGOoc6hjqEOoI6gzqFOoY6hzqFOoM6gTqDOoU6hjqHOoY6hDqCOoI6hTqHOoc6hjqEOoI6gzqFOoY6hzqGOoM6gjqDOoU6hzqHOoY6hDqCOoM6hTqGOog6hjqEOoI6gjqFOoY6iDqGOoQ6gjqCOoQ6hjqIOoY6hDqCOoM6hTqHOog6hzqEOoI6hDqFOoc6iDqGOoQ6gjqDOoU6hjqIOoY6hDqCOoM6hTqHOog6hjqEOoI6gzqFOoY6iDqGOoU6gjqDOoU6hzqHOoY6hTqDOoQ6hTqHOoc6hjqEOoQ6hDqGOoc6iDqGOoQ6hDqEOoY6iDqHOoY6hDqEOoM6hjqHOog6hzqGOoM6hDqFOoY6iDqHOoU6gzqDOoU6hzqIOoc6hTqDOoQ6hjqHOoc6hTqFOoM6hTqGOoc6hzqGOoM6hDqFOoY6hzqHOoU6hDqDOoU6hzqIOoc6hTqEOoM6hTqGOog6hzqGOoM6hDqFOoc6iDqGOoU6hDqEOoU6hzqIOoY6hTqEOoQ6hjqHOog6hzqFOoQ6hTqGOoc6iDqHOoU6hDqFOoY6hzqHOoY6hTqEOoU6hjqHOoc6hjqFOoQ6hTqGOoc6hzqGOoU6hDqFOoY6hzqHOoY6hTqEOoU6hjqHOoc6hzqFOoQ6hTqGOoc6hzqGOoU6hDqFOoY6hzqHOoY6hTqFOoU6hjqHOoc6hjqFOoQ6hTqGOoc6hzqGOoU6hDqGOoY6hzqHOoY6hTqFOoY6hzqHOog6hjqFOoU6hjqHOok6hzqGOoU6hjqHOok6iDqIOoY6hjqGOok6iDqHOoY6hzqGOoc6hzqGOoY6hTqGOoY6hzqGOoU6hDqFOoY6hjqGOoU6hTqFOoY6hTqFOoY6hTqFOoQ6hDqFOoU6hTqEOoQ6gzqDOoU6hDqEOoQ6gzqDOoM6hDqDOoQ6gzqCOoI6gjqDOoM6gzqCOoE6gTqCOoI6gjqCOoA6gTqBOoE6gTqBOoE6fzqBOoE6gTqAOn86gDqAOoE6fzp/On86fjqAOn46gDp/On86fDp+On46gDp8Onw6fDp7Onw6fTp/Onw6ezp5Onk6fTp/On86fDp7Onc6ejp8On86fzp8Onk6dzp6On06fzp/Onw6eTp3Onk6fDp/On86fDp5Onc6eTp8On86fzp8Onk6dzp5Onw6fzp/Onw6eTp1Onk6fDp/On86fDp5OnU6eTp8On86fzp8Onk6dTp5Onw6fzp/Onw6eTp1Onk6fDp/On86fDp5OnU6eTp8On86fzp8Onk6dTp5Onw6fzp/Onw6eTp1Onk6fDp/On86fDp5OnU6eTp8On86fzp8Onk6dTp5Onw6fzp/Onw6eTp1Onk6fDp/On86fTp5OnU6eRo=');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };
  
  // Função para calcular estrelas
  const getStarRating = (score) => {
    if (score === 10) return 5;
    if (score >= 8) return 4;
    if (score >= 6) return 3;
    if (score >= 4) return 2;
    if (score >= 2) return 1;
    return 0;
  };
  
  // Função para renderizar estrelas
  const renderStars = (score) => {
    const starCount = getStarRating(score);
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < starCount) {
        stars.push(<span key={i} style={{fontSize: '40px', color: '#FFD700'}}>★</span>);
      } else {
        stars.push(<span key={i} style={{fontSize: '40px', color: '#DDD'}}>☆</span>);
      }
    }
    
    // Mensagens motivacionais
    let message = '';
    if (score === 10) message = '🏆 PERFECT! You are a Math Champion! 🏆';
    else if (score >= 8) message = '🎆 Excellent Work! Almost Perfect! 🎆';
    else if (score >= 6) message = '👍 Good Job! Keep Practicing! 👍';
    else if (score >= 4) message = '💪 Nice Try! You can do better! 💪';
    else if (score >= 2) message = '🌱 Keep Growing! Practice Makes Perfect! 🌱';
    else message = '🤗 Don\'t Give Up! Try Again! 🤗';
    
    return (
      <div style={{margin: '20px 0', textAlign: 'center'}}>
        <div>{stars}</div>
        <div style={{marginTop: '15px', fontSize: '20px', fontWeight: 'bold', color: currentTheme.primary}}>
          {message}
        </div>
      </div>
    );
  };

  // Temas de cores
  const themes = {
    rosa: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      background: '#FFF0F5',
      accent: '#FF1493',
      text: '#8B008B'
    },
    azul: {
      primary: '#4169E1',
      secondary: '#87CEEB',
      background: '#F0F8FF',
      accent: '#1E90FF',
      text: '#000080'
    },
    ursinho: {
      primary: '#DEB887',
      secondary: '#F5DEB3',
      background: '#FFF8DC',
      accent: '#CD853F',
      text: '#8B4513'
    }
  };

  const currentTheme = themes[theme];

  // Types of exercises (in English)
  const exerciseTypes = [
    { id: 'pattern', name: 'Patterns', emoji: '🔍' },
    { id: 'ordering', name: 'Ordering Numbers', emoji: '📊' },
    { id: 'missingNumber', name: 'Missing Numbers', emoji: '❓' },
    { id: 'addition', name: 'Addition', emoji: '➕' },
    { id: 'subtraction', name: 'Subtraction', emoji: '➖' },
    { id: 'memory', name: 'Memory Exercise', emoji: '🧠' },
    { id: 'wordProblem', name: 'Word Problems', emoji: '📖' },
    { id: 'patterningPlaceValues', name: 'Patterning & Place Values', emoji: '🔢' },
    { id: 'geometry', name: 'Geometry', emoji: '📐' }
  ];

  // Word problems com diferentes níveis de dificuldade (APENAS ADIÇÃO E SUBTRAÇÃO)
  const getWordProblemsByDifficulty = () => {
    const wordProblemsByLevel = {
      tens: [
        {
          questionText: "Sarah has 23 flowers in her garden. She picks 11 flowers for her mom. How many flowers are left in the garden?",
          correctAnswer: 12,
          explanation: "To solve this problem, subtract the picked flowers from the total: 23 - 11 = 12 flowers left."
        },
        {
          questionText: "Tom saved $35 from his allowance. His grandma gave him $28 more. How much money does Tom have now?",
          correctAnswer: 63,
          explanation: "To solve this problem, add the money from grandma to his savings: $35 + $28 = $63."
        },
        {
          questionText: "A bakery made 47 cookies in the morning and 29 cookies in the afternoon. How many cookies did they make in total?",
          correctAnswer: 76,
          explanation: "To solve this problem, add morning and afternoon cookies: 47 + 29 = 76 cookies."
        },
        {
          questionText: "Emma had 52 stickers. She used 18 stickers to decorate her notebook. How many stickers does she have left?",
          correctAnswer: 34,
          explanation: "To solve this problem, subtract the used stickers from the total: 52 - 18 = 34 stickers."
        },
        {
          questionText: "At the zoo, there were 31 monkeys and 24 parrots. How many animals were there altogether?",
          correctAnswer: 55,
          explanation: "To solve this problem, add the monkeys and parrots: 31 + 24 = 55 animals."
        },
        {
          questionText: "Jake collected 65 seashells at the beach. He gave 27 to his sister. How many seashells does Jake have now?",
          correctAnswer: 38,
          explanation: "To solve this problem, subtract the given shells from the total: 65 - 27 = 38 seashells."
        },
        {
          questionText: "A library had 43 picture books. They received 19 new books today. How many picture books do they have now?",
          correctAnswer: 62,
          explanation: "To solve this problem, add the new books to the existing ones: 43 + 19 = 62 books."
        },
        {
          questionText: "There were 70 birds on a tree. Then 26 birds flew away. How many birds are still on the tree?",
          correctAnswer: 44,
          explanation: "To solve this problem, subtract the birds that flew away: 70 - 26 = 44 birds."
        },
        {
          questionText: "Lucy scored 38 points in her first game and 41 points in her second game. What was her total score?",
          correctAnswer: 79,
          explanation: "To solve this problem, add the points from both games: 38 + 41 = 79 points."
        },
        {
          questionText: "A farmer had 84 apples. He sold 37 apples at the market. How many apples does he have left?",
          correctAnswer: 47,
          explanation: "To solve this problem, subtract the sold apples from the total: 84 - 37 = 47 apples."
        },
        {
          questionText: "In a parking lot, there were 22 red cars and 33 blue cars. How many cars were there in total?",
          correctAnswer: 55,
          explanation: "To solve this problem, add the red and blue cars: 22 + 33 = 55 cars."
        },
        {
          questionText: "Amy had 91 beads. She lost 45 beads while making a necklace. How many beads does she have now?",
          correctAnswer: 46,
          explanation: "To solve this problem, subtract the lost beads from the total: 91 - 45 = 46 beads."
        },
        {
          questionText: "A school bus had 14 students. At the next stop, 17 more students got on. How many students are on the bus now?",
          correctAnswer: 31,
          explanation: "To solve this problem, add the new students to the existing ones: 14 + 17 = 31 students."
        },
        {
          questionText: "Ben had 73 baseball cards. He traded away 29 cards. How many cards does Ben have left?",
          correctAnswer: 44,
          explanation: "To solve this problem, subtract the traded cards from the total: 73 - 29 = 44 cards."
        },
        {
          questionText: "A store had 26 teddy bears on Monday. On Tuesday, they got 48 more teddy bears. How many teddy bears do they have now?",
          correctAnswer: 74,
          explanation: "To solve this problem, add Tuesday's bears to Monday's: 26 + 48 = 74 teddy bears."
        }
      ],
      hundreds: [
        {
          questionText: "A museum had 673 visitors on Saturday and 458 visitors on Sunday. How many visitors came in total?",
          correctAnswer: 1131,
          explanation: "To solve this problem, add Saturday and Sunday visitors: 673 + 458 = 1131 visitors."
        },
        {
          questionText: "The school library has 925 books. They donated 287 books to charity. How many books are left?",
          correctAnswer: 638,
          explanation: "To solve this problem, subtract donated books from the total: 925 - 287 = 638 books."
        },
        {
          questionText: "A concert hall has 742 seats. If 389 seats are empty, how many people are watching the show?",
          correctAnswer: 353,
          explanation: "To solve this problem, subtract empty seats from total seats: 742 - 389 = 353 people."
        },
        {
          questionText: "A farm produced 324 kilograms of apples and 567 kilograms of oranges. What's the total fruit production?",
          correctAnswer: 891,
          explanation: "To solve this problem, add apples and oranges: 324 + 567 = 891 kilograms."
        },
        {
          questionText: "A store had 815 items in stock. They sold 476 items during a sale. How many items remain?",
          correctAnswer: 339,
          explanation: "To solve this problem, subtract sold items from stock: 815 - 476 = 339 items."
        },
        {
          questionText: "A charity raised $486 on Friday and $739 on Saturday. How much money did they raise in total?",
          correctAnswer: 1225,
          explanation: "To solve this problem, add Friday and Saturday amounts: $486 + $739 = $1225."
        },
        {
          questionText: "A parking garage has 650 spaces. If 283 cars are parked, how many spaces are available?",
          correctAnswer: 367,
          explanation: "To solve this problem, subtract parked cars from total spaces: 650 - 283 = 367 spaces."
        },
        {
          questionText: "A bakery baked 428 loaves of bread yesterday and 395 loaves today. How many loaves in total?",
          correctAnswer: 823,
          explanation: "To solve this problem, add yesterday's and today's loaves: 428 + 395 = 823 loaves."
        },
        {
          questionText: "A theater sold 792 tickets. If 456 people have already entered, how many are still outside?",
          correctAnswer: 336,
          explanation: "To solve this problem, subtract people inside from total tickets: 792 - 456 = 336 people."
        },
        {
          questionText: "A school collected 318 cans for recycling in March and 574 cans in April. What's the total?",
          correctAnswer: 892,
          explanation: "To solve this problem, add March and April cans: 318 + 574 = 892 cans."
        },
        {
          questionText: "A train had 687 passengers. At a station, 294 passengers got off. How many passengers remain?",
          correctAnswer: 393,
          explanation: "To solve this problem, subtract passengers who left: 687 - 294 = 393 passengers."
        },
        {
          questionText: "A company had 524 employees. They hired 267 new employees. How many employees do they have now?",
          correctAnswer: 791,
          explanation: "To solve this problem, add new employees to existing ones: 524 + 267 = 791 employees."
        },
        {
          questionText: "An aquarium has 936 fish. If 478 are tropical fish, how many are not tropical?",
          correctAnswer: 458,
          explanation: "To solve this problem, subtract tropical fish from total: 936 - 478 = 458 non-tropical fish."
        },
        {
          questionText: "A warehouse received 445 boxes on Monday and 378 boxes on Tuesday. How many boxes in total?",
          correctAnswer: 823,
          explanation: "To solve this problem, add Monday and Tuesday boxes: 445 + 378 = 823 boxes."
        },
        {
          questionText: "A restaurant served 729 meals last week. This week they served 583 meals. How many fewer meals this week?",
          correctAnswer: 146,
          explanation: "To solve this problem, subtract this week from last week: 729 - 583 = 146 fewer meals."
        }
      ],
      thousands: [
        {
          questionText: "A city had 5847 residents last year. This year, 1234 new people moved in. What's the new population?",
          correctAnswer: 7081,
          explanation: "To solve this problem, add new residents to last year's population: 5847 + 1234 = 7081 residents."
        },
        {
          questionText: "A company earned $9875 in January. They spent $4238 on expenses. How much profit did they make?",
          correctAnswer: 5637,
          explanation: "To solve this problem, subtract expenses from earnings: $9875 - $4238 = $5637 profit."
        },
        {
          questionText: "A marathon had 3456 runners registered. On race day, 789 runners didn't show up. How many runners participated?",
          correctAnswer: 2667,
          explanation: "To solve this problem, subtract no-shows from registered: 3456 - 789 = 2667 runners."
        },
        {
          questionText: "An airport handled 4782 passengers on Monday and 3659 passengers on Tuesday. What's the total?",
          correctAnswer: 8441,
          explanation: "To solve this problem, add Monday and Tuesday passengers: 4782 + 3659 = 8441 passengers."
        },
        {
          questionText: "A forest has 7623 trees. A storm knocked down 1987 trees. How many trees are still standing?",
          correctAnswer: 5636,
          explanation: "To solve this problem, subtract fallen trees from total: 7623 - 1987 = 5636 trees."
        },
        {
          questionText: "A school raised $2145 from a bake sale and $3789 from a car wash. How much did they raise total?",
          correctAnswer: 5934,
          explanation: "To solve this problem, add both fundraising amounts: $2145 + $3789 = $5934."
        },
        {
          questionText: "A factory produced 8456 units last month. This month they produced 6789 units. How many fewer this month?",
          correctAnswer: 1667,
          explanation: "To solve this problem, subtract this month from last month: 8456 - 6789 = 1667 fewer units."
        },
        {
          questionText: "A delivery truck traveled 1876 kilometers last week and 2943 kilometers this week. What's the total distance?",
          correctAnswer: 4819,
          explanation: "To solve this problem, add both weeks' distances: 1876 + 2943 = 4819 kilometers."
        },
        {
          questionText: "A concert venue has 6500 seats. They sold 4873 tickets. How many seats are still available?",
          correctAnswer: 1627,
          explanation: "To solve this problem, subtract sold tickets from total seats: 6500 - 4873 = 1627 seats."
        },
        {
          questionText: "A university had 3298 students last year. This year they admitted 1567 new students. What's the total now?",
          correctAnswer: 4865,
          explanation: "To solve this problem, add new students to last year's total: 3298 + 1567 = 4865 students."
        },
        {
          questionText: "A savings account had $7842. After a withdrawal of $2956, how much money remains?",
          correctAnswer: 4886,
          explanation: "To solve this problem, subtract the withdrawal from the balance: $7842 - $2956 = $4886."
        },
        {
          questionText: "A bookstore received 2134 books in their first shipment and 1978 books in their second. How many books total?",
          correctAnswer: 4112,
          explanation: "To solve this problem, add both shipments: 2134 + 1978 = 4112 books."
        },
        {
          questionText: "A farm harvested 5672 apples. They sold 3489 apples at the market. How many apples are left?",
          correctAnswer: 2183,
          explanation: "To solve this problem, subtract sold apples from harvested: 5672 - 3489 = 2183 apples."
        },
        {
          questionText: "A sports stadium collected $4567 from ticket sales and $2894 from concessions. What's the total revenue?",
          correctAnswer: 7461,
          explanation: "To solve this problem, add ticket sales and concessions: $4567 + $2894 = $7461."
        },
        {
          questionText: "A warehouse had 9234 items. After shipping orders, 5678 items remain. How many items were shipped?",
          correctAnswer: 3556,
          explanation: "To solve this problem, subtract remaining from original: 9234 - 5678 = 3556 items shipped."
        }
      ]
    };
    
    return wordProblemsByLevel[difficulty] || wordProblemsByLevel.tens;
  };

  // Função para gerar um exercício baseado no tipo
  const generateSingleExercise = (type, id) => {
    switch(type) {
      case 'pattern':
        return generatePatternExercise(id);
      case 'ordering':
        return generateOrderingExercise(id);
      case 'missingNumber':
        return generateMissingNumberExercise(id);
      case 'addition':
        return generateAdditionExercise(id);
      case 'subtraction':
        return generateSubtractionExercise(id);
      case 'memory':
        return generateMemoryExercise(id);
      case 'wordProblem':
        return generateWordProblemExercise(id);
      case 'patterningPlaceValues':
        return generatePatterningPlaceValuesExercise(id);
      case 'geometry':
        return generateGeometryExercise(id);
      default:
        return generateAdditionExercise(id);
    }
  };

  // Funções de geração de exercícios
  const generatePatternExercise = (id) => {
    const isIncreasing = Math.random() > 0.5;
    let step, start, sequence;

    if (difficulty === 'tens') {
      step = Math.floor(Math.random() * 5) + 2;
      start = isIncreasing ? Math.floor(Math.random() * 30) + 1 : Math.floor(Math.random() * 30) + 30;
    } else if (difficulty === 'hundreds') {
      step = Math.floor(Math.random() * 10) + 5;
      start = isIncreasing ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 100) + 200;
    } else {
      step = Math.floor(Math.random() * 50) + 25;
      start = isIncreasing ? Math.floor(Math.random() * 500) + 500 : Math.floor(Math.random() * 500) + 1500;
    }

    sequence = Array(5).fill(0).map((_, i) => 
      isIncreasing ? start + (i * step) : start - (i * step)
    );

    const missingIndex = Math.floor(Math.random() * 5);
    const correctAnswer = sequence[missingIndex];
    sequence[missingIndex] = '__';

    return {
      id,
      type: 'pattern',
      questionText: 'Find the missing number in the pattern:',
      sequence: sequence,
      correctAnswer: correctAnswer,
      explanation: `The pattern ${isIncreasing ? 'increases' : 'decreases'} by ${step}. The missing number is ${correctAnswer}.`
    };
  };

  const generateOrderingExercise = (id) => {
    const isAscending = Math.random() > 0.5;
    let minValue, maxValue;

    if (difficulty === 'tens') {
      minValue = 1; maxValue = 50;
    } else if (difficulty === 'hundreds') {
      minValue = 50; maxValue = 500;
    } else {
      minValue = 500; maxValue = 5000;
    }

    const numbers = [];
    const usedNumbers = new Set();
    while (numbers.length < 4) {
      const newNumber = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
      if (!usedNumbers.has(newNumber)) {
        usedNumbers.add(newNumber);
        numbers.push(newNumber);
      }
    }

    const correctAnswer = [...numbers].sort((a, b) => isAscending ? a - b : b - a);

    return {
      id,
      type: 'ordering',
      questionText: `Order these numbers ${isAscending ? 'from smallest to largest' : 'from largest to smallest'}:`,
      numbers: numbers,
      correctAnswer: correctAnswer,
      isAscending: isAscending,
      explanation: `The correct order is: ${correctAnswer.join(', ')}.`
    };
  };

  const generateMissingNumberExercise = (id) => {
    let num1, num2;
    const isAddition = Math.random() > 0.5;
    const missingPosition = Math.floor(Math.random() * 3);

    if (difficulty === 'tens') {
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 30) + 5;
    } else if (difficulty === 'hundreds') {
      num1 = Math.floor(Math.random() * 500) + 100;
      num2 = Math.floor(Math.random() * 300) + 50;
    } else {
      num1 = Math.floor(Math.random() * 5000) + 1000;
      num2 = Math.floor(Math.random() * 3000) + 500;
    }

    if (!isAddition && num1 < num2) {
      [num1, num2] = [num2, num1];
    }

    const result = isAddition ? num1 + num2 : num1 - num2;
    let equation, correctAnswer;

    if (missingPosition === 0) {
      equation = isAddition ? `__ + ${num2} = ${result}` : `__ - ${num2} = ${result}`;
      correctAnswer = isAddition ? result - num2 : result + num2;
    } else if (missingPosition === 1) {
      equation = isAddition ? `${num1} + __ = ${result}` : `${num1} - __ = ${result}`;
      correctAnswer = isAddition ? result - num1 : num1 - result;
    } else {
      equation = isAddition ? `${num1} + ${num2} = __` : `${num1} - ${num2} = __`;
      correctAnswer = result;
    }

    return {
      id,
      type: 'missingNumber',
      questionText: 'Find the missing number:',
      equation: equation,
      correctAnswer: correctAnswer,
      explanation: `The missing number is ${correctAnswer}.`
    };
  };

  const generateAdditionExercise = (id) => {
    let num1, num2;

    if (difficulty === 'tens') {
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 40) + 5;
    } else if (difficulty === 'hundreds') {
      num1 = Math.floor(Math.random() * 500) + 100;
      num2 = Math.floor(Math.random() * 400) + 50;
    } else {
      num1 = Math.floor(Math.random() * 5000) + 1000;
      num2 = Math.floor(Math.random() * 4000) + 500;
    }

    const [smaller, larger] = num1 <= num2 ? [num1, num2] : [num2, num1];
    const result = smaller + larger;

    return {
      id,
      type: 'addition',
      questionText: 'Solve the addition:',
      equation: `${smaller} + ${larger} = ?`,
      correctAnswer: result,
      explanation: `${smaller} + ${larger} = ${result}`
    };
  };

  const generateSubtractionExercise = (id) => {
    let num1, num2;

    if (difficulty === 'tens') {
      num1 = Math.floor(Math.random() * 50) + 30;
      num2 = Math.floor(Math.random() * 20) + 5;
    } else if (difficulty === 'hundreds') {
      num1 = Math.floor(Math.random() * 500) + 300;
      num2 = Math.floor(Math.random() * 200) + 50;
    } else {
      num1 = Math.floor(Math.random() * 5000) + 3000;
      num2 = Math.floor(Math.random() * 2000) + 500;
    }

    if (num1 < num2) {
      [num1, num2] = [num2, num1];
    }

    const result = num1 - num2;

    return {
      id,
      type: 'subtraction',
      questionText: 'Solve the subtraction:',
      equation: `${num1} - ${num2} = ?`,
      correctAnswer: result,
      explanation: `${num1} - ${num2} = ${result}`
    };
  };

  const generateMemoryExercise = (id) => {
    let numbers;
    
    if (difficulty === 'tens') {
      // Números de 1 a 99
      numbers = Array(5).fill(0).map(() => Math.floor(Math.random() * 99) + 1);
    } else if (difficulty === 'hundreds') {
      // Números de 100 a 999
      numbers = Array(5).fill(0).map(() => Math.floor(Math.random() * 900) + 100);
    } else {
      // Thousands: números de 1000 a 9999
      numbers = Array(5).fill(0).map(() => Math.floor(Math.random() * 9000) + 1000);
    }

    return {
      id,
      type: 'memory',
      questionText: 'Memorize these numbers and type them in order:',
      numbers: numbers,
      correctAnswer: numbers.join(''),
      explanation: `The correct sequence was: ${numbers.join(', ')}.`
    };
  };

  const generateWordProblemExercise = (id) => {
    const currentWordProblems = getWordProblemsByDifficulty();
    const randomIndex = Math.floor(Math.random() * currentWordProblems.length);
    const problem = currentWordProblems[randomIndex];

    return {
      id,
      type: 'wordProblem',
      questionText: problem.questionText,
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation,
      problemIndex: randomIndex
    };
  };

  const generatePatterningPlaceValuesExercise = (id) => {
    const exerciseTypes = [
      'hundredChart', 'numberLine', 'numberPattern', '3digitAddition', '3digitSubtraction', 'tablePatterns'
    ];
    const selectedType = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];

    switch(selectedType) {
      case 'hundredChart':
        const patterns = [2, 5, 10];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const startNum = Math.floor(Math.random() * (100 - pattern * 5)) + 1;
        const sequence = Array(6).fill(0).map((_, i) => startNum + (i * pattern));
        const missingIndex = Math.floor(Math.random() * 6);
        const correctAnswer = sequence[missingIndex];
        sequence[missingIndex] = '__';
        
        return {
          id,
          type: 'patterningPlaceValues',
          subType: 'hundredChart',
          questionText: `Find the missing number in this hundred chart pattern (counting by ${pattern}s):`,
          sequence: sequence,
          correctAnswer: correctAnswer,
          explanation: `The pattern counts by ${pattern}s. The missing number is ${correctAnswer}.`
        };

      case 'numberLine':
        const jump = Math.floor(Math.random() * 5) + 3;
        const start = Math.floor(Math.random() * 50) + 10;
        const lineSequence = Array(5).fill(0).map((_, i) => start + (i * jump));
        const missingPos = Math.floor(Math.random() * 5);
        const correctLineAnswer = lineSequence[missingPos];
        lineSequence[missingPos] = '?';
        
        return {
          id,
          type: 'patterningPlaceValues',
          subType: 'numberLine',
          questionText: `What number is missing on this number line?`,
          sequence: lineSequence,
          correctAnswer: correctLineAnswer,
          explanation: `Each jump on the number line is ${jump}. The missing number is ${correctLineAnswer}.`
        };

      case 'numberPattern':
        const patternTypes = ['even', 'odd'];
        const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        let numberSet = [];
        
        if (patternType === 'even') {
          for (let i = 0; i < 5; i++) {
            numberSet.push((Math.floor(Math.random() * 25) + 1) * 2);
          }
          const oddNum = (Math.floor(Math.random() * 25) + 1) * 2 + 1;
          numberSet[Math.floor(Math.random() * 5)] = oddNum;
        } else {
          for (let i = 0; i < 5; i++) {
            numberSet.push((Math.floor(Math.random() * 25) + 1) * 2 + 1);
          }
          const evenNum = (Math.floor(Math.random() * 25) + 1) * 2;
          numberSet[Math.floor(Math.random() * 5)] = evenNum;
        }
        
        return {
          id,
          type: 'patterningPlaceValues',
          subType: 'numberPattern',
          questionText: `Which number doesn't belong in this ${patternType} number pattern?`,
          numbers: numberSet,
          correctAnswer: patternType === 'even' ? numberSet.find(n => n % 2 === 1) : numberSet.find(n => n % 2 === 0),
          explanation: `All numbers should be ${patternType}, but ${patternType === 'even' ? numberSet.find(n => n % 2 === 1) : numberSet.find(n => n % 2 === 0)} is ${patternType === 'even' ? 'odd' : 'even'}.`
        };

      case '3digitAddition':
        const num1 = Math.floor(Math.random() * 300) + 100;
        const num2 = Math.floor(Math.random() * 300) + 100;
        return {
          id,
          type: 'patterningPlaceValues',
          subType: '3digitAddition',
          questionText: 'Solve this 3-digit addition:',
          num1: num1,
          num2: num2,
          correctAnswer: num1 + num2,
          explanation: `${num1} + ${num2} = ${num1 + num2}`
        };

      case '3digitSubtraction':
        const larger = Math.floor(Math.random() * 500) + 200;
        const smaller = Math.floor(Math.random() * (larger - 100)) + 50;
        return {
          id,
          type: 'patterningPlaceValues',
          subType: '3digitSubtraction',
          questionText: 'Solve this 3-digit subtraction:',
          num1: larger,
          num2: smaller,
          correctAnswer: larger - smaller,
          explanation: `${larger} - ${smaller} = ${larger - smaller}`
        };

      case 'tablePatterns':
        const tableScenarios = [
          {
            scenario: 'Tables and Chairs',
            description: 'Each table seats 4 people',
            pattern: (tables) => tables * 4,
            unit: 'chairs',
            question: 'How many chairs are needed for 5 tables?'
          },
          {
            scenario: 'Boxes and Items',
            description: 'Each box holds 6 items',
            pattern: (boxes) => boxes * 6,
            unit: 'items',
            question: 'How many items fit in 4 boxes?'
          }
        ];
        
        const scenario = tableScenarios[Math.floor(Math.random() * tableScenarios.length)];
        const targetNumber = Math.floor(Math.random() * 6) + 3;
        const correctAnswer = scenario.pattern(targetNumber);
        
        const tableData = [];
        for (let i = 1; i <= 4; i++) {
          tableData.push({
            input: i,
            output: scenario.pattern(i)
          });
        }
        
        return {
          id,
          type: 'patterningPlaceValues',
          subType: 'tablePatterns',
          questionText: scenario.question,
          scenario: scenario.scenario,
          description: scenario.description,
          tableData: tableData,
          targetNumber: targetNumber,
          correctAnswer: correctAnswer,
          explanation: `Following the pattern: ${scenario.description.toLowerCase()}, so ${targetNumber} × ${scenario.pattern(1)} = ${correctAnswer} ${scenario.unit}.`
        };

      default:
        return generatePatterningPlaceValuesExercise(id);
    }
  };

  const generateGeometryExercise = (id) => {
    const exerciseTypes = [
      'describe2DFigures', 'describeAngles', 'namingFigures', 'sortingFigures', 
      'congruentFigures', 'identify3DShapes', 'prismOrPyramid'
    ];
    const selectedType = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];

    switch(selectedType) {
      case 'describe2DFigures':
        const shapes2D = [
          { name: 'triangle', sides: 3, vertices: 3, description: 'has 3 sides and 3 vertices' },
          { name: 'square', sides: 4, vertices: 4, description: 'has 4 equal sides and 4 vertices' },
          { name: 'rectangle', sides: 4, vertices: 4, description: 'has 4 sides and 4 vertices, opposite sides are equal' },
          { name: 'circle', sides: 0, vertices: 0, description: 'has no sides or vertices, it is round' }
        ];
        const shape2D = shapes2D[Math.floor(Math.random() * shapes2D.length)];
        
        return {
          id,
          type: 'geometry',
          subType: 'describe2DFigures',
          questionText: `How many sides does a ${shape2D.name} have?`,
          shape: shape2D.name,
          correctAnswer: shape2D.sides,
          explanation: `A ${shape2D.name} ${shape2D.description}.`
        };

      case 'identify3DShapes':
        const prismOrPyramidQuestions = [
          {
            question: 'A shape with a square base and 4 triangular faces that meet at an apex is a:',
            options: ['Prism', 'Pyramid'],
            correct: 'Pyramid',
            explanation: 'A pyramid has triangular faces that meet at a single point called the apex.'
          },
          {
            question: 'What is the pointed top of a pyramid called?',
            options: ['Base', 'Edge', 'Apex', 'Face'],
            correct: 'Apex',
            explanation: 'The apex is the pointed top where all the triangular faces of a pyramid meet.'
          }
        ];
        
        const questionData = prismOrPyramidQuestions[Math.floor(Math.random() * prismOrPyramidQuestions.length)];
        
        return {
          id,
          type: 'geometry',
          subType: 'identify3DShapes',
          questionText: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correct,
          explanation: questionData.explanation
        };

      default:
        return {
          id,
          type: 'geometry',
          subType: 'basic',
          questionText: 'How many sides does a triangle have?',
          correctAnswer: 3,
          explanation: 'A triangle has 3 sides.'
        };
    }
  };

  // Função para gerar 10 exercícios baseados nos filtros selecionados
  const generate10Exercises = () => {
    const newExercises = [];
    const typesToUse = selectedExerciseTypes.length > 0 
      ? selectedExerciseTypes 
      : exerciseTypes.map(type => type.id);

    const exercisesPerType = Math.floor(10 / typesToUse.length);
    const remainder = 10 % typesToUse.length;

    let exerciseId = 0;
    const tempUsedExercises = {
      pattern: new Set(usedExercises.pattern),
      ordering: new Set(usedExercises.ordering),
      missingNumber: new Set(usedExercises.missingNumber),
      addition: new Set(usedExercises.addition),
      subtraction: new Set(usedExercises.subtraction),
      memory: new Set(usedExercises.memory),
      wordProblem: new Set(usedExercises.wordProblem),
      patterningPlaceValues: new Set(usedExercises.patterningPlaceValues),
      geometry: new Set(usedExercises.geometry)
    };

    typesToUse.forEach((type, index) => {
      const count = exercisesPerType + (index < remainder ? 1 : 0);
      for (let i = 0; i < count; i++) {
        let exercise;
        let attempts = 0;
        const maxAttempts = 50;
        let exerciseKey;
        
        do {
          exercise = generateSingleExercise(type, exerciseId);
          if (!exercise) {
            console.error('generateSingleExercise returned null/undefined for type:', type);
            break;
          }
          exerciseKey = getExerciseKey(exercise);
          attempts++;
        } while (tempUsedExercises[type] && tempUsedExercises[type].has(exerciseKey) && attempts < maxAttempts);
        
        if (exerciseKey) {
          tempUsedExercises[type].add(exerciseKey);
        }
        newExercises.push(exercise);
        exerciseId++;
      }
    });

    // Update the global used exercises
    setUsedExercises(tempUsedExercises);

    // Shuffle exercises
    for (let i = newExercises.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newExercises[i], newExercises[j]] = [newExercises[j], newExercises[i]];
    }

    return newExercises;
  };

  // Função para gerar uma chave única para cada exercício
  const getExerciseKey = (exercise) => {
    if (!exercise) return '';
    
    try {
      switch(exercise.type) {
        case 'pattern':
          return exercise.sequence ? `${exercise.sequence.join(',')}-${exercise.correctAnswer}` : '';
        case 'ordering':
          return exercise.numbers ? `${exercise.numbers.join(',')}` : '';
        case 'missingNumber':
          return exercise.equation ? `${exercise.equation}-${exercise.correctAnswer}` : '';
        case 'addition':
        case 'subtraction':
          return exercise.equation || '';
        case 'memory':
          return exercise.numbers ? `${exercise.numbers.join(',')}` : '';
        case 'wordProblem':
          return exercise.problemIndex !== undefined ? exercise.problemIndex : exercise.questionText || '';
        default:
          return JSON.stringify(exercise);
      }
    } catch (error) {
      console.error('Error in getExerciseKey:', error, exercise);
      return Math.random().toString();
    }
  };

  // Função para atualizar exercícios
  const refreshExercises = () => {
    try {
      // Clear used exercises when refreshing
      setUsedExercises({
        pattern: new Set(),
        ordering: new Set(),
        missingNumber: new Set(),
        addition: new Set(),
        subtraction: new Set(),
        memory: new Set(),
        wordProblem: new Set()
      });
      
      const newExercises = generate10Exercises();
      setExercises(newExercises);
      setExerciseAnswers({});
      setExerciseResults({});
      setOrderingAnswers({});
      setShowFinalScore(false);
      setPracticeComplete(false);
      
      const newMemoryPhases = {};
      const newMemoryTimers = {};
      newExercises.forEach(exercise => {
        if (exercise.type === 'memory') {
          newMemoryPhases[exercise.id] = 'ready';
          newMemoryTimers[exercise.id] = 5;
        }
      });
      setMemoryPhases(newMemoryPhases);
      setMemoryTimers(newMemoryTimers);
      
    } catch (error) {
      console.error('Error in refreshExercises:', error);
    }
  };

  // Função para controlar seleção múltipla de filtros
  const toggleExerciseType = (typeId) => {
    setSelectedExerciseTypes(prev => {
      const newSelection = prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId];
      return newSelection;
    });
  };

  // Função para iniciar exercício de memória
  const startMemoryExercise = (exerciseId) => {
    setMemoryPhases(prev => ({
      ...prev,
      [exerciseId]: 'show'
    }));
    setMemoryTimers(prev => ({
      ...prev,
      [exerciseId]: 5
    }));
  };

  // Controlar scroll do body quando modal está aberto
  useEffect(() => {
    if (showVirtualPaper || showFinalScore) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showVirtualPaper, showFinalScore]);

  // Timer para exercícios de memória
  useEffect(() => {
    const timers = [];
    
    if (memoryTimers && Object.keys(memoryTimers).length > 0) {
      Object.keys(memoryTimers).forEach(exerciseId => {
        const timer = memoryTimers[exerciseId];
        const phase = memoryPhases[exerciseId];
        
        if (phase === 'show' && timer > 0) {
          const timeoutId = setTimeout(() => {
            setMemoryTimers(prev => {
              if (!prev || !prev[exerciseId]) return prev;
              return {
                ...prev,
                [exerciseId]: Math.max(0, prev[exerciseId] - 1)
              };
            });
          }, 1000);
          timers.push(timeoutId);
        } else if (phase === 'show' && timer === 0) {
          setMemoryPhases(prev => ({
            ...prev,
            [exerciseId]: 'input'
          }));
        }
      });
    }

    return () => {
      if (timers.length > 0) {
        timers.forEach(timer => {
          if (timer) clearTimeout(timer);
        });
      }
    };
  }, [memoryTimers, memoryPhases]);

  // Função para submeter TODOS os exercícios de uma vez
  const submitAllExercises = () => {
    try {
      const newResults = {};
      
      exercises.forEach(exercise => {
        const userAnswer = exerciseAnswers[exercise.id] || '';
        const orderingAnswer = orderingAnswers[exercise.id] || [];
        
        let isCorrect = false;

        if (exercise.type === 'ordering') {
          isCorrect = JSON.stringify(orderingAnswer) === JSON.stringify(exercise.correctAnswer);
        } else {
          isCorrect = parseInt(userAnswer) === exercise.correctAnswer || userAnswer === exercise.correctAnswer.toString();
        }
        
        newResults[exercise.id] = {
          isCorrect,
          explanation: exercise.explanation,
          userAnswer: exercise.type === 'ordering' ? orderingAnswer : userAnswer,
          submitted: true
        };
      });
      
      setExerciseResults(newResults);
      setPracticeComplete(true);
      
      setTimeout(() => {
        setShowFinalScore(true);
        
        // Tocar som de celebração se acertou todas
        const correctCount = Object.values(newResults).filter(result => result.isCorrect).length;
        if (correctCount === 10) {
          playCelebrationSound();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting all exercises:', error);
    }
  };

  // Função para verificar se todos os exercícios foram submetidos  
  const checkIfAllSubmitted = React.useCallback(() => {
    return;
  }, []);

  // Verificar quando exercícios são submetidos
  useEffect(() => {
    return;
  }, [exerciseResults, checkIfAllSubmitted]);

  // Função para ordering
  const handleNumberClick = (exerciseId, number) => {
    const currentAnswer = orderingAnswers[exerciseId] || [];
    if (currentAnswer.includes(number)) return;
    
    setOrderingAnswers(prev => ({
      ...prev,
      [exerciseId]: [...currentAnswer, number]
    }));
  };

  const removeFromOrdering = (exerciseId, index) => {
    setOrderingAnswers(prev => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || []).filter((_, i) => i !== index)
    }));
  };

  // Gerar exercícios quando filtros ou dificuldade mudarem
  useEffect(() => {
    if (currentScreen === 'practice') {
      refreshExercises();
    }
  }, [selectedExerciseTypes, difficulty, currentScreen]);
  
  // Garantir que o canvas mantenha configurações corretas em TODOS os temas
  useEffect(() => {
    if (canvasRef && showVirtualPaper) {
      const ctx = canvasRef.getContext('2d');
      // Forçar reconfiguração quando tema muda
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (paperTool === 'pencil') {
        ctx.lineWidth = 1; // SEMPRE 1px em QUALQUER tema
        ctx.strokeStyle = '#000000';
        ctx.globalCompositeOperation = 'source-over';
      } else if (paperTool === 'eraser') {
        ctx.lineWidth = 12;
        ctx.globalCompositeOperation = 'destination-out';
      }
    }
  }, [theme, canvasRef, showVirtualPaper, paperTool]);

  // Função para iniciar a prática
  const startPractice = () => {
    setCurrentScreen('practice');
    // Não precisa chamar refreshExercises aqui pois o useEffect já faz isso
  };

  // Função para voltar ao menu inicial
  const goToHome = () => {
    setCurrentScreen('home');
  };

  // Calcular quantos exercícios têm respostas
  const calculateAnsweredCount = () => {
    let count = 0;
    exercises.forEach(exercise => {
      const userAnswer = exerciseAnswers[exercise.id] || '';
      const orderingAnswer = orderingAnswers[exercise.id] || [];
      
      if (exercise.type === 'ordering') {
        if (orderingAnswer.length === exercise.numbers.length) count++;
      } else if (exercise.type === 'memory') {
        const phase = memoryPhases[exercise.id];
        if (phase === 'input' && userAnswer.trim()) count++;
        else if (phase === 'ready' || phase === 'show') count = count;
        else if (userAnswer.trim()) count++;
      } else {
        if (userAnswer.trim()) count++;
      }
    });
    return count;
  };

  // Calcular pontuação final
  const calculateFinalScore = () => {
    const completed = Object.keys(exerciseResults).length;
    const correct = Object.values(exerciseResults).filter(result => result.isCorrect).length;
    return { completed, correct };
  };

  // Função para permitir nova tentativa em exercícios errados
  const retryIncorrectExercises = () => {
    const incorrectExercises = Object.keys(exerciseResults).filter(
      exerciseId => !exerciseResults[exerciseId].isCorrect
    );
    
    const newAnswers = { ...exerciseAnswers };
    const newOrderingAnswers = { ...orderingAnswers };
    const newResults = { ...exerciseResults };
    
    incorrectExercises.forEach(exerciseId => {
      delete newAnswers[exerciseId];
      delete newOrderingAnswers[exerciseId];
      delete newResults[exerciseId];
    });
    
    setExerciseAnswers(newAnswers);
    setOrderingAnswers(newOrderingAnswers);
    setExerciseResults(newResults);
    setShowFinalScore(false);
  };

  // Virtual Paper Functions
  const saveCanvasState = () => {
    if (canvasRef) {
      const newHistory = drawingHistory.slice(0, historyIndex + 1);
      newHistory.push(canvasRef.toDataURL());
      setDrawingHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const clearCanvas = () => {
    if (canvasRef) {
      const ctx = canvasRef.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
      saveCanvasState();
    }
  };

  const undoCanvas = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingHistory[historyIndex - 1];
    }
  };

  const redoCanvas = () => {
    if (historyIndex < drawingHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingHistory[historyIndex + 1];
    }
  };

  const getCanvasPosition = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Função auxiliar para configurar o contexto do canvas
  const configureCanvasContext = (ctx, tool) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'pencil') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#000000'; // Sempre preto para todos os temas
      ctx.lineWidth = 1; // Lápis SEMPRE 1px em TODOS os temas
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 12; // Borracha sempre 12px
    }
  };

  const startDrawing = (e) => {
    if (!canvasRef) return;
    setIsDrawing(true);
    const pos = getCanvasPosition(canvasRef, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);
    setLastPosition(pos);
    
    const ctx = canvasRef.getContext('2d');
    configureCanvasContext(ctx, paperTool);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef) return;
    
    const currentPos = getCanvasPosition(canvasRef, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);
    const ctx = canvasRef.getContext('2d');
    
    if (paperTool === 'pencil' || paperTool === 'eraser') {
      // SEMPRE reconfigurar para garantir consistência
      configureCanvasContext(ctx, paperTool);
      
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      setLastPosition(currentPos);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  const drawShape = (shape, startPos, endPos) => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = paperColor;
    ctx.lineWidth = 2; // Formas sempre com 2px de espessura
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    switch (shape) {
      case 'line':
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        break;
      case 'square':
        const width = endPos.x - startPos.x;
        const height = endPos.y - startPos.y;
        ctx.rect(startPos.x, startPos.y, width, height);
        break;
      default:
        break;
    }
    ctx.stroke();
    saveCanvasState();
  };

  // Função para gerar dicas da professora virtual
  const generateTeacherHint = (exercise) => {
    const hints = {
      pattern: [
        "Look carefully at how the numbers change from one to the next. Do they go up or down?",
        "Try to find the pattern! Count how much each number increases or decreases.",
        "What's the difference between the first and second number? Is it the same between other numbers?",
        "Look for a sequence - does each number follow the same rule as the previous one?"
      ],
      ordering: [
        "Think about which number is the smallest and which is the largest.",
        "Try counting from the smallest number to see which comes next.",
        "Look at each number carefully - which one has the fewest digits?",
        "Start with the smallest number and work your way up, or start with the largest and work down!"
      ],
      missingNumber: [
        "Look at what operation is being used - is it addition or subtraction?",
        "If it's addition, think: what number plus the other number gives you the result?",
        "If it's subtraction, remember: the bigger number minus the smaller number equals the result.",
        "Try working backwards from the answer to find the missing number!"
      ],
      addition: [
        "Start by adding the ones place first, then move to the tens place.",
        "You can use your fingers to help count, or break the numbers into smaller parts.",
        "Try adding the smaller number to the larger number - it might be easier!",
        "Remember: addition means putting numbers together to make a bigger number."
      ],
      subtraction: [
        "Subtraction means taking away. Start with the bigger number and take away the smaller one.",
        "You can count backwards from the first number to find your answer.",
        "Try using the ones place first, then the tens place if needed.",
        "Think of it as: 'If I have the first number and take away the second number, how many are left?'"
      ],
      memory: [
        "Try to create a story or pattern with the numbers to help remember them.",
        "Look at the numbers carefully and try to notice if there are any patterns.",
        "Practice saying the numbers out loud in your head as you see them.",
        "Focus on one number at a time, then try to connect them together!"
      ],
      wordProblem: [
        "Read the problem slowly and identify what you need to find.",
        "Look for key words like 'total', 'left', 'more', or 'each' to understand what operation to use.",
        "Try to picture the problem in your mind - what's happening in the story?",
        "Break the problem into smaller steps: What do you know? What do you need to find?"
      ]
    };
    
    const exerciseHints = hints[exercise.type] || hints.addition;
    return exerciseHints[Math.floor(Math.random() * exerciseHints.length)];
  };

  // Função para mostrar ajuda da professora
  const showTeacherHelp = (exercise) => {
    const hint = generateTeacherHint(exercise);
    setTeacherMessage(hint);
    setCurrentExerciseForHelp(exercise);
    setShowTeacher(true);
    
    // Sintetizar voz para ler a dica com melhor entonação
    if ('speechSynthesis' in window) {
      // Processar o texto para melhor entonação
      const processedText = hint
        .replace(/\?/g, '?... ') // Pausa após perguntas
        .replace(/!/g, '!... ') // Pausa após exclamações
        .replace(/,/g, ',... ') // Pausa após vírgulas
        .replace(/\./g, '..... '); // Pausa após pontos
      
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.rate = 0.7; // Mais devagar
      utterance.pitch = 1.3; // Tom mais alto para soar mais amigável
      utterance.volume = 0.9;
      
      // Tentar usar voz feminina em inglês
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('susan') ||
         voice.name.toLowerCase().includes('karen') ||
         voice.name.toLowerCase().includes('victoria'))
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  // Função para fechar a professora
  const closeTeacher = () => {
    setShowTeacher(false);
    setTeacherMessage('');
    setCurrentExerciseForHelp(null);
    
    // Parar qualquer síntese de voz em andamento
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };
  const calculateResult = () => {
    if (calculatorPrevious === null || calculatorOperation === null) {
      return parseFloat(calculatorDisplay);
    }
    
    const prev = parseFloat(calculatorPrevious);
    const current = parseFloat(calculatorDisplay);
    
    switch (calculatorOperation) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '*': return prev * current;
      case '/': return current !== 0 ? prev / current : 0;
      default: return current;
    }
  };

  const handleCalculatorNumber = (num) => {
    setCalculatorDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleCalculatorOperation = (op) => {
    setCalculatorPrevious(calculatorDisplay);
    setCalculatorOperation(op);
    setCalculatorDisplay('0');
  };

  const handleCalculatorEquals = () => {
    const result = calculateResult();
    setCalculatorDisplay(result.toString());
    setCalculatorPrevious(null);
    setCalculatorOperation(null);
  };

  const handleCalculatorClear = () => {
    setCalculatorDisplay('0');
    setCalculatorPrevious(null);
    setCalculatorOperation(null);
  };

  // Estilos do componente
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: currentTheme.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: 'clamp(10px, 3vw, 20px)',
      transition: 'all 0.3s ease'
    },
    homeContainer: {
      minHeight: '100vh',
      backgroundColor: currentTheme.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      transition: 'all 0.3s ease',
      overflow: 'hidden', // Evita scroll
      boxSizing: 'border-box'
    },
    homeTitle: {
      fontSize: 'clamp(28px, 8vw, 72px)',
      color: currentTheme.primary,
      margin: '0 0 clamp(20px, 4vw, 40px) 0',
      textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    imagePlaceholder: {
      width: 'clamp(200px, 60vw, 300px)',
      height: 'clamp(130px, 40vw, 200px)',
      backgroundColor: currentTheme.secondary,
      border: `4px dashed ${currentTheme.primary}`,
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 'clamp(20px, 4vw, 40px)',
      fontSize: '18px',
      color: currentTheme.text,
      fontWeight: 'bold',
      padding: '0',
      overflow: 'hidden'
    },
    themeSelector: {
      display: 'flex',
      gap: 'clamp(10px, 3vw, 20px)',
      marginBottom: 'clamp(20px, 4vw, 40px)',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      maxWidth: '600px'
    },
    themeButton: {
      padding: 'clamp(10px, 3vw, 15px) clamp(15px, 4vw, 25px)',
      border: 'none',
      borderRadius: '25px',
      fontSize: 'clamp(14px, 4vw, 18px)',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
      minWidth: 'clamp(80px, 25vw, 120px)',
      flex: '1 1 auto'
    },
    startButton: {
      backgroundColor: currentTheme.primary,
      color: 'white',
      border: 'none',
      padding: 'clamp(15px, 4vw, 20px) clamp(30px, 8vw, 50px)',
      fontSize: 'clamp(18px, 5vw, 24px)',
      borderRadius: '30px',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginTop: 'clamp(10px, 2vw, 0px)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      position: 'relative',
      padding: '0 10px',
      marginTop: '20px' // Espaço do topo para não sobrepor
    },
    backButton: {
      position: 'absolute',
      left: '10px',
      top: '20px', // Mais baixo para não sobrepor
      backgroundColor: currentTheme.secondary,
      color: currentTheme.text,
      border: `2px solid ${currentTheme.primary}`,
      padding: 'clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)',
      fontSize: 'clamp(12px, 3vw, 16px)',
      borderRadius: '15px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      minHeight: '44px'
    },
    refreshButton: {
      position: 'absolute',
      right: '10px',
      top: '20px', // Mais baixo para não sobrepor
      backgroundColor: currentTheme.accent,
      color: 'white',
      border: 'none',
      padding: 'clamp(8px, 2vw, 12px) clamp(15px, 3vw, 25px)',
      fontSize: 'clamp(12px, 3vw, 16px)',
      borderRadius: '15px',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease',
      minHeight: '44px'
    },
    title: {
      fontSize: 'clamp(20px, 6vw, 48px)', // Título menor no mobile
      color: currentTheme.primary,
      margin: '100px 0 40px 0', // Margem MUITO maior no mobile
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
      fontWeight: 'bold'
    },
    selectorContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 'clamp(8px, 2vw, 10px)',
      marginBottom: '40px', // Aumentado de 20px para 40px
      flexWrap: 'wrap'
    },
    button: {
      padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px)',
      border: 'none',
      borderRadius: '25px',
      fontSize: 'clamp(12px, 3vw, 16px)',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      minHeight: '44px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      verticalAlign: 'middle',
      lineHeight: '1.2'
    },
    activeButton: {
      transform: 'scale(1.05)'
    },
    checkboxContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 'clamp(8px, 2vw, 15px)',
      marginBottom: '40px', // Aumentado de 20px para 40px
      padding: '0 10px',
      justifyContent: 'center'
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(6px, 1.5vw, 8px)',
      padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 18px)',
      borderRadius: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: 'clamp(12px, 3.5vw, 16px)',
      fontWeight: 'bold',
      border: `2px solid ${currentTheme.primary}`,
      minHeight: '44px',
      textAlign: 'center'
    },
    selectedCheckbox: {
      backgroundColor: currentTheme.primary,
      color: 'white'
    },
    unselectedCheckbox: {
      backgroundColor: currentTheme.secondary,
      color: currentTheme.text
    },
    scoreBoard: {
      textAlign: 'center',
      marginBottom: '30px',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '0 auto 30px auto'
    },
    scoreText: {
      fontSize: '18px',
      color: currentTheme.text,
      fontWeight: 'bold'
    },
    finalScoreModal: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)'
    },
    finalScoreCard: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: 'clamp(20px, 5vw, 40px)',
      textAlign: 'center',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      border: `4px solid ${currentTheme.primary}`,
      maxWidth: '90vw',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    exercisesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 10px'
    },
    exerciseCard: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: 'clamp(15px, 4vw, 25px)',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: `3px solid ${currentTheme.primary}`,
      minHeight: 'clamp(250px, 40vh, 350px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative' // Para permitir posicionamento absoluto do botão de ajuda
    },
    incorrectCard: {
      border: `3px solid #ff6b6b`
    },
    correctCard: {
      border: `3px solid #51cf66`
    },
    exerciseTitle: {
      fontSize: '16px',
      color: currentTheme.primary,
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    exerciseText: {
      fontSize: '18px',
      color: currentTheme.text,
      marginBottom: '15px',
      fontWeight: 'bold',
      lineHeight: '1.4'
    },
    input: {
      fontSize: '18px',
      padding: '12px 15px',
      border: `2px solid ${currentTheme.primary}`,
      borderRadius: '10px',
      textAlign: 'center',
      marginBottom: '12px',
      width: '140px',
      fontWeight: 'bold',
      minHeight: '44px',
      appearance: 'textfield',
      touchAction: 'manipulation',
      WebkitUserSelect: 'text',
      userSelect: 'text',
      pointerEvents: 'auto',
      outline: 'none',
      WebkitTouchCallout: 'default',
      WebkitTapHighlightColor: 'transparent'
    },
    memoryStartButton: {
      backgroundColor: currentTheme.accent,
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      fontSize: '18px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    numberGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 'clamp(6px, 1.5vw, 10px)',
      marginBottom: '12px'
    },
    numberButton: {
      padding: 'clamp(8px, 2vw, 12px)',
      fontSize: 'clamp(12px, 3vw, 14px)',
      fontWeight: 'bold',
      border: `2px solid ${currentTheme.primary}`,
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: currentTheme.secondary,
      color: currentTheme.text,
      minHeight: '40px'
    },
    selectedNumbers: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'clamp(4px, 1vw, 8px)',
      justifyContent: 'center',
      marginBottom: '12px'
    },
    selectedNumber: {
      padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
      backgroundColor: currentTheme.primary,
      color: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: 'clamp(10px, 2.5vw, 12px)',
      fontWeight: 'bold',
      minHeight: '32px',
      display: 'flex',
      alignItems: 'center'
    },
    memoryTimer: {
      fontSize: '32px',
      color: currentTheme.primary,
      fontWeight: 'bold',
      marginBottom: '15px'
    },
    retryButton: {
      backgroundColor: '#ff6b6b',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      fontSize: '16px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontWeight: 'bold',
      margin: '10px'
    },
    submitAllButton: {
      backgroundColor: currentTheme.primary,
      color: 'white',
      border: 'none',
      padding: 'clamp(15px, 3vw, 20px) clamp(30px, 6vw, 50px)',
      fontSize: 'clamp(16px, 4vw, 20px)',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      minHeight: '50px',
      boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
      margin: '30px auto',
      display: 'block'
    },
    virtualPaperButton: {
      position: 'fixed',
      right: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: currentTheme.accent,
      color: 'white',
      border: 'none',
      padding: '15px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 1001,
      transition: 'all 0.3s ease'
    },
    virtualPaperPanel: {
      position: 'fixed',
      right: showVirtualPaper ? '0' : '-400px',
      top: '0',
      width: '400px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
      zIndex: 1000,
      transition: 'right 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    virtualPaperHeader: {
      backgroundColor: currentTheme.primary,
      color: 'white',
      padding: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    virtualPaperToolbar: {
      backgroundColor: '#f8f9fa',
      padding: '10px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      borderBottom: '1px solid #ddd'
    },
    toolButton: {
      padding: '8px 12px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '18px',
      transition: 'all 0.2s ease'
    },
    activeToolButton: {
      backgroundColor: currentTheme.primary,
      color: 'white',
      borderColor: currentTheme.primary
    },
    canvasContainer: {
      flex: 1,
      padding: '10px',
      overflow: 'hidden'
    },
    canvas: {
      border: '2px solid #ddd',
      borderRadius: '8px',
      cursor: 'crosshair',
      width: '100%',
      height: '100%',
      backgroundColor: 'white'
    },
    colorPicker: {
      width: '40px',
      height: '40px',
      border: '2px solid #ddd',
      borderRadius: '50%',
      cursor: 'pointer'
    },
    sizeSlider: {
      width: '80px'
    },
    calculatorModal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '20px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
      zIndex: 1002,
      minWidth: '280px'
    },
    calculatorDisplay: {
      width: '100%',
      height: '60px',
      fontSize: '24px',
      textAlign: 'right',
      padding: '0 15px',
      margin: '0 0 15px 0',
      border: '2px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    },
    calculatorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '10px'
    },
    calculatorButton: {
      padding: '15px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: '#f8f9fa',
      border: '1px solid #ddd'
    },
    calculatorButtonOperation: {
      backgroundColor: currentTheme.accent,
      color: 'white'
    },
    calculatorButtonEquals: {
      backgroundColor: currentTheme.primary,
      color: 'white',
      gridColumn: 'span 2'
    },
    mobileVirtualPaper: {
      position: 'fixed',
      top: showVirtualPaper ? '0' : '100%',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'white',
      zIndex: 1000,
      transition: 'top 0.3s ease',
      display: 'flex',
      flexDirection: 'column'
    }
  };

  const celebrationCSS = `
    /* Force consistent fonts across all devices */
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    
    /* Ensure consistent system font */
    * {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      font-weight: 600;
    }
    
    /* Ensure exercise fonts are consistent */
    div[style*="fontSize: '24px'"] {
      font-size: 24px !important;
      font-weight: 700 !important;
    }
    
    @media (max-width: 768px) {
      /* Force consistent fonts on mobile */
      * {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
      }
      
      /* Home screen adjustments for mobile */
      .home-container-mobile {
        min-height: 100vh !important;
        max-height: 100vh !important;
        padding: 10px !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
      }
      
      /* Reduce sizes to fit everything without scroll */
      .home-container-mobile h1 {
        font-size: 24px !important;
        margin: 10px 0 !important;
      }
      
      /* Smaller image container */
      .home-image-mobile {
        width: 50vw !important;
        max-width: 200px !important;
        height: 30vw !important;
        max-height: 120px !important;
        margin-bottom: 10px !important;
      }
      
      /* Compact theme buttons */
      .theme-selector-mobile {
        gap: 8px !important;
        margin-bottom: 10px !important;
      }
      
      .theme-button-mobile {
        padding: 8px 12px !important;
        font-size: 14px !important;
      }
      
      /* Compact start button */
      .home-container-mobile button[style*="backgroundColor"] {
        padding: 12px 24px !important;
        font-size: 18px !important;
        margin-top: 10px !important;
      }
      
      /* Ensure exercise types have consistent font */
      .exercise-types-mobile div {
        font-size: 16px !important;
      }
      
      /* Force exercise content fonts on mobile */
      .exercises-grid div[style*="fontSize"] {
        font-size: 24px !important;
      }
      
      /* Adjust checkbox spacing on home for mobile */
      .home-container-mobile .checkboxItem {
        font-size: 14px !important;
        padding: 10px 12px !important;
        margin: 5px !important;
      }
      
      /* Ensure final score modal covers everything */
      .final-score-mobile {
        position: fixed !important;
        z-index: 9999 !important;
      }
      
      /* Prevent body scroll when modal is open */
      body.modal-open {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
      }
      
      /* Fix difficulty button alignment */
      .difficulty-selector-mobile {
        display: flex !important;
        align-items: baseline !important;
        justify-content: center !important;
        flex-wrap: wrap !important;
      }
      
      .difficulty-selector-mobile button {
        margin: 0 !important;
        transform: translateY(0) !important;
      }
      
      /* Fix for landscape orientation */
      @media (orientation: landscape) {
        .difficulty-selector-mobile {
          margin-top: 10px !important;
          margin-bottom: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: auto !important;
        }
        
        .difficulty-selector-mobile button {
          height: 40px !important;
          display: inline-flex !important;
          align-items: center !important;
          padding: 8px 16px !important;
        }
        
        .practice-title {
          margin: 50px 0 15px 0 !important;
          font-size: 32px !important;
        }
        
        .practice-header {
          padding-top: 5px !important;
          min-height: auto !important;
        }
        
        .exercises-grid {
          margin-top: 10px !important;
        }
      }
      
      .exercises-grid {
        grid-template-columns: 1fr !important;
        gap: 15px !important;
      }
      
      .virtual-paper-panel {
        width: 100vw !important;
        right: ${showVirtualPaper ? '0' : '-100vw'} !important;
      }
      
      .virtual-paper-button {
        right: 10px !important;
        bottom: 20px !important;
        top: auto !important;
        transform: none !important;
      }

      /* FIXED: Mobile header fixes - prevent overlap */
      .practice-header {
        position: relative !important;
        z-index: 10 !important;
        padding-bottom: 20px !important;
        margin-bottom: 20px !important;
      }

      .practice-title {
        margin: 80px 0 20px 0 !important;
        padding: 0 10px !important;
      }

      /* Mobile adjustments for teacher help button */
      .teacher-help-btn {
        top: 8px !important;
        right: 8px !important;
        width: 28px !important;
        height: 28px !important;
        font-size: 14px !important;
        padding: 6px !important;
      }

      /* FIXED: Mobile teacher modal adjustments */
      .teacher-modal {
        width: 95vw !important;
        height: auto !important;
        max-height: 90vh !important;
        padding: 20px !important;
        overflow-y: auto !important;
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
      }

      .teacher-avatar-mobile {
        width: 120px !important;
        height: 120px !important;
        border-radius: 15px !important;
        object-fit: cover !important;
      }

      .teacher-title-mobile {
        font-size: 20px !important;
        margin: 10px 0 5px 0 !important;
      }

      .teacher-message-mobile {
        font-size: 14px !important;
        padding: 12px !important;
        line-height: 1.4 !important;
      }

      .teacher-buttons-mobile {
        flex-direction: column !important;
        gap: 8px !important;
      }

      .teacher-buttons-mobile button {
        width: 100% !important;
        padding: 12px 20px !important;
        font-size: 14px !important;
      }

      .teacher-encouragement-mobile {
        padding: 10px !important;
        font-size: 13px !important;
        margin-top: 10px !important;
      }

      /* FIXED: Home page mobile optimizations */
      .home-container-mobile {
        padding: 15px !important;
        min-height: 100vh !important;
        max-height: 100vh !important;
        overflow: hidden !important;
        justify-content: space-evenly !important;
      }

      .theme-selector-mobile {
        gap: 8px !important;
        margin-bottom: 15px !important;
        width: 100% !important;
      }

      .theme-button-mobile {
        padding: 12px 8px !important;
        font-size: 14px !important;
        min-width: 70px !important;
        flex: 1 !important;
      }

      /* FIXED: Mobile difficulty selector - lado a lado com margin fix */
      .difficulty-selector-mobile {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        justify-content: center !important;
        margin: 20px 0 20px 0 !important;
        padding: 0 10px !important;
      }

      .difficulty-selector-mobile button {
        flex: 1 !important;
        min-width: 100px !important;
        max-width: 150px !important;
        padding: 10px 6px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        line-height: 1.2 !important;
      }

      /* FIXED: Virtual Paper Modal - Use same logic as teacher modal */
      .virtual-paper-modal {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 95vw !important;
        height: 90vh !important;
        max-width: 95vw !important;
        max-height: 90vh !important;
        z-index: 1000 !important;
        overflow: hidden !important;
      }

      /* FIXED: Final Score Modal - Same centering logic */
      .final-score-mobile {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 85vw !important;
        height: auto !important;
        max-width: 85vw !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        padding: 15px !important;
        margin: 0 !important;
        z-index: 1001 !important;
      }

      .final-score-mobile h2 {
        font-size: 22px !important;
        margin-bottom: 15px !important;
      }

      .final-score-mobile .score-display {
        font-size: 20px !important;
        margin-bottom: 15px !important;
      }

      .final-score-mobile .percentage-display {
        font-size: 16px !important;
        margin-bottom: 20px !important;
      }

      /* FIXED: Home image container mobile fix */
      .home-image-mobile {
        width: clamp(200px, 70vw, 350px) !important;
        height: clamp(130px, 45vw, 230px) !important;
        margin-bottom: clamp(15px, 4vw, 30px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
      }

      .home-image-mobile img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        border-radius: 16px !important;
        max-width: 100% !important;
        max-height: 100% !important;
      }

      /* FIXED: Exercise type checkboxes mobile - prevent overlap */
      .exercise-types-mobile {
        margin-top: 30px !important;
        padding: 0 10px !important;
        clear: both !important;
      }
    }
    
    @media (max-width: 480px) {
      .home-container-mobile {
        padding: 10px !important;
      }
      
      .theme-selector-mobile {
        gap: 6px !important;
        margin-bottom: 10px !important;
      }
      
      .theme-button-mobile {
        padding: 10px 6px !important;
        font-size: 12px !important;
        min-width: 65px !important;
      }
    }
    
    @media (min-width: 769px) {
      .exercises-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 20px !important;
      }
    }
    
    @media (hover: none) and (pointer: coarse) {
      button {
        min-height: 44px;
        min-width: 44px;
      }

      .teacher-help-btn {
        min-width: 32px !important;
        min-height: 32px !important;
      }
    }
    
    @supports (-webkit-touch-callout: none) {
      input[type="number"], input[type="text"] {
        font-size: 16px !important;
      }
    }
    
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    input[type="number"] {
      -moz-appearance: textfield;
    }
    
    canvas.virtual-canvas {
      touch-action: none;
    }
    
    input[type="number"], input[type="text"] {
      touch-action: manipulation !important;
      -webkit-user-select: text !important;
      user-select: text !important;
      pointer-events: auto !important;
      -webkit-touch-callout: default !important;
      -webkit-tap-highlight-color: rgba(0,0,0,0.1) !important;
    }
    
    /* Força inputs para serem interativos em qualquer situação */
    div input[type="number"], div input[type="text"] {
      pointer-events: auto !important;
      touch-action: manipulation !important;
      -webkit-user-select: text !important;
      user-select: text !important;
    }
  `;

  
  // TELA INICIAL (HOME)
  if (currentScreen === 'home') {
    return (
      <div style={styles.homeContainer} className="home-container-mobile">
        <style>{celebrationCSS}</style>
        
        <h1 style={styles.homeTitle}>Math Y3 - Practice</h1>
        
        <div style={styles.imagePlaceholder} className="home-image-mobile">
          <img 
            src={`${process.env.PUBLIC_URL || ''}/images/logo.png`}
            alt="Math Y3 Practice - Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '16px'
            }}
            onError={(e) => {
              // Tenta sem PUBLIC_URL caso dê erro
              if (e.target.src.includes(process.env.PUBLIC_URL)) {
                e.target.src = '/images/logo.png';
              } else {
                // Fallback final
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                parent.innerHTML = '📚 Math Y3 - Practice! 🎯';
                parent.style.display = 'flex';
                parent.style.alignItems = 'center';
                parent.style.justifyContent = 'center';
                parent.style.textAlign = 'center';
                parent.style.fontSize = '18px';
                parent.style.fontWeight = 'bold';
                parent.style.color = currentTheme.text;
              }
            }}
          />
        </div>
        
        <div style={styles.themeSelector} className="theme-selector-mobile">
          <button 
            style={{
              ...styles.themeButton,
              backgroundColor: theme === 'rosa' ? themes.rosa.primary : themes.rosa.secondary,
              color: theme === 'rosa' ? 'white' : themes.rosa.text
            }}
            className="theme-button-mobile"
            onClick={() => setTheme('rosa')}
          >
            🌸 Pink
          </button>
          <button 
            style={{
              ...styles.themeButton,
              backgroundColor: theme === 'azul' ? themes.azul.primary : themes.azul.secondary,
              color: theme === 'azul' ? 'white' : themes.azul.text
            }}
            className="theme-button-mobile"
            onClick={() => setTheme('azul')}
          >
            💙 Blue
          </button>
          <button 
            style={{
              ...styles.themeButton,
              backgroundColor: theme === 'ursinho' ? themes.ursinho.primary : themes.ursinho.secondary,
              color: theme === 'ursinho' ? 'white' : themes.ursinho.text
            }}
            className="theme-button-mobile"
            onClick={() => setTheme('ursinho')}
          >
            🧸 Bear
          </button>
        </div>
        
        <button 
          style={styles.startButton}
          onClick={startPractice}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Let's Get Started!
        </button>
      </div>
    );
  }

  // TELA PRINCIPAL (PRACTICE)
  const answeredCount = calculateAnsweredCount();
  const { completed, correct } = practiceComplete ? calculateFinalScore() : { completed: 0, correct: 0 };

  return (
    <div style={styles.container}>
      <style>{celebrationCSS}</style>

      {/* Final Score Modal */}
      {showFinalScore && (
        <div style={styles.finalScoreModal}>
          <div style={styles.finalScoreCard} className="final-score-mobile">
            <h2 style={{color: currentTheme.primary, marginBottom: '20px'}} className="score-title">🎉 Practice Complete! 🎉</h2>
            
            {renderStars(correct)}
            
            <div style={{fontSize: '24px', fontWeight: 'bold', color: currentTheme.text, marginBottom: '20px'}} className="score-display">
              Final Score: {correct}/10
            </div>
            <div style={{fontSize: '18px', color: currentTheme.text, marginBottom: '30px'}} className="percentage-display">
              {Math.round((correct / 10) * 100)}% Correct!
            </div>
            
            {correct < 10 && (
              <div style={{marginBottom: '20px'}}>
                <div style={{fontSize: '16px', color: currentTheme.text, marginBottom: '15px'}}>
                  You can retry the incorrect exercises to improve your score!
                </div>
                <button 
                  style={styles.retryButton}
                  onClick={retryIncorrectExercises}
                >
                  Retry Incorrect Exercises
                </button>
              </div>
            )}
            
            <button 
              style={{...styles.button, backgroundColor: currentTheme.primary, color: 'white', padding: '12px 25px'}}
              onClick={() => setShowFinalScore(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <header style={styles.header} className="practice-header">
        <button 
          style={styles.backButton}
          onClick={goToHome}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          ← Home
        </button>

        <button 
          style={styles.refreshButton}
          onClick={refreshExercises}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          🔄 Refresh Exercises
        </button>
        
        <h1 style={styles.title} className="practice-title">Math Y3 - Practice</h1>
        
        {/* Difficulty Selector */}
        <div style={{
          ...styles.selectorContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '40px',
          flexWrap: 'wrap',
          minHeight: '50px'
        }} className="difficulty-selector-mobile">
          {[
            { id: 'tens', name: 'Tens (0-99)', emoji: '🔢' },
            { id: 'hundreds', name: 'Hundreds (0-999)', emoji: '💯' },
            { id: 'thousands', name: 'Thousands (0-9999)', emoji: '🚀' }
          ].map(diff => (
            <button 
              key={diff.id}
              style={{
                ...styles.button,
                backgroundColor: difficulty === diff.id ? currentTheme.primary : currentTheme.secondary,
                color: difficulty === diff.id ? 'white' : currentTheme.text,
                ...(difficulty === diff.id ? styles.activeButton : {}),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0',
                verticalAlign: 'middle',
                position: 'relative',
                top: '0'
              }}
              onClick={() => setDifficulty(diff.id)}
            >
              <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                {diff.emoji} {diff.name}
              </span>
            </button>
          ))}
        </div>

        {/* Exercise Type Checkboxes */}
        <div style={styles.checkboxContainer} className="exercise-types-mobile">
          {exerciseTypes.map(type => {
            const isSelected = selectedExerciseTypes.includes(type.id);
            return (
              <div
                key={type.id}
                style={{
                  ...styles.checkboxItem,
                  ...(isSelected ? styles.selectedCheckbox : styles.unselectedCheckbox)
                }}
                onClick={() => toggleExerciseType(type.id)}
              >
                <span>{isSelected ? '☑️' : '☐'}</span>
                <span>{type.emoji} {type.name}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Progress Board */}
      {!practiceComplete && (
        <div style={styles.scoreBoard}>
          <div style={styles.scoreText}>
            Answered: {answeredCount}/10
            {answeredCount === 10 && (
              <div style={{marginTop: '10px', fontSize: '16px', color: currentTheme.primary}}>
                Ready to submit! Click the button below.
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* Exercises Grid */}
      {exercises.length > 0 ? (
        <div style={styles.exercisesGrid} className="exercises-grid">
          {exercises.map((exercise, index) => {
            const result = exerciseResults[exercise.id];
            const userAnswer = exerciseAnswers[exercise.id] || '';
            const orderingAnswer = orderingAnswers[exercise.id] || [];
            const memoryPhase = memoryPhases[exercise.id] || 'ready';
            const memoryTimer = memoryTimers[exercise.id] || 0;

            let cardStyle = styles.exerciseCard;
            if (practiceComplete && result) {
              if (result.isCorrect) {
                cardStyle = { ...styles.exerciseCard, ...styles.correctCard };
              } else {
                cardStyle = { ...styles.exerciseCard, ...styles.incorrectCard };
              }
            }

            return (
              <div key={exercise.id} style={cardStyle}>
                <div style={styles.exerciseTitle}>
                  Exercise {index + 1} - {exerciseTypes.find(t => t.id === exercise.type)?.name}
                  {/* Teacher Help Button - Top Right Corner */}
                  {!practiceComplete && (
                    <button 
                      onClick={() => showTeacherHelp(exercise)}
                      className="teacher-help-btn"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        fontSize: '16px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: '2'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      title="Ask Teacher for Help"
                    >
                      ❓
                    </button>
                  )}
                </div>
                
                <div style={styles.exerciseText}>
                  {exercise.questionText}
                </div>

                {/* Pattern Exercise */}
                {exercise.type === 'pattern' && (
                  <div>
                    <div style={{fontSize: '24px', marginBottom: '15px', fontWeight: 'bold'}}>
                      {exercise.sequence.join(' , ')}
                    </div>
                    {(!result || !result.isCorrect) && (
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => {
                          console.log('Input change detected:', e.target.value, 'for exercise:', exercise.id);
                          setExerciseAnswers(prev => ({...prev, [exercise.id]: e.target.value}));
                        }}
                        onFocus={(e) => console.log('Input focused for exercise:', exercise.id)}
                        onBlur={(e) => console.log('Input blurred for exercise:', exercise.id)}
                        style={{
                          ...styles.input,
                          pointerEvents: 'auto',
                          touchAction: 'manipulation',
                          WebkitUserSelect: 'text',
                          userSelect: 'text'
                        }}
                        placeholder="?"
                      />
                    )}
                  </div>
                )}

                {/* Ordering Exercise */}
                {exercise.type === 'ordering' && (
                  <div>
                    {(!result || !result.isCorrect) && (
                      <>
                        <div style={styles.numberGrid}>
                          {exercise.numbers.map((num, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNumberClick(exercise.id, num)}
                              disabled={orderingAnswer.includes(num)}
                              style={{
                                ...styles.numberButton,
                                opacity: orderingAnswer.includes(num) ? 0.5 : 1
                              }}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        
                        <div>Your order:</div>
                        <div style={styles.selectedNumbers}>
                          {orderingAnswer.map((num, idx) => (
                            <span
                              key={idx}
                              onClick={() => removeFromOrdering(exercise.id, idx)}
                              style={styles.selectedNumber}
                            >
                              {num} ✕
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Missing Number, Addition, Subtraction, Word Problem Exercises */}
                {(exercise.type === 'missingNumber' || exercise.type === 'addition' || 
                  exercise.type === 'subtraction' || exercise.type === 'wordProblem') && (
                  <div>
                    {exercise.type === 'missingNumber' && (
                      <div style={{fontSize: '24px', marginBottom: '15px', fontWeight: 'bold'}}>
                        {exercise.equation}
                      </div>
                    )}
                    {(exercise.type === 'addition' || exercise.type === 'subtraction') && (
                      <div style={{fontSize: '24px', marginBottom: '15px', fontWeight: 'bold'}}>
                        {exercise.equation}
                      </div>
                    )}
                    {(!result || !result.isCorrect) && (
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => {
                          console.log('Input change detected:', e.target.value, 'for exercise:', exercise.id);
                          setExerciseAnswers(prev => ({...prev, [exercise.id]: e.target.value}));
                        }}
                        onFocus={(e) => console.log('Input focused for exercise:', exercise.id)}
                        onBlur={(e) => console.log('Input blurred for exercise:', exercise.id)}
                        style={{
                          ...styles.input,
                          pointerEvents: 'auto',
                          touchAction: 'manipulation',
                          WebkitUserSelect: 'text',
                          userSelect: 'text'
                        }}
                        placeholder={exercise.type === 'wordProblem' ? 'Answer' : '?'}
                      />
                    )}
                  </div>
                )}

                {/* Memory Exercise */}
                {exercise.type === 'memory' && memoryPhase === 'ready' && (!result || !result.isCorrect) && (
                  <div>
                    <div style={{marginBottom: '20px'}}>
                      Click the button to reveal the numbers to memorize!
                    </div>
                    <button 
                      onClick={() => startMemoryExercise(exercise.id)}
                      style={styles.memoryStartButton}
                    >
                      🧠 Start Memory Exercise
                    </button>
                  </div>
                )}

                {exercise.type === 'memory' && memoryPhase === 'show' && (
                  <div>
                    <div style={styles.memoryTimer}>{memoryTimer}</div>
                    <div style={{fontSize: '24px', marginBottom: '15px', fontWeight: 'bold'}}>
                      {exercise.numbers.join(' - ')}
                    </div>
                    <div>Memorize these numbers! ⏰</div>
                  </div>
                )}

                {exercise.type === 'memory' && memoryPhase === 'input' && (!result || !result.isCorrect) && (
                  <div>
                    <div style={{marginBottom: '15px'}}>Type the numbers in order:</div>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => {
                        console.log('Memory input change detected:', e.target.value, 'for exercise:', exercise.id);
                        setExerciseAnswers(prev => ({...prev, [exercise.id]: e.target.value}));
                      }}
                      onFocus={(e) => console.log('Memory input focused for exercise:', exercise.id)}
                      onBlur={(e) => console.log('Memory input blurred for exercise:', exercise.id)}
                      style={{
                        ...styles.input,
                        pointerEvents: 'auto',
                        touchAction: 'manipulation',
                        WebkitUserSelect: 'text',
                        userSelect: 'text'
                      }}
                      placeholder="12345..."
                    />
                  </div>
                )}
                
                {/* Show result and retry message for incorrect answers */}
                {practiceComplete && result && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: result.isCorrect ? '#d4edda' : '#f8d7da',
                    color: result.isCorrect ? '#155724' : '#721c24',
                    fontSize: '14px'
                  }}>
                    {result.isCorrect ? (
                      <span>✅ Correct! {result.explanation}</span>
                    ) : (
                      <>
                        <span>❌ Incorrect. {result.explanation}</span>
                        <div style={{marginTop: '8px', fontWeight: 'bold'}}>
                          Try again! You can correct your answer above.
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666'}}>
          <p>No exercises loaded. Generating...</p>
        </div>
      )}

      {/* Virtual Paper Button - Fixed positioning */}
      <button 
        className="virtual-paper-button"
        style={{
          position: 'fixed',
          right: '15px',
          bottom: '15px',
          backgroundColor: currentTheme.primary,
          color: 'white',
          border: 'none',
          padding: '15px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 999,
          transition: 'all 0.3s ease',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => setShowVirtualPaper(true)}
        title="Open Virtual Paper"
      >
        📝
      </button>

      {/* Virtual Paper Panel - Fixed with same centering logic as teacher */}
      {showVirtualPaper && (
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            touchAction: 'none',
            overscrollBehavior: 'contain'
          }}
          onClick={() => setShowVirtualPaper(false)}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div 
            className="virtual-paper-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '15px',
              paddingTop: '25px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              width: '95vw',
              height: '90vh',
              maxWidth: '1200px',
              maxHeight: '800px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              touchAction: 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Simple Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '10px',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '2px solid #eee',
              flexShrink: 0
            }}>
              <h3 style={{margin: 0, color: currentTheme.primary, fontSize: 'clamp(18px, 4vw, 24px)'}}>📝 Virtual Paper</h3>
              <button 
                onClick={() => setShowVirtualPaper(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'clamp(20px, 5vw, 28px)',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px',
                  minWidth: '44px',
                  minHeight: '44px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Simple Toolbar - Only Pencil and Eraser */}
            <div style={{
              display: 'flex',
              gap: 'clamp(8px, 2vw, 15px)',
              marginBottom: 'clamp(10px, 2vw, 20px)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(8px, 2vw, 15px)',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
              flexShrink: 0,
              flexWrap: 'wrap'
            }}>
              <button
                style={{
                  padding: 'clamp(10px, 2vw, 15px) clamp(15px, 3vw, 30px)',
                  border: paperTool === 'pencil' ? `3px solid ${currentTheme.primary}` : '2px solid #ddd',
                  borderRadius: '10px',
                  backgroundColor: paperTool === 'pencil' ? currentTheme.primary : 'white',
                  color: paperTool === 'pencil' ? 'white' : currentTheme.text,
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 3vw, 20px)',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  minWidth: 'clamp(80px, 20vw, 120px)',
                  minHeight: '44px'
                }}
                onClick={() => setPaperTool('pencil')}
              >
                ✏️ Pencil
              </button>
              
              <button
                style={{
                  padding: 'clamp(10px, 2vw, 15px) clamp(15px, 3vw, 30px)',
                  border: paperTool === 'eraser' ? `3px solid ${currentTheme.primary}` : '2px solid #ddd',
                  borderRadius: '10px',
                  backgroundColor: paperTool === 'eraser' ? currentTheme.primary : 'white',
                  color: paperTool === 'eraser' ? 'white' : currentTheme.text,
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 3vw, 20px)',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  minWidth: 'clamp(80px, 20vw, 120px)',
                  minHeight: '44px'
                }}
                onClick={() => setPaperTool('eraser')}
              >
                🧹 Eraser
              </button>

              <button
                style={{
                  padding: 'clamp(10px, 2vw, 15px) clamp(12px, 3vw, 25px)',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                  fontWeight: 'bold',
                  color: currentTheme.text,
                  minWidth: 'clamp(70px, 18vw, 100px)',
                  minHeight: '44px'
                }}
                onClick={clearCanvas}
              >
                🗑️ Clear
              </button>
            </div>

            {/* Canvas - Takes remaining space */}
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '5px',
              minHeight: '200px',
              overflow: 'hidden'
            }}>
              <canvas
                ref={(ref) => {
                  setCanvasRef(ref);
                  if (ref) {
                    if (drawingHistory.length === 0) {
                      // Responsive canvas size
                      const containerWidth = Math.min(window.innerWidth * 0.9, 1000);
                      const containerHeight = Math.min(window.innerHeight * 0.6, 600);
                      ref.width = containerWidth;
                      ref.height = containerHeight;
                      const ctx = ref.getContext('2d');
                      ctx.fillStyle = 'white';
                      ctx.fillRect(0, 0, ref.width, ref.height);
                      setDrawingHistory([ref.toDataURL()]);
                      setHistoryIndex(0);
                    }
                    // Sempre resetar as propriedades do contexto
                    const ctx = ref.getContext('2d');
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                  }
                }}
                style={{
                  border: `3px solid ${currentTheme.primary}`,
                  borderRadius: '10px',
                  cursor: 'crosshair',
                  backgroundColor: 'white',
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  e.preventDefault();
                  // Garantir configuração correta para dispositivos móveis
                  if (canvasRef) {
                    const ctx = canvasRef.getContext('2d');
                    configureCanvasContext(ctx, paperTool);
                  }
                  startDrawing(e);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  draw(e);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopDrawing();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Teacher Virtual Assistant Modal */}
      {showTeacher && (
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closeTeacher}
        >
          <div 
            className="teacher-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              width: '90vw',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              border: `4px solid ${currentTheme.primary}`,
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={closeTeacher}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                padding: '5px',
                zIndex: '3'
              }}
            >
              ✕
            </button>

            {/* Teacher Avatar - Consistent across devices */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <img 
                src={`${process.env.PUBLIC_URL || ''}/images/teacher-avatar.png`}
                alt="Teacher Bruna"
                className="teacher-avatar-mobile"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '15px',
                  border: `4px solid ${currentTheme.primary}`,
                  objectFit: 'cover',
                  marginBottom: '10px',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)'
                }}
                onError={(e) => {
                  // Tenta sem PUBLIC_URL caso dê erro
                  if (e.target.src.includes(process.env.PUBLIC_URL)) {
                    e.target.src = '/images/teacher-avatar.png';
                  } else {
                    // Fallback final
                    e.target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.innerHTML = '👩‍🏫';
                    fallback.style.fontSize = '100px';
                    fallback.style.textAlign = 'center';
                    fallback.style.marginBottom = '10px';
                    e.target.parentNode.insertBefore(fallback, e.target);
                  }
                }}
              />
              <h3 
                className="teacher-title-mobile"
                style={{
                  color: currentTheme.primary,
                  margin: '10px 0 5px 0',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              >
                Teacher Bruna
              </h3>
              <p style={{
                color: '#666',
                fontSize: '16px',
                margin: '0 0 15px 0',
                fontWeight: '500'
              }}>
                Your friendly Math Helper! 📚✨
              </p>
            </div>

            {/* Teacher Message */}
            <div 
              className="teacher-message-mobile"
              style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '15px',
                border: `3px solid ${currentTheme.secondary}`,
                marginBottom: '15px'
              }}
            >
              <p style={{
                fontSize: '16px',
                lineHeight: '1.5',
                color: currentTheme.text,
                margin: 0,
                fontWeight: '500'
              }}>
                💡 <strong>Hint:</strong> {teacherMessage}
              </p>
            </div>

            {/* Action Buttons */}
            <div 
              className="teacher-buttons-mobile"
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <button 
                onClick={() => showTeacherHelp(currentExerciseForHelp)}
                style={{
                  backgroundColor: currentTheme.accent,
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  fontSize: '14px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                  flex: '1',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                🔄 Another Hint
              </button>
              
              <button 
                onClick={closeTeacher}
                style={{
                  backgroundColor: currentTheme.primary,
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  fontSize: '14px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                  flex: '1',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                ✅ Got it!
              </button>
            </div>

            {/* Encouragement Footer */}
            <div 
              className="teacher-encouragement-mobile"
              style={{
                textAlign: 'center',
                marginTop: '15px',
                padding: '10px',
                backgroundColor: `${currentTheme.primary}20`,
                borderRadius: '10px'
              }}
            >
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: currentTheme.text,
                fontStyle: 'italic'
              }}>
                🌟 "You're doing great! Keep thinking and you'll find the answer!" 🌟
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal - Removed for Study Focus */}
      
      {/* Submit Button */}
      {exercises.length > 0 && (
        <div style={{textAlign: 'center', margin: '40px 0'}}>
          {!practiceComplete ? (
            <>
              <button 
                style={{
                  ...styles.submitAllButton,
                  opacity: answeredCount === 10 ? 1 : 0.6,
                  cursor: answeredCount === 10 ? 'pointer' : 'not-allowed'
                }}
                onClick={submitAllExercises}
                disabled={answeredCount < 10}
                onMouseOver={(e) => {
                  if (answeredCount === 10) e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Submit All Answers ({answeredCount}/10)
              </button>
              {answeredCount < 10 && (
                <div style={{
                  marginTop: '15px', 
                  fontSize: '16px', 
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  Please answer all exercises before submitting
                </div>
              )}
            </>
          ) : (
            <>
              {Object.values(exerciseResults).some(result => !result.isCorrect) && (
                <button 
                  style={{
                    ...styles.submitAllButton,
                    backgroundColor: '#FFA500'
                  }}
                  onClick={submitAllExercises}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Resubmit Corrected Answers
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;/* Force cache clear */
