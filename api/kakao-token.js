// GitHub 저장소에 /api/kakao-token.js 로 저장하세요

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'no code' });

  const REST_KEY = process.env.KAKAO_REST_KEY;
  const REDIRECT_URI = 'https://mammazone.vercel.app';

  try {
    // 1. 토큰 교환
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=authorization_code&client_id=${REST_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${code}`
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).json({ error: 'token failed' });

    // 2. 사용자 정보 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    res.status(200).json({
      id: userData.id,
      name: userData.kakao_account?.profile?.nickname || userData.properties?.nickname || '사용자',
      avatar: userData.kakao_account?.profile?.thumbnail_image_url || userData.properties?.thumbnail_image || ''
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
