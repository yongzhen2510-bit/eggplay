
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

const games = [
  ['數獨', 'Sudoku', '🔢'],
  ['找字遊戲', 'Word Search', '🔤'],
  ['找不同', 'Find the Difference', '🔍'],
  ['火柴棒謎題', 'Matchstick Puzzle', '🔥'],
  ['數字拼圖', 'Number Puzzle', '🧩'],
];

export default function PuzzleGames({ language = 'zh', onBack }) {
  const [game, setGame] = useState(null);

  const zh = language === 'zh';

  const back = () => setGame(null);

  const title = (item) => zh ? item[0] : item[1];

  return (
    <ScrollView style={styles.container}
      contentContainerStyle={styles.content}>

      <TouchableOpacity onPress={game ? back : onBack}>
        <Text style={styles.back}>
          {game
            ? (zh ? '← 返回遊戲列表' : '← Back to Games')
            : (zh ? '← 返回首頁' : '← Back Home')}
        </Text>
      </TouchableOpacity>

      {!game ? (
        <>
          <Text style={styles.heading}>
            🧩 {zh ? '益智遊戲' : 'Puzzle Games'}
          </Text>
          <Text style={styles.subtitle}>
            {zh ? '選一款遊戲開始挑戰！' : 'Choose a game to play!'}
          </Text>

          {games.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => setGame(index)}
            >
              <Text style={styles.emoji}>{item[2]}</Text>
              <Text style={styles.cardTitle}>{title(item)}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <>
          <Text style={styles.heading}>
            {games[game][2]} {title(games[game])}
          </Text>

          {game === 0 && <Sudoku zh={zh} />}
          {game === 1 && <WordSearch zh={zh} />}
          {game === 2 && <FindDifferent zh={zh} />}
          {game === 3 && <Matchstick zh={zh} />}
          {game === 4 && <NumberPuzzle zh={zh} />}
        </>
      )}
    </ScrollView>
  );
}

