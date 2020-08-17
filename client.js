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

const getFeedbackByProductViewData = async(product, actualize = true) => {
    try {
      const getUserResults = []
      const copyFeedBacks = []

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

      copyFeedBacks
        .sort( (a, b) => a.date - b.date)
        .forEach( (feedBack) => {
          feedBack.date = getDate(feedBack.date)
          const { email, name } = users.find( user => user.id === feedBack.userId)
          feedBack.user = `${name} (${email})`
        })

      console.log('RESULT: ', copyFeedBacks)
      console.log('RES.DATA: ', res.data)

      return {
        feedback: copyFeedBacks
      }

    } catch ({response}) {
      if(response.status === 404) {
        return response.data
      }
    }
}

module.exports = { getFeedbackByProductViewData };