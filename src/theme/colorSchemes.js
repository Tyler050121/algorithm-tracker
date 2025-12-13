// 艺术配色方案
// 纯净的数据设计：只包含调色板，不包含为了兼容生成的冗余数据

export const COLOR_SCHEMES = {
  monet: {
    name: '莫奈花园',
    isDark: false,
    palette: [
      '#C0B87F', // 花园里都是星星的碎片
      '#D4DEC3', // 我愿站在大海面前或波涛之巅
      '#BCD5C1', // 我曾以为,留住光,就可以留住你
      '#87ACCF', // 我想用一种鸟儿唱歌的方式画画
      '#B6BCD9', // 色观主义者是看天的化身
      '#D4B9BE', // 四月将勤劳和注入万物
      '#C3949B', // 春天是一种永远的经历
    ]
  },
  moonlight: {
    name: '昨日月光',
    isDark: false,
    // Override which palette color becomes "brand" (primary buttons, highlights)
    // and key semantic roles. Index is 0-based.
    roles: {
      brand: 5,   // #DB6C32 (warm orange) works better as primary
      accent: 0,  // #BBEEC7 (mint) as secondary highlight
      success: 1,
      warning: 3,
      danger: 6,
      neutral: 4,
    },
    palette: [
      '#BBEEC7', // 月亮甚至不知道自己是月亮
      '#D4E9D9', // 走向星星,走向月亮
      '#FCE5BA', // 只有月光,月光没有篱笆
      '#FFD07B', // 月光转动她梦的齿轮
      '#F7A462', // 你的窗子里看得见月亮么
      '#DB6C32', // 每个人都是月亮
      '#A14D21', // 山中若有眠,枕的是月
    ]
  },
  rose: {
    name: '玫瑰庄园',
    isDark: true, // 这一套颜色比较深沉，适合深色模式或作为浓郁主题
    roles: {
      // Make primary UI a bit more pleasant/clean than deep red.
      brand: 5,   // #6A9064 (sage green)
      accent: 0,  // #B04F4F (rose)
      success: 5,
      warning: 2,
      danger: 0,
      neutral: 4,
    },
    palette: [
      '#B04F4F', // 玫瑰到了花期,我很想你
      '#E79999', // 让它永远捧着一束玫瑰
      '#DFB59C', // 玫瑰误了花期,月光隐在云里
      '#DADAA0', // 玫瑰易名,芳香如故
      '#94AAA0', // 祝我们都是横冲直撞的玫瑰
      '#6A9064', // 正如最初的玫瑰,使我一病多年
      '#41653B', // 只有玫瑰才能盛开如玫瑰
    ]
  },
  dream: {
    name: '梦里看花',
    isDark: false,
    palette: [
      '#A5C9F9', // 被白昼关闭的,由梦来送给我们
      '#D2E5FF', // 爱与梦是括号的两端
      '#EEEEEE', // 很多的梦,趁黄昏起哄
      '#E7D5CD', // 梦中是你,与枕俱醒
      '#CAB0B5', // 醒,是梦中往外跳伞
      '#C0C8E9', // 你枕着我的臂弯,酣睡不醒
      '#B6B4F8', // 夜正深沉,我因梦见你而醒
    ]
  }
};
