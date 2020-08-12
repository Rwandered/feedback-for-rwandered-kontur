const { axios } = require("./fakeBackend/mock");


const getFeedbackByProductViewData = async(product, actualize = true) => {
    try {
        const res =  await axios({
          url: '/feedback',
          params: {
            product
          },
        })

      for( let elem of  res.data.feedback) {
        const users = await getUserById(elem.userId)
        const { email, name } = users[0]
        elem.user = `${name} (${email})`
      }

      if(checkEmptyFeedBack(res.data)) {
        return {
          message: 'Отзывов пока нет'
        }
      }


      res.data.feedback
        .sort( (a, b) => a.date - b.date)
        .forEach( (elem) => {
          elem.date = getDate(elem.date)
        })

      console.log('RESULT: ', res.data)
      console.log('RESULT: ', res.data.length)

      return res.data

    } catch ({response}) {
      if(response.status === 404) {
        return response.data
      }
    }
}

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

module.exports = { getFeedbackByProductViewData };