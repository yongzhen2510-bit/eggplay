import AsyncStorage from '@react-native-async-storage/async-storage';
import { PICTURES } from '../components/icons';
import { api } from '../lib/api';

const g = (id, type, zh, en, icon, secs, kind, dz, de, extra = {}) => ({ id, type, zh, en, icon, secs, kind, dz, de, ...extra });

export const GAMES = [
  g('sudoku', 'puzzle', '迷你數獨', 'Mini Sudoku', 'grid', 90, 'sudoku', '每列每行 1～4 不重複', 'No repeats in any row or column'),
  g('wordsearch', 'puzzle', '找字遊戲', 'Word Search', 'letters', 60, 'wordsearch', '依序點出藏起來的單字', 'Tap the hidden word in order'),
  g('finddiff', 'puzzle', '找不同', 'Spot the Odd', 'search', 45, 'finddiff', '一眼抓出不一樣的圖案', 'Find the one that differs'),
  g('matchstick', 'puzzle', '火柴棒謎題', 'Matchsticks', 'match', 90, 'matchstick', '移動一根，算式就成立', 'Move one stick to fix the sum'),
  g('slide', 'puzzle', '數字拼圖', 'Sliding Tiles', 'tiles', 120, 'slide', '把數字滑回 1～8', 'Slide the tiles back to 1–8'),
  g('memory', 'puzzle', '記憶配對', 'Memory Match', 'cards', 90, 'memory', '翻牌找出所有配對', 'Flip cards to find every pair'),
  g('rebus', 'puzzle', '圖像猜謎', 'Picture Rebus', 'bulb', 90, 'quiz', '看圖示猜答案', 'Guess the answer from pictures', { ai: 'rebus' }),
  g('maze', 'puzzle', '迷宮', 'Maze', 'maze', 60, 'maze', '每次都是新迷宮', 'A brand-new maze every time'),
  g('logic', 'puzzle', '邏輯推理', 'Logic Puzzles', 'branch', 120, 'quiz', '短短幾句，推出答案', 'Short clues, one conclusion', { ai: 'logic' }),
  g('g2048', 'puzzle', '數字合成', '2048 Sprint', 'merge', 180, 'g2048', '三分鐘衝最高分', 'Highest score in three minutes'),
  g('quizrush', 'challenge', '快問快答', 'Quiz Rush', 'flash', 45, 'quiz', '45 秒答越多越好', 'Answer fast for 45 seconds', { ai: 'quiz', limit: 45 }),
  g('truefalse', 'challenge', '是非搶答', 'True or False', 'truefalse', 30, 'quiz', '30 秒判斷真假', 'Call it in 30 seconds', { ai: 'truefalse', limit: 30 }),
  g('idiom', 'challenge', '成語填空', 'Proverb Fill', 'scroll', 45, 'quiz', '補上缺的那個字', 'Fill in the missing word', { ai: 'idiom', limit: 45 }),
  g('riddle', 'challenge', '謎語衝刺', 'Riddle Dash', 'question', 60, 'quiz', '腦筋急轉彎限時版', 'Brain teasers against the clock', { ai: 'riddle', limit: 60 }),
  g('oddone', 'challenge', '誰是異類', 'Odd One Out', 'eye', 45, 'quiz', '選出不屬於同類的', 'Pick what does not belong', { ai: 'oddone', limit: 45 }),
  g('mental', 'challenge', '心算衝刺', 'Mental Math', 'calc', 45, 'mental', '45 秒連續心算', 'Rapid sums for 45 seconds'),
  g('stroop', 'challenge', '顏色陷阱', 'Colour Trap', 'palette', 30, 'stroop', '選字的顏色，不是字義', 'Pick the ink, not the word'),
  g('reaction', 'challenge', '反應力', 'Reaction', 'stoplight', 30, 'reaction', '看到提示立刻按', 'Tap the moment it says go'),
  g('schulte', 'challenge', '數字追擊', 'Number Chase', 'speed', 40, 'schulte', '照順序點完 1～16', 'Tap 1 to 16 in order'),
  g('simon', 'challenge', '記憶序列', 'Sequence', 'music', 60, 'simon', '跟著亮燈順序按', 'Repeat the growing sequence'),
];
export const gameById = id => GAMES.find(x => x.id === id);
export const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

