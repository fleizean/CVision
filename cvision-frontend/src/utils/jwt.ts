export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Invalid JWT token:', error)
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

export function getUserFromToken(token: string): any {
  try {
    const decoded = decodeJWT(token)
    if (!decoded) return null
    
    return {
      id: decoded.UserId || decoded.sub,
      email: decoded.email || decoded[Object.keys(decoded).find(key => key.includes('emailaddress')) || ''] || '',
      name: decoded.given_name || decoded.name || '',
      surname: decoded.family_name || decoded.surname || '',
      roles: decoded.role ? (Array.isArray(decoded.role) ? decoded.role : [decoded.role]) : []
    }
  } catch (error) {
    console.error('Error extracting user from token:', error)
    return null
  }
}