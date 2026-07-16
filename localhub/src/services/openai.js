const OPENAI_API_URL = 'https://api.openai.com/v1/responses'

/**
 * OpenAI Responses API 결과에서
 * 실제 텍스트 답변을 추출합니다.
 */
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

/**
 * 축제 JSON의 날짜 형식을 사람이 읽기 쉬운 형태로 변환합니다.
 *
 * 20260806
 * → 2026년 8월 6일
 */
function formatEventDate(dateString) {
  if (
    !dateString ||
    !/^\d{8}$/.test(String(dateString))
  ) {
    return ''
  }

  const value = String(dateString)

  const year = value.slice(0, 4)
  const month = Number(value.slice(4, 6))
  const day = Number(value.slice(6, 8))

  return `${year}년 ${month}월 ${day}일`
}

/**
 * JSON 데이터 안에 포함된 간단한 HTML 태그를
 * 일반 텍스트로 변환합니다.
 *
 * 예:
 * 16:00~22:00<br>13:00~22:00
 * → 16:00~22:00 / 13:00~22:00
 */
function cleanText(value) {
  if (!value) {
    return ''
  }

  return String(value)
    .replace(/<br\s*\/?>/gi, ' / ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 현재 날짜를 한국어 형식으로 반환합니다.
 * 챗봇이 과거 행사와 예정 행사를 구분할 때 사용합니다.
 */
function getCurrentDateText() {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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

  /**
   * OpenAI에 전달할 공공데이터입니다.
   *
   * 일반 장소 정보와 축제·공연·행사 정보를
   * 모두 포함합니다.
   */
  const placeContext = relevantPlaces.map((place) => ({
    category: place.category || '',
    title: place.title || '',

    address: `${place.addr1 || ''} ${place.addr2 || ''}`.trim(),
    telephone: place.tel || '',

    latitude: place.mapy || '',
    longitude: place.mapx || '',

    // 축제·공연·행사 일정
    eventStartDate: formatEventDate(
      place.eventstartdate,
    ),

    eventEndDate: formatEventDate(
      place.eventenddate,
    ),

    eventPlace: place.eventplace || '',
    playTime: cleanText(place.playtime),

    // 이용 정보
    usageFee: cleanText(
      place.usetimefestival,
    ),

    ageLimit: cleanText(place.agelimit),

    // 프로그램 및 주최 정보
    program: cleanText(place.program),
    subEvent: cleanText(place.subevent),

    organizer: place.sponsor1 || '',

    organizerTelephone:
      place.sponsor1tel ||
      place.tel ||
      '',

    supportingOrganization:
      place.sponsor2 || '',

    supportingOrganizationTelephone:
      place.sponsor2tel || '',

    homepage: place.eventhomepage || '',
    bookingPlace: place.bookingplace || '',
  }))

  /**
   * 최근 대화 6개만 전달하여
   * 이전 질문과 답변의 흐름을 유지합니다.
   */
  const recentHistory = chatHistory
    .slice(-6)
    .filter((message) => {
      return (
        message.role === 'user' ||
        message.role === 'assistant'
      )
    })
    .map((message) => ({
      role: message.role,
      content: String(
        message.content || '',
      ),
    }))

  const currentDate = getCurrentDateText()

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

1. 제공된 광주·전라권 공공데이터를 우선적으로 사용하세요.

2. 제공된 데이터에 없는 장소명, 주소, 전화번호, 행사 일정, 운영 시간, 요금 등의 정보는 임의로 만들지 마세요.

3. 질문에 필요한 정보가 제공된 데이터에 없다면 "제공된 데이터에서는 확인되지 않습니다"라고 안내하세요.

4. 답변은 한국어로 이해하기 쉽고 간결하게 작성하세요.

5. 장소를 추천할 때는 장소명과 주소를 함께 안내하세요.

6. 관광지, 레포츠, 문화시설, 쇼핑, 숙박, 여행코스, 음식점, 축제공연행사 정보를 안내하세요.

7. 축제·공연·행사 질문에는 제공된 데이터 범위에서 다음 정보를 안내하세요.
- 행사명
- 시작일
- 종료일
- 행사 장소
- 운영 시간
- 이용 요금
- 문의 전화번호

8. 행사 시작일과 종료일이 같으면 하루 동안 진행되는 행사라고 설명하세요.

9. 현재 날짜와 행사 종료일을 비교하여 이미 종료된 행사는 과거 행사라고 명확하게 안내하세요.

10. 현재 날짜 이후에 시작되는 행사는 예정된 행사라고 안내하세요.

11. 시작일과 종료일 사이에 현재 날짜가 포함되면 현재 진행 중인 행사라고 안내하세요.

12. 행사 일정이 비어 있으면 날짜를 추측하지 말고 "제공된 데이터에서 행사 일정을 확인할 수 없습니다"라고 답하세요.

13. 운영 시간에 HTML 태그나 특수한 표시가 있더라도 사용자가 읽기 쉬운 문장으로 정리하세요.

14. 무료 행사인지 유료 행사인지 이용 요금 데이터를 기준으로 안내하세요.

15. 여러 장소를 추천할 때는 최대 5개 정도로 정리하고, 번호를 붙여 구분하세요.
      `.trim(),

      input: [
        ...recentHistory,

        {
          role: 'user',

          content: `
[현재 날짜]
${currentDate}

[광주·전라권 관련 공공데이터]
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
      data?.error?.message ||
      'OpenAI API 호출에 실패했습니다.'

    throw new Error(apiMessage)
  }

  const answer = extractResponseText(data)

  if (!answer) {
    throw new Error(
      '챗봇 답변을 읽지 못했습니다.',
    )
  }

  return answer
}