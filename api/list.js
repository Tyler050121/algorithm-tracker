export default async function handler(req, res) {
  // CORS 配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug = 'top-interview-150' } = req.query;

  // 修复点 1：将 questionId 改为 questionFrontendId
  const query = `
    query studyPlanV2Detail($slug: String!) {
      studyPlanV2Detail(planSlug: $slug) {
        planSubGroups {
          name
          slug
          questions {
            questionFrontendId
            title
            translatedTitle
            titleSlug
            difficulty
          }
        }
      }
    }
  `;

  try {
    // 继续使用 leetcode.com (美区)，因为它对 Vercel 服务器更友好
    const response = await fetch('https://leetcode.cn/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': `https://leetcode.cn/studyplan/${slug}/`,
        'Origin': 'https://leetcode.cn'
      },
      body: JSON.stringify({
        query: query,
        variables: { slug: slug }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'LeetCode API Error', details: errorText });
    }

    const data = await response.json();

    if (data.errors) {
      return res.status(400).json({ error: 'GraphQL Error', details: data.errors });
    }

    const subGroups = data.data?.studyPlanV2Detail?.planSubGroups || [];
    
    const formattedGroups = subGroups.map(group => ({
      groupName: {
        en: group.slug, // LeetCode API中，分组的英文名通常是slug
        zh: group.name
      },
      questions: group.questions.map(q => ({
        id: q.questionFrontendId,
        title: {
          en: q.title,
          zh: q.translatedTitle || q.title,
        },
        slug: q.titleSlug,
        difficulty: q.difficulty
      }))
    }));

    return res.status(200).json({
      plan: slug,
      totalGroups: formattedGroups.length,
      groups: formattedGroups
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
