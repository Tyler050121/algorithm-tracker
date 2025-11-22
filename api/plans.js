export default function handler(req, res) {
  // CORS 配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // API 现在只提供非文本数据。
  // 所有名称和描述都已移至 /public/locales 中，由 i18n 管理。
  // 前端应使用 slug 作为 key (例如 `study_plans.top-interview-150.name`) 来获取翻译。
  const plans = [
    {
      slug: "top-interview-150",
      color: "#FFA116"
    },
    {
      slug: "top-100-liked",
      color: "#F6465D"
    },
    {
      slug: "leetcode-75",
      color: "#2DB55D"
    },
    {
      slug: "30-days-of-javascript",
      color: "#F7DF1E"
    }
  ];

  return res.status(200).json(plans);
}