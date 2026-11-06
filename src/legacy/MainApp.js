
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, SafeAreaView, Alert
} from 'react-native';

// 四大分類
const categories = [
  { id: 'puzzle', zh: '益智遊戲', en: 'Puzzle Games', emoji: '🧩' },
  { id: 'challenge', zh: '挑戰遊戲', en: 'Challenge Games', emoji: '🏆' },
  { id: 'adventure', zh: '冒險遊戲', en: 'Adventure Games', emoji: '🗺️' },
  { id: 'social', zh: '話題交流', en: 'Social Hub', emoji: '💬' },
];

const options = [
  { id: 'idea', zh: '我有想法！', en: 'I have an idea!', emoji: '💡' },
  { id: 'random', zh: '幫我選一個！', en: 'Pick for me!', emoji: '🎲' },
];

const puzzleGames = [
  ['數獨', 'Sudoku', '🔢'],
  ['找字遊戲', 'Word Search', '🔤'],
  ['找不同', 'Find the Difference', '🔍'],
  ['火柴棒謎題', 'Matchstick Puzzle', '🔥'],
  ['數字拼圖', 'Number Puzzle', '🔢'],
  ['記憶配對', 'Memory Match', '🃏'],
  ['圖像猜謎', 'Rebus Puzzle', '🧠'],
  ['迷宮', 'Maze', '🌀'],
  ['邏輯推理', 'Logic Puzzle', '💭'],
  ['數字合成 2048', '2048', '🎯'],
];

const challengeGames = [
  ['記憶極限', 'Memory Sequence', '🧠'],
  ['節奏大師', 'Rhythm Master', '🎵'],
  ['反應極限', 'Reaction Rush', '⚡'],
  ['極限闖關', 'Impossible Run', '🏃'],
  ['多工大考驗', 'Multitasking', '🎮'],
  ['心算極速賽', 'Math Rush', '➗'],
  ['平衡大師', 'Balance Master', '⚖️'],
  ['圖形追蹤', 'Pattern Rush', '🔷'],
  ['限時拆解', 'Time Pressure', '⏱️'],
  ['生存挑戰', 'Survival Mode', '🔥'],
];

const topics = [
  {
    id: 1,
    zh: '如果可以擁有一種超能力，你會選什麼？',
    en: 'If you could have one superpower, what would it be?',
    comments: [
      { text: '瞬間移動，這樣就不用趕車了！', anonymous: true },
      { text: '我想要時間暫停！', anonymous: false },
    ],
  },
  {
    id: 2,
    zh: '如果明天不用上課或上班，你最想做什麼？',
    en: 'What would you do if you had a free day tomorrow?',
    comments: [
      { text: '睡到自然醒！', anonymous: false },
    ],
  },
  {
    id: 3,
    zh: '你覺得友情中最重要的是什麼？',
    en: 'What matters most in a friendship?',
    comments: [],
  },
  {
    id: 4,
    zh: '如果能去世界任何一個地方，你想去哪裡？',
    en: 'Where would you go if you could visit anywhere?',
    comments: [],
  },
];

const translations = {
  zh: {
    subtitle: '找點有趣的事情做吧！',
    categories: '遊戲類型',
    today: '今天想做什麼？',
    selected: '已選擇',
    confirm: '就決定是你了！',
    back: '← 返回首頁',
    discussion: '話題討論',
    friends: '好友',
    groups: '群組',
    anonymous: '匿名留言',
    send: '送出留言',
    placeholder: '寫下你的想法...',
    invite: '邀請朋友',
    inviteDesc: '分享邀請碼，讓朋友加入你。',
    copyCode: '複製邀請碼',
    createGroup: '建立群組',
    groupName: '輸入群組名稱',
    create: '建立',
    noGroups: '目前還沒有群組。',
    noFriends: '目前還沒有好友。',
    comments: '則留言',
    adventure: '冒險遊戲內容即將推出！',
    gameComing: '遊戲內容即將推出！',
  },
  en: {
    subtitle: 'Find something fun to do!',
    categories: 'Categories',
    today: 'What do you want to do today?',
    selected: 'Selected',
    confirm: "You're the one!",
    back: '← Back to Home',
    discussion: 'Topics',
    friends: 'Friends',
    groups: 'Groups',
    anonymous: 'Post anonymously',
    send: 'Send',
    placeholder: 'Write your thoughts...',
    invite: 'Invite Friends',
    inviteDesc: 'Share your invite code with friends.',
    copyCode: 'Copy Invite Code',
    createGroup: 'Create Group',
    groupName: 'Enter group name',
    create: 'Create',
    noGroups: 'No groups yet.',
    noFriends: 'No friends yet.',
    comments: 'comments',
    adventure: 'Adventure games coming soon!',
    gameComing: 'Game content coming soon!',
  },
};

