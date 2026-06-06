export const PLATFORMS = [
  { value: 'douyin', label: '抖音' },
  { value: 'xiaohongshu', label: '小红书' },
] as const;

export const CONTENT_GOALS = [
  { value: 'exposure', label: '拉新曝光' },
  { value: 'seeding', label: '种草收藏' },
  { value: 'conversion', label: '转化成交' },
  { value: 'education', label: '新品教育' },
  { value: 'competitor', label: '竞品反击' },
  { value: 'private_domain', label: '私域引流' },
  { value: 'interaction', label: '评论互动' },
  { value: 'brand_mind', label: '品牌心智' },
] as const;

export const OUTPUT_OPTIONS = [
  { value: 'content_diagnosis', label: '内容诊断' },
  { value: 'comment_cleaning', label: '评论清洗' },
  { value: 'high_value_comments', label: '高价值评论库' },
  { value: 'demand_map', label: '用户需求地图' },
  { value: 'barrier_map', label: '购买障碍地图' },
  { value: 'attribution', label: '内容-评论归因' },
  { value: 'strategy_cards', label: '策略卡' },
  { value: 'douyin_production', label: '抖音内容生产卡' },
  { value: 'xiaohongshu_production', label: '小红书内容生产卡' },
  { value: 'comment_ops', label: '评论区运营方案' },
  { value: 'ad_fit', label: '投流适配判断' },
  { value: 'pre_publish_check', label: '发布前质检模板' },
  { value: 'full_report', label: '完整报告' },
] as const;

export const TASK_STATUS_MAP: Record<string, string> = {
  draft: '草稿',
  uploaded: '已上传',
  mapping_required: '待映射',
  ready: '就绪',
  analyzing: '分析中',
  completed: '已完成',
  partially_failed: '部分失败',
  failed: '失败',
  archived: '已归档',
};
