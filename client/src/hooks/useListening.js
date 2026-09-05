import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/react'

import { API } from '../config/env.js'

/**
 * Hook for the listening feed and post creation.
 */
export function useListeningFeed() {
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/listening`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
        },
      })
      if (!res.ok) throw new Error('Failed to load feed.')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const createPost = async ({ title, body, isAnonymous }) => {
    const token = await getToken()
    const res = await fetch(`${API}/api/community/listening`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, body, isAnonymous }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to create post.')
    await fetchPosts()
    return data
  }

  return { posts, loading, createPost, refresh: fetchPosts }
}

/**
 * Hook for a single post with replies and reactions.
 */
export function useListeningPost(postId) {
  const { getToken } = useAuth()
  const [post, setPost] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPost = useCallback(async () => {
    if (!postId) return
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/listening/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
        },
      })
      if (!res.ok) throw new Error('Failed to load post.')
      const data = await res.json()
      setPost(data.post)
      setReplies(data.replies || [])
    } catch {
      setPost(null)
      setReplies([])
    } finally {
      setLoading(false)
    }
  }, [getToken, postId])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  const addReply = async ({ body, isAnonymous }) => {
    const token = await getToken()
    const res = await fetch(`${API}/api/community/listening/${postId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body, isAnonymous }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to add reply.')
    await fetchPost()
    return data
  }

  const toggleReaction = async (targetType, targetId, reaction) => {
    const token = await getToken()
    const res = await fetch(`${API}/api/community/listening/react`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetType, targetId, reaction }),
    })
    if (!res.ok) return
    await fetchPost()
  }

  const report = async (targetType, targetId, reason) => {
    const token = await getToken()
    const res = await fetch(`${API}/api/community/listening/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetType, targetId, reason }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Report failed.')
    return data
  }

  return { post, replies, loading, addReply, toggleReaction, report, refresh: fetchPost }
}
