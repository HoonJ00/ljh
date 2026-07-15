const STORAGE_KEY = 'localhub-favorites'

export function getFavorites() {
  const savedFavorites = localStorage.getItem(STORAGE_KEY)

  if (!savedFavorites) {
    return []
  }

  try {
    const parsedFavorites = JSON.parse(savedFavorites)

    return Array.isArray(parsedFavorites)
      ? parsedFavorites
      : []
  } catch (error) {
    console.error('찜 목록을 불러오지 못했습니다.', error)
    return []
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(favorites),
  )
}

export function isFavorite(categoryKey, contentId) {
  const favorites = getFavorites()

  return favorites.some(
    (favorite) =>
      favorite.categoryKey === categoryKey &&
      String(favorite.contentid) === String(contentId),
  )
}

/**
 * 새로운 관심 장소를 추가합니다.
 *
 * 성공 예시:
 * 찜해부렀어에 '불튼호텔' 장소가 추가되었습니다.
 *
 * 중복 예시:
 * '불튼호텔' 장소는 이미 찜해부렀어에 추가되어 있습니다.
 */
export function addFavorite({
  categoryKey,
  categoryName,
  place,
}) {
  const favorites = getFavorites()

  const alreadyExists = favorites.some(
    (favorite) =>
      favorite.categoryKey === categoryKey &&
      String(favorite.contentid) ===
        String(place.contentid),
  )

  if (alreadyExists) {
    return {
      success: false,
      message: `'${place.title}' 장소는 이미 찜해부렀어에 추가되어 있습니다.`,
    }
  }

  const newFavorite = {
    categoryKey,
    categoryName,

    contentid: place.contentid,
    title: place.title,
    addr1: place.addr1 || '',
    addr2: place.addr2 || '',
    firstimage: place.firstimage || '',
    tel: place.tel || '',
    mapx: place.mapx || '',
    mapy: place.mapy || '',

    // 사용자가 누른 순서를 확인하기 위한 값
    addedAt: Date.now(),
  }

  /*
   * push를 사용하므로 사용자가 누른 순서대로
   * 배열의 뒤에 추가됩니다.
   */
  favorites.push(newFavorite)

  saveFavorites(favorites)

  return {
    success: true,
    message: `찜해부렀어에 추가되었습니다.`,
    favorite: newFavorite,
  }
}

export function removeFavorite(categoryKey, contentId) {
  const favorites = getFavorites()

  const filteredFavorites = favorites.filter(
    (favorite) =>
      !(
        favorite.categoryKey === categoryKey &&
        String(favorite.contentid) ===
          String(contentId)
      ),
  )

  saveFavorites(filteredFavorites)
}

export function clearFavorites() {
  localStorage.removeItem(STORAGE_KEY)
}