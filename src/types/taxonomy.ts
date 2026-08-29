export enum DomainLabel {
  Programming = '编程开发',
  Emotion = '情绪/个人状态',
  Fitness = '健身/运动/健康',
  Life = '生活/消费',
  Hobby = '兴趣爱好',
  English = '英语学习',
  Other = '其他',
}

export enum IntentLabel {
  Ask = '求助/提问',
  Reflect = '自我反思/倾诉',
  Record = '信息记录/备忘',
  Decide = '方案决策',
  Share = '分享/庆祝',
  Other = '其他',
}

export enum EmotionLabel {
  Positive = '积极/高能量',
  Negative = '消极/低能量',
  Neutral = '中性/分析',
  Unknown = '未知',
}

export enum ThinkingModeLabel {
  Explore = '探索/发散',
  Execute = '聚焦/执行',
  Analyze = '分析/拆解',
  Unknown = '未知',
}

export enum ProblemNatureLabel {
  Technical = '技术/实操型',
  Conceptual = '概念/认知型',
  Psychological = '心理/关系型',
  Unknown = '未知',
}

export enum InfoProcessingLabel {
  Input = '吸收/输入',
  Output = '整合/输出',
  Decision = '交互/决策',
  Unknown = '未知',
}

export const LABEL_SCHEMA_VERSION = '2'
export const LABEL_TAXONOMY_VERSION = '2'