export default function App() {
  const [language, setLanguage] = useState('zh');
  const [page, setPage] = useState('home');
  const [selected, setSelected] = useState(null);

  // 社群功能狀態
  const [socialTab, setSocialTab] = useState('topics');
  const [activeTopic, setActiveTopic] = useState(null);
  const [topicData, setTopicData] = useState(topics);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [inviteCode] = useState('PLAY2026');

  const t = translations[language];

  const switchLanguage = (
    <View style={styles.languageRow}>
      <TouchableOpacity onPress={() => setLanguage('zh')}>
        <Text style={language === 'zh' ? styles.activeLang : styles.lang}>
          中文
        </Text>
      </TouchableOpacity>
      <Text style={styles.lang}> | </Text>
      <TouchableOpacity onPress={() => setLanguage('en')}>
        <Text style={language === 'en' ? styles.activeLang : styles.lang}>
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );

  const goHome = () => {
    setPage('home');
    setSelected(null);
    setActiveTopic(null);
  };

  const confirmSelection = () => {
    if (selected) {
      setPage(selected.id);
      setSelected(null);
      setSocialTab('topics');
    }
  };

  // 首頁
  if (page === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {switchLanguage}

          <Text style={styles.logo}>Let's Play!</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>

          <Text style={styles.sectionTitle}>{t.categories}</Text>

          <View style={styles.grid}>
            {categories.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  selected?.id === item.id && styles.selectedCard,
                ]}
                onPress={() => setSelected(item)}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.cardTitle}>
                  {language === 'zh' ? item.zh : item.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t.today}</Text>

          {options.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionCard,
                selected?.id === item.id && styles.selectedCard,
              ]}
              onPress={() => setSelected(item)}
            >
              <Text style={styles.optionEmoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle}>
                {language === 'zh' ? item.zh : item.en}
              </Text>
            </TouchableOpacity>
          ))}

          {selected && (
            <View style={styles.confirmArea}>
              <Text style={styles.selectedText}>
                {t.selected}：
                {language === 'zh' ? selected.zh : selected.en}
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmSelection}
              >
                <Text style={styles.confirmText}>{t.confirm}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 話題交流
  if (page === 'social') {
    const selectedTopic = topicData.find(
      item => item.id === activeTopic
    );

    const addComment = () => {
      if (!comment.trim() || !selectedTopic) return;

      setTopicData(old =>
        old.map(item =>
          item.id === activeTopic
            ? {
                ...item,
                comments: [
                  ...item.comments,
                  { text: comment.trim(), anonymous },
                ],
              }
            : item
        )
      );

      setComment('');
    };

    const createNewGroup = () => {
      if (!groupName.trim()) return;

      setGroups(old => [...old, groupName.trim()]);
      setGroupName('');
      Alert.alert(
        language === 'zh' ? '建立成功' : 'Created',
        language === 'zh' ? '群組已建立！' : 'Your group has been created!'
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {switchLanguage}

          <TouchableOpacity onPress={goHome}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>
            💬 {language === 'zh' ? '話題交流' : 'Social Hub'}
          </Text>

          <Text style={styles.subtitle}>
            {language === 'zh'
              ? '分享想法，認識更多朋友！'
              : 'Share ideas and meet new friends!'}
          </Text>

          <View style={styles.tabRow}>
            {[
              ['topics', t.discussion],
              ['friends', t.friends],
              ['groups', t.groups],
            ].map(([id, label]) => (
              <TouchableOpacity
                key={id}
                onPress={() => setSocialTab(id)}
                style={[
                  styles.tab,
                  socialTab === id && styles.activeTab,
                ]}
              >
                <Text style={[
                  styles.tabText,
                  socialTab === id && styles.activeTabText,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 話題列表 */}
          {socialTab === 'topics' && !selectedTopic && (
            <>
              <Text style={styles.sectionTitle}>
                {language === 'zh' ? '今日話題' : "Today's Topics"}
              </Text>

              {topicData.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.topicCard}
                  onPress={() => setActiveTopic(item.id)}
                >
                  <Text style={styles.topicLabel}>
                    {language === 'zh' ? '熱門話題' : 'TOPIC'}
                  </Text>
                  <Text style={styles.topicTitle}>
                    {language === 'zh' ? item.zh : item.en}
                  </Text>
                  <Text style={styles.commentCount}>
                    {item.comments.length} {t.comments} →
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* 單一話題留言 */}
          {socialTab === 'topics' && selectedTopic && (
            <>
              <TouchableOpacity onPress={() => setActiveTopic(null)}>
                <Text style={styles.backText}>
                  {language === 'zh' ? '← 返回話題' : '← Back to Topics'}
                </Text>
              </TouchableOpacity>

              <View style={styles.topicCard}>
                <Text style={styles.topicTitle}>
                  {language === 'zh'
                    ? selectedTopic.zh
                    : selectedTopic.en}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                {language === 'zh' ? '留言區' : 'Comments'}
              </Text>

              {selectedTopic.comments.map((item, index) => (
                <View key={index} style={styles.commentCard}>
                  <Text style={styles.commentName}>
                    {item.anonymous
                      ? (language === 'zh' ? '匿名使用者' : 'Anonymous')
                      : (language === 'zh' ? '使用者' : 'User')}
                  </Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              ))}

              <View style={styles.commentInputArea}>
                <TextInput
                  style={styles.input}
                  value={comment}
                  onChangeText={setComment}
                  placeholder={t.placeholder}
                  multiline
                />

                <TouchableOpacity
                  style={styles.anonymousRow}
                  onPress={() => setAnonymous(!anonymous)}
                >
                  <Text style={styles.checkbox}>
                    {anonymous ? '☑' : '☐'}
                  </Text>
                  <Text>{t.anonymous}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={addComment}
                >
                  <Text style={styles.confirmText}>{t.send}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* 好友 */}
          {socialTab === 'friends' && (
            <>
              <View style={styles.topicCard}>
                <Text style={styles.topicTitle}>🔗 {t.invite}</Text>
                <Text style={styles.subtitle}>{t.inviteDesc}</Text>
                <Text style={styles.inviteCode}>{inviteCode}</Text>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => Alert.alert(
                    language === 'zh' ? '邀請碼' : 'Invite Code',
                    language === 'zh'
                      ? '這是示範邀請碼，正式版需要串接好友系統。'
                      : 'Demo invite code. A real friend system is needed.'
                  )}
                >
                  <Text style={styles.confirmText}>{t.copyCode}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>{t.friends}</Text>

              {friends.length === 0 ? (
                <Text style={styles.emptyText}>{t.noFriends}</Text>
              ) : (
                friends.map((friend, index) => (
                  <View key={index} style={styles.commentCard}>
                    <Text>{'👤  ' + friend}</Text>
                  </View>
                ))
              )}
            </>
          )}

          {/* 群組 */}
          {socialTab === 'groups' && (
            <>
              <Text style={styles.sectionTitle}>{t.createGroup}</Text>

              <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder={t.groupName}
              />

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={createNewGroup}
              >
                <Text style={styles.confirmText}>{t.create}</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>{t.groups}</Text>

              {groups.length === 0 ? (
                <Text style={styles.emptyText}>{t.noGroups}</Text>
              ) : (
                groups.map((group, index) => (
                  <View key={index} style={styles.commentCard}>
                    <Text style={styles.cardTitle}>👥 {group}</Text>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 益智與挑戰遊戲列表
  if (page === 'puzzle' || page === 'challenge') {
    const list = page === 'puzzle' ? puzzleGames : challengeGames;
    const category = categories.find(item => item.id === page);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {switchLanguage}

          <TouchableOpacity onPress={goHome}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>
            {category.emoji} {language === 'zh' ? category.zh : category.en}
          </Text>

          {list.map((game, index) => (
            <View key={index} style={styles.gameCard}>
              <Text style={styles.gameEmoji}>{game[2]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {language === 'zh' ? game[0] : game[1]}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 冒險遊戲
  if (page === 'adventure') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {switchLanguage}
          <TouchableOpacity onPress={goHome}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.detailEmoji}>🗺️</Text>
          <Text style={styles.detailTitle}>
            {language === 'zh' ? '冒險遊戲' : 'Adventure Games'}
          </Text>
          <Text style={styles.emptyText}>{t.adventure}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 我有想法、幫我選一個
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {switchLanguage}
        <TouchableOpacity onPress={goHome}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.detailEmoji}>🎲</Text>
        <Text style={styles.detailTitle}>
          {language === 'zh'
            ? '開始探索吧！'
            : "Let's Explore!"}
        </Text>
        <Text style={styles.emptyText}>{t.gameComing}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  lang: {
    color: '#999',
    fontSize: 14,
  },
  activeLang: {
    color: '#6688CC',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    color: '#888',
    marginTop: 7,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 22,
    marginBottom: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#6688CC',
    backgroundColor: '#EEF3FF',
  },
  emoji: {
    fontSize: 30,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionEmoji: {
    fontSize: 28,
    marginRight: 15,
  },
  confirmArea: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 18,
    marginTop: 15,
  },
  selectedText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#6688CC',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    color: '#6688CC',
    marginVertical: 12,
    fontSize: 15,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  gameEmoji: {
    fontSize: 28,
    marginRight: 15,
  },
  arrow: {
    color: '#999',
    fontSize: 24,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    padding: 4,
    marginVertical: 15,
  },
  tab: {
    flex: 1,
    padding: 11,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: '#FFF',
  },
  tabText: {
    color: '#777',
    fontSize: 13,
  },
  activeTabText: {
    color: '#6688CC',
    fontWeight: 'bold',
  },
  topicCard: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 13,
  },
  topicLabel: {
    color: '#6688CC',
    fontSize: 12,
    marginBottom: 10,
  },
  topicTitle: {
    color: '#333',
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 25,
  },
  commentCount: {
    color: '#888',
    marginTop: 14,
    fontSize: 12,
  },
  commentCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  commentName: {
    color: '#6688CC',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  commentText: {
    color: '#444',
    lineHeight: 22,
  },
  commentInputArea: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 14,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 13,
    minHeight: 45,
    marginBottom: 10,
    color: '#333',
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  checkbox: {
    fontSize: 20,
    color: '#6688CC',
    marginRight: 8,
  },
  inviteCode: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#6688CC',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  detailEmoji: {
    fontSize: 65,
    textAlign: 'center',
    marginTop: 100,
  },
  detailTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});
