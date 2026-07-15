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

export async function loadAllLocalPlaces() {
  if (cachedPlaces) {
    return cachedPlaces
  }

  const results = await Promise.all(
    DATA_FILES.map(async ({ category, file }) => {
      const response = await fetch(file)

      if (!response.ok) {
        throw new Error(`${category} 데이터를 불러오지 못했습니다.`)
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

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
}

function getQuestionKeywords(question) {
  const excludedWords = new Set([
    '광주',
    '전라',
    '전라권',
    '추천',
    '추천해줘',
    '알려줘',
    '어디',
    '어디야',
    '정보',
    '있는',
    '있어',
    '장소',
    '가볼만한',
  ])

  return question
    .split(/[\s,?.!]+/)
    .map((word) => normalizeText(word))
    .filter((word) => word.length >= 2)
    .filter((word) => !excludedWords.has(word))
}

export async function findRelevantPlaces(question, limit = 20) {
  const allPlaces = await loadAllLocalPlaces()
  const normalizedQuestion = normalizeText(question)
  const keywords = getQuestionKeywords(question)

  const categoryKeywords = {
    관광지: ['관광', '관광지', '명소', '여행지', '가볼만한'],
    레포츠: ['레포츠', '운동', '체육', '수영', '야영', '캠핑'],
    문화시설: ['문화', '미술관', '박물관', '전시'],
    쇼핑: ['쇼핑', '시장', '상점', '기념품'],
    숙박: ['숙박', '호텔', '펜션', '한옥'],
    여행코스: ['여행코스', '코스', '일정'],
    음식점: ['음식점', '맛집', '식당', '먹거리'],
    축제공연행사: ['축제', '공연', '행사', '페스티벌'],
  }

  const scoredPlaces = allPlaces.map((place) => {
    const searchableText = normalizeText(
      [
        place.category,
        place.title,
        place.addr1,
        place.addr2,
        place.tel,
      ].join(' '),
    )

    let score = 0

    if (
      place.title &&
      normalizedQuestion.includes(normalizeText(place.title))
    ) {
      score += 20
    }

    for (const keyword of keywords) {
      if (searchableText.includes(keyword)) {
        score += 5
      }
    }

    const matchedCategoryKeywords =
      categoryKeywords[place.category] || []

    if (
      matchedCategoryKeywords.some((keyword) =>
        normalizedQuestion.includes(normalizeText(keyword)),
      )
    ) {
      score += 4
    }

    if (place.firstimage) {
      score += 0.2
    }

    return {
      ...place,
      searchScore: score,
    }
  })

  const matchedPlaces = scoredPlaces
    .filter((place) => place.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, limit)

  if (matchedPlaces.length > 0) {
    return matchedPlaces
  }

  return scoredPlaces
    .sort((a, b) => {
      const aHasImage = a.firstimage ? 1 : 0
      const bHasImage = b.firstimage ? 1 : 0

      return bHasImage - aHasImage
    })
    .slice(0, limit)
}