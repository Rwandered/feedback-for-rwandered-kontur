const { axios } = require("./fakeBackend/mock");


const getUserById = async (userId) => {
  const res =  await axios({
    url: '/users',
    params: {ids: userId}
  })

  const { users } = res.data
  return  users
}

const getDate = ( date ) => {
  const newDate = {
    year:  new Date(date).getFullYear(),
    month: new Date(date).getMonth(),
    day: new Date(date).getDate(),
  }

  return `${newDate.year}-${newDate.month + 1}-${newDate.day}`
}

const checkEmptyFeedBack = ( {feedback} ) => feedback.length === 0 &&  true

const getFormatUsers = (users) => {
  return users
    .flat()
    .reduce( (acc, user) => {
      const userInAcc = acc.find(elem => elem.id === user.id)

      if(userInAcc) {
        return acc
      } else {
        return [...acc, user]
      }
    }, [])
}

const getFormatFeedBacks = (feedBacks, users) => {
  const copyFeedBacks = [...feedBacks]
  copyFeedBacks
    .sort( (a, b) => a.date - b.date)
    .forEach( (feedBack) => {
      feedBack.date = getDate(feedBack.date)
      const { email, name } = users.find( user => user.id === feedBack.userId)
      feedBack.user = `${name} (${email})`
    })

  return copyFeedBacks
}

const getActualizeFeedBacks = (feedBacks, users) => {
  return users.map( user => feedBacks
    .filter( (feedBack) => feedBack.userId === user.id)
    .reduce( (acc, feedBack) => acc.date > feedBack.date ? acc : feedBack)
  )
}

const getFeedbackByProductViewData = async(product, actualize = false) => {
    try {
      const getUserResults = []
      const copyFeedBacks = []
      const result = {}

      const res =  await axios({
        url: '/feedback',
        params: {
          product
        },
      })

      if(checkEmptyFeedBack(res.data)) {
        return {
          message: 'Отзывов пока нет'
        }
      }

      for( let elem of  res.data.feedback) {
        const copyElem = {...elem}
        copyFeedBacks.push(copyElem)
        getUserResults.push(getUserById(copyElem.userId))
      }

      const usersR = await Promise.all(getUserResults) // array users
      const users = getFormatUsers(usersR)

      if(actualize) {
        const actualizeFeedBacks  = getActualizeFeedBacks(copyFeedBacks, users)
        result.feedback = getFormatFeedBacks(actualizeFeedBacks, users)
      } else {
        result.feedback = getFormatFeedBacks(copyFeedBacks, users)
      }

      return result

    } catch ({response}) {
      if(response.status === 404) {
        return response.data
      }
    }
}

module.exports = { getFeedbackByProductViewData };