// 1. 數獨：4 x 4 入門版
function Sudoku({ zh }) {
  const puzzle = [
    [1, 0, 0, 4],
    [0, 4, 1, 0],
    [2, 0, 4, 0],
    [0, 3, 0, 1],
  ];

  const solution = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ];

  const [board, setBoard] = useState(puzzle);
  const [selected, setSelected] = useState(null);

  const chooseNumber = (number) => {
    if (!selected) return;

    const [r, c] = selected;
    if (puzzle[r][c] !== 0) return;

    const next = board.map(row => [...row]);
    next[r][c] = number;
    setBoard(next);
  };

  const check = () => {
    const correct = board.every((row, r) =>
      row.every((value, c) => value === solution[r][c])
    );

    Alert.alert(
      zh ? '檢查結果' : 'Result',
      correct
        ? (zh ? '答對了！太棒了！🎉' : 'Correct! Great job! 🎉')
        : (zh ? '還有錯誤，再試試看！' : 'Not quite. Try again!')
    );
  };

  return (
    <View>
      <Text style={styles.instruction}>
        {zh
          ? '填入 1～4，每一列、每一行都不能重複。'
          : 'Fill in 1–4. No repeats in each row or column.'}
      </Text>

      <View style={styles.board}>
        {board.map((row, r) =>
          row.map((value, c) => (
            <TouchableOpacity
              key={`${r}-${c}`}
              style={[
                styles.sudokuCell,
                selected?.[0] === r && selected?.[1] === c
                  ? styles.selected
                  : null,
              ]}
              onPress={() => setSelected([r, c])}
            >
              <Text style={styles.number}>{value || ''}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.numberRow}>
        {[1, 2, 3, 4].map(n => (
          <TouchableOpacity
            key={n}
            style={styles.numberButton}
            onPress={() => chooseNumber(n)}
          >
            <Text style={styles.number}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.action} onPress={check}>
        <Text style={styles.actionText}>
          {zh ? '檢查答案' : 'Check Answer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 2. 找字遊戲
function WordSearch({ zh }) {
  const letters = [
    'C', 'A', 'T', 'B',
    'D', 'O', 'G', 'E',
    'F', 'I', 'S', 'H',
    'P', 'E', 'N', 'S',
  ];

  const [chosen, setChosen] = useState([]);

  const tap = (index) => {
    if (chosen.includes(index)) return;

    const next = [...chosen, index];
    setChosen(next);

    const word = next.map(i => letters[i]).join('');

    if (word === 'CAT') {
      Alert.alert(
        zh ? '答對了！🎉' : 'Correct! 🎉',
        zh ? '你找到了 CAT！' : 'You found CAT!'
      );
    } else if (!'CAT'.startsWith(word)) {
      setChosen([]);
    }
  };

  return (
    <View>
      <Text style={styles.instruction}>
        {zh ? '找出單字：CAT（貓）' : 'Find the word: CAT'}
      </Text>

      <View style={styles.letterGrid}>
        {letters.map((letter, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.letterCell,
              chosen.includes(i) && styles.selected,
            ]}
            onPress={() => tap(i)}
          >
            <Text style={styles.number}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.action}
        onPress={() => setChosen([])}
      >
        <Text style={styles.actionText}>
          {zh ? '重新開始' : 'Restart'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 3. 找不同
function FindDifferent({ zh }) {
  const [answer, setAnswer] = useState(null);
  const different = 7;

  return (
    <View>
      <Text style={styles.instruction}>
        {zh ? '找出唯一不同的圖案！' : 'Find the different symbol!'}
      </Text>

      <View style={styles.differentGrid}>
        {Array.from({ length: 16 }, (_, i) => (
          <TouchableOpacity
            key={i}
            style={styles.differentCell}
            onPress={() => {
              setAnswer(i);
              Alert.alert(
                zh ? '結果' : 'Result',
                i === different
                  ? (zh ? '答對了！🎉' : 'Correct! 🎉')
                  : (zh ? '再仔細看看！' : 'Try again!')
              );
            }}
          >
            <Text style={styles.emoji}>
              {i === different ? '🍎' : '🍏'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.action}
        onPress={() => setAnswer(null)}
      >
        <Text style={styles.actionText}>
          {zh ? '重新挑戰' : 'Try Again'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 4. 火柴棒謎題
function Matchstick({ zh }) {
  const [answer, setAnswer] = useState(null);

  const choices = [2, 3, 4, 5];

  return (
    <View>
      <Text style={styles.instruction}>
        {zh
          ? '移動一根火柴棒，讓算式成立。'
          : 'Move one matchstick to make the equation correct.'}
      </Text>

      <Text style={styles.mathQuestion}>6 - 4 = 5</Text>

      {choices.map(n => (
        <TouchableOpacity
          key={n}
          style={[
            styles.choice,
            answer === n && styles.selected,
          ]}
          onPress={() => setAnswer(n)}
        >
          <Text style={styles.number}>{n}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.action}
        onPress={() => {
          Alert.alert(
            zh ? '答案' : 'Answer',
            answer === 2
              ? (zh ? '答對了！🎉' : 'Correct! 🎉')
              : (zh ? '再想想看！' : 'Try again!')
          );
        }}
      >
        <Text style={styles.actionText}>
          {zh ? '確認答案' : 'Check'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 5. 數字拼圖
function NumberPuzzle({ zh }) {
  const [tiles, setTiles] = useState([
    1, 2, 3,
    4, 5, 6,
    7, 0, 8,
  ]);

  const move = (index) => {
    const empty = tiles.indexOf(0);
    const adjacent = [
      index - 3,
      index + 3,
      index - 1,
      index + 1,
    ];

    const sameRow =
      Math.floor(index / 3) === Math.floor(empty / 3);

    const valid = adjacent.includes(empty) &&
      (sameRow || Math.abs(index - empty) === 3);

    if (!valid) return;

    const next = [...tiles];
    [next[index], next[empty]] = [next[empty], next[index]];
    setTiles(next);

    if (next.join(',') === '1,2,3,4,5,6,7,8,0') {
      Alert.alert(
        zh ? '完成！🎉' : 'Completed! 🎉',
        zh ? '你成功完成拼圖了！' : 'You solved the puzzle!'
      );
    }
  };

  return (
    <View>
      <Text style={styles.instruction}>
        {zh
          ? '點擊空格旁邊的數字，將數字排成 1～8。'
          : 'Tap a tile next to the empty space to arrange 1–8.'}
      </Text>

      <View style={styles.board}>
        {tiles.map((n, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.puzzleCell,
              n === 0 && styles.emptyCell,
            ]}
            onPress={() => move(i)}
          >
            <Text style={styles.number}>
              {n === 0 ? '' : n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.action}
        onPress={() => setTiles([
          1, 2, 3,
          4, 5, 6,
          7, 0, 8,
        ])}
      >
        <Text style={styles.actionText}>
          {zh ? '重新開始' : 'Restart'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    padding: 22,
    paddingBottom: 50,
  },
  back: {
    color: '#6688CC',
    fontSize: 15,
    marginVertical: 15,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
  },
  subtitle: {
    color: '#888',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  arrow: {
    fontSize: 25,
    color: '#999',
  },
  instruction: {
    color: '#777',
    fontSize: 15,
    lineHeight: 24,
    marginVertical: 18,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    alignSelf: 'center',
    marginVertical: 20,
  },
  sudokuCell: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#AAA',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#DCE7FF',
    borderColor: '#6688CC',
  },
  number: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#333',
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  numberButton: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    width: 48,
    alignItems: 'center',
  },
  action: {
    backgroundColor: '#6688CC',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    alignSelf: 'center',
  },
  letterCell: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  differentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    alignSelf: 'center',
  },
  differentCell: {
    width: 70,
    height: 70,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  mathQuestion: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  choice: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  puzzleCell: {
    width: 80,
    height: 80,
    margin: 0,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#E4EBFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    backgroundColor: '#F7F7F7',
  },
});
