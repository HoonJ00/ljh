const DATA_FILES = [
  {
    category: '관광지',
    file: '/data/tourist.json',
  },
  {
    category: '레포츠',
    file: '/data/leports.json',
  },
  {
    category: '문화시설',
    file: '/data/culture.json',
  },
  {
    category: '쇼핑',
    file: '/data/shopping.json',
  },
  {
    category: '숙박',
    file: '/data/accommodation.json',
  },
  {
    category: '여행코스',
    file: '/data/course.json',
  },
  {
    category: '음식점',
    file: '/data/restaurant.json',
  },
  {
    category: '축제공연행사',
    file: '/data/festival.json',
  },
]

let cachedPlaces = null

/**
 * 모든 카테고리의 공공데이터를 불러옵니다.
 *
 * ...item을 사용하므로 축제 날짜, 장소, 시간,
 * 이용 요금 등의 원본 필드도 모두 유지됩니다.
 */
export async function loadAllLocalPlaces() {
  if (cachedPlaces) {
    return cachedPlaces
  }

  const results = await Promise.all(
    DATA_FILES.map(async ({ category, file }) => {
      const response = await fetch(file)

      if (!response.ok) {
        throw new Error(
          `${category} 데이터를 불러오지 못했습니다.`,
        )
      }

      const data = await response.json()

      if (!Array.isArray(data.items)) {
        return []
      }

      return data.items.map((item) => ({
        ...item,
        category,
      }))
    }),
  )

  cachedPlaces = results.flat()

  return cachedPlaces
}

/**
 * 검색 비교를 위해 공백과 대소문자를 정리합니다.
 */
function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
}

/**
 * 축제 날짜 형식을 검색 가능한 문자열로 확장합니다.
 *
 * 20260806
 * → 20260806, 2026년8월6일, 2026년8월, 8월
 */
function createDateSearchText(dateString) {
  const value = String(dateString || '')

  if (!/^\d{8}$/.test(value)) {
    return ''
  }

  const year = value.slice(0, 4)
  const month = Number(value.slice(4, 6))
  const day = Number(value.slice(6, 8))

  return [
    value,
    `${year}년${month}월${day}일`,
    `${year}년${month}월`,
    `${month}월${day}일`,
    `${month}월`,
  ].join(' ')
}

/**
 * 질문에서 의미 있는 검색어만 추출합니다.
 */
function getQuestionKeywords(question) {
  const excludedWords = new Set([
    '광주',
    '전라',
    '전라권',
    '추천',
    '추천해줘',
    '알려줘',
    '보여줘',
    '찾아줘',
    '어디',
    '어디야',
    '정보',
    '있는',
    '있어',
    '장소',
    '가볼만한',
    '관련',
    '무엇',
    '뭐가',
  ])

  return question
    .split(/[\s,?.!]+/)
    .map((word) => normalizeText(word))
    .filter((word) => word.length >= 2)
    .filter((word) => !excludedWords.has(word))
}

/**
 * 질문과 관련된 공공데이터를 검색합니다.
 */
export async function findRelevantPlaces(
  question,
  limit = 20,
) {
  const allPlaces = await loadAllLocalPlaces()
  const normalizedQuestion =
    normalizeText(question)
  const keywords =
    getQuestionKeywords(question)

  const categoryKeywords = {
    관광지: [
      '관광',
      '관광지',
      '명소',
      '여행지',
      '가볼만한',
    ],

    레포츠: [
      '레포츠',
      '운동',
      '체육',
      '수영',
      '야영',
      '캠핑',
    ],

    문화시설: [
      '문화',
      '미술관',
      '박물관',
      '전시',
      '공연장',
    ],

    쇼핑: [
      '쇼핑',
      '시장',
      '상점',
      '기념품',
    ],

    숙박: [
      '숙박',
      '호텔',
      '펜션',
      '한옥',
      '모텔',
      '게스트하우스',
    ],

    여행코스: [
      '여행코스',
      '코스',
      '일정',
      '여행일정',
    ],

    음식점: [
      '음식점',
      '맛집',
      '식당',
      '먹거리',
      '음식',
    ],

    축제공연행사: [
      '축제',
      '공연',
      '행사',
      '페스티벌',
      '콘서트',
      '영화제',
      '박람회',
    ],
  }

  const scoredPlaces = allPlaces.map((place) => {
    const eventStartDateText =
      createDateSearchText(
        place.eventstartdate,
      )

    const eventEndDateText =
      createDateSearchText(
        place.eventenddate,
      )

    /*
     * 일반 장소 정보뿐 아니라 축제 일정, 장소,
     * 운영 시간, 요금 등도 검색 대상에 포함합니다.
     */
    const searchableText = normalizeText(
      [
        place.category,
        place.title,
        place.addr1,
        place.addr2,
        place.tel,

        place.eventplace,
        place.playtime,
        place.usetimefestival,
        place.agelimit,
        place.program,
        place.subevent,
        place.sponsor1,
        place.sponsor2,

        eventStartDateText,
        eventEndDateText,
      ].join(' '),
    )

    let score = 0

    /*
     * 질문에 정확한 장소명이 포함되면
     * 가장 높은 점수를 부여합니다.
     */
    if (
      place.title &&
      normalizedQuestion.includes(
        normalizeText(place.title),
      )
    ) {
      score += 20
    }

    /*
     * 질문의 검색어가 장소 데이터에 포함되면
     * 검색어마다 점수를 추가합니다.
     */
    for (const keyword of keywords) {
      if (searchableText.includes(keyword)) {
        score += 5
      }
    }

    /*
     * 관광지, 음식점, 축제 등 카테고리 표현이
     * 질문에 포함된 경우 해당 카테고리에 점수를 줍니다.
     */
    const matchedCategoryKeywords =
      categoryKeywords[place.category] || []

    if (
      matchedCategoryKeywords.some(
        (keyword) =>
          normalizedQuestion.includes(
            normalizeText(keyword),
          ),
      )
    ) {
      score += 4
    }

    /*
     * 무료 행사 질문에 대한 검색 정확도 향상
     */
    if (
      normalizedQuestion.includes('무료') &&
      normalizeText(
        place.usetimefestival,
      ).includes('무료')
    ) {
      score += 8
    }

    /*
     * 유료 행사 질문에 대한 검색 정확도 향상
     */
    if (
      normalizedQuestion.includes('유료') &&
      normalizeText(
        place.usetimefestival,
      ).includes('유료')
    ) {
      score += 8
    }

    /*
     * 이미지가 존재하는 장소는 동점일 때
     * 약간 우선되도록 작은 점수를 줍니다.
     */
    if (place.firstimage) {
      score += 0.2
    }

    return {
      ...place,
      searchScore: score,
    }
  })

  const matchedPlaces = scoredPlaces
    .filter((place) => {
      return place.searchScore > 0
    })
    .sort((a, b) => {
      return b.searchScore - a.searchScore
    })
    .slice(0, limit)

  if (matchedPlaces.length > 0) {
    return matchedPlaces
  }

  /*
   * 아무 검색 결과도 없을 때 무관한 장소를 임의로
   * 전달하지 않고 빈 배열을 반환합니다.
   *
   * 그러면 OpenAI가 제공된 데이터에 없는 내용을
   * 임의로 만들어 답하는 위험을 줄일 수 있습니다.
   */
  return []
}