const OPENAI_API_URL = 'https://api.openai.com/v1/responses'

function extractResponseText(data) {
  if (!Array.isArray(data.output)) {
    return ''
  }

  return data.output
    .flatMap((outputItem) => outputItem.content || [])
    .filter((contentItem) => contentItem.type === 'output_text')
    .map((contentItem) => contentItem.text)
    .join('\n')
    .trim()
}

export async function askLocalHubChatbot(
  question,
  relevantPlaces = [],
  chatHistory = [],
) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      '.env 파일에 VITE_OPENAI_API_KEY가 설정되지 않았습니다.',
    )
  }

  const placeContext = relevantPlaces.map((place) => ({
    category: place.category,
    title: place.title,
    address: `${place.addr1 || ''} ${place.addr2 || ''}`.trim(),
    telephone: place.tel || '',
    latitude: place.mapy || '',
    longitude: place.mapx || '',
  }))

  const recentHistory = chatHistory.slice(-6).map((message) => ({
    role: message.role,
    content: message.content,
  }))

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },

    body: JSON.stringify({
      model: 'gpt-5-mini',

      instructions: `
당신은 광주·전라권 공공데이터 기반 지역 정보 서비스 LocalHub의 안내 챗봇입니다.

다음 규칙을 반드시 지키세요.

1. 제공된 지역 데이터를 우선적으로 사용하세요.
2. 제공된 데이터에 없는 주소, 전화번호, 일정은 임의로 만들지 마세요.
3. 데이터에 없는 내용은 "제공된 데이터에서는 확인되지 않습니다"라고 답하세요.
4. 답변은 한국어로 쉽고 간결하게 작성하세요.
5. 장소 추천 시 장소명과 주소를 함께 안내하세요.
6. 관광지, 레포츠, 문화시설, 쇼핑, 숙박, 여행코스, 음식점, 축제공연행사를 안내하세요.
      `.trim(),

      input: [
        ...recentHistory,
        {
          role: 'user',
          content: `
[광주·전라권 관련 데이터]
${JSON.stringify(placeContext, null, 2)}

[사용자 질문]
${question}
          `.trim(),
        },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const apiMessage =
      data?.error?.message || 'OpenAI API 호출에 실패했습니다.'

    throw new Error(apiMessage)
  }

  const answer = extractResponseText(data)

  if (!answer) {
    throw new Error('챗봇 답변을 읽지 못했습니다.')
  }

  return answer
}