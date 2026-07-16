const gwangjuDistricts = [
  '광산구',
  '남구',
  '동구',
  '북구',
  '서구',
]

export function extractAreaName(address) {
  if (!address || typeof address !== 'string') {
    return null
  }

  const addressParts = address.trim().split(/\s+/)

  if (addressParts.length < 2) {
    return null
  }

  const cityOrDistrict = addressParts[1]

  /*
   * 광주 5개 구는 지도에서
   * 광주광역시 하나로 통합합니다.
   */
  if (gwangjuDistricts.includes(cityOrDistrict)) {
    return '광주광역시'
  }

  /*
   * 전남광주통합특별시 여수시 → 여수시
   * 전남광주통합특별시 담양군 → 담양군
   * 전남광주통합특별시 전주시 → 전주시
   */
  return cityOrDistrict
}