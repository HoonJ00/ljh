const STORAGE_KEY = 'localhub-posts'

export function getPosts() {
  const savedPosts = localStorage.getItem(STORAGE_KEY)

  if (!savedPosts) {
    return []
  }

  try {
    return JSON.parse(savedPosts)
  } catch (error) {
    console.error('게시글 데이터를 불러오지 못했습니다.', error)
    return []
  }
}

export function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export function getPostById(id) {
  const posts = getPosts()

  return posts.find((post) => String(post.id) === String(id))
}

export function createPost(postData) {
  const posts = getPosts()

  const newPost = {
    id: Date.now(),
    title: postData.title,
    content: postData.content,
    password: postData.password,
    createdAt: new Date().toLocaleString('ko-KR'),
    updatedAt: null,
  }

  posts.unshift(newPost)
  savePosts(posts)

  return newPost
}

export function updatePost(id, postData) {
  const posts = getPosts()

  const postIndex = posts.findIndex(
    (post) => String(post.id) === String(id),
  )

  if (postIndex === -1) {
    return null
  }

  posts[postIndex] = {
    ...posts[postIndex],
    title: postData.title,
    content: postData.content,
    password: postData.password,
    updatedAt: new Date().toLocaleString('ko-KR'),
  }

  savePosts(posts)

  return posts[postIndex]
}

export function deletePost(id) {
  const posts = getPosts()

  const filteredPosts = posts.filter(
    (post) => String(post.id) !== String(id),
  )

  savePosts(filteredPosts)
}