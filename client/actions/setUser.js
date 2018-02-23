

export const setUser = user => {
  return {
    type: 'SETCURRENTUSER',
    user: user
  }
}

export const logoutUser = () => {
  return {
    type: 'LOGOUTUSER'
  }
}