const q = (zp, ep, zo, eo, answer, icons) => ({ zh: { prompt: zp, options: zo, answer, icons }, en: { prompt: ep, options: eo, answer, icons } });
const TF = [['對', '錯'], ['True', 'False']];
const tf = (zp, ep, yes) => q(zp, ep, TF[0], TF[1], yes ? 0 : 1);

const BUILTIN = {
  rebus: [
    q('猜天氣現象', 'Guess the weather', ['彩虹', '颱風', '閃電', '下雪'], ['Rainbow', 'Typhoon', 'Lightning', 'Snow'], 0, ['rain', 'bow']),
    q('猜甜食來源', 'Guess the food', ['蜂蜜', '果醬', '砂糖', '巧克力'], ['Honey', 'Jam', 'Sugar', 'Chocolate'], 0, ['bee', 'honey']),
    q('猜節慶', 'Guess the festival', ['中秋節', '端午節', '元宵節', '清明節'], ['Mid-Autumn', 'Dragon Boat', 'Lantern', 'Qingming'], 0, ['moon', 'cake']),
    q('猜地形', 'Guess the landform', ['冰川', '沙漠', '火山', '草原'], ['Glacier', 'Desert', 'Volcano', 'Prairie'], 0, ['ice', 'mountain']),
    q('猜節慶', 'Guess the festival', ['端午節', '春節', '中秋節', '重陽節'], ['Dragon Boat', 'Lunar New Year', 'Mid-Autumn', 'Double Ninth'], 0, ['zongzi', 'boat']),
  ],
  logic: [
    q('小明比小華高，小華比小美高。誰最矮？', 'Al is taller than Bo, Bo is taller than Cy. Who is shortest?', ['小美', '小華', '小明', '無法判斷'], ['Cy', 'Bo', 'Al', 'Cannot tell'], 0),
    q('所有貓都是動物，咪咪是貓。所以？', 'All cats are animals. Mimi is a cat. So?', ['咪咪是動物', '動物都是貓', '咪咪不是動物', '無法判斷'], ['Mimi is an animal', 'All animals are cats', 'Mimi is not an animal', 'Cannot tell'], 0),
    q('2、4、8、16，下一個數字？', '2, 4, 8, 16, what comes next?', ['32', '24', '20', '18'], ['32', '24', '20', '18'], 0),
    q('今天星期三，再過 10 天是星期幾？', 'Today is Wednesday. What day is it in 10 days?', ['星期六', '星期五', '星期日', '星期一'], ['Saturday', 'Friday', 'Sunday', 'Monday'], 0),
    q('三人排隊，甲不在最前，乙在最後。誰在最前？', 'Three queue. A is not first, B is last. Who is first?', ['丙', '甲', '乙', '無法判斷'], ['C', 'A', 'B', 'Cannot tell'], 0),
  ],
  quiz: [
    q('太陽系最大的行星？', 'Largest planet in the solar system?', ['木星', '土星', '地球', '海王星'], ['Jupiter', 'Saturn', 'Earth', 'Neptune'], 0),
    q('水的化學式？', 'Chemical formula of water?', ['H₂O', 'CO₂', 'O₂', 'NaCl'], ['H₂O', 'CO₂', 'O₂', 'NaCl'], 0),
    q('一年有幾個季節？', 'How many seasons in a year?', ['4', '3', '5', '6'], ['4', '3', '5', '6'], 0),
    q('彩虹通常有幾種顏色？', 'How many colours in a rainbow?', ['7', '5', '6', '8'], ['7', '5', '6', '8'], 0),
    q('世界最高的山峰？', 'World\'s highest mountain?', ['聖母峰', '玉山', '富士山', 'K2'], ['Everest', 'Yushan', 'Fuji', 'K2'], 0),
  ],
  truefalse: [
    tf('章魚有三顆心臟。', 'An octopus has three hearts.', true),
    tf('聲音在真空中傳得最快。', 'Sound travels fastest in a vacuum.', false),
    tf('香蕉在植物學上屬於漿果。', 'Botanically, a banana is a berry.', true),
    tf('金星是離太陽最近的行星。', 'Venus is the closest planet to the Sun.', false),
    tf('人體最大的器官是皮膚。', 'Skin is the largest human organ.', true),
  ],
  idiom: [
    q('一石二＿', 'Kill two birds with one ＿', ['鳥', '魚', '馬', '虎'], ['stone', 'stick', 'arrow', 'hand'], 0),
    q('畫蛇添＿', 'A picture is worth a thousand ＿', ['足', '翼', '尾', '角'], ['words', 'coins', 'days', 'lines'], 0),
    q('守株待＿', 'The early bird catches the ＿', ['兔', '鹿', '羊', '鳥'], ['worm', 'fish', 'cat', 'seed'], 0),
    q('對牛彈＿', 'Don\'t cry over spilled ＿', ['琴', '笛', '鼓', '歌'], ['milk', 'tea', 'wine', 'water'], 0),
    q('亡羊補＿', 'Better late than ＿', ['牢', '門', '牆', '網'], ['never', 'sorry', 'early', 'ever'], 0),
  ],
  riddle: [
    q('什麼東西越洗越髒？', 'What gets wetter the more it dries?', ['水', '衣服', '碗', '手'], ['A towel', 'A river', 'A cup', 'Rain'], 0),
    q('什麼東西有腳卻不會走？', 'What has legs but cannot walk?', ['桌子', '小狗', '小鳥', '螞蟻'], ['A table', 'A dog', 'A bird', 'An ant'], 0),
    q('什麼門永遠關不上？', 'What has keys but opens no locks?', ['球門', '大門', '車門', '房門'], ['A piano', 'A door', 'A safe', 'A car'], 0),
    q('什麼東西有很多牙齒卻不會咬人？', 'What has many teeth but cannot bite?', ['梳子', '老虎', '鯊魚', '恐龍'], ['A comb', 'A tiger', 'A shark', 'A dinosaur'], 0),
    q('什麼東西你用得越多，它就越小？', 'What gets smaller the more you use it?', ['肥皂', '書本', '手機', '鞋子'], ['Soap', 'A book', 'A phone', 'A shoe'], 0),
  ],
  oddone: [
    q('哪個不是水果？', 'Which is not a fruit?', ['高麗菜', '蘋果', '香蕉', '葡萄'], ['Cabbage', 'Apple', 'Banana', 'Grape'], 0),
    q('哪個不是哺乳類？', 'Which is not a mammal?', ['鱷魚', '鯨魚', '蝙蝠', '海豚'], ['Crocodile', 'Whale', 'Bat', 'Dolphin'], 0),
    q('哪個不是樂器？', 'Which is not an instrument?', ['書桌', '鋼琴', '小提琴', '吉他'], ['Desk', 'Piano', 'Violin', 'Guitar'], 0),
    q('哪個不是行星？', 'Which is not a planet?', ['月球', '火星', '金星', '土星'], ['The Moon', 'Mars', 'Venus', 'Saturn'], 0),
    q('哪個不是交通工具？', 'Which is not a vehicle?', ['雨傘', '公車', '火車', '腳踏車'], ['Umbrella', 'Bus', 'Train', 'Bicycle'], 0),
  ],
};
const BUILTIN_WORDS = [['CAT', '貓', 'A pet that purrs'], ['MOON', '月亮', 'It orbits Earth'], ['APPLE', '蘋果', 'A crunchy fruit'], ['RIVER', '河流', 'Flowing water'], ['TIGER', '老虎', 'A striped big cat'], ['BREAD', '麵包', 'Baked at breakfast']];
const PICTURE_PAIRS = [['dog', 'cat'], ['star', 'moon'], ['apple', 'pear'], ['car', 'bike'], ['sun', 'cloud'], ['fish', 'turtle']];
const MEMORY_SET = [
  { icon: 'pizza', zh: '披薩', en: 'Pizza' }, { icon: 'panda', zh: '貓熊', en: 'Panda' }, { icon: 'rocket', zh: '火箭', en: 'Rocket' },
  { icon: 'guitar', zh: '吉他', en: 'Guitar' }, { icon: 'cactus', zh: '仙人掌', en: 'Cactus' }, { icon: 'fox', zh: '狐狸', en: 'Fox' },
  { icon: 'donut', zh: '甜甜圈', en: 'Donut' }, { icon: 'ball', zh: '足球', en: 'Football' }, { icon: 'rainbow', zh: '彩虹', en: 'Rainbow' },
  { icon: 'balloon', zh: '氣球', en: 'Balloon' }, { icon: 'watermelon', zh: '西瓜', en: 'Watermelon' }, { icon: 'star', zh: '星星', en: 'Star' },
];

