export const categories = [
  {
    key: 'tourist',
    name: '관광지',
    file: '/data/tourist.json',
  },
  {
    key: 'leports',
    name: '레포츠',
    file: '/data/leports.json',
  },
  {
    key: 'culture',
    name: '문화시설',
    file: '/data/culture.json',
  },
  {
    key: 'shopping',
    name: '쇼핑',
    file: '/data/shopping.json',
  },
  {
    key: 'accommodation',
    name: '숙박',
    file: '/data/accommodation.json',
  },
  {
    key: 'course',
    name: '여행코스',
    file: '/data/course.json',
  },
  {
    key: 'restaurant',
    name: '음식점',
    file: '/data/restaurant.json',
  },
  {
    key: 'festival',
    name: '축제공연행사',
    file: '/data/festival.json',
  },
]

export function findCategory(categoryKey) {
  return categories.find((category) => category.key === categoryKey)
}