const shuffleOptions = x => {
  const correct = x.options[x.answer];
  const options = shuffle(x.options);
  return { prompt: x.prompt, icons: x.icons, options, answer: options.indexOf(correct) };
};
const questionKey = x => [x.prompt, ...(x.icons || [])].join(' ');

async function seen(id) { try { return JSON.parse(await AsyncStorage.getItem(`seen:${id}`)) || []; } catch { return []; } }
async function remember(id, items) { try { await AsyncStorage.setItem(`seen:${id}`, JSON.stringify([...items, ...(await seen(id))].slice(0, 40))); } catch {} }

// The server waits up to 12 seconds on Gemini, so this only trips if the server itself stalls.
const TIMEOUT_MS = 15000;
const ask = (kind, lang, avoid) => api(`/questions/${kind}`, { method: 'POST', body: { lang, avoid: avoid.slice(0, 20) }, timeoutMs: TIMEOUT_MS });

// Returns { items, source }. Any failure falls back to the built-in bank so play never stalls.
export async function loadQuiz(game, lang) {
  const avoid = await seen(game.id);
  try {
    const { questions } = await ask(game.ai, lang, avoid);
    const items = questions.filter(x => !x.icons || x.icons.every(n => PICTURES[n])).filter(x => !avoid.includes(questionKey(x)));
    if (items.length >= 3) { remember(game.id, items.map(questionKey)); return { items: items.map(shuffleOptions), source: 'gemini' }; }
  } catch (e) { console.warn('Fresh questions unavailable:', e.message); }
  return { items: shuffle(BUILTIN[game.ai]).map(x => shuffleOptions(x[lang])), source: 'builtin' };
}

export async function loadWords(lang, count = 3) {
  try {
    const avoid = await seen('wordsearch');
    const { words } = await ask('words', lang, avoid);
    const items = words.filter(w => !avoid.includes(w.word));
    if (items.length >= count) { remember('wordsearch', items.map(i => i.word)); return { items: items.slice(0, count), source: 'gemini' }; }
  } catch (e) { console.warn('Fresh words unavailable:', e.message); }
  return { items: shuffle(BUILTIN_WORDS).slice(0, count).map(([word, z, e]) => ({ word, hint: lang === 'zh' ? z : e })), source: 'builtin' };
}

// Pictures are drawn in-app, so these two games pick from local sets and need no network.
export const loadPairs = async (count = 3) => ({ items: shuffle(PICTURE_PAIRS).slice(0, count) });
export const loadMemorySet = async (count = 6) => ({ items: shuffle(MEMORY_SET).slice(0, count) });
